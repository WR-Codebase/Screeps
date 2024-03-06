const jobs = require('jobs');
const rolePicker = require('role.picker');
const roleWorker = require('role.worker');
const roleDrone = require('role.drone');
const roleDefender = require('role.defender');
const roleHauler = require('role.hauler');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleEnergyTransporter = require('role.energyTransporter');
const roleMinim = require('role.minim');

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

    // Get dropHarvesters in E51N16
    const dropHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'dropHarvester' && creep.room.name === room.name);

    for (const creep of dropHarvesters) {
      this.runDropHarvester(creep);
    }
    //minCreeps('nurseHauler', 1, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('minim', 1, [WORK, CARRY, MOVE], 'Spawn1', room.name);
    minCreeps('picker', 1, rolePicker.bodyTemplate, 'Spawn1', room.name);
    minCreeps('worker', 3, roleWorker.bodyTemplate, 'Spawn1', room.name);
    minCreeps('repairer', 1, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('nurse', 1, [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], 'Spawn1', room.name);
    //minCreeps('energyTransporter', 0, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('E52N16Harvester', 2, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    //minCreeps('mineralHarvester', 1, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);

    /** for all creeps if room is E51N16 and role is nurse or hauler, run the nurseHauler.run(creep) function
     for (let name in Game.creeps) {
     let creep = Game.creeps[name];
     if (creep.memory.room === 'E51N16' && (creep.memory.role === 'nurse' || creep.memory.role === 'nurseHauler')) {
     //console.log("Running nurseHauler.run(creep) function");
     roleNurseHauler.run(creep);
     }
     }
     **/

    // Hauler, 9 carry, 9 move
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 1) {
        const newName = 'Hauler' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ], newName, {
          memory: { role: 'hauler', sourceId: source.id }
        });
      }
    });
  }
};
