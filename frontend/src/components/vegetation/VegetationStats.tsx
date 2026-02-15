'use client';
import React from 'react';

interface MetricStats {
    min: number;
    max: number;
    mean: number;
    stdDev: number;
    healthyPercentage: number;
}

interface MetricData {
    stats: MetricStats;
    grid: number[];
}

interface VegetationStatsProps {
    results: {
        ndvi: MetricData;
        gndvi: MetricData;
        ndre?: MetricData;
        savi?: MetricData;
        osavi?: MetricData;
    };
}

const StatCard: React.FC<{ title: string; stats: MetricStats; color: string }> = ({ title, stats, color }) => (
    <div className={`p-4 rounded-lg shadow-sm border border-${color}-100 bg-${color}-50`}>
        <h3 className={`text-lg font-bold mb-2 text-${color}-800`}>{title}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <span className="text-gray-500 block">Min</span>
                <span className="font-mono font-medium">{stats?.min?.toFixed(3) || 'N/A'}</span>
            </div>
            <div>
                <span className="text-gray-500 block">Max</span>
                <span className="font-mono font-medium">{stats?.max?.toFixed(3) || 'N/A'}</span>
            </div>
            <div>
                <span className="text-gray-500 block">Mean</span>
                <span className="font-mono font-medium">{stats?.mean?.toFixed(3) || 'N/A'}</span>
            </div>
            <div>
                <span className="text-gray-500 block">StdDev</span>
                <span className="font-mono font-medium">{stats?.stdDev?.toFixed(3) || 'N/A'}</span>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-500 block">Healthy Vegetation</span>
            <span className={`font-bold text-${color}-600`}>{stats?.healthyPercentage?.toFixed(1) || '0'}%</span>
        </div>
    </div>
);

const VegetationStats: React.FC<VegetationStatsProps> = ({ results }) => {
    if (!results) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="NDVI (Normalized Difference)" stats={results.ndvi?.stats} color="green" />
            <StatCard title="GNDVI (Green Normalized Difference)" stats={results.gndvi?.stats} color="teal" />

            {results.ndre && (
                <StatCard title="NDRE (Normalized Difference Red Edge)" stats={results.ndre?.stats} color="blue" />
            )}

            {results.savi && (
                <StatCard title="SAVI (Soil Adjusted)" stats={results.savi?.stats} color="amber" />
            )}

            {results.osavi && (
                <StatCard title="OSAVI (Optimized Soil Adjusted)" stats={results.osavi?.stats} color="orange" />
            )}
        </div>
    );
};

export default VegetationStats;
