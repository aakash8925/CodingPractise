"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface MonacoEditorProps {
  language: "html" | "css" | "javascript";
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function MonacoEditor({ language, value, onChange, readOnly = false }: MonacoEditorProps) {
  const monaco = useMonaco();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason && 
        (event.reason.name === "Canceled" || 
         event.reason.message === "operation is manually canceled" || 
         event.reason.type === "cancelation")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("codeRoomTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", background: "0f172a" } // slate-900 background
        ],
        colors: {
          "editor.background": "#0f172a", // Match app background
          "editor.lineHighlightBackground": "#1e293b",
          "editorCursor.foreground": "#38bdf8", // Sky blue cursor
          "editorLineNumber.foreground": "#475569", // slate-600
        },
      });
      monaco.editor.setTheme("codeRoomTheme");
    }
  }, [monaco]);

  return (
    <div className="w-full h-full relative">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme="codeRoomTheme"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          fontLigatures: true,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          scrollBeyondLastLine: false,
          readOnly: readOnly,
        }}
        loading={
          <div className="flex items-center justify-center h-full w-full bg-slate-900 text-sky-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        }
      />
    </div>
  );
}
