const algorithms = {
  /**
   * Performs Depth-First Search (DFS) on a 2D grid.
   * 
   * @param {number[][]} grid - The 2D grid.
   * @param {number} startX - The starting X coordinate.
   * @param {number} startY - The starting Y coordinate.
   * @param {Function} visit - A function that processes each visited cell.
   * @param {boolean} [iterative=true] - Whether to use an iterative approach (default: true).
   */
  dfs: function (grid, startX, startY, visit, iterative = true) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set();

    if (iterative) {
      const stack = [[startX, startY]];

      while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        if (visited.has(key)) continue;

        visit(x, y, grid[x][y]);
        visited.add(key);

        for (const [nx, ny] of this.getNeighbors(x, y, rows, cols)) {
          const neighborKey = `${nx},${ny}`;
          if (!visited.has(neighborKey)) {
            stack.push([nx, ny]);
          }
        }
      }
    } else {
      (function recursiveDFS(x, y) {
        const key = `${x},${y}`;
        if (visited.has(key)) return;

        visit(x, y, grid[x][y]);
        visited.add(key);

        for (const [nx, ny] of this.getNeighbors(x, y)) {
          recursiveDFS(nx, ny);
        }
      })(startX, startY);
    }
  },
  /**
   * Performs Breadth-First Search (BFS) on a 2D grid, allowing diagonal movement.
   * 
   * @param {number[][]} grid - The 2D grid.
   * @param {number} startX - The starting X coordinate.
   * @param {number} startY - The starting Y coordinate.
   * @param {Function} visit - A function that processes each visited cell.
   */
  bfs: function (grid, startX, startY, visit) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set();
    const queue = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      visit(x, y, grid[x][y]);
      visited.add(key);

      for (const [nx, ny] of this.getNeighbors(x, y, rows, cols)) {
        const neighborKey = `${nx},${ny}`;
        if (!visited.has(neighborKey)) {
          queue.push([nx, ny]);
        }
      }
    }
  },
  /**
   * Dijkstra's algorithm for a 2D grid.
   * 
   * @param {number[][]} grid - The weighted 2D grid.
   * @param {number} startX - The starting X coordinate.
   * @param {number} startY - The starting Y coordinate.
   * @returns {number[][]} - The shortest distances from (startX, startY) to all cells.
   */
  dijkstra: function (grid, startX, startY) {
    const rows = grid.length;
    const cols = grid[0].length;
    const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const visited = new Set();
    const heap = new MinHeap();

    distances[startX][startY] = 0;
    heap.push([0, startX, startY]); // [distance, x, y]

    while (!heap.isEmpty()) {
      const [currentDist, x, y] = heap.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      for (const [nx, ny] of this.getNeighbors(x, y, rows, cols)) {
        const newDist = currentDist + grid[nx][ny]; // Weight from the grid
        if (newDist < distances[nx][ny]) {
          distances[nx][ny] = newDist;
          heap.push([newDist, nx, ny]);
        }
      }
    }

    return distances;
  },
  MinHeap: class {
    constructor() {
      this.heap = [];
    }

    push(node) {
      this.heap.push(node);
      this.heap.sort((a, b) => a[0] - b[0]); // Sort by distance
    }

    pop() {
      return this.heap.shift(); // Remove the smallest element
    }

    isEmpty() {
      return this.heap.length === 0;
    }
  },
  getNeighbors: (x, y, rows, cols) => {

    const directions = [
      [0, 1],   // Right
      [1, 0],   // Down
      [0, -1],  // Left
      [-1, 0],  // Up
      [-1, -1], // Top-left diagonal
      [-1, 1],  // Top-right diagonal
      [1, -1],  // Bottom-left diagonal
      [1, 1]    // Bottom-right diagonal
    ];
    return directions
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < rows && ny < cols); // Bounds check
  },
  /**
   * Performs a distance transform on a room and returns a CostMatrix.
   *  The distance transform is a two-pass algorithm that calculates the distance from each open tile to the nearest wall.
   *  The result is a heatmap that can be used for pathfinding, heatmaps, and other applications.
   *
   * @param {string} roomName - The name of the room to analyze.
   * @returns {PathFinder.CostMatrix} - The distance transform heatmap.
   */
  distanceTransform: function (roomName) {
    let vis = new RoomVisual(roomName);
    const terrain = Game.map.getRoomTerrain(roomName);
    let distanceMap = new PathFinder.CostMatrix();

    let min = Infinity;
    let max = 0;
    let maxTiles = [];

    // ✅ Initialize the distance map (Walls = 0, Edges ignored, Open space = Infinity)
    for (let y = 1; y < 49; ++y) {
      for (let x = 1; x < 49; ++x) {
        if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
          distanceMap.set(x, y, 0); // Walls are sources
        } else {
          distanceMap.set(x, y, 255); // Set high initial value for open spaces
        }
      }
    }

    // ✅ First Pass: Top-left to Bottom-right
    for (let y = 1; y < 49; ++y) {
      for (let x = 1; x < 49; ++x) {
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
          let value = distanceMap.get(x, y);
          value = Math.min(value, distanceMap.get(x - 1, y) + 1);
          value = Math.min(value, distanceMap.get(x, y - 1) + 1);
          value = Math.min(value, distanceMap.get(x - 1, y - 1) + 1);
          value = Math.min(value, distanceMap.get(x + 1, y - 1) + 1);
          distanceMap.set(x, y, value);
        }
      }
    }

    // ✅ Second Pass: Bottom-right to Top-left
    for (let y = 48; y >= 1; --y) {
      for (let x = 48; x >= 1; --x) {
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
          let value = distanceMap.get(x, y);
          value = Math.min(value, distanceMap.get(x + 1, y) + 1);
          value = Math.min(value, distanceMap.get(x, y + 1) + 1);
          value = Math.min(value, distanceMap.get(x + 1, y + 1) + 1);
          value = Math.min(value, distanceMap.get(x - 1, y + 1) + 1);
          distanceMap.set(x, y, value);

          // ✅ Track max value dynamically
          if (value > max) {
            max = value;
            maxTiles = [{ x, y }];
          } else if (value === max) {
            maxTiles.push({ x, y });
          }

          min = Math.min(min, value);
        }
      }
    }

    console.log(`[DEBUG] Final Max: ${max}, Min: ${min}`);

    // ✅ Ensure valid min/max values
    if (max - min < 1) max = min + 1;
    if (min < 1 || isNaN(min)) min = 1;

    // ✅ Render Heatmap (Only for the buildable area)
    for (let y = 1; y < 49; ++y) {
      for (let x = 1; x < 49; ++x) {
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
          let value = distanceMap.get(x, y);
          let color = getHeatmapColor(value, min, max);

          // opacity 10%
          vis.circle(x, y, {
            radius: Math.max(value / 12),
            fill: color,
            opacity: 0.1
          });
        }
      }
    }

    return distanceMap;
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
  getHeatmapColor: (value, minVal = 1, maxVal = 50) => {
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
  }
}

module.exports = algorithms;