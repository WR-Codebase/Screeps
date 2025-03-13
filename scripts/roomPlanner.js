const algorithms = require('./algorithms');
const utils = require('./utils');

// roomPlanner.js
const distanceTransform = require('./distanceTransform');


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
  run: function (room) {
    try {
      console.log(`[INFO] Running room planner for room ${room.name}`);

      // If room is not mine, stop processing
      if (!room.controller || !room.controller.my) return;

      const constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
      if (constructionSites.length > 0) {
        const site = constructionSites[0];
      } else {

        // Evaluate next structure to build by level and priority
        const nextStructure = this.getNextConstruction(room);
        //console.log(`Next structure to build: ${nextStructure}`);

        if (nextStructure !== null) {
          // Next structure has been identified, generate optimal locations

          // start with the distance transform

          const distanceGrid = distanceTransform(room.name);

          //const dt = utils.getDistanceTransform(room.name, { visual: true });
          // get position of the spawn
          //const spawn = room.find(FIND_MY_SPAWNS)[0];
          //const floodFill = utils.getPositionsByPathCost(room.name, [spawn.pos], { visual: true });

          //console.log(`[INFO] Distance transform grid for room ${room.name}: ${JSON.stringify(grid)}`);

          // Generate Grid Array [x][y]{value terrainType, structure} array, populate with null for unknown values
          let gridArray = [];
          for (let x = 0; x < 50; x++) {
            gridArray[x] = [];
            for (let y = 0; y < 50; y++) {
              const structureArr = room.lookForAt(LOOK_STRUCTURES, x, y) || [];
              const structureType = structureArr.length > 0 ? structureArr[0].structureType : null;
              gridArray[x][y] = { value: distanceGrid.get(x, y), terrainType: room.getTerrain().get(x, y), structure: structureType };
            }
          }

          // Plan roads
          gridArray = this.planRoads(room, gridArray);
          // visualize roads

          for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
              if (gridArray[x][y].structure === "road") {
                room.visual.circle(x, y, { fill: 'grey', radius: 0.3 });
              }
            }
          }

        } else {
          // All identified buildings for this level are complete. Now switch to buildings which are not in the matrix.

          // If a creep is on a white tile that does not have a road already, build a road
          for (const creep of room.find(FIND_MY_CREEPS)) {
            if (!this.isBlackTile(creep.pos.x, creep.pos.y)
              && room.lookForAt(LOOK_STRUCTURES, creep.pos.x, creep.pos.y).length === 0) {
              //room.createConstructionSite(creep.pos.x, creep.pos.y, STRUCTURE_ROAD);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.log(`Error in roomPlanner.run(): ${e}`);
    }
  },
  /**
   * Flood fill to identify regions bounded by walls with openings ≤ 3 tiles.
   * @param {Array} gridArray - Existing gridArray[x][y] structure.
   * @param {Number} startX 
   * @param {Number} startY
   * @param {Array} visited - 2D boolean visited array.
   */
  floodFillRegion: function (gridArray, startX, startY, visited) {
    const stack = [{ x: startX, y: startY }];
    const region = [];

    while (stack.length) {
      const { x, y } = stack.pop();

      if (x < 0 || x >= 50 || y < 0 || y >= 50) continue;
      if (visited[x][y]) continue;

      const tile = gridArray[x][y];
      if (tile.terrainType === TERRAIN_MASK_WALL) continue;

      visited[x][y] = true;
      region.push({ x, y });

      stack.push({ x: x - 1, y });
      stack.push({ x: x + 1, y });
      stack.push({ x, y: y - 1 });
      stack.push({ x, y: y + 1 });
    }

    return region;
  },

  /**
   * Checks for openings (≤ 3 tiles wide) around the region boundary.
   */
  hasValidEntrances: function (region, gridArray) {
    const boundary = new Set();
    const terrain = new Room.Terrain(gridArray[0][0].roomName || '');

    region.forEach(({ x, y }) => {
      const neighbors = [
        { x: x - 1, y }, { x: x + 1, y },
        { x, y: y - 1 }, { x, y: y + 1 }
      ];

      neighbors.forEach(({ x: nx, y: ny }) => {
        if (nx < 0 || nx > 49 || ny < 0 || ny > 49) return;
        if (terrain.get(nx, ny) === TERRAIN_MASK_WALL) return;

        const key = `${nx},${ny}`;
        openings.add(key);
      });
    });

    return openings.size <= 3;
  },

  /**
   * Main method to find regions separated by entrances ≤ 3 tiles wide.
   */
  findRegions: function (room, gridArray) {
    const visited = Array.from({ length: 50 }, () => Array(50).fill(false));
    const regions = [];

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        if (!visited[x][y] && gridArray[x][y].terrainType !== TERRAIN_MASK_WALL) {
          const region = floodFillRegion(gridArray, x, y, visited);
          if (region.length > 0) {
            regions.push(region);
          }
        }
      }
    }
  },
  /**
 * Plans roads connecting spawn to sources and controller.
 * @param {Room} room
 */
  planRoads: function (room, gridArray) {
    const spawn = room.find(FIND_MY_SPAWNS)[0];
    const sources = room.find(FIND_SOURCES);
    const minerals = room.find(FIND_MINERALS);
    const points = [...sources, room.controller, ...minerals];

    const opts = { ignoreCreeps: true, swampCost: 2, plainCost: 1 };
    const roadPositions = [];

    points.forEach(target => {
      const path = room.findPath(spawn.pos, target.pos, opts);
      path.forEach(step => {
        roadPositions.push(`${step.x},${step.y}`);
      });
    });

    const uniquePositions = [...new Set(roadPositions)];

    uniquePositions.forEach(coord => {
      const [x, y] = coord.split(',').map(Number);
      const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
      const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);

      if (!structures.length && !sites.length) {
        gridArray[x][y].structure = "road";
      }
    });
    return gridArray;
  },
  findOptimalExtensions: function (roomName) {
    const vis = new RoomVisual(roomName);
    const terrain = Game.map.getRoomTerrain(roomName);
    const distanceMap = distanceTransform(roomName); // Run Distance Transform Algorithm

    let extensionPositions = [];
    let maxTiles = [];

    // ✅ Collect all valid buildable positions sorted by highest distance
    for (let y = 1; y < 48; ++y) {
      for (let x = 1; x < 48; ++x) {
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
          let value = distanceMap.get(x, y);
          maxTiles.push({ x, y, value });
        }
      }
    }

    // ✅ Sort by distance (descending) to prioritize safest locations
    maxTiles.sort((a, b) => b.value - a.value);

    // ✅ Place Extensions using a Compact Cluster Method
    while (extensionPositions.length < 50 && maxTiles.length > 0) {
      let { x, y } = maxTiles.shift();

      // Ensure it does not block key paths
      if (!this.isBlockingPath(x, y, extensionPositions)) {
        extensionPositions.push({ x, y });
      }
    }

    // ✅ Visualize the selected extension positions
    extensionPositions.forEach(({ x, y }) => {
      vis.circle(x, y, {
        radius: 0.4,
        fill: "#FFD700", // Gold color for visibility
        stroke: "#FFA500",
        strokeWidth: 0.1
      });
    });

    console.log(`[INFO] Placed ${extensionPositions.length} optimal extension locations.`);

    return extensionPositions;
  },
  /**
   * Checks if a new extension placement would block important paths.
   * Ensures at least one clear path exists between key points like spawn, sources, and controller.
   */
  isBlockingPath: function (x, y, extensionPositions) {
    // Example logic: ensure at least one adjacent walkable tile remains open
    const adjacentOffsets = [
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
    ];

    let openPaths = 0;
    for (let { dx, dy } of adjacentOffsets) {
      if (!extensionPositions.some(pos => pos.x === x + dx && pos.y === y + dy)) {
        openPaths++;
      }
    }

    return openPaths < 2; // If too many sides are blocked, reject the placement
  },
  isBlackTile: function (x, y) {
    return (x + y) % 2 === 0; // return true if black, false if white
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