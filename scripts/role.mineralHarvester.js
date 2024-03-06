const roleMineralHarvester = {

  /** @param {Creep} creep **/
  run: function (creep) {

    // Check if creep is bringing minerals to a structure or needs to harvest/collect
    if (creep.memory.delivering && creep.store.getUsedCapacity() === 0) {
      creep.memory.delivering = false;
    }
    if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
      creep.memory.delivering = true;
    }

    if (creep.memory.delivering) {
      // Find nearest lab to deliver
      const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_STORAGE
      });
      if (target) {
        for (const resourceType in creep.store) {
          if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#afa' } });
            break;
          }
        }
      }
    } else {
      // Collect dropped minerals or from tombstones
      let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType !== RESOURCE_ENERGY
      });
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
          filter: (t) => _.sum(t.store) > 0
            && _.some(Object.keys(t.store), k => k !== RESOURCE_ENERGY)
        });
      }
      if (target) {
        for (const resourceType in target.store) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE
            || creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
            break;
          }
        }
      } else {
        // Harvest from Extractor
        const extractor = creep.room.find(FIND_STRUCTURES, {
          filter: { structureType: STRUCTURE_EXTRACTOR }
        });
        const mineral = extractor.length > 0 ? creep.room.find(FIND_MINERALS)[0] : null;
        if (mineral && creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
          creep.moveTo(mineral, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    }
  }
};

module.exports = roleMineralHarvester;
