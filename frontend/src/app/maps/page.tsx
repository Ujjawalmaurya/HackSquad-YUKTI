"use client";
import React, { useState, useEffect } from 'react';
import {
    Layers,
    Maximize,
    ZoomIn,
    ZoomOut,
    Map as MapIcon,
    Eye,
    Info,
    Loader2,
    Activity,
    Thermometer,
    Zap,
    X,
    AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchVegetationReports } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MapsPage() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [activeReport, setActiveReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState('ndvi');
    const [hoveredZone, setHoveredZone] = useState<number | null>(null);
    const [overlayOpacity, setOverlayOpacity] = useState(60); // Default 60% opacity

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchVegetationReports();
                setReports(data);

                const reportId = searchParams.get('report');
                if (reportId) {
                    const found = data.find((r: any) => r._id === reportId);
                    if (found) setActiveReport(found);
                    else setActiveReport(data[0]);
                } else if (data.length > 0) {
                    setActiveReport(data[0]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [searchParams]);

    const layers = [
        { id: 'ndvi', icon: Activity, label: "Plant Growth", gridKey: 'ndvi' },
        { id: 'gndvi', icon: MapIcon, label: "Leaf Color", gridKey: 'gndvi' },
        { id: 'savi', icon: Thermometer, label: "Soil Health", gridKey: 'savi' },
        { id: 'pest', icon: Zap, label: "Bug Attack", gridKey: 'pest' }
    ];

    const [showReportModal, setShowReportModal] = useState(false);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentGrid = activeReport ? activeReport[activeLayer === 'pest' ? 'ndvi' : activeLayer]?.grid : [];
    const currentStats = activeReport ? activeReport[activeLayer === 'pest' ? 'ndvi' : activeLayer]?.stats : null;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-in fade-in duration-500 relative">

            {/* Report Modal */}
            {showReportModal && activeReport?.detailedReport && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
                    <div className="bg-card border border-border w-full max-w-4xl h-full max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Full Field Report
                                </h2>
                                <p className="text-sm text-muted-foreground">Created by Farm Helper • {new Date(activeReport.processedDate).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Markdown Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-card">
                            <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:text-primary prose-a:text-blue-400 prose-strong:text-foreground text-foreground">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {activeReport.detailedReport}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-3">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors font-bold text-sm"
                            >
                                Close Report
                            </button>
                            <button className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform">
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Your Farm Map</h1>
                    <p className="text-muted-foreground text-sm">
                        {activeReport ? `Checking: ${activeReport.originalFile} (${new Date(activeReport.processedDate).toLocaleTimeString()})` : 'Look at how your field is doing today.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-card border border-border rounded-xl px-3 text-sm font-bold outline-none text-foreground shadow-sm"
                        onChange={(e) => {
                            const r = reports.find(x => x._id === e.target.value);
                            if (r) setActiveReport(r);
                        }}
                        value={activeReport?._id || ''}
                    >
                        {reports.map(r => (
                            <option key={r._id} value={r._id}>{r.originalFile} - {new Date(r.processedDate).toLocaleDateString()}</option>
                        ))}
                    </select>

                    <div className="flex bg-card p-1 rounded-xl border border-border shadow-sm">
                        {layers.map(layer => (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLayer === layer.id ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                            >
                                <layer.icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{layer.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-card rounded-3xl relative overflow-hidden border border-border group shadow-xl flex flex-col md:flex-row">

                {/* Visual Map Area */}
                <div className="relative flex-1 bg-muted/50 m-2 rounded-2xl overflow-hidden shadow-inner border border-border/50 min-h-[400px]">
                    {/* Global Spectral Overlay Filter (Subtle ambient) */}
                    <div className={`absolute inset-0 transition-all duration-500 pointer-events-none z-10 ${activeLayer === 'ndvi' ? 'bg-green-500/5' :
                        activeLayer === 'savi' ? 'bg-blue-500/5' :
                            'bg-transparent'
                        }`} />

                    {/* 20x20 Grid Rendering */}
                    <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] grid-rows-[repeat(20,minmax(0,1fr))]">
                        {/* Scanning Animation */}
                        <div className="block-scan-overlay" />

                        {(currentGrid && currentGrid.length > 0 ? currentGrid : Array(400).fill(0)).map((val: number, i: number) => {
                            // ... existing map rendering logic (simplified for diff) ...
                            const zoneValue = val;
                            let spectralFilter = 'bg-transparent';

                            // Color Scale Logic
                            if (activeLayer === 'pest') {
                                if (zoneValue < 0.2) spectralFilter = 'bg-red-600/90 animate-pulse ring-1 ring-red-500'; // Critical
                                else if (zoneValue < 0.4) spectralFilter = 'bg-orange-500/70'; // High
                                else if (zoneValue < 0.6) spectralFilter = 'bg-yellow-500/50'; // Medium
                                else spectralFilter = 'bg-transparent'; // Low/Safe
                            } else {
                                if (zoneValue > 0.6) spectralFilter = `bg-green-500 hover:bg-green-400`;
                                else if (zoneValue > 0.4) spectralFilter = `bg-green-500/60 hover:bg-green-500/80`;
                                else if (zoneValue > 0.2) spectralFilter = `bg-yellow-500/60 hover:bg-yellow-500/80`;
                                else if (zoneValue > 0) spectralFilter = `bg-orange-500/60 hover:bg-orange-500/80`;
                                else spectralFilter = `bg-red-500/60 hover:bg-red-500/80`;
                            }

                            return (
                                <div
                                    key={i}
                                    onMouseEnter={() => setHoveredZone(i)}
                                    // onMouseLeave={() => setHoveredZone(null)} // Keep last hovered for better UX
                                    className={`relative transition-all duration-150 cursor-crosshair group/cell ${activeLayer === 'pest' ? '' : 'hover:scale-125 hover:z-50 hover:shadow-xl hover:ring-1 hover:ring-white/50 rounded-sm'}`}
                                >
                                    {/* Color Overlay */}
                                    <div
                                        className={`absolute inset-0 transition-opacity duration-300 ${spectralFilter}`}
                                        style={{ opacity: activeLayer === 'pest' ? 0.7 : (overlayOpacity / 100) }} // Adjust opacity based on slider
                                    />

                                    {/* Detailed Tooltip on Hover */}
                                    {hoveredZone === i && (() => {
                                        const getZoneDetails = (val: number, layer: string) => {
                                            const isPest = layer === 'pest';
                                            const v = isPest ? (1 - val) : val; // Normalize

                                            if (isPest) {
                                                if (v > 0.8) return { status: 'High Risk', reason: 'Large pest attack seen here.', cure: 'Spray 2ml/L of Cypermethrin medicine now.' };
                                                if (v > 0.5) return { status: 'Warning', reason: 'Plants looking weak/bitten.', cure: 'Check for insects under leaves today.' };
                                                return { status: 'Safe', reason: 'Plants look clean and strong.', cure: 'No extra medicine needed.' };
                                            }

                                            if (v > 0.7) return { status: 'Very Healthy', reason: 'Crop has grown deep green and thick.', cure: 'Good work! No extra food needed now.' };
                                            if (v > 0.4) return { status: 'Normal', reason: 'Steady growth seen.', cure: 'Keep soil damp and watch for weeds.' };
                                            if (v > 0.2) return { status: 'Needs Food', reason: 'Plants are turning pale/hungry.', cure: 'Add 50kg/acre of Urea for better color.' };
                                            return { status: 'Dying/Dry', reason: 'Significant drying/lack of vitamins.', cure: 'Give 2 extra hours of water today.' };
                                        };

                                        const details = getZoneDetails(zoneValue, activeLayer);
                                        const layerLabel = activeLayer.toUpperCase();

                                        return (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-popover/95 backdrop-blur-md text-popover-foreground p-3 rounded-2xl border border-border z-[200] min-w-[200px] pointer-events-none shadow-2xl animate-in fade-in zoom-in duration-200">
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-popover rotate-45 border-r border-b border-border" />

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{layerLabel}: {zoneValue.toFixed(3)}</span>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${details.status.includes('Dying') || details.status.includes('Risk') ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Condition</p>
                                                            <p className={`text-sm font-black ${details.status.includes('Healthy') || details.status.includes('Safe') ? 'text-green-500' : 'text-red-500'}`}>
                                                                {details.status}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Why</p>
                                                            <p className="text-xs font-bold leading-tight">
                                                                {details.reason}
                                                            </p>
                                                        </div>

                                                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-tight mb-1"> How to Help</p>
                                                            <p className="text-xs font-black text-foreground leading-tight">
                                                                {details.cure}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Simulated Ortho Image Background */}
                    <div
                        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                        style={{
                            backgroundImage: 'url("/ortho.webp")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'grayscale(0.3) contrast(1.1)'
                        }}
                    />
                </div>

                {/* Sidebar Details Panel */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

                    <div>
                        <h2 className="text-lg font-black flex items-center gap-2 mb-1 text-foreground">
                            <Activity className="w-5 h-5 text-primary" />
                            {activeLayer === 'ndvi' ? 'Plant Growth' : activeLayer === 'gndvi' ? 'Leaf Color' : activeLayer === 'savi' ? 'Soil Health' : 'Bug Attack'} Report
                        </h2>
                        <p className="text-xs text-muted-foreground">Live field report</p>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 border border-border space-y-3 shadow-sm">
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-foreground">{currentStats?.mean.toFixed(3) || "0.00"}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-background border border-border ${currentStats?.mean > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                                {currentStats?.mean > 0.5 ? 'HEALTHY' : 'STRESSED'}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                            <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000" style={{ width: `${(currentStats?.mean || 0) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                            <span>Min: {currentStats?.min.toFixed(2)}</span>
                            <span>Max: {currentStats?.max.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 border border-border shadow-sm">
                        <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-muted-foreground">Growth Summary</h3>
                        <div className="flex items-end h-32 gap-1.5 px-2">
                            {(() => {
                                const isPest = activeLayer === 'pest';
                                const ranges = isPest
                                    ? [0, 0.2, 0.4, 0.6, 0.8]
                                    : [-1, -0.5, 0, 0.5, 1.0];

                                return ranges.map((range, idx) => {
                                    const count = (currentGrid || []).filter((v: number | null) => {
                                        if (v === null || v === 0) return false;
                                        const val = isPest ? (1 - v) : v;
                                        return val >= range && val < (isPest ? range + 0.2 : range + 0.5);
                                    }).length || 0;

                                    const validDataCount = (currentGrid || []).filter((v: number | null) => v !== null && v !== 0).length || 1;
                                    const height = Math.min((count / validDataCount) * 100 * 1.5, 100);

                                    let barClass = '';
                                    if (isPest) {
                                        if (idx >= 3) barClass = 'bg-gradient-to-t from-red-600 to-red-400 border-red-500/50';
                                        else barClass = 'bg-gradient-to-t from-green-600 to-green-400 border-green-500/50';
                                    } else {
                                        if (idx < 2) barClass = 'bg-gradient-to-t from-red-600 to-red-400 border-red-500/50';
                                        else barClass = 'bg-gradient-to-t from-green-600 to-green-400 border-green-500/50';
                                    }

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end group/bar">
                                            <div
                                                className={`w-full border-t border-x border-white/10 hover:brightness-110 transition-all rounded-t-lg relative shadow-lg ${barClass}`}
                                                style={{ height: `${Math.max(height, 8)}%` }}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground opacity-0 group-hover/bar:opacity-100 transition-opacity bg-card px-2 py-0.5 rounded shadow-sm border border-border z-10">{count}</div>
                                            </div>
                                        </div>
                                    )
                                });
                            })()}
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-muted-foreground mt-3 border-t border-border pt-2">
                            {activeLayer === 'pest' ? (
                                <><span>Safe</span><span>Risk</span><span>Critical</span></>
                            ) : (
                                <><span>Stressed</span><span>Neutral</span><span>Healthy</span></>
                            )}
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 border border-border flex-1 flex flex-col shadow-sm">
                        <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-muted-foreground flex justify-between">
                            Helpful Tips
                            {activeReport?.aiInsights?.healthScore > 0 && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${activeReport.aiInsights.healthScore > 75 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                    Score: {activeReport.aiInsights.healthScore}
                                </span>
                            )}
                        </h3>

                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                <p className="text-xs text-foreground/80 leading-relaxed italic">
                                    "{activeReport?.aiInsights?.summary || "Analysis pending..."}"
                                </p>
                            </div>

                            {activeReport?.aiInsights?.indexAnalysis?.[activeLayer] && (
                                <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                                    <h4 className="text-[10px] uppercase font-bold text-primary mb-1">Field Report</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {activeReport.aiInsights.indexAnalysis[activeLayer]}
                                    </p>
                                </div>
                            )}

                            {activeReport?.aiInsights?.focusAreas?.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Focus Areas</h4>
                                    <ul className="space-y-1">
                                        {activeReport.aiInsights.focusAreas.slice(0, 3).map((area: string, i: number) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span className="w-1 h-1 bg-red-400 rounded-full" />
                                                {area}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {activeReport?.detailedReport && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="w-full mt-4 py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20 shadow-sm"
                            >
                                View Full Report
                            </button>
                        )}
                    </div>

                </div>

                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none"></div>

                <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-md p-4 rounded-[1rem] border border-border max-w-sm shadow-2xl z-20 pointer-events-auto">
                    <h3 className="text-[10px] font-bold mb-3 text-foreground flex items-center gap-2 uppercase tracking-widest">
                        Map Controls
                    </h3>

                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
                            <span>Layer Brightness</span>
                            <span>{overlayOpacity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={overlayOpacity}
                            onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-1.5 border-t border-border pt-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Legend</h4>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-1.5 rounded-sm bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                            <span className="text-[10px] text-muted-foreground">Bad to Good Growth</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
