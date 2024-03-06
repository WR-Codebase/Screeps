// jobs.js
const jobs = {
  refillTowers: function (creep) {
    // Refill towers in the room
    const towers = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType === STRUCTURE_TOWER
          && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
    if (towers.length > 0) {
      // If creep has at least 50 energy, fill the nearest tower that needs energy
      if (creep.store[RESOURCE_ENERGY] >= 50) {
        const target = creep.pos.findClosestByPath(towers);
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true });
        }
      } else {
        // If the creep has less than 50 energy, collect more
        this.collect(creep);
      }
    }
  },
  explore: function (creep) {
    // Initialization with homeRoom
    if (!creep.memory.homeRoom) creep.memory.homeRoom = creep.room.name;

    // Ensure default values for exploring and targetRoom at the start
    if (typeof creep.memory.exploring === 'undefined') creep.memory.exploring = false;
    if (!creep.memory.target) {
      // Set a default target room if none is set
      const exits = Game.map.describeExits(creep.room.name);
      const exitKeys = Object.keys(exits);
      if (exitKeys.length > 0) {
        const randomExitDirection = exitKeys[Math.floor(Math.random() * exitKeys.length)];
        creep.memory.target = {
          roomName: exits[randomExitDirection],
          exitId: randomExitDirection // Assuming exitId can be derived or matched from exitKeys
        };
      }
    }

    // Detect room transition by checking if the current room name matches the target room name
    if (creep.memory.lastRoom && creep.memory.lastRoom !== creep.room.name) {
      // The creep has changed rooms
      console.log(`${creep.name} has moved from ${creep.memory.lastRoom} to ${creep.room.name}`);
      // Call performExplorationTasks to update Memory.rooms with new observations
      this.performExplorationTasks(creep);
      // Update the pheromones for the exit used to enter this room
      if (creep.memory.target && creep.memory.target.exitId) {
        const exitId = creep.memory.target.exitId;
        // Assuming updateExitPheromones function is implemented as discussed
        this.updateExitPheromones(creep.room.name, exitId, /* foundHostiles */ false); // Example call, adjust based on actual observations
      }
      // After updating, select a new target for exploration
      this.selectNewTarget(creep);
    }
    creep.memory.lastRoom = creep.room.name; // Update lastRoom for the next tick

    // If the creep has not yet started exploring the target room, move towards the target room
    if (!creep.memory.exploring && creep.memory.target && creep.memory.target.roomName !== creep.room.name) {
      const exitDir = Game.map.findExit(creep.room.name, creep.memory.target.roomName);
      const exit = creep.pos.findClosestByRange(exitDir);
      creep.moveTo(exit);
    } else if (creep.memory.target && creep.memory.target.roomName === creep.room.name) {
      // The creep is in the target room and can start/continue exploring
      creep.memory.exploring = true;
      console.log(`${creep.name} is exploring room ${creep.room.name}`);
      // Perform room-specific exploration tasks
      this.performExplorationTasks(creep);
    }
  },
  performExplorationTasks: function (creep) {
    // Ensure Memory.rooms is initialized
    Memory.rooms = Memory.rooms || {};

    // Initialize data structure for the current room if not already present
    const roomName = creep.room.name;
    Memory.rooms[roomName] = Memory.rooms[roomName] || {};
    if (!Memory.rooms[roomName].exits) {
      Memory.rooms[roomName].exits = {};
    }

    // Survey and store room details
    const sources = creep.room.find(FIND_SOURCES).map(source => {
      return { id: source.id, pos: source.pos };
    });
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS).map(hostile => {
      return { id: hostile.id, type: hostile.owner.username, pos: hostile.pos };
    });
    const structures = creep.room.find(FIND_STRUCTURES).map(structure => {
      return { id: structure.id, type: structure.structureType, pos: structure.pos };
    });

    // Update Memory.rooms with findings
    Memory.rooms[roomName].sources = sources;
    Memory.rooms[roomName].hostiles = hostiles;
    Memory.rooms[roomName].structures = structures;

    console.log(`Scout ${creep.name} has documented room ${roomName}.`);
  },
  selectNewTarget: function (creep) {
    // Retrieve available exits from the current room
    const exits = Game.map.describeExits(creep.room.name);
    const exitKeys = Object.keys(exits);

    // Strategy for selecting a new target room
    // This example randomly selects a new target; you might implement more strategic selection criteria
    if (exitKeys.length > 0) {
      const randomExitDirection = exitKeys[Math.floor(Math.random() * exitKeys.length)];
      const newTargetRoom = exits[randomExitDirection];

      // Update the creep's memory with the new target information
      creep.memory.target = {
        roomName: newTargetRoom,
        exitId: randomExitDirection // Adjust this logic based on how you plan to use exitId
      };

      console.log(`${creep.name} has a new target room: ${newTargetRoom}`);
    } else {
      console.log(`No available exits from room ${creep.room.name} for ${creep.name}.`);
      // If no exits are available, you might choose to send the creep back to a default room or handle differently
    }
  },
  updateExitPheromones: function (roomName, exitName, foundHostiles) {
    // Ensure the exit's pheromone data is initialized
    let exitData = Memory.rooms[roomName].exits[exitName];
    if (!exitData) {
      Memory.rooms[roomName].exits[exitName] = { hostiles: { weight: 0, true: 0, false: 0 } };
      exitData = Memory.rooms[roomName].exits[exitName];
    }

    // Update based on observation
    if (foundHostiles) {
      exitData.hostiles.true++;
    } else {
      exitData.hostiles.false++;
    }

    // Recalculate and update the probability weight
    const totalObservations = exitData.hostiles.true + exitData.hostiles.false;
    exitData.hostiles.weight = totalObservations > 0 ? exitData.hostiles.true / totalObservations : 0;

    // Optionally, log the update for debugging
    console.log(`Updated pheromones for exit ${exitName} in room ${roomName}: ${JSON.stringify(exitData.hostiles)}`);
  },
  idle: function (creep) {
    // Logic for what to do when there's nothing else to do
    console.log(`${creep.name} is idling`);
    // Perhaps move to a designated rally point or room center
  },
  shouldExplore: function (creep) {
    // Determine if the creep should explore
    // This could be based on whether there are unexplored rooms or other conditions
    // Placeholder logic
    return true;
  },
  shouldReport: function (creep) {
    // Determine if the creep has information to report back
    // Placeholder logic
    return false;
  },
  report: function (creep) {
    // Assuming the creep has stored its findings in its memory under a 'findings' property
    const findings = creep.memory.findings;

    if (findings) {
      console.log(`Scout Report by ${creep.name}:`);

      // Example findings could include enemy presence, resources, etc.
      if (findings.enemies) {
        console.log(`- Enemies spotted: ${findings.enemies.length}`);
        findings.enemies.forEach(enemy => {
          console.log(`  - ${enemy.type} at ${enemy.location}`);
        });
      }

      if (findings.resources) {
        console.log(`- Resources identified:`);
        findings.resources.forEach(resource => {
          console.log(`  - ${resource.type} at ${resource.location}`);
        });
      }

      if (findings.terrain) {
        console.log(`- Terrain features: ${findings.terrain}`);
      }

      // Here you might also decide to save the findings to Memory for analysis or future reference
      // Memory.scoutReports = Memory.scoutReports || [];
      // Memory.scoutReports.push(findings);
    } else {
      console.log(`${creep.name} has no findings to report.`);
    }

    // Clear findings after reporting
    delete creep.memory.findings;
  },
  nourish: function (creep) {
    // If the creep already has a target and that target is not yet full, do not get a new target
    if (creep.memory.targetId) {
      if (Game.getObjectById(creep.memory.targetId).store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        creep.memory.targetId = null;
        return;
      }
    } else {
      // If the creep has no target or the target is full, find a new target
      creep.memory.targetId = null;

      // Needs to be able to filter out already targeted structures and sort the rest ascending by distance
      const targets = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_SPAWN
              || structure.structureType === STRUCTURE_EXTENSION)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      }).filter((structure) => {
        return !_.some(Game.creeps, { memory: { targetId: structure.id } });
      }).sort((a, b) => {
        return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
      });
      if (targets.length > 0) {
        creep.memory.targetId = targets[0].id;
      }
    }
    if (creep.memory.targetId) {
      const target = Game.getObjectById(creep.memory.targetId);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#f96' }, ignoreCreeps: false });
      }
    }
  },
  getRepairTarget: function (creep) {
    const targets = creep.room.find(FIND_STRUCTURES, { filter: object => object.hits < object.hitsMax });
    const untargetedTargets = targets.filter(target => {
      return !_.some(Game.creeps, { memory: { target: target.id } });
    });

    if (untargetedTargets.length > 0) {
      untargetedTargets.sort((a, b) => a.hits - b.hits);
      creep.memory.target = untargetedTargets[0].id;
    }
  },
  repair: function (creep) {
    if (creep.memory.target) {
      //console.log(`Creep ${creep.name} is repairing target ${creep.memory.target}`);
    } else {
      //console.log(`Creep ${creep.name} has no repair target`);
      this.getRepairTarget(creep);
      //console.log(`Creep ${creep.name} has new repair target ${creep.memory.target}`);
    }

    const targetToRepair = Game.getObjectById(creep.memory.target);
    if (targetToRepair) {
      if (creep.repair(targetToRepair) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targetToRepair, { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: false });
      }
      // If target is full, unset target
      if (targetToRepair.hits === targetToRepair.hitsMax) {
        delete creep.memory.target;
      }
    } else {
      delete creep.memory.target;
    }
  },
  build: function (creep) {
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: false });
      }
    }
  },
  collect: function (creep) {
    let target = null;

    //console.log(`Searching for energy sources for ${creep.name}, priority: ${creep.memory.energyPriority}`);
    // Use the creep's personal priority list if available, otherwise default
    const priorityTargets = creep.memory.energyPriority || ['TOMBSTONE', 'RUIN', 'CONTAINER', 'STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
    const energyRange = creep.memory.droppedEnergyRange || null; // Applies to DROPPED_RESOURCE, TOMBSTONE, RUIN

    for (const targetType of priorityTargets) {
      //console.log(`Searching for ${targetType}...`);
      if (targetType === 'DROPPED_RESOURCE') {
        if (energyRange === null) {
          // If range is null, use findClosestByPath for maximum flexibility
          target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType === RESOURCE_ENERGY
          });
          if (target) break; // Exit loop if a target is found
        } else {
          // If a specific range is defined, find targets within that range
          target = creep.pos.findInRange(FIND_DROPPED_RESOURCES, energyRange, {
            filter: (r) => r.resourceType === RESOURCE_ENERGY
          })[0]; // Select the first matching target within range
          if (target) break; // Exit loop if a target is found
        }
      } else if (targetType === 'TOMBSTONE') {
        if (energyRange === null) {
          target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (t) => t.store[RESOURCE_ENERGY] > 0
          });
          if (target) break;
        } else {
          // If a specific range is defined, find tombstones within that range
          target = creep.pos.findInRange(FIND_TOMBSTONES, energyRange, {
            filter: (t) => t.store[RESOURCE_ENERGY] > 0
          })[0];
          if (target) break;
        }
      } else if (targetType === 'RUIN') {
        // Use the same logic as for tombstones and dropped resources
        if (energyRange === null) {
          target = creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (r) => r.store[RESOURCE_ENERGY] > 0
          });
          if (target) break;
        } else {
          // Select the first matching ruin within range
          target = creep.pos.findInRange(FIND_RUINS, energyRange, {
            filter: (r) => r.store[RESOURCE_ENERGY] > 0
          })[0];
          if (target) break;
        }
      } else if (targetType === 'CONTAINER' || targetType === 'STORAGE') {
        // Find the closest container or storage
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => (s.structureType === STRUCTURE_CONTAINER
              || s.structureType === STRUCTURE_STORAGE)
            && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        });
        //console.log(`Found ${targetType} ${target}`);
      } else if (targetType === 'SOURCE') {
        // Finding the closest active source
        target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      }

      if (target) break; // Found a target, exit the loop
    }

    if (!target) return; // Exit if no suitable target is found

    // Attempt to interact with the target based on its type
    if (target instanceof Resource && creep.pickup(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: false });
    } else if ((target instanceof Tombstone
        || target instanceof Ruin
        || target instanceof StructureContainer
        || target instanceof StructureStorage)
      && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: false });
    } else if (target instanceof Source
      && creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: false });
    }
  },
  upgrade: function (creep) {

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: false });
      }
    } else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: false });
      }
    }
  }

  // Rest of the jobs.js functions
};

module.exports = jobs;
