const roomPlanner = require('roomPlanner');
const linkMananger = require('linkManager');
const roleWorker = require('role.worker');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleMinim = require('role.minim');

// Find the next available spawn in the room or return null
function nextInactiveSpawn(room) {
  const spawns = room.find(FIND_MY_SPAWNS);
  for (const spawn of spawns) {
    if (!spawn.spawning) {
      return spawn;
    }
  }
  return null;
}

function wrRooms() {
  //console.log('Checking rooms for spawns');
  for (const roomName in Game.rooms) {
    //console.log(`Checking room ${roomName}`);
    const room = Game.rooms[roomName];
    //if (Game.time % 10 === 0) roomPlanner.drawChecker(room);
    if (room.controller && room.controller.my) {
      // Check for spawns
      const spawns = room.find(FIND_MY_SPAWNS);
      if (spawns.length === 0) {
        //console.log(`No spawns found in room ${roomName}`);
      } else {
        const spawn = nextInactiveSpawn(room);
        if (spawn) {
          // A spawn is available, check if anything needs to be spawned and spawn it.
          runSpawn(spawn, room);
        }

        // Run link manager
        linkMananger.run(room);

        // Now that we've got our creeps, it's time to give them something to do. Run the room planner.
        // At room level 1 there is nothing to build. Start room planner at level 2.
        if (room.controller.level > 1 && Game.time % 2 === 0) {
          //console.log(`Running room planner for room ${room.name}`);
          roomPlanner.run(room);
        }
      }
    }
  }

  const roleMap = {
    harvester: roleHarvester,
    hauler: roleHauler,
    worker: roleWorker,
    nurse: roleNurse,
    repairer: roleRepairer,
    picker: rolePicker,
    minim: roleMinim
  };

  // Run creeps
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (roleMap[creep.memory.role]) {
      roleMap[creep.memory.role].run(creep);
    }
  }
}

function runSpawn(spawn, room) {
  const numHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester').length;
  const sources = room.find(FIND_SOURCES);

  const numSources = sources.length;

  if (numHarvesters < numSources) {
    // For each resource in the room, check if a harvester is assigned. If not, spawn one.
    for (const source of sources) {
      const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      
      if (harvesters.length < 1) {
        const body = [MOVE, CARRY]; // Only 1 MOVE part to reach the source
    
        // Get source object and its energy capacity
        const sourceObject = Game.getObjectById(source.id);
        const energyCapacity = sourceObject.energyCapacity; // 3000, 4000, or 1500
    
        // Calculate one-way path distance
        const path = spawn.pos.findPathTo(sourceObject.pos, { ignoreCreeps: true });
        const distance = path.length;
    
        // Calculate optimal WORK parts based on energy capacity and one-way trip
        const workParts = Math.min(Math.floor(energyCapacity / (HARVEST_POWER * (300 - distance))), 5); 
    
        // Add calculated WORK parts, ensuring it doesn't exceed available energy
        while (
          body.length < workParts + 1 && // +1 for the MOVE part
          body.reduce((sum, part) => sum + BODYPART_COST[part], 0) + BODYPART_COST[WORK] <= spawn.room.energyAvailable
        ) {
          body.push(WORK);
        }
    
        // Spawn the harvester
        const name = `harvester_${Game.time}`;
        const memory = { role: 'harvester', sourceId: source.id };
        //console.log(`Spawning new drop harvester: ${name} with body ${JSON.stringify(body)}`);
        spawn.spawnCreep(body, name, { memory });
      }
    }

  } else {

    numHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler').length;
    if (numHaulers < numSources) {
      // Similarly, if there are no haulers, spawn one, for each source.
      for (const source of sources) {
        const haulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id);
        if (haulers.length < 1) {
          wrSpawnCreep(spawn, 'hauler', [CARRY, MOVE], [], { sourceId: source.id },16*50);
        }
      }
    } else {

      // If there are less than two workers, spawn one.
      const workers = _.filter(Game.creeps, (creep) => creep.memory.role === 'worker');

      if (workers.length < 2) {
        wrSpawnCreep(spawn, 'worker', [WORK, CARRY, MOVE],[],{},0);
      } else {
        // If there is an extension and there are no nurses, spawn a nurse to fill it
        const extensions = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });
        const nurses = _.filter(Game.creeps, (creep) => creep.memory.role === 'nurse');
        if (extensions.length > 0 && nurses.length < 1) {
          wrSpawnCreep(spawn, 'nurse', [CARRY, MOVE],[],{},18*50);
        }

        // Once we have nurses we can support more workers
        if (workers.length < 3 && nurses.length > 0) {
          //wrSpawnCreep(spawn, 'worker', [WORK, CARRY, MOVE], []);
        }

        // If there are no repairers and any building is less than full health spawn a repairer
        const repairers = _.filter(Game.creeps, (creep) => creep.memory.role === 'repairer');
        const damagedBuildings = room.find(FIND_STRUCTURES, { filter: (structure) => structure.hits < structure.hitsMax });
        if (repairers.length < 1 && damagedBuildings.length > 0) {
          wrSpawnCreep(spawn, 'repairer', [WORK, CARRY, MOVE]);
        }

        //     minCreeps('picker', 2, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);
      
        // If there are no pickers and there are resources or tombstones on the ground, spawn a picker
        const pickers = _.filter(Game.creeps, (creep) => creep.memory.role === 'picker');
        const droppedResources = room.find(FIND_DROPPED_RESOURCES);
        const tombstones = room.find(FIND_TOMBSTONES);
        if (pickers.length < 1) {
          wrSpawnCreep(spawn, 'picker', [CARRY, MOVE],[],{},16*50);
        }

        // If there is a link, spawn one minim to manage it
        const links = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
        const minims = _.filter(Game.creeps, (creep) => creep.memory.role === 'minim');
        if (links.length > 0 && minims.length < 1) {
          wrSpawnCreep(spawn, 'minim', [CARRY, MOVE],[],{},100);
        }
      }
    }

  }
}

