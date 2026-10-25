import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings2, Timer, SlidersHorizontal, Maximize, Minimize } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import TimerPresets from "@/components/timer/TimerPresets";
import TimerDisplay from "@/components/timer/TimerDisplay";
import TimerControls from "@/components/timer/TimerControls";
import TimerSettings from "@/components/timer/TimerSettings";
import SettingsPage from "@/components/timer/SettingsPage";
import BottomNav from "@/components/timer/BottomNav";

const DEFAULT_SETTINGS = { work: 30, rest: 15, rounds: 8, prepare: 5, mode: "timer" };

function useAudio(appSettings) {
  const audioCtxRef = useRef(null);
  const audioCache = useRef({}); // <--- La caché de MP3

  // 1. PRIMERO: Las variables de configuración
  const volume = (appSettings?.volume ?? 100) / 100;
  const soundType = appSettings?.soundType ?? "beep";
  const soundEnabled = appSettings?.soundEnabled !== false;
  const isBreathingMode = appSettings?._mode === "breathing";

  // 2. SEGUNDO: Funciones de bajo nivel (tone, bowl, mp3)
  const getCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = useCallback((freq, duration, gainPeak, type = "sine", startDelay = 0) => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      const t = ctx.currentTime + startDelay;
      gain.gain.setValueAtTime(gainPeak * volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch (e) {
      console.log("Audio error:", e);
    }
  }, [soundEnabled, volume]);

  const playSingingBowl = useCallback((freq, duration, startDelay = 0) => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const t = ctx.currentTime + startDelay;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.frequency.value = freq;
      osc1.type = "sine";
      gain1.gain.setValueAtTime(0, t);
      gain1.gain.linearRampToValueAtTime(0.5 * volume, t + 0.08);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc1.start(t); osc1.stop(t + duration + 0.05);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.frequency.value = freq * 2.75;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(0.15 * volume, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.7);
      osc2.start(t); osc2.stop(t + duration + 0.05);
    } catch (e) {
      console.log("Audio error:", e);
    }
  }, [soundEnabled, volume]);

  // NUEVA FUNCIÓN MP3 (Ya con soundEnabled disponible)
  const playMp3 = useCallback((filename) => {
    if (!soundEnabled) return;
    try {
      if (!audioCache.current[filename]) {
        audioCache.current[filename] = new Audio(`/sounds/${filename}`);
      }
      const sound = audioCache.current[filename];
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(e => console.log("MP3 play error:", e));
    } catch (e) {
      console.log("MP3 error:", e);
    }
  }, [soundEnabled, volume]);

  // 3. TERCERO: Funciones de alto nivel (beep, buzzer, tick, speak)
  const beep = useCallback((freq = 880, duration = 0.15, count = 1) => {
    if (!soundEnabled) return;

    // Si querés usar MP3 para "bell" o "alarm", descomentá esto:
    // if (soundType === "bell") { playMp3("bell.mp3"); return; }
    // if (soundType === "digital") { playMp3("beep.mp3"); return; }

    if (isBreathingMode) {
      for (let i = 0; i < count; i++) {
        playSingingBowl(freq * 0.5, 2.5, i * 0.6);
      }
      return;
    }
    for (let i = 0; i < count; i++) {
      const delay = i * 0.25;
      if (soundType === "beep") {
        playTone(1047, 0.12, 0.9, "sine", delay);
        playTone(1047, 0.08, 0.6, "sine", delay + 0.14);
      } else if (soundType === "bell") { playMp3("bell.mp3"); return;
      } else if (soundType === "digital") {
        playTone(freq * 1.2, 0.08, 0.9, "square", delay);
        playTone(freq * 0.8, 0.06, 0.5, "square", delay + 0.09);
        playTone(freq * 1.5, 0.05, 0.3, "square", delay + 0.15);
      } else if (soundType === "soft") {
        playTone(freq * 0.75, duration * 3, 0.7, "triangle", delay);
        playTone(freq * 1.5, duration * 1.5, 0.2, "triangle", delay);
      }
    }
  }, [soundEnabled, soundType, isBreathingMode, playTone, playSingingBowl, playMp3]);

  const buzzer = useCallback((type = null) => {
    const bType = type ?? appSettings?.buzzerType ?? "short";
    if (!soundEnabled || bType === "off") return;

    // Si querés usar MP3 para el buzzer, descomentá esto:
    // if (bType === "short") { playMp3("buzzer-short.mp3"); return; }
    // if (bType === "alarm") { playMp3("alarm.mp3"); return; }

    if (isBreathingMode) {
      playSingingBowl(220, 3.5, 0);
      return;
    }
    if (bType === "short") {
      playTone(180, 0.15, 1.0, "sawtooth", 0);
      playTone(160, 0.25, 0.8, "sawtooth", 0.12);
      playTone(140, 0.2, 0.6, "sawtooth", 0.3);
    } else if (bType === "countdown") {
      playTone(880, 0.18, 0.95, "sine", 0);
      playTone(660, 0.18, 0.95, "sine", 0.22);
      playTone(440, 0.35, 1.0, "sine", 0.44);
    } else if (bType === "alarm") { playMp3("alarm.mp3"); return;
    }
  }, [soundEnabled, isBreathingMode, appSettings?.buzzerType, playTone, playSingingBowl, playMp3]);

  const tick = useCallback(() => {
    if (!soundEnabled) return;
    if (isBreathingMode) {
      playTone(528, 0.12, 0.25, "sine", 0);
    } else {
      playTone(1200, 0.07, 0.85, "sine", 0);
      playTone(1200, 0.05, 0.5, "sine", 0.08);
    }
  }, [soundEnabled, isBreathingMode, playTone]);

  const speak = useCallback((text) => {
    if (!appSettings?.voiceEnabled) return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = appSettings?.voiceLang === "English" ? "en-US" : "es-ES";
    utter.volume = volume;
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }, [appSettings?.voiceEnabled, appSettings?.voiceLang, volume]);

  // 4. Retornamos todo
  return { beep, buzzer, tick, speak, playMp3 };
}

