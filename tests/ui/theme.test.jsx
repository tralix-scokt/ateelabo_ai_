import React from "react";
import { test, expect, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Settings from "../../src/pages/Settings";
import { applyTheme, readTheme, saveTheme, normalizeTheme, THEME_KEY } from "../../src/theme";

afterEach(() => { document.documentElement.removeAttribute("data-theme"); document.documentElement.removeAttribute("style"); });
test("invalid or corrupt preferences safely default to black", () => {
  localStorage.setItem(THEME_KEY, "not json");
  expect(readTheme()).toEqual({ preset: "black", accent: "#8b6dff" });
  expect(normalizeTheme({ preset: "__proto__", accent: "url(bad)" })).toEqual({ preset: "black", accent: "#8b6dff" });
});
test("white mode and custom accent persist and restore", () => {
  saveTheme({ preset: "white", accent: "#123456" });
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(document.documentElement.style.getPropertyValue("--accent")).toBe("#123456");
  document.documentElement.removeAttribute("data-theme");
  applyTheme(readTheme());
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(readTheme().accent).toBe("#123456");
});
test("settings offers live white, black and futuristic presets with custom glow", () => {
  render(<MemoryRouter><Settings /></MemoryRouter>);
  fireEvent.click(screen.getByRole("radio", { name: "Lunar white" }));
  expect(document.documentElement.dataset.theme).toBe("light");
  fireEvent.change(screen.getByLabelText("Custom accent color"), { target: { value: "#ff8800" } });
  expect(readTheme()).toEqual({ preset: "white", accent: "#ff8800" });
  fireEvent.click(screen.getByRole("radio", { name: "Aurora green" }));
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(readTheme().accent).toBe("#30d6a0");
  fireEvent.click(screen.getByRole("radio", { name: "Obsidian black" }));
  expect(readTheme().preset).toBe("black");
});
