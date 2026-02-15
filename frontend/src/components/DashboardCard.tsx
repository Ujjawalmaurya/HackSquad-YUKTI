"use client";
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    value: string;
    subtext: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isUp: boolean;
    };
}

export default function DashboardCard({ title, value, subtext, icon: Icon, trend }: DashboardCardProps) {
    return (
        <div className="glass p-6 rounded-2xl border border-border/50 card-hover">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isUp ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <h3 className="text-foreground/60 text-sm font-medium">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-foreground/40 text-xs">{subtext}</span>
            </div>
        </div>
    );
}
