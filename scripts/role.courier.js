const roleCourier = {
  roleName: 'courier',
  bodyTemplate: [CARRY, MOVE, CARRY, MOVE],

  /** @param {Creep} creep **/
  run: function (creep) {
    const wasDelivering = creep.memory.delivering;

    if (creep.store.getFreeCapacity() > 0 && !creep.memory.delivering) {
      // Only reset to step 1 if we're not already progressing past it
      if (creep.memory.roundStep === 3 || !creep.memory.roundStep) {
        creep.memory.roundStep = 1;
      }
      if (this.shouldPick(creep)) {
        this.collect(creep);
      } else {
        creep.memory.delivering = false;
        this.makeRounds(creep);
      }
    } else if (creep.store.getUsedCapacity() === 0) {
      creep.memory.delivering = false;
      if (creep.memory.roundStep === 3 || !creep.memory.roundStep) {
        creep.memory.roundStep = 1;
      }
      if (this.shouldPick(creep)) {
        this.collect(creep);
      } else {
        this.makeRounds(creep);
      }
    } else {
      creep.memory.delivering = true;
      this.makeRounds(creep);
    }

    if (wasDelivering !== creep.memory.delivering) {
      creep.say(creep.memory.delivering ? '🚚 deliver' : '🔄 collect');
    }
  },

  /** Prioritize pickup if scavenging targets exist */
  shouldPick: function (creep) {
    const nearSource = (pos) => pos.findInRange(FIND_SOURCES, 1).length > 0;

    const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (r) => !nearSource(r.pos)
    });
    const tombstones = creep.room.find(FIND_TOMBSTONES, {
      filter: (t) => _.sum(t.store) > 0
    });
    const ruins = creep.room.find(FIND_RUINS, {
      filter: (r) => _.sum(r.store) > 0
    });

    return dropped.length > 0 || tombstones.length > 0 || ruins.length > 0;
  },

  /** Collect minerals, energy, or withdraw from ruins/tombstones */
  collect: function (creep) {
    try {
      let target;

      target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType !== RESOURCE_ENERGY
      });
      if (target) return this.pickup(creep, target);

      target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (r) => r.resourceType === RESOURCE_ENERGY
      });
      if (target) return this.pickup(creep, target);

      target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (t) => _.sum(t.store) > 0
      });
      if (target) return this.withdrawAny(creep, target);

      target = creep.pos.findClosestByPath(FIND_RUINS, {
        filter: (r) => _.sum(r.store) > 0
      });
      if (target) return this.withdrawAny(creep, target);
    } catch (e) {
      console.log('Error in roleCourier.collect:', e);
    }
  },

  /** Rounds routine: source → storage → fill → loop */
  makeRounds: function (creep) {
    const storage = creep.room.storage;

    // ⚠️ Interrupt the round if something more urgent has appeared
    if (this.shouldPick(creep)) {
      if (creep.store.getFreeCapacity() > 0) {
        this.collect(creep);
      } else {
        // 💾 Drop off first, then collect
        const target = storage || creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
  
        if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
  
        // Do not return here; allow follow-up collection next tick
      }
      return;
    }

    if (!creep.memory.roundStep) creep.memory.roundStep = 1;

    switch (creep.memory.roundStep) {
      case 1: { // 🔄 Step 1: Collect energy from sources
        if (creep.store.getFreeCapacity() === 0) {
          creep.memory.sourceTour = [];
          creep.memory.currentTourIndex = null;
          creep.memory.roundStep = 2;
          break;
        }
      
        if (!creep.memory.sourceTour || creep.memory.sourceTour.length === 0) {
          this.initializeSourceTour(creep);
        }
      
        const index = creep.memory.currentTourIndex;
      
        if (
          creep.memory.sourceTour &&
          index !== null &&
          index < creep.memory.sourceTour.length
        ) {
          const pos = new RoomPosition(
            creep.memory.sourceTour[index].x,
            creep.memory.sourceTour[index].y,
            creep.room.name
          );
      
          // Check for dropped or container energy at this position
          const dropped = pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: r => r.resourceType === RESOURCE_ENERGY
          });
          const containers = pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
          });
      
          if (dropped.length > 0) {
            this.pickup(creep, dropped[0]);
            return;
          } else if (containers.length > 0) {
            this.withdrawAny(creep, containers[0]);
            return;
          } else {
            // Nothing to do here anymore, go to next
            creep.memory.currentTourIndex++;
            return;
          }
        } else {
          // Tour finished
          creep.memory.sourceTour = [];
          creep.memory.currentTourIndex = null;
          creep.memory.roundStep = 2;
        }
        break;
      }

      case 2: { // 🏦 Step 2: Interact with storage

        const nonSourceContainers = creep.room.find(FIND_STRUCTURES, {
          filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            !s.pos.findInRange(FIND_SOURCES, 1).length &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
      
        const towersNeedingEnergy = creep.room.find(FIND_STRUCTURES, {
          filter: s =>
            s.structureType === STRUCTURE_TOWER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
      
        // 💾 Deposit to storage ONLY if nothing else needs energy
        const everythingIsFull = nonSourceContainers.length === 0 && towersNeedingEnergy.length === 0;
      
        if (creep.store.getFreeCapacity() === 0 && everythingIsFull && storage) {
          if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      
        // 🧪 Withdraw energy only if we can deliver it
        if (
          creep.store.getFreeCapacity() > 0 &&
          nonSourceContainers.length > 0 &&
          storage && storage.store[RESOURCE_ENERGY] > 0
        ) {
          if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }
      
        creep.memory.roundStep = 3;
        break;
      }

      case 3: { // 📤 Step 3: Fill containers not near sources
        const targets = creep.room.find(FIND_STRUCTURES, {
          filter: s =>
            s.structureType === STRUCTURE_CONTAINER &&
            !s.pos.findInRange(FIND_SOURCES, 1).length &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (targets.length > 0) {
          const target = creep.pos.findClosestByPath(targets);
          if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
          return;
        }

        creep.memory.roundStep = 1;
        break;
      }
    }
  },

  /** Move to and pick up dropped resource */
  pickup: function (creep, target) {
    if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  },

  /** Withdraw any resource from a container, tombstone, ruin */
  withdrawAny: function (creep, target) {
    const resourceType = Object.keys(target.store).find(
      type => target.store[type] > 0
    );
    if (resourceType && creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: '#ff00ff' } });
    }
  },

  initializeSourceTour: function (creep) {
    const sources = creep.room.find(FIND_SOURCES);
    const tour = [];
  
    for (const source of sources) {
      const dropped = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
        filter: r => r.resourceType === RESOURCE_ENERGY
      });
      const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
      });
  
      if (dropped.length > 0 || containers.length > 0) {
        tour.push(source.pos); // 👑 only position stored, not ID
      }
    }
  
    if (tour.length > 0) {
      creep.memory.sourceTour = tour;
      creep.memory.currentTourIndex = 0;
    } else {
      creep.memory.sourceTour = [];
      creep.memory.currentTourIndex = null;
    }
  }
};

module.exports = roleCourier;