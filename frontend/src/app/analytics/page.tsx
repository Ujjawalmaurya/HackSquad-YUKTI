"use client";
import React, { useEffect, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Leaf
} from 'lucide-react';
import { fetchVegetationReports } from '@/lib/api';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [healthDist, setHealthDist] = useState({ excellent: 0, good: 0, poor: 0 });

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchVegetationReports();
                // Sort by date ascending for the trend chart
                const sorted = data.sort((a: any, b: any) => new Date(a.processedDate).getTime() - new Date(b.processedDate).getTime());
                setReports(sorted);

                // Calculate Health Distribution from the latest report
                if (sorted.length > 0) {
                    const latest = sorted[sorted.length - 1];
                    const grid = latest.ndvi?.grid || [];
                    if (grid.length > 0) {
                        const total = grid.length;
                        const excellent = grid.filter((v: number) => v > 0.6).length;
                        const good = grid.filter((v: number) => v > 0.3 && v <= 0.6).length;
                        const poor = grid.filter((v: number) => v <= 0.3).length;
                        setHealthDist({
                            excellent: (excellent / total) * 100,
                            good: (good / total) * 100,
                            poor: (poor / total) * 100
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getTrend = () => {
        if (reports.length < 2) return 0;
        const curr = reports[reports.length - 1].ndvi?.stats?.mean || 0;
        const prev = reports[reports.length - 2].ndvi?.stats?.mean || 0;
        return ((curr - prev) / prev) * 100;
    };

    const trendValue = getTrend();
    const latestReport = reports[reports.length - 1];

    // Helper to format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return <div className="p-12 text-center text-muted">Loading Analytics...</div>;
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Yield & Health Analytics</h1>
                    <p className="text-muted text-sm font-medium mt-1">Historical performance and predictive trends.</p>
                </div>
                <div className="flex gap-3">
                    <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold opacity-50 cursor-not-allowed">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="bg-primary text-black font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* NDVI Trend Chart */}
                <div className="lg:col-span-2 glass rounded-[2rem] p-8 border border-border/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Health Index Trend (NDVI)
                            </h2>
                            <p className="text-xs text-muted mt-1">Vegetation health over time</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-xs font-bold text-muted">Recorded Values</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {reports.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-muted font-medium">
                                No analysis data available yet.
                            </div>
                        ) : (
                            reports.slice(-12).map((report, i) => {
                                const val = report.ndvi?.stats?.mean || 0;
                                const heightPct = Math.min(Math.max((val / 1) * 100, 10), 100); // Normalize 0-1 NDVI to %

                                return (
                                    <div key={report._id} className="flex-1 group relative flex flex-col justify-end h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className="bg-gradient-to-t from-primary/20 to-primary/60 group-hover:from-primary/40 group-hover:to-primary rounded-t-lg transition-all relative min-h-[4px]"
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-white/10">
                                                NDVI: {val.toFixed(3)}
                                            </div>
                                        </motion.div>
                                        <div className="mt-3 text-center">
                                            <div className="text-[10px] text-muted font-bold -rotate-45 origin-top-left translate-y-2 whitespace-nowrap">
                                                {formatDate(report.processedDate)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Predictive Insights / Quick Stats */}
                <div className="glass rounded-[2rem] p-8 border border-border/50 flex flex-col gap-6">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Real-time Insights
                    </h2>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-muted">Current Health Score</span>
                            {trendValue > 0 ? (
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                        <p className={`text-3xl font-black ${(latestReport?.aiInsights?.healthScore || 0) > 70 ? 'text-green-400' :
                                (latestReport?.aiInsights?.healthScore || 0) > 40 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {latestReport?.aiInsights?.healthScore || "N/A"}
                        </p>
                        <p className="text-xs text-muted mt-2 font-medium">
                            {trendValue !== 0 ? `${Math.abs(trendValue).toFixed(1)}% ${trendValue > 0 ? 'increase' : 'decrease'} from last scan` : 'First scan baseline'}
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-bold text-muted">Est. Healthy Area</span>
                            <Leaf className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-3xl font-black text-primary">
                            {/* Simple estimation: Total pixels * health % * arbitrary ha/pixel (mocked for now) */}
                            {latestReport ? ((latestReport.ndvi?.grid?.length || 0) * (healthDist.excellent + healthDist.good) / 100 * 0.05).toFixed(1) : "0"} ha
                        </p>
                        <p className="text-xs text-muted mt-2 font-medium">Based on 5cm/px resolution</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Health Distribution Chart */}
                <div className="glass rounded-[2rem] p-8 border border-border/50">
                    <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Crop Health Distribution
                    </h2>
                    <div className="space-y-6">
                        {[
                            { label: 'Excellent (>0.6)', value: healthDist.excellent, color: 'bg-green-500' },
                            { label: 'Good (0.3 - 0.6)', value: healthDist.good, color: 'bg-yellow-500' },
                            { label: 'Stressed (<0.3)', value: healthDist.poor, color: 'bg-red-500' }
                        ].map((item, i) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-2 font-bold">
                                    <span className="text-muted">{item.label}</span>
                                    <span>{item.value.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                                        className={`h-full ${item.color} shadow-lg shadow-${item.color}/50`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Recommendations Summary */}
                <div className="glass rounded-[2rem] p-8 border border-border/50">
                    <h2 className="text-lg font-black mb-6">Actionable Intelligence</h2>
                    <div className="space-y-4">
                        {latestReport?.aiInsights?.recommendations?.length > 0 ? (
                            latestReport.aiInsights.recommendations.slice(0, 3).map((rec: string, i: number) => (
                                <div key={i} className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                                    <div className="mt-1 min-w-[24px] h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">{rec}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted">No recommendations available.</div>
                        )}

                        {latestReport && (
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-xs text-muted text-center">
                                    From analysis of {latestReport.originalFile}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
