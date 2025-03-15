const roleSoldier = {
  /** @param {Creep} creep **/
  run: function (creep) {
    const targetRoom = 'E55S17'; // Room to capture
    const homeRoom = 'E56S17'; // Home room for recycling

    // Move to the target room
    if (creep.room.name !== targetRoom) {
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ff0000' } });
      return;
    }

    // Once in the room, prioritize enemy defenses
    let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_TOWER
    });

    // If no towers, attack spawns next
    if (!target) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_SPAWN
      });
    }

    // If no spawns, attack any enemy creep
    if (!target) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
        filter: creep => creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0
      });

      if (!target) {
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
          filter: creep => creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: structure => structure.structureType === STRUCTURE_CONTROLLER
          }).length > 0
        });
      }
    }

    // If no enemy creeps, destroy other enemy structures
    if (!target) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
    }

    // Ensure we do not target the controller directly
    if (target && target.structureType === STRUCTURE_CONTROLLER) {
      target = null;
    }

    if (target) {
      console.log(`[INFO] Soldier ${creep.name} targeting ${target.structureType || 'creep'} at (${target.pos.x}, ${target.pos.y})`);
      if (creep.attack(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
      }
    } else {
      console.log(`[INFO] Soldier ${creep.name} has no targets in ${targetRoom}, returning home to be recycled.`);
      if (creep.room.name !== homeRoom) {
        const exitDir = Game.map.findExit(creep.room, homeRoom);
        const exit = creep.pos.findClosestByRange(exitDir);
        creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
      } else {
        const spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if (spawn) {
          if (spawn.recycleCreep(creep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, { visualizePathStyle: { stroke: '#00ff00' } });
          }
        }
      }
    }
  }
};

module.exports = roleSoldier;