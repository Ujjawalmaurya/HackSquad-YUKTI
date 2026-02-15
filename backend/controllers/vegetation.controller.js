const VegetationReport = require('../models/VegetationReport');
const { extractBands, readGeoTIFF } = require('../processors/vegetation/bandReader');
const { ndvi, gndvi, ndre, savi, osavi } = require('../processors/vegetation/indexEngine');
const { calculateStats, calculateGrid } = require('../processors/vegetation/statistics');
// Removed generateVegetationGrid import as we use real data now
const { generateFarmAnalysis } = require('../utils/gemini'); // Import explicitly at top
const Farm = require('../models/Farm');

async function processSingleFile(file, userId, farmId) {
    const filePath = file.path;
    console.log(`[processSingleFile] Processing Vegetation Analysis for ${filePath}`);

    try {
        // 1. Read GeoTIFF
        console.log(`[processSingleFile] Reading GeoTIFF: ${file.originalname}`);
        const tiffData = await readGeoTIFF(filePath);

        // 2. Extract Bands
        console.log(`[processSingleFile] Extracting bands for: ${file.originalname}`);
        const bands = extractBands(tiffData.rasters);

        // 3. Calculate Indices
        console.log(`[processSingleFile] Calculating indices for: ${file.originalname}`);
        const ndviRaster = ndvi(bands.nir, bands.red);
        const gndviRaster = gndvi(bands.nir, bands.green);
        const ndreRaster = ndre(bands.nir, bands.redEdge);
        const saviRaster = savi(bands.nir, bands.red);
        const osaviRaster = osavi(bands.nir, bands.red);

        // 4. Calculate Stats & Grids (Real Data)
        console.log(`[processSingleFile] Calculating stats and grids for: ${file.originalname}`);
        const ndviStats = calculateStats(ndviRaster);
        const ndviGrid = calculateGrid(ndviRaster, tiffData.width, tiffData.height);

        const gndviStats = calculateStats(gndviRaster);
        const gndviGrid = calculateGrid(gndviRaster, tiffData.width, tiffData.height);

        const ndreStats = ndreRaster ? calculateStats(ndreRaster) : null;
        const ndreGrid = ndreRaster ? calculateGrid(ndreRaster, tiffData.width, tiffData.height) : [];

        const saviStats = calculateStats(saviRaster);
        const saviGrid = calculateGrid(saviRaster, tiffData.width, tiffData.height);

        const osaviStats = calculateStats(osaviRaster);
        const osaviGrid = calculateGrid(osaviRaster, tiffData.width, tiffData.height);

        // 5. Generate AI Farm Analysis (Optimization: We can make this optional or async if needed, but per user request we keep analysis but remove 'middle part' grid gen)
        console.log(`[processSingleFile] Generating AI Farm Insights for: ${file.originalname}`);
        const allStats = {
            ndvi: ndviStats,
            gndvi: gndviStats,
            ndre: ndreStats,
            savi: saviStats,
            osavi: osaviStats
        };

        let aiInsights = {
            healthScore: 0,
            summary: "Analysis Pending",
            recommendations: [],
            detailedMarkdownReport: "Pending generation..."
        };

        try {
            aiInsights = await generateFarmAnalysis(allStats);
        } catch (aiError) {
            console.error("Gemini Analysis Failed (Non-blocking):", aiError.message);
        }

        // 5b. Create Report Object (to be saved)
        console.log(`[processSingleFile] Saving report to DB for: ${file.originalname}`);
        const report = new VegetationReport({
            userId: userId,
            farmId: farmId,
            originalFile: file.filename,
            width: tiffData.width,
            height: tiffData.height,
            ndvi: { stats: ndviStats, grid: ndviGrid },
            gndvi: { stats: gndviStats, grid: gndviGrid },
            ndre: { stats: ndreStats, grid: ndreGrid },
            savi: { stats: saviStats, grid: saviGrid },
            osavi: { stats: osaviStats, grid: osaviGrid },
            metadata: {
                bbox: tiffData.bbox ? Array.from(tiffData.bbox) : [],
                crs: "EPSG:4326"
            },
            aiInsights: aiInsights,
            detailedReport: aiInsights.detailedMarkdownReport
        });

        await report.save();
        console.log(`[processSingleFile] Report saved successfully: ${report._id}`);

        // 6. Update Farm History
        if (farmId) {
            console.log(`[processSingleFile] Updating Farm history for: ${farmId}`);
            await Farm.findByIdAndUpdate(farmId, {
                $push: {
                    analysisHistory: {
                        date: new Date(),
                        ndvi: ndviStats ? ndviStats.mean : 0,
                        healthStatus: (aiInsights.healthScore > 75) ? 'Excellent' : (aiInsights.healthScore > 50 ? 'Good' : 'Needs Attention'),
                        diseaseDetected: false,
                        imageUrl: `/uploads/${file.filename}`,
                        metadata: {
                            reportId: report._id,
                            ndviGrid: ndviGrid,
                            resolution: `${tiffData.width}x${tiffData.height}`
                        },
                        aiSummary: {
                            healthScore: aiInsights.healthScore,
                            summary: aiInsights.summary
                        },
                        // We do NOT save detailedReport here to keep Farm document light
                        recommendations: aiInsights.recommendations
                    }
                }
            });
        }

        return {
            filename: file.originalname,
            reportId: report._id,
            aiInsights: aiInsights,
            results: {
                ndvi: { stats: ndviStats, grid: ndviGrid },
                gndvi: { stats: gndviStats, grid: gndviGrid },
                ndre: { stats: ndreStats, grid: ndreGrid },
                savi: { stats: saviStats, grid: saviGrid },
                osavi: { stats: osaviStats, grid: osaviGrid }
            }
        };
    } catch (error) {
        console.error(`[processSingleFile] Error processing file ${file.originalname}:`, error);
        throw error; // Re-throw to be caught by the batch processor
    }
}

