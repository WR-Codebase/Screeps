const roleLongRangeHauler = {
  run: function (creep) {
    try {
      if (!heap || !heap.rooms) {
        console.log("Memory.heap.rooms is not initialized");
        return;
      }

      const rooms = heap.rooms;
      let surplusRoom = null;
      let deficitRoom = null;

      for (const roomName in rooms) {
        if (rooms[roomName].surplus > 30000 && (!surplusRoom || rooms[roomName].surplus > rooms[surplusRoom].surplus)) {
          surplusRoom = roomName;
        }
        if (rooms[roomName].demand > 0 && (!deficitRoom || rooms[roomName].demand > rooms[deficitRoom].demand)) {
          deficitRoom = roomName;
        }
      }

      // Prevent haulers from bouncing between same room
      if (deficitRoom === surplusRoom) {
        deficitRoom = null;
      }
      if (!surplusRoom) {
        console.log(`${creep.name}: No valid surplus room found`);
        return;
      }

      // If no deficit room, deliver to nearest storage
      if (!deficitRoom) {
        creep.memory.targetRoom = null;
      } else {
        creep.memory.targetRoom = deficitRoom;
      }
      creep.memory.sourceRoom = surplusRoom;

      const { sourceRoom, targetRoom } = creep.memory;

      if (creep.store[RESOURCE_ENERGY] === 0) {
        creep.memory.hauling = false;
      }
      if (creep.store.getFreeCapacity() === 0) {
        creep.memory.hauling = true;
      }

      if (!creep.memory.hauling) {
        if (creep.room.name !== sourceRoom) {
          creep.travelTo(new RoomPosition(25, 25, sourceRoom), { visualizePathStyle: { stroke: '#ffaa00' } });
        } else {
          const storage = creep.room.storage;
          if (storage && storage.store[RESOURCE_ENERGY] > 30000) {
            if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.travelTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
          }
        }
      } else {
        if (targetRoom && creep.room.name !== targetRoom) {
          creep.travelTo(new RoomPosition(25, 25, targetRoom), { visualizePathStyle: { stroke: '#ffaa00' } });
        } else if (targetRoom) {
          const storage = creep.room.storage;
          if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.travelTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
            }
          }
        } else {
          // No deficit room: deliver to nearest storage
          const storages = _.filter(Game.structures, s => s.structureType === STRUCTURE_STORAGE && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
          if (storages.length > 0) {
            const closest = creep.pos.findClosestByPath(storages);
            if (closest) {
              if (creep.transfer(closest, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.travelTo(closest, { visualizePathStyle: { stroke: '#ffffff' } });
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(`Error in role.longRangeHauler.run: ${e}`);
    }
  }
};

module.exports = roleLongRangeHauler;