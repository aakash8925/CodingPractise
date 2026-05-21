
"use client";
import { Hammer } from "lucide-react";
import { motion } from "framer-motion";

export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <motion.div 
        animate={{ rotate: [-10, 10, -10] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="p-6 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
      >
        <Hammer size={48} />
      </motion.div>
      <h1 className="text-3xl font-bold text-white tracking-tight">Under Construction</h1>
      <p className="text-slate-400 max-w-md">
        This specific dashboard view is scheduled to be built in the upcoming phases. Check back soon!
      </p>
    </div>
  );
}
