const roleRemoteWorker = {
  run: function(creep) {
    try {
      creep.memory.energyPriority = ['STORAGE','TOMBSTONE','RUIN','CONTAINER_STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
      const travelRoute = ['E56S17', 'E55S17', 'E55S18'];

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
    } catch (e) {
      console.log(`[ERROR] Remote Worker ${creep.name} encountered an error: ${e.message}`);
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

    let target = null;
    const energyPriority = creep.memory.energyPriority || ['STORAGE','TOMBSTONE','RUIN','CONTAINER_STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];

    for (const priority of energyPriority) {
        switch (priority) {
            case 'STORAGE':
                target = creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0 ? creep.room.storage : null;
                break;
            case 'TOMBSTONE':
                target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                    filter: tombstone => tombstone.store[RESOURCE_ENERGY] > 0
                });
                break;
            case 'RUIN':
                target = creep.pos.findClosestByPath(FIND_RUINS, {
                    filter: ruin => ruin.store[RESOURCE_ENERGY] > 0
                });
                break;
            case 'CONTAINER_STORAGE':
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
                });
                break;
            case 'DROPPED_RESOURCE':
                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: res => res.resourceType === RESOURCE_ENERGY
                });
                break;
            case 'SOURCE':
                target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
                    filter: source => this.hasOpenTile(source)
                });
                break;
        }
        if (target) break; // Stop searching once a valid energy source is found
    }

    // 🏗️ Move to and collect energy until full
    if (target) {
        let actionResult;
        if (target instanceof Resource) {
            actionResult = creep.pickup(target);
        } else if (target instanceof Structure || target instanceof Tombstone || target instanceof Ruin) {
            actionResult = creep.withdraw(target, RESOURCE_ENERGY);
        } else if (target instanceof Source) {
            actionResult = creep.harvest(target);
        }

        if (actionResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        creep.memory.status = '🔄collect';
    } else {
        this.moveThroughRooms(creep, route);
    }
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