"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Users, BookOpen, Activity, Server, Database } from "lucide-react";
import { classroomService } from "@/services/classroomService";
import { Classroom } from "@/types";

export default function AdminDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      // Admin gets to see everything
      const allRooms = await classroomService.getAll();
      setClassrooms(allRooms);
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGlobalData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Control Panel</h1>
            <p className="text-sm text-slate-400 mt-0.5">Global oversight and platform analytics.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-emerald-400 font-semibold font-code shadow-inner">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             SYSTEM ONLINE
           </div>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Classrooms", value: classrooms.length.toString(), icon: BookOpen, color: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "Total Registered Users", value: "Active", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Platform Uptime", value: "99.9%", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 rounded-xl flex items-center gap-4 border border-slate-800"
          >
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-code">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Global Classroom Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl border border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Database size={18} className="text-sky-400"/> Database: All Classrooms</h2>
            <span className="text-xs font-code bg-slate-800 text-slate-400 px-2 py-1 rounded">Live Query</span>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {loading ? (
              <p className="text-slate-500 text-sm animate-pulse">Running global query...</p>
            ) : classrooms.length === 0 ? (
              <p className="text-slate-500 text-sm">No classrooms found in PostgreSQL database.</p>
            ) : (
              classrooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <div>
                    <p className="text-sm font-bold text-white">{room.name}</p>
                    <p className="text-xs text-slate-500">Instructor: {room.teacher?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">ID: {room.id}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Server Status Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl border border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server size={18} className="text-amber-400"/> Backend Server Status</h2>
          </div>
          
          <div className="space-y-4">
             <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
               <div className="flex justify-between text-sm mb-2">
                 <span className="text-slate-400">PostgreSQL Connections</span>
                 <span className="text-sky-400 font-bold font-code">Healthy</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5">
                 <div className="bg-sky-500 h-1.5 rounded-full w-1/4"></div>
               </div>
             </div>

             <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
               <div className="flex justify-between text-sm mb-2">
                 <span className="text-slate-400">JVM Memory Usage</span>
                 <span className="text-emerald-400 font-bold font-code">24%</span>
               </div>
               <div className="w-full bg-slate-800 rounded-full h-1.5">
                 <div className="bg-emerald-500 h-1.5 rounded-full w-1/4"></div>
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
