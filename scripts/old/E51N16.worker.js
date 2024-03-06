const jobs = require('./jobs');

const roleE51N16Worker = {

  /** @param {Creep} creep **/
  run: function (creep) {
    // Define target room
    const targetRoom = 'E51N16';

    // Move to the target room if not already there
    if (creep.room.name !== targetRoom) {
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
      console.log(`Creep ${creep.name} moving to target room ${targetRoom}`);
      return;
    }

    // In target room, determine behavior based on energy capacity
    if (creep.store.getUsedCapacity() === 0) {
      // Harvest energy if capacity is not full
      this.collect(creep);
    } else {
      // Prioritize building, then upgrading the controller
      const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
      if (constructionSite) {
        if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
          creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      } else {
        // No construction sites, try upgrading controller
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  },

  collect: function (creep) {
    let target = null;

    console.log(`[${creep.name}] Searching for energy sources. Priority: ${creep.memory.energyPriority}`);
    const priorityTargets = creep.memory.energyPriority || ['DROPPED_RESOURCE', 'TOMBSTONE', 'RUIN', 'CONTAINER', 'STORAGE', 'SOURCE'];

    for (const targetType of priorityTargets) {
      console.log(`[${creep.name}] Checking for: ${targetType}`);
      switch (targetType) {
        case 'DROPPED_RESOURCE':
          target = this.findEnergyDropped(creep);
          break;
        case 'TOMBSTONE':
        case 'RUIN':
          target = this.findEnergyInStructures(creep, targetType);
          break;
        case 'CONTAINER':
        case 'STORAGE':
          target = this.findEnergyInStorage(creep, targetType);
          break;
        case 'SOURCE':
          target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
          break;
      }

      if (target) {
        console.log(`[${creep.name}] Target found: ${targetType} at ${target.pos}`);
        break; // Exit loop if a target is found
      }
    }

    if (!target) {
      console.log(`[${creep.name}] No suitable energy sources found.`);
      return; // Exit if no suitable target is found
    }

    // Attempt to interact with the target based on its type
    this.interactWithTarget(creep, target);
  },

  findEnergyDropped: function(creep) {
    return creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });
  },

  findEnergyInStructures: function (creep, structureType) {
    // Simplified structure search logic for tombstones and ruins
    return creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType === structureType && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
  },

  findEnergyInStorage: function (creep, storageType) {
    // Simplified logic for finding energy in containers and storages
    return creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) => s.structureType === storageType && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    });
  },

  interactWithTarget: function (creep, target) {
    if (target instanceof Resource && creep.pickup(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#0fa' } });
    } else if ((target instanceof Tombstone || target instanceof Ruin || target instanceof StructureContainer || target instanceof StructureStorage) && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#0fa' } });
    } else if (target instanceof Source && creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {
        visualizePathStyle: { stroke: '#0fa' }
      });
    }
  }
};

module.exports = roleE51N16Worker;
