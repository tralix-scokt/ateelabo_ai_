export const THEME_KEY = "ateelabo_appearance";
export const presets = {
  black: { label: "Obsidian black", mode: "dark", accent: "#8b6dff" },
  white: { label: "Lunar white", mode: "light", accent: "#5744cc" },
  cyber: { label: "Cyber cyan", mode: "dark", accent: "#16bcd4" },
  violet: { label: "Nebula violet", mode: "dark", accent: "#be70ff" },
  emerald: { label: "Aurora green", mode: "dark", accent: "#30d6a0" },
};
export function normalizeTheme(value) {
  const preset = Object.hasOwn(presets, value?.preset) ? value.preset : "black";
  return { preset, accent: /^#[0-9a-f]{6}$/i.test(value?.accent) ? value.accent : presets[preset].accent };
}
export function readTheme() {
  try { return normalizeTheme(JSON.parse(localStorage.getItem(THEME_KEY))); }
  catch { return normalizeTheme(null); }
}
export function applyTheme(value) {
  const theme = normalizeTheme(value);
  const root = document.documentElement;
  root.dataset.theme = presets[theme.preset].mode;
  root.style.setProperty("--accent", theme.accent);
  root.style.colorScheme = presets[theme.preset].mode;
  return theme;
}
export function saveTheme(value) {
  const theme = applyTheme(value);
  try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch { /* usable without persistent storage */ }
  return theme;
}
