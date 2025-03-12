/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('towerManager');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
  run: function() {
    try {
      const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
      towers.forEach(tower => {
        // Find the closest hostile unit
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // If there is a closest hostile and it's not an ally, attack it
        if (closestHostile && !global.allies.has(closestHostile.owner.username)) {
          // Attack the closest hostile unit
          tower.attack(closestHostile);
        } else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 850) {
          // Check if energy is over 500 and if so, find the most damaged structure and repair
          // If no hostiles and energy is over 50%, find the most damaged structure and repair except for roads filter by structure.hits <= 200000
          const targets = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
              && structure.hits <= 150000
              && structure.structureType !== STRUCTURE_ROAD
              && structure.structureType !== STRUCTURE_WALL
          });
  
          if (targets.length > 0) {
            // Sort the ramparts by hits in ascending order to find the most damaged one
            targets.sort((a, b) => a.hits - b.hits);
            tower.repair(targets[0]);
          }
        }
      });
    } catch (e) {
      console.log(`Error in towerManager.run(): ${e}`);
    }
  }
};