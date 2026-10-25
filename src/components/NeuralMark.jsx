export default function NeuralMark({ className = "", animated = false }) {
  return (
    <div
      className={`neural-mark ${animated ? "energized" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" fill="none">
        <path
          d="M50 8 86 29v42L50 92 14 71V29L50 8Z"
          stroke="currentColor"
          strokeWidth=".65"
          opacity=".3"
        />
        <path
          d="m50 18 29 50H63l-5-9H42l-5 9H21l29-50Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path d="m50 33 9 16H41l9-16Z" fill="currentColor" />
        <path
          d="m24 76 26 15 26-15M14 29l12 7m60-7-12 7M50 8v11"
          stroke="currentColor"
        />
        <circle cx="50" cy="8" r="2" fill="currentColor" />
        <circle cx="14" cy="71" r="2" fill="currentColor" />
        <circle cx="86" cy="71" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}
