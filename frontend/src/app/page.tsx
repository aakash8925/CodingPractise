"use client";

import { motion } from "framer-motion";
import { Code2, ArrowRight, Terminal, BrainCircuit, Laptop, Cpu } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col justify-between">
      {/* Premium Background Radial Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Custom VS-Code inspired Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1] pointer-events-none" />

      {/* Elegant Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]">
              <Terminal size={22} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-code">CodeRoom</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-sky-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-bold px-4.5 py-2 rounded-lg shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:scale-[1.02] transition-all flex items-center gap-1.5">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Main Platform Panel */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-24 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wider uppercase font-code">
            <Cpu size={13} className="animate-pulse" /> Modern SaaS Learning
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
            Build, Preview, <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Achieve.</span>
          </h1>
          
          <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            A fully-featured cloud IDE platform inspired by VS Code and NeetCode. Built exclusively for teachers to govern, and students to code HTML, CSS, and JS dynamically.
          </p>

          <div className="flex items-center justify-center gap-4.5 pt-6">
            <Link href="/register" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(14,165,233,0.25)] transition-all flex items-center gap-2 hover:scale-[1.05] active:scale-95">
              Get Started Now <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-sky-500/30 hover:text-sky-400 text-slate-100 font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.05] active:scale-95 shadow-lg">
              Platform Sandbox
            </Link>
          </div>
        </motion.div>

        {/* Elegant Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24"
        >
          <div className="bg-slate-900/50 border border-slate-800 p-7 rounded-2xl shadow-xl flex flex-col gap-4 group hover:border-sky-500/30 hover:bg-slate-900 transition-all duration-300">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
              <BrainCircuit size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Virtual Classrooms</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Create customized virtual rooms, invite students instantly, and govern user progress with high efficiency.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-7 rounded-2xl shadow-xl flex flex-col gap-4 group hover:border-sky-500/30 hover:bg-slate-900 transition-all duration-300">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
              <Code2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Monaco Live Sandbox</h3>
            <p className="text-sm text-slate-400 leading-relaxed">An integrated VS-code grade compiler featuring instant side-by-side iframe previews for HTML, CSS, and JavaScript.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-7 rounded-2xl shadow-xl flex flex-col gap-4 group hover:border-sky-500/30 hover:bg-slate-900 transition-all duration-300">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 w-fit group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
              <Laptop size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Rigid Deadline Controls</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Enforce dynamic deadlines, review autosaved drafts, check submitted vs late statistics, and export student summaries.</p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-slate-850 py-8 text-center bg-slate-950">
        <p className="text-xs font-semibold text-slate-500 font-code">© 2026 CodeRoom Platform. Powered by Spring Boot & Next.js.</p>
      </footer>
    </div>
  );
}
