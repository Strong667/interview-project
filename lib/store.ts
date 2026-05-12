"use client";

import { create } from "zustand";

type PrepState = {
  saved: string[];
  known: string[];
  theme: "light" | "dark";
  initializeTheme: () => void;
  toggleSaved: (id: string) => void;
  markKnown: (id: string, known: boolean) => void;
  setSaved: (ids: string[]) => void;
  setKnown: (ids: string[]) => void;
  toggleTheme: () => void;
};

export const usePrepStore = create<PrepState>((set) => ({
  saved: [],
  known: [],
  theme: "light",
  initializeTheme: () =>
    set(() => {
      const storedTheme = window.localStorage.getItem("theme");
      const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
      return { theme };
    }),
  toggleSaved: (id) =>
    set((state) => ({
      saved: state.saved.includes(id) ? state.saved.filter((item) => item !== id) : [...state.saved, id]
    })),
  markKnown: (id, known) =>
    set((state) => ({
      known: known ? [...new Set([...state.known, id])] : state.known.filter((item) => item !== id)
    })),
  setSaved: (ids) => set({ saved: ids }),
  setKnown: (ids) => set({ known: ids }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", theme === "dark");
      window.localStorage.setItem("theme", theme);
      return { theme };
    })
}));
