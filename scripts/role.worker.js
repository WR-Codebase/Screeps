const jobs = require('./jobs');

const roleWorker = {
  // The role name helps identify the purpose of this module
  role: 'worker',
  status: 'idle',

  // Body parts for the creep are defined here
  bodyTemplate: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],

  run: function (creep) {
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
      //creep.memory.energyPriority = ['CONTAINER', 'CONTAINER_STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
      //jobs.collect(creep);
      creep.memory.status = '🔄collect';

      // Instead of using the collect job, get energy from the nearest of any container, storage, or dropped resource, or if none of the above are available the nearest source
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0
      });
      
      // If target is in range pick it up, otherwise move to it

      if (target) {
        if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else {
        target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
          filter: r => r.resourceType === RESOURCE_ENERGY
        });
        if (target) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        } else {
          target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
          if (target) {
            if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
          }
        }
      }
    }

    if (oldStatus !== creep.memory.status) {
        delete creep.memory.targetId
        creep.say(creep.memory.status);
    };

  }
};

module.exports = roleWorker;
