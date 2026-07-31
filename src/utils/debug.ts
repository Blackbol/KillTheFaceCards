// 📁 src/utils/debug.ts

/**
 * Utility for rich dev-mode debug logging.
 */
export function debugLog(tag: string, ...message: any[]) {
  if (import.meta.env.DEV) {
    console.log(`%c[DEBUG:${tag}]`, 'color: #f59e0b; font-weight: bold;', ...message);
  }
}

export function debugWarn(tag: string, ...message: any[]) {
  if (import.meta.env.DEV) {
    console.warn(`%c[DEBUG WARN:${tag}]`, 'color: #ef4444; font-weight: bold;', ...message);
  }
}
