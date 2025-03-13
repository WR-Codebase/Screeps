const roleRemoteWorker = {
  run: function(creep) {
      creep.memory.energyPriority = ['TOMBSTONE', 'RUIN', 'CONTAINER', 'DROPPED_RESOURCE', 'SOURCE'];
      const travelRoute = ['E56S17', 'E55S17', 'E55S16', 'E55S15'];

      if (!creep.memory.status) {
          creep.memory.status = '🔄collect';
      }

      // Currently, as soon as the creep has any energy it switches to building when it should continue collecting until full
      // To fix this, we need to check is creep is full, 
      if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        creep.memory.status = '🚧building';
      } else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        creep.memory.status = '🔄collect';
      }

      if (creep.memory.status === '🔄collect') {
        this.collectEnergy(creep, travelRoute);
      } else {
        this.buildAlongRoute(creep, travelRoute);
      }

      if (creep.memory.previousStatus !== creep.memory.status) {
          delete creep.memory.targetId;
          creep.say(creep.memory.status);
          creep.memory.previousStatus = creep.memory.status;
      }
  },

  buildAlongRoute: function(creep, route) {
      if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
          let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
          if (constructionSite) {
              if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
              }
              creep.memory.status = '🚧building';
              return;
          }
      }
      this.moveThroughRooms(creep, route);
  },

  collectEnergy: function(creep, route) {
      if (creep.room.name !== 'E55S16') {
          let target = null;

          // Prioritize dropped energy
          if (!target) {
              target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
          }

          // If no dropped energy, check containers
          if (!target) {
              target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                  filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
              });
          }

          // If no containers, check sources with open adjacent tiles
          if (!target) {
              target = creep.pos.findClosestByPath(FIND_SOURCES, {
                  filter: s => s.energy > 0 && this.hasOpenTile(s)
              });
          }

          // Move to and collect energy until full
          if (target) {
              if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                  if (creep.pickup(target) === ERR_NOT_IN_RANGE || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE || creep.harvest(target) === ERR_NOT_IN_RANGE) {
                      creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                  }
                  creep.memory.status = '🔄collect';
                  return;
              }
          }
      } else {
        // Creep is in the source keeper room, escape north or south to the nearest exit then havrvest energy in the next room
        let northExit = creep.room.findExitTo('E55S15');
        let southExit = creep.room.findExitTo('E55S17');

        // Pick the closest one to creep position
        let exit = creep.pos.findClosestByPath([northExit, southExit]);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
      this.moveThroughRooms(creep, route);
  },

  hasOpenTile: function(source) {
      let terrain = new Room.Terrain(source.room.name);
      let positions = [
          { x: source.pos.x - 1, y: source.pos.y - 1 }, { x: source.pos.x, y: source.pos.y - 1 }, { x: source.pos.x + 1, y: source.pos.y - 1 },
          { x: source.pos.x - 1, y: source.pos.y }, { x: source.pos.x + 1, y: source.pos.y },
          { x: source.pos.x - 1, y: source.pos.y + 1 }, { x: source.pos.x, y: source.pos.y + 1 }, { x: source.pos.x + 1, y: source.pos.y + 1 }
      ];
      return positions.some(pos => 
          terrain.get(pos.x, pos.y) === 0 && 
          !source.room.lookForAt(LOOK_CREEPS, pos.x, pos.y).length && 
          !source.room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y).length 
      );
  },

  moveThroughRooms: function(creep, route) {
      let currentIndex = route.indexOf(creep.room.name);
      if (currentIndex !== -1 && currentIndex < route.length - 1) {
          let nextRoom = route[currentIndex + 1];
          let exit = creep.room.findExitTo(nextRoom);
          let exitPos = creep.pos.findClosestByPath(exit);
          if (exitPos) creep.moveTo(exitPos, { visualizePathStyle: { stroke: '#00ff00' } });
      }
  }
};

module.exports = roleRemoteWorker;