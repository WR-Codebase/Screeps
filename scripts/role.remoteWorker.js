const jobs = require('./jobs');

const roleRemoteWorker = {

  /** @param {Creep} creep **/
  run: function (creep) {
    // Define target room
    creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'CONTAINER', 'DROPPED_RESOURCE', 'STORAGE', 'SOURCE']
    const targetRoom = 'E51N16';
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
    if (creep.store.getUsedCapacity() === 0) {
      creep.memory.status = 'empty';
      // Harvest energy if capacity is not full
      jobs.collect(creep);
    }
    // If no build targets, status is upgrading
    if (creep.room.find(FIND_CONSTRUCTION_SITES).length === 0) {
      creep.memory.status = 'upgrading';
    }

    if (creep.memory.status === 'empty' && creep.store.getFreeCapacity() > 0) {
      jobs.collect(creep);
    } else if (creep.memory.status === 'upgrading') {
      jobs.upgrade(creep);
    } else {
      jobs.build(creep);
      creep.memory.status = 'working';
    }
  }
};

module.exports = roleRemoteWorker;