async function processVegetation(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No TIF file uploaded' });
        }

        const result = await processSingleFile(req.file, req.user.id, req.body.farmId);

        res.status(201).json({
            message: 'Vegetation analysis complete',
            ...result
        });

    } catch (error) {
        console.error('Vegetation Processing Error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function processBatchVegetation(req, res) {
    console.log('Batch vegetation upload request received');
    try {
        if (!req.files || req.files.length === 0) {
            console.error('No files found in request');
            return res.status(400).json({ error: 'No TIF files uploaded' });
        }

        const { farmId } = req.body;
        // farmId is now optional
        if (farmId) {
            console.log(`Processing ${req.files.length} files for farm ${farmId}`);
        } else {
            console.log(`Processing ${req.files.length} files without linked farm`);
        }

        const results = [];
        const errors = [];

        // Determine if we are processing a single file upload masquerading as batch or actual batch
        const filesToProcess = Array.isArray(req.files) ? req.files : [req.files];

        for (const file of filesToProcess) {
            try {
                console.log(`Starting processing for file: ${file.originalname}`);
                const result = await processSingleFile(file, req.user.id, farmId);
                results.push(result);
                console.log(`Successfully processed: ${file.originalname}`);
            } catch (err) {
                console.error(`Error processing ${file.originalname}:`, err);
                errors.push({ filename: file.originalname, error: err.message });
            }
        }

        const responseStatus = results.length > 0 ? 201 : 400; // If at least one succeeded, 201, else 400 (or partial content 207 but sticking to simple for now)

        res.status(responseStatus).json({
            message: 'Batch vegetation analysis complete',
            processed: results.length,
            failed: errors.length,
            results,
            errors
        });

    } catch (error) {
        console.error('Batch Vegetation Processing Critical Error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function getAllReports(req, res) {
    try {
        const reports = await VegetationReport.find({ userId: req.user.id })
            .sort({ processedDate: -1 })
            .limit(20); // Limit to recent 20 for now
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { processVegetation, processBatchVegetation, getAllReports };
