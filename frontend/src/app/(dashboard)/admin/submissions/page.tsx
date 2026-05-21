"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, Play, User as UserIcon, Calendar, Maximize2 } from "lucide-react";
import { submissionService } from "@/services/submissionService";
import { Submission } from "@/types";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { LivePreview } from "@/components/editor/LivePreview";

type Tab = "html" | "css" | "javascript";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("html");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getAll();
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load global submissions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubmissions();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REVIEWED": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "DRAFT": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      case "LATE": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        <p className="text-slate-400 text-sm animate-pulse">Running global database query...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* Left Sidebar: Submissions Master List */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col glass-card rounded-xl border border-slate-800 overflow-hidden shrink-0">
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Code2 size={16} className="text-sky-400" />
            Global Submissions
          </h2>
          <p className="text-xs text-slate-500 mt-1">{submissions.length} Total Records</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {submissions.length === 0 ? (
            <p className="text-slate-500 text-xs text-center p-4">No submissions found across the platform.</p>
          ) : (
            submissions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedSub?.id === sub.id
                    ? "bg-sky-500/10 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                    : "bg-slate-900/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-200 truncate pr-2">{sub.student?.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mb-1">Task: {sub.taskTitle}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-code">
                  <Calendar size={10} /> {new Date(sub.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content: Submission Details & Live Output */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedSub ? (
          <div className="flex-1 glass-card rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center p-6">
             <div className="p-4 bg-slate-900 rounded-full border border-slate-800 mb-4 shadow-xl">
               <UserIcon size={32} className="text-slate-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Select a Submission</h2>
             <p className="text-slate-400 text-sm max-w-sm">
               Click on any student submission from the master list on the left to inspect their code buffers and evaluate their live iframe rendering.
             </p>
          </div>
        ) : (
          <motion.div 
            key={selectedSub.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col gap-4 min-h-0"
          >
            {/* Header Identity */}
            <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedSub.student?.name}&apos;s Workspace
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Task: {selectedSub.taskTitle} • Submitted: {new Date(selectedSub.submittedAt || selectedSub.updatedAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                 {selectedSub.marks !== undefined && selectedSub.marks !== null ? (
                   <div className="inline-flex flex-col items-end">
                     <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Grade</span>
                     <span className="text-lg font-bold text-emerald-400 font-code">{selectedSub.marks}/100</span>
                   </div>
                 ) : (
                   <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Needs Review</span>
                 )}
              </div>
            </div>

            {/* Split IDE & Preview Panel for Admin */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">
              
              {/* Left: Monaco Code Explorer */}
              <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="flex items-center bg-slate-900 border-b border-slate-800 p-2 gap-1 overflow-x-auto shrink-0">
                  {(["html", "css", "javascript"] as Tab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all flex items-center gap-2 shrink-0 ${
                        activeTab === tab 
                          ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700" 
                          : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                      }`}
                    >
                      <Code2 size={14} />
                      {tab === "javascript" ? "JS" : tab.toUpperCase()}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 bg-slate-950 rounded border border-slate-800 hidden sm:block">READ-ONLY MODE</span>
                </div>

                <div className="flex-1 min-h-0 bg-[#0f172a]">
                  {activeTab === "html" && (
                    <MonacoEditor readOnly language="html" value={selectedSub.htmlCode || ""} />
                  )}
                  {activeTab === "css" && (
                    <MonacoEditor readOnly language="css" value={selectedSub.cssCode || ""} />
                  )}
                  {activeTab === "javascript" && (
                    <MonacoEditor readOnly language="javascript" value={selectedSub.jsCode || ""} />
                  )}
                </div>
              </div>

              {/* Right: Live Output Sandbox */}
              <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                <div className="h-[45px] flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Play size={14} className="text-emerald-400" /> Compiled Output View
                  </div>
                  <button className="p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded transition-colors">
                    <Maximize2 size={14} />
                  </button>
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
          </motion.div>
        )}
      </div>

    </div>
  );
}
