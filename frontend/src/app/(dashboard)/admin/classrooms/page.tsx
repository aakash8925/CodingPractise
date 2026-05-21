"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Users, Search, Database } from "lucide-react";
import { classroomService } from "@/services/classroomService";
import { Classroom } from "@/types";

export default function AdminClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getAll();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      await classroomService.create(newRoomName);
      setNewRoomName("");
      setShowCreateModal(false);
      await fetchClassrooms();
    } catch {
      alert("Failed to create classroom.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="text-sky-400" /> Global Classrooms
          </h1>
          <p className="text-sm text-slate-400 mt-1">Admin oversight of all platform classrooms.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} /> Force Create Classroom
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        </div>
      ) : (
        <div className="glass-card border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Classroom Name</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Enrolled Students</th>
                <th className="p-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {classrooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-900/50 transition-colors group">
                  <td className="p-4 text-sm font-code text-slate-500">{room.id}</td>
                  <td className="p-4 text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{room.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-slate-700">
                        {room.teacher?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-slate-300">{room.teacher?.name || 'No Teacher'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                      <Users size={12} className="text-slate-500" /> {room.studentCount}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 font-code">
                    {new Date(room.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2">Create Global Classroom</h2>
            <p className="text-sm text-slate-400 mb-6">As an Admin, you can manually provision classrooms.</p>
            
            <form onSubmit={handleCreate}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Classroom Name
                  </label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter classroom name..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating || !newRoomName.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isCreating ? "Provisioning..." : "Provision Classroom"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
