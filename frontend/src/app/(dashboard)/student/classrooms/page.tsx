"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, LogIn, Loader2, Users, Search, Code2 } from "lucide-react";
import { classroomService } from "@/services/classroomService";
import { Classroom } from "@/types";
import { useRouter } from "next/navigation";

export default function StudentClassroomsPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getMyClassrooms();
      setClassrooms(data);
    } catch (error) {
      console.error("Failed to load classrooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClassrooms();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!joinCode.trim()) return;

    try {
      setIsJoining(true);
      await classroomService.join(parseInt(joinCode, 10));
      setJoinCode("");
      setShowJoinModal(false);
      await fetchClassrooms();
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      setJoinError(axiosError.response?.data?.detail || "Failed to join classroom. Check the ID.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-sky-400" /> My Enrolled Classes
          </h1>
          <p className="text-sm text-slate-400 mt-1">Access your courses and coding assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter courses..." 
              className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => { setJoinError(null); setShowJoinModal(true); }}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-95"
          >
            <LogIn size={16} /> Join Class
          </button>
        </div>
      </div>

      {/* Classrooms Grid */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
          <p className="text-slate-500 text-sm animate-pulse">Loading your enrollments...</p>
        </div>
      ) : classrooms.length === 0 ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4">
            <Code2 size={32} className="text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Classes Found</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">You haven&apos;t joined any virtual classrooms yet. Ask your teacher for a classroom ID code to get started.</p>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all border border-slate-700"
          >
            Enter Classroom Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((room) => (
            <motion.div 
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl border border-slate-800 overflow-hidden hover:border-sky-500/30 transition-all group flex flex-col"
            >
              <div className="h-2 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
                    Active Course
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{room.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Instructor: {room.teacher?.name}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users size={16} />
                    <span>{room.studentCount} Peers</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/student/tasks?classroom=${room.id}`)}
                    className="text-sky-400 text-sm font-semibold hover:text-sky-300 cursor-pointer"
                  >
                    View Tasks
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Join Modal overlay */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2">Join a Classroom</h2>
            <p className="text-sm text-slate-400 mb-6">Enter the Classroom ID provided by your instructor to enroll in their course.</p>
            
            {joinError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoin}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Classroom ID Code
                  </label>
                  <input 
                    autoFocus
                    type="number" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. 1" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-code"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isJoining ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isJoining ? "Verifying..." : "Join Classroom"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
