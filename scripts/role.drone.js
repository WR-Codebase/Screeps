const roleDrone = {
  /** @param {Creep} creep **/
  run: function (creep) {
    try {
      const targetRoom = creep.memory.targetRoom = 'E55S17'; // Room to capture

      if (creep.room.name !== targetRoom) {
        creep.moveTo(new RoomPosition(25, 25, targetRoom), { visualizePathStyle: { stroke: '#ffffff' } });
        return;
      }

      if (creep.room.controller) {
        if (creep.room.controller.owner || creep.room.controller.reservation) {
          // If the controller is owned or reserved, attempt to downgrade it
          if (creep.attackController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ff0000' } });
          }
        } else {
          // If the controller is neutral, claim it
          if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#00ff00' } });
          }
        }
      }
    } catch (err) {
      console.log(`[ERROR] Drone ${creep.name} encountered an error: ${err.message}`);
    }
  }
};

module.exports = roleDrone;
