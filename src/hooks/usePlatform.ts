import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { getOSPlatform } from "../lib/platform";

export function usePlatform() {
  const { setPlatform, platform, theme } = useAppStore();

  useEffect(() => {
    const os = getOSPlatform();
    setPlatform(os);

    const root = document.documentElement;
    root.classList.remove("platform-macos", "platform-windows");
    if (os === "macos") {
      root.classList.add("platform-macos");
    } else if (os === "windows") {
      root.classList.add("platform-windows");
    }
  }, [setPlatform]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.add("light");
    }
  }, [theme]);

  return platform;
}
