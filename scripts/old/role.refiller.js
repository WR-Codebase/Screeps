const jobs = require('jobs');

const roleRefiller = {
  run: function (creep) {
    if (creep.memory.refilling && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.refilling = false;
      creep.say('🔄 collect');
      //console.log(creep.name + ' collecting energy');
    }
    if (!creep.memory.refilling && creep.store.getFreeCapacity() === 0) {
      creep.memory.refilling = true;
      creep.say('⚡ refill');
      //console.log(creep.name + ' refilling structures');
    }

    if (creep.memory.refilling) {
      // First, try to find the nearest spawn or extension that needs refilling
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_EXTENSION) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });

      // If no spawn or extension needs refilling, then look for towers
      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
        });
      }

      // If a target is found, attempt to transfer energy to it
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#0ff' } });
        }
      } else {
        // No refill targets found, perform hauling tasks
      }
    } else {
      // Try to find the closest container or storage with energy
      let source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_CONTAINER
            || s.structureType === STRUCTURE_STORAGE)
          && s.store[RESOURCE_ENERGY] > 0
      });

      // If no container/storage found, look for dropped resources, tombstones, or ruins
      if (!source) {
        source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
          filter: (r) => r.resourceType === RESOURCE_ENERGY
        }) || creep.pos.findClosestByPath(FIND_TOMBSTONES, {
          filter: (t) => t.store[RESOURCE_ENERGY] > 0
        }) || creep.pos.findClosestByPath(FIND_RUINS, {
          filter: (r) => r.store[RESOURCE_ENERGY] > 0
        });
      }

      // Attempt to collect energy from the identified source
      if (source) {
        if (source instanceof Resource && creep.pickup(source) === ERR_NOT_IN_RANGE ||
          source.store && creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#0ff' } });
        }
      } else {
        // If no sources found, attempt to harvest from an energy source as a last resort
        const closestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (closestSource && creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
          creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#0ff' } });
        }
      }
    }
  }
};

module.exports = roleRefiller;
