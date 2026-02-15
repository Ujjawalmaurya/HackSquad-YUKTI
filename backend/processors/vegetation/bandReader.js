const fs = require('fs');
const GeoTIFF = require('geotiff');
const { fromArrayBuffer } = GeoTIFF;

// Default Band Map for 5-band multispectral sensors (MicaSense, DJI P4M)
// 1: Blue, 2: Green, 3: Red, 4: RedEdge, 5: NIR
const DEFAULT_BAND_MAP = {
    blue: 0,
    green: 1,
    red: 2,
    redEdge: 3,
    nir: 4
};

async function readGeoTIFF(filePath) {
    try {
        const fileData = fs.readFileSync(filePath);
        const arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength);
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const rasters = await image.readRasters();

        // Extract basic metadata
        const width = image.getWidth();
        const height = image.getHeight();
        const bands = rasters.length;
        const bbox = image.getBoundingBox();
        const fileDirectory = image.fileDirectory;

        return {
            width,
            height,
            bands,
            rasters, // Array of TypedArrays (one per band)
            bbox,
            geoKeys: fileDirectory.GeoKeyDirectory,
            model: fileDirectory.ModelTiepoint
        };
    } catch (error) {
        throw new Error(`Failed to read GeoTIFF: ${error.message}`);
    }
}

function extractBands(rasters, bandMap = DEFAULT_BAND_MAP) {
    // If fewer than 5 bands, we might have RGB or custom
    if (rasters.length < 3) {
        throw new Error('Image must have at least 3 bands for vegetation analysis');
    }

    // Dynamic mapping based on available bands could be added here
    // For now, assume standard 5-band or at least R, G, NIR availability

    return {
        blue: rasters[bandMap.blue],
        green: rasters[bandMap.green],
        red: rasters[bandMap.red],
        redEdge: rasters[bandMap.redEdge] || null, // Optional
        nir: rasters[bandMap.nir] || rasters[3] // Fallback for 4-band
    };
}

module.exports = { readGeoTIFF, extractBands, DEFAULT_BAND_MAP };
