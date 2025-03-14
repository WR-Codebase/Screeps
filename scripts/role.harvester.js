const Traveler = require('Traveler');

// role.harvester.js
const roleHarvester = {
  run: function (creep) {
    //console.log(`Running harvester ${creep.name}`);

    // Check creep memory for name, role, index
    if (!creep.memory.role) creep.memory.role = 'harvester';

    let index = 0;
    // Index
    if (!creep.memory.index) {
      let maxIndex = 0;
      // get number of sources in the room
      const sources = creep.room.find(FIND_SOURCES);
      maxIndex = sources.length;

      // Check Memory.creeps for harvesters in this room. If there's more harvesters than there are indexed memory entries, reconstruct the memory
      const harvesters = _.filter(Game.creeps, (c) => c.memory.role === 'harvester' && c.room.name === creep.room.name);
      //console.log(`Found ${harvesters.length} harvesters in room ${creep.room.name}`);

      // list of harvesters in memory for this room (Memory.creeps with role = harvester  and room = creep.room.name)
      const harvestersInMemory = _.filter(Memory.creeps, (c) => c.role === 'harvester' && c.room === creep.room.name);
      //console.log(`Found ${harvestersInMemory.length} harvesters in memory for room ${creep.room.name}`);

      // for harvesters in memory, while index < maxIndex, if the harvester in memory is not in assign index to harvester
      for (harvester of harvestersInMemory) {
        // If it's a valid index and the harvester doesn't exist in harvesters, assign the index to the creep
        if (index <= maxIndex && !harvesters.find(h => h.name === harvester.name)) {
          creep.memory.index = index;
          break;
        }
      }
    }

    // Name
    // If the creep.name or the creep.memory.name is not harvester_${creep.room.name}_${creep.memory.index}, set both
    const correctName = `harvester_${creep.room.name}_${creep.memory.index}`;
    if (creep.name !== correctName || creep.memory.name !== correctName) {
      creep.name = correctName;
      creep.memory.name = correctName;
    }


    // sourceId
    if (!creep.memory.sourceId) {
      // Find a source that does not yet have a harvester
      console.log(`Harvester ${creep.name} does not have a source assigned`);
      // Find all sources in the room
      const sources = creep.room.find(FIND_SOURCES);
      // Assign a source to this creep
      for (const source of sources) {
        // Check if a harvester is already assigned to this source
        const harvesters = _.filter(Game.creeps, (c) => c.memory.sourceId === source.id && c.memory.role === 'harvester');
        if (harvesters.length < 1) {
          creep.memory.sourceId = source.id;
          break;
        }
      }
    } else {
      // Check if the assigned source is assigned to any creep other than the current one
      // if any other creep has the same source id, find a new one
      // Check room sources for an unaassigned source
      // check harvesters in the room for their sources
    }

    const source = Game.getObjectById(creep.memory.sourceId);
    // Find the link within two spaces from the target source
    const link = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (structure) => structure.structureType === STRUCTURE_LINK
    })[0];

    // if used capacity is greater than 0, attempt to transfer energy to a link
    if (link && creep.store.getUsedCapacity() > 0) {
      // Attempt to transfer energy to the link
      const transferResult = creep.transfer(link, RESOURCE_ENERGY);
      if (transferResult === OK) {
        //console.log(`Harvester ${creep.name} transferred energy to link at ${link.pos}`);
      } else if (transferResult === ERR_NOT_IN_RANGE) {
        // This should not happen since we're checking for links within 1 tile, but it's a good safety check
        creep.travelTo(link, {
          visualizePathStyle: { stroke: '#fa0' },
          ignoreCreeps: false,
          reusePath: 20,  // Caches path for 20 ticks
          maxOps: 100      // Limits CPU spent on pathfinding
        });
      }
    }

    // If the creep is full, drop the energy on the ground
    if (creep.store.getFreeCapacity() === 0) {
      creep.drop(RESOURCE_ENERGY);
    } else {
      // Proceed to harvest from the assigned source
      //console.log(`Harvester ${creep.memory.name} is assigned to source ${source.id}`);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.travelTo(source, {
          visualizePathStyle: { stroke: '#fa0' },
          ignoreCreeps: false,
          reusePath: 20,  // Caches path for 20 ticks
          maxOps: 100      // Limits CPU spent on pathfinding
        });
      }
    }
  }
};

module.exports = roleHarvester;
