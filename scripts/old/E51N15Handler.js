const roleWorker = require('role.worker');
const roleRemoteDefender = require('role.remoteDefender');
const roleRemoteWorker = require('role.remoteWorker');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleScout = require('role.scout');
const roleDrone = require('role.drone'); // the drone claims a room
const roleMineralHarvester = require('role.mineralHarvester');
const roleEnergyTransporter = require('role.energyTransporter');
const roleMinim = require('role.minim');
const roleE52N16Harvester = require('role.E52N16Harvester');
const roleE52N15Harvester = require('role.E52N15Harvester');

function minCreeps(role, minCount, bodyConfig, spawnName, roomName) {
  const activeCreeps = _.filter(Game.creeps, (c) => c.memory.role === role && c.memory.room === roomName);
  if (_.size(activeCreeps) < minCount) {
    Game.spawns[spawnName].spawnCreep(bodyConfig, `${role}_${roomName}_${Game.time}`, { memory: { role: role, room: roomName } });
  }
}

const E51N15 = {
  run: function () {

    const sourceLinks = [Game.getObjectById('65e6915fc337b3eff4b06c0e'),Game.getObjectById('65efa816d07c702251a4609c'),Game.getObjectById('65efc7d5f8f17c9f03583816')];
    const targetLink = Game.getObjectById('65e692fe41c2bdb886185a67');

    // Ensure both links are not in cooldown and the source link has enough energy
    for (const sourceLink of sourceLinks) {
      if (sourceLink.cooldown === 0 && targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        // Attempt to transfer as much energy as possible to the target link
        sourceLink.transferEnergy(targetLink);
      }
    }

    const roomName = 'E51N15';
    minCreeps('minim', 1, [CARRY, CARRY, MOVE], 'HomeSpawn', roomName);
    minCreeps('nurse', 2, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);
    minCreeps('picker', 2, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);
    minCreeps('mineralHarvester', 0, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK], 'HomeSpawn', roomName);
    minCreeps('worker', 1, [
      WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE
    ], 'HomeSpawn', roomName);
    //minCreeps('remoteWorker', 3, roleWorker.bodyTemplate, 'HomeSpawn', roomName);
    minCreeps('repairer', 2, [WORK, CARRY, CARRY, MOVE, MOVE], 'HomeSpawn', roomName);
    minCreeps('E52N15Harvester', 3, [
      WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);

    minCreeps('drone', 2, [CLAIM, MOVE], 'HomeSpawn', roomName);
    const sources = Game.spawns['HomeSpawn'].room.find(FIND_SOURCES);

    // Ensure one harvester per source
    sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) {
        const newName = 'Harvester' + Game.time;
        Game.spawns['HomeSpawn'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {
          memory: {
            role: 'harvester',
            sourceId: source.id
          }
        });
      }
    });

    // Hauler per source
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 0) {
        const newName = 'Hauler' + Game.time;
        Game.spawns['HomeSpawn'].spawnCreep([
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ], newName, {
          memory: { role: 'hauler', sourceId: source.id }
        });
      }
    });
  }
};

module.exports = E51N15;
