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
  handleRoom: function (room) {
    const sourceLinks = [Game.getObjectById('65f32d6764961ce8eedf7232'),Game.getObjectById('65f94a4c7901245d0d48ac25')];
    const targetLink = Game.getObjectById('65f332fb1cfdbd6530ec2426');

    // Ensure both links are not in cooldown and the source link has enough energy
    for (const sourceLink of sourceLinks) {
      // If source link is not in cooldown and target link has free capacity
      if (sourceLink.cooldown === 0 && targetLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        // Attempt to transfer as much energy as possible to the target link
        sourceLink.transferEnergy(targetLink);
      }
    }

    const roomName = room.name;
    const sources = Game.spawns['E52N17'].room.find(FIND_SOURCES);

    // Ensure one harvester per source
    sources.forEach(source => {
      const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
      if (harvestersForSource.length < 1) { // If no harvester for this source
        // Spawning a drop harvester
        Game.spawns['E52N17'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], `harvester_${roomName}_${Game.time}`, {
          memory: { role: 'harvester', sourceId: source.id }
        });
      }
    });

    // Hauler per source
    sources.forEach(source => {
      if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 0) {
        const newName = 'Hauler' + Game.time;
        Game.spawns['E52N17'].spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {
          memory: { role: 'hauler', sourceId: source.id }
        });
      }
    });

    minCreeps('targetDrone', 1, [CLAIM, MOVE], 'E52N17', room.name);
    minCreeps('E53N17drone', 0, [CLAIM, MOVE], 'E52N17', room.name);
    minCreeps('nurse', 2, [CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, MOVE], 'E52N17', room.name);
    minCreeps('minim', 1, [CARRY, CARRY, CARRY, CARRY, MOVE], 'E52N17', room.name);
    minCreeps('picker', 2, [CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE], 'E52N17', room.name);
    //minCreeps('remoteDefender', 1, [TOUGH, RANGED_ATTACK, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, MOVE, MOVE, RANGED_ATTACK], 'E52N17', roomName);
    minCreeps('worker', 2, [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'E52N17', room.name);
    minCreeps('repairer', 2, [WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'E52N17', room.name);
    //minCreeps('energyTransporter', 0, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    //minCreeps('remoteWorker', 2, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'Spawn1', room.name);
    minCreeps('mineralHarvester', 1, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'E52N17', room.name);
    //minCreeps('remoteDefender', 2, [TOUGH, RANGED_ATTACK, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE, TOUGH, RANGED_ATTACK, MOVE, MOVE], 'E52N17', roomName);
    minCreeps('E53N17Harvester', 0, [
      WORK, WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'E52N17', room.name);

  }
};
