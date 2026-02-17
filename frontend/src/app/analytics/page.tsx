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
    const [stats, setStats] = useState({
        avgHealth: 0,
        totalArea: 0,
        criticalZones: 0,
        condition: 'Analyzing...',
        topSolutions: [] as string[]
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchVegetationReports();
                const sorted = data.sort((a: any, b: any) => new Date(a.processedDate).getTime() - new Date(b.processedDate).getTime());
                setReports(sorted);

                if (sorted.length > 0) {
                    // Aggregated Calculations
                    const totalHealth = sorted.reduce((acc: number, r: any) => acc + (r.aiInsights?.healthScore || 0), 0);
                    const avgHealth = totalHealth / sorted.length;

                    // Estimate total unique area (sum of all reports * rough ha conversion)
                    const totalArea = sorted.reduce((acc: number, r: any) => acc + ((r.ndvi?.grid?.length || 0) * 0.05), 0);

                    // Extract common recurring recommendations
                    const allRecs = sorted.flatMap((r: any) => r.aiInsights?.recommendations || []);
                    const recCounts = allRecs.reduce((acc: any, rec: string) => {
                        acc[rec] = (acc[rec] || 0) + 1;
                        return acc;
                    }, {});
                    const topSolutions = Object.entries(recCounts)
                        .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(e => e[0]);

                    // Determine Strategic Condition
                    let condition = 'Stable';
                    if (avgHealth > 75) condition = 'Excellent - High Yield Potential';
                    else if (avgHealth > 50) condition = 'Steady - Minor Interventions Required';
                    else condition = 'Critical - Immediate Action Needed';

                    setStats({
                        avgHealth,
                        totalArea,
                        criticalZones: sorted.filter((r: any) => (r.aiInsights?.healthScore || 0) < 40).length,
                        condition,
                        topSolutions: topSolutions.length > 0 ? topSolutions : ["No critical trends detected yet."]
                    });
                }
            } catch (err) {
                console.error("Failed to load analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-primary font-black animate-pulse">Aggregating Historical Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tight">Farm Health Dashboard</h1>
                    <p className="text-muted font-medium mt-1">See how your plants are growing and what they need.</p>
                </div>
                <div className="hidden md:flex gap-3">
                    <button className="bg-primary hover:bg-primary/90 text-black font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-primary/20">
                        <Download className="w-5 h-5" />
                        Save Record
                    </button>
                </div>
            </div>

            {/* Strategic Condition Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden glass rounded-[3rem] p-10 border border-primary/20"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                            Your Field Report Card
                        </div>
                        <h2 className="text-5xl font-black leading-tight text-foreground">
                            {stats.condition.replace('Excellent - High Yield Potential', 'Plants are Very Happy').replace('Steady - Minor Interventions Required', 'Growing Well - Just small fixes needed').replace('Critical - Immediate Action Needed', 'Emergency - Help your plants now')}
                        </h2>
                        <p className="text-lg text-muted font-medium max-w-2xl leading-relaxed">
                            We looked at all {reports.length} scans of your farm. {stats.avgHealth > 60 ? 'Your plants are strong and green.' : 'Some parts of your field are struggling.'}
                            Follow the {stats.topSolutions.length} steps on the right to grow a better crop.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-32 w-32 rounded-[2rem] bg-card border border-border flex flex-col items-center justify-center p-4">
                            <span className="text-3xl font-black text-primary">{stats.avgHealth.toFixed(0)}%</span>
                            <span className="text-[10px] font-bold text-muted uppercase">Health Score</span>
                        </div>
                        <div className="h-32 w-32 rounded-[2rem] bg-card border border-border flex flex-col items-center justify-center p-4">
                            <span className="text-3xl font-black text-accent">{stats.totalArea.toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-muted uppercase">Size Area</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Trend Analysis */}
                <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-border/50">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-primary" />
                                Your Growth Record
                            </h3>
                            <p className="text-sm text-muted">Is your field getting greener or dryer over time?</p>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-6 px-4 relative">
                        {/* Threshold Line */}
                        <div className="absolute left-0 right-0 top-1/2 border-t border-white/5 z-0" />

                        {reports.length === 0 ? (
                            <div className="w-full text-center text-muted font-bold">Awaiting historical data...</div>
                        ) : (
                            reports.map((report, i) => {
                                const val = report.ndvi?.stats?.mean || 0;
                                const heightPct = Math.min(Math.max((val / 1) * 100, 10), 100);

                                return (
                                    <div key={report._id} className="flex-1 group relative flex flex-col justify-end h-full z-10">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: i * 0.05 }}
                                            className={`rounded-t-2xl transition-all relative group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] ${val > 0.6 ? 'bg-primary' : val > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                        />
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[10px] font-black whitespace-nowrap bg-card border border-border px-2 py-1 rounded-lg">
                                                {formatDate(report.processedDate)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Tactical Solutions Panel */}
                <div className="glass rounded-[2.5rem] p-8 border border-border/50">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-accent">
                        <TrendingUp className="w-6 h-6" />
                        What to do today
                    </h3>
                    <div className="space-y-5">
                        {stats.topSolutions.map((sol, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-5 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-primary/10 hover:border-primary/30 transition-all"
                            >
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-muted uppercase tracking-tighter mb-1">Simple Step</p>
                                        <p className="text-sm font-bold text-foreground/90 leading-relaxed italic group-hover:text-foreground transition-colors">
                                            "{sol}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid for Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 glass rounded-[2.5rem] border border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-primary" />
                        <span className="font-black text-lg">Weak Spots</span>
                    </div>
                    <p className="text-4xl font-black">{stats.criticalZones}</p>
                    <p className="text-sm text-muted font-medium mt-2">Reports where plants were struggling</p>
                </div>

                <div className="p-8 glass rounded-[2.5rem] border border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Leaf className="w-6 h-6 text-green-400" />
                        <span className="font-black text-lg">Steady Field</span>
                    </div>
                    <p className="text-4xl font-black">{((1 - (stats.criticalZones / (reports.length || 1))) * 100).toFixed(0)}%</p>
                    <p className="text-sm text-muted font-medium mt-2">How much of your field is growing well</p>
                </div>

                <div className="p-8 glass rounded-[2.5rem] bg-primary group hover:bg-primary/90 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                        <span className="font-black text-black text-lg">Detailed Report</span>
                        <Download className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-black/60 text-sm font-bold mt-4 leading-tight">
                        Download the comprehensive seasonal intelligence summary.
                    </p>
                </div>
            </div>
        </div>
    );
}
