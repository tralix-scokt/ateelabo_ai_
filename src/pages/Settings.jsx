import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Settings() {

  
const [saveHistory, setSaveHistory] = useState(
  localStorage.getItem("ateelabo_save_history") !== "false"
);
  const [enterToSend, setEnterToSend] = useState(localStorage.getItem("ateelabo_enter_to_send") !== "false");


  return (
    <div className="min-h-screen bg-[#070a12] text-white px-4 py-8 sm:px-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl"
      >

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-400"
          >
            ← Back to Chat
          </Link>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 text-gray-400">
            Customize your Ateelabo AI experience.
          </p>
        </div>

        {/* Appearance */}
        <motion.div
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold">
            Appearance
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Customize how Ateelabo AI looks.
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="font-medium">
                Theme
              </p>

              <p className="text-sm text-gray-500">
                Dark theme (other themes are not yet supported)
              </p>
            </div>

            <select
  disabled
  value="dark"
  className="
    rounded-xl
    border
    border-white/10
    bg-zinc-900
    px-4
    py-2
    text-sm
    text-white
    outline-none
    transition
    focus:border-cyan-400/40
  "
>
  <option value="dark">🌑 Dark</option>
  <option value="light">☀️ Light</option>
  <option value="system">🌓 System</option>
</select>
          </div>
        </motion.div>

        {/* AI Assistant */}
        <motion.div
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold">
            AI Assistant
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Configure how your AI assistant behaves.
          </p>

          <div className="mt-5 space-y-5">

            {/* Assistant */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Assistant
                </p>

                <p className="text-sm text-gray-500">
                  Ateelabo AI
                </p>
              </div>

              <span className="rounded-xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                Active
              </span>
            </div>

            {/* Model */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Default Model
                </p>

                <p className="text-sm text-gray-500">
                  Provider models are configured by the server administrator
                </p>
              </div>

              <span className="text-sm text-gray-400">Server-managed (OpenAI with Gemini fallback)</span>
            </div>

            {/* Streaming */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  Streaming Responses
                </p>

                <p className="text-sm text-gray-500">
                  Responses are currently delivered when complete
                </p>
              </div>

              <span className="text-sm text-gray-400">Not available</span>
            </div>

          </div>
        </motion.div>

        {/* Chat */}
        <motion.div
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold">
            Chat
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Manage your conversation preferences.
          </p>

          <div className="mt-5 space-y-5">

            {/* Save history */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  Save Chat History
                </p>

                <p className="text-sm text-gray-500">
                  Save future changes on this browser; existing saved history is not erased
                </p>
              </div>

              <button
                onClick={() => {
  const newValue = !saveHistory;

  setSaveHistory(newValue);

  localStorage.setItem(
    "ateelabo_save_history",
    String(newValue)
  );
}}
                className={`relative h-7 w-12 rounded-full transition ${
                  saveHistory
                    ? "bg-cyan-500"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    saveHistory
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Enter to send */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">
                  Enter to Send
                </p>

                <p className="text-sm text-gray-500">
                  Press Enter to send your message
                </p>
              </div>

              <button
                onClick={() => { localStorage.setItem("ateelabo_enter_to_send", String(!enterToSend)); setEnterToSend(!enterToSend); }}
                className={`relative h-7 w-12 rounded-full transition ${
                  enterToSend
                    ? "bg-cyan-500"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    enterToSend
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

          </div>
        </motion.div>

        {localStorage.getItem("ateelabo_chats") && (
          <div className="mb-5 rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold">Legacy chat backup</h2>
            <p className="my-3 text-sm text-gray-400">Older chats were not tied to an account. They remain untouched and are not automatically assigned to anyone. Download them only on a browser you own.</p>
            <button onClick={() => {
              const url = URL.createObjectURL(new Blob([localStorage.getItem("ateelabo_chats")], { type: "application/json" }));
              const link = document.createElement("a"); link.href = url; link.download = "ateelabo-legacy-chats.json"; link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }} className="rounded-xl bg-cyan-700 px-4 py-2">Download legacy chats</button>
          </div>
        )}

        {/* Account */}
        <motion.div
          whileHover={{ y: -2 }}
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold">
            Account
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Manage your account.
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="font-medium">
                Current Plan
              </p>

              <p className="text-sm text-gray-500">
                 Ateelabo AI
              </p>
            </div>

            <span className="rounded-xl bg-zinc-800 px-4 py-2 text-sm">
              Free
            </span>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold">
            About Ateelabo AI
          </h2>

          <p className="mt-2 text-gray-400">
            Your Ideas, Our Intelligence.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Ask anything, build anything, solve anything.
            I'm here to help you turn your ideas into reality.
          </p>

          <div className="mt-5 text-xs text-gray-600">
            Ateelabo AI • Version 1.0.0
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}