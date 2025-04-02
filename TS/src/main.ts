import { ErrorMapper } from "utils/ErrorMapper";
import roomManager from 'roomManager';
import Traveler
const creepManager = require('creepManager');
const towerManager = require('towerManager');
const trafficManager = require('trafficManager');

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do not fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    status: string;
    working?: boolean;
    sourceId?: Id<Source> | string;
    targetRoom?: string;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
      allies: Set<string>;
      heap: {
        rooms: {
          [roomName: string]: {
            //lastCreepCount: number;
            demand?: number;
            surplus?: number;
          }
        };
      };
    }
  }
}


if (!global.allies)
  global.allies = new Set(["kotyara", "suyu", "dodzai", "Pwk", "WoodenRobot", "Belthazor"]);

if (!global.heap) global.heap = { rooms: {} };

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  try {
    console.log(`Tick START: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

    //checkEnergyBalance();


    // tick CPU used before roomManager.run() to ensure all rooms are in memory
    //console.log(`CPU used before roomManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    // Run rooms
    roomManager.run();
    // tick CPU used after roomManager.run() to ensure all rooms are in memory
    console.log(`CPU used after roomManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    if (Game.cpu.getUsed() > 19) return;

    // Run creeps
    creepManager.run();
    // tick CPU used after creepManager.run() to ensure all creeps are in memory
    console.log(`CPU used after creepManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    if (Game.cpu.getUsed() > 19) return;


    _.forEach(Game.rooms, room => {
      trafficManager.run(room);
    });


    // Run towers
    towerManager.run();
    // tick CPU used after towerManager.run() to ensure all towers are in memory
    console.log(`CPU used after towerManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    if (Game.cpu.getUsed() > 19) return;

    // Run Inter-Room Creeps


    if (Game.time % 100 === 0) {
      // Periodically clear memory
      if (RawMemory.get().length > 2000000) {
        console.log(`[WARN] Memory usage is over 2MB!`);
      }
      purgeMemory();
    }
    console.log(`Tick END: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

  } catch (e) {
    console.log(`Error in main loop: ${e}`);
  };

});


function checkEnergyBalance() {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;

    const energyAvailable = room.energyAvailable;
    const energyCapacity = room.energyCapacityAvailable;

    // If spawns and extensions are full, there is no demand
    const demand = (energyAvailable < energyCapacity) ? (energyCapacity - energyAvailable) : 0;

    //console.log(`Room ${roomName} Energy Available: ${energyAvailable}, Energy Capacity: ${energyCapacity}, Demand: ${demand}`);

    // Containers that are NOT adjacent to a source
    const containers = room.find(FIND_STRUCTURES, {
      filter: (s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_SOURCES, 1).length
    });

    // Container capacity
    const containerCapacity = _.sum(containers, (c: StructureContainer) => c.store.getCapacity(RESOURCE_ENERGY));
    // Container demand
    const containerDemand = _.sum(containers, (c: StructureContainer) => c.store.getCapacity(RESOURCE_ENERGY) - c.store[RESOURCE_ENERGY]);

    const containerEnergy = _.sum(containers, (c) => c.store[RESOURCE_ENERGY]);

    //console.log(`Room ${roomName} Container Energy: ${containerEnergy}, Container Capacity: ${containerCapacity}, Container Demand: ${containerDemand}`);

    const storageEnergy = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;

    // Unified surplus calculation
    const surplus = storageEnergy - (demand + containerDemand);

    //console.log(`Room ${roomName} Adjusted Demand: ${demand + containerDemand}, Surplus: ${surplus}`);

    global.heap.rooms[roomName] = {
      demand: demand + containerDemand,
      surplus: surplus
    };
  }
}


/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
