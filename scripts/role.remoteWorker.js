const roleRemoteWorker = {
    run: function (creep) {
      try {
        const targetRoom = creep.memory.targetRoom;
        if (!targetRoom) {
          console.log(`[ERROR] Remote Worker ${creep.name} missing targetRoom!`);
          return;
        }
  
        // Travel to target room
        if (creep.room.name !== targetRoom) {
            const exitDir = Game.map.findExit(creep.room, targetRoom);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
            return;
          }
  
        const oldStatus = creep.memory.status;
  
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
          // 🛠 Build if sites exist, else upgrade
          const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
          if (site) {
            creep.memory.status = '🚧building';
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
              creep.moveTo(site, { visualizePathStyle: { stroke: '#ffffff' }, range: 3});
            }
          } else {
            creep.memory.status = '⚡upgrading';
            const controller = creep.room.controller;
            if (controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
              creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          }
        } else {
          creep.memory.status = '🔄collect';
          this.collectEnergy(creep);
        }
  
        if (oldStatus !== creep.memory.status) {
          delete creep.memory.targetId;
          creep.say(creep.memory.status);
        }
      } catch (e) {
        console.log(`[ERROR] Remote Worker ${creep.name}: ${e.message}`);
      }
    },
  
    collectEnergy: function (creep) {
      let target = null;
  
      // 1. Dropped energy NOT near a source, within 10 tiles
      const dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10, {
        filter: r => r.resourceType === RESOURCE_ENERGY && r.pos.findInRange(FIND_SOURCES, 1).length === 0
      });
      if (dropped.length > 0) {
        target = creep.pos.findClosestByPath(dropped);
        if (target && creep.pickup(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true });
        }
        return;
      }
  
      // 2. Tombstones with energy within 5 tiles
      const tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 5, {
        filter: t => t.store[RESOURCE_ENERGY] > 0
      });
      if (tombstones.length > 0) {
        target = creep.pos.findClosestByPath(tombstones);
        if (target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true });
        }
        return;
      }
  
      // 3. Container or 4. Storage
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
      });
      const container = creep.pos.findClosestByPath(containers);
      const storage = (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) ? creep.room.storage : null;
  
      if (container && storage) {
        const containerDist = creep.pos.getRangeTo(container);
        const storageDist = creep.pos.getRangeTo(storage);
        target = containerDist <= storageDist ? container : storage;
      } else {
        target = container || storage;
      }
  
      if (target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true });
        return;
      }
  
      // 5. Any dropped energy
      target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: r => r.resourceType === RESOURCE_ENERGY
      });
      if (target && creep.pickup(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true });
        return;
      }
  
      // 6. Harvest from a source if no harvesters around
      const sources = creep.room.find(FIND_SOURCES_ACTIVE);
      const nearbyHarvesters = creep.pos.findInRange(FIND_CREEPS, 1, {
        filter: c => c.memory.role === 'harvester'
      });
      if (sources.length > 0 && nearbyHarvesters.length === 0) {
        target = sources[0];
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true });
        }
      }
    }
  };
  
  module.exports = roleRemoteWorker;