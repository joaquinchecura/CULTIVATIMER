import React from "react";
import { Timer, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function BottomNav({ activeTab, onTabChange }) {
  const { t } = useApp();
  const tabs = [
    { id: "timer", label: t("nav_timer"), icon: Timer },
    { id: "settings", label: t("nav_settings"), icon: SlidersHorizontal },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t"
      style={{ backgroundColor: "var(--app-nav-bg)", borderColor: "var(--app-nav-border)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] select-none transition-all"
            >
              <Icon
                className="w-6 h-6 transition-colors"
                style={{ color: isActive ? "var(--app-text)" : "var(--app-text-muted)" }}
              />
              <span
                className="text-xs font-medium transition-colors"
                style={{ color: isActive ? "var(--app-text)" : "var(--app-text-muted)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}