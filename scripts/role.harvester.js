const Traveler = require('Traveler');

// role.harvester.js
const roleHarvester = {
  run: function (creep) {
    //console.log(`Running harvester ${creep.name}`);
    // Check if the creep has a source assigned in memory
    if (!creep.memory.sourceId) {
      console.log(`Harvester ${creep.name} does not have a source assigned`);
      // Find all sources in the room
      const sources = creep.room.find(FIND_SOURCES);
      // Assign a source to this creep
      for (const source of sources) {
        // Check if a harvester is already assigned to this source
        const harvesters = _.filter(Game.creeps, (c) => c.memory.sourceId === source.id);
        if (harvesters.length < 1) {
          creep.memory.sourceId = source.id;
          break;
        }
      }
    }

    // Proceed to harvest from the assigned source
    const source = Game.getObjectById(creep.memory.sourceId);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.travelTo(source, { visualizePathStyle: { stroke: '#0f0' } });
    }

    // If the creep is full, attempt to transfer energy to a link
    if (creep.store.getFreeCapacity() === 0) {
      const link = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
        filter: { structureType: STRUCTURE_LINK }
      })[0]; // Take the first link found, if any

      if (link) {
        // Attempt to transfer energy to the link
        const transferResult = creep.transfer(link, RESOURCE_ENERGY);
        if (transferResult === OK) {
          //console.log(`Harvester ${creep.name} transferred energy to link at ${link.pos}`);
        } else if (transferResult === ERR_NOT_IN_RANGE) {
          // This should not happen since we're checking for links within 1 tile, but it's a good safety check
          creep.travelTo(link);
        }
      }
    }
  }
};

module.exports = roleHarvester;
