const jobs = require('./jobs');
const E52N16Harvester = {

  /** @param {Creep} creep **/
  run: function (creep) {

    // Check if creep is bringing energy back to home room or harvesting
    if (creep.memory.harvesting && creep.store.getFreeCapacity() === 0) {
      creep.memory.harvesting = false;
    }
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.harvesting = true;
    }

    if (creep.memory.harvesting) {
      // If in target room, harvest from source
      if (creep.room.name === 'E52N16') {
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to source`);

          // If there is dropped energy on the ground, pick it up
          if (creep.room.find(FIND_DROPPED_RESOURCES).length > 0) {
            jobs.collect(creep);
          } else {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
          }

        } else {
          // if there is energy on the ground collect it
          if (creep.room.find(FIND_DROPPED_RESOURCES).length > 0) {
            jobs.collect(creep);
            //console.log(`[${creep.name}] is in room ${creep.room.name} and is collecting energy.`);
          } else {
            if (creep.harvest(source) === ERR_INVALID_TARGET) {
              console.log(`Creep ${creep.name} received ERR_INVALID_TARGET when trying to harvest.`);
              // if creep is empty, collect energy
              if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                jobs.collect(creep);
              } else {
                // drop off energy at storage
                creep.memory.harvesting = false;
              }
            } else {
              console.log(`[${creep.name}] is in room ${creep.room.name} but is very confused. ${creep.harvest(source)}`);

            }
          }
        }
      } else {
        // Move to target room
        const exit = creep.room.findExitTo('E52N16');
        creep.moveTo(creep.pos.findClosestByRange(exit), { visualizePathStyle: { stroke: '#ffaa00' } });
        //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to target room`);
      }
    } else {
      // Return to home room to offload energy
      if (creep.room.name === 'E51N16') {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType === STRUCTURE_SPAWN
                || structure.structureType === STRUCTURE_EXTENSION
                || structure.structureType === STRUCTURE_STORAGE)
              && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
        });
        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            //console.log(`[${creep.name}] is in room ${creep.room.name} and moving to storage`);
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
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
