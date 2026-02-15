'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, MapPin, ArrowRight, Loader2, CheckCircle2, Phone } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        farmAddress: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const farmLocation = formData.farmAddress ? { address: formData.farmAddress } : undefined;
            await register(formData.name, formData.email, formData.password, formData.phoneNumber, farmLocation);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050511] py-8 px-4 sm:px-6 md:py-10">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-xl z-10"
            >
                <motion.div
                    className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative ring-1 ring-white/5"
                    whileHover={{ boxShadow: "0 20px 60px -10px rgba(34, 197, 94, 0.15)" }}
                >
                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-primary to-blue-500 opacity-70" />

                    <div className="p-6 sm:p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-6 md:mb-8">
                            <motion.div
                                initial={{ rotate: -10, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block mb-2 md:mb-4"
                            >
                                <div className="bg-gradient-to-tr from-primary to-purple-500 text-transparent bg-clip-text">
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Hyperspace</h1>
                                </div>
                            </motion.div>
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-white font-medium"
                            >
                                Initialize New Command Center
                            </motion.h2>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2"
                            >
                                Join the network of precision agriculture
                            </motion.p>
                        </div>

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

                        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Full Name</label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'name' ? 'text-primary' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Email</label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                            placeholder="pilot@hyperspace.ai"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Phone Number Field */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="space-y-1"
                            >
                                <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Phone Number</label>
                                <div className={`relative group transition-all duration-300 ${focusedField === 'phoneNumber' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'phoneNumber' ? 'text-primary' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        onFocus={() => setFocusedField('phoneNumber')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-1"
                            >
                                <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Farm Location (Optional)</label>
                                <div className={`relative group transition-all duration-300 ${focusedField === 'farmAddress' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MapPin className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'farmAddress' ? 'text-primary' : 'text-gray-500'}`} />
                                    </div>
                                    <input
                                        id="farmAddress"
                                        name="farmAddress"
                                        type="text"
                                        value={formData.farmAddress}
                                        onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                                        onFocus={() => setFocusedField('farmAddress')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                        placeholder="Sector 7, North Field District"
                                    />
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Password</label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                            placeholder="Min 6 chars"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[10px] md:text-xs font-medium text-gray-400 ml-1">Confirm Password</label>
                                    <div className={`relative group transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.01] md:scale-[1.02]' : ''}`}>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CheckCircle2 className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-gray-500'}`} />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            onFocus={() => setFocusedField('confirmPassword')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-black/40 border border-white/5 rounded-xl text-white text-xs md:text-sm placeholder-gray-600 focus:outline-none focus:border-primary/40 focus:bg-primary/5 focus:ring-1 focus:ring-primary/40 transition-all duration-300"
                                            placeholder="Repeat"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="pt-2 md:pt-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3.5 md:py-4 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-300 group disabled:opacity-50 text-sm md:text-base"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="tracking-wide">ESTABLISH UPLINK</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>
                    </div>

                    <div className="bg-black/40 p-4 md:p-5 text-center border-t border-white/5">
                        <p className="text-gray-400 text-xs md:text-sm">
                            Already have an uplink?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline decoration-primary underline-offset-4 transition-all">
                                Access Console
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
