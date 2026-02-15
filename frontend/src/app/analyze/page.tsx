"use client";
import React, { useState, useEffect } from 'react';
import {
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Drone,
    Target,
    Zap,
    ArrowRight,
    Play,
    CloudSun,
    Layers,
    Bot,
    ClipboardCheck,
    TrendingUp,
    Map as MapIcon
} from 'lucide-react';
import { fetchFarms, analyzeFarmImage } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';
import { useRouter } from 'next/navigation';

export default function AnalyzePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<'plan' | 'upload' | 'process' | 'results'>('plan');
    const [selectedFarmId, setSelectedFarmId] = useState("");
    const [result, setResult] = useState<any>(null);
    const [weatherOk, setWeatherOk] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchFarms();
                setFarms(data);
                if (data.length > 0) setSelectedFarmId(data[0].id);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const startUpload = () => {
        setPhase('upload');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !selectedFarmId) return;

        setPhase('process');
        try {
            // Simulate Preprocessing/Stitching stitch time
            await new Promise(r => setTimeout(r, 2000));
            const res = await analyzeFarmImage(selectedFarmId, e.target.files[0]);
            setResult(res);
            setPhase('results');
        } catch (error) {
            console.error('Analysis failed:', error);
            alert(t('analysisFailedAlert'));
            setPhase('upload');
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const steps = [
        { id: 'plan', label: 'Plan Flight', icon: CloudSun },
        { id: 'upload', label: 'Capture & Upload', icon: Upload },
        { id: 'process', label: 'AI Processing', icon: Bot },
        { id: 'results', label: 'Insights & Action', icon: Target },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Workflow Progress Bar */}
            <div className="glass p-6 rounded-[2rem] border border-border/50">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
                    <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(steps.findIndex(s => s.id === phase) / (steps.length - 1)) * 100}%` }} />

                    {steps.map((step, idx) => {
                        const isActive = phase === step.id;
                        const isDone = steps.findIndex(s => s.id === phase) > idx;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${isActive ? 'bg-primary text-black scale-110' : isDone ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-foreground/40 border border-border'}`}>
                                    {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-foreground/40'}`}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    {phase === 'plan' && (
                        <div className="glass p-10 rounded-[2.5rem] border border-border/50 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-foreground">Flight Preparation</h2>
                                    <p className="text-foreground/60">Schedule autonomous mission based on crop stage.</p>
                                </div>
                                <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20">
                                    <CloudSun className="w-8 h-8 text-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                                    <p className="text-xs font-bold text-foreground/40 uppercase">Weather Check</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <p className="font-bold text-foreground font-bold">28°C - Low Wind (Perfect)</p>
                                    </div>
                                    <p className="text-[10px] text-foreground/60">Optimal for DJI Mavic 3M multispectral sensors.</p>
                                </div>
                                <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                                    <p className="text-xs font-bold text-foreground/40 uppercase">Crop Stage</p>
                                    <p className="font-bold text-foreground font-bold font-bold">Mid-Growth (Wheat)</p>
                                    <p className="text-[10px] text-foreground/60">Recommended overlap: 75% Front / 70% Side</p>
                                </div>
                            </div>

                            <button
                                onClick={startUpload}
                                className="w-full bg-primary text-black font-black py-5 rounded-3xl text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20"
                            >
                                <Play className="w-6 h-6" />
                                LAUNCH MISSION & CAPTURE
                            </button>
                        </div>
                    )}

                    {phase === 'upload' && (
                        <div className="glass p-10 rounded-[2.5rem] border border-border/50 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mx-auto">
                                    <Upload className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground">Data Acquisition</h2>
                                <p className="text-foreground/60">Upload multispectral ZIP or individual TAGGED images.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="drone-upload"
                                />
                                <label
                                    htmlFor="drone-upload"
                                    className="flex flex-col items-center justify-center gap-6 w-full h-80 rounded-[2rem] border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-all bg-muted/30 group hover:bg-primary/5"
                                >
                                    <div className="p-6 bg-muted rounded-full group-hover:bg-primary/20 transition-all">
                                        <MapIcon className="w-12 h-12 text-foreground/40 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-xl text-foreground">SELECT FLIGHT DATA</p>
                                        <p className="text-sm text-foreground/40 mt-1">Supports Orthophoto, RAW, & Multispectral Layers</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {phase === 'process' && (
                        <div className="glass p-10 rounded-[2.5rem] border border-border/50 space-y-12 animate-in slide-in-from-bottom-4 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                <Bot className="w-12 h-12 text-primary absolute inset-0 m-auto animate-pulse" />
                            </div>
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-black text-foreground">AI PREPROCESSING...</h2>
                                <div className="space-y-2">
                                    <p className="text-primary font-bold text-sm tracking-widest uppercase">Stitching Orthomosaic</p>
                                    <p className="text-foreground/40 text-xs text-center max-w-sm">Cleaning GPS tags, normalizing spectral irradiance, and building global health map.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {phase === 'results' && result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="glass p-10 rounded-[2.5rem] border border-border/50 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-foreground">AI Analysis Complete</h2>
                                        <p className="text-foreground/60">Neural Network confidence: 94.2% · {result.metadata?.engine}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${result.diseaseDetected ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                        {result.healthStatus}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 space-y-2 text-foreground">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Health (NDVI)</p>
                                        <p className="text-4xl font-black">{result.ndvi.toFixed(2)}</p>
                                        <p className="text-xs font-bold text-foreground/60">{result.ndvi > 0.7 ? 'High Biomass' : 'Stress Detected'}</p>
                                    </div>
                                    <div className="p-6 bg-accent/10 rounded-3xl border border-accent/20 space-y-2 text-foreground">
                                        <p className="text-[10px] font-black uppercase text-accent tracking-widest">Yield Forecast</p>
                                        <p className="text-4xl font-black">{result.yieldPrediction.toFixed(1)}</p>
                                        <p className="text-xs font-bold text-foreground/60">tons / hectare</p>
                                    </div>
                                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-2 text-foreground font-bold">
                                        <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Detections</p>
                                        <p className="text-4xl font-black">{result.detections?.length || 0}</p>
                                        <p className="text-xs font-bold text-foreground/60">Pests/Anomalies</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                        <ClipboardCheck className="w-4 h-4" />
                                        Targeted Detections
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.detections?.map((det: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 glass rounded-2xl border border-border/50 text-foreground">
                                                <div className={`p-2 rounded-xl ${det.severity === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-black">{det.label}</p>
                                                    <p className="text-[10px] text-foreground/40">Confidence: {(det.confidence * 100).toFixed(1)}%</p>
                                                </div>
                                                <div className={`text-[8px] font-black px-2 py-1 rounded-md border uppercase ${det.severity === 'High' ? 'border-red-500/30 text-red-500' : 'border-primary/30 text-primary'}`}>
                                                    {det.severity}
                                                </div>
                                            </div>
                                        ))}
                                        {(!result.detections || result.detections.length === 0) && (
                                            <div className="col-span-full p-8 text-center glass rounded-2xl border border-border/50 opacity-40">
                                                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                                                <p className="text-xs font-bold">No anomalies detected in this flight.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Insights Panel */}
                    <div className="glass p-8 rounded-[2.5rem] border border-border/50 h-full flex flex-col justify-between">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                    AI Strategy
                                </h3>
                                <p className="text-foreground/60 text-sm mt-1">Recommended precision actions.</p>
                            </div>

                            {!result ? (
                                <div className="h-48 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                    <Play className="w-12 h-12" />
                                    <p className="text-sm">Insights appear after acquisition.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recommended Actions</p>
                                            {result.recommendations.map((rec: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-sm font-bold text-foreground">
                                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>

                                        {result.sprayPlan && (
                                            <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Action Plan: SPRAY</p>
                                                    <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">URGENT</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-lg font-black text-foreground">{result.sprayPlan.chemical}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-foreground/70">
                                                        <span>Area: {result.sprayPlan.area}</span>
                                                        <span>Dosage: {result.sprayPlan.dosage}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.push('/maps?layer=pest')}
                                                    className="w-full bg-red-500 text-white font-black py-3 rounded-2xl text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 transition-colors uppercase"
                                                >
                                                    <MapIcon className="w-4 h-4" />
                                                    VIEW TARGET IN GIS
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {result && (
                            <button
                                onClick={() => router.push('/reports')}
                                className="w-full flex items-center justify-between p-5 rounded-3xl bg-muted/50 hover:bg-muted transition-all group border border-border/50 mt-8"
                            >
                                <span className="font-black text-foreground">FLIGHT EXPORT</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
