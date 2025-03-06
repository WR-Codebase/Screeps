const roleWorker = require('role.worker');
const roleRemoteDefender = require('role.remoteDefender');
const roleHarvester = require('role.harvester');
const roleRepairer = require('role.repairer');
const roleNurse = require('role.nurse');
const roleHauler = require('role.hauler');
const rolePicker = require('role.picker');
const roleScout = require('role.scout');
const roleDrone = require('role.drone'); // the drone claims a room
const roleTargetDrone = require('role.targetDrone'); // the drone claims a room
const roleMineralHarvester = require('role.mineralHarvester');
const roleEnergyTransporter = require('role.energyTransporter');
const roleMinim = require('role.minim');
const roleE52N16Harvester = require('role.E52N16Harvester');
const roleE52N15Harvester = require('role.E52N15Harvester');
const roleE53N17Harvester = require('role.E53N17Harvester');
const roleE53N17drone = require('role.E53N17drone');
const Traveler = require('Traveler');
//const Target = require('Target');
const jobs = require('jobs');
const E51N15 = require('E51N15Handler');
const E51N16 = require('E51N16Handler');
const E52N17 = require('E52N17Handler');

// TODO: For each room, check for spawns

function wrRooms() {
  console.log('Checking rooms for spawns');
  for (const roomName in Game.rooms) {
    console.log(`Checking room ${roomName}`);
    const room = Game.rooms[roomName];
    if (room.controller && room.controller.my) {
      // Check for spawns
      const spawns = room.find(FIND_MY_SPAWNS);
      if (spawns.length === 0) {
        console.log(`No spawns found in room ${roomName}`);
      } else {
        // list spawns
        console.log(`Spawns in room ${roomName}:`);

        // TODO: When we have multiple spawns we'll need to determine which are busy when assigning tasks, etc.
        spawns.forEach(spawn => {
          console.log(`Spawn ${spawn.name}`);
        });
        
      }
    }
  }
}

/**
 * Reference data

 const statuses = {
  idle: '💤 idle',
  charging: '⚡ charging',
  collect: '🔄 collect',
  building: '🚧 building',
  upgrading: '⬆ upgrading',
  repairing: '🔧 repairing',
  hauling: '🚚 hauling' // or delivering
  nursing: '🍼 nurse'
 };

 const bodyParts = [
 {part: 'MOVE', cost: 50}, // provides movement for one non-movement part
 {part: 'WORK', cost: 100}, // does 2 units of work per tick
 {part: 'CARRY', cost: 50}, // carries 50 energy units
 {part: 'ATTACK', cost: 80},
 {part: 'RANGED_ATTACK', cost: 150},
 {part: 'HEAL', cost: 250},
 {part: 'TOUGH', cost: 10},
 {part: 'CLAIM', cost: 600}
 ];

 */

/**
 * purgeMemory - removes no-longer-used memory entries
 * @returns {void}
 */
function purgeMemory() {
  // tidy up dead creeps
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}
// Run Room code here
const roomStrategies = {
  E51N15: function (room) {
    E51N15.run();
  },
  E51N16: function (room) {
    E51N16.handleRoom(room);
  },
  E52N17: function (room) {
    E52N17.handleRoom(room);
  }
};

module.exports.loop = function () {
  wrRooms();
  // log the current tick
  console.log(`Tick ${Game.time}`);
  // Purge memory of dead creeps not in game anymore
  purgeMemory();

  // Loop through each room controlled by your creeps
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    if (room && room.controller && room.controller.my) {
      // Check if we have a strategy defined for the room
      if (roomStrategies[roomName]) {
        roomStrategies[roomName](room);
      } else {
        // Optional: Implement a default room logic or log a warning
        //console.log(`No specific strategy defined for room ${roomName}. Implementing default strategy or skipping.`);
      }
    }
  }

  // Run Tower code here
  const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);

  towers.forEach(tower => {
    // Find the closest hostile unit
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      // Attack the closest hostile unit
      tower.attack(closestHostile);
      // Check if energy is over 500 and if so, find the most damaged structure and repair
    } else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 850) {
      // If no hostiles and energy is over 50%, find the most damaged structure and repair except for roads filter by structure.hits <= 200000
      const targets = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
          && structure.hits <= 150000
          && structure.structureType !== STRUCTURE_ROAD
          && structure.structureType !== STRUCTURE_WALL
      });//structure.structureType === STRUCTURE_RAMPART &&

      if (targets.length > 0) {
        // Sort the ramparts by hits in ascending order to find the most damaged one
        targets.sort((a, b) => a.hits - b.hits);
        // Repair the most damaged target
        tower.repair(targets[0]);
      }
    }
  });


  // Run creep code here
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.role === 'drone') roleDrone.run(creep);
    if (creep.memory.role === 'targetDrone') roleTargetDrone.run(creep);
    if (creep.memory.role === 'scout') roleScout.run(creep);
    if (creep.memory.role === 'worker') roleWorker.run(creep);
    if (creep.memory.role === 'picker') rolePicker.run(creep);
    if (creep.memory.role === 'mineralHarvester') roleMineralHarvester.run(creep);
    if (creep.memory.role === 'remoteDefender') roleRemoteDefender.run(creep);
    if (creep.memory.role === 'remoteWorker') roleRemoteWorker.run(creep);
    if (creep.memory.role === 'hauler') roleHauler.run(creep);
    if (creep.memory.role === 'harvester') roleHarvester.run(creep);
    if (creep.memory.role === 'repairer') roleRepairer.run(creep);
    if (creep.memory.role === 'nurse') roleNurse.run(creep);
    if (creep.memory.role === 'minim') roleMinim.run(creep);
    if (creep.memory.role === 'E53N17Harvester') roleE53N17Harvester.run(creep);
    if (creep.memory.role === 'E52N16Harvester') roleE52N16Harvester.run(creep);
    if (creep.memory.role === 'E52N15Harvester') roleE52N15Harvester.run(creep);
    if (creep.memory.role === 'E52N15MineralHarvester') roleE52N16Harvester.run(creep);
    if (creep.memory.role === 'energyTransporter') roleEnergyTransporter.run(creep);
    if (creep.memory.role === 'E53N17drone') roleE53N17drone.run(creep);
  }
};
