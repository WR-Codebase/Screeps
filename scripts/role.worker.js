const jobs = require('./jobs');

const roleWorker = {
  // The role name helps identify the purpose of this module
  role: 'worker',
  status: 'idle',

  // Body parts for the creep are defined here, but it's empty for now
  bodyTemplate: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],

  run: function (creep) {
    //console.log(`worker.run ${creep.name}`);

    // Problem: The worker stops upgrading before using all energy

    // If the worker has no energy collect some
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.energyPriority = ['CONTAINER', 'STORAGE'];
      jobs.collect(creep);
    } else if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
      // If there are construction sites, build them
      jobs.build(creep);
    } else {
      jobs.upgrade(creep);
    }

    //console.log(`Worker: ${creep.name} - ${creep.memory.status}`);
  }
};

module.exports = roleWorker;
