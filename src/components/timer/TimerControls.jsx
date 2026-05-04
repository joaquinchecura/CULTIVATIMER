import React from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

export default function TimerControls({
  isRunning,
  hasStarted,
  onStart,
  onPause,
  onReset,
  onSkip,
  phase,
}) {
  return (
    <div className="flex items-center justify-center gap-5 select-none">
      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onReset}
        className="w-14 h-14 rounded-2xl border flex items-center justify-center transition-all select-none"
        style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)", userSelect: "none", WebkitUserSelect: "none" }}
      >
        <RotateCcw className="w-5 h-5" />
      </motion.button>

      {/* Play / Pause */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={isRunning ? onPause : onStart}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all select-none ${
          isRunning
            ? "bg-white/15 backdrop-blur-sm border border-white/20"
            : "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500"
        }`}
        style={
          !isRunning
            ? { boxShadow: "0 8px 32px rgba(34,197,94,0.3)", userSelect: "none", WebkitUserSelect: "none" }
            : { userSelect: "none", WebkitUserSelect: "none" }
        }
      >
        {isRunning ? (
          <Pause className="w-7 h-7" />
        ) : (
          <Play className="w-7 h-7 ml-1" />
        )}
      </motion.button>

      {/* Skip */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onSkip}
        disabled={phase === "finished" || !hasStarted}
        className="w-14 h-14 rounded-2xl border flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
        style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)", userSelect: "none", WebkitUserSelect: "none" }}
      >
        <SkipForward className="w-5 h-5" />
      </motion.button>
    </div>
  );
}