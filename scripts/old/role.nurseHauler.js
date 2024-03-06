const jobs = require('./jobs');

// Nurse/Hauler role
module.exports = {
  run: function (creep) {
    if (creep.store.getFreeCapacity() > 0) {
      creep.memory.energyPriority = ['DROPPED_RESOURCE'];
      //delete creep.memory.droppedEnergyRange;
      jobs.collect(creep);
    } else {
      // Order of priority: Spawn, Extension, Container, Tower, Storage
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return ((structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_CONTAINER ||
              structure.structureType == STRUCTURE_TOWER ||
              structure.structureType == STRUCTURE_STORAGE) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }
      }).sort((a, b) => {
        const priority = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_TOWER, STRUCTURE_STORAGE];
        return priority.indexOf(a.structureType) - priority.indexOf(b.structureType);
      });

      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      }
    }
  }
};

