import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      {/* AI Avatar */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 0px rgba(34,211,238,0)",
            "0 0 18px rgba(34,211,238,0.35)",
            "0 0 0px rgba(34,211,238,0)",
          ],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
        }}
        className="
          flex
          h-9
          w-9
          flex-shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-cyan-400/20
          bg-cyan-400/10
          text-sm
          text-cyan-300
        "
      >
        ✦
      </motion.div>

      {/* Thinking bubble */}
      <div
        className="
          flex
          items-center
          gap-2
          rounded-2xl
          rounded-tl-md
          border
          border-white/10
          bg-white/[0.04]
          px-4
          py-3
          shadow-[0_0_25px_rgba(0,0,0,0.15)]
          backdrop-blur-xl
        "
      >
        <span className="text-xs text-gray-500">
          Ateelabo AI
        </span>

        {/* Animated dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{
                y: [0, -4, 0],
                opacity: [0.35, 1, 0.35],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: dot * 0.15,
              }}
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-400
              "
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}