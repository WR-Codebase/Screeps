const roleRemoteHauler = {
  run: function(creep) {
      if (!creep.memory.hauling && creep.store.getFreeCapacity() === 0) {
          creep.memory.hauling = true;
      } else if (creep.memory.hauling && creep.store[RESOURCE_ENERGY] === 0) {
          creep.memory.hauling = false;
      }

      if (creep.memory.hauling) {
          this.returnToBase(creep);
      } else {
          this.collectEnergy(creep);
      }
  },

  collectEnergy: function(creep) {
      if (creep.room.name === 'E55S17') {
          let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
              filter: r => r.resourceType === RESOURCE_ENERGY
          });
          if (droppedEnergy.length > 0) {
              if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#ffaa00' } });
              }
          }
          // container within 3 tiles of source 5bbcb05b9099fc012e63c04d
          let sourceId = '5bbcb05b9099fc012e63c04d';
          let source = Game.getObjectById(sourceId);
          let containers = source.pos.findInRange(FIND_STRUCTURES, 3, {
              filter: s => s.structureType === STRUCTURE_CONTAINER
          });
          if (containers.length > 0) {
              let container = containers[0];
              if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
              }
          }

      } else {
          this.moveThroughRooms(creep, ['E56S17', 'E55S17', 'E55S16', 'E55S15']);
      }
  },

  returnToBase: function(creep) {
      if (creep.room.name === 'E56S17') {
          let storage = creep.room.storage || creep.room.find(FIND_MY_SPAWNS)[0];
          if (storage && creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
          }
      } else {
          this.moveThroughRooms(creep, ['E55S15', 'E55S16', 'E55S17', 'E56S17']);
      }
  },

  moveThroughRooms: function(creep, route) {
      let nextRoom = route.find(r => r !== creep.room.name);
      if (nextRoom) {
          let exit = creep.room.findExitTo(nextRoom);
          let exitPos = creep.pos.findClosestByRange(exit);
          creep.moveTo(exitPos, { visualizePathStyle: { stroke: '#00ff00' } });
          this.repairRoad(creep);
      }
  },

  repairRoad: function(creep) {
      const road = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax * 0.8);
      if (road) {
          creep.repair(road);
      }
  }
};

module.exports = roleRemoteHauler;
