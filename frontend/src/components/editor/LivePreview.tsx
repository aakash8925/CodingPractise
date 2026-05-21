"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

export function LivePreview({ htmlCode, cssCode, jsCode }: LivePreviewProps) {
  const [srcDoc, setSrcDoc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Debounce rendering slightly for performance during rapid typing
    const timeout = setTimeout(() => {
      setIsLoading(true);
      const document = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              /* Base reset for preview */
              body { margin: 0; padding: 1rem; font-family: sans-serif; }
              ${cssCode}
            </style>
          </head>
          <body>
            ${htmlCode}
            <script>
              try {
                ${jsCode}
              } catch (err) {
                console.error("Sandbox Execution Error:", err);
              }
            </script>
          </body>
        </html>
      `;
      setSrcDoc(document);
    }, 400);

    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  return (
    <div className="w-full h-full relative bg-white rounded-lg overflow-hidden border border-slate-800">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm z-10 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 flex items-center gap-2 text-sky-400 shadow-xl">
            <Loader2 size={16} className="animate-spin" /> 
            <span className="text-xs font-semibold tracking-wider uppercase">Rendering</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        title="Live Code Preview"
        sandbox="allow-scripts allow-modals"
        className="w-full h-full border-none"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
