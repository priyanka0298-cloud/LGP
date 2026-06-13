"use client";

import { useEffect, useRef } from "react";

interface Props {
  accentColor: string;
  theme: string;
}

export function AccentColorApplier({ accentColor, theme }: Props) {
  const didInit = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // Apply saved theme on first mount — direct DOM + localStorage so next-themes picks it up
    const nextThemesValue = theme === "auto" ? "system" : theme;
    const resolved = theme === "auto"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
    try { localStorage.setItem("theme", nextThemesValue); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
