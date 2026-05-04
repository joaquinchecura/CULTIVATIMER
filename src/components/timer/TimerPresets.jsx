import React from "react";
import { Repeat, Activity, Clock, Wind } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/AppContext";

const PRESET_DEFS = [
  { key: "preset_rounds", icon: Repeat, work: 20, rest: 10, rounds: 8, mode: "timer", color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { key: "preset_hiit", icon: Activity, work: 30, rest: 30, rounds: 16, mode: "timer", color: "from-rose-500 to-pink-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { key: "preset_countdown", icon: Clock, work: 60, rest: 0, rounds: 12, mode: "stopwatch", color: "from-cyan-500 to-blue-600", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { key: "preset_breathing", icon: Wind, work: 4, rest: 6, rounds: 10, mode: "breathing", color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", border: "border-violet-500/20" },
];

// Fixed Spanish names used as keys in savedSettings / activePreset (do not change)
const PRESET_FIXED_NAMES = ["Rondas", "HIIT", "Cuenta Regresiva", "Respiración"];

export default function TimerPresets({ onSelect, activePreset, savedSettings }) {
  const { t } = useApp();
  const presets = PRESET_DEFS.map((p, i) => ({ ...p, name: PRESET_FIXED_NAMES[i], label: t(p.key) }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {presets.map((preset, i) => {
        const Icon = preset.icon;
        const isActive = activePreset === preset.name;
        const s = (savedSettings && savedSettings[preset.name]) || preset;
        return (
          <motion.button
            key={preset.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(preset)}
            className={`relative group rounded-2xl border p-4 text-left transition-all duration-300 ${
              isActive
                ? `${preset.bg} ${preset.border} border-2 shadow-lg`
                : ""
            }`}
            style={!isActive ? { background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)" } : {}}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${preset.color}`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-sm" style={{ color: "var(--app-text)" }}>{preset.label}</p>
            <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
              {preset.mode === "stopwatch"
                ? `${s.work}s · ${s.rounds}r`
                : preset.mode === "breathing"
                ? `${s.work}s / ${s.hold1 ?? 4}s / ${s.rest}s / ${s.hold2 ?? 4}s`
                : `${s.work}s / ${s.rest}s · ${s.rounds}r`}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}