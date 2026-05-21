"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Save, CheckCircle, Code2, ArrowLeft, Award, MessageSquare, Loader2, BookOpen } from "lucide-react";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { taskService } from "@/services/taskService";
import { submissionService } from "@/services/submissionService";
import { Task, Submission } from "@/types";

type Tab = "instructions" | "html" | "css" | "javascript";

export default function StudentTaskWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = parseInt(params.taskId as string, 10);

  const [task, setTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("instructions");
  const [loading, setLoading] = useState(true);

  // Editor states
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [jsCode, setJsCode] = useState("");

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTaskAndSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Fetch task details
      const taskData = await taskService.getById(taskId);
      setTask(taskData);

      // Fetch existing submission
      try {
        const subData = await submissionService.getMySubmission(taskId);
        setSubmission(subData);
        setHtmlCode(subData.htmlCode || "");
        setCssCode(subData.cssCode || "");
        setJsCode(subData.jsCode || "");
      } catch {
        // No submission exists yet. Set boilerplate.
        setHtmlCode("<h1>" + taskData.title + "</h1>\n<p>Start writing your code here...</p>");
        setCssCode("h1 {\n  color: #0ea5e9;\n}");
        setJsCode("console.log('Workspace initialized!');");
      }
    } catch (error) {
      console.error("Failed to load workspace data", error);
      setErrorMsg("Failed to load task. It may not exist or you may not have access.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTaskAndSubmission();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTaskAndSubmission]);

  const handleSaveDraft = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const sub = await submissionService.submit({
        taskId,
        htmlCode,
        cssCode,
        jsCode,
        draft: true,
      });
      setSubmission(sub);
      setSuccessMsg("Draft saved successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosError.response?.data?.detail || "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAssignment = async () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit? This will turn in your solution for grading.");
    if (!confirmSubmit) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const sub = await submissionService.submit({
        taskId,
        htmlCode,
        cssCode,
        jsCode,
        draft: false,
      });
      setSubmission(sub);
      setSuccessMsg("Assignment submitted successfully!");
      setActiveTab("instructions"); // Redirect to instructions to show submission summary
    } catch (error) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosError.response?.data?.detail || "Failed to submit assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        <p className="text-slate-500 text-sm animate-pulse">Loading editor workspace...</p>
      </div>
    );
  }

  if (errorMsg && !task) {
    return (
      <div className="glass-card border border-slate-800 rounded-xl p-8 max-w-md mx-auto text-center mt-12">
        <p className="text-red-400 font-medium mb-4">{errorMsg}</p>
        <button
          onClick={() => router.push("/student/tasks")}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const isReadOnly = submission?.status === "SUBMITTED" || submission?.status === "REVIEWED";
  const hasFeedback = submission?.status === "REVIEWED";

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between glass-card p-3 rounded-xl border border-slate-800 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/tasks")}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-2">
              {task?.title}
              <span className="text-[10px] font-normal text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {task?.classroomName}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Due: {task ? new Date(task.deadline).toLocaleString() : ""}
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-medium animate-pulse">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Draft
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={isSaving || isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                Submit Task
              </button>
            </>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <CheckCircle size={12} /> Work Submitted
            </div>
          )}
        </div>
      </div>

      {/* Workspace Panel Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* LEFT PANE: Editors & Instructions */}
        <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center bg-slate-900 border-b border-slate-800 p-2 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("instructions")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "instructions"
                  ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700"
                  : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              }`}
            >
              <BookOpen size={14} />
              Instructions
            </button>
            {(["html", "css", "javascript"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === tab
                    ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                }`}
              >
                <Code2 size={14} />
                {tab === "javascript" ? "JS" : tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Active Tab Surface */}
          <div className="flex-1 min-h-0 bg-[#0f172a] relative">
            {activeTab === "instructions" && (
              <div className="h-full overflow-y-auto p-6 space-y-6 text-slate-300">
                {/* Feedback Panel */}
                {hasFeedback && submission && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="text-purple-400" size={18} /> Evaluation Grade
                      </h4>
                      <span className="text-xl font-code font-bold text-purple-400">
                        {submission.marks} / 100
                      </span>
                    </div>
                    {submission.feedback && (
                      <div className="space-y-1.5 pt-2 border-t border-purple-500/20">
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <MessageSquare size={12} /> Instructor Feedback:
                        </p>
                        <p className="text-sm text-slate-200 italic">&ldquo;{submission.feedback}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Task Instructions */}
                <div>
                  <h2 className="text-lg font-bold text-white mb-3">Assignment Description</h2>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {task?.description || "No specific instructions provided by the teacher."}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Course Room</p>
                    <p className="text-white text-sm font-bold">{task?.classroomName}</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Submission Status</p>
                    <p className="text-white text-sm font-bold capitalize">
                      {submission?.status.toLowerCase().replace("_", " ") || "Not started"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "html" && (
              <MonacoEditor language="html" value={htmlCode} onChange={(v) => setHtmlCode(v || "")} readOnly={isReadOnly} />
            )}

            {activeTab === "css" && (
              <MonacoEditor language="css" value={cssCode} onChange={(v) => setCssCode(v || "")} readOnly={isReadOnly} />
            )}

            {activeTab === "javascript" && (
              <MonacoEditor language="javascript" value={jsCode} onChange={(v) => setJsCode(v || "")} readOnly={isReadOnly} />
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Rendering output */}
        <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="h-[52px] flex items-center bg-slate-900 border-b border-slate-800 px-4 shrink-0 justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Play size={14} className="text-emerald-400" /> Live Output Preview
            </div>
          </div>
          
          <div className="flex-1 min-h-0 p-2 bg-slate-900/50">
            <LivePreview 
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
