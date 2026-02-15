"use client";
import React from 'react';
import { ArrowRight, CheckCircle, Zap, Droplets, Activity, Map, Cpu, AlertTriangle, Play, Shield, Globe, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-25 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 relative z-10 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          >
            <Zap className="w-4 h-4 fill-primary" />
            <span className="text-sm font-bold tracking-wider uppercase">Future of Agriculture</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]"
          >
            SKY SCOUTS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-accent animate-gradient">
              & AI BRAINS
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Stop farming blind. We use drones as <span className="text-primary font-bold">"eyes"</span> and AI as the <span className="text-primary font-bold">"brain"</span> to detect plant stress weeks before it's visible.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={() => router.push('/login')}
              className="group relative px-10 py-5 bg-primary text-black rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_rgba(34,197,94,0.3)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="relative flex items-center gap-3">
                LAUNCH MISSION <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-all duration-300 active:scale-95">
              VIEW CASE STUDY
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Drone Illustration (Simplified CSS Shape) */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-32 h-32 hidden lg:flex items-center justify-center pointer-events-none opacity-40 blur-sm"
        >
          <div className="w-16 h-4 bg-primary rounded-full relative">
            <div className="absolute top-[-20px] left-0 w-4 h-20 bg-primary/40 rounded-full" />
            <div className="absolute top-[-20px] right-0 w-4 h-20 bg-primary/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">The Problem: <span className="text-red-500">Farming Blind</span></h2>
            <p className="text-foreground/60 text-xl font-medium leading-relaxed">
              By the time you see the damage, it's already too late. Traditional scouting is slow, subjective, and reactive.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Activity, title: "High-Stakes Guessing", desc: "Farmers manage hundreds of acres from the ground. Human eyes miss what birds and AI see.", color: "red" },
              { icon: AlertTriangle, title: "Invisible Threats", desc: "Pests destroy 40% of global crops every year, costing over $220 billion in lost revenue.", color: "orange" },
              { icon: Droplets, title: "Excessive Waste", desc: "Blanket spraying wastes 30% of fertilizers. We target only the exact 5% that needs it.", color: "blue" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 backdrop-blur-xl relative overflow-hidden"
              >
                <div className={`w-16 h-16 bg-${item.color}-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                <p className="text-foreground/60 leading-relaxed font-medium">
                  {item.desc}
                </p>
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <item.icon className="w-24 h-24" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-32 relative overflow-hidden bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] tracking-tighter">
                THE SOLUTION: <br /><span className="text-primary italic">SURGICAL PRECISION</span>
              </h2>
              <p className="text-xl text-foreground/70 mb-12 font-medium leading-relaxed">
                Our "Healthy Farm" Dashboard turns raw drone data into a tactical map that tells you exactly where to act.
              </p>

              <div className="space-y-8">
                {[
                  { title: "Autonomous Scouting", desc: "Drone flies a pre-set grid with multispectral thermal cameras." },
                  { title: "Digital Twin Creation", desc: "We stitch photos into a high-res real-time map with GPS accuracy." },
                  { title: "AI Diagnosis", desc: "YOLOv8 scans for bugs and calculates NDVI stress levels." },
                  { title: "Actionable Results", desc: "Zone A needs nitrogen; Zone B has aphids. Move fast." }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-6 group cursor-default"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shrink-0 font-black text-xl group-hover:scale-110 transition-transform group-hover:rotate-12">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-1 group-hover:text-primary transition-colors">{step.title}</h4>
                      <p className="text-foreground/60 font-medium">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/30 to-accent/30 p-1 shadow-[0_40px_100px_rgba(34,197,94,0.2)]">
                <div className="w-full h-full rounded-[2.8rem] bg-black/90 backdrop-blur-3xl border border-white/10 p-10 flex flex-col gap-8 relative overflow-hidden group">
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <Cpu className="w-7 h-7 text-green-500" />
                      </div>
                      <div>
                        <p className="font-black text-xl">SENSORS</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Live Monitoring</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30">
                      Scanned
                    </div>
                  </div>

                  <div className="flex-1 bg-black/80 rounded-[2.5rem] overflow-hidden relative border border-white/5 ring-1 ring-white/5">
                    {/* Simulated drone video placeholder with animation */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-[5s]" />

                    {/* Scanning laser effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-1/2 animate-[scan_4s_ease-in-out_infinite]" />

                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

                    {/* AI Detection Boxes */}
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/4 left-1/3 w-32 h-32 border-2 border-primary rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.5)] flex items-center justify-center"
                    >
                      <span className="absolute -top-3 -left-1 bg-primary text-black text-[10px] px-2 py-0.5 rounded font-black uppercase">CROP: HEALTHY</span>
                    </motion.div>

                    <motion.div
                      animate={{ scale: [1, 0.95, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-accent rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      <span className="absolute -top-3 -left-1 bg-accent text-black text-[10px] px-2 py-0.5 rounded font-black uppercase">ZONE: LOW NITROGEN</span>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 z-10">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-black uppercase text-foreground/40 leading-none">Est. Yield</p>
                      </div>
                      <p className="text-4xl font-black text-primary">+28%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-black uppercase text-foreground/40 leading-none">Efficiency</p>
                      </div>
                      <p className="text-4xl font-black text-primary">94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[4rem] bg-gradient-to-br from-primary via-green-600 to-accent p-16 md:p-32 text-center text-black relative overflow-hidden group shadow-[0_50px_100px_rgba(34,197,94,0.3)]"
          >
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tighter"
              >
                READY TO <br />MODERNIZE YOUR FARM?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl font-bold opacity-80 mb-12 max-w-2xl mx-auto"
              >
                Join 500+ forward-thinking farmers who are already saving thousands and protecting their future.
              </motion.p>
              <button
                onClick={() => router.push('/login')}
                className="group relative px-12 py-6 bg-black text-white rounded-2xl font-black text-2xl hover:scale-105 transition-all duration-300 shadow-2xl active:scale-95"
              >
                START YOUR SCAN NOW
              </button>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 group-hover:bg-accent/40 transition-colors duration-1000" />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-10 pointer-events-none"
            >
              <Globe className="w-full h-full p-20" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