export default function Training() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();
  const activeTab = location.pathname === "/settings" ? "settings" : "timer";

  const handleTabChange = (tab) => {
    navigate(tab === "settings" ? "/settings" : "/");
  };

  const [settings, setSettings] = useState(() => {
    try {
      const savedPresetName = localStorage.getItem("activePreset");
      const savedPresets = localStorage.getItem("timerPresetSettings");
      if (savedPresetName && savedPresets) {
        const parsed = JSON.parse(savedPresets);
        if (parsed[savedPresetName]) return parsed[savedPresetName];
      }
    } catch (_) {}
    return DEFAULT_SETTINGS;
  });

  const [presetSettings, setPresetSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("timerPresetSettings");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      "Intervalos": { work: 20, rest: 10, rounds: 8, prepare: 5, mode: "timer" },
      "HIIT": { work: 30, rest: 30, rounds: 16, prepare: 5, mode: "timer" },
      "Cuenta Regresiva": { work: 60, rest: 0, rounds: 12, prepare: 0, mode: "stopwatch" },
      "Respiración": { work: 4, hold1: 4, rest: 4, hold2: 4, rounds: 10, prepare: 0, mode: "breathing" }
    };
  });

  const [activePreset, setActivePreset] = useState(() => {
    try { return localStorage.getItem("activePreset") || null; } catch { return null; }
  });
  
  const [activePresetName, setActivePresetName] = useState(() => {
    try { return localStorage.getItem("activePreset") || null; } catch { return null; }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log("Error al intentar pantalla completa:", err);
      });
      setIsFocusMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFocusMode(false);
      }
    }
  };

  const [appSettings, setAppSettings] = useState({
    voiceEnabled: false,
    voiceLang: "Español",
    soundEnabled: true,
    soundType: "beep",
    buzzerType: "short",
    volume: 100,
    screenFlashEnabled: false,
    screenFlashWhen: { interval: true, countdown: false }
  });

  const [phase, setPhase] = useState("prepare");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.prepare);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const intervalRef = useRef(null);
  const { beep, buzzer, tick, speak } = useAudio({ ...appSettings, _mode: settings.mode });

  useEffect(() => {
    if (!hasStarted || !appSettings?.screenFlashEnabled) return;
    if (appSettings.screenFlashWhen?.interval && (phase === "work" || phase === "rest")) {
      setScreenFlash(true);
      const t = setTimeout(() => setScreenFlash(false), 350);
      return () => clearTimeout(t);
    }
  }, [phase, hasStarted, appSettings?.screenFlashEnabled, appSettings.screenFlashWhen]);

  // Actualizar el título de la pestaña con el tiempo restante
  useEffect(() => {
    if (isRunning) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.title = `⏱ ${mins}:${String(secs).padStart(2, "0")} - ${t(`phase_${phase}`) || phase}`;
    } else if (phase === "finished") {
      document.title = "✅ ¡Completado! - Cultiva Timer";
    } else {
      document.title = "Cultiva Timer";
    }
    
    // Cleanup: volver al título original si se desmonta
    return () => { document.title = "Cultiva Timer"; };
  }, [timeLeft, isRunning, phase, t]);

  const totalTime =
    phase === "prepare" ? settings.prepare :
    phase === "work" ? settings.work :
    phase === "hold1" ? settings.hold1 ?? 4 :
    phase === "rest" ? settings.rest :
    phase === "hold2" ? settings.hold2 ?? 4 :
    0;

  const handlePresetSelect = (preset) => {
    if (isRunning) return;
    const savedSettings = presetSettings[preset.name] || {
      work: preset.work,
      rest: preset.rest,
      rounds: preset.rounds,
      prepare: preset.mode === "breathing" || preset.mode === "stopwatch" ? 0 : 5,
      mode: preset.mode
    };
    setSettings(savedSettings);
    setActivePreset(preset.name);
    setActivePresetName(preset.name);
    try { localStorage.setItem("activePreset", preset.name); } catch (_) {}
    resetTimer(savedSettings);
  };

  const resetTimer = useCallback(
    (s = settings) => {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setHasStarted(false);
      if (s.mode === "breathing") {
        setPhase("work");
        setTimeLeft(s.work);
      } else {
        setPhase(s.prepare > 0 ? "prepare" : "work");
        setTimeLeft(s.prepare > 0 ? s.prepare : s.work);
      }
      setCurrentRound(0);
    },
    [settings]
  );

  const advancePhase = useCallback(() => {
    const isBreathing = settings.mode === "breathing";

    if (phase === "prepare") {
      setPhase("work");
      setTimeLeft(settings.work);
      beep(1200, 0.2, 2);
      speak(isBreathing ? t("voice_inhale") : t("voice_start"));
    } else if (phase === "work") {
      if (isBreathing) {
        const hold1 = settings.hold1 ?? 4;
        if (hold1 > 0) {
          setPhase("hold1");
          setTimeLeft(hold1);
          beep(600, 0.15, 1);
          speak(t("voice_hold"));
        } else {
          setPhase("rest");
          setTimeLeft(settings.rest);
          buzzer();
          speak(t("voice_exhale"));
        }
      } else if (currentRound + 1 >= settings.rounds) {
        setPhase("finished");
        setTimeLeft(0);
        setIsRunning(false);
        buzzer();
        speak(t("voice_complete"));
      } else {
        if (settings.mode === "stopwatch") {
          setCurrentRound((r) => r + 1);
          setPhase("work");
          setTimeLeft(settings.work);
          buzzer();
          speak(t("voice_next_round"));
        } else {
          setPhase("rest");
          setTimeLeft(settings.rest);
          buzzer();
          speak(t("voice_rest"));
        }
      }
    } else if (phase === "hold1") {
      setPhase("rest");
      setTimeLeft(settings.rest);
      beep(440, 0.2, 1);
      speak(t("voice_exhale"));
    } else if (phase === "rest") {
      if (isBreathing) {
        const hold2 = settings.hold2 ?? 4;
        if (hold2 > 0) {
          setPhase("hold2");
          setTimeLeft(hold2);
          beep(600, 0.15, 1);
          speak(t("voice_hold"));
        } else {
          if (currentRound + 1 >= settings.rounds) {
            setPhase("finished");
            setTimeLeft(0);
            setIsRunning(false);
            buzzer();
            speak(t("voice_session_complete"));
          } else {
            setCurrentRound((r) => r + 1);
            setPhase("work");
            setTimeLeft(settings.work);
            beep(1200, 0.2, 2);
            speak(t("voice_inhale"));
          }
        }
      } else {
        setCurrentRound((r) => r + 1);
        setPhase("work");
        setTimeLeft(settings.work);
        beep(1200, 0.2, 2);
        speak(t("voice_work"));
      }
    } else if (phase === "hold2") {
      if (currentRound + 1 >= settings.rounds) {
        setPhase("finished");
        setTimeLeft(0);
        setIsRunning(false);
        buzzer();
        speak(t("voice_session_complete"));
      } else {
        setCurrentRound((r) => r + 1);
        setPhase("work");
        setTimeLeft(settings.work);
        beep(1200, 0.2, 2);
        speak(t("voice_inhale"));
      }
    }
  }, [phase, currentRound, settings, beep, buzzer, speak, t]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { advancePhase(); return 0; }
        if (prev <= 4) tick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, advancePhase, tick, settings.mode]);
  
  const handleStart = () => {
    // Desbloquear el AudioContext en móviles al primer toque
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
    }
    
    if (phase === "finished") {
      resetTimer(settings);
      setIsRunning(true);
      setHasStarted(true);
      return;
    }
    setIsRunning(true);
    setHasStarted(true);
  };

  const handleSkip = () => {
    if (phase === "finished") return;
    advancePhase();
  };

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
    if (activePresetName) {
      const updated = { ...presetSettings, [activePresetName]: newSettings };
      setPresetSettings(updated);
      try { localStorage.setItem("timerPresetSettings", JSON.stringify(updated)); } catch (_) {}
    }
    resetTimer(newSettings);
  };

  const totalWorkoutTime = settings.mode === "stopwatch" ? 0 :
    settings.mode === "breathing" ?
    settings.rounds * (settings.work + (settings.hold1 ?? 4) + settings.rest + (settings.hold2 ?? 4)) :
    settings.prepare + settings.rounds * settings.work + (settings.rounds - 1) * settings.rest;
    
  const totalMin = Math.floor(totalWorkoutTime / 60);
  const totalSec = totalWorkoutTime % 60;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)", paddingTop: "env(safe-area-inset-top)" }}>
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-white z-40 pointer-events-none" />
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-20 transition-all duration-1000 ${
          phase === "work" ? "bg-emerald-500" :
          phase === "hold1" ? "bg-orange-500" :
          phase === "rest" ? "bg-blue-500" :
          phase === "hold2" ? "bg-violet-500" :
          phase === "finished" ? "bg-purple-500" :
          "bg-amber-500"}`
        } />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
        {activeTab === "timer" && (
          <motion.div
            key="timer"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-full"
          >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-0 pb-28 lg:h-[calc(100vh-80px)] lg:flex lg:items-center">
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                
                {/* COLUMNA IZQUIERDA (Timer) */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                  
                  {/* Botón de Pantalla Completa (Solo Desktop) - AHORA BIEN UBICADO */}
                  <button
                    onClick={toggleFocusMode}
                    className="hidden lg:flex absolute top-0 left-0 w-12 h-12 rounded-xl border items-center justify-center transition-all select-none opacity-50 hover:opacity-100 z-20"
                    style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}
                    title="Pantalla Completa"
                  >
                    {isFocusMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>

                  {/* Header Móvil (Oculto en Desktop) */}
                  <div className="w-full flex items-center justify-between mb-4 lg:hidden">
                    <div className="w-10" />
                    <div className="text-center flex-1">
                      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>{t("app_title")}</h1>
                      {settings.mode !== "stopwatch" && settings.mode !== "breathing" && (
                        <p className="text-xl font-mono" style={{ color: "var(--app-text-dim)" }}>
                          {totalMin}:{String(totalSec).padStart(2, "0")}
                        </p>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSettings(!showSettings)} 
                      className="rounded-xl w-10 h-10 border flex items-center justify-center transition-all select-none" 
                      style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}
                    >
                      <Settings2 className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="w-full flex justify-center mt-4 lg:mt-0">
                    <TimerDisplay
                      timeLeft={timeLeft}
                      totalTime={totalTime}
                      phase={phase}
                      currentRound={currentRound}
                      totalRounds={settings.rounds}
                      isRunning={isRunning}
                      mode={settings.mode} 
                    />
                  </div>

                  <div className="mt-8 w-full flex justify-center">
                    <TimerControls
                      isRunning={isRunning}
                      hasStarted={hasStarted}
                      onStart={handleStart}
                      onPause={() => setIsRunning(false)}
                      onReset={() => resetTimer()}
                      onSkip={handleSkip}
                      phase={phase} 
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA (Config & Presets) */}
                <div className="lg:col-span-5 flex flex-col relative w-full">
                  
                  {/* Header Desktop */}
                  <div className="hidden lg:flex flex-col mb-6 w-full border-b pb-4" style={{ borderColor: "var(--app-border)" }}>
                    <div className="flex items-center justify-between w-full mb-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>{t("app_title")}</h1>
                        {settings.mode !== "stopwatch" && settings.mode !== "breathing" && (
                          <p className="text-lg font-mono" style={{ color: "var(--app-text-dim)" }}>
                            Total: {totalMin}:{String(totalSec).padStart(2, "0")}
                          </p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSettings(!showSettings)} 
                        className="rounded-xl w-12 h-12 border flex items-center justify-center transition-all select-none" 
                        style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}
                      >
                        <Settings2 className="w-6 h-6" />
                      </motion.button>
                    </div>
                    
                    <div className="flex gap-2">
                      {[
                        { id: "timer", label: t("nav_timer"), icon: Timer },
                        { id: "settings", label: t("nav_settings"), icon: SlidersHorizontal },
                      ].map(({ id, label, icon: Icon }) => {
                        const isActive = activeTab === id;
                        return (
                          <button
                            key={id}
                            onClick={() => handleTabChange(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isActive 
                                ? "bg-white/10 text-white" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 lg:overflow-y-auto lg:pr-2 lg:max-h-[calc(100vh-200px)] scrollbar-hide space-y-6">
                    {!isRunning && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <TimerPresets onSelect={handlePresetSelect} activePreset={activePreset} savedSettings={presetSettings} />
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {showSettings && !isRunning && (
                        <TimerSettings settings={settings} onUpdate={handleSettingsUpdate} disabled={isRunning} />
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {phase === "finished" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center">
                          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-2xl px-6 py-5 w-full">
                            <p className="text-lg font-bold" style={{ color: "var(--app-text)" }}>{t("workout_complete")}</p>
                            <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                              {settings.rounds} {settings.rounds === 1 ? t("round_label") : t("rounds_label")} · {totalMin}:{String(totalSec).padStart(2, "0")} total
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="w-full"
          >
            <SettingsPage 
              settings={appSettings || {}} 
              onUpdate={setAppSettings} 
              onBack={() => handleTabChange("timer")} 
            />
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}