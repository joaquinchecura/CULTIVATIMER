import React, { useState, useRef } from "react";
import { Volume2, Bell, Monitor, Globe, Sun, Moon, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useApp } from "@/lib/AppContext";

const PULL_THRESHOLD = 72;

export default function SettingsPage({ settings = {}, onUpdate, onBack }) {
  const { lang, setLang, theme, setTheme, t } = useApp();
  
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const scrollRef = useRef(null);

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      setPullY(Math.min(dy * 0.5, PULL_THRESHOLD));
    }
  };

  const handleTouchEnd = () => {
    if (pullY >= PULL_THRESHOLD) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 800);
    }
    setPullY(0);
    touchStartY.current = null;
  };

  const updateSetting = (key, value) => {
    onUpdate({ ...settings, [key]: value });
  };

  const soundTypes = [
    { value: "beep", label: "Beep" },
    { value: "bell", label: "Bell" },
    { value: "digital", label: "Digital" },
    { value: "soft", label: t("soft") },
  ];

  const buzzerTypes = [
    { value: "off", label: t("buzzer_off") },
    { value: "short", label: t("buzzer_short") },
    { value: "countdown", label: t("buzzer_countdown") },
    { value: "alarm", label: t("buzzer_alarm") },
  ];

  const screenFlashWhen = [
    { value: "interval", label: t("flash_interval") },
    { value: "countdown", label: t("flash_countdown") },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--app-bg)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center pt-3"
            style={{ height: refreshing ? 44 : pullY }}
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: pullY * 3 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.6, ease: "linear" } : {}}
              className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={scrollRef} className="max-w-6xl mx-auto px-5 py-8 pb-28 lg:py-12">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all select-none"
              style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)", userSelect: "none", WebkitUserSelect: "none" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>{t("settings")}</h1>
        </div>

        {/* Grid de Configuración de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* ================= COLUMNA IZQUIERDA (App & Visual) ================= */}
          <div className="space-y-6">
            
            {/* Language */}
            <Section>
              <SettingHeader
                icon={<Globe className="w-5 h-5 text-sky-400" />}
                iconBg="bg-sky-500/10"
                title={t("language")}
                subtitle={t("language_subtitle")}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[{ value: "es", label: "Español" }, { value: "en", label: "English" }].map((l) => (
                  <button key={l.value} onClick={() => setLang(l.value)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold transition-all select-none ${lang === l.value ? "bg-sky-500/20 border-2 border-sky-500/50 text-sky-300" : "border"}`}
                    style={lang !== l.value ? { background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" } : {}}>
                    {l.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Theme */}
            <Section>
              <SettingHeader
                icon={theme === "dark" ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                iconBg={theme === "dark" ? "bg-indigo-500/10" : "bg-yellow-500/10"}
                title={t("theme")}
                subtitle={t("theme_subtitle")}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[{ value: "dark", label: t("theme_dark") }, { value: "light", label: t("theme_light") }].map((th) => (
                  <button key={th.value} onClick={() => setTheme(th.value)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold transition-all select-none ${theme === th.value ? "bg-indigo-500/20 border-2 border-indigo-500/50 text-indigo-300" : "border"}`}
                    style={theme !== th.value ? { background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" } : {}}>
                    {th.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Screen Flash */}
            <Section>
              <SettingHeader
                icon={<Monitor className="w-5 h-5 text-cyan-400" />}
                iconBg="bg-cyan-500/10"
                title={t("screen_flash")}
                subtitle={t("screen_flash_subtitle")}
                toggle={
                  <Switch
                    checked={settings?.screenFlashEnabled || false}
                    onCheckedChange={(v) => updateSetting("screenFlashEnabled", v)}
                  />
                }
              />
              <AnimatePresence>
                {settings?.screenFlashEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 overflow-hidden">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--app-text-muted)" }}>{t("activate_on")}</p>
                    <div className="space-y-2">
                      {screenFlashWhen.map((w) => (
                        <label key={w.value} className="flex items-center gap-3 min-h-[48px] p-3 rounded-xl border transition-all cursor-pointer select-none" style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}>
                          <Switch
                            checked={settings.screenFlashWhen?.[w.value] || false}
                            onCheckedChange={(v) => updateSetting("screenFlashWhen", { ...settings.screenFlashWhen, [w.value]: v })}
                          />
                          <span className="text-sm font-medium" style={{ color: "var(--app-text)" }}>{w.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

          </div>

          {/* ================= COLUMNA DERECHA (Audio) ================= */}
          <div className="space-y-6">
            
            {/* Sound */}
            <Section>
              <SettingHeader
                icon={<Volume2 className="w-5 h-5 text-emerald-400" />}
                iconBg="bg-emerald-500/10"
                title={t("sound")}
                subtitle={t("sound_subtitle")}
                toggle={
                  <Switch
                    checked={settings?.soundEnabled || false}
                    onCheckedChange={(v) => updateSetting("soundEnabled", v)}
                  />
                }
              />
              <AnimatePresence>
                {settings?.soundEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 overflow-hidden">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--app-text-muted)" }}>{t("sound_type")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {soundTypes.map((s) => (
                        <button key={s.value} onClick={() => updateSetting("soundType", s.value)}
                          className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold transition-all select-none ${settings.soundType === s.value ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300" : "border"}`}
                          style={settings.soundType !== s.value ? { background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" } : {}}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            {/* Buzzer */}
            <Section>
              <SettingHeader
                icon={<Bell className="w-5 h-5 text-amber-400" />}
                iconBg="bg-amber-500/10"
                title={t("buzzer")}
                subtitle={t("buzzer_subtitle")}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {buzzerTypes.map((b) => (
                  <button key={b.value} onClick={() => updateSetting("buzzerType", b.value)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-sm font-semibold transition-all select-none ${settings.buzzerType === b.value ? "bg-amber-500/20 border-2 border-amber-500/50 text-amber-300" : "border"}`}
                    style={settings.buzzerType !== b.value ? { background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" } : {}}>
                    {b.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Volume */}
            <Section>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Volume2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--app-text)" }}>{t("volume")}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>{t("volume_subtitle")}</p>
                </div>
                <span className="font-mono text-lg font-bold" style={{ color: "var(--app-text)" }}>{settings?.volume ?? 100}%</span>
              </div>
              <div className="mt-5">
                <Slider value={[settings?.volume ?? 100]} onValueChange={(v) => updateSetting("volume", v[0])} max={100} step={5} className="w-full" />
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function Section({ children }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>
      {children}
    </div>
  );
}

function SettingHeader({ icon, iconBg, title, subtitle, toggle }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--app-text)" }}>{title}</p>
          <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>{subtitle}</p>
        </div>
      </div>
      {toggle && <div>{toggle}</div>}
    </div>
  );
}