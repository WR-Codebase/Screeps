const roleDefender = {
  run: function (creep) {
    // Define the body composition of the ranged defender
    const bodyComposition = [MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];

    // Define the name for the new creep, unique identifiers such as timestamps can help
    const defenderName = `RangedDefender-${Game.time}`;

    // Define the memory object to assign role and mission details
    const memory = {
      role: 'defender',
      targetRoom: 'E51N16', // Target room to move to
      action: 'defend' // This can be used to specify actions such as 'attack', 'defend', etc.
    };

    // Command to spawn the new ranged defender from 'HomeSpawn'
    if (Game.spawns['HomeSpawn'].spawnCreep(bodyComposition, defenderName, { memory: memory }) === OK) {
      console.log(`Spawning new Ranged Defender: ${defenderName}`);
    } else {
      console.log('Spawn error: Not enough resources or spawn is busy.');
    }

// Movement and action logic for the defender creep
// This should be placed in the main loop or appropriate role file
    if (creep.memory.role === 'defender' && creep.memory.action === 'defend') {
      if (creep.room.name !== creep.memory.targetRoom) {
        // Move to the target room
        const exitDir = Game.map.findExit(creep.room, creep.memory.targetRoom);
        const exit = creep.pos.findClosestByRange(exitDir);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
      } else {
        // Once in the target room, find and attack hostiles
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
          if (creep.rangedAttack(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        }
      }
    }
  }
};

module.exports = roleDefender;
