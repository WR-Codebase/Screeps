const E52N15MineralHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    // Determine harvesting state based on creep's load
    if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
      creep.memory.harvesting = false;
    }
    if(!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.harvesting = true;
    }

    if(creep.memory.harvesting) {
      // Harvesting minerals in E52N15
      if(creep.room.name === 'E52N15') {
        var mineral = creep.pos.findClosestByPath(FIND_MINERALS);
        if(creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
          creep.moveTo(mineral, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
      } else {
        // Moving to E52N15
        const exitDir = creep.room.findExitTo('E52N15');
        const exitFlag = creep.pos.findClosestByPath(exitDir);
        if (exitFlag) {
          creep.moveTo(exitFlag, {visualizePathStyle: {stroke: '#ffaa00'}});
          console.log(`Creep ${creep.name} moving towards exit`);
        } else {
          console.log(`Creep ${creep.name} cannot find path to exit`);
        }
      }

    } else {
      // Returning to E51N15 to offload minerals
      if(creep.room.name === 'E51N15') {
        var storage = creep.room.storage;
        if(storage && creep.transfer(storage, _.findKey(creep.store)) == ERR_NOT_IN_RANGE) {
          creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
        // Moving to E51N15
        var exit = creep.room.findExitTo('E51N15');
        creep.moveTo(creep.pos.findClosestByRange(exit), {visualizePathStyle: {stroke: '#ffffff'}});
      }
    }
  }
};

module.exports = E52N15MineralHarvester;
