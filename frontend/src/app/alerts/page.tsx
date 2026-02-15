"use client";
import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationsPage() {
    const { t } = useLanguage();

    const notifications = [
        { id: 1, type: 'critical', title: 'Pest Alert - Sector A2', time: '2 mins ago', desc: 'Drone detected high aphid activity in North Field.' },
        { id: 2, type: 'warning', title: 'Moisture Low - Zone B4', time: '1 hour ago', desc: 'Soil moisture dropped below 30% in Zone B4.' },
        { id: 3, type: 'info', title: 'Flight Scheduled', time: '5 hours ago', desc: 'Weekly health audit drone flight scheduled for tomorrow 06:00.' },
        { id: 4, type: 'success', title: 'Analysis Complete', time: '12 hours ago', desc: 'Pre-harvest yield analysis for South Sector 4 is now available.' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">{t('notifications')}</h1>
                <p className="text-foreground/60 text-sm">Stay updated with real-time farm alerts and drone system status.</p>
            </div>

            <div className="glass rounded-3xl border border-border/50 overflow-hidden">
                <div className="divide-y divide-border/50">
                    {notifications.map((n) => (
                        <div key={n.id} className="p-6 hover:bg-primary/5 transition-colors flex gap-4">
                            <div className={`p-3 rounded-2xl h-fit border ${n.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    n.type === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                        n.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' :
                                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                {n.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> :
                                    n.type === 'warning' ? <Clock className="w-5 h-5" /> :
                                        n.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                            <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold">{n.title}</h3>
                                    <span className="text-xs text-foreground/40">{n.time}</span>
                                </div>
                                <p className="text-sm text-foreground/60">{n.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 text-center border-t border-border/50">
                    <button className="text-sm font-bold text-primary hover:underline">Mark all as read</button>
                </div>
            </div>
        </div>
    );
}
