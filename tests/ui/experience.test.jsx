import React from "react";
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";
import Intro from "../../src/components/Intro";
vi.mock("react-speech-recognition", () => ({
  default: { startListening: vi.fn(), stopListening: vi.fn() },
  useSpeechRecognition: () => ({
    transcript: "",
    browserSupportsSpeechRecognition: false,
  }),
}));
test("cinematic intro exposes an accessible enter action", async () => {
  const enter = vi.fn();
  render(<Intro onEnter={enter} />);
  expect(screen.getByRole("heading", { name: "ATEELABO AI" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Enter the experience/ }));
  await waitFor(() => expect(enter).toHaveBeenCalledOnce());
});
test("regeneration replaces the last answer without duplicating the question", async () => {
  localStorage.setItem(
    "ateelabo_chats:guest",
    JSON.stringify([
      {
        id: "chat",
        title: "Conversation",
        messages: [
          { role: "user", text: "Original question" },
          { role: "ai", text: "Original answer" },
        ],
      },
    ]),
  );
  const mock = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Regenerated answer" }),
    });
  vi.stubGlobal("fetch", mock);
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByLabelText("Regenerate response"));
  await screen.findByText("Regenerated answer");
  expect(screen.queryByText("Original answer")).toBeNull();
  expect(screen.getAllByText("Original question")).toHaveLength(1);
  expect(mock.mock.calls[0][1].body.get("message")).toBe("Original question");
  expect(JSON.parse(mock.mock.calls[0][1].body.get("history"))).toEqual([]);
});
test("streamed response updates the chat and persists the completed answer", async () => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          'data: {"type":"delta","text":"Live "}\n\ndata: {"type":"delta","text":"answer"}\n\ndata: {"type":"done","reply":"Live answer"}\n\n',
        ),
      );
      controller.close();
    },
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/event-stream" }),
        body,
      }),
  );
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Message Ateelabo AI"), {
    target: { value: "Stream please" },
  });
  fireEvent.click(screen.getByLabelText("Send message"));
  await screen.findByText("Live answer");
  await waitFor(() =>
    expect(localStorage.getItem("ateelabo_chats:guest")).toContain(
      "Live answer",
    ),
  );
  expect(screen.getAllByText("Stream please").length).toBeGreaterThan(0);
});

test("stop cancels an outstanding request and restores the composer", async () => {
  let signal;
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          signal = options.signal;
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    ),
  );
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Message Ateelabo AI"), {
    target: { value: "Long task" },
  });
  fireEvent.click(screen.getByLabelText("Send message"));
  fireEvent.click(await screen.findByLabelText("Stop response"));
  await waitFor(() => expect(signal.aborted).toBe(true));
  await screen.findByLabelText("Send message");
});
test("interrupted streams retain partial output and show a recoverable error", async () => {
  const body = new ReadableStream({
    start(c) {
      c.enqueue(
        new TextEncoder().encode(
          'data: {"type":"delta","text":"Partial reply"}\n\n',
        ),
      );
      c.close();
    },
  });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "text/event-stream" }),
        body,
      }),
  );
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Message Ateelabo AI"), {
    target: { value: "Question" },
  });
  fireEvent.click(screen.getByLabelText("Send message"));
  await screen.findByText("Partial reply");
  await screen.findByText("Response interrupted. Please regenerate.");
  expect(screen.getByLabelText("Regenerate response")).toBeTruthy();
});
