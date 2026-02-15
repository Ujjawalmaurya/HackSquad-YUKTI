"use client";
import React from 'react';
import { Users, Mail, Phone, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function TeamPage() {
    const { t } = useLanguage();

    const team = [
        { name: "Rajesh Kumar", role: "Owner / Farm Manager", email: "rajesh@farm.com", phone: "+91 98765 43210", access: "Admin" },
        { name: "Anil Sharma", role: "Agronomist", email: "anil@farm.com", phone: "+91 98765 43211", access: "Editor" },
        { name: "Sunita Devi", role: "Drone Operator", email: "sunita@farm.com", phone: "+91 98765 43212", access: "Viewer" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">{t('team')}</h1>
                <p className="text-foreground/60 text-sm">Manage farm staff and access permissions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                    <div key={member.email} className="glass p-6 rounded-3xl border border-border/50 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold">{member.name}</h3>
                                <p className="text-xs text-foreground/60">{member.role}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6 text-sm">
                            <div className="flex items-center gap-2 text-foreground/70">
                                <Mail className="w-4 h-4" />
                                {member.email}
                            </div>
                            <div className="flex items-center gap-2 text-foreground/70">
                                <Phone className="w-4 h-4" />
                                {member.phone}
                            </div>
                            <div className="flex items-center gap-2 text-foreground/70">
                                <Shield className="w-4 h-4" />
                                Access: <span className="text-primary font-bold">{member.access}</span>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all text-sm font-medium">
                            Edit Permissions
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div >
    );
}
