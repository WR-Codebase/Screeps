const jobs = require('./jobs');
// role.defenseRepairer.js modification for room targeting
const roleDefenseRepairer = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // Check if the creep is in the target room
    const targetRoom = 'E51N16';

    // Move to the target room if not already there
    if (creep.room.name !== targetRoom) {
      const exitDir = Game.map.findExit(creep.room, targetRoom);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit, { visualizePathStyle: { stroke: '#ffffff' } });
      console.log(`Creep ${creep.name} moving to target room ${targetRoom}`);
      return;
    }

    if (!creep.memory.target) creep.memory.target = '';
    // Switch states between repairing and recharging energy
    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.repairing = false;
      creep.memory.target = null;
      creep.say('⚡ recharge');
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() === 0) {
      creep.memory.repairing = true;
      creep.say('🔧 repair');
    }
//creep.memory.repairing = false;
    if (creep.memory.repairing) {
      // Initialize target if not set or target repair is complete
      if (!creep.memory.target
        || (Game.getObjectById(creep.memory.target)
          && Game.getObjectById(creep.memory.target).hits === Game.getObjectById(creep.memory.target).hitsMax)) {
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: object => object.hits < object.hitsMax
        });

        // Sort hits remaining in ascending order, fix the weakest first
        targets.sort((a, b) => a.hits - b.hits);

        // Filter out targets that are already targeted, if necessary
        const untargetedTargets = targets.filter(target => {
          return !_.some(Game.creeps, { memory: { target: target.id } });
        });

        const target = untargetedTargets.length > 0 ? untargetedTargets[0] : targets[0]; // Fallback to closest if all are targeted
        if (target) {
          creep.memory.target = target.id;
        }
      }

      // Attempt to repair the target
      const targetToRepair = Game.getObjectById(creep.memory.target);
      if (targetToRepair) {
        if (creep.repair(targetToRepair) === ERR_NOT_IN_RANGE) {
          // Move towards the target to repair
          creep.moveTo(targetToRepair, { visualizePathStyle: { stroke: '#fa0' } });
        }
      } else {
        // Clear the target if it's invalid or fully repaired
        delete creep.memory.target;
      }
    } else {
      // Find the closest container with energy
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER &&
          s.store[RESOURCE_ENERGY] > 0
      });
      if (container) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          // Move towards the container to recharge energy
          creep.moveTo(container, { visualizePathStyle: { stroke: '#0fa' } });
        }
      } else {
        // Fallback: Harvest energy if no containers are available
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source, { visualizePathStyle: { stroke: '#0fa' } });
        }
      }
    }

  }
};

module.exports = roleDefenseRepairer;
