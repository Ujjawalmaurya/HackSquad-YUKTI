'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050511] px-4 sm:px-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg z-10"
            >
                <motion.div
                    className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative ring-1 ring-white/5"
                    whileHover={{ boxShadow: "0 20px 60px -10px rgba(34, 197, 94, 0.15)" }}
                >
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                    <div className="p-6 sm:p-8 md:p-12">
                        {/* Header */}
                        <div className="text-center mb-8 md:mb-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center justify-center mb-4 md:mb-6"
                            >
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-primary/20 transform rotate-3 hover:rotate-6 transition-transform">
                                    <span className="text-2xl md:text-3xl">🚀</span>
                                </div>
                            </motion.div>
                            <motion.h1
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight"
                            >
                                Welcome Back
                            </motion.h1>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm md:text-base text-blue-200/60"
                            >
                                Enter the Hyperspace to manage your farm
                            </motion.p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-1.5 md:space-y-2"
                            >
                                <label className="text-xs md:text-sm font-medium text-blue-200/60 ml-1">Email Address</label>
                                <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300 text-sm md:text-base"
                                        placeholder="pilot@hyperspace.ai"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-1.5 md:space-y-2"
                            >
                                <label className="text-xs md:text-sm font-medium text-blue-200/60 ml-1">Password</label>
                                <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-11 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300 text-sm md:text-base"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="flex items-center justify-between text-xs md:text-sm"
                            >
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded bg-white/5 border-white/10 checked:bg-primary accent-primary transition-colors cursor-pointer" />
                                    <span className="text-gray-500 group-hover:text-gray-300 transition-colors">Remember me</span>
                                </label>
                                <Link href="#" className="text-primary hover:text-primary/80 transition-colors">Forgot Password?</Link>
                            </motion.div>

                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-emerald-600 text-black font-black py-3.5 md:py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="tracking-wide">INITIATE LAUNCH</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>

                        </form>
                    </div>

                    <div className="bg-black/40 p-4 md:p-6 text-center border-t border-white/5">
                        <p className="text-gray-500 text-xs md:text-sm">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-primary font-bold hover:underline decoration-primary underline-offset-4 transition-all">
                                Join the Fleet
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
