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
    let target;

    // 1️⃣ Prioritize picking up dropped **minerals**
    target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType !== RESOURCE_ENERGY });
    if (target) {
      if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      return;
    }

    // 2️⃣ Pick up **dropped energy**
    target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (r) => r.resourceType === RESOURCE_ENERGY });
    if (target) {
      if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      return;
    }

    // 3️⃣ Withdraw from **tombstones**
    target = creep.pos.findClosestByPath(FIND_TOMBSTONES, { filter: (t) => _.sum(t.store) > 0 });
    if (target) {
      let resourceType = Object.keys(target.store).find(type => target.store[type] > 0);
      if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
      }
      return;
    }

    // 4️⃣ Withdraw from **ruins**
    target = creep.pos.findClosestByPath(FIND_RUINS, { filter: (r) => _.sum(r.store) > 0 });
    if (target) {
      let resourceType = Object.keys(target.store).find(type => target.store[type] > 0);
      if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
      }
      return;
    }
  },

  deliverEnergy: function (creep) {
    let target;
    
    // Find a mineral in the creep's store (ignore energy)
    let resourceType = Object.keys(creep.store).find(type => type !== RESOURCE_ENERGY && creep.store[type] > 0);
  
    if (resourceType) {
      // Deliver minerals to storage if it exists and has space
      if (creep.room.storage && creep.room.storage.store.getFreeCapacity(resourceType) > 0) {
        if (creep.transfer(creep.room.storage, resourceType) === ERR_NOT_IN_RANGE) {
          creep.travelTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
      }
    } else {
      // No minerals, so deliver energy
  
      // Deliver energy to containers that are **not** near sources
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
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
  
      // If all containers are full, call `jobs.nourish`
      jobs.nourish(creep);
    }
  }
};

module.exports = rolePicker;