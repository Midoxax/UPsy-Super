import { useEffect, useState, useCallback } from "react";

export type ActiveView = "auto" | "admin" | "specialist" | "client" | "organization";

const KEY = "upsy.activeView";

const read = (): ActiveView => {
  if (typeof window === "undefined") return "auto";
  const v = window.localStorage.getItem(KEY) as ActiveView | null;
  return v ?? "auto";
};

export const useActiveView = () => {
  const [activeView, setActive] = useState<ActiveView>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setActive(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setActiveView = useCallback((v: ActiveView) => {
    if (v === "auto") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, v);
    setActive(v);
  }, []);

  return { activeView, setActiveView };
};