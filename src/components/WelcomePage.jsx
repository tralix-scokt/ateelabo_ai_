import { motion } from "framer-motion";

export default function WelcomePage({ setInput }) {
 const features = [
  {
    icon: "💡",
    title: "Explain a concept",
    description: "Get clear, simple explanations.",
    prompt: "Explain a concept to me",
    glow: "cyan",
  },
  {
    icon: "</>",
    title: "Write code",
    description: "Build, debug and improve.",
    prompt: "Help me write some code",
    glow: "blue",
  },
  {
    icon: "📄",
    title: "Analyze a file",
    description: "Analyze PDF and DOCX documents.",
    prompt: "Help me analyze a file",
    glow: "green",
  },
  {
    icon: "✦",
    title: "Get creative",
    description: "Ideas, content, and designs.",
    prompt: "Give me some creative ideas",
    glow: "purple",
  },
    
];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="
        relative
        flex
        min-h-full
        flex-col
        items-center
        justify-center
        overflow-hidden
        px-4
        py-10
      "
    >

      {/* Background glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/5
          blur-[100px]
        "
      />

      {/* ================================= */}
      {/* CENTRAL ORBIT */}
      {/* ================================= */}

      <div
        className="
          relative
          flex
          w-full
          max-w-4xl
          flex-col
          items-center
          justify-center
          py-8
        "
      >

        {/* Main glowing circle */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            pointer-events-none
            absolute
            h-[290px]
            w-[290px]
            rounded-full
            border
            border-cyan-400/50
            shadow-[0_0_25px_rgba(34,211,238,0.15)]
            sm:h-[370px]
            sm:w-[370px]
            md:h-[430px]
            md:w-[430px]
          "
        />

        {/* Purple orbit */}
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            pointer-events-none
            absolute
            h-[250px]
            w-[330px]
            rotate-[25deg]
            rounded-[50%]
            border
            border-purple-500/30
            shadow-[0_0_30px_rgba(168,85,247,0.08)]
            sm:h-[320px]
            sm:w-[430px]
            md:h-[360px]
            md:w-[520px]
          "
        />

        {/* Blue orbit */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "linear",
          }}
          className="
            pointer-events-none
            absolute
            h-[260px]
            w-[340px]
            -rotate-[35deg]
            rounded-[50%]
            border
            border-blue-500/20
            sm:h-[330px]
            sm:w-[440px]
            md:h-[380px]
            md:w-[540px]
          "
        />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center">

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
    mb-5
    flex
    h-28
    w-28
    items-center
    justify-center
    sm:h-32
    sm:w-32
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
          {/* Brand */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="
              text-4xl
              font-extrabold
              tracking-tight
              text-white
              sm:text-5xl
              md:text-6xl
            "
          >
            Ateelabo{" "}
            <span
              className="
                bg-gradient-to-r
                from-cyan-400
                via-blue-400
                to-purple-500
                bg-clip-text
                text-transparent
              "
            >
              AI
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="
              mt-4
              text-xl
              font-semibold
              text-white
              sm:text-2xl
              md:text-3xl
            "
          >
            Your Ideas, Our{" "}
            <span
              className="
                bg-gradient-to-r
                from-cyan-400
                to-purple-500
                bg-clip-text
                text-transparent
              "
            >
              Intelligence
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="
              mt-4
              max-w-lg
              text-sm
              leading-6
              text-gray-400
              sm:text-base
            "
          >
            Ask anything, build anything, solve anything.
            <br />
            I'm here to help you turn your ideas into reality.
          </motion.p>

        </div>
      </div>

      {/* ================================= */}
      {/* FEATURE CARDS */}
      {/* ================================= */}

      <div
        className="
          relative
          z-20
          mt-5
          grid
          w-full
          max-w-5xl
          grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {features.map((feature, index) => (
          <motion.button
            key={feature.title}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.7 + index * 0.1,
            }}
            whileHover={{
              y: -5,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setInput(feature.prompt)}
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-[#07152d]/70
              p-4
              text-left
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-cyan-400/30
              hover:bg-[#0a1d3d]/80
              hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]
            "
          >
            <div className="flex items-start gap-3">

              {/* Icon */}
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/10
                  text-lg
                  text-cyan-300
                  transition-all
                  duration-300
                  group-hover:scale-110
                  group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
                "
              >
                {feature.icon}
              </div>

              <div>
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    group-hover:text-cyan-300
                  "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  {feature.description}
                </p>
              </div>

            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="
          relative
          z-10
          mt-7
          text-xs
          text-gray-600
        "
      >
        Start a conversation below ✨
      </motion.p>

    </motion.div>
  );
}