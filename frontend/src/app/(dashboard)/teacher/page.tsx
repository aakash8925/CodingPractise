"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, CheckSquare, TrendingUp, Clock, Plus, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { classroomService } from "@/services/classroomService";
import { Classroom } from "@/types";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const rooms = await classroomService.getMyClassrooms();
      setClassrooms(rooms);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateClassroom = async () => {
    const name = window.prompt("Enter Classroom Name:");
    if (!name || name.trim() === "") return;
    
    try {
      setIsCreating(true);
      await classroomService.create(name);
      await fetchDashboardData();
    } catch {
      alert("Failed to create classroom.");
    } finally {
      setIsCreating(false);
    }
  };

  const totalStudents = classrooms.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400 mt-1">Here is what is happening in your classrooms today.</p>
        </div>
        <button 
          onClick={handleCreateClassroom}
          disabled={isCreating}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          New Classroom
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-sky-500" size={32} />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Classrooms", value: classrooms.length.toString(), icon: BookOpen, color: "text-sky-400", bg: "bg-sky-500/10" },
              { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "Pending Reviews", value: "0", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Avg. Completion", value: "N/A", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 rounded-xl flex items-center gap-4"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Classrooms List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 glass-card rounded-xl border border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Your Classrooms</h2>
              </div>
              
              <div className="space-y-4">
                {classrooms.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No classrooms created yet. Click &quot;New Classroom&quot; to start teaching.
                  </div>
                ) : (
                  classrooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800/50 hover:border-sky-500/30 hover:bg-slate-900 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold border border-slate-700 font-code">
                          {room.id}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{room.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Created: {new Date(room.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-code">{room.studentCount}</p>
                        <p className="text-xs text-slate-500">Students</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-xl border border-slate-800 p-6 flex flex-col"
            >
              <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3 flex-1">
                <button 
                  onClick={() => router.push("/teacher/tasks")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-sky-500/10 border border-slate-800/50 hover:border-sky-500/30 transition-all text-left group cursor-pointer"
                >
                  <div className="p-2 bg-slate-800 group-hover:bg-sky-500/20 text-slate-400 group-hover:text-sky-400 rounded-md transition-colors">
                    <CheckSquare size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">Assign New Task</p>
                    <p className="text-xs text-slate-500">Create a coding assignment</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-sky-500/10 border border-slate-800/50 hover:border-sky-500/30 transition-all text-left group">
                  <div className="p-2 bg-slate-800 group-hover:bg-sky-500/20 text-slate-400 group-hover:text-sky-400 rounded-md transition-colors">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">Invite Students</p>
                    <p className="text-xs text-slate-500">Generate classroom join keys</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
