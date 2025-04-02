const jobs = require('./jobs');

/**
 * The Nurse role nourishes larval creeps by filling the extensions and spawns with energy.
 * @type {{run: roleNurse.run}}
 */
const roleNurse = {
  run: function (creep) {
    if (typeof creep.memory.nursing === 'undefined') creep.memory.nursing = false; // Default to not nursing
    const wasNursing = creep.memory.nursing;

    // This needs to be reworked so that the nurse keeps nourishing until empty, and then collects until full. It should not collect if it has any energy left.
    //creep.memory.nursing=true;
    if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.nursing = false;
    } else {
      creep.memory.nursing = true;
    }

    if (creep.memory.nursing) {
      jobs.nourish(creep);
    } else {
      // If the creep is not full energy, if storage has energy collect from it, else use the collect job
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY)) {
        if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
          // If the creep is not full energy, if storage has energy collect from it, else use the collect job
          if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        } else {
          creep.memory.energyPriority = ['STORAGE', 'TOMBSTONE', 'RUIN', 'CONTAINER_STORAGE', 'DROPPED_RESOURCE'];
          jobs.collect(creep);
        }
      } else {
        // creep is full, switch to nursing
        creep.memory.nursing = true;
      }
    }

    if (wasNursing !== creep.memory.nursing) {
      // The nursing state needs a baby bottle icon
      delete creep.memory.targetId
      creep.say(creep.memory.nursing ? '🍼nurse' : '🔄collect');
    }
  }
};

module.exports = roleNurse;
