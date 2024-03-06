/**
 * Steps make up jobs!
 *
 * The Steps module includes the building blocks of steps in general. Each Job will set
 * the properties of its steps
 */

const steps = {
  name: '',
  bodyParts: [],
  action: {},

  harvest: {
    task: 'harvest',
    bodyParts: [WORK, CARRY, MOVE], // Always one of each for now. The ratios will be dynamic
    duration: 0,
    say: '🔄 harvest',

    run: function (creep) {
      if (creep.store.getFreeCapacity() > 0) {
        //let source = creep.room.find(FIND_SOURCES)
        const source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.say(`Harvest`);
          creep.moveTo(source, { visualizePathStyle: { stroke: '#af0' } });
          this.duration++;
        }
        return 'harvest';
      }
      return 'full';
    }
  },
  deposit: {
    task: 'deposit',
    bodyParts: [CARRY, MOVE], // Always one of each for now. The ratios will be dynamic
    duration: 0, // doesn't do anything yet but will eventually be used to determine when to switch tasks
    say: '🚧 deposit',
    run: function (creep) {
      const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        // Find the closest spawn or extension which has free capacity
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_EXTENSION) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      });
      if (target) {
        if (creep.store.getUsedCapacity() === 0) return 'empty';
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#0af' } });
          this.duration++;
          return 'deposit';
        }
      }
    }
  }
};

module.exports = steps;
