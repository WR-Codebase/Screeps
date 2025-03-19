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
          creep.travelTo(target, { visualizePathStyle: { stroke: '#0af' }, ignoreCreeps: true, stuckValue: 2 });
        }
      } else {
        // If the creep has less than 50 energy, collect more
        this.collect(creep);
      }
    }
  },
  idle: function (creep) {
    // Logic for what to do when there's nothing else to do
    //console.log(`${creep.name} is idling`);
  },
  nourish: function (creep) {
    //console.log(`${creep.name} is nourishing`);
    // If the creep already has a target and that target is not yet full, do not get a new target
    if (creep.memory.targetId) {
      //console.log(`${creep.name} has a target already, checking if it's full.`);
      const target = Game.getObjectById(creep.memory.targetId);
      if (!target) {
        //console.log(`${creep.name} has lost its target`);
        delete creep.memory.targetId;
        return;
      }

      // If structure type is not a spawn or extension, delete the target
      if (target.structureType !== STRUCTURE_SPAWN && target.structureType !== STRUCTURE_EXTENSION) {
        delete creep.memory.targetId;
        return;
      }
      // Check if the target still needs energy before attempting to transfer
      if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) { // throws an error if target doesn't have a store
        // Target is already full, clear the current targetId and find a new target next tick
        creep.memory.targetId = null;
        //console.log(`${creep.name} found its target already full, looking for a new target.`);
        return; // Exit the function to allow for new target selection in the next tick
      }
      //console.log(`${creep.name} attempting to transfer to ${target.structureType} at ${target.pos}, Energy: ${creep.store.getUsedCapacity(RESOURCE_ENERGY)}`);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#f96' }, ignoreCreeps: true, stuckValue: 2 });
      } else if (creep.transfer(target, RESOURCE_ENERGY) === OK) {
        //console.log(`${creep.name} transferred energy to ${target.structureType}`);
      } else {
        //console.log(`${creep.name} encountered an error while transferring energy to ${target.structureType}`);
        creep.memory.targetId = null;
        return;
      }
    } else {
      // If the creep has no target or the target is full, find a new target
      delete creep.memory.targetId;

      //console.log(`${creep.name} is looking for a new target`);
      // Needs to be able to filter out already targeted structures and sort the rest ascending by distance
      const targets = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_SPAWN
            || structure.structureType === STRUCTURE_EXTENSION)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
      }).sort((a, b) => {
        return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
      });

      if (targets.length > 0) {
        creep.memory.targetId = targets[0].id;
        //console.log(`${creep.name} found a new target: ${creep.memory.targetId}`);
      } else {
        //console.log(`${creep.name} found no new targets`);
        return;
      }
    }

    if (creep.memory.targetId) {
      const target = Game.getObjectById(creep.memory.targetId);
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#f96' }, ignoreCreeps: true, stuckValue: 2 });
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
        creep.travelTo(targetToRepair, {
          visualizePathStyle: { stroke: '#fa0' },
          ignoreCreeps: true,
          stuckValue: 2,
          reusePath: 20,  // Caches path for 20 ticks
          maxOps: 100      // Limits CPU spent on pathfinding
        });
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
    let target;
    if (creep.memory.targetId) {
      target = creep.memory.targetId;
    } else {
      target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    }
    if (target) {
      if (creep.build(target) === ERR_NOT_IN_RANGE) {
        creep.travelTo(target, { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: true, stuckValue: 2 });
      }
    } else {
      creep.memory.status = 'idle';
    }
  },
  collect: function (creep) {
    let target;

    // Use the creep's personal priority list if available, otherwise default
    const priorityTargets = creep.memory.energyPriority || ['TOMBSTONE', 'RUIN', 'CONTAINER_STORAGE', 'DROPPED_RESOURCE', 'SOURCE'];
    const energyRange = creep.memory.droppedEnergyRange || null; // Applies to DROPPED_RESOURCE, TOMBSTONE, RUIN

    //console.log(`${creep.name} is collecting energy`);
    if (creep.memory.targetId) {
      // If a target is no longer valid, remove it from creep memory
      const thisTarget = Game.getObjectById(creep.memory.targetId);
      if (thisTarget) {
        if (thisTarget.store && thisTarget.store[RESOURCE_ENERGY] === 0) {
          //console.log(`${creep.name}'s target ${creep.memory.targetId} is empty.`);
          delete creep.memory.targetId;
        }
        // if the target is not in the energy priority list, remove it from memory
        if (!(thisTarget instanceof Tombstone
          || thisTarget instanceof Ruin
          || thisTarget instanceof StructureContainer
          || thisTarget instanceof StructureStorage
          || thisTarget instanceof StructureLink
          || thisTarget instanceof Source
          || thisTarget instanceof Resource)) {
          delete creep.memory.targetId;
        }
      }
    }

    // Now that we have unset invalid targets, if it is not set, get a new target
    if (!creep.memory.targetId) {
      //console.log(`${creep.name} has no target, looking for a new one`);
      for (const targetType of priorityTargets) {
        //console.log(`${creep.name} is checking target type ${targetType}`);
        if (targetType === 'DROPPED_RESOURCE') {
          //  console.log(`${creep.name} is checking energy range ${energyRange}`);
          if (energyRange === null) {
            // If range is null, use findClosestByPath for maximum flexibility
            target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
              filter: (r) => r.resourceType === RESOURCE_ENERGY
            });

            // try again without filters
            if (!target) {
              target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            }
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
        } else if (targetType === 'CONTAINER_STORAGE') {
          // Find the closest container or storage with energy
          target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_CONTAINER
              || s.structureType === STRUCTURE_STORAGE)
              && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          });

        } else if (targetType === 'CONTAINER') {
          // Find the closest container with energy
          target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
          });
        } else if (targetType === 'STORAGE') {
          // Find the closest container or storage
          target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_STORAGE)
              && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          });
          //console.log(`Found ${targetType} ${target}`);
        } else if (targetType === 'LINK') {
          // Find the closest Link with energy
          target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LINK && s.store[RESOURCE_ENERGY] > 0
          });
          if (target) break; // Exit loop if a target is found
        } else if (targetType === 'SOURCE') {
          // Finding the closest active source
          target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        }

        if (target) {
          // store it in memory
          creep.memory.targetId = target.id;
          break; // Exit loop if a target is found
        } else {
          //console.log(`No target found for ${targetType}`);
        }
      }
    }

    if (!target) {
      target = Game.getObjectById(creep.memory.targetId);
    }

    //console.log(`${creep.name} found target ${target}`);

    // Attempt to interact with the target based on its type
    if (target instanceof Resource && creep.pickup(target) === ERR_NOT_IN_RANGE) {
      creep.travelTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: true, stuckValue: 2 });
    } else if ((target instanceof Tombstone
      || target instanceof Ruin
      || target instanceof StructureContainer
      || target instanceof StructureStorage
      || target instanceof StructureLink)
      && creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      //console.log(`${creep.name} found ${target}, moving to it now`);

      creep.travelTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: true, stuckValue: 2 });
    } else if (target instanceof Source
      && creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.travelTo(target, { visualizePathStyle: { stroke: '#0fa' }, ignoreCreeps: true, stuckValue: 2 });
    }
  },

  upgrade: function (creep) {

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 Collect');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity() === 0) {
      creep.memory.upgrading = true;
      creep.say('⚡ Upgrade');
    }

    if (creep.memory.upgrading) {
              // if room sign is not "🤖 Beep boop! 🤖" set it
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        creep.travelTo(creep.room.controller, { visualizePathStyle: { stroke: '#fa0' }, ignoreCreeps: true, stuckValue: 2 });
      }
    } else {
      this.collect(creep);
    }
  }
};

module.exports = jobs;
