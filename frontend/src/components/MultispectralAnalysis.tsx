"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileUp, Loader2, CheckCircle2, AlertCircle, Map as MapIcon, Layers, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface AnalysisJob {
    jobId: string;
    status: JobStatus;
    step?: string;
    progress?: number;
    result?: {
        report_url: string;
        indices: Array<{
            name: string;
            url: string; // Relative URL from ML service
        }>;
        metadata: Record<string, any>;
    };
    error?: string;
}

export default function MultispectralAnalysis() {
    const [file, setFile] = useState<File | null>(null);
    const [job, setJob] = useState<AnalysisJob | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Polling ref
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.zip')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a valid .zip file');
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.name.endsWith('.zip')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a valid .zip file');
            }
        }
    };

    const startAnalysis = async () => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            setJob({ jobId: '', status: 'PENDING', step: 'Uploading...' });

            const res = await fetch(`${API_URL}/multispectral/upload`, {
                method: 'POST',
                body: formData, // fetch handles Content-Type for FormData automatically
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setJob({
                jobId: data.job_id,
                status: 'PROCESSING',
                step: 'Initiating analysis...'
            });

        } catch (err: any) {
            setError(err.message || 'Failed to start analysis');
            setJob(null);
        }
    };

    // Polling Logic
    useEffect(() => {
        if (job?.jobId && job.status === 'PROCESSING') {
            const poll = async () => {
                try {
                    const res = await fetch(`${API_URL}/multispectral/status/${job.jobId}`);
                    const data = await res.json();

                    if (data.status === 'COMPLETED') {
                        // Fetch report
                        const reportRes = await fetch(`${API_URL}/multispectral/report/${job.jobId}`);
                        const reportData = await reportRes.json();

                        setJob(prev => prev ? {
                            ...prev,
                            status: 'COMPLETED',
                            result: reportData
                        } : null);
                    } else if (data.status === 'FAILED') {
                        setJob(prev => prev ? {
                            ...prev,
                            status: 'FAILED',
                            error: data.error || 'Analysis failed'
                        } : null);
                    } else {
                        // Update progress/step
                        setJob(prev => prev ? {
                            ...prev,
                            status: 'PROCESSING',
                            step: data.step
                        } : null);
                    }
                } catch (err) {
                    console.error('Polling error', err);
                    // Don't fail immediately on polling error, might be transient
                }
            };

            pollingRef.current = setInterval(poll, 3000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [job?.jobId, job?.status]);

    // Helper to proxy image URLs
    const getProxyUrl = (relativePath: string) => {
        // relativePath might look like /data/jobid/image.png or just /jobid/image.png depending on ML service
        // The User said ML Service returns relative URLs (e.g. /data/xyz/image.png)
        // Proxy endpoint is /api/multispectral/proxy/xyz/image.png -> http://localhost:8000/data/xyz/image.png

        // If relativePath starts with /data/, strip it because proxy adds it?
        // User Requirement: "Request to /api/multispectral/proxy/123/report.html -> fetches http://localhost:8000/data/123/report.html"
        // So if relativePath is "/data/123/img.png", we need to send "123/img.png" to the proxy endpoint?
        // Wait, the user said: "Metric: Proxy endpoint: GET /api/multispectral/proxy/* ... performs request to http://localhost:8000/data/*"
        // So if I call proxy/123.png, it calls data/123.png.
        // If ML service returns "/data/123/ndvi.png", I should strip "/data/" maybe? 
        // Or maybe I should just assume the ML service returns paths relative to its root?
        // Let's assume we strip `/data/` if present.

        let cleanedPath = relativePath.startsWith('/data/') ? relativePath.replace('/data/', '') : relativePath;
        if (cleanedPath.startsWith('/')) cleanedPath = cleanedPath.substring(1);

        return `${API_URL}/multispectral/proxy/${cleanedPath}`;
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Data Acquisition</h1>
                <p className="text-muted-foreground">
                    Upload multispectral ZIP or individual TAGGED images to do this multispectral data collection job.
                </p>
            </div>

            {/* Upload Section */}
            <AnimatePresence mode="wait">
                {!job && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass p-8 rounded-2xl border border-dashed border-border/50 text-center"
                    >
                        <div
                            className={`
                                relative group cursor-pointer flex flex-col items-center justify-center 
                                h-64 rounded-xl border-2 border-dashed transition-all duration-300
                                ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/40 hover:border-primary/50 hover:bg-muted/50'}
                            `}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".zip,image/*"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />

                            <div className="flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full transition-colors ${file ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                    {file ? <FileUp className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">
                                        {file ? file.name : "Drop dataset ZIP or tagged images here"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB selected` : "or click to browse"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={startAnalysis}
                                disabled={!file}
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                                    ${file
                                        ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'}
                                `}
                            >
                                Start Processing
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Section */}
            <AnimatePresence>
                {job && job.status !== 'COMPLETED' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass p-8 rounded-2xl border border-border/50 flex flex-col items-center justify-center min-h-[400px] text-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            {job.status === 'FAILED' ? (
                                <div className="relative bg-red-500/10 p-6 rounded-full text-red-500">
                                    <AlertCircle className="w-12 h-12" />
                                </div>
                            ) : (
                                <div className="relative bg-primary/10 p-6 rounded-full text-primary">
                                    <Loader2 className="w-12 h-12 animate-spin" />
                                </div>
                            )}
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">
                            {job.status === 'FAILED' ? 'Analysis Failed' : 'Processing Dataset'}
                        </h2>

                        <p className="mt-2 text-muted-foreground max-w-md">
                            {job.error || job.step || 'Please wait while we stitch images and calculate indices...'}
                        </p>

                        {job.status === 'FAILED' && (
                            <button
                                onClick={() => { setJob(null); setFile(null); }}
                                className="mt-6 px-6 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
                {job?.status === 'COMPLETED' && job.result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass p-6 rounded-2xl border border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Analysis Complete</h2>
                                    <p className="text-sm text-muted-foreground">generated {job.result.indices?.length || 0} vegetation indices</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setJob(null); setFile(null); }}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Start New Analysis
                            </button>
                        </div>

                        {/* Indices Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {job.result.indices?.map((index, idx) => (
                                <motion.div
                                    key={index.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass rounded-2xl overflow-hidden border border-border/50 card-hover group"
                                >
                                    <div className="relative aspect-video bg-muted/50 overflow-hidden">
                                        <img
                                            src={getProxyUrl(index.url)}
                                            alt={index.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <a
                                                href={getProxyUrl(index.url)}
                                                target="_blank"
                                                download
                                                className="text-white text-sm flex items-center gap-2 hover:underline"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Map
                                            </a>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Layers className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold">{index.name}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Vegetation index calculated from multispectral bands.
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Full Report Link */}
                        {job.result.report_url && (
                            <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                                        <MapIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold">Detailed Report</h3>
                                </div>
                                <div className="bg-muted/30 rounded-xl overflow-hidden border border-border/50 h-[600px]">
                                    <iframe
                                        src={getProxyUrl(job.result.report_url)}
                                        className="w-full h-full"
                                        title="Analysis Report"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
