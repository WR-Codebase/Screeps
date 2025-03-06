const roomManager = require('roomManager');
const creepManager = require('creepManager');
const towerManager = require('towerManager');

module.exports.loop = function () {
  try {
    // Run rooms
    roomManager.run();

    // Run creeps
    creepManager.run();

    // Run towers
    towerManager.run();

    // Periodically clear memory
    //if (Game.time % 10 === 0) purgeMemory();

    // Log CPU and Memory usage every 5 ticks
    if (Game.time % 1 === 0){
      console.log(`Tick: ${Game.time} | CPU: ${Game.cpu.getUsed().toFixed(2)} | Memory: ${JSON.stringify(RawMemory.get().length)} bytes`);
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
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}