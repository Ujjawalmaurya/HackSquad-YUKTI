"use client";
import React, { useEffect, useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    Plus,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Download
} from 'lucide-react';
import { fetchReports } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReportsPage() {
    const { t } = useLanguage();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchReports();
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Field Insights Repository</h1>
                    <p className="text-foreground/60 text-sm">Accessing hyperspace metadata from Cluster0</p>
                </div>
                <div className="flex gap-2 text-xs text-foreground/40 italic">
                    {mounted ? `${t('lastUpdated')}: ${new Date().toLocaleDateString()}` : '...'}
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center border border-border/50">
                    <FileText className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                    <p className="text-foreground/60 font-medium">No reports found in the hyperspace collection.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {reports.map((report, idx) => (
                        <div key={report._id || idx} className="glass rounded-3xl overflow-hidden border border-border/50 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="p-6 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold">Report #{idx + 1}</h2>
                                        <p className="text-xs text-foreground/60">
                                            {mounted ? new Date(report.createdAt).toLocaleString() : '...'}
                                        </p>
                                    </div>
                                </div>
                                {report.mlResults && (
                                    <div className="flex gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-tighter text-foreground/40 font-bold">Confidence</p>
                                            <p className="text-sm font-bold text-primary">{(report.mlResults.confidence * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 prose prose-invert max-w-none">
                                <div className="markdown-container">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {report.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            {report.images && report.images.length > 0 && (
                                <div className="p-6 bg-muted/30 border-t border-border/50">
                                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">Referenced Analysis</p>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {report.images.map((img: string, i: number) => (
                                            <div key={i} className="relative min-w-[200px] h-32 rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                                                <img
                                                    src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                                    alt="Analysis View"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


