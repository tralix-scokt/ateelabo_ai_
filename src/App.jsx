import { motion } from "framer-motion";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { useEffect, useState, useRef } from "react";
import Sidebar from "./components/Sidebar";
import WelcomePage from "./components/WelcomePage";
import TypingIndicator from "./components/TypingIndicator";
import AdminDashboard from "./pages/AdminDashboard";



export default function App() {

  const location = useLocation();
  const [touchStartX, setTouchStartX] =
  useState(null);
  const [chats,setChats] = useState([]);
  const [activeChat,setActiveChat] = useState(null);
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("ateelabo_user");

  return savedUser ? JSON.parse(savedUser) : null;
});
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [search,setSearch] = useState("");
  const messagesEndRef = useRef(null);
  const [uploadedFile, setUploadedFile] =
  useState(null);
  const [fileContext, setFileContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedModel, setSelectedModel] =
  useState("Ateelabo AI");

  const [currentUser, setCurrentUser] = useState(() => {
  const savedUser = localStorage.getItem("ateelabo_user");


  return savedUser ? JSON.parse(savedUser) : null;
});

useEffect(() => {
  if (location.state?.user) {
    setCurrentUser(location.state.user);
  }
}, [location.state]);

 const handleLogout = () => {
  localStorage.removeItem("ateelabo_user");
  localStorage.removeItem("ateelabo_token");
  setUser(null);
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
  browserSupportsSpeechRecognition,
} = useSpeechRecognition();

const startListening = () => {
  SpeechRecognition.startListening({
    continuous: true,
  });
};

const stopListening = () => {
  SpeechRecognition.stopListening();

  setInput(transcript);
};

if (!browserSupportsSpeechRecognition) {
  return (

    <div>
      Browser does not support speech recognition.
    </div>
  );
}

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

  setUploadedFile(file);

  console.log("Uploaded:", file);
};

const speakText = (text) => {
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
  try {
    const saved = localStorage.getItem("ateelabo_chats");
    const savedActive = localStorage.getItem("ateelabo_active_chat");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setChats(parsed);

        const activeExists = parsed.some(
          (chat) => String(chat.id) === String(savedActive)
        );

        setActiveChat(
          activeExists
            ? parsed.find(
                (chat) => String(chat.id) === String(savedActive)
              ).id
            : parsed[0].id
        );

        return;
      }
    }

    const firstChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats([firstChat]);
    setActiveChat(firstChat.id);
  } catch (error) {
    console.error("Failed to load saved chats:", error);
  }
}, []);

  useEffect(() => {
  const saveHistory =
    localStorage.getItem("ateelabo_save_history") !== "false";

  if (saveHistory && chats.length > 0) {
    localStorage.setItem(
      "ateelabo_chats",
      JSON.stringify(chats)
    );
  }
}, [chats]);

 const createNewChat = () => {

  const id = Date.now();

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

  if (updated.length) {
    setActiveChat(updated[0].id);
  } else {
    setActiveChat(null);
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
  
 const streamText = async (
  text,
  callback 
) => {

  let output = "";

  const speed = 12;

  for (let i = 0; i < text.length; i++) {

    output += text[i];

    callback(output);

    await new Promise(resolve =>
      setTimeout(resolve, speed)
    );
  }
};

  const sendMessage = async () => {

    console.log("SEND BUTTON CLIKED");
      console.log("INPUT:", input);
  console.log("CURRENT CHAT:", currentChat);

  console.log("Chats:", chats);
console.log("ActiveChat:", activeChat);
console.log("CurrentChat:", currentChat);

if (loading) return;

    if (!input || !currentChat) {
    console.log("STOPPED HERE");
    return;
  }

  console.log("CONTINUING...");


    const userMessage = {
  role: "user",
  text: input,
  time: new Date().toLocaleTimeString(),
  fileName: uploadedFile ? uploadedFile.name : null,
  fileType: uploadedFile ? uploadedFile.type : null
};

    const updatedChats = chats.map(chat => {

      if(chat.id === activeChat){

        return {

          ...chat,

          title:
  chat.messages.length === 0
    ? (
        input.length > 20
          ? input.substring(0, 15) + "..."
          : input
      )
    : chat.title,
    
          messages:[
            ...chat.messages,
            userMessage
          ]
        };
      }

      return chat;
    });

    setChats(updatedChats);
    setInput("");
    setUploadedFile(null);
    setLoading(true);

    try {
      const formData = new FormData();

formData.append("message", input);

if (uploadedFile) {
  formData.append("file", uploadedFile);
} 
  if (fileContext) {
  formData.append("fileContext", fileContext);
}

      const token = localStorage.getItem("ateelabo_token");

const response = await fetch(
  "http://localhost:5000/api/chat",
  {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  }
);
      const data = await response.json();
      if (data.fileText) {
  setFileContext(data.fileText);
}

if (data.fileName) {
  setFileName(data.fileName);
}

console.log("API RESPONSE:", data);

if (!response.ok || !data.reply) {
  const errorMessage =
    data.error ||
    "Ateelabo AI couldn't respond right now. Please try again later.";

  setChats((prev) =>
    prev.map((chat) =>
      chat.id === activeChat
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                role: "ai",
                text: errorMessage,
                time: new Date().toLocaleTimeString(),
              },
            ],
          }
        : chat
    )
  );

  setLoading(false);
  return;
}

      let aiMessage = {
        role:"ai",
        text:""
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChat
          ? {
              ...chat,
              messages:[
                ...chat.messages,
                aiMessage
              ]
            }
          : chat
        )
      );

      await streamText(
        data.reply,
        (partial)=>{

          setChats(prev =>
            prev.map(chat => {

              if(chat.id !== activeChat)
                return chat;

              const msgs =
                [...chat.messages];

              msgs[msgs.length-1] = {
              
  role: "ai",
  text: partial,
  time: new Date().toLocaleTimeString()
}

              return {
                ...chat,
                messages:msgs
              };
            })
          );
        }
      );

    } catch(err){
      console.log(err);
    }

    setLoading(false);
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
    user={user}
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
  

  <motion.select

  whileHover={{
   scale:1.05
 }}

 whileTap={{
   scale:0.95
 }}

    value={selectedModel}
    onChange={(e) =>
      setSelectedModel(
        e.target.value
      )
    }
    className="
      bg-cyan-900
      px-
      py-0
      rounded-lg
      text-sm
    "
  >
    
    <option>
      
    </option>

    <option value="gpt-4o-mini">
  GPT-4o Mini
</option>

<option value="gpt-4.1">
  GPT-4.1
</option>

<option value="gemini-2.5-flash">
  Gemini 2.5 Flash
</option>

<option value="claude-sonnet">
  Claude Sonnet
</option>

<option value="deepseek">
  DeepSeek
</option>

  </motion.select>

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
                  onClick={() =>
                    navigator.clipboard.writeText(msg.text || "")
                  }
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-cyan-300"
                  title="Copy response"
                  aria-label="Copy response"
                >
                  📋 <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={() => alert("Thanks for your feedback!")}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-emerald-300"
                  title="Like response"
                  aria-label="Like response"
                >
                  👍
                </button>

                <button
                  onClick={() => alert("Feedback received")}
                  className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.07] hover:text-rose-300"
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
            {uploadedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(uploadedFile)}
                alt={uploadedFile.name}
                className="h-11 w-11 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
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
            )}

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
          if (e.key === "Enter" && !e.shiftKey) {
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
</Routes>
    
    
  );
}