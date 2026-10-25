import { motion } from "framer-motion";

export default function AteelaboLogo({ size = "w-24 h-24" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.65, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        type: "spring",
        stiffness: 120,
        damping: 14,
      }}
      className={`relative ${size} flex items-center justify-center`}
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
        className="pointer-events-none absolute inset-3 rounded-full bg-cyan-400/20 blur-2xl"
      />
      

      {/* Brand A */}
      <span className="text-cyan-400">✦</span>
      
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  width="200"
  height="200"
  fill="none"
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
  );
}