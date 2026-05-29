export type OSPlatform = "macos" | "windows" | "unknown";

export function getOSPlatform(): OSPlatform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) {
    return "macos";
  }
  if (ua.includes("win")) {
    return "windows";
  }
  return "unknown";
}
