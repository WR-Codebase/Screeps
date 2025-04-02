const roleHauler = {
  run: function (creep) {
    const wasDelivering = creep.memory.delivering;

    if (creep.store.getFreeCapacity() > 0 && !creep.memory.delivering) {
      this.collectEnergy(creep);
    } else if (creep.store.getUsedCapacity() === 0) {
      this.collectEnergy(creep);
      creep.memory.delivering = false;
    } else {
      creep.memory.delivering = true;
      this.deliverEnergy(creep);
    }

    if (wasDelivering !== creep.memory.delivering) {
      creep.say(creep.memory.delivering ? '🚚 deliver' : '🔄 collect');
    }
  },

  collectEnergy: function (creep) {
    const source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
      console.log(`Hauler ${creep.name} has an invalid source ID: ${creep.memory.sourceId}`);
      return;
    }

    const rangeToSource = creep.pos.getRangeTo(source);

    /*
    if (rangeToSource <= 1) {
      const directionFromSource = source.pos.getDirectionTo(creep.pos);
      creep.move(directionFromSource); // Move away from source
      return;
    }*/

    // 🍯 Look for dropped energy within 1 tile
    const droppedEnergy = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
      filter: (r) => r.resourceType === RESOURCE_ENERGY
    });

    if (droppedEnergy.length > 0) {
      if (creep.pickup(droppedEnergy[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedEnergy[0], { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }

    // 🍯 Look for containers within 1 tile
    const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s) =>
        s.structureType === STRUCTURE_CONTAINER &&
        s.store[RESOURCE_ENERGY] > 0
    });

    if (containers.length > 0) {
      if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(containers[0], { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }

    // 🍂 If nothing to collect and not yet close enough, get into position
    if (rangeToSource > 2) {
      creep.moveTo(source, {
        range: 2,
        visualizePathStyle: { stroke: '#ccc' },
        ignoreCreeps: true
      });
    }

    if (rangeToSource <= 1) {
      const directionFromSource = source.pos.getDirectionTo(creep.pos);
      creep.move(directionFromSource); // Move away from source
      return;
    }

    // If after all that the creep is not empty, switch to delivering
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      creep.memory.delivering = true;
      creep.say('🚚 deliver');
    } 
  },

  deliverEnergy: function (creep) {
    // 🏰 Priority: Towers first
    const towers = creep.room.find(FIND_STRUCTURES, {
      filter: (s) =>
        s.structureType === STRUCTURE_TOWER &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });
  
    if (towers.length > 0) {
      towers.sort((a, b) =>
        (a.store[RESOURCE_ENERGY] || 0) - (b.store[RESOURCE_ENERGY] || 0)
      );
      const target = towers[0];
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }
  
    // 🏦 Storage
    const storage = creep.room.storage;
    if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: '#0af' } });
      }
      return;
    }
  
    // 📦 Fallback: Containers NOT near sources
    const containers = creep.room.find(FIND_STRUCTURES, {
      filter: s =>
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
        !s.pos.findInRange(FIND_SOURCES, 1).length
    });
  
    if (containers.length > 0) {
      const target = creep.pos.findClosestByPath(containers);
      if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#0af' } });
      }
    }
  }
};

module.exports = roleHauler;