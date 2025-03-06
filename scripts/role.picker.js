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
    // The picker creep picks up temporary resources (tombstones, ruins, and dropped energy) and delivers them to storage.
    if (creep.memory.picking === undefined) creep.memory.picking = false;
  
    // Switch state between picking and delivering
    if (creep.memory.picking && creep.store.getFreeCapacity() === 0) {
      creep.memory.picking = false;
      creep.say('🚚 Delivering');
    }
    if (!creep.memory.picking && creep.store.getUsedCapacity() === 0) {
      creep.memory.picking = true;
      creep.say('🔄 Collect');
    }
  
    if (creep.memory.picking) {
      // Set resource priority
      creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'STORAGE', 'DROPPED_RESOURCE'];
      jobs.collect(creep);
  
      // Check for minerals in tombstones if energy is unavailable
      if (creep.store.getFreeCapacity() > 0) {
        const tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
          filter: (t) => _.sum(t.store) > 0
        });
  
        if (tombstone) {
          const mineralType = Object.keys(tombstone.store).find(type => type !== RESOURCE_ENERGY);
          if (mineralType && tombstone.store[mineralType] > 0) {
            if (creep.withdraw(tombstone, mineralType) === ERR_NOT_IN_RANGE) {
              creep.travelTo(tombstone, { visualizePathStyle: { stroke: '#ff00ff' } });
            }
            return;
          }
        }
      }
  
      // If nothing is available, switch to delivery
      if (creep.store.getUsedCapacity() > 0) creep.memory.picking = false;
  
    } else {
      // Deliver minerals first, then energy
      if (creep.room.storage) {
        const mineralType = Object.keys(creep.store).find(type => type !== RESOURCE_ENERGY);
        if (mineralType && creep.store[mineralType] > 0) {
          if (creep.transfer(creep.room.storage, mineralType) === ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#ff00ff' } });
          }
          return;
        }
      }
  
      // Deliver energy to containers first
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
      });
  
      if (container) {
        if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.travelTo(container, { visualizePathStyle: { stroke: '#0af' } });
        }
      } else {
        // Deliver energy to towers next
        const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
  
        if (tower) {
          if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(tower, { visualizePathStyle: { stroke: '#0af' } });
          }
        }
      }
  
      // If empty, switch back to picking mode
      if (creep.store.getUsedCapacity() === 0) creep.memory.picking = true;
    }
  }
};

module.exports = rolePicker;
