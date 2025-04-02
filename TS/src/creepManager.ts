/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepManager');
 * mod.thing == 'a thing'; // true
 */

interface CreepRole {
  run: (creep: Creep) => void;
}

const roleWorker = require('role.worker');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleMinim = require('role.minim');
const roleDrone = require('role.drone');
const remoteWorker = require('role.remoteWorker');
const roleRemoteHarvester = require('./role.remoteHarvester');
const roleRemoteHauler = require('./role.remoteHauler');
const roleSoldier = require('./role.soldier');
const roleRemoteDefender = require('./role.remoteDefender');
const roleMineralHarvester = require('role.mineralHarvester');
const roleLongRangeHauler = require('role.longRangeHauler');
const roleCourier = require('role.courier');
const roleColonist = require('role.colonist')

export default {
    // Run creeps
    roleMap: {
      harvester: roleHarvester,
      hauler: roleHauler,
      worker: roleWorker,
      nurse: roleNurse,
      repairer: roleRepairer,
      picker: rolePicker,
      minim: roleMinim,
      drone: roleDrone,
      //remoteWorker: remoteWorker,
      remoteHarvester: roleRemoteHarvester,
      remoteHauler: roleRemoteHauler,
      soldier: roleSoldier,
      remoteDefender: roleRemoteDefender,
      mineralHarvester: roleMineralHarvester,
      //longRangeHauler: roleLongRangeHauler,
      courier: roleCourier,
      colonist: roleColonist
    },

    run: function () {
      try {
        for (const name in Game.creeps) {
          const creep = Game.creeps[name];
          //console.log(`[DEBUG] Running creep ${creep.name}, creep role: ${creep.memory.role}`);
          if (this.roleMap[creep.memory.role]) {
            if (!creep.memory.room) creep.memory.room = creep.room.name;

            this.roleMap[creep.memory.role].run(creep);
          }
          //console.log(`[DEBUG] creepManager.run(${name}) CPU Used: ${Game.cpu.getUsed().toFixed(2)}`);
        }
      } catch (e) {
        console.log(`Error in creepManager.run: ${e}`);
      }
    }
};