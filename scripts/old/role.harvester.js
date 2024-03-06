//const jobs = require('./jobs');

const bodyParts = [
  { part: 'MOVE', cost: 50 },
  { part: 'WORK', cost: 100 },
  { part: 'CARRY', cost: 50 },
  { part: 'ATTACK', cost: 80 },
  { part: 'RANGED_ATTACK', cost: 150 },
  { part: 'HEAL', cost: 250 },
  { part: 'TOUGH', cost: 10 },
  { part: 'CLAIM', cost: 600 }
];

const roleHarvester = {
  // The role name helps identify the purpose of this module
  role: 'harvester',
  status: 'idle',

  // Body parts for the creep are defined here, but it's empty for now
  bodyTemplate: [MOVE, MOVE, CARRY, WORK],

  // placeholder, store the task "harvest" in memory
  task: 'harvest',

  run: function (creep) {
    console.log(`harvester.run ${creep.name}`);
    if (creep.memory.status === undefined) {
      creep.memory.status = '💤 idle';
    }
    if (creep.memory.timeInStatus === undefined) {
      creep.memory.timeInStatus = 0;
    }
    creep.memory.timeInStatus++;
    if (creep.memory.target === undefined) {
      creep.memory.target = { id: '', type: '', pos: { x: 0, y: 0 } };
    }

    console.log(`Harvester: ${creep.name} - ${creep.memory.status} - ${creep.store.getFreeCapacity(RESOURCE_ENERGY)}`);

    const tasks = {
      harvest: function (creep) {
        creep.memory.status = '🔄 harvest';
        creep.memory.color = '#af0';
        console.log(`Harvester: ${creep.name} - ${creep.memory.status} - ${Number(creep.store.getFreeCapacity(RESOURCE_ENERGY))}`);
        // if full, switch to idle status to pick up a new task
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          console.log('Full, switching to idle');
          creep.memory.status = '💤 idle';
          return;
        }

        // Find the closest source of energy from dropped resources, tombstones, or ruins
        const targets = creep.room.find(FIND_DROPPED_RESOURCES, {
          filter: (resource) => resource.resourceType === RESOURCE_ENERGY
        }).concat(
          creep.room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          }),
          creep.room.find(FIND_RUINS, {
            filter: (ruin) => ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          })
        );

        const closestEnergySource = creep.pos.findClosestByPath(targets);

        // If there is a closest energy source, attempt to pick it up or withdraw
        if (closestEnergySource) {
          if (closestEnergySource instanceof Resource && creep.pickup(closestEnergySource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestEnergySource, { visualizePathStyle: { stroke: creep.memory.color } });
          } else if ((closestEnergySource instanceof Tombstone || closestEnergySource instanceof Ruin) &&
            creep.withdraw(closestEnergySource, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestEnergySource, { visualizePathStyle: { stroke: creep.memory.color } });
          }
        } else {
          // Original harvest code for energy sources
          const sources = creep.room.find(FIND_SOURCES);
          if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], { visualizePathStyle: { stroke: creep.memory.color } });
          }
        }
      },
      store: function (creep) {
        creep.memory.status = '🔋 store';
        creep.memory.color = '#0af';
        // don't go back to idle until out of storage targets or creep is empty

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
          const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN ||
                  structure.structureType === STRUCTURE_TOWER) && // Add more structure types as needed
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
          });
          console.log('Storage target: ' + target);
          // If a suitable target is found, attempt to transfer energy
          if (target) {
            const transferResult = creep.transfer(target, RESOURCE_ENERGY);
            if (transferResult === ERR_NOT_IN_RANGE) {
              creep.moveTo(target, { visualizePathStyle: { stroke: creep.memory.color } });
            }
          } else {
            console.log('No storage targets found');
            // If no storage capacity left, switch to idle status
            creep.memory.status = '💤 idle';
          }
        } else {
          console.log('No energy to store');
          // If no energy to store, switch to idle status
          creep.memory.status = '💤 idle';
        }
      },
      build: function (creep) {
        // Initialize building flag if not present
        if (creep.memory.building === undefined) {
          creep.memory.building = false;
        }

        // Check energy level to update task status
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
          creep.memory.status = '🚧 build';
          creep.memory.building = true;
        } else {
          creep.memory.status = '💤 idle';
          creep.memory.building = false;
          return; // Exit if no energy to continue building
        }

        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length > 0) {
          // If there are targets, continue or start building
          const target = creep.pos.findClosestByPath(targets);
          if (creep.build(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#fa0' } });
          }
        } else {
          // No targets left, can switch tasks
          creep.memory.status = '💤 idle';
          creep.memory.building = false;
        }

        // Additional logic here to prevent switching to harvest if still engaged in building
        // This could be done by checking the building flag before assigning a new task
      },
      upgrade: function (creep) {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
          creep.memory.status = '💤 idle';
          return; // Exit early if no energy is left
        }
        // At this point, the creep has energy. Set its status to upgrading
        creep.memory.status = '⚡ upgrade';

        // Attempt to upgrade the controller
        const upgradeResult = creep.upgradeController(creep.room.controller);
        if (upgradeResult === ERR_NOT_IN_RANGE) {
          // Move towards the controller if not in range
          creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#fa0' } });
        }
      }
    };
    const oldStatus = creep.memory.status;
    // emulate jobs by using tasks as steps. Start with criteria for the harvest and store tasks
    const storeTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER) && // Add more structure types as needed
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    // if there are no structures in which to store energy, build something
    const buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);

    // If empty, or idle, harvest until full
    // If full, store until empty or all storage targets are full
    // If all storage targets are full, build
    // If nothing to build, upgrade

    console.log(`Harvester: ${creep.name} - ${creep.memory.status} - ${creep.store.getFreeCapacity(RESOURCE_ENERGY)}`);
    console.log('Do Harvest?:' + (creep.memory.status === '💤 idle' || creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0));
    if ((creep.memory.status === '💤 idle' && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) || creep.memory.status === '🔄 harvest')  {
      creep.memory.status = '🔄 harvest';
      tasks.harvest(creep);
    } else if (storeTarget) { // don't go back to idle until out of storage targets or creep is empty
      creep.memory.status = '🔋 store';
      tasks.store(creep);
    } else if (buildTargets.length) {
      creep.memory.status = '🚧 build';
      tasks.build(creep);
    } else {
      creep.memory.status = '⚡ upgrade';
      tasks.upgrade(creep);
    }

    // if status has changed, say the new status
    if (oldStatus !== creep.memory.status) {
      creep.memory.timeInStatus = 0;
      creep.say(creep.memory.status);
    }
    console.log(`Harvester: ${creep.name} - ${creep.memory.status}`);
  }
};

module.exports = roleHarvester;
