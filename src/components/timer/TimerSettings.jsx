import React from "react";
import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/AppContext";

function SettingRow({ label, value, unit, onChange, min = 1, max = 999, step = 1, formatValue }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium" style={{ color: "var(--app-text-dim)" }}>{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
          style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <span className="font-mono text-lg w-16 text-center tabular-nums" style={{ color: "var(--app-text)" }}>
          {formatValue ? formatValue(value) : value}
          <span className="text-xs ml-1" style={{ color: "var(--app-text-muted)" }}>{unit}</span>
        </span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all"
          style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

export default function TimerSettings({ settings, onUpdate, disabled }) {
  const { t } = useApp();
  if (disabled) return null;

  const isBreathing = settings.mode === "breathing";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-2xl p-5 mt-6"
      style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
    >
      <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--app-text-muted)" }}>
        {t("timer_config")}
      </p>
      <div className="divide-y" style={{ borderColor: "var(--app-border)" }}>
        <SettingRow
          label={isBreathing ? t("inhalation") : t("work_time")}
          value={settings.work}
          unit="s"
          onChange={(v) => onUpdate({ ...settings, work: v })}
          min={isBreathing ? 0 : 5}
          max={isBreathing ? 10 : 300}
          step={isBreathing ? 0.5 : 5}
          formatValue={isBreathing ? (v) => v.toFixed(1) : undefined}
        />
        {isBreathing && (
          <SettingRow
            label={t("hold_inhale")}
            value={settings.hold1 ?? 4}
            unit="s"
            onChange={(v) => onUpdate({ ...settings, hold1: v })}
            min={0}
            max={10}
            step={0.5}
            formatValue={(v) => v.toFixed(1)}
          />
        )}
        <SettingRow
          label={isBreathing ? t("exhalation") : t("rest_time")}
          value={settings.rest}
          unit="s"
          onChange={(v) => onUpdate({ ...settings, rest: v })}
          min={isBreathing ? 0 : 5}
          max={isBreathing ? 10 : 300}
          step={isBreathing ? 0.5 : 5}
          formatValue={isBreathing ? (v) => v.toFixed(1) : undefined}
        />
        {isBreathing && (
          <SettingRow
            label={t("hold_exhale")}
            value={settings.hold2 ?? 4}
            unit="s"
            onChange={(v) => onUpdate({ ...settings, hold2: v })}
            min={0}
            max={10}
            step={0.5}
            formatValue={(v) => v.toFixed(1)}
          />
        )}
        {!isBreathing && (
          <SettingRow
            label={t("rounds")}
            value={settings.rounds}
            unit="r"
            onChange={(v) => onUpdate({ ...settings, rounds: v })}
            min={1}
            max={50}
            step={1}
          />
        )}
        {!isBreathing && (
          <SettingRow
            label={t("prepare")}
            value={settings.prepare}
            unit="s"
            onChange={(v) => onUpdate({ ...settings, prepare: v })}
            min={0}
            max={30}
            step={5}
          />
        )}
      </div>
    </motion.div>
  );
}