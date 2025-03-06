const jobs = require('./jobs');
const E52N16Harvester = {

  /** @param {Creep} creep **/
  run: function (creep) {
    // Toggle harvesting state based on energy capacity
    if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
      creep.memory.harvesting = false;
    }
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }

    if (creep.memory.harvesting) {
      // If in target room, harvest from source
      if (creep.room.name === 'E52N16') {
        // if creep energy is not full
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          jobs.collect(creep);
        }
      } else {
        // Move to target room
        creep.travelTo(creep.pos.findClosestByRange(creep.room.findExitTo('E52N16')), { visualizePathStyle: { stroke: '#ffaa00' } });
        //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to target room`);
      }
    } else {
      // Return to home room to offload energy
      if (creep.room.name === 'E51N16') {
        // If the creep is full, attempt to transfer energy to a link
        if (creep.store.getUsedCapacity() >= 0) {
          const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType === STRUCTURE_LINK
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            }
          });
          if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to storage`);
              creep.travelTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          }
        }
      } else {
        // Move to home room
        creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo('E51N16')), { visualizePathStyle: { stroke: '#ffffff' } });
        //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to home room`);
      }
    }
  }
};

module.exports = E52N16Harvester;
