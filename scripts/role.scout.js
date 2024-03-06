/**
 * The Scout role is responsible for moving to different locations and reporting back to the Queen Screep (GPT)
 * @type {{run: exports.run, assignCommand: exports.assignCommand}}
 */
module.exports = {
  run: function (creep) {
    // Check if there is a command in memory
    if (creep.memory.command) {
      const command = creep.memory.command;
      // Execute command based on type
      switch(command.type) {
        case 'moveToLocations':
          // Check if there are locations to move to
          if (creep.memory.command.locations && creep.memory.command.locations.length > 0) {
            // Get the next location from the array
            const nextLocation = creep.memory.command.locations[0];

            // Check if the creep is in the target room
            if (creep.room.name !== nextLocation.room) {
              // Move towards the target room
              const exitDir = Game.map.findExit(creep.room, nextLocation.room);
              const exit = creep.pos.findClosestByRange(exitDir);
              creep.moveTo(exit);
            } else {
              // If in the target room, move to the specific position
              if (creep.pos.x !== nextLocation.x || creep.pos.y !== nextLocation.y) {
                creep.moveTo(new RoomPosition(nextLocation.x, nextLocation.y, nextLocation.room));
              } else {
                // Remove the location from the array once reached
                creep.memory.command.locations.shift();
                // If no more locations, clear the command
                if (creep.memory.command.locations.length === 0) {
                  delete creep.memory.command;
                }
              }
            }
          } else {
            // Clear the command if there are no locations
            delete creep.memory.command;
          }
          break;
        // Add more cases for different command types as needed
      }

    }
  },

  /**
   * Allows the Queen Screep (GPT) to assign a command to a creep via its memory
   * @param creepName
   * @param command
   */
  assignCommand: function (creepName, command) {
    if (Game.creeps[creepName]) {
      Game.creeps[creepName].memory.command = command;
    }
  }
};
