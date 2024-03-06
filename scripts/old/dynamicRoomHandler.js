const jobs = require('jobs');
const rolePicker = require("./role.picker");
const roleWorker = require("./role.worker");
const roleDrone = require("./role.drone");
const E51N16worker = require("./E51N16.worker");
const roleDefender = require("./role.defender");
const roleHauler = require("./role.hauler");
const roleHarvester = require("./role.harvester");
const roleRemoteHarvester = require("./role.remoteHarvester");
const roleRepairer = require("./role.repairer");
const roleDefenseRepairer = require("./role.defenseRepairer");
const roleNurse = require("./role.nurse");

// dynamicRoomHandler.js
module.exports = {
  handleRoom: function (room) {
        // Update this code to only be in the current room
        const activeNurses = _.filter(Game.creeps, (c) => c.memory.role === 'nurse' && c.room.name === room.name);
        if (_.size(activeNurses) < 2) {
          const newName = 'Nurse' + Game.time;
          Game.spawns['Spawn1'].spawnCreep([CARRY, CARRY, MOVE], newName, { memory: { role: 'nurse' } });
        }

        const activePickers = _.filter(Game.creeps, (c) => c.memory.role === 'picker' && c.room.name === room.name);
        if (_.size(activePickers) < 1) {
          const newName = 'Picker' + Game.time;
          Game.spawns['Spawn1'].spawnCreep(rolePicker.bodyTemplate, newName, { memory: { role: 'picker' } });
        }

        const activeWorkers = _.filter(Game.creeps, (c) => c.memory.role === 'worker' && c.room.name === room.name);
        if (_.size(activeWorkers) < 2) {
          const newName = 'Worker' + Game.time;
          Game.spawns['Spawn1'].spawnCreep(roleWorker.bodyTemplate, newName, { memory: { role: 'worker' } });
        }

        const sources = Game.spawns['Spawn1'].room.find(FIND_SOURCES);

        // Ensure one harvester per source
        sources.forEach(source => {
          const harvestersForSource = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester' && creep.memory.sourceId === source.id);
          if (harvestersForSource.length < 1) { // If no harvester for this source
            //console.log(`source ${source.id}`);
            //console.log(`harvesters for source ${harvestersForSource.length}`);
            const newName = 'Harvester' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], newName, {
              memory: {
                role: 'harvester',
                sourceId: source.id
              }
            });
          }
        });

        // Hauler, 9 carry, 9 move
        sources.forEach(source => {
          if (_.filter(Game.creeps, (creep) => creep.memory.role === 'hauler' && creep.memory.sourceId === source.id).length < 1) {
            const newName = 'Hauler' + Game.time;
            Game.spawns['Spawn1'].spawnCreep([
              CARRY, CARRY, CARRY, CARRY,
              MOVE, MOVE, MOVE, MOVE
            ], newName, {
              memory: { role: 'hauler', sourceId: source.id }
            });
          }
        });

        // Repairers
        const activeRepairers = _.filter(Game.creeps, (c) => c.memory.role === 'repairer' && c.room.name === room.name);
        if (_.size(activeRepairers) < 1) {
          const newName = 'Repairer' + Game.time;
          Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, CARRY, MOVE, MOVE, MOVE], newName, { memory: { role: 'repairer' } });
        }

    if (room.controller && room.controller.my) {
      this.manageRoom(room);
    } else {
      this.exploreAndClaim(room);
    }
  },

  manageRoom: function (room) {
  },

  exploreAndClaim: function (room) {
  }
};
