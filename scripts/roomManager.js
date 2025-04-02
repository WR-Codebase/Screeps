const linkManager = require("./linkManager");
const roomPlanner = require("./roomPlanner");
const distanceTransform = require("./distanceTransform");

const roomManager = {
  run: function () {
    //console.log(`[DEBUG] roomManager.run CPU used at start: ${Game.cpu.getUsed().toFixed(2)}`);
    // Create a global copy of Memory.creeps so we're not constantly reading from memory
    try {
      // If heap doesn't include rooms, create it
      if (!global.heap.rooms) global.heap.rooms = {};

      // Once every ten ticks
      if (Game.time % 2 === 0) {
        //roomPlanner.run(Game.rooms['E53S19']);
      }
      //console.log('Checking rooms for spawns');
      for (const roomName in Game.rooms) {
        console.log(`[DEBUG] roomManager.run() checking room ${roomName}`);

        //console.log(`Checking room ${roomName}`);
        const room = Game.rooms[roomName];
        
        if (!heap.rooms[roomName]) heap.rooms[roomName] = {};
        // room claimed or not
        console.log(`[INFO] Room: ${roomName}, claimed: ${room.controller.my}`);
        // check for presense of hostile players and invaders
        // Allies defined in main:   global.allies = new Set(["kotyara", "suyu", "dodzai", "Pwk", "WoodenRobot", "Belthazor"]);
        const invaders = room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !global.allies.has(c.owner.username) });
        // invader core
        const invaderCore = room.find(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType === STRUCTURE_INVADER_CORE });
        if (invaders.length > 0 || invaderCore.length > 0) {
          console.log(`[INFO] Invaders detected in room ${roomName}`);
          // If invaders are present, set room to hostile
          heap.rooms[roomName].hostile = true;
        } else {
          // If no invaders are present, set room to friendly
          heap.rooms[roomName].hostile = false;
        }



        // group by roomName and role. We only want to capture quantity of each role in each roomname, not all data for each creep
        const reducedCreeps = _.reduce(Game.creeps, (result, value, key) => {

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
            if (Game.time % 2 === 0) {
              const spawn = this.nextInactiveSpawn(room);
              if (spawn) {
                // A spawn is available, check if anything needs to be spawned and spawn it.
                // if reducedCreeps has roomName, spawn creeps for that room
                console.log(`[DEBUG] Spawning creeps for room ${roomName}`);
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
  runSpawn: function (spawn, room, reducedCreeps) {
    //console.log(`[DEBUG] Running spawn logic for room ${room.name}, reducedCreeps: ${JSON.stringify(reducedCreeps)}`);
    // all filters must include room

    // If room is E55S18 spawn remote harvester and hauler targeting room E56S18
    if (room.name === 'E55S18') {
      const remoteHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester' && creep.memory.targetRoom === 'E56S18');
      if (remoteHarvesters.length < 1) {
        this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK, CARRY, MOVE], [], { targetRoom: 'E56S18' }, 16 * 50);
      }
      const remoteHaulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler' && creep.memory.targetRoom === 'E56S18');
      if (remoteHaulers.length < 2) { // 1 hauler per harvester
        this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], { targetRoom: 'E56S18' }, 16 * 50);
      }

      // spawn a drone for E56S18 in reserve mode // If target room controller is not reserved by us, omit the size limit
      const drones = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone' && creep.memory.targetRoom === 'E56S18');
      if (drones.length < 1) {
        // Check if the target room is reserved by us
        const targetRoomController = Game.rooms['E56S18'] ? Game.rooms['E56S18'].controller : null;
        const sizeLimit = targetRoomController && targetRoomController.reservation && targetRoomController.reservation.username === Memory.username ? 650 : undefined;
        this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], { targetRoom: 'E56S18', status: 'reserve' }, sizeLimit);
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
        // Check if the target room is reserved by us
        const targetRoomController = Game.rooms['E55S19'] ? Game.rooms['E55S19'].controller : null;
        const sizeLimit = targetRoomController && targetRoomController.reservation && targetRoomController.reservation.username === Memory.username ? 650 : undefined;
        this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], { targetRoom: 'E55S19', status: 'reserve' }, sizeLimit);
      }

      
      // E54S19
      const remoteHarvesters3 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester' && creep.memory.targetRoom === 'E54S19');
      if (remoteHarvesters3.length < 1) {
        this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK, CARRY, MOVE], [], { targetRoom: 'E54S19' }, 16 * 50);
      }
      const remoteHaulers3 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler' && creep.memory.targetRoom === 'E54S19');
      if (remoteHaulers3.length < 1) { // 1 hauler per harvester
        this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], { targetRoom: 'E54S19' }, 16 * 50);
      }
      // Spawn a drone for E54S19 in reserve mode
      const drones3 = _.filter(Game.creeps, (creep) => creep.memory.role === 'drone' && creep.memory.targetRoom === 'E54S19');
      if (drones3.length < 1) {
        // Check if the target room is reserved by us
        const targetRoomController = Game.rooms['E54S19'] ? Game.rooms['E54S19'].controller : null;
        const sizeLimit = targetRoomController && targetRoomController.reservation && targetRoomController.reservation.username === Memory.username ? 650 : undefined;
        this.wrSpawnCreep(spawn, 'drone', [CLAIM, MOVE], [], { targetRoom: 'E54S19', status: 'reserve' }, sizeLimit);
      }

      // E53S19
      // Two sources needing remote harvesters
      //const remoteHarvesters4 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHarvester' && creep.memory.targetRoom === 'E53S19');
      //if (remoteHarvesters4.length < 2) {
      //  this.wrSpawnCreep(spawn, 'remoteHarvester', [WORK, CARRY, MOVE], [], { targetRoom: 'E53S19' }, 16 * 50);
      //}
      const remoteWorkers = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteWorker' && creep.memory.targetRoom === 'E53S19');
      if (remoteWorkers.length < 3) {
        this.wrSpawnCreep(spawn, 'remoteWorker', [WORK, CARRY, CARRY, MOVE, MOVE], [], { targetRoom: 'E53S19' });
      }
      
    } else if (room.name === 'E53S19') {
      const remoteHaulers4 = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteHauler' && creep.memory.targetRoom === 'E54S19');
      if (remoteHaulers4.length < 1) { // 1 hauler per harvester
        this.wrSpawnCreep(spawn, 'remoteHauler', [CARRY, MOVE], [], { targetRoom: 'E54S19' }, 16 * 50);
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
          const suffix = [CARRY, MOVE]; // Add a MOVE part to the end of the body
          const name = `harvester_${room.name}_${Game.time}`;
          const memory = { name: name, role: 'harvester', room: room.name, index: index, sourceId: source.id };

          this.wrSpawnCreep(spawn, 'harvester', pattern, suffix, memory, 700); // up to 6 work parts, 1 carry, 1 move
        }
      }

    } else {

      let numHaulers = reducedCreeps['hauler'] || 0;
      for (source of sources) {
        // If this source does not have a link next to it
        const link = source.pos.findInRange(FIND_MY_STRUCTURES, 3, { filter: (s) => s.structureType === STRUCTURE_LINK });
        //console.log(`[DEBUG] link: ${link.length} for source ${source.id}`);
        if (link.length > 0) continue;

        const haulers = _.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id && creep.memory.room === room.name);
        //console.log(`[DEBUG] haulers: ${haulers.length} for source ${source.id}`);
        if (haulers.length < 1) {
          // Detect energy on the ground or in a container within one tile
          const droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, { filter: (r) => r.resourceType === RESOURCE_ENERGY });
          const containerEnergy = source.pos.findInRange(FIND_STRUCTURES, 1, { filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 });

          const totalEnergyToHaul = droppedEnergy.reduce((sum, r) => sum + r.amount, 0) + containerEnergy.reduce((sum, s) => sum + s.store[RESOURCE_ENERGY], 0);
          if (droppedEnergy.length > 0 || containerEnergy.length > 0) {
            console.log(`[DEBUG] Spawning hauler for source ${source.id}`);
            const pattern = [CARRY, MOVE];
            const name = `hauler_${room.name}_${Game.time}`;
            const memory = { name: name, role: 'hauler', room: room.name, sourceId: source.id };
            this.wrSpawnCreep(spawn, 'hauler', pattern, [], memory, 700); // up to 6 carry parts, 1 move

          }
        }
      }

      // If there are less than two workers, spawn one.
      const numWorkers = reducedCreeps['worker'] || 0;
      // If room capacity is less than 50% only spawn one worker
      //const roomCapacity = room.energyCapacityAvailable;
      //const roomEnergy = room.energyAvailable;
      //const roomPercent = roomEnergy / roomCapacity;
      if (numWorkers < 1) {
        console.log(`[DEBUG] Room: ${room.name}, numWorkers: ${numWorkers}`);
        const workerResult = this.wrSpawnCreep(spawn, 'worker', [WORK, CARRY, CARRY, CARRY, MOVE], [], {}); // total per pattern = 300
        console.log(`[DEBUG] Spawning worker: ${workerResult}`);
      } else {

        // If there are no repairers and there are no towers spawn a repairer for the room
        const numRepairers = reducedCreeps['repairer'] || 0;
        if (numRepairers < 1) {
          this.wrSpawnCreep(spawn, 'repairer', [WORK, CARRY, MOVE, CARRY, MOVE], [], {}, 2400);
        }

        //     minCreeps('picker', 2, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);

        // If there are no pickers and there are resources or tombstones on the ground, spawn a picker
        const numCouriers = reducedCreeps['courier'] || 0;
        if (numCouriers < 1) {
          this.wrSpawnCreep(spawn, 'courier', [CARRY, CARRY, MOVE], [], {}, 2400);
        }

        // If there is a link, spawn one minim to manage it
        const links = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK } });
        const minims = reducedCreeps['minim'] || 0;
        if (links.length > 0 && minims < 1) {
          // We need this to carry up to 800 energy. That is 16 carry and 1 move for a total of 850
          this.wrSpawnCreep(spawn, 'minim', [CARRY], [MOVE], {}, 850);
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

        // Remote Defender should be spawned for each room that is hostile from each current room
        // For each hostile room
        const hostileRooms = _.filter(heap.rooms, (room) => room.hostile === true);
        for (const hostileRoom in hostileRooms) {
          console.log(`[DEBUG] Spawning remote defender for room ${hostileRoom} in room ${room.name}`);
          const remoteDefenders = _.filter(Game.creeps, (creep) => creep.memory.role === 'remoteDefender' && creep.memory.homeRoom === room.name);
          if (remoteDefenders.length < 2)
            this.wrSpawnCreep(spawn, 'remoteDefender', [RANGED_ATTACK, RANGED_ATTACK, MOVE], [], {homeRoom: room.name, targetRoom: hostileRoom }, 9999);
        }
        

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
  bodyFactory: function (pattern, suffix, maxEnergy) {
    let body = [];
    let energy = 0;
  
    const patternCost = pattern.reduce((sum, part) => sum + BODYPART_COST[part], 0);
    const suffixCost = suffix.reduce((sum, part) => sum + BODYPART_COST[part], 0);
  
    const totalCostPerCycle = patternCost + suffixCost;
    const totalLengthPerCycle = pattern.length + suffix.length;
  
    // 🚫 If even one cycle exceeds limits, just return one cycle
    if (totalCostPerCycle > maxEnergy || totalLengthPerCycle > 50) {
      return pattern.concat(suffix).slice(0, 50);
    }
  
    // 🔁 Add as many full patterns as fit within energy and part count
    while (
      energy + patternCost + suffixCost <= maxEnergy &&
      body.length + pattern.length + suffix.length <= 50
    ) {
      body.push(...pattern);
      energy += patternCost;
    }
  
    // ✅ Append suffix if it doesn't push over 50 parts
    if (body.length + suffix.length <= 50) {
      body.push(...suffix);
    }
  
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
    console.log(`[DEBUG] wrSpawnCreep: Spawning ${role} in ${spawn.room.name} from Spawn: ${spawn.name} with pattern ${JSON.stringify(pattern)} and suffix ${JSON.stringify(suffix)}`);

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
    if (body.length === 0 || body.length > 50 || body.every(part => part === MOVE)) {
      console.log(`[ERROR] wrSpawnCreep: Invalid creep body generated for ${role}.`);
      return ERR_INVALID_ARGS;
    }

    // Memory for each creep should end up with { name, role, room, index } at a minimum
    var memoryObj = { name: '', role: role, room: spawn.room.name, index: 0 };

    // Generate creep name and memory
    const name = `${role}_${spawn.room.name}_${Game.time}`;
    memoryObj.name = name;
    // add extraMemory to memoryObj
    for (const key in extraMemory) {
      memoryObj[key] = extraMemory[key]
    }

    // Spawn the creep
    //console.log(`Spawning new ${role}: ${name} with body ${JSON.stringify(body)} and memory ${JSON.stringify(memoryObj)}`);
    // Spawning new hauler: hauler_W53S14_67383736 with body ["carry","move"] and memory {"name":"hauler_W53S14_67383736","role":"hauler","room":"W53S14","index":0,"sourceId":{"sourceId":"5bbcaa299099fc012e630f75"}}

    console.log(`[DEBUG] Spawning new ${role}: ${name} with body ${JSON.stringify(body)} and memory ${JSON.stringify(memoryObj)}`);
    const result = spawn.spawnCreep(body, name, { memory: memoryObj });
    return result;
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
