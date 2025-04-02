module.exports = {
  run() {
    try {
      for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (!heap.rooms[roomName].hostile) continue;
        // If room controller is not mine, continue
        if (!room.controller || !room.controller.my) continue;

        const hostile = room.find(FIND_HOSTILE_CREEPS).find(
          c => !global.allies.has(c.owner.username)
        );
        console.log(`[INFO] towerManager.run(): ${roomName} hostile: ${hostile} ${!!hostile}`);

        if (hostile) {
          const towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
          });
  
          if (!towers.length) continue;
          for (const tower of towers) {
            tower.attack(hostile);
          }
        }
      }
    } catch (e) {
      console.log(`[ERROR] towerManager.run(): ${e}`);
    }
  }
};