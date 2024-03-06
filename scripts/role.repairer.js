const jobs = require('./jobs');

/**
 * The Repairer role is responsible for repairing structures in the room.
 * @type {{run: roleRepairer.run}}
 */
const roleRepairer = {
  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.store[RESOURCE_ENERGY] === 0) {
      delete creep.memory.target;
      jobs.collect(creep);
    }
    if (creep.store[RESOURCE_ENERGY] > 0) {
      jobs.repair(creep);
    }
  }
};

module.exports = roleRepairer;
