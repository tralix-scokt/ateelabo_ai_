import { useId } from "react";

export default function NeuralMark({ className = "", animated = false }) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`neural-mark ${animated ? "energized" : ""} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id={`${id}-ring`} x1="15" y1="100" x2="100" y2="15" gradientUnits="userSpaceOnUse"><stop stopColor="#00d9ff"/><stop offset=".48" stopColor="#5280ff"/><stop offset=".78" stopColor="#ef87ff"/><stop offset="1" stopColor="#6345ff"/></linearGradient>
          <linearGradient id={`${id}-a`} x1="35" y1="90" x2="76" y2="25" gradientUnits="userSpaceOnUse"><stop stopColor="#1644ce"/><stop offset=".5" stopColor="#00d9ff"/><stop offset="1" stopColor="#9adeff"/></linearGradient>
          <radialGradient id={`${id}-star`}><stop stopColor="white"/><stop offset=".35" stopColor="#e3b6ff"/><stop offset="1" stopColor="#9150ff" stopOpacity="0"/></radialGradient>
        </defs>
        <circle cx="60" cy="60" r="53" stroke={`url(#${id}-ring)`} strokeWidth="1.7"/>
        <circle cx="60" cy="60" r="50" stroke={`url(#${id}-ring)`} strokeWidth=".4" opacity=".5"/>
        <path d="M60 16 96 96 78 84 60 43 41 85 24 98Z" fill={`url(#${id}-a)`} stroke="#9be8ff" strokeWidth=".6"/>
        <path d="m60 16 0 27 18 41 18 12Z" fill="#1264e8" opacity=".55"/>
        <ellipse cx="60" cy="66" rx="48" ry="12" transform="rotate(-26 60 66)" stroke={`url(#${id}-ring)`} strokeWidth="2"/>
        <circle cx="60" cy="68" r="20" fill={`url(#${id}-star)`}/>
        <path d="m60 48 3 16 15 4-15 3-3 18-3-18-14-3 14-4Z" fill="white"/>
        <path d="m47 54 13 10 14-11-10 15 10 14-14-10-13 11 9-15Z" fill="#dfb8ff" opacity=".7"/>
      </svg>
    </div>
  );
}
