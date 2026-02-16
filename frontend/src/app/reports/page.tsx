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
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setAnalyzing(true);
        setUploadError(null);

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        try {
            // Get token from localStorage as per typical auth flow in this app (checking other files might confirm, but this is safe assumption or I can check api.ts)
            // Actually, better to use the api helper if possible, but for file upload often fetch/axios with specific headers is needed.
            // Let's assume there's a token in custom storage or we can use a direct fetch with auth header if we know how to get it.
            // Looking at `api.ts` (implied existence) might help, but let's try standard local storage token first or just use the existing api pattern if I can find it.
            // Wait, I don't have access to `api.ts` content right now. 
            // I'll assume standard Bearer token from localStorage 'token' or similar. 
            // NOTE: The previous backend check showed `authenticateToken` middleware.

            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/analysis/analyze-v2', {
                method: 'POST',
                headers: headers,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            // Refresh reports
            await loadData();

        } catch (error: any) {
            console.error('Analysis error:', error);
            setUploadError(error.message || 'Failed to analyze images');
        } finally {
            setAnalyzing(false);
            // Reset input
            event.target.value = '';
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
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={analyzing}
                            id="image-upload"
                        />
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${analyzing ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-primary-foreground font-medium shadow-lg shadow-primary/20`}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    New Analysis
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-2 text-xs text-foreground/40 italic">
                        {mounted ? `${t('lastUpdated')}: ${new Date().toLocaleDateString()}` : '...'}
                    </div>
                </div>
            </div>

            {uploadError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{uploadError}</span>
                </div>
            )}

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
                                        <h2 className="text-lg font-bold">Report #{reports.length - idx}</h2>
                                        <p className="text-xs text-foreground/60">
                                            {mounted ? new Date(report.createdAt).toLocaleString() : '...'}
                                        </p>
                                    </div>
                                </div>
                                {report.mlResults && (
                                    <div className="flex gap-4">
                                        {/* Display aggregated stats if available or just confidence */}
                                        {/* 
                                            We could show more stats here if the ML Service provided summary stats 
                                            in the top level response. For now, let's keep it simple or calculate if needed.
                                         */}
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-tighter text-foreground/40 font-bold">Analyze ID</p>
                                            <p className="text-sm font-bold text-primary">{report.mlResults.batch_id?.substring(0, 8) || 'N/A'}</p>
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


