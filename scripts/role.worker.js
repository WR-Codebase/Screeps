const jobs = require('./jobs');

const roleWorker = {
  role: 'worker',
  status: 'idle',
  bodyTemplate: [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE],

  run: function (creep) {
    try {
      const oldStatus = creep.memory.status;
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
          jobs.build(creep);
          creep.memory.status = '🚧building';
        } else {
          jobs.upgrade(creep);
          creep.memory.status = '⚡upgrading';
        }
      } else {
        creep.memory.status = '🔄collect';

        let target = null;

        // 1. Dropped energy NOT near a source, within 10 tiles
        let dropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10, {
          filter: r => r.resourceType === RESOURCE_ENERGY && r.pos.findInRange(FIND_SOURCES, 1).length === 0
        });

        if (dropped.length > 0) {
          target = creep.pos.findClosestByPath(dropped);
          if (target && creep.pickup(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, stuckValue: 2 });
          }
        }

        // 2. Tombstones with energy within 5 tiles
        if (!target) {
          const tombstones = creep.pos.findInRange(FIND_TOMBSTONES, 5, {
            filter: t => t.store[RESOURCE_ENERGY] > 0
          });
          if (tombstones.length > 0) {
            target = creep.pos.findClosestByPath(tombstones);
            if (target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, stuckValue: 2 });
            }
          }
        }

        // 3 + 4. Closest of container OR storage
        if (!target) {
          const containers = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
          });

          const container = creep.pos.findClosestByPath(containers);
          const storage = (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0)
            ? creep.room.storage
            : null;

          if (container && storage) {
            const containerPath = creep.pos.getRangeTo(container);
            const storagePath = creep.pos.getRangeTo(storage);
            target = containerPath <= storagePath ? container : storage;
          } else {
            target = container || storage;
          }

          if (target && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, stuckValue: 2 });
          }
        }

        // 5. Any dropped energy
        if (!target) {
          target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY
          });
          if (target && creep.pickup(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, stuckValue: 2 });
          }
        }

        // 6. Finally, harvest from active sources if there are no haversters nearby
        if (!target) {
          const sources = creep.room.find(FIND_SOURCES_ACTIVE);
          const nearbyHarvesters = creep.pos.findInRange(FIND_CREEPS, 1, {
            filter: c => c.memory.role === 'harvester'
          });
          if (sources.length > 0 && nearbyHarvesters.length === 0) {
            target = sources[0];
            if (target && creep.harvest(target) === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: true, stuckValue: 2 });
            }
          }
        }
      }
      if (oldStatus !== creep.memory.status) {
        delete creep.memory.targetId;
        creep.say(creep.memory.status);
      }
    } catch (e) {
      console.log(`Error in role.worker.run: ${e}`);
    }
  }
};

module.exports = roleWorker;
