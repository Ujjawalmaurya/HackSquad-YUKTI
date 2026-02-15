'use client';
import React, { useState } from 'react';
import { uploadVegetationBatch } from '@/lib/api';

interface VegetationUploaderProps {
    onUploadSuccess: (data: any) => void;
}

const VegetationUploader: React.FC<VegetationUploaderProps> = ({ onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Using the batch API as it's the verified working endpoint
            const data = await uploadVegetationBatch([file]);

            // The batch API returns { results: [...] }, we need to pass the first result or the whole structure
            // Depending on what ValidationStats expects. 
            // The previous code expected 'data' directly. 
            // processSingleFile returns { results: { ndvi: ... } }
            // processBatchVegetation returns { results: [ { results: ... } ] }

            if (data.results && data.results.length > 0) {
                onUploadSuccess(data.results[0]);
            } else {
                throw new Error("No analysis results returned");
            }

        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Multispectral TIF</h2>

            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    accept=".tif,.tiff"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-green-50 file:text-green-700
                        hover:file:bg-green-100"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors
                        ${loading
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
                >
                    {loading ? 'Processing...' : 'Analyze Vegetation'}
                </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
                Supported formats: GeoTIFF (.tif). Max size: 200MB.
                Required bands: Blue, Green, Red, RedEdge, NIR.
            </p>
        </div>
    );
};

export default VegetationUploader;
