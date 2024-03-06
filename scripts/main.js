const jobs = require('jobs');
const E51N15 = require('E51N15Handler');
const E51N16 = require('E51N16Handler');

/**
 * Reference data

 const statuses = {
  idle: '💤 idle',
  charging: '⚡ charging',
  collect: '🔄 collect',
  building: '🚧 building',
  upgrading: '⬆ upgrading',
  repairing: '🔧 repairing',
  hauling: '🚚 hauling' // or delivering
  nursing: '🍼 nurse'
 };

 const bodyParts = [
 {part: 'MOVE', cost: 50}, // provides movement for one non-movement part
 {part: 'WORK', cost: 100}, // does 2 units of work per tick
 {part: 'CARRY', cost: 50}, // carries 50 energy units
 {part: 'ATTACK', cost: 80},
 {part: 'RANGED_ATTACK', cost: 150},
 {part: 'HEAL', cost: 250},
 {part: 'TOUGH', cost: 10},
 {part: 'CLAIM', cost: 600}
 ];

 */

/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  // tidy up dead creeps
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

const roomStrategies = {
  E51N15: function (room) {
    // Track room energy
    const currentEnergy = room.energyAvailable;
    const energyCapacity = room.energyCapacityAvailable;
    //console.log(`Room Energy: ${currentEnergy} / ${energyCapacity}`);
    //console.log(`Total Creeps: ${_.size(Game.creeps)}`);

    const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);

    towers.forEach(tower => {
      // Find the closest hostile unit
      const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (closestHostile) {
        // Attack the closest hostile unit
        tower.attack(closestHostile);
        // Check if energy is over 500 and if so, find the most damaged structure and repair
      } else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 850) {
        // If no hostiles and energy is over 50%, find the most damaged structure and repair except for roads filter by structure.hits <= 200000
        const targets = tower.room.find(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax
            && structure.hits <= 150000
            && structure.structureType !== STRUCTURE_ROAD
            && structure.structureType !== STRUCTURE_WALL
        });//structure.structureType === STRUCTURE_RAMPART &&

        if (targets.length > 0) {
          // Sort the ramparts by hits in ascending order to find the most damaged one
          targets.sort((a, b) => a.hits - b.hits);
          // Repair the most damaged target
          tower.repair(targets[0]);
        }
      }
    });

    // Cleanup inactive creeps
    purgeMemory();

    // Controller for creeps
    E51N15.run();
    _.forEach(Game.creeps, (creep) => {
      if (creep.memory.role === 'universalWorker' && creep.memory.assignedRoom === room.name) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 50 || creep.memory.nursing) {
          creep.memory.nursing = true;
          jobs.collect(creep);
        } else {
          const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
          if (constructionSites.length > 0) {
            jobs.build(creep);
          } else {
            // if there are extensions, spawns, that need energy, fill them
            const nourishTargets = creep.room.find(FIND_MY_STRUCTURES, {
              filter: (structure) => {
                return (structure.structureType === STRUCTURE_SPAWN
                    || structure.structureType === STRUCTURE_EXTENSION)
                  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
              }
            });
            if (nourishTargets.length > 0) {
              jobs.nourish(creep);
            } else {
              // If there are towers that need energy, fill them
              const towers = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                  return structure.structureType === STRUCTURE_TOWER
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
              });
              if (towers.length > 0) {
                jobs.refillTowers(creep);
              } else {
                jobs.upgrade(creep);
              }
            }
          }
        }

        if (creep.store.getFreeCapacity() === 0 && creep.memory.nursing) {
          creep.memory.nursing = false;
        }
      }
    });

  },
  E51N16: function (room) {
    E51N16.handleRoom(room);
  }
};

module.exports.loop = function () {
  // Purge memory of dead creeps not in game anymore
  purgeMemory();

  // Loop through each room controlled by your creeps
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room && room.controller && room.controller.my) {
      // Check if we have a strategy defined for the room
      if (roomStrategies[roomName]) {
        roomStrategies[roomName](room);
      } else {
        // Optional: Implement a default room logic or log a warning
        //console.log(`No specific strategy defined for room ${roomName}. Implementing default strategy or skipping.`);
      }
    }
  }
};
