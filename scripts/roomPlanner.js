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
      const vis = new RoomVisual(room.name);

      if (heap.rooms === undefined) heap.rooms = {};
      if (heap.rooms[room.name] === undefined) heap.rooms[room.name] = {};
      // draw distance transform

      // Get room data
      const roomData = heap.rooms[room.name];

      // If distanceMap is not set, set it
      if (roomData.distanceMap === undefined) {
        // distaneMap is undefined
        console.log(`[INFO] Running distance transform for room ${room.name}`);
        roomData.distanceMap = distanceTransform(room.name);
      }

      console.log(`[INFO] Running room planner for room ${room.name}, room data: ${JSON.stringify(roomData.distanceMap)}`);
      const min = 1;
      const max = 4;

      // Only proccess xy coordinates in once pass per tick
      for (let y = 1; y < 49; ++y) {
        for (let x = 1; x < 49; ++x) {
          if (roomData[x] === undefined) roomData[x] = [];
          if (roomData[x][y] === undefined) roomData[x][y] = {};
          if (roomData[x][y].terrainType === undefined) roomData[x][y].terrainType = new Room.Terrain(room.name).get(x, y);

          /**
          if (thisXY.terrainType !== TERRAIN_MASK_WALL) {
            let value = roomData.distanceMap.get(x, y);
            let color = this.getHeatmapColor(value, min, max);

            //if (value > 1) vis.text(value, x, y);
            // opacity 10%
            vis.circle(x, y, {
              radius: Math.max(value / 12),
              fill: color,
              opacity: 0.95
            });
          }*/
        }
      }

      // locate sources
      if (roomData.sources === undefined) roomData.sources = room.find(FIND_SOURCES);

      // locate minerals
      if (roomData.minerals === undefined) roomData.minerals = room.find(FIND_MINERALS);

      // locate controller
      if (roomData.controller === undefined) roomData.controller = room.controller;

      // Find optimal location for the core as the largest open area in the closest position to sources, minerals, and controller
      if (roomData.core === undefined) roomData.core = this.findOptimalCoreLocation(room, roomData);

      console.log(`[INFO] Optimal core location: ${JSON.stringify(roomData.core)}`);
      // Draw the letters from this.core in their locations based on roomData.core being the top left of the core stamp
      if (roomData.core) {
        // if a creep is on a construction site, move it off
        const creepsOnConstructionSites = room.find(FIND_MY_CREEPS).filter(creep => creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0).length);
        creepsOnConstructionSites.forEach(creep => creep.move(creep.pos.getDirectionTo(roomData.core.x, roomData.core.y)));

        const coreStart = roomData.core;
        let correctSpawnPosition = null;

        for (let y = 0; y < this.core.length; y++) {
          for (let x = 0; x < this.core[y].length; x++) {
            let letter = this.core[y][x];
            if (letter === ' ') continue;

            const posX = coreStart.x + x;
            const posY = coreStart.y + y;
            const expectedStructure = this.shortStructures[letter];
            if (!expectedStructure) continue;

            // Draw visual
            new RoomVisual(room.name).text(letter, posX, posY, {
              color: 'white', font: 0.6, stroke: 'black', strokeWidth: 0.15
            });

            // Look for existing structures
            const structuresAtPos = room.lookForAt(LOOK_STRUCTURES, posX, posY);
            const incorrectStructures = structuresAtPos.filter(s => s.structureType !== expectedStructure);

            // If it's a spawn, store the correct position
            if (expectedStructure === STRUCTURE_SPAWN) {
              correctSpawnPosition = { x: posX, y: posY };
            }

            // Handle incorrect structures
            if (incorrectStructures.length) {
              incorrectStructures.forEach(s => {
                console.log(`[WARNING] Structure mismatch at (${posX}, ${posY}) in ${room.name}. Expected: ${expectedStructure}, Found: ${s.structureType}`);
                console.log(`[INFO] Removing ${s.structureType} from (${s.pos.x}, ${s.pos.y})`);
                s.destroy();
              });
            }

            // Ensure roads are placed correctly
            if (expectedStructure === STRUCTURE_ROAD || expectedStructure === STRUCTURE_CONTAINER || expectedStructure === STRUCTURE_SPAWN) {
              const existingConstruction = room.lookForAt(LOOK_CONSTRUCTION_SITES, posX, posY);
              if (!structuresAtPos.length && !existingConstruction.length) {
                console.log(`[INFO] Placing ${expectedStructure} at (${posX}, ${posY})`);
                room.createConstructionSite(posX, posY, expectedStructure);
              }
            } else {
              // If a level based structure is expected, check if one can be built. If so, place a construction site.

              // get room level
              const roomLevel = room.controller.level;

              // get the matching row from the roomLevelMatrix
              const levelData = this.roomLevelMatrix.find(function (lvl) {
                return lvl.level === roomLevel;
              });

              // get the count for the expected structure and check if it is less than available for this room level
              const existingCount = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: expectedStructure }
              }).length;

              if (existingCount < levelData.structures.find(s => s.name === expectedStructure).quantity) {
                console.log(`[INFO] Placing ${expectedStructure} at (${posX}, ${posY})`);
                room.createConstructionSite(posX, posY, expectedStructure);
              }

            }
          }
        }

        // Ensure the spawn exists at the correct position
        if (correctSpawnPosition) {
          const existingSpawns = room.find(FIND_MY_SPAWNS);
          const spawnAtCorrectPosition = existingSpawns.some(spawn => spawn.pos.x === correctSpawnPosition.x && spawn.pos.y === correctSpawnPosition.y);

          if (!spawnAtCorrectPosition) {
            console.log(`[INFO] Spawning new spawn at (${correctSpawnPosition.x}, ${correctSpawnPosition.y})`);
            room.createConstructionSite(correctSpawnPosition.x, correctSpawnPosition.y, STRUCTURE_SPAWN);
          }
        }

        // If the spawn has finished building (room has a spawn), plan road positions to sources, mineral, and controller from core storage location
        if (room.find(FIND_MY_SPAWNS).length && roomData.roadPositions === undefined) {
          roomData.roadPositions = this.planRoads(room, roomData);

        }

        if (roomData.roadPositions) {
          // Roads to build = roadPositions which do not already contain roads or construction sites for roads
          let roadsToBuild = roomData.roadPositions.filter(({ x, y }) => {
            const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
            const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
            return !structures.some(s => s.structureType === STRUCTURE_ROAD) && !constructionSites.some(s => s.structureType === STRUCTURE_ROAD);
          });
          // Draw road positions as letter r
          roadsToBuild.forEach(({ x, y }) => {
            vis.text('r', x, y, { color: 'white', font: 0.6, stroke: 'black', strokeWidth: 0.15 });
            // place construction sites
            room.createConstructionSite(x, y, STRUCTURE_ROAD);
          });
        }
      }

      
      heap.rooms[room.name] = roomData;

    } catch (e) {
      console.log(`Error in roomPlanner.run(): ${e}`);
    }
  },

  findOptimalCoreLocation: function (room, roomData) {
    console.log(`[INFO] Finding optimal core location for room ${room.name}`);
    try {
      const controller = room.controller;
      let bestScore = -Infinity;
      let bestPosition = null;
      const coreSize = { width: this.core[0].length, height: this.core.length };

      // Cache proximity values
      let sourceDistances = {};
      let mineralDistances = {};
      let controllerDistance = controller ? {} : null;

      for (let y = 4; y < 46 - coreSize.height; y += 2) { // Ensure full core + buffer fits within bounds
        for (let x = 4; x < 46 - coreSize.width; x += 2) {
          // Ensure entire core area and buffer is buildable
          let fits = true;
          for (let dy = -1; dy <= coreSize.height; dy++) {
            for (let dx = -1; dx <= coreSize.width; dx++) {
              let checkX = x + dx;
              let checkY = y + dy;
              if (checkX < 0 || checkX >= 50 || checkY < 0 || checkY >= 50) continue;
              if (dy >= 0 && dy < coreSize.height && dx >= 0 && dx < coreSize.width) {
                if (this.core[dy][dx] !== ' ' && roomData[checkX][checkY].terrainType === TERRAIN_MASK_WALL) {
                  fits = false;
                  break;
                }
              } else {
                if (roomData[checkX][checkY].terrainType === TERRAIN_MASK_WALL) {
                  fits = false;
                  break;
                }
              }
            }
            if (!fits) break;
          }
          if (!fits) continue;

          let score = roomData.distanceMap.get(x, y);
          let proximityScore = 0;

          for (const source of roomData.sources) {
            const key = `${x},${y}-${source.id}`;
            if (!sourceDistances[key]) {
              sourceDistances[key] = source.pos.getRangeTo(x, y);
            }
            proximityScore += 1 / (sourceDistances[key] || 1);
          }

          for (const mineral of roomData.minerals) {
            const key = `${x},${y}-${mineral.id}`;
            if (!mineralDistances[key]) {
              mineralDistances[key] = mineral.pos.getRangeTo(x, y);
            }
            proximityScore += 1 / (mineralDistances[key] || 1);
          }

          if (controller) {
            const key = `${x},${y}-controller`;
            if (!controllerDistance[key]) {
              controllerDistance[key] = controller.pos.getRangeTo(x, y);
            }
            proximityScore += 1 / (controllerDistance[key] || 1);
          }

          score += proximityScore;

          if (score > bestScore) {
            bestScore = score;
            bestPosition = { x, y };
          }
        }
      }

      if (bestPosition) {
        console.log(`[INFO] Optimal core location found at (${bestPosition.x}, ${bestPosition.y}) in room ${room.name}`);
        this.corePosition = new RoomPosition(bestPosition.x, bestPosition.y, room.name);
        return bestPosition; // Return the x, y coordinates of the core start position
      }
      return null;
    } catch (e) {
      console.log(`Error in roomPlanner.findOptimalCoreLocation(): ${e}`);
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
  planRoads: function (room, roomData) {
    const roadPositions = [];

    if (!roomData.core) {
      console.log(`[ERROR] Core position not found for room ${room.name}`);
      return roadPositions;
    }

    // Get the core position from roomData
    const core = roomData.core;

    // Get the storage position from the core stamp
    const coreStamp = this.core;
    let storageX = null;
    let storageY = null;

    for (let y = 0; y < coreStamp.length; y++) {
      for (let x = 0; x < coreStamp[y].length; x++) {
        if (coreStamp[y][x] === 'S') {
          storageX = core.x + x;
          storageY = core.y + y;
          break;
        }
      }
      if (storageX !== null) break;
    }

    if (storageX === null || storageY === null) {
      console.log(`[ERROR] Storage position not found in core layout.`);
      return roadPositions;
    }

    const storagePos = new RoomPosition(storageX, storageY, room.name);

    // Define pathfinding options
    const pathFinderOptions = {
      plainCost: 2,
      swampCost: 2,
      maxOps: 2000,
      maxRooms: 1,
      serialize: false,
      maxCost: 1000
    };

    // Collect core positions to filter them out from road paths
    const coreTiles = new Set();
    for (let y = 0; y < coreStamp.length; y++) {
      for (let x = 0; x < coreStamp[y].length; x++) {
        if (coreStamp[y][x] !== ' ') {
          coreTiles.add(`${core.x + x},${core.y + y}`);
        }
      }
    }

    // Collect road paths from storage to sources, minerals, and the controller
    const targets = [...roomData.sources, ...roomData.minerals, roomData.controller].filter(Boolean);

    for (const target of targets) {
      const path = PathFinder.search(storagePos, { pos: target.pos, range: 1 }, pathFinderOptions);

      if (!path.incomplete) {
        roadPositions.push(...path.path
          .filter(p => !coreTiles.has(`${p.x},${p.y}`)) // Exclude steps inside the core
          .map(p => ({ x: p.x, y: p.y }))
        );
      }
    }

    return roadPositions;
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
  },
  /**
 * Returns a heatmap color based on an input value within a dynamic range.
 * The heatmap transitions from blue (min) to red (mid) to yellow (max).
 * 
 * @param {number} value - The input number within the specified range.
 * @param {number} [minVal=1] - The minimum value of the range (default is 1).
 * @param {number} [maxVal=50] - The maximum value of the range (default is 50).
 * @returns {string} - The corresponding heatmap color as a hexadecimal string.
 */
  getHeatmapColor: function (value, minVal = 1, maxVal = 50) {
    if (typeof value !== "number" || isNaN(value)) {
      console.log(`⚠️ Invalid value (${value}), defaulting to minVal: ${minVal}`);
      value = minVal;
    }

    if (maxVal <= minVal) {
      console.log(`⚠️ Adjusting maxVal from ${maxVal} to ${minVal + 1}`);
      maxVal = minVal + 1;
    }

    // ✅ Calculate factor safely
    let factor = (value - minVal) / (maxVal - minVal);
    factor = Math.max(0, Math.min(1, factor)); // Ensure between 0 and 1

    // ✅ Convert to RGB Gradient (Blue → Red → Yellow)
    let red, green, blue;
    if (factor <= 0.5) {
      // Blue → Red (first half)
      let progress = factor * 2; // Scale factor (0 to 1)
      red = Math.round(progress * 255);
      green = 0;
      blue = Math.round((1 - progress) * 255);
    } else {
      // Red → Yellow (second half)
      let progress = (factor - 0.5) * 2; // Scale factor (0 to 1)
      red = 255;
      green = Math.round(progress * 255);
      blue = 0;
    }

    // ✅ Convert RGB to HEX
    return `#${[red, green, blue].map(c => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  },
  core: [
    ' rr ',
    'rscr',
    'rlSr',
    ' rr '
  ],

  // The level 8 core gets the following structures: 3 spawns, 1 link, 1 storage, 1 terminal, 1 factory, 1 observer, 1 power spawn, 1 nuker
  // link must be immediately adjacent to storage. All other structures must have a road at each cardinal direction
  levelEightCore: [
    ' rrrrr ',
    'rsrsrsr'

  ],
  shortStructures: {
    's': STRUCTURE_SPAWN,
    'e': STRUCTURE_EXTENSION,
    'r': STRUCTURE_ROAD,
    'l': STRUCTURE_LINK,
    'S': STRUCTURE_STORAGE,
    't': STRUCTURE_TOWER,
    'O': STRUCTURE_OBSERVER,
    'P': STRUCTURE_POWER_SPAWN,
    'L': STRUCTURE_LAB,
    'T': STRUCTURE_TERMINAL,
    'c': STRUCTURE_CONTAINER,
    'N': STRUCTURE_NUKER,
    'F': STRUCTURE_FACTORY
  }
};
module.exports = roomPlanner;