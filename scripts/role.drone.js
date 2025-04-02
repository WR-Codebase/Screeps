const roleDrone = {
  /** @param {Creep} creep **/
  run: function (creep) {
    try {
      const targetRoom = creep.memory.targetRoom || 'E55S17';

      // === Step 1: Travel to target room ===
      if (creep.room.name !== targetRoom) {
        const exitDir = creep.room.findExitTo(targetRoom);
        const exit = creep.pos.findClosestByPath(exitDir);
        if (exit) creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffaa00' } });
        return;
      }

      // Step 2: Behavior based on status
      switch (creep.memory.status) {
        case 'claim':
          this.claim(creep);
          break;
        default:
          this.reserve(creep);
          break;
      }
    } catch (err) {
      console.log(`[ERROR] Drone ${creep.name} encountered an error: ${err.message}`);
    }
  },

  /** Claim a neutral controller **/
  claim: function (creep) {
    const controller = creep.room.controller;
    if (!controller) return;

    // 🛡 If another player reserves or owns it, attack the controller
    if (
      (controller.reservation && controller.reservation.username !== creep.owner.username) ||
      (controller.owner && controller.owner.username !== creep.owner.username)
    ) {
      const attackResult = creep.attackController(controller);
      if (attackResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
      } else {
        creep.say('🪓 unclaim');
      }
      return;
    }

    // 👑 Otherwise, claim as normal
    const result = creep.claimController(controller);
    if (result === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
    } else {
      creep.say('👑 claim');
    }
  },

  /** Reserve a neutral controller, or unclaim if blocked */
  reserve: function (creep) {
    const controller = creep.room.controller;
    if (!controller) return;

    const isBlocked =
      (controller.reservation && controller.reservation.username !== creep.owner.username) ||
      (controller.owner && controller.owner.username !== creep.owner.username);

    if (isBlocked) {
      const result = creep.attackController(controller);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, { visualizePathStyle: { stroke: '#ff0000' } });
      } else {
        creep.say('🪓 attack');
      }
      return;
    }

    const result = creep.reserveController(controller);
    if (result === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller, { visualizePathStyle: { stroke: '#00ff00' } });
    } else {
      creep.say('📜 reserve');
    }
  }
};

module.exports = roleDrone;