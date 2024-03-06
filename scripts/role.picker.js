const jobs = require('jobs');

/**
 * The Picker role is responsible for cleaning up any resources that have fallen on the ground
 * before they can decay, and dropping them off in the correct storage receptacle.
 * @type {{bodyTemplate: *[], defaultMode: string, roleName: string, run: rolePicker.run}}
 */
const rolePicker = {
  // Default properties
  roleName: 'resourcePicker',
  bodyTemplate: [CARRY, MOVE, CARRY, MOVE],
  defaultMode: 'picking',

  /** @param {Creep} creep **/
  run: function (creep) {
    // The picker creep picks up temporary resources that have fallen on the ground (tombstones, ruins, and dropped energy) and delivers them to the nearest container
    if (creep.memory.picking === undefined) creep.memory.picking = false;

    // Switch state between picking and delivering
    if (creep.memory.picking && creep.store.getFreeCapacity() === 0) {
      creep.memory.picking = false;
      creep.say('🚚 haul');
    }
    if (!creep.memory.picking && creep.store.getUsedCapacity() === 0) {
      creep.memory.picking = true;
      creep.say('🔄 collect');
    }

    if (creep.memory.picking) {
      // Set energy priority
      creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'DROPPED_RESOURCE'];
      jobs.collect(creep);

      // If energy is full, switch to hauling
      if (creep.store.getFreeCapacity() === 0) creep.memory.picking = false;
    } else {
      // Find the nearest container with available capacity
      const containers = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_CONTAINER
            || s.structureType === STRUCTURE_STORAGE)
          && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });

      if (containers) {
        if (creep.transfer(containers, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(containers, { visualizePathStyle: { stroke: '#0af' } });
        }
      } else {
        jobs.nourish(creep);
      }
      // If empty, switch to picking
      if (creep.store.getUsedCapacity() === 0) creep.memory.picking = true;
    }
  }
};

module.exports = rolePicker;
