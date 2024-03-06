const intel = {
  // Function to get information about the current room
  getCurrentRoomInfo: function (roomName) {
    const room = Game.rooms[roomName];
    if (!room) {
      console.log('No visibility in room:', roomName);
      return;
    }
    return {
      name: room.name,
      energyAvailable: room.energyAvailable,
      sources: room.find(FIND_SOURCES).length,
      controllerLevel: room.controller ? room.controller.level : 'N/A',
      hostiles: room.find(FIND_HOSTILE_CREEPS).length
    };
  },

  // Function to get names of adjacent rooms
  getAdjacentRoomNames: function (roomName) {
    const exits = Game.map.describeExits(roomName);
    return exits; // Returns an object with exit directions as keys and room names as values
  },

  // Example function to display information gathered
  displayRoomInfo: function (roomName) {
    const currentRoomInfo = this.getCurrentRoomInfo(roomName);
    console.log(`Information for room ${roomName}:`, JSON.stringify(currentRoomInfo));

    const adjacentRoomNames = this.getAdjacentRoomNames(roomName);
    console.log(`Adjacent rooms to ${roomName}:`, JSON.stringify(adjacentRoomNames));
  }
};

module.exports = intel;
