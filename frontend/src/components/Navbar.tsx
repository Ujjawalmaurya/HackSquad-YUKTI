"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sprout, Search, Languages, LogOut, User } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { lang, setLang, t } = useLanguage();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLaunch = () => {
        router.push('/analyze');
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Don't show navbar on login/signup pages
    if (pathname === '/login' || pathname === '/signup') {
        return null;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Sprout className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold gradient-text underline-offset-4 decoration-primary">Sky Scouts</span>
                    </Link>

                    {pathname !== '/' && user && (
                        <div className="hidden md:block">
                            <div className="flex items-baseline space-x-8">
                                <Link href="/dashboard" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t('dashboard')}</Link>
                                <Link href="/maps" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t('maps')}</Link>
                                <Link href="/analytics" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t('analytics')}</Link>
                                <Link href="/reports" className="text-foreground/80 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">{t('reports')}</Link>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                            className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg text-sm font-bold hover:text-primary transition-colors border border-border/50 bg-background/50"
                        >
                            <Languages className="w-4 h-4" />
                            {lang === 'en' ? '🇮🇳 हिंदी' : '🇺🇸 EN'}
                        </button>

                        {pathname === '/' ? (
                            user ? (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Dashboard
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="glass border border-primary/50 text-primary font-bold py-2 px-4 rounded-xl transition-all hover:bg-primary/10 active:scale-95"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => router.push('/signup')}
                                        className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )
                        ) : (
                            <>
                                <ThemeToggle />
                                {user && (
                                    <>
                                        <button className="p-2 text-foreground/70 hover:text-primary transition-colors">
                                            <Search className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleLaunch}
                                            className="bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                                        >
                                            {t('launchDrone')}
                                        </button>
                                        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border border-border/50">
                                            <User className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">{user.name}</span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="p-2 text-foreground/70 hover:text-red-500 transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
