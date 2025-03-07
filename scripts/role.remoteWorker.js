const jobs = require('./jobs');

const roleRemoteWorker = {

  /** @param {Creep} creep **/
  run: function (creep) {
    // Define target room
    creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'CONTAINER', 'DROPPED_RESOURCE', 'STORAGE', 'SOURCE']
    const targetRoom = 'W53S13';
    if (!creep.memory.status) {
      creep.memory.status = 'empty';
    }

    // Move to the target room if not already there
    if (creep.room.name !== targetRoom) {
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
      console.log(`Creep ${creep.name} moving to target room ${targetRoom}`);
      return;
    }

    // In target room, determine behavior based on energy capacity
     //console.log(`${creep.name} is ${creep.memory.status}`);
    // Adjusted logic to ensure the worker completes using all energy before refilling
    const oldStatus = creep.memory.status;
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
        // If there are construction sites, prioritize building
        //console.log(`${creep.name} is building and has ${creep.store.getUsedCapacity(RESOURCE_ENERGY)} energy`)
        jobs.build(creep);
        creep.memory.status = '🚧building';
      } else {
        //console.log(`${creep.name} is upgrading and has ${creep.store.getUsedCapacity(RESOURCE_ENERGY)} energy`);
        // If no construction sites, then upgrade the controller
        jobs.upgrade(creep);
        creep.memory.status = '⚡upgrading';
      }
    } else {
      // If the worker has no energy, set energy collection priorities and collect
      // If room is not E52N17, collect from containers and storage
      //console.log(`${creep.name} is collecting energy`);
      creep.memory.energyPriority = ['CONTAINER', 'CONTAINER_STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
      jobs.collect(creep);
      creep.memory.status = '🔄collect';
    }

    if (oldStatus !== creep.memory.status) {
        delete creep.memory.targetId
        creep.say(creep.memory.status);
    };
  }
};

module.exports = roleRemoteWorker;
