import { motion } from "framer-motion";
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
import Sidebar from "./components/Sidebar";
import WelcomePage from "./components/WelcomePage";
import TypingIndicator from "./components/TypingIndicator";
import AdminDashboard from "./pages/AdminDashboard";



const maxUploadMB = Number(import.meta.env.VITE_MAX_UPLOAD_MB || 10);

export default function App() {

  const location = useLocation();
  const [touchStartX, setTouchStartX] =
  useState(null);
  const [chats,setChats] = useState([]);
  const [activeChat,setActiveChat] = useState(null);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [search,setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const [uploadedFile, setUploadedFile] =
  useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const selectedModel = "Ateelabo AI";

  const [currentUser, setCurrentUser] = useState(() => readUser());
  const storageKey = historyKey(currentUser);
  const [loadedKey, setLoadedKey] = useState(null);
  const requestRef = useRef(null);
  useEffect(() => {
    const sync = event => {
      if (event.key === "ateelabo_user" || event.key === null) setCurrentUser(readUser());
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
  } catch { alert("Logout failed. Please check your connection and try again."); return; }
  localStorage.removeItem("ateelabo_user");
  localStorage.removeItem("ateelabo_token");
  requestRef.current?.abort();
  setCurrentUser(null);
};

  const handleTouchStart = (e) => {
  setTouchStartX(
    e.touches[0].clientX
  );
};

const handleTouchEnd = (e) => {

  if (touchStartX === null) return;

  const touchEndX =
    e.changedTouches[0].clientX;

  const distance =
    touchStartX - touchEndX;

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
  resetTranscript,
  browserSupportsSpeechRecognition,
} = useSpeechRecognition();

const startListening = () => {
  if (!browserSupportsSpeechRecognition) return;
  resetTranscript();
  SpeechRecognition.startListening({
    continuous: true,
  });
};

const stopListening = () => {
  SpeechRecognition.stopListening();

  setInput(transcript);
};

const reactToMessage = (
  chatId,
  messageIndex,
  reaction
) => {

  setChats(prev =>
    prev.map(chat => {

      if(chat.id !== chatId)
        return chat;

      const messages =
        [...chat.messages];

      messages[messageIndex] = {
        ...messages[messageIndex],
        reaction
      };

      return {
        ...chat,
        messages
      };

    })
  );

};



const handleFileUpload = (e) => {

  const file = e.target.files[0];

  if (!file) return;

  e.target.value = "";
  if (!/\.(pdf|docx)$/i.test(file.name) || file.size > maxUploadMB * 1024 * 1024) {
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
      setTouchStartX(
        e.touches[0].clientX
      );
    }

  };

  window.addEventListener(
    "touchstart",
    handleOpenSwipe
  );

  return () => {

    window.removeEventListener(
      "touchstart",
      handleOpenSwipe
    );

  };

}, []);

useEffect(() => {
  const handleMouseMove = (e) => {
    if (!isResizing) return;

    setSidebarWidth(
      Math.min(
        Math.max(e.clientX, 220),
        500
      )
    );
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  window.addEventListener(
    "mousemove",
    handleMouseMove
  );
   
  window.addEventListener(
    "mouseup",
    handleMouseUp
  );

  return () => {
    window.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    window.removeEventListener(
      "mouseup",
      handleMouseUp
    );
  };
}, [isResizing]);

 useEffect(() => {
  requestRef.current?.abort();
  const saved = loadChats(storageKey);
  const initial = saved.length ? saved : [{ id: crypto.randomUUID(), title: "New Chat", messages: [] }];
  setChats(initial);
  setActiveChat(initial[0].id);
  setUploadedFile(null);
  setInput("");
  setLoadedKey(storageKey);
}, [storageKey]);

useEffect(() => {
  if (loadedKey !== storageKey) return;
  try {
    if (localStorage.getItem("ateelabo_save_history") !== "false") {
      localStorage.setItem(storageKey, JSON.stringify(chats));
    }
  } catch { /* Storage may be full or unavailable; keep the current in-memory chat. */ }
}, [chats, loadedKey, storageKey]);

useEffect(() => () => requestRef.current?.abort(), []);

 const createNewChat = () => {

  const id = crypto.randomUUID();

  const newChat = {
  id,
  title: "New Chat",
  pinned: false,
  createdAt: new Date().toISOString(),
  messages: []
};

  setChats(prev => [newChat, ...prev]);

  setActiveChat(id);
};

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [chats]);

 const deleteChat = (id) => {

  const confirmed =
    window.confirm(
      "Are you sure you want to Delete this chat?"
    );

  if (!confirmed) return;

  const updated =
    chats.filter(
      chat => chat.id !== id
    );

  setChats(updated);

  if (id === activeChat) {
    if (updated.length) setActiveChat(updated[0].id);
    else {
      const blank = { id: crypto.randomUUID(), title: "New Chat", messages: [] };
      setChats([blank]);
      setActiveChat(blank.id);
    }
  }
};


const renameChat = (chatId, newTitle) => {

  setChats(prevChats =>
    prevChats.map(chat =>
      chat.id === chatId
        ? {
            ...chat,
            title: newTitle
          }
        : chat
    )
  );

};

  const currentChat =
  chats.find(chat => String(chat.id) === String(activeChat));
  
  const sendMessage = async () => {
    if (busyRef.current || (!input.trim() && !uploadedFile) || !currentChat) return;
    if (input.length > 10000) { alert("Message limit is 10,000 characters."); return; }
    busyRef.current = true;
    setLoading(true);
    const chatId = currentChat.id;
    const controller = new AbortController();
    requestRef.current = controller;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 120000);
    const userMessage = { role: "user", text: input, time: new Date().toLocaleTimeString(), fileName: uploadedFile?.name || null };
    setChats(prev => prev.map(chat => chat.id === chatId ? {
      ...chat, title: chat.messages.length ? chat.title : (input.trim().slice(0, 25) || uploadedFile.name),
      messages: [...chat.messages, userMessage],
    } : chat));
    setInput("");
    setUploadedFile(null);
    const appendReply = (text, isError = false, fileText) => setChats(prev => prev.map(chat => chat.id === chatId ? {
      ...chat, ...(fileText ? { fileContext: fileText } : {}),
      messages: [...chat.messages, { role: "ai", text, isError, time: new Date().toLocaleTimeString() }],
    } : chat));
    try {
      const formData = new FormData();
      formData.append("message", input);
      if (uploadedFile) formData.append("file", uploadedFile);
      else if (currentChat.fileContext) formData.append("fileContext", currentChat.fileContext);
      let remaining = 40000;
      const history = [];
      for (const item of currentChat.messages.filter(item => !item.isError).slice(-20).reverse()) {
        const content = item.text.slice(0, Math.min(10000, remaining));
        if (!content) break;
        history.unshift({ role: item.role === "ai" ? "assistant" : "user", content });
        remaining -= content.length;
      }
      formData.append("history", JSON.stringify(history));
      const token = localStorage.getItem("ateelabo_token");
      const response = await fetch("/api/chat", {
        method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData, signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || "Unable to get an AI response. Please try again.");
      if (!controller.signal.aborted) appendReply(data.reply, false, data.fileText);
    } catch (error) {
      if (timedOut) appendReply("Request timed out. Please try again.", true);
      else if (!controller.signal.aborted) appendReply(error.message || "Connection failed. Please try again.", true);
    } finally {
      clearTimeout(timeout);
      busyRef.current = false;
      setLoading(false);
    }
  };

  const togglePin = (id) => {

  setChats(prev =>
    prev.map(chat =>
      chat.id === id
        ? {
            ...chat,
            pinned: !chat.pinned
          }
        : chat
    )
  );

};

 const filteredChats = chats
  .filter(chat =>
    chat.title
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .sort((a,b) =>
    Number(b.pinned) -
    Number(a.pinned)
  );

  return (
  <Routes>
  <Route path="/settings" element={<Settings />} />
  <Route path="/register" element={<Register />} />
    <Route path="/login" element={<Login />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/" element={

    
        <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
  
{currentUser && (
  <>
    {/* Admin Dashboard — visible only to admins */}
    {currentUser.role === "admin" && (
      <Link
        to="/admin"
        title="Admin Dashboard"
        aria-label="Admin Dashboard"
        className="
          fixed
          top-3
          right-16
          z-50
          w-10
          h-10
          rounded-full
          bg-violet-500/10
          border
          border-violet-400/30
          flex
          items-center
          justify-center
          text-violet-300
          hover:text-violet-200
          hover:border-violet-400/60
          hover:bg-violet-400/20
          transition
          shadow-lg
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </Link>
    )}

    {/* Existing Profile button */}
    <Link
      to="/profile"
      title="Profile"
      aria-label="Profile"
      className="
        fixed
        top-3
        right-4
        z-50
        w-10
        h-10
        rounded-full
        bg-cyan-500/10
        border
        border-white/10
        flex
        items-center
        justify-center
        text-gray-300
        hover:text-cyan-400
        hover:border-cyan-400/40
        hover:bg-cyan-400/10
        transition
        shadow-lg
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  </>
)}

      <div
      onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ width: sidebarWidth, maxWidth: "calc(100vw - 24px)" }}

  className={`
    fixed top-0 left-0 h-full z-50
   transition-all duration-500 ease-in-out
   backdrop-blur-md

    ${
      sidebarOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }
  `}
  
>

  <Sidebar
    chats={filteredChats}
    activeChat={activeChat}
    setActiveChat={(id) => {
      setActiveChat(id);
      setSidebarOpen(false);
    }}
    createNewChat={createNewChat}
    deleteChat={deleteChat}
    renameChat={renameChat}
    togglePin={togglePin}
    search={search}
    setSearch={setSearch}
    currentUser={currentUser}
    user={currentUser}
handleLogout={handleLogout}
  />

  <div
  onMouseDown={() =>
    setIsResizing(true)
  }
  className="
    absolute
    top-0
    right-0
    w-1
    h-full
    cursor-col-resize
    bg-transparent
    hover:bg-cyan-500
  "
/>

</div>

      <div className="flex-1 flex flex-col">
        
       <div className="p-4 border-b border-white/10 flex items-center gap-3">
  

  <button
  onClick={() => setSidebarOpen(true)}
  className="
    relative w-11 h-11
    bg-transparent
    flex items-center justify-center
    group
  "
>
  <span className="
    absolute inset-0
    border-l-2 border-t-2
    border-cyan-400
    rounded-tl-xl
    transition-all duration-300
    group-hover:w-8
    group-hover:h-8
  " />

  <span className="
    absolute bottom-0 right-0
    w-6 h-6
    border-r-2 border-b-2
    border-cyan-400
    rounded-br-xl
  " />

  <span className="
    absolute bottom-0 right-0
    w-6 h-6
    border-r-2 border-b-2
    border-cyan-400
    rounded-br-xl
  " />

  
  <span className="
    absolute inset-0
    rounded-full
    bg-cyan-400/10
    blur-md
    group-hover:bg-cyan-400/30
    transition
  " />

  <span className="relative flex flex-col gap-1">
    <span className="w-5 h-0.5 bg-cyan-300 rounded-full" />
    <span className="w-3 h-0.5 bg-cyan-300 rounded-full self-center" />
    <span className="w-5 h-0.5 bg-cyan-300 rounded-full" />
  </span>

</button>
      <div className="flex items-center gap-3">
  <span className="text-cyan-400">✦</span>

      <span className="text-lg font-semibold">
        Ateelabo 
      </span>
      <span
              className="
                bg-gradient-to-r
                from-cyan-400
                via-blue-400
                to-purple-500
                bg-clip-text
                text-transparent
                font-semibold
              "
            >
              AI
            </span>
  

  <span className="rounded-lg bg-cyan-900 px-2 py-1 text-xs" title="Models are configured on the server">Automatic provider</span>

</div>


  {
  sidebarOpen && (
    <div
      onClick={() => setSidebarOpen(false)}
      className="fixed inset-0 bg-black/50 z-40"
    />
  )
}

</div>


<motion.div

 whileHover={{
   scale:1.05
 }}

 whileTap={{
   scale:0.95
 }}
  className="
    text-xs
    bg-cyan-500/20
    px-2
    py-1
    rounded-full
    m-4
    w-fit
    
  "
>
  {selectedModel}
</motion.div>

       
<div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
  <div className="mx-auto w-full max-w-4xl">

    {!currentChat || currentChat.messages.length === 0 ? (
      <WelcomePage setInput={setInput} />
    ) : (
      currentChat.messages.map((msg, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 12,
            x: msg.role === "user" ? 8 : -8,
          }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.22 }}
          className={`mb-7 flex w-full ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`min-w-0 max-w-[90%] sm:max-w-[82%] ${
              msg.role === "user"
                ? "rounded-3xl rounded-br-md bg-gradient-to-br from-cyan-400 to-cyan-600 px-5 py-4 text-slate-950 shadow-lg shadow-cyan-500/10"
                : "rounded-3xl rounded-bl-md border border-white/[0.08] bg-[#151a25] px-5 py-4 text-slate-100 shadow-lg shadow-black/10"
            }`}
          >
            {msg.role === "ai" && (
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold text-cyan-300">
                    Ateelabo AI
                  </p>
                  <p className="text-[10px] text-slate-500">
                    AI Assistant
                  </p>
                </div>
              </div>
            )}

            {msg.fileName && (
  <div className="mb-3 flex w-full max-w-xs items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2.5">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
      {msg.fileType === "application/pdf" ? "📕" : "📄"}
    </div>

    <div className="min-w-0 flex-1">
      <p
        className="truncate text-sm font-semibold"
        title={msg.fileName}
      >
        {msg.fileName}
      </p>

      <p className="mt-0.5 text-xs opacity-60">
        Document attached
      </p>
    </div>
  </div>
)}

            <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-7 sm:text-[15px]">
              {msg.text}
            </div>

            {msg.time && (
              <div
                className={`mt-3 text-[10px] ${
                  msg.role === "user"
                    ? "text-slate-950/60"
                    : "text-slate-500"
                }`}
              >
                {msg.time}
              </div>
            )}

            {msg.role === "ai" && (
              <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-white/[0.07] pt-3">
                <button
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(msg.text || ""); }
                    catch { alert("Unable to copy. Please select and copy the text manually."); }
                  }}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-cyan-300"
                  title="Copy response"
                  aria-label="Copy response"
                >
                  📋 <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={() => reactToMessage(currentChat.id, index, "like")}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-emerald-300"
                  aria-pressed={msg.reaction === "like"}
                  title="Like response"
                  aria-label="Like response"
                >
                  👍
                </button>

                <button
                  onClick={() => reactToMessage(currentChat.id, index, "dislike")}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-rose-300"
                  aria-pressed={msg.reaction === "dislike"}
                  title="Dislike response"
                  aria-label="Dislike response"
                >
                  👎
                </button>

                <button
                  onClick={() => speakText(msg.text)}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-cyan-300"
                  title="Read aloud"
                  aria-label="Read response aloud"
                >
                  🔊 <span className="hidden sm:inline">Read aloud</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))
    )}

    {loading && <TypingIndicator />}

    <div ref={messagesEndRef} />
  </div>
</div>

        
        

       <div
  className="
    sticky
    bottom-0
    z-30
    px-3
    
    pt-3
    sm:px-4
    backdrop-blur-xl
    bg-[#050816]/80
  "
>

  {/* Hidden file input */}
  <input
    type="file"
    id="fileInput"
    accept=".pdf,.docx"
    hidden
    onChange={handleFileUpload}
  />

  <div
    className="
      mx-auto
      flex
      w-full
      max-w-5xl
      items-end
      gap-2
      rounded-[24px]
      border
      border-white/10
      bg-white/[0.04]
      p-2
      shadow-[0_0_35px_rgba(0,0,0,0.25)]
      backdrop-blur-2xl
      transition-all
      duration-300
      focus-within:border-cyan-400/30
      focus-within:shadow-[0_0_40px_rgba(34,211,238,0.08)]
    "
  >

    {/* Attachment */}
    <motion.button
      whileHover={{
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.95,
      }}
      onClick={() =>
        document.getElementById("fileInput").click()
      }
      title="Attach file"
      className="
        flex
        h-[46px]
        w-[46px]
        flex-shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-white/10
        bg-white/[0.05]
        text-xl
        text-gray-300
        transition-all
        hover:border-cyan-400/30
        hover:bg-cyan-400/10
        hover:text-cyan-300
      "
    >
      📎
    </motion.button>


    
    {/* Text area and uploaded file preview */}
    <div
      className="
        relative min-w-0 flex-1
        rounded-2xl border border-white/[0.10]
        bg-[#080e1b]/90
        shadow-inner shadow-black/20
        transition-all duration-300
        focus-within:border-cyan-400/40
        focus-within:shadow-[0_0_25px_rgba(34,211,238,0.08)]
      "
    >
      {/* Uploaded file preview */}
      {uploadedFile && (
        <div
          className="
            absolute bottom-full left-0 right-0 mb-3
            flex items-center justify-between gap-3
            rounded-2xl border border-cyan-400/20
            bg-[#0a1020]/95 p-3
            shadow-[0_12px_40px_rgba(0,0,0,0.35)]
            backdrop-blur-2xl
          "
        >
          <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex h-11 w-11 flex-shrink-0 items-center
                  justify-center rounded-xl
                  border border-cyan-400/10
                  bg-cyan-400/[0.08] text-xl
                "
              >
                {uploadedFile.name.toLowerCase().endsWith(".pdf")
                  ? "📕"
                  : "📄"}
              </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-100">
                {uploadedFile.name}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-cyan-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                File ready to attach
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUploadedFile(null)}
            title="Remove file"
            aria-label="Remove uploaded file"
            className="
              flex h-9 w-9 flex-shrink-0 items-center
              justify-center rounded-xl
              text-gray-400 transition-all
              hover:bg-red-500/10 hover:text-red-400
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-red-400/50
            "
          >
            ✕
          </button>
        </div>
      )}

      {/* Message input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message Ateelabo AI..."
        aria-label="Message Ateelabo AI"
        rows={1}
        className={`
          block w-full resize-none overflow-y-auto
          bg-transparent px-4 py-3.5
          text-sm leading-6 text-white
          outline-none placeholder:text-gray-500
          sm:text-base
          ${uploadedFile ? "pt-4" : ""}
        `}
        style={{
          minHeight: "50px",
          maxHeight: "180px",
        }}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height =
            Math.min(e.target.scrollHeight, 180) + "px";
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && localStorage.getItem("ateelabo_enter_to_send") !== "false") {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
    </div>

    {/* Stop listening */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={stopListening}
      title="Stop listening"
      aria-label="Stop listening"
      className="
        flex h-11 w-11 flex-shrink-0 items-center
        justify-center rounded-2xl
        border border-white/[0.09]
        bg-white/[0.04] text-gray-400
        transition-all duration-200
        hover:border-red-400/30
        hover:bg-red-400/10 hover:text-red-300
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-red-400/50
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M9 9h6v6H9z" fill="currentColor" stroke="none" />
      </svg>
    </motion.button>

    {/* Microphone */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={startListening}
      disabled={!browserSupportsSpeechRecognition}
      title="Voice input"
      aria-label="Start voice input"
      className="
        flex h-11 w-11 flex-shrink-0 items-center
        justify-center rounded-2xl
        border border-cyan-400/15
        bg-cyan-400/[0.08] text-cyan-300
        transition-all duration-200
        hover:border-cyan-400/40
        hover:bg-cyan-400/[0.15]
        hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-cyan-400/50
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <rect x="9" y="3" width="6" height="12" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
      </svg>
    </motion.button>

    {/* Send message */}
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={sendMessage}
      title="Send message"
      aria-label="Send message"
      className="
        group flex h-11 w-11 flex-shrink-0
        items-center justify-center rounded-2xl
        border border-cyan-200/20
        bg-gradient-to-br from-cyan-300 via-cyan-500 to-blue-600
        text-white
        shadow-[0_0_20px_rgba(34,211,238,0.18)]
        transition-all duration-200
        hover:shadow-[0_0_30px_rgba(34,211,238,0.35)]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-cyan-300/60
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </svg>
    </motion.button>

  </div>


  {/* Model badge */}
  <div className="mt-2 flex justify-center">

    <div
      className="
        flex
        items-center
        gap-2
        rounded-full
        border
        border-white/10
        bg-white/[0.03]
        px-3
        py-1.5
        text-[11px]
        text-gray-400
        backdrop-blur-xl
      "
    >
      <span className="text-cyan-400">✦</span>

      <span>
        Ateelabo AI
      </span>

      <span className="text-gray-600">
        ˅
      </span>
    </div>

  </div>

</div>

      </div>
    </div>
  }
    />
<Route path="*" element={<div className="p-8 text-white">Page not found. <Link to="/">Return to chat</Link></div>} />
</Routes>
    
    
  );
}