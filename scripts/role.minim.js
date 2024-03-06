const jobs = require('./jobs');

/**
 * The Minim role is a basic worker whose primary function is to care
 * for the extensions and their surroundings.
 * @type {{run: roleMinim.run}}
 */
const roleMinim = {
  run: function (creep) {
    // Find spawns and extensions that need filling
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_SPAWN
            || structure.structureType === STRUCTURE_EXTENSION)
          && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    if (targets.length > 0) {
      // Duty 1: Fill spawns or extensions
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        // Collect energy from the nearest source or storage
        creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'CONTAINER', 'STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
        jobs.collect(creep);
      }
    } else {
      // Duty 2: Repair objects within 3 tiles of spawns or extensions
      const structuresToRepair = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          const needsRepair = structure.hits < structure.hitsMax;
          const isCloseToEnergyStructure = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_SPAWN
                || s.structureType === STRUCTURE_EXTENSION)
              && s.pos.inRangeTo(structure, 3)
          }).length > 0;
          return needsRepair && isCloseToEnergyStructure;
        }
      });

      if (structuresToRepair.length > 0) {
        if (creep.repair(structuresToRepair[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(structuresToRepair[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        // Duty 3: Carry energy from Storage to Containers near extensions
        const containersNearExtensions = creep.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType === STRUCTURE_CONTAINER
            && creep.room.find(FIND_STRUCTURES, {
              filter: (ext) => ext.structureType === STRUCTURE_EXTENSION
                && ext.pos.inRangeTo(s, 3)
            }).length > 0
            && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (containersNearExtensions.length > 0) {
          const storage = creep.room.storage;
          if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          } else if (creep.transfer(containersNearExtensions[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containersNearExtensions[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    }
  }
};

module.exports = roleMinim;
