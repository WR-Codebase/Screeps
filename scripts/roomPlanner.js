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

    if (room.name === 'E56S17') return;
    try {
      console.log(`[INFO] Running room planner for room ${room.name}`);
      //const vis = new RoomVisual(room.name);

      if (heap.rooms === undefined) heap.rooms = {};
      if (heap.rooms[room.name] === undefined) heap.rooms[room.name] = {};
      // draw distance transform

      // Get room data
      const roomData = heap.rooms[room.name];

      // If distanceMap is not set, set it
      if (roomData.distanceMap === undefined) {
        // distaneMap is undefined
        //console.log(`[INFO] Running distance transform for room ${room.name}`);
        roomData.distanceMap = distanceTransform(room.name);
      }

      //console.log(`[INFO] Running room planner for room ${room.name}, room data: ${JSON.stringify(roomData.distanceMap)}`);
      const min = 1;
      const max = 4;

      // Only proccess xy coordinates in once pass per tick
      for (let y = 1; y < 49; ++y) {
        for (let x = 1; x < 49; ++x) {
          if (roomData[x] === undefined) roomData[x] = [];
          if (roomData[x][y] === undefined) roomData[x][y] = {};
          if (roomData[x][y].terrainType === undefined) roomData[x][y].terrainType = new Room.Terrain(room.name).get(x, y);

          let thisXY = roomData[x][y];
          if (thisXY.terrainType !== TERRAIN_MASK_WALL) {
            //let value = roomData.distanceMap.get(x, y);
            //let color = this.getHeatmapColor(value, min, max);

            //vis.circle(x, y, {radius: Math.max(value / 12.5),fill: color, opacity: 0.5});

            // add the distance value text
            //vis.text(value, x, y, { color: 'white', stroke: 'black', font: 0.5 });
          }
        }
      }

      // locate sources
      if (roomData.sources === undefined) roomData.sources = room.find(FIND_SOURCES);

      // locate minerals
      if (roomData.minerals === undefined) roomData.minerals = room.find(FIND_MINERALS);

      // locate controller
      if (roomData.controller === undefined) roomData.controller = room.controller;

      // Find optimal location for the core as the largest open area in the closest position to sources, minerals, and controller
      //if (roomData.core === undefined) roomData.core = this.findOptimalCoreLocation(room, roomData);
      roomData.core = this.findOptimalCoreLocation(room, roomData);

      console.log(`[INFO] Optimal core location: ${JSON.stringify(roomData.core)}`);
      // Draw the letters from this.core in their locations based on roomData.core being the top left of the core stamp
      if (roomData.core) {
        // if a creep is on a construction site, move it off
        const creepsOnConstructionSites = room.find(FIND_MY_CREEPS).filter(creep => creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0).length);
        creepsOnConstructionSites.forEach(creep => creep.move(creep.pos.getDirectionTo(roomData.core.x, roomData.core.y)));

        const coreHeight = this.core.length;
        const coreWidth = this.core[0].length;
        const offsetX = Math.floor(coreWidth / 2);
        const offsetY = Math.floor(coreHeight / 2);

        // Adjust core position to center it
        const coreStartX = roomData.core.x - offsetX;
        const coreStartY = roomData.core.y - offsetY;

        let correctSpawnPosition = null;

        for (let y = 0; y < this.core.length; y++) {
          for (let x = 0; x < this.core[y].length; x++) {
            let letter = this.core[y][x];
            if (letter === ' ') continue;

            const posX = coreStartX + x;
            const posY = coreStartY + y;
            const expectedStructure = this.shortStructures[letter];
            if (!expectedStructure) continue;

            // 🎨 Draw visual
            new RoomVisual(room.name).text(letter, posX, posY, {
              color: 'white', font: 0.6, stroke: 'black', strokeWidth: 0.15
            });

            // 🚧 Check for existing structures
            const structuresAtPos = room.lookForAt(LOOK_STRUCTURES, posX, posY);
            const incorrectStructures = structuresAtPos.filter(s => s.structureType !== expectedStructure);

            // 📌 Store spawn position
            if (expectedStructure === STRUCTURE_SPAWN) {
              correctSpawnPosition = { x: posX, y: posY };
            }

            // ❌ Handle incorrect structures
            if (incorrectStructures.length) {
              incorrectStructures.forEach(s => {
                if (s.pos.roomName !== 'E56S17') s.destroy();
              });
            }

            // ✅ Ensure correct structures are placed
            if (expectedStructure === STRUCTURE_ROAD || expectedStructure === STRUCTURE_CONTAINER || expectedStructure === STRUCTURE_SPAWN) {
              const existingConstruction = room.lookForAt(LOOK_CONSTRUCTION_SITES, posX, posY);
              if (!structuresAtPos.length && !existingConstruction.length) {
                room.createConstructionSite(posX, posY, expectedStructure);
              }
            } else {
              // 🔍 Check if the structure can be built
              const roomLevel = room.controller.level;
              const levelData = this.roomLevelMatrix.find(lvl => lvl.level === roomLevel);

              // 🛑 If no levelData exists, skip to the next structure
              if (!levelData) {
                console.log(`[WARNING] No room level data found for level ${roomLevel} in ${room.name}`);
                continue;
              }

              // Ensure structureData exists
              const structureData = levelData.structures.find(s => s.name === expectedStructure);
              if (!structureData) {
                console.log(`[WARNING] No structure data found for ${expectedStructure} in room ${room.name}`);
                continue;
              }

              // Get existing count of this structure in the room
              const existingCount = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: expectedStructure }
              }).length;

              // 🛑 Skip this structure if we already have enough
              if (existingCount >= structureData.quantity) {
                continue;
              }

              // 🏗️ Place construction site for valid structures
              room.createConstructionSite(posX, posY, expectedStructure);
            }
          }
        }

        // 🏢 Ensure the spawn exists at the correct position
        if (correctSpawnPosition) {
          const existingSpawns = room.find(FIND_MY_SPAWNS);
          const spawnAtCorrectPosition = existingSpawns.some(spawn => spawn.pos.x === correctSpawnPosition.x && spawn.pos.y === correctSpawnPosition.y);

          if (!spawnAtCorrectPosition) {
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
          let roadVis = new RoomVisual(room.name);
          // Draw road positions as letter r
          roadsToBuild.forEach(({ x, y }) => {
            roadVis.text('r', x, y, { color: 'white', font: 0.6, stroke: 'black', strokeWidth: 0.15 });
            // place construction sites
            room.createConstructionSite(x, y, STRUCTURE_ROAD);
          });
        }

        // Ensure containers are placed near sources if a road exists but no container is present
        roomData.sources.forEach(source => {
          const sourcePos = source.pos;

          // Find a road within 1 tile of the source
          const nearbyRoad = sourcePos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_ROAD } })[0];

          if (nearbyRoad) {
            // Find if there's already a container near the source
            const nearbyContainer = sourcePos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })[0];

            //console.log(`[INFO] Source: ${sourcePos} Nearby road: ${nearbyRoad} Nearby container: ${nearbyContainer}`);

            // If no container is found, place a container at the road location
            if (!nearbyContainer) {
              const constructionSite = sourcePos.findInRange(FIND_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })[0];

              if (!constructionSite) {
                //console.log(`[INFO] Placing container construction site at (${nearbyRoad.pos.x}, ${nearbyRoad.pos.y})`);
                room.createConstructionSite(nearbyRoad.pos.x, nearbyRoad.pos.y, STRUCTURE_CONTAINER);
              }
            }
          }
        });

        // Ensure a container is placed exactly 3 tiles from the controller ON a road
        const controller = roomData.controller;
        if (controller) {
          const controllerPos = controller.pos;

          // Find roads exactly 3 tiles away from the controller
          const validRoads = controllerPos.findInRange(FIND_STRUCTURES, 3, {
            filter: (s) => s.structureType === STRUCTURE_ROAD && controllerPos.getRangeTo(s.pos) === 3
          });

          if (validRoads.length > 0) {
            let bestRoad = null;

            for (const road of validRoads) {
              // Check if a container already exists on this road tile
              const hasContainer = road.pos.lookFor(LOOK_STRUCTURES).some(s => s.structureType === STRUCTURE_CONTAINER);

              if (!hasContainer) {
                bestRoad = road;
                break; // Pick the first available road exactly 3 tiles away
              }
            }

            if (bestRoad) {
              const constructionSite = bestRoad.pos.lookFor(LOOK_CONSTRUCTION_SITES).some(s => s.structureType === STRUCTURE_CONTAINER);

              if (!constructionSite) {
                //console.log(`[INFO] Placing controller container at (${bestRoad.pos.x}, ${bestRoad.pos.y})`);
                room.createConstructionSite(bestRoad.pos.x, bestRoad.pos.y, STRUCTURE_CONTAINER);
              }
            } else {
              //console.log(`[INFO] No valid road exactly 3 tiles from the controller for a container.`);
            }

            // if RCL is >= 2 and current level's matrix includes more extensions, plan extensions
            if (room.controller.level >= 2) {
              //this.planExtensions(room, roomData);
            }
          } else {
            //console.log(`[INFO] No road found exactly 3 tiles from the controller.`);
          }
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
      const sources = roomData.sources;
      const minerals = roomData.minerals;

      if (!controller || sources.length === 0 || minerals.length === 0) {
        console.log(`[ERROR] Missing key locations (sources, minerals, or controller) in room ${room.name}`);
        return null;
      }

      // 🔵 Compute the center point
      let totalX = controller.pos.x;
      let totalY = controller.pos.y;
      let count = 1;

      sources.forEach(source => {
        totalX += source.pos.x;
        totalY += source.pos.y;
        count++;
      });

      minerals.forEach(mineral => {
        totalX += mineral.pos.x;
        totalY += mineral.pos.y;
        count++;
      });

      const centerX = Math.round(totalX / count);
      const centerY = Math.round(totalY / count);
      const centerPos = new RoomPosition(centerX, centerY, room.name);

      // 🎨 Draw the center point
      const vis = new RoomVisual(room.name);
      vis.circle(centerX, centerY, { fill: 'blue', radius: 0.4, stroke: 'white' });

      // 🔗 Draw blue lines to the center
      [controller, ...sources, ...minerals].forEach(target => {
        vis.line(target.pos, centerPos, { color: 'blue', width: 0.2, opacity: 0.7 });
      });

      // 📌 Find valid DT tiles where the core can fit
      const coreSize = Math.max(this.core.length, this.core[0].length);
      let dtTiles = [];

      for (let y = 3; y < 47; y++) {
        for (let x = 3; x < 47; x++) {
          let dtValue = roomData.distanceMap.get(x, y);
          if (dtValue > (coreSize + 2) / 2) {
            dtTiles.push({ x, y, value: dtValue });
            vis.circle(x, y, { fill: 'yellow', radius: 0.3, stroke: 'black' });
          }
        }
      }

      console.log(`[INFO] Identified ${dtTiles.length} valid core positions in room ${room.name}`);

      // ** Flood-Fill Clustering to Group DT Tiles **
      let clusters = [];
      let visited = new Set();

      function floodFill(startTile) {
        let cluster = [];
        let stack = [startTile];

        while (stack.length > 0) {
          let tile = stack.pop();
          let key = `${tile.x},${tile.y}`;

          if (visited.has(key)) continue;
          visited.add(key);
          cluster.push(tile);

          let neighbors = dtTiles.filter(t => Math.abs(t.x - tile.x) <= 1 && Math.abs(t.y - tile.y) <= 1);
          stack.push(...neighbors);
        }
        return cluster;
      }

      for (let tile of dtTiles) {
        let key = `${tile.x},${tile.y}`;
        if (!visited.has(key)) {
          clusters.push(floodFill(tile));
        }
      }

      console.log(`[INFO] Found ${clusters.length} clusters in room ${room.name}`);

      // ** Select the top 3 largest clusters **
      clusters.sort((a, b) => b.length - a.length);
      const topClusters = clusters.slice(0, 3);
      console.log(`[INFO] Keeping top ${topClusters.length} clusters for evaluation.`);

      // ** Find the closest cluster to the center point **
      let bestCluster = null;
      let bestDistance = Infinity;

      for (let cluster of topClusters) {
        let clusterSize = cluster.length;
        let clusterCenter = cluster.reduce((sum, tile) => ({
          x: sum.x + tile.x, y: sum.y + tile.y
        }), { x: 0, y: 0 });

        clusterCenter.x = Math.round(clusterCenter.x / clusterSize);
        clusterCenter.y = Math.round(clusterCenter.y / clusterSize);
        let clusterCenterPos = new RoomPosition(clusterCenter.x, clusterCenter.y, room.name);

        let distanceToCenter = clusterCenterPos.getRangeTo(centerPos);
        if (distanceToCenter < bestDistance) {
          bestDistance = distanceToCenter;
          bestCluster = cluster;
        }
      }

      if (!bestCluster) {
        console.log(`[ERROR] No valid cluster found.`);
        return centerPos;
      }

      // 🔍 **Now refine selection by minimizing total path cost**
      let bestPathPoint = null;
      let bestTotalSteps = Infinity;
      let searchStack = [...bestCluster];

      while (searchStack.length > 0) {
        let currentTile = searchStack.pop();
        let pos = new RoomPosition(currentTile.x, currentTile.y, room.name);
        let totalSteps = 0;
        let valid = true;

        for (const target of [controller, ...sources, ...minerals]) {
          const path = PathFinder.search(pos, { pos: target.pos, range: 1 }, {
            maxOps: 2000,
            swampCost: 2,
            plainCost: 1
          });

          if (path.incomplete) {
            valid = false;
            break;
          }
          totalSteps += path.cost;
        }

        if (valid && totalSteps < bestTotalSteps) {
          bestTotalSteps = totalSteps;
          bestPathPoint = pos;
        }
      }

      // 🎯 Final Selection
      if (bestPathPoint) {
        vis.circle(bestPathPoint.x, bestPathPoint.y, { fill: 'green', radius: 0.4, stroke: 'white' });
        console.log(`[INFO] Optimal core location at (${bestPathPoint.x}, ${bestPathPoint.y}) with total steps: ${bestTotalSteps}`);
        return bestPathPoint;
      }

      return centerPos;
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

    const core = roomData.core;
    const coreStamp = this.core;
    let storageX = null;
    let storageY = null;

    // Calculate offset to center stamp around core
    const coreHeight = coreStamp.length;
    const coreWidth = coreStamp[0].length;
    const offsetX = Math.floor(coreWidth / 2);
    const offsetY = Math.floor(coreHeight / 2);

    // Find Storage 'S' position relative to stamp center
    for (let y = 0; y < coreStamp.length; y++) {
      for (let x = 0; x < coreStamp[y].length; x++) {
        if (coreStamp[y][x] === 'S') {
          storageX = core.x - offsetX + x;
          storageY = core.y - offsetY + y;
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

    const pathFinderOptions = {
      plainCost: 2,
      swampCost: 2,
      maxOps: 2000,
      maxRooms: 1,
      serialize: false,
      maxCost: 1000
    };

    // Collect core tiles to exclude from road placement
    const coreTiles = new Set();
    for (let y = 0; y < coreStamp.length; y++) {
      for (let x = 0; x < coreStamp[y].length; x++) {
        if (coreStamp[y][x] !== ' ') {
          const posX = core.x - offsetX + x;
          const posY = core.y - offsetY + y;
          coreTiles.add(`${posX},${posY}`);
        }
      }
    }

    // Build roads from storage to all targets
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

    console.log(`[INFO] Planned ${roadPositions.length} road positions from storage in ${room.name}`);
    return roadPositions;
},
planExtensions: function (room, roomData) {
  const vis = new RoomVisual(room.name);
  const maxExtensions = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][room.controller.level];
  const existingExtensions = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } }).length;
  const neededExtensions = maxExtensions - existingExtensions;

  if (neededExtensions <= 0) {
      console.log(`[INFO] All ${maxExtensions} extensions built in ${room.name}`);
      return;
  }

  console.log(`[INFO] Planning ${neededExtensions} extensions for ${room.name}`);

  const stamp = this.extensionStamp;
  const stampHeight = stamp.length;
  const stampWidth = stamp[0].length;
  const halfWidth = Math.floor(stampWidth / 2);
  const halfHeight = Math.floor(stampHeight / 2);

  // 🏠 Find the first spawn
  const spawns = room.find(FIND_MY_SPAWNS);
  if (!spawns.length) {
      console.log(`[ERROR] No spawn found in ${room.name}. Cannot place extensions.`);
      return;
  }
  const firstSpawn = spawns[0];
  const spawnX = firstSpawn.pos.x;
  const spawnY = firstSpawn.pos.y;

  // 📍 Determine Direction Away from Sources
  let avgSourceX = 0, avgSourceY = 0;
  roomData.sources.forEach(source => {
      avgSourceX += source.pos.x;
      avgSourceY += source.pos.y;
  });

  avgSourceX /= roomData.sources.length;
  avgSourceY /= roomData.sources.length;

  // 📏 Vector from spawn to sources
  const directionX = Math.sign(avgSourceX - spawnX); // -1 = Left, +1 = Right
  const directionY = Math.sign(avgSourceY - spawnY); // -1 = Up, +1 = Down

  // 🐝 **Start extension placement away from sources**
  let startX = spawnX - directionX * 6;
  let startY = spawnY - directionY * 6;
  const placed = [];

  let attempts = 0;
  const maxAttempts = 100;

  // 🔶 **Hexagonal Tiling**
  while (placed.length < neededExtensions && attempts < maxAttempts) {
      const tileX = startX + (attempts % 5) * 3; // Staggered X placement
      const tileY = startY + Math.floor(attempts / 5) * 2; // Every row moves 2 tiles down

      if (attempts % 2 === 0) startX += 1; // Offset every second row

      let canPlace = true;

      // Check terrain & avoid overlap with core
      outer: for (let y = 0; y < stampHeight; y++) {
          for (let x = 0; x < stampWidth; x++) {
              const tile = stamp[y][x];
              const absX = tileX + x - halfWidth;
              const absY = tileY + y - halfHeight;

              if (absX < 1 || absX > 48 || absY < 1 || absY > 48) {
                  canPlace = false;
                  break outer;
              }

              const terrain = new Room.Terrain(room.name).get(absX, absY);
              if (terrain === TERRAIN_MASK_WALL) {
                  canPlace = false;
                  break outer;
              }

              const structures = room.lookForAt(LOOK_STRUCTURES, absX, absY);
              if (structures.some(s => s.structureType === STRUCTURE_EXTENSION)) {
                  canPlace = false;
                  break outer;
              }
          }
      }

      // ✅ Place hex stamp if valid
      if (canPlace) {
          for (let y = 0; y < stampHeight; y++) {
              for (let x = 0; x < stampWidth; x++) {
                  const letter = stamp[y][x];
                  if (letter === ' ') continue;

                  const absX = tileX + x - halfWidth;
                  const absY = tileY + y - halfHeight;
                  const structureType = this.shortStructures[letter];

                  // Draw visual
                  vis.text(letter, absX, absY, { color: 'yellow', font: 0.5 });

                  const existing = room.lookForAt(LOOK_STRUCTURES, absX, absY);
                  const site = room.lookForAt(LOOK_CONSTRUCTION_SITES, absX, absY);
                  if (!existing.length && !site.length) {
                      //room.createConstructionSite(absX, absY, structureType);
                  }

                  if (structureType === STRUCTURE_EXTENSION) {
                      placed.push({ x: absX, y: absY });
                      if (placed.length >= neededExtensions) break;
                  }
              }
              if (placed.length >= neededExtensions) break;
          }
      }

      // Move outward in staggered hex pattern
      if (attempts % 2 === 0) {
          startX -= 2;
      } else {
          startX += 2;
          startY += 2;
      }
      attempts++;
  }

  console.log(`[INFO] Placed ${placed.length} extensions in ${room.name}`);
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

  extensions: [
   '  r  ',
   ' rer ',
   'reeer',
   'reeer',
   ' rer ',
   '  r  '
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