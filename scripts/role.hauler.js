const Traveler = require('Traveler');
/**
 * The Hauler role is responsible for carrying energy from drop harvesters to storage or other structures.
 * @type {{run: roleHauler.run, collectEnergy: roleHauler.collectEnergy, deliverEnergy: roleHauler.deliverEnergy}}
 */
const roleHauler = {
  run: function (creep) {
    const wasDelivering = creep.memory.delivering;
    // Ensure the creep has a valid state
    if (creep.store.getFreeCapacity() > 0 && !creep.memory.delivering) {
      this.collectEnergy(creep);
    } else if (creep.store.getUsedCapacity() === 0) {
      this.collectEnergy(creep);
      creep.memory.delivering = false; // Reset state to collecting
    } else {
      creep.memory.delivering = true;
      this.deliverEnergy(creep);
    }

    if (wasDelivering !== creep.memory.delivering && creep.memory.delivering) {
      creep.say('🚚 deliver');
    } else if (wasDelivering !== creep.memory.delivering && !creep.memory.delivering) {
      creep.say('🔄 collect');
    }
  },

  collectEnergy: function (creep) {
    const source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
      console.log(`Hauler ${creep.name} has an invalid source ID: ${creep.memory.sourceId}`);
      return;
    }
  
    // Look for dropped energy within 1 tile of the assigned source
    const droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
      filter: (resource) => resource.resourceType === RESOURCE_ENERGY
    });
  
    // Move to the dropped energy and pick it up
    if (droppedEnergy.length > 0) {
      if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
        creep.travelTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }
  },
  deliverEnergy: function (creep) {
    // Tower first
    const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_TOWER)
          && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    }) || [];
    if (tower && creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.travelTo(tower, { visualizePathStyle: { stroke: '#0af' } });
    } else {
      // Then container
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_CONTAINER)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
      if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(container, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: false });
      } else {
        // If there is a storage with available capacity, deliver to it, otherwise deliver to the next spawn with capacity

        if (creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: false });
          }
        }

        const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_STORAGE)
              && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
        });
        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: false });
          }
        }
      }
    }
  }
};

module.exports = roleHauler;
