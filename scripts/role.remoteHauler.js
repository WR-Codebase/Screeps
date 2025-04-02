const roleRemoteHauler = {
  run: function (creep) {
    try {
      // 🧠 Initialize homeRoom if not set
      if (!creep.memory.homeRoom) {
        creep.memory.homeRoom = creep.room.name;
      }

      const targetRoom = creep.memory.targetRoom;
      const homeRoom = creep.memory.homeRoom;

      if (!targetRoom || !homeRoom) return;

      if (!creep.memory.delivering && creep.store.getFreeCapacity() === 0) {
        creep.memory.delivering = true;
        creep.say('🚚 haul');
      }
      if (creep.memory.delivering && creep.store.getUsedCapacity() === 0) {
        creep.memory.delivering = false;
        creep.say('🔄 collect');
      }

      // === State: Collecting from remote ===
      if (!creep.memory.delivering) {
        // If not in the target room, move to it
        if (creep.room.name !== targetRoom) {
          const exitDir = Game.map.findExit(creep.room, targetRoom);
          const exit = creep.pos.findClosestByRange(exitDir);
          creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
          return;
        }

        // 🔍 First, look for dropped energy (anywhere in the room)
        let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
          filter: (r) => r.resourceType === RESOURCE_ENERGY
        });
        if (target) {
          if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
            const path = creep.room.findPath(creep.pos, target.pos, { swampCost: 1 });
            if (path.length > 0) {
              creep.move(path[0].direction);
            }
          }
          return;
        }

        // 💀 Next, look for tombstones with any resources
        target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
          filter: (t) => _.sum(t.store) > 0
        });
        if (target) {
          const resourceType = Object.keys(target.store).find(type => target.store[type] > 0);
          if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
          }
          return;
        }

        // 🧭 Now continue with source logic
        if (!creep.memory.sourceId) {
          const sources = creep.room.find(FIND_SOURCES);
          if (sources.length > 0) {
            creep.memory.sourceId = sources[0].id;
          } else {
            return;
          }
        }

        const source = Game.getObjectById(creep.memory.sourceId);
        if (!source) return;

        // Move into position near the source
        if (creep.pos.getRangeTo(source) > 2) {
          creep.moveTo(source);
          return;
        }

        // 🍯 Withdraw from adjacent containers near source
        const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        });

        if (containers.length > 0) {
          if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0]);
          }
          return;
        }

        // 🕰️ No energy to collect
        creep.say('⏳ waiting');
      }

      // === State: Delivering ===
      else {
        if (creep.room.name !== homeRoom) {
          creep.moveTo(new RoomPosition(25, 25, homeRoom), { range: 23 });
          return;
        }

        // 🎯 Find nearest eligible container or tower (not near a source)
        const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) =>
          (
            (s.structureType === STRUCTURE_CONTAINER &&
              s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
              s.pos.findInRange(FIND_SOURCES, 1).length === 0)
            ||
            (s.structureType === STRUCTURE_TOWER &&
              s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          )
        });

        if (target) {
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }

        // 🏦 Fallback: storage if no containers or towers need energy
        const storage = creep.room.storage;
        if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }

    } catch (e) {
      console.log(`[ERROR] Remote Hauler ${creep.name}: ${e.message}`);
    }
  }
};

module.exports = roleRemoteHauler;