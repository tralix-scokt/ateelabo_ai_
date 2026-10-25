import ChatExperience from "./components/ChatExperience";
import { readEvents } from "../services/eventStream.js";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { readUser, historyKey, loadChats } from "./lib/storage";
import { useEffect, useState, useRef } from "react";

import AdminDashboard from "./pages/AdminDashboard";

const maxUploadMB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 10);

export default function App() {
  const location = useLocation();
  const [touchStartX, setTouchStartX] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => readUser());
  const storageKey = historyKey(currentUser);
  const [loadedKey, setLoadedKey] = useState(null);
  const requestRef = useRef(null);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === "ateelabo_user" || event.key === null)
        setCurrentUser(readUser());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const busyRef = useRef(false);

  useEffect(() => {
    setCurrentUser(readUser());
  }, [location.key]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
    } catch {
      alert("Logout failed. Please check your connection and try again.");
      return;
    }
    localStorage.removeItem("ateelabo_user");
    localStorage.removeItem("ateelabo_token");
    requestRef.current?.abort();
    setCurrentUser(null);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0].clientX;

    const distance = touchStartX - touchEndX;

    if (distance > 80) {
      setSidebarOpen(false);
    }

    if (distance < -80) {
      setSidebarOpen(true);
    }

    setTouchStartX(null);
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) return;
    resetTranscript();
    Promise.resolve(SpeechRecognition.startListening({ continuous: true })).catch(() => {
      alert("Microphone access failed. Please check your browser permissions.");
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();

    setInput(transcript);
  };

  const reactToMessage = (chatId, messageIndex, reaction) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;

        const messages = [...chat.messages];

        messages[messageIndex] = {
          ...messages[messageIndex],
          reaction,
        };

        return {
          ...chat,
          messages,
        };
      }),
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    e.target.value = "";
    if (
      !/\.(pdf|docx)$/i.test(file.name) ||
      file.size > maxUploadMB * 1024 * 1024
    ) {
      alert(`Choose a PDF or DOCX file no larger than ${maxUploadMB} MB.`);
      return;
    }
    setUploadedFile(file);
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    const handleOpenSwipe = (e) => {
      if (e.touches[0].clientX < 30) {
        setTouchStartX(e.touches[0].clientX);
      }
    };

    window.addEventListener("touchstart", handleOpenSwipe);

    return () => {
      window.removeEventListener("touchstart", handleOpenSwipe);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      setSidebarWidth(Math.min(Math.max(e.clientX, 220), 500));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    requestRef.current?.abort();
    const saved = loadChats(storageKey);
    const initial = saved.length
      ? saved
      : [{ id: crypto.randomUUID(), title: "New Chat", messages: [] }];
    setChats(initial);
    setActiveChat(initial[0].id);
    setUploadedFile(null);
    setInput("");
    setLoadedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedKey !== storageKey || loading) return;
    try {
      if (localStorage.getItem("ateelabo_save_history") !== "false") {
        localStorage.setItem(storageKey, JSON.stringify(chats));
      }
    } catch {
      /* Storage may be full or unavailable; keep the current in-memory chat. */
    }
  }, [chats, loadedKey, storageKey, loading]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const createNewChat = () => {
    const id = crypto.randomUUID();

    const newChat = {
      id,
      title: "New Chat",
      pinned: false,
      createdAt: new Date().toISOString(),
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);

    setActiveChat(id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats]);

  const deleteChat = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to Delete this chat?",
    );

    if (!confirmed) return;

    const updated = chats.filter((chat) => chat.id !== id);

    setChats(updated);

    if (id === activeChat) {
      if (updated.length) setActiveChat(updated[0].id);
      else {
        const blank = {
          id: crypto.randomUUID(),
          title: "New Chat",
          messages: [],
        };
        setChats([blank]);
        setActiveChat(blank.id);
      }
    }
  };

  const renameChat = (chatId, newTitle) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: newTitle,
            }
          : chat,
      ),
    );
  };

  const currentChat = chats.find(
    (chat) => String(chat.id) === String(activeChat),
  );

  const sendMessage = async (retryIndex = null) => {
    const retry = Number.isInteger(retryIndex);
    const previous = retry
      ? currentChat?.messages
          .slice(0, retryIndex)
          .findLast((m) => m.role === "user")
      : null;
    const message = retry
      ? previous?.text || "Please analyze this document."
      : input;
    const baseMessages = retry
      ? currentChat.messages.slice(
          0,
          currentChat.messages
            .slice(0, retryIndex)
            .findLastIndex((m) => m.role === "user") + 1,
        )
      : currentChat?.messages || [];
    if (busyRef.current || (!message.trim() && !uploadedFile) || !currentChat)
      return;
    if (input.length > 10000) {
      alert("Message limit is 10,000 characters.");
      return;
    }
    busyRef.current = true;
    setLoading(true);
    const chatId = currentChat.id;
    const controller = new AbortController();
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 120000);
    const userMessage = {
      role: "user",
      text: message,
      time: new Date().toLocaleTimeString(),
      fileName: uploadedFile?.name || null,
    };
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: chat.messages.length
                ? chat.title
                : input.trim().slice(0, 25) || uploadedFile.name,
              messages: retry ? baseMessages : [...chat.messages, userMessage],
            }
          : chat,
      ),
    );
    if (!retry) {
      setInput("");
      setUploadedFile(null);
    }
    const appendReply = (text, isError = false, fileText) =>
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                ...(fileText ? { fileContext: fileText } : {}),
                messages: [
                  ...chat.messages,
                  {
                    role: "ai",
                    text,
                    isError,
                    time: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : chat,
        ),
      );
    try {
      const formData = new FormData();
      formData.append("message", message);
      if (uploadedFile && !retry) formData.append("file", uploadedFile);
      else if (currentChat.fileContext)
        formData.append("fileContext", currentChat.fileContext);
      let remaining = 40000;
      const history = [];
      const turns = retry
        ? baseMessages.slice(
            0,
            baseMessages.findLastIndex((m) => m.role === "user"),
          )
        : baseMessages;
      for (const item of turns
        .filter((item) => !item.isError)
        .slice(-20)
        .reverse()) {
        const content = item.text.slice(0, Math.min(10000, remaining));
        if (!content) break;
        history.unshift({
          role: item.role === "ai" ? "assistant" : "user",
          content,
        });
        remaining -= content.length;
      }
      formData.append("history", JSON.stringify(history));
      const token = localStorage.getItem("ateelabo_token");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
        signal: controller.signal,
      });
      if (
        response.ok &&
        response.headers?.get("content-type")?.includes("text/event-stream")
      ) {
        let accumulated = "";
        let started = false;
        let done = false;
        const update = (text, streaming, fileText) => {
          if (controller.signal.aborted) return;
          const replacing = started;
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    ...(fileText ? { fileContext: fileText } : {}),
                    messages: replacing
                      ? [
                          ...chat.messages.slice(0, -1),
                          {
                            role: "ai",
                            text,
                            streaming,
                            time: new Date().toLocaleTimeString(),
                          },
                        ]
                      : [...chat.messages, { role: "ai", text, streaming }],
                  }
                : chat,
            ),
          );
          started = true;
        };
        for await (const event of readEvents(response.body)) {
          if (event.type === "error") throw new Error(event.error);
          if (event.type === "delta") {
            accumulated += event.text;
            update(accumulated, true);
          }
          if (event.type === "done") {
            done = true;
            update(event.reply || accumulated, false, event.fileText);
          }
        }
        if (!done && !controller.signal.aborted)
          throw new Error("Response interrupted. Please regenerate.");
      } else {
        const data = await response.json();
        if (!response.ok || !data.reply)
          throw new Error(
            data.error || "Unable to get an AI response. Please try again.",
          );
        if (!controller.signal.aborted)
          appendReply(data.reply, false, data.fileText);
      }
    } catch (error) {
      if (timedOut) appendReply("Request timed out. Please try again.", true);
      else if (!controller.signal.aborted)
        appendReply(
          error.message || "Connection failed. Please try again.",
          true,
        );
    } finally {
      clearTimeout(timeout);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.streaming ? { ...m, streaming: false } : m,
                ),
              }
            : chat,
        ),
      );
      busyRef.current = false;
      setLoading(false);
    }
  };

  const togglePin = (id) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              pinned: !chat.pinned,
            }
          : chat,
      ),
    );
  };

  const filteredChats = chats
    .filter((chat) => chat.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <Routes>
      <Route path="/settings" element={<Settings />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route
        path="/"
        element={
          <ChatExperience
            chats={filteredChats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            currentChat={currentChat}
            currentUser={currentUser}
            input={input}
            setInput={setInput}
            loading={loading}
            sendMessage={() => sendMessage()}
            regenerate={(index) => sendMessage(index)}
            stopGeneration={() => requestRef.current?.abort()}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            handleFileUpload={handleFileUpload}
            handleLogout={handleLogout}
            createNewChat={createNewChat}
            deleteChat={deleteChat}
            renameChat={renameChat}
            togglePin={togglePin}
            search={search}
            setSearch={setSearch}
            sidebarWidth={sidebarWidth}
            setSidebarWidth={setSidebarWidth}
            setIsResizing={setIsResizing}
            handleTouchStart={handleTouchStart}
            handleTouchEnd={handleTouchEnd}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            messagesEndRef={messagesEndRef}
            browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
            listening={listening}
            startListening={startListening}
            stopListening={stopListening}
            speakText={speakText}
            reactToMessage={reactToMessage}
          />
        }
      />
      <Route
        path="*"
        element={
          <div className="p-8 text-white">
            Page not found. <Link to="/">Return to chat</Link>
          </div>
        }
      />
    </Routes>
  );
}
