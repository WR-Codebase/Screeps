const roleLongRangeHauler = {
  run: function (creep) {
    // Determine the best source and target rooms dynamically
    if (!heap || !heap.rooms) {
      console.log("Memory.heap.rooms is not initialized");
      return;
    }

    const rooms = heap.rooms;
    let surplusRoom = null;
    let deficitRoom = null;

    // Find the room with the highest surplus and the room with the highest demand
    for (const roomName in rooms) {
      if (rooms[roomName].surplus > 5000 && (!surplusRoom || rooms[roomName].surplus > rooms[surplusRoom].surplus)) {
        surplusRoom = roomName;
      }
      if (rooms[roomName].demand > 5000 && (!deficitRoom || rooms[roomName].demand > rooms[deficitRoom].demand)) {
        deficitRoom = roomName;
      }
    }

    if (!surplusRoom || !deficitRoom) {
      console.log("No valid surplus or deficit room found", surplusRoom, deficitRoom);
      return;
    }

    creep.memory.sourceRoom = surplusRoom;
    creep.memory.targetRoom = deficitRoom;

    const { sourceRoom, targetRoom } = creep.memory;

    // State switching logic: collecting or delivering
    if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.hauling = false;
    }
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.hauling = true;
    }

    if (!creep.memory.hauling) {
      // Travel to source room if not already there
      if (creep.room.name !== sourceRoom) {
        creep.travelTo(new RoomPosition(25, 25, sourceRoom), { visualizePathStyle: { stroke: '#ffaa00' } });
      } else {
        // Collect energy from storage in source room
        const storage = creep.room.storage;
        if (storage && storage.store[RESOURCE_ENERGY] > 10000) {
          if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(storage, { visualizePathStyle: { stroke: '#ffaa00' } });
          }
        }
      }
    } else {
      // Travel to target room if not already there
      if (creep.room.name !== targetRoom) {
        creep.travelTo(new RoomPosition(25, 25, targetRoom), { visualizePathStyle: { stroke: '#ffaa00' } });
      } else {
        // Deliver energy to storage in the target room
        const storage = creep.room.storage;
        if (storage && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.travelTo(storage, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    }
  }
};

module.exports = roleLongRangeHauler;
