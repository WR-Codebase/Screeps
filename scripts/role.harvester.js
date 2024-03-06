// role.harvester.js
const roleHarvester = {
  run: function (creep) {
    // Check if the creep has a source assigned in memory
    if (!creep.memory.sourceId) {
      // Find all sources in the room
      const sources = creep.room.find(FIND_SOURCES);
      // Assign a source to this creep
      for (const source of sources) {
        // Check if this source is already assigned to a harvester
        if (!_.some(Game.creeps, c => c.memory.role === 'harvester'
          && c.memory.sourceId === source.id)) {
          creep.memory.sourceId = source.id;
          break; // Break the loop once a source has been assigned
        }
      }
    }

    // Proceed to harvest from the assigned source
    const source = Game.getObjectById(creep.memory.sourceId);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#0f0' } });
    }
  }
};

module.exports = roleHarvester;
