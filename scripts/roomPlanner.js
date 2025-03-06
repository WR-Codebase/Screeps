// roomPlanner.js
const roomPlanner = {
  roomLevelMatrix: [
    { level: 2, structures: [{ name: STRUCTURE_SPAWN, quantity: 1 }, { name: STRUCTURE_EXTENSION, quantity: 5 }] },
    { level: 3, structures: [{ name: STRUCTURE_SPAWN, quantity: 1 }, { name: STRUCTURE_EXTENSION, quantity: 10 }, { name: STRUCTURE_TOWER, quantity: 1 }] },
    { level: 4, structures: [{ name: STRUCTURE_SPAWN, quantity: 1 }, { name: STRUCTURE_EXTENSION, quantity: 20 }, { name: STRUCTURE_TOWER, quantity: 1 }, { name: STRUCTURE_STORAGE, quantity: 1 }] },
    { level: 5, structures: [{ name: STRUCTURE_SPAWN, quantity: 1 }, { name: STRUCTURE_EXTENSION, quantity: 30 }, { name: STRUCTURE_TOWER, quantity: 2 }, { name: STRUCTURE_STORAGE, quantity: 1 }, { name: STRUCTURE_LINK, quantity: 2 }] },
    { level: 6, structures: [{ name: STRUCTURE_SPAWN, quantity: 1 }, { name: STRUCTURE_EXTENSION, quantity: 40 }, { name: STRUCTURE_TOWER, quantity: 2 }, { name: STRUCTURE_STORAGE, quantity: 1 }, { name: STRUCTURE_LINK, quantity: 3 }, { name: STRUCTURE_EXTRACTOR, quantity: 1 }, { name: STRUCTURE_LAB, quantity: 3 }, { name: STRUCTURE_TERMINAL, quantity: 1 }] },
    { level: 7, structures: [{ name: STRUCTURE_SPAWN, quantity: 2 }, { name: STRUCTURE_EXTENSION, quantity: 50 }, { name: STRUCTURE_TOWER, quantity: 3 }, { name: STRUCTURE_STORAGE, quantity: 1 }, { name: STRUCTURE_LINK, quantity: 4 }, { name: STRUCTURE_EXTRACTOR, quantity: 1 }, { name: STRUCTURE_LAB, quantity: 6 }, { name: STRUCTURE_TERMINAL, quantity: 1 }, { name: STRUCTURE_FACTORY, quantity: 1 }] },
    { level: 8, structures: [{ name: STRUCTURE_SPAWN, quantity: 3 }, { name: STRUCTURE_EXTENSION, quantity: 60 }, { name: STRUCTURE_TOWER, quantity: 6 }, { name: STRUCTURE_STORAGE, quantity: 1 }, { name: STRUCTURE_LINK, quantity: 6 }, { name: STRUCTURE_EXTRACTOR, quantity: 1 }, { name: STRUCTURE_LAB, quantity: 10 }, { name: STRUCTURE_TERMINAL, quantity: 1 }, { name: STRUCTURE_FACTORY, quantity: 1 }, { name: STRUCTURE_OBSERVER, quantity: 1 }, { name: STRUCTURE_POWER_SPAWN, quantity: 1 }, { name: STRUCTURE_NUKER, quantity: 1 }] }
  ],
  filterMatrix: {
    STRUCTURE_EXTENSION: {
      startAt: (25,25), // any desired x,y position, for example any Spawn
      criteria: function () {
        const cursor = Memory.cursor;
        return (isBlackTile(cursor.x, cursor.y)
          && this.toNearest(room, FIND_SOURCES) > 2
          && this.toNearest(room, FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } }) > 3);
      },
      searchPattern: "randomwalk"
    }
  },
  run: function (room) {
    const vis = new RoomVisual(room.name);


    let cursor = {}
    if (!Memory.cursor) {
      this.initializeCursor(room.name, 0, 0);
    } else {
      cursor = this.getCursor();
    }

    // The cursor should always be on the current construction site, or seeking the next one

    // If there is a construction site, move the cursor to it
    const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
    if (constructionSites.length > 0) {
      const site = constructionSites[0];
      if (cursor.x !== site.pos.x || cursor.y !== site.pos.y)
        this.updateCursor(room.name, site.pos.x, site.pos.y);
          // draw the cursor once every two ticks in yellow
    } else {
      // Evaluate next structure to build by level and priority
      const nextStructure = this.getNextConstruction(room);
      //console.log(`Next structure to build: ${nextStructure}`);

      if (nextStructure !== null) {
        // Only draw the cursor when looking for a new construction site, to visualize the search process
        //vis.rect(cursor.x - 0.5, cursor.y - 0.5, 1, 1, { fill: 'yellow', opacity: 0.5 });

        // Once a structure is selected, use that structure's requirements, cursor location, and search pattern, to position the next construction site
        // Do runPattern(filterMatrix[nextStructure].startAt, filterMatrix[nextStructure].searchPattern, filterMatrix[nextStructure].criteria, cursor)
        // Once a valid position is identified, create the construction site at the cursor location.
      } else {
        // All identified buildings for this level are complete. Now switch to buildings which are not in the matrix.

        // If a creep is on a white tile that does not have a road already, build a road
        for (const creep of room.find(FIND_MY_CREEPS)) {
          if (!this.isBlackTile(creep.pos.x, creep.pos.y)
            && room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y).length === 0) {
            room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
            break;
          }
        }
      }
    }
  },
  toNearest: function (room, targetType) {
    if (!Memory.cursor) {
      //console.log(`[ERROR] Cursor not set in room ${room.name}`);
      return null;
    }
  
    const cursor = Memory.cursor;
    const cursorPos = new RoomPosition(cursor.x, cursor.y, room.name);
  
    // Find all possible targets of the given type
    const targets = room.find(targetType);
  
    if (!targets.length) {
      //console.log(`[WARN] No targets of type ${targetType} found in room ${room.name}`);
      return null;
    }
  
    let shortestPathLength = Infinity;
  
    for (let target of targets) {
      const path = room.findPath(target.pos, cursorPos, { ignoreCreeps: true });
  
      if (path.length > 0 && path.length < shortestPathLength) {
        shortestPathLength = path.length;
      }
    }
  
    if (shortestPathLength === Infinity) {
      //console.log(`[WARN] No reachable targets of type ${targetType} found in room ${room.name}`);
      return null;
    }
  
    //console.log(`[INFO] Shortest path to ${targetType} from cursor at (${cursor.x}, ${cursor.y}) is ${shortestPathLength} steps`);
  
    return shortestPathLength;
  },
  oldRun: function (room) {
      // let's keep everything in run for now and work only with extensions up to a limit of 5
    // Extensions must not be in one of the 8 tiles ajdacent to a source or on the source itself
    // Extensions must be built on black tiles
    // Extensions cannot be built on top of other structures or walls

    // if there are less than 5 extensions, build one
    const numExtensions = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;
    if (numExtensions < 5) {
      //console.log('Building extension');
      // Find the nearest black tile to a source that does not have a structure on it and is not adjacent to a source
      const sources = room.find(FIND_SOURCES);
      let nearest = null;
      let nearestDistance = 50; // maximum distance
      // let's store the processed points in visited for now
      const visited = [];
      let queue = [];

      // get a list of points that meet the criteria 2 away from the sources add these to the queue
      for (const source of sources) {
        for (let x = source.pos.x - 2; x <= source.pos.x + 2; x++) {
          for (let y = source.pos.y - 2; y <= source.pos.y + 2; y++) {
            queue.push([x, y]);
          }
        }
      }

      // filter out the points that are not valid and put them in visited
      queue = queue.filter(([x, y]) => {
        if (x < 0 || x > 49 || y < 0 || y > 49) {
          return false;
        }
        if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) {
          visited.push([x, y]);
          return false;
        }
        if (sources.some(source => source.pos.x === x && source.pos.y === y)) {
          visited.push([x, y]);
          return false;
        }
        if (room.lookForAt(LOOK_STRUCTURES, x, y).length > 0) {
          visited.push([x, y]);
          return false;
        }
        return true;
      }
      );

      //console.log(`Queue: ${JSON.stringify(queue)}`);

      // filter by closest by path to either source, move any that isn't tied for closest to visited
      queue = queue.filter(([x, y]) => {
        let sourceDistances = sources.map(source => {
          return Math.max(Math.abs(source.pos.x - x), Math.abs(source.pos.y - y));
        });

        let minDistance = Math.min(...sourceDistances);
        let closestTiles = sourceDistances.filter(distance => distance === minDistance).length;

        if (closestTiles >= 1) { // ✅ Keep at least one closest tile
          return true;
        } else {
          visited.push([x, y]); // ❌ Prevent removing all tiles
          return false;
        }
      });

      //console.log(`Queue after filtering by closest: ${JSON.stringify(queue)}`); // this returns an empty array, something is wrong

      // For each point in the queue, try to build an extension. If it fails (!== 0), add it to visited and remove it from the queue.
      for (const [x, y] of queue) {
        let output = 0 //= room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
        if (output !== 0) {
          visited.push([x, y]);
          queue = queue.filter(([qx, qy]) => qx !== x && qy !== y);
        }
      }


    } else {
      //console.log('Extensions quota met');

      // If there's no active construction site
      if (room.find(FIND_CONSTRUCTION_SITES).length === 0) {
        // Check each creep location, if it's a white tile and has no road, try to build a road
        const creeps = room.find(FIND_MY_CREEPS);
        for (const creep of creeps) {
          if (!this.isBlackTile(creep.pos.x, creep.pos.y)
            && room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y).length === 0) {
            room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
            break;
          }
        }
      }
    }
  },
  drawChecker: function (room) {
    // Draw a checkerboard pattern on the room
    const vis = new RoomVisual(room.name);
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        if ((x + y) % 2 === 0) {

          // If not a wall, source, or mineral or controller, or swamp draw a black square

          if (room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL
            && room.getTerrain().get(x, y) !== TERRAIN_MASK_SWAMP) {
            vis.rect(x - 0.5, y - 0.5, 1, 1, { fill: 'black', opacity: 0.15 });
          }
        }
      }
    }
  },
  isBlackTile: function (x, y) {
    return (x + y) % 2 === 0; // return true if black, false if white
  },
  initializeCursor: function (roomName, x, y) {
    if (!Memory.cursor) {
      Memory.cursor = { room: roomName, x: x, y: y };
      //console.log(`[INFO] Cursor initialized at (${x}, ${y}) in room ${roomName}`);
    }
  },
  updateCursor: function (roomName, x, y) {
    Memory.cursor = { room: roomName, x: x, y: y };
    //console.log(`[INFO] Cursor moved to (${x}, ${y}) in room ${roomName}`);
  },
  getCursor: function () {
    return Memory.cursor || null;
  },
  getNextConstruction: function (room) {
    //console.log(`[INFO] Evaluating next construction site for room ${room.name}`);
    const roomLevel = room.controller.level;
    const levelData = this.roomLevelMatrix.find(function (lvl) {
      return lvl.level === roomLevel;
    });

    //console.log(`[INFO] Level data for room ${room.name}: ${JSON.stringify(levelData)}`);
    // If no level data is found, return null
    if (!levelData || !levelData.structures) {
      return null;
    }

    // Identify missing structures, preserving order from the matrix
    for (var i = 0; i < levelData.structures.length; i++) {
      var structure = levelData.structures[i];
      var existingCount = room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: structure.name.toLowerCase() }
      }).length;

      //console.log(`[INFO] Found ${existingCount}/${structure.quantity} ${structure.name} structures in room ${room.name}`);
      if (existingCount < structure.quantity) {
        return structure.name.toLowerCase(); // ✅ Returns the first missing structure (highest priority)
      }
    }

    return null; // ✅ No missing structures found
  }
};
module.exports = roomPlanner;