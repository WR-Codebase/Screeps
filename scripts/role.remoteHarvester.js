const roleRemoteHarvester = {
  run: function (creep) {
    try {
      // Ensure harvesting state is initialized
      if (creep.memory.harvesting === undefined) {
        creep.memory.harvesting = true;
      }

      // When empty switch to harvesting = true, when full switch to harvesting = false
      if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
        creep.memory.harvesting = false;
      } else if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.harvesting = true;
      }

      // If harvesting, harvest energy
      if (creep.memory.harvesting) {
        this.harvestEnergy(creep);
      } else {

        // look at creep's position for structure container
        let container = creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_CONTAINER);
        // If it exists and is not full health, repair it until it is fully repaired, then resume harvesting

        
        // If no container exists, check for a construction site at the location
        // If there's no construction site, build a container
        // If the container is full health, harvest energy
      }
    } catch (e) {
      console.log(`Error in roleRemoteHarvester.run(): ${e}`);
    }
  },

  harvestEnergy: function (creep) {
    try {
      console.log(`Harvesting energy ${creep.name}`);
      if (creep.room.name === 'E55S17') {

        // Harvest source `5bbcb05b9099fc012e63c04d`
        let source = creep.room.find(FIND_SOURCES, {
          filter: s => s.id === '5bbcb05b9099fc012e63c04d'
        });

        if (creep.harvest(source[0]) === ERR_NOT_IN_RANGE) {
          creep.travelTo(source[0], {
            visualizePathStyle: { stroke: '#fa0' },
            ignoreCreeps: false,
            reusePath: 20,  // Caches path for 20 ticks
            maxOps: 100      // Limits CPU spent on pathfinding
          });
        }
        } else {
        this.moveThroughRooms(creep, ['E56S17', 'E55S17', 'E55S16', 'E55S15']);
      }
    } catch (e) {
      console.log(`Error in roleRemoteHarvester.harvestEnergy(): ${e}`);
    }
  },

  buildContainer: function (creep) {
    try {
      console.log(`Building container ${creep.name}`);
      let source = Game.getObjectById(creep.memory.sourceId);
      if (!source) {
        this.harvestEnergy(creep);
        return;
      }

      if (creep.store[RESOURCE_ENERGY] === 0) {
        // Look for dropped energy within 3 tiles
        let droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3, {
          filter: r => r.resourceType === RESOURCE_ENERGY
        });

        if (droppedEnergy.length > 0) {
          if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }

        // If no dropped energy is found, resume harvesting until full
        this.harvestEnergy(creep);
        return;
      }

      // Find a valid adjacent tile for a container
      let positions = [
        { x: source.pos.x - 1, y: source.pos.y - 1 }, { x: source.pos.x, y: source.pos.y - 1 }, { x: source.pos.x + 1, y: source.pos.y - 1 },
        { x: source.pos.x - 1, y: source.pos.y }, { x: source.pos.x + 1, y: source.pos.y },
        { x: source.pos.x - 1, y: source.pos.y + 1 }, { x: source.pos.x, y: source.pos.y + 1 }, { x: source.pos.x + 1, y: source.pos.y + 1 }
      ];

      let bestPosition = null;

      for (let pos of positions) {
        let terrain = new Room.Terrain(creep.room.name).get(pos.x, pos.y);
        let structures = creep.room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
        let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y);

        if ((terrain === TERRAIN_MASK_SWAMP || terrain === 0) &&
          !structures.some(s => s.structureType === STRUCTURE_CONTAINER) &&
          sites.length === 0) {
          bestPosition = pos;
          break;
        }
      }

      if (bestPosition) {
        creep.room.createConstructionSite(bestPosition.x, bestPosition.y, STRUCTURE_CONTAINER);
      } else {
        // If a construction site exists, move towards and build it
        let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        });

        if (constructionSite) {
          if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
            creep.moveTo(constructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    } catch (e) {
      console.log(`Error in roleRemoteHarvester.buildContainer(): ${e}`);
    }
  },

  moveThroughRooms: function (creep, route) {
    try {
      let currentIndex = route.indexOf(creep.room.name);

      // If not in the expected route, move toward the first room in the route
      if (currentIndex === -1) {
        let exit = creep.room.findExitTo(route[0]);
        let exitPos = creep.pos.findClosestByPath(exit);
        if (exitPos) creep.moveTo(exitPos, { visualizePathStyle: { stroke: '#00ff00' } });
        return;
      }

      // Move to the next room in the route
      if (currentIndex < route.length - 1) {
        let nextRoom = route[currentIndex + 1];
        let exit = creep.room.findExitTo(nextRoom);
        let exitPos = creep.pos.findClosestByPath(exit);
        if (exitPos) creep.moveTo(exitPos, { visualizePathStyle: { stroke: '#00ff00' } });
      }
    } catch (e) {
      console.log(`Error in roleRemoteHarvester.moveThroughRooms(): ${e}`);
    }
  }
};

module.exports = roleRemoteHarvester;