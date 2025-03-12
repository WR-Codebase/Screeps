const linkManager = require("./linkManager");
const roomPlanner = require("./roomPlanner");
const distanceTransform = require("./distanceTransform");

const roomManager = {
  run: function () {
    // Create a global copy of Memory.creeps so we're not constantly reading from memory
    try {
      //console.log('Checking rooms for spawns');
      for (const roomName in Game.rooms) {
        //console.log(`Checking room ${roomName}`);
        const room = Game.rooms[roomName];
        roomPlanner.run(room);
        
        //if (Game.time % 10 === 0) roomPlanner.drawChecker(room);
        if (room.controller && room.controller.my) {
          // Check for spawns
          const spawns = room.find(FIND_MY_SPAWNS);
          if (spawns.length === 0) {
            //console.log(`No spawns found in room ${roomName}`);
          } else {
            const spawn = this.nextInactiveSpawn(room);
            if (spawn) {
              // A spawn is available, check if anything needs to be spawned and spawn it.
              this.runSpawn(spawn, room);
            }

            // Run link manager
            linkManager.run(room);

            // Now that we've got our creeps, it's time to give them something to do. Run the room planner.
            // At room level 1 there is nothing to build. Start room planner at level 2.
            if (room.controller.level > 1 && Game.time % 2 === 0) {
              //console.log(`Running room planner for room ${room.name}`);
              //roomPlanner.run(room);
            }
          }
        }
      }
    } catch (e) {
      console.log(`Error in roomManager.run(): ${e}`);
    }
  },
  // Find the next available spawn in the room or return null
  nextInactiveSpawn: function (room) {
    const spawns = room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns) {
      if (!spawn.spawning) {
        return spawn;
      }
    }
    return null;
  },
  // Run the spawn logic for the room
  runSpawn: function (spawn, room) {
    const creepMemory = Memory.creeps;
    const numHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester').length;
    const sources = room.find(FIND_SOURCES);

    const numSources = sources.length;
    //console.log(`[DEBUG] numHarvesters: ${numHarvesters}, numSources: ${numSources}`);
    if (numHarvesters < numSources) {
      // For each resource in the room, check if a harvester is assigned. If not, spawn one.
      for (const source of sources) {

        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id && creep.memory.room === room.name);
        //console.log(`[DEBUG] harvesters: ${harvesters} for source ${source.id}`);
        // returns no harvesters for the first source: harvesters:  for source 5bbcaa299099fc012e630f75
        //console.log(`[DEBUG] harvesters.length: ${harvesters.length}`);
        if (harvesters.length < 1) {
          let index = 0;

          const body = [WORK, MOVE, CARRY]; // Only 1 MOVE part to reach the source

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

          // We are moving to a new naming convention `${role}_${roomName}_${index}` where index is the (0-indexed) number of creeps of that role in the room
          // TODO fix this. For now we'll use game time as the index
          const name = `harvester_${room.name}_${Game.time}`;

          //const name = `harvester_${room.name}_${index}`;
          const memory = { name: name, role: 'harvester', room: room.name, index: index, sourceId: source.id };

          spawn.spawnCreep(body, name, { memory });
        }
      }

    } else {

      // If there is an extension and there are no nurses, spawn a nurse to fill it
      const extensions = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } });
      const nurses = _.filter(Game.creeps, (creep) => creep.memory.role === 'nurse');
      if (extensions.length > 0 && nurses.length < 1) {
        this.wrSpawnCreep(spawn, 'nurse', [CARRY, MOVE], [], {}, 16 * 50);
      } else {

        numHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.room === room.name).length;
        if (numHaulers < numSources && room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).length > 0) {
          // Similarly, if there are no haulers, spawn one, for each source.
          for (const source of sources) {
            const haulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id);
            // If haulers < 1 and there are containers in the room
            if (haulers.length < 1) {
              this.wrSpawnCreep(spawn, 'hauler', [CARRY, MOVE], [], { sourceId: source.id }, 16 * 50);
            }
          }
        } else {

          // If there are less than two workers, spawn one.
          const workers = _.filter(Game.creeps, (creep) => creep.memory.role === 'worker');

          if (workers.length < 2) {
            this.wrSpawnCreep(spawn, 'worker', [WORK, CARRY, MOVE], [], {}, 16 * 50);
          } else {

            // Once we have nurses we can support more workers
            if (workers.length < 3 && nurses.length > 0) {
              this.wrSpawnCreep(spawn, 'worker', [WORK, CARRY, MOVE], [], {}, 16 * 50);
            }

            // If there are no repairers and any building is less than full health spawn a repairer
            const repairers = _.filter(Game.creeps, (creep) => creep.memory.role === 'repairer');
            const damagedBuildings = room.find(FIND_STRUCTURES, { filter: (structure) => structure.hits < structure.hitsMax });
            if (repairers.length < 1 && damagedBuildings.length > 0) {
              this.wrSpawnCreep(spawn, 'repairer', [WORK, CARRY, MOVE], [], {}, 8 * 50);
            }

            //     minCreeps('picker', 2, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);

            // If there are no pickers and there are resources or tombstones on the ground, spawn a picker
            const pickers = _.filter(Game.creeps, (creep) => creep.memory.role === 'picker');
            const droppedResources = room.find(FIND_DROPPED_RESOURCES);
            const tombstones = room.find(FIND_TOMBSTONES);
            if (pickers.length < 1) {
              this.wrSpawnCreep(spawn, 'picker', [CARRY, MOVE], [], {}, 16 * 50);
            }

            // If there is a link, spawn one minim to manage it
            const links = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
            const minims = _.filter(Game.creeps, (creep) => creep.memory.role === 'minim'); 90
            if (links.length > 0 && minims.length < 1) {
              this.wrSpawnCreep(spawn, 'minim', [CARRY, MOVE], [], {}, 100);
            }

            // If there are no remote workers, spawn one
            const remoteWorkers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteWorker');
            if (remoteWorkers.length < 3)
              //this.wrSpawnCreep(spawn, 'remoteWorker', [WORK, CARRY, MOVE], [], {}, 16 * 50);
            
            // Once every 10 ticks, check if adjacent rooms are claimable
            if (Game.time % 10 === 0) {
              // If there isn't already a claimer, make one.
              //const drones = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone');
              //if (drones.length < 1)
                //this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], {}, 1000);

            }
          }
        }
      }
    }
  },
  bodyFactory: function (pattern, suffix, maxEnergy) {
    let body = [];
    let energy = 0;

    // If a single iteration of pattern + suffix exceeds maxEnergy, return a a single iteration.
    if (pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0) + suffix.reduce((sum, part) => sum + BODYPART_COST[part], 0) > maxEnergy) {
      return pattern.concat(suffix);
    }

    // Ensure pattern + suffix do not exceed maxEnergy
    while (energy + pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0) + suffix.reduce((sum, part) => sum + BODYPART_COST[part], 0) <= maxEnergy) {
      body.push(...pattern);
      energy += pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0);
    }

    // ✅ Now, append the suffix since we've already reserved space for it in calculations
    body.push(...suffix);

    return body;
  },

  /**
   * Spawns a creep with an optimized body based on available energy.
   * @param {StructureSpawn} spawn - The spawn structure.
   * @param {string} role - The role of the creep.
   * @param {Array} pattern - The repeating body pattern.
   * @param {Array} [suffix=[]] - Additional body parts to add at the end (e.g., MOVE).
   * @param {Object} [extraMemory={}] - Additional memory properties (e.g., sourceId).
   * @param {number} [energyLimit=0] - The maximum energy to use for the creep.
   */
  wrSpawnCreep: function (spawn, role, pattern = [], suffix = [], extraMemory = {}, energyLimit = 0) {

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
    let body = this.bodyFactory(pattern, suffix, maxEnergy);

    // Prevent adding suffix twice if bodyFactory already includes it
    if (!suffix.every(part => body.includes(part))) {
      body = body.concat(suffix);
    }

    // Ensure we don't spawn an invalid creep (must have at least one non-MOVE part)
    if (body.length === 0 || body.every(part => part === MOVE)) {
      console.log(`[ERROR] wrSpawnCreep: Invalid creep body generated for ${role}.`);
      return ERR_INVALID_ARGS;
    }

    // Memory for each creep should end up with { name, role, room, index } at a minimum
    var memoryObj = { name: '', role: role, room: spawn.room.name, index: 0 };

    // Get a valid index for this room/role combination
    //const livingCreepsInRoomWithRole = _.filter(Game.creeps, (creep) => creep.memory.role === role && creep.memory.room === spawn.room.name);

    // check creepMemory for this room/role combination
    //const creepsInMemory = _.filter(creepMemory, (c) => c.role === role && c.room === spawn.room.name);

    // compare livingCreepsInRoomWithRole to creepsInMemory.
    // If in memory but not alive, assign index to the creep
    // If all creeps in memory are already alive, this is a new creep. Increment the index and assign  to the creep

    //const collation = [];

    //let maxIndex = (livingCreepsInRoomWithRole.length > creepsInMemory.length) ? livingCreepsInRoomWithRole.length : creepsInMemory.length;
    /*
    for (let i = 0; i < maxIndex +1; i++) {
      collation[i] = {
        living: livingCreepsInRoomWithRole.find(c => c.memory.index === i),
        inMemory: creepsInMemory.find(c => c.index === i)
      }

      if (collation[i].living && collation[i].inMemory) continue;
      if (collation[i].inMemory && !collation[i].living) {
        memoryObj.index = i;
        break;
      } else {
        memoryObj.index = i;
        break;
      }
    }*/

    // Generate creep name and memory
    const name = `${role}_${spawn.room.name}_${Game.time}`;
    memoryObj.name = name;
    // add extraMemory to memoryObj
    for (const key in extraMemory) {
      memoryObj[key] = extraMemory[key]
    }

    // Spawn the creep
    console.log(`Spawning new ${role}: ${name} with body ${JSON.stringify(body)} and memory ${JSON.stringify(memoryObj)}`);
    // Spawning new hauler: hauler_W53S14_67383736 with body ["carry","move"] and memory {"name":"hauler_W53S14_67383736","role":"hauler","room":"W53S14","index":0,"sourceId":{"sourceId":"5bbcaa299099fc012e630f75"}}

    return spawn.spawnCreep(body, name, { memory: memoryObj });
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
};

module.exports = roomManager;
