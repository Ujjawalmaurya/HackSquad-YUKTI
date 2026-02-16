"use client";
import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, WifiOff } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { syncManager } from '@/utils/syncManager';
import { useAuth } from '@/contexts/AuthContext'; // Fixed import path
import { useRouter } from 'next/navigation';

interface Alert {
    _id: string;
    type: 'PEST' | 'WEED' | 'DISEASE' | 'VEGETATION' | 'GENERAL';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'NEW' | 'READ' | 'RESOLVED';
    createdAt: string;
}

export default function NotificationsPage() {
    const { t } = useLanguage();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, isLoading: authLoading } = useAuth();

    const syncAlertsFromReports = async (authToken: string) => {
        try {
            await fetch('http://localhost:5000/api/alerts/sync', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            console.log("Alerts synced from reports.");
        } catch (err) {
            console.error("Failed to sync alerts:", err);
        }
    };

    // Load cached alerts on mount
    useEffect(() => {
        const cached = localStorage.getItem('alerts_cache');
        if (cached) {
            setAlerts(JSON.parse(cached));
            setLoading(false);
        }
        if (token) fetchAlerts(token);
    }, [token]);

    const [isSyncReady, setIsSyncReady] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsSyncReady(true);
        const handleOffline = () => setIsSyncReady(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (navigator.onLine) setIsSyncReady(true);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = async () => {
        if (!token) return;
        setLoading(true);
        await syncAlertsFromReports(token);
        await fetchAlerts(token);
        setLoading(false);
        setIsSyncReady(false); // Reset readiness after sync
    };

    const fetchAlerts = async (authToken: string, quiet = false) => {
        try {
            const res = await fetch('http://localhost:5000/api/alerts', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
                localStorage.setItem('alerts_cache', JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            if (!quiet) setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        if (!token) return;

        // Optimistic UI update
        const originalAlerts = [...alerts];
        setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'READ' } : a));

        const result = await syncManager.queueAction(
            `http://localhost:5000/api/alerts/${id}/status`,
            'PATCH',
            { status: 'READ' },
            token
        );

        if (result.queued) {
            alert("Offline: Action queued and will sync when online.");
        } else if (!result.success) {
            // Revert if failed and not queued (shouldn't happen with syncManager logic usually)
            setAlerts(originalAlerts);
        }
    };

    const getIcon = (type: string, severity: string) => {
        if (type === 'DISEASE' || severity === 'CRITICAL') return <AlertTriangle className="w-5 h-5" />;
        if (severity === 'HIGH') return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        if (type === 'VEGETATION') return <Info className="w-5 h-5" />;
        return <Bell className="w-5 h-5" />;
    };

    const getColorClass = (type: string, severity: string) => {
        if (severity === 'CRITICAL') return 'bg-red-500/10 border-red-500/20 text-red-500';
        if (severity === 'HIGH') return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
        if (type === 'VEGETATION') return 'bg-green-500/10 border-green-500/20 text-green-500';
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{t('notifications') || 'Notifications'}</h1>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-500 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Live
                        </span>
                    </div>
                    <p className="text-foreground/60 text-sm">Real-time farm alerts and system status.</p>
                </div>
                {!navigator.onLine && <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full text-xs font-medium"><WifiOff size={14} /> Offline Mode</div>}

                {isSyncReady && navigator.onLine && (
                    <button
                        onClick={handleSync}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors animate-pulse"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        Sync Ready - Click to Update
                    </button>
                )}
            </div>

            <div className="glass rounded-3xl border border-border/50 overflow-hidden min-h-[50vh]">
                {loading ? (
                    <div className="p-8 text-center text-foreground/40">Loading alerts...</div>
                ) : alerts.length === 0 ? (
                    <div className="p-8 text-center text-foreground/40">No new alerts.</div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {alerts.map((alert) => (
                            <div key={alert._id} className={`p-6 hover:bg-primary/5 transition-colors flex gap-4 ${alert.status === 'READ' ? 'opacity-60' : ''}`}>
                                <div className={`p-3 rounded-2xl h-fit border ${getColorClass(alert.type, alert.severity)}`}>
                                    {getIcon(alert.type, alert.severity)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold">{alert.title}</h3>
                                            {alert.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                        </div>
                                        <span className="text-xs text-foreground/40">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/60 mb-3">{alert.description}</p>

                                    {alert.status !== 'READ' && (
                                        <button
                                            onClick={() => handleMarkAsRead(alert._id)}
                                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
