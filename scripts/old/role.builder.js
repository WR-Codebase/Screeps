const roleBuilder = {
  role: 'builder',
  bodyTemplate: [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],

  run: function (creep) {
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (!creep.memory.waitingTime) {
      creep.memory.waitingTime = 0;
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      const source = creep.pos.findClosestByPath(sources);
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        creep.memory.waitingTime++;
      } else {
        creep.memory.waitingTime = 0; // Reset waiting time if harvesting starts
      }

      if (creep.memory.waitingTime > 3) {
        creep.say('🔄 harvest');
        // Reset waiting time after deciding to switch
        creep.memory.waitingTime = 0;

        // Find the next available source
        const nextSource = this.findNextAvailableSource(creep);

        // Update the creep's target source in memory
        creep.memory.targetSourceId = nextSource.id;

        // Move towards the next available source
        creep.moveTo(nextSource, { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  },

  findNextAvailableSource: function (creep) {
    const sources = creep.room.find(FIND_SOURCES);
    let leastUsedSource = sources[0]; // Default to the first source
    let minCreepCount = Number.MAX_SAFE_INTEGER;

    for (const source of sources) {
      // Count how many creeps are targeting this source
      const targetingCreeps = _.filter(Game.creeps, (c) => c.memory.targetSourceId === source.id).length;

      if (targetingCreeps < minCreepCount) {
        minCreepCount = targetingCreeps;
        leastUsedSource = source;
      }
    }

    return leastUsedSource;
  }
};

module.exports = roleBuilder;
