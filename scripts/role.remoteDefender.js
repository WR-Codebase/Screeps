// role.remoteDefender.js

const roleRemoteDefender = {

  /** @param {Creep} creep **/
  run: function (creep) {
    //console.log(`Running remoteDefender ${creep.name}`);
    // Target room to defend
    creep.memory.targetRoom = 'E55S17';
    const targetRoom = creep.memory.targetRoom;

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
      const target = creep.pos.findClosestByRange(hostiles);
      if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
        // Move towards the hostile creep if not in range
        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
      }
    } else {
      // If there are players or creeps belonging to other players
      const players = creep.room.find(FIND_HOSTILE_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType !== null);
        }
      });

      if (players.length > 0) {
        console.log(`Hostile structures detected in ${targetRoom}`);
        // Attack the closest hostile structure
        const target = creep.pos.findClosestByRange(players);
        if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
          // Move towards the hostile structure if not in range
          creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
        }
      } else {

        // If there are no hostiles, move to a rally point or stand by
        // This part can be customized based on your strategy
        // Example: Move to a flag or a specific room position
        creep.moveTo(25, 25, {visualizePathStyle: {stroke: '#ffffff'}}); // Standby at the center, adjust as needed
      }
    }
  }
};

module.exports = roleRemoteDefender;
