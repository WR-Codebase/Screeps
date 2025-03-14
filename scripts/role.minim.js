/**
 * role.minim.js
 * 
 * In an ant colony, the minim is a small worker responsible for carrying food around within the colony.
 * 
 * The minim role in my codebase carries energy from the link closest to storage, to the storage, keeping
 * the link open to receive more energy.
 * 
 */

const roleMinim = {
  run: function (creep) {
    const storage = creep.room.storage;
    // target link is the one nearest the storage
    if (storage) {
      const targetLink = storage.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_LINK;
        }
      });

      // Duty 2: Transfer energy from Link to Storage if Link has energy and creep is empty
      if (targetLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.withdraw(targetLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          //console.log(`Creep ${creep.name} is moving to link to collect energy`);
          creep.moveTo(targetLink, {visualizePathStyle: {stroke: '#ffaa00'}});
        } else {
          // If the creep has energy, deposit it into storage
          //console.log(`Creep ${creep.name} is depositing energy into storage ${storage.id}`);
          if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
            return;
          }
        }
      } else {
        // deliver energy to storage
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
          if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
          }
        }
      }
    } else {
      // Deliver energy to storage
      if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};

module.exports = roleMinim;
