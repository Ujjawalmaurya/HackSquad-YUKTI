"use client";
import React, { useState, useEffect } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Globe,
    HardDrive,
    Smartphone,
    Cloud,
    Save,
    Drone,
    CheckCircle,
    Info,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const { t, lang, setLang } = useLanguage();
    const { user, token, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        farmLocation: '',
        phoneNumber: ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                farmLocation: user.farmLocation?.address || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleProfileSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profileData.name,
                    email: profileData.email,
                    phoneNumber: profileData.phoneNumber,
                    farmLocation: { address: profileData.farmLocation }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update profile');

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            if (data.user) {
                updateUser(data.user);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setMessage({ type: 'error', text: 'Please fill in all password fields' });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to change password');

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', icon: User, label: "Profile" },
        { id: 'notifications', icon: Bell, label: "Notifications" },
        { id: 'security', icon: Shield, label: "Security" },
        { id: 'language', icon: Globe, label: "Language" },
        { id: 'api', icon: HardDrive, label: "Integrations" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Email Address</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Farm Location</label>
                                <input
                                    type="text"
                                    value={profileData.farmLocation}
                                    onChange={(e) => setProfileData({ ...profileData, farmLocation: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Phone Number</label>
                                <input
                                    type="text"
                                    value={profileData.phoneNumber}
                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {[
                            { label: "Pest Alerts", desc: "Get notified when anomalies are detected.", active: true },
                            { label: "Drone Status", desc: "Receive updates on flight health and battery.", active: true },
                            { label: "Weekly Reports", desc: "Summary of field health sent every Sunday.", active: false },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-4 glass rounded-2xl border border-border/50">
                                <div>
                                    <p className="font-bold text-foreground">{item.label}</p>
                                    <p className="text-xs text-foreground/60">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-primary' : 'bg-muted'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">Old Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground/70">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Min 6 characters"
                                    className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 px-4 focus:border-primary/50 outline-none text-foreground"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            {/* Button is handled in main layout now, or specific save button here? 
                                 The design has a main save button at top right. 
                                 We need to make sure that button triggers the correct function.
                                 Since the button is outside the switch, we need a common handler or conditionally render the button.
                              */}
                        </div>
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3">
                            <Shield className="w-5 h-5 text-orange-400 shrink-0" />
                            <p className="text-xs text-orange-200/80">Two-factor authentication is recommended to protect your farm data.</p>
                        </div>
                    </div>
                );
            case 'language':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setLang('en')}
                                className={`p-6 rounded-2xl border-2 transition-all text-center ${lang === 'en' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                            >
                                <span className="text-3xl mb-2 block">🇺🇸</span>
                                <p className="font-bold text-foreground">English</p>
                            </button>
                            <button
                                onClick={() => setLang('hi')}
                                className={`p-6 rounded-2xl border-2 transition-all text-center ${lang === 'hi' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}
                            >
                                <span className="text-3xl mb-2 block">🇮🇳</span>
                                <p className="font-bold text-foreground">हिंदी (Hindi)</p>
                            </button>
                        </div>
                    </div>
                );
            case 'api':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-foreground">
                        <div className="space-y-4">
                            <div className="p-4 glass rounded-2xl border border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Drone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">DJI Mavic 3M Connection</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-xs text-green-400">Live Connection Active</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="text-xs font-bold text-primary hover:underline">Calibrate</button>
                                    <button className="text-xs font-bold text-red-400 hover:underline">Disconnect</button>
                                </div>
                            </div>
                            <div className="p-4 glass rounded-2xl border border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Cloud className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Sentinal-2 Hub</p>
                                        <p className="text-xs text-foreground/40">Satellite Data Feed</p>
                                    </div>
                                </div>
                                <button className="px-4 py-1 bg-primary text-black text-xs font-bold rounded-lg transition-transform hover:scale-105">Connect</button>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 space-y-3">
                            <div className="flex items-center gap-2 text-primary">
                                <Info className="w-4 h-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">Hardware Calibration</p>
                            </div>
                            <p className="text-xs text-foreground/60 leading-relaxed">
                                Ensure your drone's multispectral sensors are calibrated before every flight for accurate NDVI readings.
                                Last successful sync: Today at 09:14 AM.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSave = () => {
        if (activeTab === 'profile') {
            handleProfileSave();
        } else if (activeTab === 'security') {
            handlePasswordSave();
        }
    };

    const isSaveDisabled = () => {
        if (activeTab === 'security') {
            return !passwordData.currentPassword || !passwordData.newPassword || isLoading;
        }
        return isLoading;
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>
                <p className="text-foreground/60 text-sm">Manage your account and drone hardware configurations.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 ${activeTab === tab.id
                                ? 'bg-primary/10 border-primary text-primary font-black shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-[1.02]'
                                : 'text-foreground/60 border-transparent hover:bg-muted font-bold hover:text-foreground'
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 glass p-8 rounded-3xl border border-border/50 relative">
                    <div className="mb-8 flex justify-between items-center">
                        <h2 className="text-xl font-bold capitalize text-foreground">{activeTab} Settings</h2>
                        {(activeTab === 'profile' || activeTab === 'security') && (
                            <button
                                onClick={handleSave}
                                disabled={isSaveDisabled()}
                                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        )}
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

