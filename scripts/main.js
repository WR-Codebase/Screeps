const roomManager = require('roomManager');
const creepManager = require('creepManager');
const towerManager = require('towerManager');

module.exports.loop = function () {
  try {
    if (global.allies === undefined)
      global.allies = new Set(["kotyara", "suyu", "dodzai", "Pwk", "WoodenRobot", "Belthazor"]);

    if (!Memory.creeps) Memory.creeps = {};

    // Run rooms
    roomManager.run();

    // Run creeps
    creepManager.run();

    // Run towers
    towerManager.run();


    // Run Inter-Room Creeps


    if (Game.time % 1 === 0) {
      console.log(`Tick: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);
      // Periodically clear memory
      if (RawMemory.get().length > 2000000) {
        console.log(`[WARN] Memory usage is over 2MB!`);
        purgeMemory();
      }
    }
  } catch (e) {
    console.log(`Error in main loop: ${e}`);
  };
}

/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  for (const name of Object.keys(Memory.creeps)) {
    if (!Game.creeps[name]) delete Memory.creeps[name];
  }
}