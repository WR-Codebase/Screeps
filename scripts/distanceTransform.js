const distanceTransform = function (roomName) {
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

        //if (value > 1) vis.text(value, x, y);
        // opacity 10%
        vis.circle(x, y, {
          radius: Math.max(value / 12),
          fill: color,
          opacity: 0.5
        });
      }
    }
  }

  return distanceMap;
};

/**
 * Returns a heatmap color based on an input value within a dynamic range.
 * The heatmap transitions from blue (min) to red (mid) to yellow (max).
 * 
 * @param {number} value - The input number within the specified range.
 * @param {number} [minVal=1] - The minimum value of the range (default is 1).
 * @param {number} [maxVal=50] - The maximum value of the range (default is 50).
 * @returns {string} - The corresponding heatmap color as a hexadecimal string.
 */
const getHeatmapColor = (value, minVal = 1, maxVal = 50) => {
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
};

module.exports = distanceTransform;