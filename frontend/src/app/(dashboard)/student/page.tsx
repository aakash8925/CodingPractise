"use client";

import { motion } from "framer-motion";
import { Flame, Star, Target, Code2, Play, CheckCircle2, Clock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame size={14} className="animate-pulse" /> 5 Day Streak!
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ready to code, {user?.name.split(' ')[0]}?</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">You have 2 pending assignments due this week. Let&apos;s keep the momentum going.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="text-center px-4">
            <p className="text-xs text-slate-500 font-medium uppercase">Total XP</p>
            <p className="text-xl font-bold text-sky-400 font-code">2,450</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-4">
            <p className="text-xs text-slate-500 font-medium uppercase">Rank</p>
            <p className="text-xl font-bold text-purple-400 font-code">Silver III</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Main Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target size={18} className="text-sky-400" /> Current Tasks
          </h2>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative glass-card p-5 rounded-xl border border-sky-500/20 hover:border-sky-500/50 transition-all overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Clock size={12}/> Due Tomorrow</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">Build a Responsive CSS Grid Portfolio</h3>
                <p className="text-sm text-slate-400 mt-1">Web Development 101 • Assigned by Mr. Smith</p>
              </div>
              <button className="shrink-0 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                <Code2 size={18} /> Solve Challenge
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative glass-card p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-slate-500 transition-colors" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><Clock size={12}/> Due in 3 days</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-slate-300 transition-colors">JavaScript Array Methods Practice</h3>
                <p className="text-sm text-slate-400 mt-1">Web Development 101 • Assigned by Mr. Smith</p>
              </div>
              <button className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all">
                <Play size={16} /> Start
              </button>
            </div>
          </motion.div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Progress Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-xl border border-slate-800"
          >
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Star size={16} className="text-amber-400" /> Course Progress
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">HTML & CSS</span>
                  <span className="text-sky-400 font-code font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">JavaScript</span>
                  <span className="text-sky-400 font-code font-bold">40%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-xl border border-slate-800"
          >
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-400"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm text-slate-200">Semantic HTML Quiz</p>
                  <p className="text-xs text-slate-500">Graded: 100/100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-400"><CheckCircle2 size={16} /></div>
                <div>
                  <p className="text-sm text-slate-200">Flexbox Layouts</p>
                  <p className="text-xs text-slate-500">Graded: 95/100</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
