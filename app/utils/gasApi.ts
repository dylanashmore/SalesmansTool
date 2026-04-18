import Constants from "expo-constants";
import { Platform } from "react-native";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeNativeOrigin() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const normalizedHost = hostUri.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return `http://${normalizedHost}`;
  }

  const linkingUri = Constants.linkingUri;
  const linkingMatch = linkingUri.match(/^(exp|exps):\/\/([^/]+)/);
  if (linkingMatch) {
    const protocol = linkingMatch[1] === "exps" ? "https" : "http";
    return `${protocol}://${linkingMatch[2]}`;
  }

  throw new Error("Gas API origin is unavailable in this environment.");
}

export function getGasApiUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${trimTrailingSlash(window.location.origin)}/api/gas`;
  }

  return `${trimTrailingSlash(normalizeNativeOrigin())}/api/gas`;
}