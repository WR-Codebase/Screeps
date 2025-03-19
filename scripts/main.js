const roomManager = require('roomManager');
const creepManager = require('creepManager');
const towerManager = require('towerManager');
const trafficManager = require('trafficManager');

if (!global.allies)
  global.allies = new Set(["kotyara", "suyu", "dodzai", "Pwk", "WoodenRobot", "Belthazor"]);

if (!global.heap) global.heap = {};

module.exports.loop = function () {
  try {
    console.log(`Tick START: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

    // tick CPU used before roomManager.run() to ensure all rooms are in memory
    console.log(`CPU used before roomManager.run(): ${Game.cpu.getUsed().toFixed(2)}`);
    // Run rooms
    roomManager.run();

    // Run creeps
    creepManager.run();

    // Run towers
    towerManager.run();


    // Run Inter-Room Creeps

    console.log(`Tick END: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);

    if (Game.time % 100 === 0) {
      // Periodically clear memory
      if (RawMemory.get().length > 2000000) {
        console.log(`[WARN] Memory usage is over 2MB!`);
      }
      purgeMemory();
    }
    _.forEach(Game.rooms, room => {
      trafficManager.run(room);
    });
    } catch (e) {
    console.log(`Error in main loop: ${e}`);
  };

}

/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}