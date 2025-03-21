/**
 * The Hauler role is responsible for carrying energy from drop harvesters to storage or other structures.
 */
const roleHauler = {
  run: function (creep) {
    const wasDelivering = creep.memory.delivering;

    if (creep.store.getFreeCapacity() > 0 && !creep.memory.delivering) {
      this.collectEnergy(creep);
    } else if (creep.store.getUsedCapacity() === 0) {
      this.collectEnergy(creep);
      creep.memory.delivering = false;
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

    const droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
      filter: (resource) => resource.resourceType === RESOURCE_ENERGY
    });

    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
        && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });

    if (droppedEnergy.length > 0) {
      if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
        creep.travelTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
      return;
    }

    if (container.length > 0) {
      if (creep.withdraw(container[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(container[0], { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
      return;
    }

    if (creep.room.storage && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
    }
  },

  deliverEnergy: function (creep) {
    const nurses = creep.room.find(FIND_MY_CREEPS, {
      filter: c => c.memory.role === 'nurse'
    });

    const fillExtensions = creep.room.energyAvailable < creep.room.energyCapacityAvailable;

    let delivered = false;

    // Containers (not adjacent to sources) first
    let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_CONTAINER
        && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        && s.pos.findInRange(FIND_SOURCES, 1).length === 0
    });

    if (container) {
      if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(container, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
      delivered = true;
    }

    // Only fill extensions if no nurses are present
    if (!delivered && nurses.length === 0 && fillExtensions) {
      const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
      if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
      delivered = true;
    }

    // Then Towers
    if (!delivered) {
      const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_TOWER)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
      if (tower && creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(tower, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
      delivered = true;
    }

    // Finally, drop into storage if nothing else needs it
    if (!delivered && creep.room.storage && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
      }
    }
  }
};

module.exports = roleHauler;
