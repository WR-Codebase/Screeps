const roleEnergyTransporter = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // Check if the creep is transporting and its cargo is empty, then reset to loading state
    if (creep.memory.transporting && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.transporting = false;
      creep.say('🔄 load');
    }
    // If the creep is not transporting and is fully loaded, set to transporting state
    if (!creep.memory.transporting && creep.store.getFreeCapacity() === 0) {
      creep.memory.transporting = true;
      creep.say('🚚 deliver');
    }

    if (creep.memory.transporting) {
      // If in E51N15, find targets to deliver energy
      if (creep.room.name === 'E51N15') {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_CONTAINER
                || structure.structureType === STRUCTURE_STORAGE)
              && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
        });
        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: false });
          }
        }
      } else {
        // Move to E51N15 if not already there
        const exitDir = Game.map.findExit(creep.room, 'E51N15');
        const exit = creep.pos.findClosestByPath(exitDir);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: false });
      }
    } else {
      // If in E51N16, load energy from storage
      if (creep.room.name === 'E51N16') {
        const storage = Game.rooms['E51N16'].storage;
        if (storage && creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage, { visualizePathStyle: { stroke: '#0fa' } });
        }
      } else {
        // Move to E51N16 if not already there
        const exitDir = Game.map.findExit(creep.room, 'E51N16');
        const exit = creep.pos.findClosestByPath(exitDir);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#0fa' } });
      }
    }
  }
};

module.exports = roleEnergyTransporter;
