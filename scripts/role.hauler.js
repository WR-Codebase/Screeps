/**
 * The Hauler role is responsible for carrying energy from drop harvesters to storage or other structures.
 * @type {{run: roleHauler.run, collectEnergy: roleHauler.collectEnergy, deliverEnergy: roleHauler.deliverEnergy}}
 */
const roleHauler = {
  run: function (creep) {
    const wasDelivering = creep.memory.delivering;
    // Ensure the creep has a valid state
    if (creep.store.getFreeCapacity() > 0 && !creep.memory.delivering) {
      this.collectEnergy(creep);
    } else if (creep.store.getUsedCapacity() === 0) {
      this.collectEnergy(creep);
      creep.memory.delivering = false; // Reset state to collecting
    } else {
      creep.memory.delivering = true;
      this.deliverEnergy(creep);
    }

    if (wasDelivering !== creep.memory.delivering && creep.memory.delivering) {
      creep.say('🚚 deliver');
    } else if (wasDelivering !== creep.memory.delivering && !creep.memory.delivering) {
      creep.say('🔄 collect');
    }
  },

  collectEnergy: function (creep) {
    const source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
      console.log(`Source not found for ID: ${creep.memory.sourceId}`);
      // Handle reassignment or error
      return;
    }

    // New logic to check for and collect dropped energy within 3 tiles of the creep's position
    const nearbyDroppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });

    if (nearbyDroppedEnergy.length > 0) {
      if (creep.pickup(nearbyDroppedEnergy[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearbyDroppedEnergy[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    } else {

      // Find closest dropped energy near the assigned source
      const droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 10, {
        filter: (r) => r.resourceType === RESOURCE_ENERGY
      });

      if (droppedEnergy.length > 0) {
        if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#0af' } });
        }
      } else {
        // Consider waiting or moving to a default position near the source
      }
    }
  },
  deliverEnergy: function (creep) {
    // Deliver energy
    const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_CONTAINER
            || structure.structureType === STRUCTURE_STORAGE
            || structure.structureType === STRUCTURE_TOWER)
          && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        // Utilize PathFinder for optimized pathfinding
        const path = PathFinder.search(creep.pos, target.pos, {
          // Apply cost matrix for room to avoid obstacles and swampy areas
          roomCallback: function (roomName) {
            const room = Game.rooms[roomName];
            if (!room) return;
            const costs = new PathFinder.CostMatrix;

            room.find(FIND_STRUCTURES).forEach(function (struct) {
              if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads
                costs.set(struct.pos.x, struct.pos.y, 1);
              } else if (struct.structureType !== STRUCTURE_CONTAINER
                && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                // Avoid non-walkable structures
                costs.set(struct.pos.x, struct.pos.y, 0xff);
              }
            });
            return costs;
          }
        });
        creep.moveByPath(path.path);
      }
    }
  }
};

module.exports = roleHauler;
