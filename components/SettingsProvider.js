"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const Ctx = createContext({ settings: DEFAULT_SETTINGS, loaded: false });

// Loads the admin-edited site settings once and shares them with every page.
export default function SettingsProvider({ children }) {
  const [state, setState] = useState({ settings: DEFAULT_SETTINGS, loaded: false });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setState({ settings: d.settings, loaded: true }))
      .catch(() => setState({ settings: DEFAULT_SETTINGS, loaded: true }));
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useSettings = () => useContext(Ctx);
