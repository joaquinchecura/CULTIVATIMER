import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // Ajustamos el radio dinámicamente (más grande en desktop)
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const { t } = useApp();
  const isBreathing = mode === "breathing";

  const phaseColors = {
    work: { stroke: isBreathing ? "#ef4444" : "#22c55e", glow: isBreathing ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)", label: isBreathing ? t("phase_inhale") : t("phase_work"), text: isBreathing ? "text-red-400" : "text-emerald-400" },
    hold1: { stroke: "#f97316", glow: "rgba(249,115,22,0.4)", label: t("phase_hold"), text: "text-orange-400" },
    rest: { stroke: "#3b82f6", glow: "rgba(59,130,246,0.4)", label: isBreathing ? t("phase_exhale") : t("phase_rest"), text: "text-blue-400" },
    hold2: { stroke: "#8b5cf6", glow: "rgba(139,92,246,0.4)", label: t("phase_hold"), text: "text-violet-400" },
    prepare: { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: t("phase_prepare"), text: "text-amber-400" },
    finished: { stroke: "#a855f7", glow: "rgba(168,85,247,0.4)", label: t("phase_finished"), text: "text-purple-400" }
  };

  const current = phaseColors[phase] || phaseColors.prepare;

  // Dots internos
  const showDots = !isBreathing && totalRounds >= 1 && totalRounds <= 24;
  const dotRadius = 115; 

  return (
    <div className="relative flex items-center justify-center py-4 lg:py-0">
      {/* Contenedor responsivo: 280px en móvil, 400px en desktop */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px]">
        
        {/* Anillo de progreso SVG */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
          {/* Track de fondo */}
          <circle cx="160" cy="160" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
          
          {/* Anillo de progreso con glow */}
          <motion.circle
            cx="160" cy="160" r={radius} fill="none"
            stroke={current.stroke} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 20px ${current.glow})` }}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>

        {/* Dots de rondas */}
        {showDots && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
            {Array.from({ length: totalRounds }, (_, i) => {
              const angle = (2 * Math.PI * i) / totalRounds - Math.PI / 2;
              const cx = 160 + dotRadius * Math.cos(angle);
              const cy = 160 + dotRadius * Math.sin(angle);
              const isDone = i < currentRound;
              const isCurrent = i === currentRound && phase !== "finished";
              return (
                <circle
                  key={i} cx={cx} cy={cy}
                  r={isCurrent ? 6 : 4}
                  fill={isDone ? "#22c55e" : isCurrent ? "white" : "rgba(255,255,255,0.1)"}
                  style={{ transition: "fill 0.3s, r 0.3s" }}
                />
              );
            })}
          </svg>
        )}

        {/* Contenido Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className={`${current.text} text-sm lg:text-base font-bold uppercase tracking-[0.3em] mb-1 lg:mb-2`}
            >
              {current.label}
            </motion.span>
          </AnimatePresence>

          <motion.div
            key={timeLeft}
            initial={{ scale: 1.02, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-center"
          >
            <span className="text-[4.5rem] sm:text-[5.5rem] lg:text-[7rem] font-bold tracking-tighter tabular-nums leading-none" style={{ color: "var(--app-text)", fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </motion.div>

          {!isBreathing && (
            <p className="text-sm lg:text-base font-medium mt-2 lg:mt-4" style={{ color: "var(--app-text-muted)" }}>
              {t("round")} {Math.min(currentRound + 1, totalRounds)} {t("of")} {totalRounds}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}