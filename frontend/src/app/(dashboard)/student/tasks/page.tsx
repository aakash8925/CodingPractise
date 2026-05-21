"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, ClipboardList, Loader2, ArrowRight, CheckCircle2, FileEdit, Award } from "lucide-react";
import { taskService } from "@/services/taskService";
import { classroomService } from "@/services/classroomService";
import { submissionService } from "@/services/submissionService";
import { Task, Classroom, Submission } from "@/types";

interface TaskWithSubmission extends Task {
  submission: Submission | null;
  statusText: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REVIEWED" | "LATE";
}

export default function StudentTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const fetchStudentTasksData = useCallback(async () => {
    try {
      setLoading(true);
      const enrolledClassrooms = await classroomService.getMyClassrooms();
      setClassrooms(enrolledClassrooms);

      // Fetch tasks for all classrooms
      const allTasksPromises = enrolledClassrooms.map((room) => taskService.getByClassroom(room.id));
      const allTasksResults = await Promise.all(allTasksPromises);
      const flattenedTasks = allTasksResults.flat();

      // Retrieve submission status for each task in parallel
      const tasksWithSubmissions: TaskWithSubmission[] = await Promise.all(
        flattenedTasks.map(async (task) => {
          let submission: Submission | null = null;
          let statusText: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REVIEWED" | "LATE" = "NOT_STARTED";
          
          try {
            submission = await submissionService.getMySubmission(task.id);
            if (submission) {
              statusText = submission.status;
            }
          } catch {
            // No submission exists yet
            const isOverdue = new Date(task.deadline).getTime() < now;
            statusText = isOverdue ? "LATE" : "NOT_STARTED";
          }

          return {
            ...task,
            submission,
            statusText,
          };
        })
      );

      // Sort tasks by deadline
      tasksWithSubmissions.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setTasks(tasksWithSubmissions);
    } catch (error) {
      console.error("Failed to load student tasks", error);
    } finally {
      setLoading(false);
    }
  }, [now]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cls = params.get("classroom");
      if (cls) {
        Promise.resolve().then(() => setSelectedClassroomId(cls));
      }
    }
    const timer = setTimeout(() => {
      fetchStudentTasksData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchStudentTasksData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Award size={12} /> Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Submitted
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <FileEdit size={12} /> In Draft
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Pending
          </span>
        );
    }
  };

  const getActionButton = (task: TaskWithSubmission) => {
    switch (task.statusText) {
      case "REVIEWED":
        return (
          <button
            onClick={() => router.push(`/student/tasks/${task.id}`)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            View Feedback & Grade <ArrowRight size={14} />
          </button>
        );
      case "SUBMITTED":
        return (
          <button
            onClick={() => router.push(`/student/tasks/${task.id}`)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            View Submission <ArrowRight size={14} />
          </button>
        );
      case "DRAFT":
        return (
          <button
            onClick={() => router.push(`/student/tasks/${task.id}`)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Resume Coding <ArrowRight size={14} />
          </button>
        );
      case "LATE":
        return (
          <button
            onClick={() => router.push(`/student/tasks/${task.id}`)}
            disabled
            className="w-full sm:w-auto bg-slate-800 text-slate-500 px-4 py-2 rounded-lg font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
          >
            Submission Locked <ArrowRight size={14} />
          </button>
        );
      default:
        return (
          <button
            onClick={() => router.push(`/student/tasks/${task.id}`)}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-[0_0_12px_rgba(14,165,233,0.3)] hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Coding <ArrowRight size={14} />
          </button>
        );
    }
  };

  const filteredTasks = selectedClassroomId === "all"
    ? tasks
    : tasks.filter(task => task.classroomId === parseInt(selectedClassroomId, 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="text-sky-400" /> Assigned Tasks
        </h1>
        <p className="text-sm text-slate-400 mt-1">Complete your coding exercises and submit them before the deadline.</p>
      </div>

      {/* Classroom Filter */}
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
          <p className="text-slate-500 text-sm animate-pulse">Loading assignments...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4">
            <ClipboardList size={32} className="text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Tasks Found</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            {selectedClassroomId === "all" 
              ? "You aren&apos;t enrolled in any classrooms with active tasks."
              : "No tasks have been assigned to this classroom."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {task.classroomName}
                    </span>
                    {getStatusBadge(task.statusText)}
                  </div>
                  <h3 className="text-lg font-bold text-white">{task.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 max-w-2xl">
                    {task.description || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {task.submission?.marks !== undefined && (
                      <span className="text-emerald-400 font-bold">
                        Score: {task.submission.marks} / 100
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center sm:justify-end shrink-0">
                  {getActionButton(task)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
