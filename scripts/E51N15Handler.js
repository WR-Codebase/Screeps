const roleWorker = require('role.worker');
const roleDefender = require('role.defender');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleScout = require('role.scout');
const roleDrone = require('role.drone'); // the drone claims a room
//const roleMineralHarvester = require('role.mineralHarvester');
const roleEnergyTransporter = require('role.energyTransporter');
const roleMinim = require('role.minim');
const roleE52N16Harvester = require('role.E52N16Harvester');
const roleE52N15Harvester = require('role.E52N15Harvester');
const { E51N16 } = require('./old/rooms');

function minCreeps(role, minCount, bodyConfig, spawnName, roomName) {
  const activeCreeps = _.filter(Game.creeps, (c) => c.memory.role === role && c.memory.room === roomName);
  if (_.size(activeCreeps) < minCount) {
    Game.spawns[spawnName].spawnCreep(bodyConfig, `${role}_${roomName}_${Game.time}`, { memory: { role: role, room: roomName } });
  }
}

const E51N15 = {
  run: function () {
    const roomName = 'E51N15';
    minCreeps('minim', 1, [WORK, CARRY, MOVE], 'HomeSpawn', roomName);
    minCreeps('nurse', 2, [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, MOVE], 'HomeSpawn', roomName);
    minCreeps('picker', 2, rolePicker.bodyTemplate, 'HomeSpawn', roomName);
    //minCreeps('mineralHarvester', 2, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK], 'HomeSpawn', roomName);
    minCreeps('worker', 3, roleWorker.bodyTemplate, 'HomeSpawn', roomName);
    minCreeps('repairer', 2, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);
    minCreeps('E52N15Harvester', 2, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],'HomeSpawn', roomName);
    //minCreeps('drone', 0, [CLAIM, MOVE], 'HomeSpawn', roomName);
    const sources = Game.spawns['HomeSpawn'].room.find(FIND_SOURCES);

    // Ensure one harvester per source
    sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) {
        const newName = 'Harvester' + Game.time;
        Game.spawns['HomeSpawn'].spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], newName, {
          memory: {
            role: 'harvester',
            sourceId: source.id
          }
        });
      }
    });

    // Hauler per source
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 1) {
        const newName = 'Hauler' + Game.time;
        Game.spawns['HomeSpawn'].spawnCreep([
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ], newName, {
          memory: { role: 'hauler', sourceId: source.id }
        });
      }
    });

    for (const creep of Object.values(Game.creeps)) {
      if (creep.memory.role === 'drone') roleDrone.run(creep);
      if (creep.memory.role === 'scout') roleScout.run(creep);
      if (creep.memory.role === 'worker') roleWorker.run(creep);
      if (creep.memory.role === 'picker') rolePicker.run(creep);
      //if (creep.memory.role === 'mineralHarvester') roleMineralHarvester.run(creep);
      if (creep.memory.role === 'defender') roleDefender.run(creep);
      if (creep.memory.role === 'hauler') roleHauler.run(creep);
      if (creep.memory.role === 'harvester') roleHarvester.run(creep);
      if (creep.memory.role === 'repairer') roleRepairer.run(creep);
      if (creep.memory.role === 'nurse') roleNurse.run(creep);
      if (creep.memory.role === 'minim') roleNurse.run(creep);
      if (creep.memory.role === 'E52N16Harvester') roleE52N16Harvester.run(creep);
      if (creep.memory.role === 'E52N15Harvester') roleE52N15Harvester.run(creep);
      if (creep.memory.role === 'E52N15MineralHarvester') roleE52N16Harvester.run(creep);
      if (creep.memory.role === 'energyTransporter') roleEnergyTransporter.run(creep);
    }
  }
};

module.exports = E51N15;
