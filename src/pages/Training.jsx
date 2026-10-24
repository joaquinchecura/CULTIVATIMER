import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings2 } from "lucide-react";
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

  const getCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const volume = (appSettings?.volume ?? 100) / 100;
  const soundType = appSettings?.soundType ?? "beep";
  const soundEnabled = appSettings?.soundEnabled !== false;
  const isBreathingMode = appSettings?._mode === "breathing";

  const playTone = useCallback((freq, duration, gainPeak, type = "sine", startDelay = 0) => {
    if (!soundEnabled) return;
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
  }, [soundEnabled, volume]);

  // Singing bowl — soft meditation sound for breathing mode
  const playSingingBowl = useCallback((freq, duration, startDelay = 0) => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    const t = ctx.currentTime + startDelay;
    // Fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.frequency.value = freq;
    osc1.type = "sine";
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.5 * volume, t + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc1.start(t); osc1.stop(t + duration + 0.05);
    // 2nd harmonic (softer)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.frequency.value = freq * 2.75;
    osc2.type = "sine";
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.15 * volume, t + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.7);
    osc2.start(t); osc2.stop(t + duration + 0.05);
  }, [soundEnabled, volume]);

  const beep = useCallback((freq = 880, duration = 0.15, count = 1) => {
    if (!soundEnabled) return;

    // Breathing mode always uses soft singing bowl sounds
    if (isBreathingMode) {
      for (let i = 0; i < count; i++) {
        playSingingBowl(freq * 0.5, 2.5, i * 0.6);
      }
      return;
    }

    for (let i = 0; i < count; i++) {
      const delay = i * 0.25;
      if (soundType === "beep") {
        // Pro gym timer: sharp, loud, clear double-click
        playTone(1047, 0.12, 0.9, "sine", delay);
        playTone(1047, 0.08, 0.6, "sine", delay + 0.14);
      } else if (soundType === "bell") {
        // Boxing ring bell: rich, resonant
        playTone(freq, duration * 4, 0.85, "sine", delay);
        playTone(freq * 2.76, duration * 3, 0.3, "sine", delay);
        playTone(freq * 5.4, duration * 2, 0.12, "sine", delay);
        playTone(freq * 0.5, duration * 2, 0.2, "sine", delay);
      } else if (soundType === "digital") {
        // Strong digital blip
        playTone(freq * 1.2, 0.08, 0.9, "square", delay);
        playTone(freq * 0.8, 0.06, 0.5, "square", delay + 0.09);
        playTone(freq * 1.5, 0.05, 0.3, "square", delay + 0.15);
      } else if (soundType === "soft") {
        // Warm marimba-like tone
        playTone(freq * 0.75, duration * 3, 0.7, "triangle", delay);
        playTone(freq * 1.5, duration * 1.5, 0.2, "triangle", delay);
      }
    }
  }, [soundEnabled, soundType, isBreathingMode, playTone, playSingingBowl]);

  const buzzer = useCallback((type = null) => {
    const bType = type ?? appSettings?.buzzerType ?? "short";
    if (!soundEnabled || bType === "off") return;

    // Breathing mode: gentle bowl strike instead of buzzer
    if (isBreathingMode) {
      playSingingBowl(220, 3.5, 0);
      return;
    }

    if (bType === "short") {
      // Powerful gym buzzer
      playTone(180, 0.15, 1.0, "sawtooth", 0);
      playTone(160, 0.25, 0.8, "sawtooth", 0.12);
      playTone(140, 0.2, 0.6, "sawtooth", 0.3);
    } else if (bType === "countdown") {
      // 3 loud descending beeps like a pro timer
      playTone(880, 0.18, 0.95, "sine", 0);
      playTone(660, 0.18, 0.95, "sine", 0.22);
      playTone(440, 0.35, 1.0, "sine", 0.44);
    } else if (bType === "alarm") {
      // Intense siren
      for (let i = 0; i < 5; i++) {
        playTone(960, 0.12, 0.95, "sawtooth", i * 0.2);
        playTone(720, 0.12, 0.85, "sawtooth", i * 0.2 + 0.1);
      }
    }
  }, [soundEnabled, isBreathingMode, appSettings?.buzzerType, playTone, playSingingBowl]);

  // Tick: last 3 seconds countdown
  const tick = useCallback(() => {
    if (!soundEnabled) return;
    if (isBreathingMode) {
      // Very subtle soft tick for breathing
      playTone(528, 0.12, 0.25, "sine", 0);
    } else {
      // Loud clear tick
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

  return { beep, buzzer, tick, speak };
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

  // Timer state
  const [phase, setPhase] = useState("prepare");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.prepare);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const intervalRef = useRef(null);
  const { beep, buzzer, tick, speak } = useAudio({ ...appSettings, _mode: settings.mode });

  // Screen flash on phase change
  useEffect(() => {
    if (!hasStarted || !appSettings.screenFlashEnabled) return;
    if (appSettings.screenFlashWhen?.interval && (phase === "work" || phase === "rest")) {
      setScreenFlash(true);
      const t = setTimeout(() => setScreenFlash(false), 350);
      return () => clearTimeout(t);
    }
  }, [phase]);

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
  }, [phase, currentRound, settings, beep, buzzer, speak]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {advancePhase();return 0;}
        if (prev <= 4) tick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, advancePhase, tick, settings.mode]);

  const handleStart = () => {
    if (phase === "finished") {
      resetTimer();
      setTimeout(() => {setIsRunning(true);setHasStarted(true);}, 50);
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
      try {localStorage.setItem("timerPresetSettings", JSON.stringify(updated));} catch (_) {}
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
      {/* Screen flash overlay */}
      <AnimatePresence>
        {screenFlash &&
        <motion.div
          initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 bg-white z-40 pointer-events-none" />

        }
      </AnimatePresence>

      {/* Ambient background */}
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

      {/* Tab content */}
      <div className="relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
        {activeTab === "timer" &&
        <motion.div
          key="timer"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.25 }}
        >
        <div className="max-w-lg mx-auto px-5 py-8 pb-28">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="w-11 h-11" /> {/* spacer */}
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--app-text)" }}>{t("app_title")}</h1>
                {settings.mode !== "stopwatch" && settings.mode !== "breathing" &&
              <p className="mt-1 text-4xl font-mono" style={{ color: "var(--app-text-dim)" }}>
                    {totalMin}:{String(totalSec).padStart(2, "0")}
                  </p>
              }
              </div>
              <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)} className="text-2xl font-extrabold rounded-xl w-11 h-11 border flex items-center justify-center transition-all select-none" style={{ background: "var(--app-btn-bg)", borderColor: "var(--app-btn-border)", color: "var(--app-btn-text)" }}>
                <Settings2 className="w-5 h-5" />
              </motion.button>
            </div>

            <TimerDisplay
            timeLeft={timeLeft}
            totalTime={totalTime}
            phase={phase}
            currentRound={currentRound}
            totalRounds={settings.rounds}
            isRunning={isRunning}
            mode={settings.mode} />
          

            <TimerControls
            isRunning={isRunning}
            hasStarted={hasStarted}
            onStart={handleStart}
            onPause={() => setIsRunning(false)}
            onReset={() => resetTimer()}
            onSkip={handleSkip}
            phase={phase} />
          

            {!isRunning &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <TimerPresets onSelect={handlePresetSelect} activePreset={activePreset} savedSettings={presetSettings} />
              </motion.div>
          }

            <AnimatePresence>
              {showSettings && !isRunning &&
            <TimerSettings settings={settings} onUpdate={handleSettingsUpdate} disabled={isRunning} />
            }
            </AnimatePresence>

            <AnimatePresence>
              {phase === "finished" &&
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-8 text-center">
                  <div className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-2xl px-8 py-5">
                    <p className="text-lg font-bold" style={{ color: "var(--app-text)" }}>{t("workout_complete")}</p>
                    <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
                      {settings.rounds} {settings.rounds === 1 ? t("round_label") : t("rounds_label")} · {totalMin}:{String(totalSec).padStart(2, "0")} total
                    </p>
                  </div>
                </motion.div>
            }
            </AnimatePresence>
          </div>
        </motion.div>
        }

        {activeTab === "settings" &&
        <motion.div
          key="settings"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.25 }}
        >
          <SettingsPage settings={appSettings} onUpdate={setAppSettings} onBack={() => handleTabChange("timer")} />
        </motion.div>
        }
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>);

}
