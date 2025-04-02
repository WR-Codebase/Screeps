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
    // Work site is one tile to the right of the first spawn in the room (x+1, y)
    const spawnPos = creep.room.find(FIND_MY_SPAWNS)[0].pos;
    const workPos = new RoomPosition(spawnPos.x + 1, spawnPos.y, creep.room.name);

    if (creep.pos !== workPos) {
      creep.moveTo(workPos);
    }
    if (storage) {
      const targetLink = storage.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_LINK;
        }
      });

      // Duty 2: Transfer energy from Link to Storage if Link has energy and creep is empty
      if (targetLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        creep.withdraw(targetLink, RESOURCE_ENERGY)
      } else {
        // Fill the spawn closest to storage
        const targetSpawn = storage.pos.findClosestByRange(FIND_MY_SPAWNS);
        if (targetSpawn && targetSpawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          // If the creep has no energy get it from storage
          if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            creep.withdraw(storage, RESOURCE_ENERGY);
          }
          creep.transfer(targetSpawn, RESOURCE_ENERGY);
        } else {

          // deliver energy to storage
          if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            creep.transfer(storage, RESOURCE_ENERGY);
          }
        }
      }
    }
  }
};

module.exports = roleMinim;
