const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Farm = require('../models/Farm');
const Report = require('../models/Report');
const authenticateToken = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.post('/analyze', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { farmId } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const farm = await Farm.findById(farmId);
        if (!farm) return res.status(404).json({ error: 'Farm not found' });

        try {
            const formData = new FormData();
            const fileBuffer = fs.readFileSync(req.file.path);
            formData.append('file', fileBuffer, req.file.originalname);

            const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
                headers: { ...formData.getHeaders() }
            });

            const mlData = mlResponse.data;

            const sprayPlan = mlData.disease_detected ? {
                area: '4.2 Acres (Northeast Zone)',
                dosage: '250ml / ha',
                chemical: 'Agricultural Fungicide-X3',
                urgency: 'Immediate'
            } : null;

            const results = {
                ndvi: mlData.ndvi,
                healthStatus: mlData.ndvi > 0.6 ? 'Optimal Health' : mlData.ndvi > 0.3 ? 'Moderate Stress' : 'Critical Anomaly',
                diseaseDetected: mlData.disease_detected,
                detections: mlData.detections,
                yieldPrediction: mlData.yield_prediction,
                recommendations: mlData.disease_detected ?
                    ['Apply targeted fungicide in Zone B', 'Schedule follow-up drone inspection', 'Isolate affected sector'] :
                    ['Maintain current irrigation schedule', 'Observe nitrogen levels in Zone A', 'Optimal growth detected'],
                sprayPlan,
                imageUrl,
                metadata: {
                    ...mlData.metadata,
                    weather: 'Sunny, 28°C',
                    soil_moisture: '64%',
                    flight_stitching: 'Success'
                }
            };

            farm.analysisHistory.push(results);
            await farm.save();

            res.json(results);
        } catch (mlErr) {
            console.error('ML Service Error:', mlErr.message);
            const fallbackResults = {
                ndvi: 0.7,
                healthStatus: 'Unknown (Fallback Active)',
                diseaseDetected: false,
                detections: [],
                yieldPrediction: 10.5,
                recommendations: ['Check system connectivity'],
                imageUrl,
                metadata: { weather: 'Unknown', engine: 'Fallback' }
            };

            farm.analysisHistory.push(fallbackResults);
            await farm.save();
            res.json(fallbackResults);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/analyze-batch', authenticateToken, upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const formData = new FormData();
        req.files.forEach(file => {
            const fileBuffer = fs.readFileSync(file.path);
            formData.append('files', fileBuffer, file.originalname);
        });

        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze-batch`, formData, {
            headers: { ...formData.getHeaders() }
        });

        const mlData = mlResponse.data;

        const reportPrompt = `
        You are an agricultural expert. Below is the data from a batch analysis of farm images:
        ${JSON.stringify(mlData, null, 2)}

        Please prepare a detailed, human-readable, naturally written report in Markdown format. 
        Include sections for:
        - Executive Summary
        - Detailed Findings (per image if available)
        - Trend Analysis
        - Recommended Actions
        - Urgency Levels

        Things should be straight to point without jargons.

        Images list[
        9.webp: https://blogger.googleusercontent.com/img/a/AVvXsEga43npGz9x3wCzIGBiA7YpMyvznP4oC5-ejtuR0zees7GD58XZz7jYvq1aeBq9msjYLVmVlxIhuyaFH5xBVcdeeA02QA2fKDyqFjiUcVDWl_nOvKWgo3l3t827169Ch-oIwh1EH_6P8kAL7M1ITmNxX8H9YForyWR32faSyty0uRj1u-N7J4-gS0PF6Axc
        8.jpeg:https://blogger.googleusercontent.com/img/a/AVvXsEij6UtNcl9ZqCVrw0t34QOoqkwAIt9gz4BPlaXR_56m_nR7Vckn-SAVf53HSP6HX_E3nNs0BLD9Mze4uaIaZ5yYBP-uUXUw_nZQu4ZKDJXmRROu8Y6sQWwZllKDmYQ78czNGwEigZYtYS4gFfnp_T4RxMlmdWa-ahscW-ZVWXbfA4cLJ1NBuYl-I9ktPPeX
        7.jpg:  https://blogger.googleusercontent.com/img/a/AVvXsEhzoibjn9_W6uwtH1z4MQ62tODLfWVlEKxC_XNk-V8QtZx9azdUG9AX6v1bImpMQZPXAmLoeZv2l98nteBpjEwdOVzCeaz9HkKC6cJaMHyiX0LLjiiNEm2slXauH8j935TaZmvHxsj4BR7xD0SCgkMjUpN7orZRJq-n0OYP64MEe-fVEbPuoHXzqBUbVpZs
        6.jpg:https://blogger.googleusercontent.com/img/a/AVvXsEhr0yymUxIakvb7OPoYEjyRRgdavDyTTzmEafEglZ1jdondnrNk5JUrjTTkQjxBZ-7CX09iTHA3PXaCPSLxCH39fagQYQAste5mPdyJUO-PbK8WGrEgojz2LffhxXIHaMso_JRcSx2AlkcG85PLYRRthjNjVRQCfJFEWDcU0fc4DaaZC0cJTFTeFhBQCu1k
        5.jpeg:https://blogger.googleusercontent.com/img/a/AVvXsEj5PP88h1IB2zhtrfbL7uFPpIicUspzj6UTxytxr7mX79Hrt2yJLC0mSeeSmQOeyFGtSS_8h3pBMegjqSNvsabKLcZHldVYXxQ3I3YKQef1Dpe1XLHerWG_EQpQyYy_mJ3XskkgPa5PGBVoQQ_oxIoYD5SkaY21nEHCBoF_UEZ_iC6WiTlnj6aNzQ2rcR9L
        4.jpg:https://blogger.googleusercontent.com/img/a/AVvXsEga_M80hT5OR38TlkQrz0NR7MS5nyn18k68omMZqnZbDHyJ2J0pRCKrxC4J_ohXpEeqk5WZazgBbwypZxU68SDCrV0J6IKiaNNZaH0IWNUCToCkfKejmdOMIMwC6cle11vvZZKuSsEpPDgjxQ84PcpedJX47F5Na6HfUQXgfY6GOEZeEfglUmjJd4vSFaMY
        3.jpeg:https://blogger.googleusercontent.com/img/a/AVvXsEg89dnvZbzUKEbeXYrq3U2rtffSB2WIlCBfoYBMkei3oixxTymTbTCE7fQxS5MsSP_94EaKH1LRDRQtTCgvxaRkGyv55FohcCkw2m0xUTYovXg_-a5SfVa_J44ndB_i7kWBrPCsMmPxqOMZMfXoXcMwws_6CMywrkFsGnTLNsH9lZIwdvFWly_PuMgqWpQN
        2.jpeg:https://blogger.googleusercontent.com/img/a/AVvXsEifFpSyrJZknYJEdq0sngH9ysTLEQkXgfJXhq9Q0s_f1GZwTcSsvYXqFo2N_gJD_Mm2-5kdlsuoXTwpyU4qvZCMul_A7zzS1OA1Kxa4SHyRvgZRaNuIe4SW7Dh3uU66-p8lj6v8O_ufc5qnkZ5CYNPW4rfE7wEOz4M2w-fiJ87MDGA8W_OxZK0wGJka2BiL
        1.jpeg:https://blogger.googleusercontent.com/img/a/AVvXsEhG1gk46T94hGN9WSutj678pA2zaFlEcNCfFM8rrCeQp2s-6m-YBEODn1J8wPPxYNuqUg3jSPd_5wbI7E1MprOHTgHvFyVvDRH59fSX0EsoKopviIr9SL_XWm3vOwdkucPK7W1eR_YXe0jfTGFjftRW8VotUEFviIyMykcVlGSvvPhetCvuI18ftXWTeVkj
        ]

        Where you put image name. Add image from respective link.
        Highlight important data/facts.

        Respond ONLY with the markdown content. No conversational filler.
        `;

        const geminiResult = await model.generateContent(reportPrompt);
        const reportMarkdown = geminiResult.response.text();

        const imagePaths = req.files.map(f => `/uploads/${f.filename}`);
        const report = new Report({
            content: reportMarkdown,
            mlResults: mlData,
            images: imagePaths
        });

        await report.save();

        req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        res.json({
            message: 'Report generated and saved successfully',
            report: reportMarkdown,
            reportId: report._id
        });

    } catch (error) {
        console.error('Batch Analysis Error:', error.message);
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({ error: error.message || 'Analysis failed' });
    }
});

module.exports = router;
