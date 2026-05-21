"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Clock, Award, Play, Code2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { classroomService } from "@/services/classroomService";
import { taskService } from "@/services/taskService";
import { submissionService } from "@/services/submissionService";
import { Classroom, Task, Submission } from "@/types";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { LivePreview } from "@/components/editor/LivePreview";

type Tab = "html" | "css" | "javascript";

export default function TeacherSubmissionsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Selection states
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Editor states
  const [activeTab, setActiveTab] = useState<Tab>("html");

  // Grading states
  const [marks, setMarks] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isGrading, setIsGrading] = useState(false);

  // Status/Loading states
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoadingClassrooms(true);
      const rooms = await classroomService.getMyClassrooms();
      setClassrooms(rooms);
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
      setErrorMsg("Failed to load classrooms.");
    } finally {
      setLoadingClassrooms(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClassrooms();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchClassrooms]);

  const handleClassroomChange = (val: string) => {
    setSelectedClassroomId(val);
    setTasks([]);
    setSelectedTaskId("");
    setSubmissions([]);
    setSelectedSub(null);
  };

  const handleTaskChange = (val: string) => {
    setSelectedTaskId(val);
    setSubmissions([]);
    setSelectedSub(null);
  };

  // Fetch tasks when classroom changes
  useEffect(() => {
    if (!selectedClassroomId) return;

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        setErrorMsg(null);
        const taskData = await taskService.getByClassroom(parseInt(selectedClassroomId, 10));
        setTasks(taskData);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        setErrorMsg("Failed to load tasks for selected classroom.");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [selectedClassroomId]);

  // Fetch submissions when task changes
  useEffect(() => {
    if (!selectedTaskId) return;

    const fetchSubmissions = async () => {
      try {
        setLoadingSubmissions(true);
        setErrorMsg(null);
        const subData = await submissionService.getByTask(parseInt(selectedTaskId, 10));
        setSubmissions(subData);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
        setErrorMsg("Failed to load submissions for selected task.");
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [selectedTaskId]);

  const handleSelectSubmission = (sub: Submission) => {
    setSelectedSub(sub);
    setMarks(sub.marks !== undefined && sub.marks !== null ? sub.marks.toString() : "");
    setFeedback(sub.feedback || "");
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const score = parseInt(marks, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      setErrorMsg("Marks must be a valid number between 0 and 100.");
      return;
    }

    try {
      setIsGrading(true);
      const updatedSub = await submissionService.grade(selectedSub.id, {
        marks: score,
        feedback: feedback.trim(),
      });
      
      // Update selected submission state
      setSelectedSub(updatedSub);

      // Update submissions list
      setSubmissions(prev => 
        prev.map(s => s.id === updatedSub.id ? updatedSub : s)
      );

      setSuccessMsg("Grade submitted successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosError.response?.data?.detail || "Failed to grade submission.");
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REVIEWED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "SUBMITTED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "DRAFT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "LATE":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="text-sky-400" /> Grade Student Submissions
        </h1>
        <p className="text-sm text-slate-400 mt-1">Review, compile, preview, and grade your students&apos; assignments.</p>
      </div>

      {/* Select Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            1. Select Classroom
          </label>
          <select
            value={selectedClassroomId}
            onChange={(e) => handleClassroomChange(e.target.value)}
            disabled={loadingClassrooms}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500/50 cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Choose Classroom --</option>
            {classrooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            2. Select Task
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => handleTaskChange(e.target.value)}
            disabled={loadingTasks || !selectedClassroomId}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-sky-500/50 cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Choose Task --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error & Success indicators */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Content Layout */}
      {!selectedClassroomId || !selectedTaskId ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          Please select a classroom and an active task above to view student submissions.
        </div>
      ) : loadingSubmissions ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
          <p className="text-slate-500 text-sm animate-pulse">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass-card border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4">
            <ClipboardList size={32} className="text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No Submissions Yet</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Students enrolled in this classroom have not turned in any files or drafts for this task.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Submissions List */}
          <div className="lg:col-span-1 glass-card border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Student Turn-Ins ({submissions.length})
            </h2>
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                    selectedSub?.id === sub.id
                      ? "bg-sky-500/10 border-sky-500/40 text-white"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{sub.student?.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusColor(sub.status)}`}>
                      {sub.status.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-850">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Draft"}
                    </span>
                    {sub.marks !== undefined && sub.marks !== null && (
                      <span className="text-purple-400 font-bold">Score: {sub.marks}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMNS: Grading Workspace & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedSub ? (
              <div className="glass-card border border-slate-800 rounded-xl h-[50vh] flex items-center justify-center text-slate-500 text-sm">
                Select a student submission from the list to begin evaluation.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Student Title */}
                <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedSub.student?.name}&apos;s Workspace
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Submitted: {selectedSub.submittedAt ? new Date(selectedSub.submittedAt).toLocaleString() : "Saved Draft"}
                    </p>
                  </div>
                </div>

                {/* Code Viewer and Preview Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[45vh] min-h-0">
                  {/* Editor View */}
                  <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="flex items-center bg-slate-900 border-b border-slate-800 p-2 gap-1 overflow-x-auto">
                      {(["html", "css", "javascript"] as Tab[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5 shrink-0 ${
                            activeTab === tab
                              ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700"
                              : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                          }`}
                        >
                          <Code2 size={12} />
                          {tab === "javascript" ? "JS" : tab.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 min-h-0 bg-[#0f172a]">
                      {activeTab === "html" && (
                        <MonacoEditor language="html" value={selectedSub.htmlCode || ""} readOnly={true} />
                      )}
                      {activeTab === "css" && (
                        <MonacoEditor language="css" value={selectedSub.cssCode || ""} readOnly={true} />
                      )}
                      {activeTab === "javascript" && (
                        <MonacoEditor language="javascript" value={selectedSub.jsCode || ""} readOnly={true} />
                      )}
                    </div>
                  </div>

                  {/* Render Preview Output */}
                  <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="h-[41px] flex items-center bg-slate-900 border-b border-slate-800 px-4 shrink-0 justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                        <Play size={12} className="text-emerald-400" /> Compiled Output
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 p-2 bg-slate-900/50">
                      <LivePreview
                        htmlCode={selectedSub.htmlCode || ""}
                        cssCode={selectedSub.cssCode || ""}
                        jsCode={selectedSub.jsCode || ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Grading Panel Form */}
                <div className="glass-card border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <Award size={16} className="text-sky-400" /> Assignment Evaluation
                  </h3>

                  {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                      <CheckCircle size={14} /> {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleGradeSubmission} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Score (0 - 100) *
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          max="100"
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          placeholder="e.g. 85"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all font-code"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Feedback for Student
                        </label>
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Great layout! Try optimizing your CSS rules next time."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isGrading || selectedSub.status === "DRAFT"}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {isGrading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {selectedSub.status === "DRAFT" ? "Cannot Grade Draft" : "Submit Grade"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
