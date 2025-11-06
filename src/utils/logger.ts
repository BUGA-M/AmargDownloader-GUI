// src/utils/consoleRedirect.ts
import { invoke } from "@tauri-apps/api/core";

// == Redirige les console.* vers le backend Rust ==
 
export function setupConsoleRedirect() {
  // correspondance exacte avec ton enum Rust
  const levels = ["Trace", "Debug", "Info", "Warn", "Error"] as const;

  // mapping entre console.* et ton enum
  const consoleMap: Record<string, typeof levels[number]> = {
    log: "Info",
    info: "Info",
    warn: "Warn",
    error: "Error",
    debug: "Debug",
  };

  for (const [method, rustLevel] of Object.entries(consoleMap)) {
    const original = (console as any)[method].bind(console);

    (console as any)[method] = (...args: any[]) => {
      const message = args.map(String).join(" ");
      invoke("frontend_log", { level: rustLevel, message }).catch(console.error);
      original(...args);
    };
  }

  console.info("{29.logger.ts} ✅ Console redirection initialized");
}
