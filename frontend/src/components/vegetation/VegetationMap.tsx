'use client';
import React from 'react';

interface VegetationMapProps {
    results?: any;
}

const VegetationMap: React.FC<VegetationMapProps> = ({ results }) => {
    // Default to a placeholder if no results
    if (!results || !results.ndvi?.grid) {
        return (
            <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center p-6 space-y-3">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Map Visualization</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload a file to see the spectral grid analysis.
                    </p>
                </div>
            </div>
        );
    }

    const grid = results.ndvi.grid;

    return (
        <div className="bg-[#020617] rounded-xl aspect-video relative overflow-hidden shadow-xl border border-gray-800 group">
            <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))]">
                {grid.map((val: number, i: number) => {
                    let spectralFilter = 'bg-transparent';
                    // Simple NDVI Color Scale
                    if (val > 0.7) spectralFilter = `bg-green-500 hover:bg-green-400`;
                    else if (val > 0.5) spectralFilter = `bg-green-500/60 hover:bg-green-500/80`;
                    else if (val > 0.3) spectralFilter = `bg-yellow-500/60 hover:bg-yellow-500/80`;
                    else if (val > 0.1) spectralFilter = `bg-orange-500/60 hover:bg-orange-500/80`;
                    else spectralFilter = `bg-red-500/60 hover:bg-red-500/80`;

                    return (
                        <div
                            key={i}
                            className={`relative transition-all duration-150 cursor-crosshair group/cell hover:scale-125 hover:z-50 hover:shadow-xl hover:ring-1 hover:ring-white/50 rounded-sm`}
                            title={`NDVI: ${val.toFixed(3)}`}
                        >
                            <div
                                className={`absolute inset-0 transition-opacity duration-300 ${spectralFilter}`}
                                style={{ opacity: 0.8 }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <div className="text-[10px] text-white font-bold uppercase mb-1">NDVI Health</div>
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                </div>
            </div>
        </div>
    );
};

export default VegetationMap;
