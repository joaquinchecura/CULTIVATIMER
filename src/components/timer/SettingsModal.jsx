import React from "react";
import { X, Volume2, Bell, Radio, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export default function SettingsModal({ isOpen, onClose, settings, onUpdate }) {
  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    onUpdate({ ...settings, [key]: value });
  };

  const soundTypes = [
    { value: "beep", label: "Beep" },
    { value: "bell", label: "Bell" },
    { value: "digital", label: "Digital" },
    { value: "soft", label: "Suave" },
  ];

  const buzzerTypes = [
    { value: "off", label: "OFF" },
    { value: "short", label: "Corto" },
    { value: "countdown", label: "Cuenta regresiva" },
    { value: "alarm", label: "Alarma" },
  ];

  const screenFlashWhen = [
    { value: "interval", label: "Fin de intervalo" },
    { value: "countdown", label: "Cuenta regresiva final" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-[#0f0f14] border border-white/10 rounded-3xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white text-xl font-bold">Configuración</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Voice Announcements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Anuncios de voz</p>
                      <p className="text-white/40 text-xs">Avisos por voz durante el timer</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.voiceEnabled}
                    onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
                  />
                </div>
                {settings.voiceEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-13 space-y-2"
                  >
                    <p className="text-white/50 text-xs font-medium">Idioma</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Español", "English"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => updateSetting("voiceLang", lang)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            settings.voiceLang === lang
                              ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sound */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Sonido</p>
                      <p className="text-white/40 text-xs">Sonidos generales del timer</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  />
                </div>
                {settings.soundEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-13 space-y-2"
                  >
                    <p className="text-white/50 text-xs font-medium">Tipo de sonido</p>
                    <div className="grid grid-cols-2 gap-2">
                      {soundTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => updateSetting("soundType", type.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            settings.soundType === type.value
                              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Buzzer */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Buzzer</p>
                    <p className="text-white/40 text-xs">Alertas en momentos clave</p>
                  </div>
                </div>
                <div className="ml-13 grid grid-cols-2 gap-2">
                  {buzzerTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateSetting("buzzerType", type.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.buzzerType === type.value
                          ? "bg-amber-500/20 border border-amber-500/30 text-amber-300"
                          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Volumen</p>
                    <p className="text-white/40 text-xs">Controla todos los sonidos</p>
                  </div>
                  <span className="text-white font-mono text-sm">{settings.volume}%</span>
                </div>
                <div className="ml-13">
                  <Slider
                    value={[settings.volume]}
                    onValueChange={(value) => updateSetting("volume", value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Screen Flash */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Destello de pantalla</p>
                      <p className="text-white/40 text-xs">Flash visual en la pantalla</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.screenFlashEnabled}
                    onCheckedChange={(checked) => updateSetting("screenFlashEnabled", checked)}
                  />
                </div>
                {settings.screenFlashEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-13 space-y-2"
                  >
                    <p className="text-white/50 text-xs font-medium">Activar en</p>
                    <div className="space-y-2">
                      {screenFlashWhen.map((when) => (
                        <label
                          key={when.value}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <Switch
                            checked={settings.screenFlashWhen?.[when.value] || false}
                            onCheckedChange={(checked) =>
                              updateSetting("screenFlashWhen", {
                                ...settings.screenFlashWhen,
                                [when.value]: checked,
                              })
                            }
                          />
                          <span className="text-white/80 text-sm">{when.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}