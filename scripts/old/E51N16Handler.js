const rolePicker = require('role.picker');

function minCreeps(role, minCount, bodyConfig, spawnName, roomName) {
  const activeCreeps = _.filter(Game.creeps, (c) => c.memory.role === role && c.memory.room === roomName);
  if (_.size(activeCreeps) < minCount) {
    Game.spawns[spawnName].spawnCreep(bodyConfig, `${role}_${roomName}_${Game.time}`, { memory: { role: role, room: roomName } });
  }
}

module.exports = {
  runDropHarvester: function (creep) {
    if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) === ERR_NOT_IN_RANGE) {
      // Move to the source initially to start harvesting
      creep.moveTo(Game.getObjectById(creep.memory.sourceId), { visualizePathStyle: { stroke: '#ffaa00' } });
    }
    // No need to transfer energy; harvested energy will automatically be dropped
  },
  handleRoom: function (room) {
    const sourceLinks = [Game.getObjectById('65f3f4dae04861d8abf5fd84')];
    const targetLink = Game.getObjectById('65f3d596d8e59516dd86809b');

    // Ensure both links are not in cooldown and the source link has enough energy
    for (const sourceLink of sourceLinks) {
      // If source link is not in cooldown and target link has free capacity
      if (sourceLink.cooldown === 0 && targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        // Attempt to transfer as much energy as possible to the target link
        sourceLink.transferEnergy(targetLink);
      }
    }
    const sourceLinks2 = [Game.getObjectById('65fe642fbb34f6219cd621ba')];
    const targetLink2 = Game.getObjectById('65fe5a2b50579d451d7ab558');

    // Ensure both links are not in cooldown and the source link has enough energy
    for (const sourceLink2 of sourceLinks2) {
      // If source link is not in cooldown and target link has free capacity
      if (sourceLink2.cooldown === 0 && targetLink2.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        // Attempt to transfer as much energy as possible to the target link
        sourceLink2.transferEnergy(targetLink2);
      }
    }

    const roomName = room.name;
    const sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

    // Ensure one harvester per source
    sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'dropHarvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) { // If no harvester for this source
        // Spawning a drop harvester
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], `dropHarvester_${roomName}_${Game.time}`, {
          memory: { role: 'dropHarvester', sourceId: source.id }
        });
      }
    });
    const dropHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'dropHarvester' && creep.room.name === room.name);
    for (const creep of dropHarvesters) {
      this.runDropHarvester(creep);
    }

    // Spawn creeps for E53N17 here for now until it has its own script
    minCreeps('picker', 1, [
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ], 'E53N17', 'E53N17');
    minCreeps('minim', 1, [CARRY, CARRY, MOVE], 'E53N17', 'E53N17');
    minCreeps('worker', 2, [WORK, WORK, WORK, WORK, CARRY, WORK, CARRY, WORK, CARRY, CARRY, MOVE, MOVE], 'E53N17', 'E53N17');
    minCreeps('repairer', 1, [WORK, CARRY, MOVE], 'E53N17', 'E53N17');
    minCreeps('nurse', 2, [CARRY, MOVE,CARRY, MOVE], 'E53N17', 'E53N17');
    minCreeps('mineralHarvester', 0, [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'E53N17', 'E53N17');
    
    // Ensure one harvester per source

    const E53N17sources = Game.spawns['E53N17'].room.find(FIND_SOURCES);
    E53N17sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) { // If no harvester for this source
        // Spawning a drop harvester
        Game.spawns['E53N17'].spawnCreep([WORK,WORK,WORK,WORK,WORK, CARRY, MOVE], `dropHarvester_E53N17_${Game.time}`, {
          memory: { role: 'harvester', sourceId: source.id }
        });
      }
    });

    minCreeps('picker', 1, rolePicker.bodyTemplate, 'Spawn1', room.name);
    minCreeps('minim', 1, [CARRY, CARRY, MOVE], 'Spawn1', room.name);
    minCreeps('worker', 1, [WORK, WORK, CARRY, WORK, CARRY, WORK, CARRY, WORK, CARRY, WORK, WORK, CARRY, WORK, CARRY, WORK, CARRY, WORK, CARRY, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('repairer', 2, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('nurse', 1, [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], 'Spawn1', room.name);
    //minCreeps('energyTransporter', 0, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    //minCreeps('remoteWorker', 2, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('mineralHarvester', 0, [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('E52N16Harvester', 2, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', room.name);
    // Hauler, 9 carry, 9 move
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 1) {
        const newName = 'Hauler' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ], newName, {
          memory: { role: 'hauler', sourceId: source.id }
        });
      }
    });
  }
};
