"use client";

import { useState } from "react";
import { Play, Save, CheckCircle, Code2, MonitorPlay, AlignLeft, Maximize2 } from "lucide-react";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { LivePreview } from "@/components/editor/LivePreview";

type Tab = "html" | "css" | "javascript";

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<Tab>("html");
  
  // Code States
  const [htmlCode, setHtmlCode] = useState("<h1>Hello from CodeRoom!</h1>\\n<p>Start styling me with CSS.</p>");
  const [cssCode, setCssCode] = useState("h1 {\\n  color: #0ea5e9;\\n}\\n\\nbody {\\n  background-color: #f8fafc;\\n}");
  const [jsCode, setJsCode] = useState("console.log('Sandbox initialized!');");

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between glass-card p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <MonitorPlay size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Project Sandbox</h1>
            <p className="text-xs text-slate-500">Unassigned Free-Play Mode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700">
            <Save size={14} /> Save Draft
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95">
            <CheckCircle size={14} /> Submit Code
          </button>
        </div>
      </div>

      {/* Split IDE Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        
        {/* LEFT PANE: Monaco Editor */}
        <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <div className="flex items-center bg-slate-900 border-b border-slate-800 p-2 gap-1 overflow-x-auto">
            {(["html", "css", "javascript"] as Tab[]).map((tab) => (
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
            <div className="flex-1" />
            <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">
              <AlignLeft size={16} />
            </button>
          </div>

          {/* Editor Surface */}
          <div className="flex-1 min-h-0 bg-[#0f172a]">
            {activeTab === "html" && (
              <MonacoEditor language="html" value={htmlCode} onChange={(v) => setHtmlCode(v || "")} />
            )}
            {activeTab === "css" && (
              <MonacoEditor language="css" value={cssCode} onChange={(v) => setCssCode(v || "")} />
            )}
            {activeTab === "javascript" && (
              <MonacoEditor language="javascript" value={jsCode} onChange={(v) => setJsCode(v || "")} />
            )}
          </div>
        </div>

        {/* RIGHT PANE: Live Rendering iframe */}
        <div className="glass-card rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="h-[52px] flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Play size={14} className="text-emerald-400" /> Live Output
            </div>
            <div className="flex items-center gap-2">
               <button className="p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded transition-colors">
                 <Maximize2 size={14} />
               </button>
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
