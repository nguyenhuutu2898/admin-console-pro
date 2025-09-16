import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface SettingsState {
  theme: Theme;
  isCompact: boolean;
  setTheme: (theme: Theme) => void;
  toggleCompact: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      isCompact: false,
      setTheme: (theme) => set({ theme }),
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),
    }),
    {
      name: "settings-storage",
    }
  )
);
