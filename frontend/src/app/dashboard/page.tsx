"use client";
import React, { useEffect, useState } from 'react';
import {
    Activity,
    Droplets,
    CloudSun,
    Zap,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    Target,
    Loader2,
    ExternalLink,
    LocateFixed
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardCard from '@/components/DashboardCard';
import { useLanguage } from '@/hooks/useLanguage';
import { fetchStats, fetchVegetationReports } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
    const { t } = useLanguage();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]); // Added reports state
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

    useEffect(() => {
        const loadData = async () => { // Renamed loadStats to loadData
            try {
                // Fetch real vegetation reports
                const reportsData = await fetchVegetationReports();
                setReports(reportsData);

                // Calculate aggregate stats from real data
                if (reportsData.length > 0) {
                    const totalNdvi = reportsData.reduce((acc: number, curr: any) => acc + (curr.ndvi?.stats?.mean || 0), 0);
                    const avgNdvi = (totalNdvi / reportsData.length).toFixed(2);

                    const criticalCount = reportsData.filter((r: any) => r.aiInsights?.healthScore < 50).length;

                    setStats({
                        avgNDVI: avgNdvi,
                        totalArea: (reportsData.length * 12.5).toFixed(1), // Mock area per report for now
                        activeAlerts: criticalCount
                    });
                } else {
                    setStats({
                        avgNDVI: "0.00",
                        totalArea: "0.0",
                        activeAlerts: 0
                    });
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Using open-meteo.com - free weather API without API key required
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=26.4621&longitude=82.1342&current_weather=true'
                );
                const data = await response.json();
                if (data.current_weather) {
                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        description: getWeatherDescription(data.current_weather.weathercode)
                    });
                }
            } catch (error) {
                console.error('Failed to fetch weather:', error);
                setWeather({ temp: 28, description: 'Clear Sky' }); // Fallback
            }
        };
        fetchWeather();
    }, []);

    const getWeatherDescription = (code: number): string => {
        const weatherCodes: { [key: number]: string } = {
            0: 'Clear Sky',
            1: 'Mainly Clear',
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light Drizzle',
            53: 'Drizzle',
            55: 'Heavy Drizzle',
            61: 'Light Rain',
            63: 'Rain',
            65: 'Heavy Rain',
            71: 'Light Snow',
            73: 'Snow',
            75: 'Heavy Snow',
            80: 'Rain Showers',
            95: 'Thunderstorm'
        };
        return weatherCodes[code] || 'Unknown';
    };

    const handleExport = () => {
        const data = `Metric,Value\nAvg NDVI,${stats?.avgNDVI}\nTotal Reports,${reports.length}\nAlerts,${stats?.activeAlerts}\nDate,${new Date().toLocaleDateString()}`;
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hyperspace-report-${new Date().getTime()}.csv`;
        a.click();
        alert(t('exportSuccess'));
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                    />
                    <p className="text-primary font-bold animate-pulse">Syncing Satellite Data...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8 pb-12"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <motion.div variants={itemVariants} className="text-foreground">
                        <h1 className="text-4xl font-black tracking-tight">{t('overview')}</h1>
                        <p className="text-muted font-medium">Real-time Vegetation Intelligence</p>
                    </motion.div>
                    <div className="flex gap-3">
                        <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 border border-border/50 text-foreground">
                            <CloudSun className="w-5 h-5 text-accent" />
                            <span className="font-medium">
                                {weather ? `${weather.temp}°C / ${weather.description}` : 'Loading...'}
                            </span>
                        </div>
                        <button
                            onClick={handleExport}
                            className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-6 rounded-xl transition-all border border-primary/20"
                        >
                            {t('export')}
                        </button>
                    </div>
                </div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
                    <DashboardCard
                        title="Avg. NDVI Index"
                        value={stats?.avgNDVI || "0.00"}
                        subtext={parseFloat(stats?.avgNDVI || "0") > 0.5 ? t('optimal') : t('moderate')}
                        icon={Activity}
                        trend={{ value: "+2.1%", isUp: true }}
                    />
                    <DashboardCard
                        title="Analyzed Files"
                        value={reports.length.toString()}
                        subtext="Total Scans"
                        icon={Droplets}
                        trend={{ value: "+5", isUp: true }}
                    />
                    <DashboardCard
                        title="Est. Coverage"
                        value={stats?.totalArea ? `${stats.totalArea} ha` : "0 ha"}
                        subtext="Total Area"
                        icon={TrendingUp}
                        trend={{ value: "+12%", isUp: true }}
                    />
                    <DashboardCard
                        title="Critical Zones"
                        value={stats?.activeAlerts > 0 ? "High Risk" : "Stable"}
                        subtext={`${stats?.activeAlerts || 0} alerts`}
                        icon={Zap}
                    />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
                    <motion.div variants={itemVariants} className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-border/50 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <Target className="w-8 h-8 text-primary" />
                                {t('zonalAnalysis')}
                            </h2>
                            <button
                                onClick={() => router.push('/maps')}
                                className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
                            >
                                Open Full Map
                            </button>
                        </div>

                        {/* Recent Reports List */}
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {reports.length === 0 ? (
                                <div className="text-center py-10 opacity-50">No analysis data available yet. Upload a file to begin.</div>
                            ) : (
                                reports.map((report) => (
                                    <div key={report._id} className="glass p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group/item cursor-pointer" onClick={() => router.push(`/maps?report=${report._id}`)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${(report.aiInsights?.healthScore || 0) > 75 ? 'bg-green-500/20 text-green-400' :
                                                    (report.aiInsights?.healthScore || 0) > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {report.aiInsights?.healthScore || 0}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{report.originalFile}</h4>
                                                    <div className="flex gap-2 text-xs text-muted font-mono mt-1">
                                                        <span>NDVI: {report.ndvi?.stats?.mean?.toFixed(2)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(report.processedDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all text-primary" />
                                        </div>
                                        <p className="mt-3 text-sm text-foreground/80 line-clamp-2">
                                            {report.aiInsights?.summary || "No summary available."}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-border/50">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-accent" />
                                Recent Insights
                            </h2>
                            <div className="space-y-4">
                                {reports.slice(0, 3).flatMap(r => r.aiInsights?.recommendations?.slice(0, 1) || []).map((rec: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 5 }}
                                        className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl cursor-pointer"
                                    >
                                        <p className="text-sm font-black text-orange-400 uppercase tracking-wider">Recommendation</p>
                                        <p className="text-xs text-muted mt-1 font-medium leading-relaxed">{rec}</p>
                                    </motion.div>
                                ))}
                                {reports.length === 0 && <p className="text-muted text-sm text-center">No insights yet.</p>}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-border/50">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-primary" />
                                {t('smartActions')}
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { label: "New Analysis", icon: Target, action: () => router.push('/vegetation') },
                                    { label: "View Full Maps", icon: LocateFixed, action: () => router.push('/maps') }
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-primary hover:text-black transition-all border border-white/5 group font-bold"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ProtectedRoute>
    );
}
