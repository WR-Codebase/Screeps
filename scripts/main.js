const roomManager = require('roomManager');
const creepManager = require('creepManager');
const towerManager = require('towerManager');
const trafficManager = require('trafficManager');

if (!global.allies)
  global.allies = new Set(["kotyara", "suyu", "dodzai", "Pwk", "WoodenRobot", "Belthazor"]);

if (!global.heap) global.heap = {};

if (!global.heap.rooms) global.heap.rooms = {};

module.exports.loop = function () {
  try {
    console.log(`Tick START: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

    checkEnergyBalance();
    

    // tick CPU used before roomManager.run() to ensure all rooms are in memory
    //console.log(`CPU used before roomManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    // Run rooms
    roomManager.run();

    // Run creeps
    creepManager.run();

    // Run towers
    towerManager.run();


    // Run Inter-Room Creeps

    console.log(`Tick END: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

    if (Game.time % 100 === 0) {
      // Periodically clear memory
      if (RawMemory.get().length > 2000000) {
        console.log(`[WARN] Memory usage is over 2MB!`);
      }
      purgeMemory();
    }
    _.forEach(Game.rooms, room => {
      trafficManager.run(room);
    });
    } catch (e) {
    console.log(`Error in main loop: ${e}`);
  };

}

function checkEnergyBalance() {
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (!room.controller || !room.controller.my) continue;

    const energyAvailable = room.energyAvailable;
    const energyCapacity = room.energyCapacityAvailable;
    
    // If spawns and extensions are full, there is no demand
    const demand = (energyAvailable < energyCapacity) ? (energyCapacity - energyAvailable) : 0;

    console.log(`Room ${roomName} Energy Available: ${energyAvailable}, Energy Capacity: ${energyCapacity}, Demand: ${demand}`);

    // Containers that are NOT adjacent to a source
    const containers = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_SOURCES, 1).length
    });

    const containerEnergy = _.sum(containers, (c) => c.store[RESOURCE_ENERGY]);
    const containerCapacity = _.sum(containers, (c) => c.store.getCapacity(RESOURCE_ENERGY));
    const containerDemand = containerCapacity - containerEnergy;

    console.log(`Room ${roomName} Container Energy: ${containerEnergy}, Container Capacity: ${containerCapacity}, Container Demand: ${containerDemand}`);

    const storageEnergy = room.storage ? room.storage.store[RESOURCE_ENERGY] : 0;
    
    // Unified surplus calculation
    const surplus = storageEnergy - (demand + containerDemand);

    console.log(`Room ${roomName} Adjusted Demand: ${demand + containerDemand}, Surplus: ${surplus}`);

    heap.rooms[roomName] = {
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