const roleRemoteHarvester = {
  run: function (creep) {
    try {
      var targetRoom = creep.memory.targetRoom;
      if (!targetRoom) return;

      // === Step 1: Travel to target room ===
      if (creep.room.name !== targetRoom) {
        const exitDir = creep.room.findExitTo(targetRoom);
        const exit = creep.pos.findClosestByPath(exitDir);
        if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
        return;
      }

      // === Step 2: Assign source if needed ===
      if (!creep.memory.sourceId) {
        var sources = creep.room.find(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
          var nearby = sources[i].pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function (c) {
              return c.memory.role === 'remoteHarvester';
            }
          });
          if (nearby.length === 0) {
            creep.memory.sourceId = sources[i].id;
            break;
          }
        }
      }

      var source = Game.getObjectById(creep.memory.sourceId);
      if (!source) return;

      // === Step 3: Identify harvesting position ===
      var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: function (s) {
          return s.structureType === STRUCTURE_CONTAINER;
        }
      })[0];

      var targetPos = container ? container.pos : null;

      if (!targetPos) {
        var positions = [];
        for (var dx = -1; dx <= 1; dx++) {
          for (var dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            var pos = new RoomPosition(source.pos.x + dx, source.pos.y + dy, source.pos.roomName);
            var terrain = creep.room.lookForAt(LOOK_TERRAIN, pos);
            if (terrain.length > 0 && terrain[0] !== 'wall') {
              positions.push(pos);
            }
          }
        }
        if (positions.length > 0) {
          targetPos = creep.pos.findClosestByPath(positions);
        }
      }

      if (!targetPos) return;

      // === Step 4: Move to harvesting position ===
      if (!creep.pos.isEqualTo(targetPos)) {
        creep.moveTo(targetPos, {
          visualizePathStyle: { stroke: '#ffaa00' },
          ignoreCreeps: true,
          range: 0
        });
        return;
      }

      // === Step 5: Create container if it doesn't exist ===
      var site = targetPos.lookFor(LOOK_CONSTRUCTION_SITES).find(function (s) {
        return s.structureType === STRUCTURE_CONTAINER;
      });

      if (!container && !site) {
        targetPos.createConstructionSite(STRUCTURE_CONTAINER);
        return;
      }

      // === Step 6: Build site ===
      if (site && creep.store[RESOURCE_ENERGY] > 0) {
        if (creep.build(site) === ERR_NOT_IN_RANGE) {
          creep.moveTo(site, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
      }

      // === Step 7: Repair container if damaged ===
      if (container && container.hits < 150000 && creep.store[RESOURCE_ENERGY] > 0) {
        if (creep.repair(container) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container, { visualizePathStyle: { stroke: '#ffcc00' } });
        }
        return;
      }

      // === Step 8: Drop energy if full ===
      if (creep.store.getFreeCapacity() === 0 && container) {
        creep.drop(RESOURCE_ENERGY);
        return;
      }

      // === Step 9: Harvest ===
      if (creep.store.getFreeCapacity() > 0 && source) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }

    } catch (e) {
      console.log('Error in role.remoteHarvester.run: ' + e);
    }
  }
};

module.exports = roleRemoteHarvester;