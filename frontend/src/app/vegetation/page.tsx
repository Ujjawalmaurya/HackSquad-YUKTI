'use client';
import React, { useState } from 'react';
import VegetationUploader from '@/components/vegetation/VegetationUploader';
import VegetationStats from '@/components/vegetation/VegetationStats';
import VegetationMap from '@/components/vegetation/VegetationMap';

export default function VegetationPage() {
    const [analysisResults, setAnalysisResults] = useState<any>(null);

    const handleAnalysisComplete = (data: any) => {
        setAnalysisResults(data.results);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Vegetation Intelligence
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Upload multispectral orthomosaics to analyze crop health using advanced vegetation indices.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Upload & Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <VegetationUploader onUploadSuccess={handleAnalysisComplete} />

                        {analysisResults && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900">Analysis Summary</h3>
                                <dl className="mt-4 space-y-4">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Processing Time</dt>
                                        <dd className="text-sm font-medium text-gray-900">1.2s</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Resolution</dt>
                                        <dd className="text-sm font-medium text-gray-900">5cm/px</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-500">Status</dt>
                                        <dd className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Complete
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Visualization & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        <VegetationMap results={analysisResults} />

                        {analysisResults ? (
                            <VegetationStats results={analysisResults} />
                        ) : (
                            <div className="bg-white rounded-xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200">
                                <p>Upload a file to see spectral analysis statistics.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
