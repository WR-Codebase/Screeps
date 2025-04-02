// role.remoteDefender.js

const roleRemoteDefender = {

  /** @param {Creep} creep **/
  run: function (creep) {
const targetRoom = 'E56S18';
creep.memory.targetRoom = targetRoom; // Set the target room in memory


    // If not in the target room, move to it
    if (creep.room.name !== targetRoom) {
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, {visualizePathStyle: {stroke: '#ff0000'}});
      return;
    }

    // Once in the target room, find hostiles //
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);

    if (hostiles.length > 0) {
      console.log(`Hostiles detected in ${targetRoom}`);
      // Attack the closest hostile creep

      // Prioritize attacking healers
      const healer = hostiles.find(h => h.getActiveBodyparts(HEAL) > 0);
      if (healer) {
        console.log(`Attacking healer ${healer.name}`);
        const rangedErr = creep.rangedAttack(healer);
        console.log(`Ranged attack result: ${rangedErr}`);
        if (rangedErr == ERR_NOT_IN_RANGE) {
          // Move towards the healer if not in range
          creep.moveTo(healer, {visualizePathStyle: {stroke: '#ff0000'}});
        }

        if (creep.attack(healer) == ERR_NOT_IN_RANGE) {
          // Move towards the healer if not in range
          creep.moveTo(healer, {visualizePathStyle: {stroke: '#ff0000'}});
        }
        return; // Exit after targeting the healer
      }
      const target = creep.pos.findClosestByRange(hostiles);
      if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
        // Move towards the hostile creep if not in range
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
      }
    } else {
      // If there are players or creeps belonging to other players
      const players = creep.room.find(FIND_HOSTILE_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType !== null &&
                 structure.structureType !== STRUCTURE_INVADER_CORE;
        }
      });
      
      // NEW: Check for Invader Core specifically
      const invaderCores = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_INVADER_CORE
      });
      
      if (invaderCores.length > 0) {
        console.log(`⚠️ Invader Core detected in ${targetRoom}`);
        const target = creep.pos.findClosestByPath(invaderCores);
        const attackResult = creep.attack(target);
        if (attackResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        }
        return;
      }

      if (players.length > 0) {
        console.log(`Hostile structures detected in ${targetRoom}`);
        // Attack the closest hostile structure
        const target = creep.pos.findClosestByRange(players);

        // If the creep has ranged parts, use ranged attack
        if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
          const rangedErr = creep.rangedAttack(target);
          console.log(`Ranged attack result: ${rangedErr}`);
          if (rangedErr == ERR_NOT_IN_RANGE) {
            // Move towards the hostile structure if not in range
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
          }
        } else {
          // Use regular attack if no ranged parts
          const meleeErr = creep.attack(target);
          console.log(`Melee attack result: ${meleeErr}`);
          if (meleeErr == ERR_NOT_IN_RANGE) {
            // Move towards the hostile structure if not in range
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
          }
        }
      } else {

        // If there are no hostiles, move to a rally point or stand by
        // This part can be customized based on your strategy
        // Example: Move to a flag or a specific room position
        creep.moveTo(25, 25, {visualizePathStyle: {stroke: '#ffffff'}, range: 23}); // Standby at the center, adjust as needed
      }
    }
  }
};

module.exports = roleRemoteDefender;
