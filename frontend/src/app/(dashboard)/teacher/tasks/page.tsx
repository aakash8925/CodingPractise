"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, Loader2, ClipboardList } from "lucide-react";
import { taskService } from "@/services/taskService";
import { classroomService } from "@/services/classroomService";
import { Task, Classroom } from "@/types";

export default function TeacherTasksPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [targetClassroomId, setTargetClassroomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [now] = useState(() => Date.now());

  const fetchData = async () => {
    try {
      setLoading(true);
      const rooms = await classroomService.getMyClassrooms();
      setClassrooms(rooms);

      // Fetch tasks for all classrooms
      const allTasksPromises = rooms.map((room) => taskService.getByClassroom(room.id));
      const allTasksResults = await Promise.all(allTasksPromises);
      const flattenedTasks = allTasksResults.flat();
      
      // Sort tasks by deadline
      flattenedTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setTasks(flattenedTasks);
    } catch (error) {
      console.error("Failed to load dashboard tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!targetClassroomId || !title.trim() || !deadline) {
      setCreateError("Please fill in all required fields.");
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        title,
        description,
        classroomId: parseInt(targetClassroomId, 10),
        deadline: new Date(deadline).toISOString(),
      };
      await taskService.create(payload);
      
      // Reset form & close modal
      setTitle("");
      setDescription("");
      setDeadline("");
      setTargetClassroomId("");
      setShowCreateModal(false);
      
      // Refresh task list
      await fetchData();
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      setCreateError(axiosError.response?.data?.detail || "Failed to create task.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = selectedClassroomId === "all"
    ? tasks
    : tasks.filter(task => task.classroomId === parseInt(selectedClassroomId, 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="text-sky-400" /> Classroom Tasks
          </h1>
          <p className="text-sm text-slate-400 mt-1">Create, assign, and manage coding tasks for your students.</p>
        </div>
        
        <button 
          onClick={() => {
            setCreateError(null);
            setShowCreateModal(true);
          }}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Assign New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classroom:</span>
        <select
          value={selectedClassroomId}
          onChange={(e) => setSelectedClassroomId(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500/50 cursor-pointer"
        >
          <option value="all">All Classrooms</option>
          {classrooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
          <p className="text-slate-500 text-sm animate-pulse">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4">
            <ClipboardList size={32} className="text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Tasks Found</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm">
            {selectedClassroomId === "all" 
              ? "You haven&apos;t created any tasks yet. Create one to begin testing your students."
              : "No tasks have been assigned to this classroom yet."}
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all border border-slate-700"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.map((task) => {
            const isOverdue = new Date(task.deadline).getTime() < now;
            return (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-xl border border-slate-800 overflow-hidden hover:border-sky-500/30 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {task.classroomName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isOverdue 
                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {isOverdue ? "Closed" : "Active"}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4">{task.description || "No description provided."}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-1">Create Coding Task</h2>
            <p className="text-sm text-slate-400 mb-6">Specify the title, instructions, and deadline for the assignment.</p>
            
            {createError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Classroom *
                </label>
                <select
                  required
                  value={targetClassroomId}
                  onChange={(e) => setTargetClassroomId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-sky-500/50 cursor-pointer"
                >
                  <option value="" disabled>-- Select Classroom --</option>
                  {classrooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Task Title *
                </label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a Responsive Landing Page" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Instructions / Description
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write clear instructions for students..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Submission Deadline *
                </label>
                <input 
                  required
                  type="datetime-local" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isCreating ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
