const roleRemoteHarvester = {
  /** @param {Creep} creep **/
  run: function (creep) {
    creep.memory.homeRoom = 'E51N15';
    const targetRoom = 'N1'; // Example target room to the north
    const homeRoom = creep.memory.homeRoom; // Home room should be stored in memory when spawning the creep

    // Check if creep is in the target room
    if (creep.room.name !== targetRoom) {
      // Move to the target room
      const exitDir = creep.room.findExitTo(targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
      return; // Exit the function to prevent further actions until the creep is in the target room
    }

    // If creep is full, return to home room to offload energy
    if (creep.store.getFreeCapacity() === 0) {
      if (creep.room.name !== homeRoom) {
        // Move back to home room if not already there
        const exitDir = creep.room.findExitTo(homeRoom);
        const exit = creep.pos.findClosestByRange(exitDir);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
      } else {
        // Offload energy in the home room
        const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_CONTAINER) &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        if (structure) {
          if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    } else {
      // Harvest energy if the creep is not full and is in the target room
      const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
};

module.exports = roleRemoteHarvester;
