import linkManager from "linkManager";

//const linkManager = require("./linkManager");

interface CreepMemory {
  role: string;
  room?: string;
  sourceId?: string;
  targetRoom?: string;
  [key: string]: any;
}

// this needs to be a module so we can use it in other modules
export default {
  run: function () {
    //console.log(`[DEBUG] roomManager.run CPU used at start: ${Game.cpu.getUsed().toFixed(2)}`);
    // Create a global copy of Memory.creeps so we're not constantly reading from memory
    try {
      // Once every ten ticks
      //if (Game.time % 10 === 0) {
      //roomPlanner.run(Game.rooms['E51S17']);
      //}
      //console.log('Checking rooms for spawns');
      for (const roomName in Game.rooms) {
        //console.log(`Checking room ${roomName}`);
        const room = Game.rooms[roomName];


        // group by roomName and role. We only want to capture quantity of each role in each roomname, not all data for each creep
        const reducedCreeps = _.reduce(Game.creeps, (result: { [room: string]: { [role: string]: number } }, value, key) => {

          if (!result[value.memory.room]) {
            result[value.memory.room] = {};
          }
          if (!result[value.memory.room][value.memory.role]) {
            result[value.memory.room][value.memory.role] = 0;
          }
          result[value.memory.room][value.memory.role]++;
          return result;
        }, {});
        //console.log(`[DEBUG] reducedCreeps: ${JSON.stringify(reducedCreeps)}`);

        // get CPU used
        //console.log(`[DEBUG] roomManager.run CPU used after reducedCreeps: ${Game.cpu.getUsed().toFixed(2)}`);
        //if (Game.time % 10 === 0) roomPlanner.drawChecker(room);
        if (room.controller && room.controller.my) {
          // Check for spawns
          const spawns = room.find(FIND_MY_SPAWNS);
          if (spawns.length === 0) {
            //console.log(`No spawns found in room ${roomName}`);
          } else {
            // Once every 5 ticks run spawn logic
            if (Game.time % 5 === 0) {
              const spawn = this.nextInactiveSpawn(room);
              if (spawn) {
                // A spawn is available, check if anything needs to be spawned and spawn it.
                // if reducedCreeps has roomName, spawn creeps for that room
                this.runSpawn(spawn, room, (reducedCreeps.hasOwnProperty(roomName)) ? reducedCreeps[roomName] : {});
              }
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
    //console.log(`[DEBUG] roomManager.run CPU used: ${Game.cpu.getUsed().toFixed(2)}`);
  },
  // Find the next available spawn in the room or return null
  nextInactiveSpawn: function (room: Room): StructureSpawn | null {
    const spawns = room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns) {
      if (!spawn.spawning) {
        return spawn;
      }
    }
    return null;
  },
  // Run the spawn logic for the room
  runSpawn: function (spawn: StructureSpawn, room: Room, reducedCreeps: { [role: string]: number }) {
    //console.log(`[DEBUG] Running spawn logic for room ${room.name}, reducedCreeps: ${JSON.stringify(reducedCreeps)}`);
    // all filters must include room

    // If room is E55S18 spawn remote harvester and hauler targeting room E56S18
    if (room.name === 'E55S18') {
      const remoteHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester' && creep.memory.targetRoom === 'E56S18');
      if (remoteHarvesters.length < 1) {
        this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK, CARRY, MOVE] as BodyPartConstant[], [], { targetRoom: 'E56S18' }, 16 * 50);
      }
      const remoteHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler' && creep.memory.targetRoom === 'E56S18');
      if (remoteHaulers.length < 2) { // 1 hauler per harvester
        this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], { targetRoom: 'E56S18' }, 16 * 50);
      }

      // spawn a drone for E56S18 in reserve mode
      const drones = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone' && creep.memory.targetRoom === 'E56S18');
      if (drones.length < 1) {
        this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], { targetRoom: 'E56S18', status: 'reserve' }, 650);
      }

      // Then do the same for E55S19
      const remoteHarvesters2 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester' && creep.memory.targetRoom === 'E55S19');
      if (remoteHarvesters2.length < 1) {
        this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK, CARRY, MOVE], [], { targetRoom: 'E55S19' }, 16 * 50);
      }
      const remoteHaulers2 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler' && creep.memory.targetRoom === 'E55S19');
      if (remoteHaulers2.length < 2) { // 1 hauler per harvester
        this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], { targetRoom: 'E55S19' }, 16 * 50);
      }

      // Spawn a drone for E55S19 in reserve mode
      const drones2 = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone' && creep.memory.targetRoom === 'E55S19');
      if (drones2.length < 1) {
        this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], { targetRoom: 'E55S19', status: 'reserve' }, 650);
      }
    }

    const numHarvesters = reducedCreeps['harvester'] || 0;

    // If there is an extension and there are no nurses, spawn a nurse to fill it
    const numNurses = reducedCreeps['nurse'] || 0;

    // number of nurses should be proportional to every 1 nurse to 10 extensions
    const extensions = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }) || 1;
    const targetNurses = Math.max(1, Math.floor(extensions.length / 15));
    if (numNurses < targetNurses && numHarvesters > 0) {
      this.wrSpawnCreep(spawn, 'nurse', [CARRY, MOVE], [], {}, 16 * 50);
    }

    // If there is at least one harvester and no nurses, spawn a nurse.
    const sources = room.find(FIND_SOURCES);

    const numSources = sources.length;
    //console.log(`[DEBUG] numHarvesters: ${numHarvesters}, numSources: ${numSources}`);
    if (numHarvesters < numSources) {
      // For each resource in the room, check if a harvester is assigned. If not, spawn one.
      for (const source of sources) {


        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id && creep.memory.room === room.name);
        //console.log(`[DEBUG] harvesters: ${harvesters} for source ${source.id}`);
        if (harvesters.length < 1) {
          let index = 0;

          const pattern = [WORK]; // Only 1 MOVE part to reach the source
          const suffix = [CARRY, MOVE] as BodyPartConstant[]; // Add a MOVE part to the end of the body
          const name = `harvester_${room.name}_${Game.time}`;
          const memory = { name: name, role: 'harvester', room: room.name, index: index, sourceId: source.id };

          this.wrSpawnCreep(spawn, 'harvester', pattern, suffix, memory, 700); // up to 6 work parts, 1 carry, 1 move
        }
      }

    } else {

      let numHaulers = reducedCreeps['hauler'] || 0;
      if (numHaulers < numSources && room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } }).length > 0) {
        // Similarly, if there are no haulers, spawn one, for each source.
        for (const source of sources) {

          const haulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id);
          // If haulers < 1 and there are containers in the room
          if (haulers.length < 1) {
            this.wrSpawnCreep(spawn, 'hauler', [CARRY, MOVE], [], { sourceId: source.id }, 16 * 50);
          }
        }
      }

      // If there are less than two workers, spawn one.
      const numWorkers = reducedCreeps['worker'] || 0;
      if (numWorkers < 2) {
        this.wrSpawnCreep(spawn, 'worker', [WORK, CARRY, CARRY, CARRY, MOVE], [], {}, 2400); // total per pattern = 300
      } else {

        // If there are no repairers and there are no towers spawn a repairer for the room
        const numRepairers = reducedCreeps['repairer'] || 0;
        if (numRepairers < 1) {
          this.wrSpawnCreep(spawn, 'repairer', [WORK, CARRY, MOVE, CARRY, MOVE], [], {}, 16 * 50);
        }

        //     minCreeps('picker', 2, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);

        // If there are no pickers and there are resources or tombstones on the ground, spawn a picker
        const numPickers = reducedCreeps['picker'] || 0;
        if (numPickers < 1) {
          this.wrSpawnCreep(spawn, 'picker', [CARRY, MOVE], [], {}, 16 * 50);
        }

        // If there is a link, spawn one minim to manage it
        const links = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
        const minims = reducedCreeps['minim'] || 0;
        if (links.length > 0 && minims < 1) {
          // We need this to carry up to 800 energy. That is 16 carry and 1 move for a total of 850
          this.wrSpawnCreep(spawn, 'minim', [CARRY], [MOVE], {}, 850);
        }

        // If there is a storage spawn one courier
        const storages = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_STORAGE } });
        const numCouriers = reducedCreeps['courier'] || 0;
        if (storages.length > 0 && numCouriers < 2) {
          this.wrSpawnCreep(spawn, 'courier', [CARRY, CARRY, MOVE], [], {}, 16 * 50);
        }

        // If there is a mineral extractor and there are no mineral harvesters spawn one.
        const extractors = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTRACTOR } });
        const numMineralHarvesters = reducedCreeps['mineralHarvester'] || 0;
        const mineral = room.find(FIND_MINERALS)[0];

        if (extractors.length > 0 && mineral && mineral.mineralAmount > 0 && numMineralHarvesters < 1) {
          this.wrSpawnCreep(spawn, 'mineralHarvester', [WORK, CARRY, CARRY, MOVE], [], {}, 16 * 50);
        }

        // Long Range Haulers
        //const longRangeHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'longRangeHauler');
        //if (longRangeHaulers.length < 5) {
        //  let surplusRoom = null;
        //  let deficitRoom = null;

        //  for (const heapRoom in heap.rooms) {
        //    if (heap.rooms[heapRoom].surplus > 1000 && (!surplusRoom || heap.rooms[heapRoom].surplus > heap.rooms[surplusRoom].surplus)) {
        //      surplusRoom = heapRoom;
        //    }
        //    if (heap.rooms[heapRoom].demand > 1000 && (!deficitRoom || heap.rooms[heapRoom].demand > heap.rooms[deficitRoom].demand)) {
        //      deficitRoom = heapRoom;
        //    }
        //  }

        // if the current room is not the surplus room, do not spawn the creep
        //  if (surplusRoom === room.name && (surplusRoom && deficitRoom)) {
        //    const name = `LRHauler_${Game.time}`;

        //  let result = this.wrSpawnCreep(spawn, 'longRangeHauler', [CARRY, CARRY, MOVE], [CARRY, CARRY, MOVE], { sourceRoom: surplusRoom, targetRoom: deficitRoom }, 9999);
        //  console.log(`Spawning Long-Range Hauler ${name} from ${surplusRoom} to ${deficitRoom}: ${result}`);
        //}
        //}


        // If there are no remote workers, spawn one
        //const remoteWorkers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteWorker');
        //console.log(`[DEBUG] remoteWorkers: ${remoteWorkers.length}`);
        //if (remoteWorkers.length < 5)
        //this.wrSpawnCreep(spawn, 'remoteWorker', [WORK, CARRY, MOVE], [], {}, 16 * 50);

        // Remote Defender
        //const remoteDefenders = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteDefender');
        //if (remoteDefenders.length < 1)
        //  this.wrSpawnCreep(spawn, 'remoteDefender', [TOUGH, RANGED_ATTACK, MOVE], [], {}, 9999);

        // If there are no remote harvesters, spawn one
        //const remoteHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester');
        //if (remoteHarvesters.length < 1)
        //this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK], [CARRY, MOVE], {}, 16 * 50);

        // If there are no remote haulers, spawn one
        //const remoteHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler');
        //if (remoteHaulers.length < 1)
        //this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], {}, 16 * 50);

        // Spawn a soldier
        //const soldiers = _.filter(Game.creeps, (creep) => creep.memory.role === 'soldier');
        //if (soldiers.length < 1)
        //  Game.spawns['Spawn1'].spawnCreep(
        //    [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], 
        //    'soldier_' + Game.time, 
        //    { memory: { role: 'soldier' } }
        //  );

        // Once every 10 ticks, check if adjacent rooms are claimable
        //if (Game.time % 10 === 0) {
        // If there isn't already a claimer, make one.
        //const drones = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone');
        //if (drones.length < 1)
        //this.wrSpawnCreep(spawn, 'drone', [CLAIM, CLAIM, MOVE], [], { targetRoom: 'E55S17' }, 9999);
        //}
      }
    }
    //console.log(`[DEBUG] runSpawn(${room.name}) CPU used: ${Game.cpu.getUsed().toFixed(2)}`);
  },
  bodyFactory: function (pattern: BodyPartConstant[], suffix: BodyPartConstant[], maxEnergy: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = [];
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
  wrSpawnCreep: function (spawn: StructureSpawn, role: string, pattern: BodyPartConstant[], suffix: BodyPartConstant[], extraMemory = {}, energyLimit = 0) {

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
    let body = this.bodyFactory(pattern, suffix, maxEnergy) as BodyPartConstant[];

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

    // Generate creep name and memory
    const name = `${role}_${spawn.room.name}_${Game.time}`;
    memoryObj.name = name;

    // Spawn the creep
    //console.log(`Spawning new ${role}: ${name} with body ${JSON.stringify(body)} and memory ${JSON.stringify(memoryObj)}`);
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