function bodyFactory(pattern, suffix, maxEnergy) {
  let body = [];
  let energy = 0;

  // Ensure pattern + suffix do not exceed maxEnergy
  while (energy + pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0) + suffix.reduce((sum, part) => sum + BODYPART_COST[part], 0) <= maxEnergy) {
    body.push(...pattern);
    energy += pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  }

  // ✅ Now, append the suffix since we've already reserved space for it in calculations
  body.push(...suffix);

  return body;
}

/**
 * Spawns a creep with an optimized body based on available energy.
 * @param {StructureSpawn} spawn - The spawn structure.
 * @param {string} role - The role of the creep.
 * @param {Array} pattern - The repeating body pattern.
 * @param {Array} [suffix=[]] - Additional body parts to add at the end (e.g., MOVE).
 * @param {Object} [extraMemory={}] - Additional memory properties (e.g., sourceId).
 * @param {number} [energyLimit=0] - The maximum energy to use for the creep.
 */
function wrSpawnCreep(spawn, role, pattern = [], suffix = [], extraMemory = {}, energyLimit = 0) {
  // Ensure pattern and suffix are valid arrays
  if (!Array.isArray(pattern)) {
    console.log(`⚠️ [ERROR] wrSpawnCreep: Invalid pattern for ${role}, defaulting to empty array.`);
    pattern = [];
  }
  if (!Array.isArray(suffix)) {
    console.log(`⚠️ [ERROR] wrSpawnCreep: Invalid suffix for ${role}, defaulting to empty array.`);
    suffix = [];
  }

  // If max energy is not specified use the room's energy
  const maxEnergy = (energyLimit > 0 && energyLimit < spawn.room.energyAvailable) ? energyLimit : spawn.room.energyAvailable;

  // Generate body, ensuring space for suffix
  let body = bodyFactory(pattern, suffix, maxEnergy);

  // Prevent adding suffix twice if bodyFactory already includes it
  if (!suffix.every(part => body.includes(part))) {
    body = body.concat(suffix);
  }

  // Ensure we don't spawn an invalid creep (must have at least one non-MOVE part)
  if (body.length === 0 || body.every(part => part === MOVE)) {
    console.log(`⚠️ [ERROR] wrSpawnCreep: Invalid creep body generated for ${role}.`);
    return ERR_INVALID_ARGS;
  }

  // Generate creep name and memory
  const name = `${role}_${Game.time}`;
  const memory = { role, ...extraMemory };

  // Spawn the creep
  console.log(`Spawning new ${role}: ${name} with body ${JSON.stringify(body)}`);
  return spawn.spawnCreep(body, name, { memory });
}

/**
 * Reference data
 
 const statuses = {
  idle: '💤 idle',
  charging: '⚡ charging',
  collect: '🔄 collect',
  building: '🚧 building',
  upgrading: '⬆ upgrading',
  repairing: '🔧 repairing',
  hauling: '🚚 hauling' // or delivering
  nursing: '🍼 nurse'
 };
 
 const bodyParts = [
 {part: 'MOVE', cost: 50}, // provides movement for one non-movement part
 {part: 'WORK', cost: 100}, // does 2 units of work per tick
 {part: 'CARRY', cost: 50}, // carries 50 energy units
 {part: 'ATTACK', cost: 80},
 {part: 'RANGED_ATTACK', cost: 150},
 {part: 'HEAL', cost: 250},
 {part: 'TOUGH', cost: 10},
 {part: 'CLAIM', cost: 600}
 ];
 
 */

/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  for (const name of Object.keys(Memory.creeps)) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

module.exports.loop = function () {
  wrRooms();
  // Run Tower code here
  const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);

  towers.forEach(tower => {
    // Find the closest hostile unit
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      // Attack the closest hostile unit
      tower.attack(closestHostile);
      // Check if energy is over 500 and if so, find the most damaged structure and repair
    } else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 850) {
      // If no hostiles and energy is over 50%, find the most damaged structure and repair except for roads filter by structure.hits <= 200000
      const targets = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
          && structure.hits <= 150000
          && structure.structureType !== STRUCTURE_ROAD
          && structure.structureType !== STRUCTURE_WALL
      });

      if (targets.length > 0) {
        // Sort the ramparts by hits in ascending order to find the most damaged one
        targets.sort((a, b) => a.hits - b.hits);
        // Repair the most damaged target
        tower.repair(targets[0]);
      }
    }
  });

  if (Game.time % 10 === 0) {
    purgeMemory();
  }

  // Log CPU and Memory usage every 5 ticks
  if (Game.time % 5 === 0) {
    console.log(`Tick: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);
  }
};
