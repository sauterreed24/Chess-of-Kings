/** Dev-only diagnostics — stripped in production builds when `import.meta.env.DEV` is false. */
export function devWarn(message: string, detail?: unknown): void {
  if (!import.meta.env.DEV) return
  if (detail !== undefined) console.warn(`[Calculus of Kings] ${message}`, detail)
  else console.warn(`[Calculus of Kings] ${message}`)
}
