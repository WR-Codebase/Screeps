const jobs = require('jobs');

const rolePicker = {
  roleName: 'resourcePicker',
  bodyTemplate: [CARRY, MOVE, CARRY, MOVE],
  defaultMode: 'picking',

  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.memory.picking === undefined) creep.memory.picking = false;

    // Switch between collecting and delivering
    if (creep.memory.picking && creep.store.getFreeCapacity() === 0) {
      creep.memory.picking = false;
      creep.say('🚚 Delivering');
    }
    if (!creep.memory.picking && creep.store.getUsedCapacity() === 0) {
      creep.memory.picking = true;
      creep.say('🔄 Collect');
    }

    if (creep.memory.picking) {
      this.collectEnergy(creep);
    } else {
      this.deliverEnergy(creep);
    }
  },

  collectEnergy: function (creep) {
    // Prioritize picking up resources from tombstones first
    let target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
      filter: (t) => _.sum(t.store) > 0
    });

    if (target) {
      let resourceType = Object.keys(target.store).find(type => target.store[type] > 0);
      if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
      }
      return;
    }

    // Next, check ruins for resources
    target = creep.pos.findClosestByPath(FIND_RUINS, {
      filter: (r) => _.sum(r.store) > 0
    });

    if (target) {
      let resourceType = Object.keys(target.store).find(type => target.store[type] > 0);
      if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
      }
      return;
    }

    // Check for dropped energy
    target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });

    if (target) {
      if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      return;
    }

    // Check for containers near sources
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER &&
                     s.store[RESOURCE_ENERGY] > 0 &&
                     s.pos.findInRange(FIND_SOURCES, 1).length > 0
    });

    if (target) {
      if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }

    // If no other sources of energy are found, collect from storage
    if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
      if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      return;
    }
  },

  deliverEnergy: function (creep) {
    // First, deliver minerals to storage
    if (creep.room.storage) {
      let mineralType = Object.keys(creep.store).find(type => type !== RESOURCE_ENERGY);
      if (mineralType && creep.store[mineralType] > 0) {
        if (creep.transfer(creep.room.storage, mineralType) === ERR_NOT_IN_RANGE) {
          creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#ff00ff' } });
        }
        return;
      }
    }

    // Deliver energy to containers that are **not** near sources
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER &&
                     s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                     !s.pos.findInRange(FIND_SOURCES, 1).length
    });

    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }

    // Deliver energy to towers
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER &&
                     s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }

    // If there is still energy, switch to nursing until empty
    if (creep.store[RESOURCE_ENERGY] > 0) {
      jobs.nourish(creep);
      return;
    }

    // If no delivery targets are found, switch back to picking mode
    if (creep.store.getUsedCapacity() === 0) {
      creep.memory.picking = true;
    }
  }
};

module.exports = rolePicker;