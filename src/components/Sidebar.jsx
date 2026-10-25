import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function Sidebar({
  chats,
  activeChat,
  setActiveChat,
  createNewChat,
  deleteChat,
  renameChat,
  togglePin,
  search,
  setSearch,
  currentUser,
handleLogout,
}) {
    const [openMenu, setOpenMenu] = useState(null);
    useEffect(() => {
  const handleClickOutside = () => {
    setOpenMenu(null);
  };

  if (openMenu !== null) {
    document.addEventListener("click", handleClickOutside);
  }

  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, [openMenu]);

  return (

    <motion.aside
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.4 }}
  className="
    w-full
    h-screen
    flex
    flex-col
    bg-[#090b14]/95
    backdrop-blur-xl
    border-r
    border-white/10
    shadow-[8px_0_40px_rgba(0,0,0,0.35)]
    overflow-hidden
  "
>

      
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">

  {/* ================================= */}
{/* ATEELABO AI BRAND LOGO */}
{/* ================================= */}

<motion.div
  initial={{
    opacity: 0,
    scale: 0.65,
    rotate: -8,
  }}
  animate={{
    opacity: 1,
    scale: 1,
    rotate: 0,
  }}
  transition={{
    delay: 0.2,
    duration: 0.8,
    type: "spring",
    stiffness: 120,
    damping: 14,
  }}
  className="
  relative
  flex
  h-12
  w-12
  flex-shrink-0
  items-center
  justify-center
"
>
  {/* Soft glow */}
  <motion.div
    animate={{
      scale: [1, 1.12, 1],
      opacity: [0.35, 0.6, 0.35],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className="
      pointer-events-none
      absolute
      inset-3
      rounded-full
      bg-cyan-400/20
      blur-2xl
    "
  />

  {/* SVG BRAND MARK */}
  <span className="text-cyan-400 item-center">✦</span>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  width="200"
  height="200"
  fill="none"
  className="relative
   z-10
    h-full
    w-full
     overflow-visible"
>
  <defs>
    <linearGradient id="aBody" x1="100" y1="80" x2="410" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#75F8FF"/>
      <stop offset=".25" stopColor="#00CFFF"/>
      <stop offset=".58" stopColor="#245BFF"/>
      <stop offset=".82" stopColor="#743CFF"/>
      <stop offset="1" stopColor="#E35CFF"/>
    </linearGradient>

    <linearGradient id="aHighlight" x1="170" y1="120" x2="335" y2="410" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFFFF"/>
      <stop offset=".35" stopColor="#6DF5FF"/>
      <stop offset="1" stopColor="#6C5CFF"/>
    </linearGradient>

    <linearGradient id="orbitStroke" x1="60" y1="320" x2="450" y2="180" gradientUnits="userSpaceOnUse">
      <stop stopColor="#008CFF"/>
      <stop offset=".45" stopColor="#62FFFF"/>
      <stop offset=".75" stopColor="#258CFF"/>
      <stop offset="1" stopColor="#C16BFF"/>
    </linearGradient>

    <radialGradient id="planetFill" cx="0" cy="0" r="1" gradientTransform="translate(374 174) rotate(45) scale(72)" gradientUnits="userSpaceOnUse">
      <stop stopColor="#FFFFFF"/>
      <stop offset=".25" stopColor="#7BF8FF"/>
      <stop offset=".58" stopColor="#248CFF"/>
      <stop offset="1" stopColor="#873EFF"/>
    </radialGradient>

    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  {/* Main sculpted A */}
  <path
    d="M256 48
       C249 54 244 66 237 81
       L104 365
       C96 383 104 397 123 407
       C151 422 182 408 202 380
       L256 280
       L310 380
       C330 408 361 422 389 407
       C408 397 416 383 408 365
       L275 81
       C268 66 263 54 256 48Z"
    fill="url(#aBody)"
  />

  {/* Left illuminated edge */}
  <path
    d="M256 49 L112 366 Q106 381 124 392"
    stroke="url(#aHighlight)"
    strokeWidth="4"
    strokeLinecap="round"
    filter="url(#softGlow)"
  />

  {/* Inner negative-space definition */}
  <path
    d="M256 188 L217 278 L295 278 Z"
    fill="#050817"
  />

  {/* Floating orbital glow */}
  <ellipse
    cx="256"
    cy="256"
    rx="220"
    ry="76"
    transform="rotate(-19 256 256)"
    stroke="#1268FF"
    strokeWidth="8"
    opacity=".3"
    filter="url(#glow)"
  />

  {/* Orbit foreground */}
  <path
    d="M42 299
       C106 350 248 311 352 246
       C403 214 438 178 414 157
       C393 139 351 143 316 152"
    stroke="url(#orbitStroke)"
    strokeWidth="5"
    strokeLinecap="round"
    filter="url(#glow)"
  />

  {/* Orbital planet */}
  <circle
    cx="392"
    cy="177"
    r="27"
    fill="url(#planetFill)"
    filter="url(#glow)"
  />

  <circle
    cx="383"
    cy="168"
    r="7"
    fill="#FFFFFF"
    opacity=".9"
  />

  {/* Tiny energy accent */}
  <circle cx="256" cy="48" r="4" fill="#FFFFFF" filter="url(#glow)"/>
</svg>
</motion.div>
  <div className="flex flex-col">

    <span className="
      text-base
      font-bold
      tracking-tight
      text-white
    ">
      Ateelabo
      <span className="
        bg-gradient-to-r
        from-cyan-400
        to-purple-500
        bg-clip-text
        text-transparent
      ">
        AI
      </span>
    </span>

    <span className="text-[10px] text-gray-500">
       Smart Assistant
    </span>

  </div>

</div>
    <motion.button
  onClick={createNewChat}
  whileHover={{
    scale: 1.02,
    y: -2,
  }}
  whileTap={{
    scale: 0.97,
  }}
  
className="
  group relative mx-4 mt-2 mb-4
  flex items-center justify-center gap-3
  overflow-hidden rounded-2xl
  border border-cyan-300/20
  bg-gradient-to-r from-cyan-500/15 via-cyan-400/10 to-blue-500/15
  px-4 py-3.5
  font-semibold text-cyan-100
  shadow-[0_0_20px_rgba(34,211,238,0.06)]
  transition-all duration-300
  hover:border-cyan-300/40
  hover:bg-cyan-400/15
  hover:shadow-[0_0_28px_rgba(34,211,238,0.13)]
"

>
  
  {/* Animated shine */}
  <motion.span
    initial={{
      x: "-120%",
    }}
    animate={{
      x: "120%",
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeInOut",
    }}
    className="
      absolute
      inset-y-0
      w-1/3
      -skew-x-12
      bg-white/20
      blur-md
    "
  />

  {/* Plus icon */}
  <span
    className="
      relative
      z-10
      text-xl
      leading-none
    "
  >
    +
  </span>

  {/* Text */}
  <span
    className="
      relative
      z-10
    "
  >
    New Chat
  </span>

</motion.button>

     <div className="px-4 pb-3">
  <div
    
className="
  flex items-center gap-3
  rounded-2xl
  border border-white/[0.08]
  bg-white/[0.025]
  px-3.5 py-3
  transition-all duration-300
  focus-within:border-cyan-400/30
  focus-within:bg-cyan-400/[0.035]
  focus-within:shadow-[0_0_20px_rgba(34,211,238,0.06)]
"

  >
    <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-4 w-4 flex-shrink-0 text-gray-500"
  aria-hidden="true"
>
  <circle cx="11" cy="11" r="7" />
  <path d="m16 16 4 4" />
</svg>

    <input
      type="text"
      placeholder="Search conversations..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full
        bg-transparent
        text-sm
        text-white
        outline-none
        placeholder:text-gray-500
      "
    />
  </div>
</div>

      <div className="flex items-center justify-between px-5 pb-3 pt-2">
  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
    Recent Chats
  </span>

  <span className="text-xs text-gray-600">
    {chats.length}
  </span>
</div>

      <div className="flex-1 overflow-y-auto mt-3">

        {chats.map(chat => (

          <div
  key={chat.id}
  
className={`
  group relative mx-2 mb-1
  flex cursor-pointer items-center gap-2
  rounded-xl border px-3 py-3
  transition-all duration-200
  ${
    activeChat === chat.id
      ? "border-cyan-400/20 bg-cyan-400/[0.08] shadow-[inset_2px_0_0_rgba(34,211,238,0.8)]"
      : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
  }
`}

  onClick={() =>
    setActiveChat(chat.id)
  }
>

  <div className="flex flex-col flex-1 overflow-hidden">

    <span
  className={`
    truncate
    text-sm
    font-medium
    transition-colors
    ${
      activeChat === chat.id
        ? "text-cyan-300"
        : "text-gray-300 group-hover:text-white"
    }
  `}
>
  {chat.pinned && (
    <span className="mr-1 text-xs">📌</span>
  )}

  {chat.title}
</span>

    <span className="mt-1 text-[10px] text-gray-600">
  {chat.createdAt
    ? new Date(chat.createdAt).toLocaleDateString()
    : "Today"}
</span>

  </div>

  
  <div className="relative">

  <button
    onClick={(e) => {
      e.stopPropagation();
      setOpenMenu(openMenu === chat.id ? null : chat.id);
    }}
    className="
      w-8 h-8
      rounded-lg
      flex items-center justify-center
      text-gray-300
      hover:bg-zinc-700
      hover:text-white
      transition
    "
    title="More options"
  >
    <span className="text-xl leading-none">⋯</span>
  </button>

  {openMenu === chat.id && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -5 }}
      transition={{ duration: 0.15 }}
      
className="
  absolute right-0 top-9 z-50
  w-44 max-w-[calc(100vw-2rem)]
  overflow-hidden rounded-xl
  border border-white/[0.10]
  bg-[#101522]/95 p-1
  shadow-[0_16px_45px_rgba(0,0,0,0.5)]
  backdrop-blur-2xl
"

      onClick={(e) => e.stopPropagation()}
    >

      {/* PIN / UNPIN */}
      <button
        onClick={() => {
          togglePin(chat.id);
          setOpenMenu(null);
        }}
        
className="
  flex w-full items-center gap-3
  rounded-lg px-3 py-2.5
  text-left text-sm text-gray-300
  transition-colors duration-150
  hover:bg-white/[0.06] hover:text-white
"

      >
        <span></span>
        <span>
          {chat.pinned ? "Unpin" : "Pin"}
        </span>
      </button>

      {/* RENAME */}
      <button
        onClick={() => {
          const newTitle = window.prompt(
            "Enter a new chat name:",
            chat.title
          );

         if (newTitle && newTitle.trim()) {
  renameChat(chat.id, newTitle.trim());
}
          setOpenMenu(null);
        }}
       
className="
  flex w-full items-center gap-3
  rounded-lg px-3 py-2.5
  text-left text-sm text-gray-300
  transition-colors duration-150
  hover:bg-white/[0.06] hover:text-white
"

      >
        <span></span>
        <span>Rename</span>
      </button>

      {/* COPY */}
      <button
        onClick={async () => {
          const chatText = chat.messages
            .map(msg => `${msg.role === "user" ? "You" : "Ateelabo AI"}: ${msg.text}`)
            .join("\n\n");

          try {
            await navigator.clipboard.writeText(chatText);
            alert("Chat copied successfully!");
          } catch (error) {
            console.log("Copy failed:", error);
          }

          setOpenMenu(null);
        }}
        
className="
  flex w-full items-center gap-3
  rounded-lg px-3 py-2.5
  text-left text-sm text-gray-300
  transition-colors duration-150
  hover:bg-white/[0.06] hover:text-white
"

      >
        <span></span>
        <span>Copy</span>
      </button>

      {/* DELETE */}
      <button
        onClick={() => {
          deleteChat(chat.id);
          setOpenMenu(null);
        }}
        
className="
  flex w-full items-center gap-3
  rounded-lg px-3 py-2.5
  text-left text-sm text-red-400
  transition-colors duration-150
  hover:bg-red-500/10 hover:text-red-300
"

      >
        <span></span>
        <span>Delete</span>
      </button>

    </motion.div>
  )}

</div>
</div>


        ))}

      </div>
      <div
  
className="
  mt-auto
  border-t border-white/[0.08]
  bg-[#080b14]/70
  p-4
"

>

  {currentUser ? (
  <div className="flex items-center gap-3">

    {/* Profile Avatar */}
    <div
      
className="
  flex h-10 w-10 flex-shrink-0
  items-center justify-center
  rounded-xl
  border border-cyan-300/20
  bg-gradient-to-br from-cyan-300 to-blue-600
  text-sm font-bold text-[#06101d]
  shadow-[0_0_18px_rgba(34,211,238,0.12)]
"

    >
      {currentUser.name?.charAt(0).toUpperCase()}
    </div>

    {/* User Info */}
    <div className="min-w-0 flex-1">

      <p className="font-medium truncate">
        {currentUser.name}
      </p>

      <p className="text-xs text-gray-400 truncate">
        {currentUser.email}
      </p>
      <div className="flex item-center justify-center gap-3 mt-3">
      <Link
  to="/profile"
  title="Profile"
  aria-label="Profile"
  
className="
  flex h-10 w-10 flex-shrink-0
  items-center justify-center
  rounded-xl
  border border-white/[0.07]
  bg-white/[0.035]
  text-gray-400
  transition-all duration-200
  hover:border-cyan-400/20
  hover:bg-cyan-400/[0.08]
  hover:text-cyan-300
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-cyan-400/40
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

      {/* Settings */}
      <Link
  to="/settings"
  title="Settings"
  aria-label="Settings"
  
className="
  flex h-10 w-10 flex-shrink-0
  items-center justify-center
  rounded-xl
  border border-white/[0.07]
  bg-white/[0.035]
  text-gray-400
  transition-all duration-200
  hover:border-cyan-400/20
  hover:bg-cyan-400/[0.08]
  hover:text-cyan-300
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-cyan-400/40
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
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.84A1.7 1.7 0 0 0 8.4 10a1.7 1.7 0 0 0-.34-1.88L8 8.06l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.67 5.2V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.9 11H21v2.4h-.1A1.7 1.7 0 0 0 19.4 15Z" />
  </svg>
  
</Link>

      {/* Logout */}
      <button
  onClick={handleLogout}
  title="Logout"
  aria-label="Logout"
  
className="
  flex h-10 w-10 flex-shrink-0
  items-center justify-center
  rounded-xl
  border border-white/[0.07]
  bg-white/[0.035]
  text-gray-400
  transition-all duration-200
  hover:border-red-400/20
  hover:bg-red-500/10
  hover:text-red-300
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-red-400/40
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
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M21 19V5a2 2 0 0 0-2-2h-7" />
  </svg>
</button>
    </div>

  </div>
  </div>

) : (
  <Link
    to="/login"
    className="
      w-full
      bg-cyan-500
      hover:bg-cyan-400
      text-black
      font-semibold
      py-2
      rounded-lg
      text-sm
      block
      text-center
    "
  >
    Login
  </Link>
)}
</div>
    </motion.aside>
  );
}
    
    
    
    




