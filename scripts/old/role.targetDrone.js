const roleTargetDrone = {
  /** @param {Creep} creep **/
  run: function (creep) {
    creep.memory.targetRoom = 'E52N16'
    const targetRoom = creep.memory.targetRoom;
    if (creep.room.name !== targetRoom) {
      console.log('Moving to target room');
      // Attempt to move to the next room
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByPath(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
    } else {
      console.log('In target room');
      const controller = creep.room.controller;
      if (creep.reserveController(controller) === ERR_NOT_IN_RANGE) {
        creep.claimController(controller);
        creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
      } else {
        // try to claim
        if (creep.claimController(controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};

module.exports = roleTargetDrone;
