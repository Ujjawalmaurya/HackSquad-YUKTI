function calculateStats(raster) {
    if (!raster || raster.length === 0) return null;

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    let healthyCount = 0; // Assuming > 0.5 is healthy

    for (let i = 0; i < raster.length; i++) {
        const val = raster[i];
        if (Number.isNaN(val) || val === -9999) continue; // Skip NoData or NaN

        if (val < min) min = val;
        if (val > max) max = val;
        sum += val;
        count++;

        if (val > 0.5) healthyCount++; // Very simple threshold for demo
    }

    const mean = count > 0 ? sum / count : 0;

    // Calculate StdDev
    let sumSqDiff = 0;
    for (let i = 0; i < raster.length; i++) {
        const val = raster[i];
        if (Number.isNaN(val) || val === -9999) continue;
        const diff = val - mean;
        sumSqDiff += diff * diff;
    }
    const stdDev = count > 0 ? Math.sqrt(sumSqDiff / count) : 0;

    return {
        min,
        max,
        mean,
        stdDev,
        healthyPercentage: count > 0 ? (healthyCount / count) * 100 : 0
    };
}

/**
 * Downsamples the raster to a fixed grid size (e.g., 20x20).
 * Useful for frontend visualization where full resolution is overkill.
 * @param {Float32Array} raster - The pixel data
 * @param {number} width - Original image width
 * @param {number} height - Original image height
 * @param {number} gridSize - Target grid dimension (default 20 for 20x20)
 * @returns {number[]} - Array of grid values
 */
function calculateGrid(raster, width, height, gridSize = 20) {
    if (!raster || raster.length === 0) return [];

    const grid = new Float32Array(gridSize * gridSize).fill(0);
    const counts = new Int32Array(gridSize * gridSize).fill(0);

    const stepX = Math.ceil(width / gridSize);
    const stepY = Math.ceil(height / gridSize);

    // Iterate through original pixels and accumulate into grid cells
    // Sampling strategy: Iterate all pixels and map to grid cell
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const val = raster[y * width + x];

            // Skip invalid data
            if (Number.isNaN(val) || val === -9999) continue;

            const gridX = Math.min(Math.floor(x / stepX), gridSize - 1);
            const gridY = Math.min(Math.floor(y / stepY), gridSize - 1);
            const gridIndex = gridY * gridSize + gridX;

            grid[gridIndex] += val;
            counts[gridIndex]++;
        }
    }

    // Average the values
    const result = [];
    for (let i = 0; i < grid.length; i++) {
        result.push(counts[i] > 0 ? Number((grid[i] / counts[i]).toFixed(3)) : 0);
    }

    return result;
}

module.exports = { calculateStats, calculateGrid };
