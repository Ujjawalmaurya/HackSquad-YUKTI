const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const vegetationController = require('../controllers/vegetation.controller');
const authenticateToken = require('../middleware/auth');

// Multer Setup (TIFF only)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-vegetation-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.tif' && ext !== '.tiff') {
            return cb(new Error('Only TIF/TIFF files are allowed for multispectral analysis'), false);
        }
        cb(null, true);
    }
});

// Calculate vegetation indices
router.post('/upload', authenticateToken, upload.single('image'), vegetationController.processVegetation);

// Batch upload
router.post('/batch', authenticateToken, upload.array('images'), vegetationController.processBatchVegetation);

// Get all reports
router.get('/', authenticateToken, vegetationController.getAllReports);

module.exports = router;
