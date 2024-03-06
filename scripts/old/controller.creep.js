const roleWorker = require('role.worker');
const roleDefender = require('role.defender');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleDefenseRepairer = require('role.defenseRepairer');
const roleRemoteHarvester = require('role.remoteHarvester');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleScout = require('role.scout');
const roleDrone = require('role.drone'); // the drone claims a room
const E51N16worker = require('E51N16.worker'); // the worker for the E51N16 room
const roleMineralHarvester = require('role.mineralHarvester');

function minCreeps(role, minCount, bodyConfig, spawnName, roomName) {
  const activeCreeps = _.filter(Game.creeps, (c) => c.memory.role === role && c.room.name === roomName);
  if (_.size(activeCreeps) < minCount) {
    Game.spawns[spawnName].spawnCreep(bodyConfig, `${role}_${roomName}_${Game.time}`, { memory: { role: role, room: roomName } });
  }
}

const creep = {
  run: function () {
    roomName = 'E51N15';
    minCreeps('nurse', 2, [CARRY, CARRY, MOVE], 'HomeSpawn', roomName);
    minCreeps('picker', 2, rolePicker.bodyTemplate, 'HomeSpawn', roomName);
    //minCreeps('mineralHarvester', 0, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK], 'HomeSpawn', roomName);
    minCreeps('worker', 4, roleWorker.bodyTemplate, 'HomeSpawn', roomName);
    minCreeps('repairer', 2, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'HomeSpawn', roomName);

    const sources = Game.spawns['HomeSpawn'].room.find(FIND_SOURCES);

    // Ensure one harvester per source
    sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) { // If no harvester for this source
        //console.log(`source ${source.id}`);
        //console.log(`harvesters for source ${harvestersForSource.length}`);
        const newName = 'Harvester' + Game.time;
        Game.spawns['HomeSpawn'].spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], newName, {
          memory: {
            role: 'harvester',
            sourceId: source.id
          }
        });
      }
    });

    // Hauler, 9 carry, 9 move
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 2) {
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
      if (creep.memory.role === 'E51N16.worker') E51N16worker.run(creep);
      if (creep.memory.role === 'picker') rolePicker.run(creep);
      if (creep.memory.role === 'mineralHarvester') roleMineralHarvester.run(creep);
      if (creep.memory.role === 'defender') roleDefender.run(creep);
      if (creep.memory.role === 'hauler') roleHauler.run(creep);
      if (creep.memory.role === 'harvester') roleHarvester.run(creep);
      if (creep.memory.role === 'remoteHarvester') roleRemoteHarvester.run(creep);
      if (creep.memory.role === 'repairer') roleRepairer.run(creep);
      if (creep.memory.role === 'defenseRepairer') roleDefenseRepairer.run(creep);
      if (creep.memory.role === 'nurse') roleNurse.run(creep);
    }
  }
};

module.exports = creep;
