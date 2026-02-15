'use client';
import React from 'react';
import {
    LayoutDashboard,
    Map,
    Settings,
    History,
    Bell,
    Users,
    LineChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const { t, lang } = useLanguage();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
        { icon: Map, label: t('maps'), href: '/maps' },
        { icon: LineChart, label: t('analytics'), href: '/analytics' },
        { icon: History, label: t('reports'), href: '/reports' },
        // { icon: Users, label: t('team'), href: '/team' },
        { icon: Bell, label: t('notifications'), href: '/alerts' },
        { icon: Settings, label: t('settings'), href: '/settings' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    // Hide sidebar on homepage, login, and signup pages
    if (pathname === '/' || pathname === '/login' || pathname === '/signup') return null;

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-72 hidden lg:block z-40">
            {/* Main Background with blurred gradient */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] bg-gradient-to-b from-black/90 via-[#0a0a0f]/90 to-black/90" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 space-y-4 mt-8 px-4"
            >
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <motion.div key={item.href} variants={itemVariants}>
                            <Link
                                href={item.href}
                                className={`relative flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 group overflow-hidden border ${isActive
                                    ? 'border-primary/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                                    : 'border-transparent hover:border-white/20 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav-bg"
                                        className="absolute inset-0 bg-primary z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        {/* Subtle pattern overlay on active item for texture */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center bg-cover" />
                                    </motion.div>
                                )}

                                <item.icon
                                    className={`w-7 h-7 relative z-10 transition-transform duration-300 ${isActive
                                        ? 'text-white scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
                                        : 'text-gray-400 group-hover:text-white group-hover:scale-110'
                                        }`}
                                />
                                <span className={`relative z-10 text-base drop-shadow-sm transition-all duration-300 ${
                                    // Condition: Only apply aggressive typography for English
                                    // Hindi (and others) get standard typography to avoid rendering issues
                                    lang === 'en'
                                        ? 'font-black tracking-widest uppercase'
                                        : 'font-bold tracking-normal'
                                    } ${isActive
                                        ? 'text-white'
                                        : 'text-gray-400 group-hover:text-white'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Bar (Left Side) - Balanced */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white z-20 shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                                )}

                                {/* Active Indicator Glow (Right Side) - Balancing effect */}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 blur-md rounded-full" />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </aside>
    );
}
