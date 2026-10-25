import { useEffect, useState } from "react";
import NeuralMark from "./NeuralMark";
export default function Intro({ onEnter }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onEnter, 500);
    return () => clearTimeout(timer);
  }, [leaving, onEnter]);
  return (
    <div
      className={`intro ${leaving ? "intro-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ATEELABO AI"
    >
      <div className="intro-grid" />
      <div className="intro-particles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="intro-content">
        <div className="eyebrow">AN INTELLIGENCE WITHOUT LIMITS</div>
        <NeuralMark animated className="intro-mark" />
        <h1 aria-label="ATEELABO AI">
          {"ATEELABO AI".split("").map((letter, i) => (
            <span
              aria-hidden="true"
              key={i}
              style={{ animationDelay: `${i * 65 + 200}ms` }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </h1>
        <p>
          Beyond Intelligence. <span>Beyond Imagination.</span>
        </p>
        <button
          autoFocus
          className="enter-button"
          onClick={() => setLeaving(true)}
          disabled={leaving}
        >
          Enter the experience <span>↗</span>
        </button>
        <div className="intro-note">Your Mind.<br />My Intelligence.<br /><strong>Infinite Possibilities.</strong></div>
        <div className="intro-horizon" aria-hidden="true" />
      </div>
      <div className="intro-footer">
        <span>ATEELABO / INTELLIGENCE SYSTEM</span>
        <span>DESIGNED FOR WHAT’S NEXT</span>
      </div>
    </div>
  );
}
