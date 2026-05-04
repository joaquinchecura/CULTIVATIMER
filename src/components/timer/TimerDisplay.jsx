import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/AppContext";

export default function TimerDisplay({
  timeLeft,
  totalTime,
  phase,
  currentRound,
  totalRounds,
  isRunning,
  mode = "timer"
}) {
  const progress = totalTime > 0 ? timeLeft / totalTime : 1;
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const { t } = useApp();
  const isBreathing = mode === "breathing";

  const phaseColors = {
    work: {
      stroke: isBreathing ? "#ef4444" : "#22c55e",
      glow: isBreathing ? "0 0 40px rgba(239,68,68,0.3)" : "0 0 40px rgba(34,197,94,0.3)",
      label: isBreathing ? t("phase_inhale") : t("phase_work"),
      bg: isBreathing ? "text-red-400" : "text-emerald-400"
    },
    hold1: {
      stroke: "#f97316",
      glow: "0 0 40px rgba(249,115,22,0.3)",
      label: t("phase_hold"),
      bg: "text-orange-400"
    },
    rest: {
      stroke: "#3b82f6",
      glow: "0 0 40px rgba(59,130,246,0.3)",
      label: isBreathing ? t("phase_exhale") : t("phase_rest"),
      bg: "text-blue-400"
    },
    hold2: {
      stroke: "#8b5cf6",
      glow: "0 0 40px rgba(139,92,246,0.3)",
      label: t("phase_hold"),
      bg: "text-violet-400"
    },
    prepare: { stroke: "#f59e0b", glow: "0 0 40px rgba(245,158,11,0.3)", label: t("phase_prepare"), bg: "text-amber-400" },
    finished: { stroke: "#a855f7", glow: "0 0 40px rgba(168,85,247,0.3)", label: t("phase_finished"), bg: "text-purple-400" }
  };

  const current = phaseColors[phase] || phaseColors.prepare;

  // Dots inside circle - up to 24 rounds, positioned around the ring interior
  const showDots = !isBreathing && totalRounds >= 1 && totalRounds <= 24;
  const dotRadius = 112; // inside the main ring (r=140)

  return (
    <div className="py-8 rounded-lg flex flex-col items-center justify-center">
      <div className="relative w-[340px] h-[340px] sm:w-[340px] sm:h-[340px]">

        {/* Progress ring SVG — clockwise direction via scaleX(-1) */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          viewBox="0 0 320 320">
          
          {/* Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8" />
          
          {/* Progress arc */}
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={current.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(${current.glow})` }}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }} />
          
        </svg>

        {/* Dots SVG — separate, no transform, so they appear in normal orientation */}
        {showDots &&
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 320 320">
          
            {Array.from({ length: totalRounds }, (_, i) => {
            const angle = 2 * Math.PI * i / totalRounds - Math.PI / 2;
            const cx = 160 + dotRadius * Math.cos(angle);
            const cy = 160 + dotRadius * Math.sin(angle);
            const isDone = i < currentRound;
            const isCurrent = i === currentRound && phase !== "finished";
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isCurrent ? 5 : 3.5}
                fill={
                isDone ?
                "#22c55e" :
                isCurrent ?
                "white" :
                "rgba(255,255,255,0.15)"
                }
                style={{ transition: "fill 0.3s, r 0.3s" }} />);


          })}
          </svg>
        }

        {/* Center content */}
        <div className="rounded-md absolute inset-0 flex flex-col items-center justify-center gap-1">
          
          <motion.span
            key={phase}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-amber-400 text-sm font-bold uppercase tracking-[0.3em] text-center">
            {current.label}
          </motion.span>

          <motion.div
            key={timeLeft}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center">
            <span className="text-[4rem] sm:text-[5rem] font-bold tracking-tight tabular-nums" style={{ color: "var(--app-text)" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </motion.div>

          {!isBreathing &&
            <p className="text-base font-medium text-center" style={{ color: "var(--app-text-muted)" }}>
              {t("round")} {Math.min(currentRound + 1, totalRounds)} {t("of")} {totalRounds}
            </p>
          }
        </div>
      </div>
    </div>);

}