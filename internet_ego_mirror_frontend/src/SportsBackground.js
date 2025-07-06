import React from "react";
import "./App.css";

// SPORTS ICONS: soccer ball, cricket bat and ball, tennis racket, basketball, etc.
const SPORTS_ICONS = [
  {
    key: "soccer",
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" aria-label="Soccer Ball">
        <circle cx="24" cy="24" r="22" fill="#fff" stroke="#343434" strokeWidth="3"/>
        <polygon points="24,13 30,17 30,25 24,29 18,25 18,17"
          fill="#343434" />
        <circle cx="24" cy="21" r="4" fill="#343434"/>
        <ellipse cx="35" cy="32" rx="5" ry="2" fill="#eee" opacity="0.2"/>
      </svg>
    ),
  },
  {
    key: "cricket",
    icon: (
      <svg viewBox="0 0 60 60" width="48" height="48" aria-label="Cricket Bat and Ball">
        {/* Bat */}
        <rect x="35" y="15" width="7" height="28" rx="3" fill="#fad77b" stroke="#c1974b" strokeWidth="2" transform="rotate(25 38 24)" />
        {/* Grip */}
        <rect x="38" y="10" width="3" height="8" rx="1.2" fill="#b45119" transform="rotate(25 38 14)" />
        {/* Ball */}
        <circle cx="17" cy="48" r="6" fill="#ff4ecd" stroke="#ba2177" strokeWidth="2"/>
        <ellipse cx="17" cy="48" rx="2" ry="6" fill="#fff" opacity="0.16"/>
      </svg>
    ),
  },
  {
    key: "tennis",
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" aria-label="Tennis Racket">
        {/* Racket */}
        <ellipse cx="32" cy="16" rx="10" ry="16" fill="#23ce6b" stroke="#36c6e7" strokeWidth="2"/>
        {/* Handle */}
        <rect x="28" y="32" width="6" height="13" rx="2" fill="#fed502" stroke="#bba101" strokeWidth="1.2"/>
        {/* Ball */}
        <circle cx="40" cy="38" r="5.2" fill="#f9f935" stroke="#b0b031" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: "basketball",
    icon: (
      <svg viewBox="0 0 52 52" width="48" height="48" aria-label="Basketball">
        <circle cx="26" cy="26" r="22" fill="#ff654f" stroke="#fe7b24" strokeWidth="3"/>
        <path d="M4 26a22 22 0 0 1 44 0" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M12 12c10 10 20 20 28 28" stroke="#fff" strokeWidth="1"/>
        <path d="M40 12c-10 10-20 20-28 28" stroke="#fff" strokeWidth="1"/>
        <path d="M26 4v44" stroke="#fff" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: "shuttlecock",
    icon: (
      <svg viewBox="0 0 48 48" width="48" height="48" aria-label="Shuttlecock">
        {/* Feathers */}
        <rect x="13" y="7" width="4.2" height="24" rx="1.1" fill="#b4eafe" />
        <rect x="23" y="7" width="4.2" height="24" rx="1.1" fill="#bafcd6" />
        <rect x="18" y="9" width="4.2" height="20" rx="1.1" fill="#fff"/>
        {/* Ball */}
        <ellipse cx="20" cy="35" rx="11" ry="6" fill="#dedede"/>
        <ellipse cx="20" cy="37" rx="8" ry="2.7" fill="#6C63FF" opacity="0.20"/>
      </svg>
    ),
  },
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Generate N floating icons (each with unique random props per mount)
function FloatingSportsIcons({count=7}) {
  let icons = [];
  for (let i = 0; i < count; i++) {
    const iconObj = SPORTS_ICONS[Math.floor(Math.random() * SPORTS_ICONS.length)];
    const style = {
      left: `${randomBetween(2, 92)}vw`,
      top: `${randomBetween(8, 80)}vh`,
      animationDuration: `${randomBetween(9, 16)}s`,
      animationDelay: `${randomBetween(-4, 6)}s`
    };
    icons.push(
      <div
        className="sports-float-icon"
        style={{...style, width: 48, height: 48}}
        key={'sport-'+i+'-'+iconObj.key}
        aria-hidden="true"
      >
        {iconObj.icon}
      </div>
    );
  }
  return icons;
}

/**
 * PUBLIC_INTERFACE
 * Renders the animated, floating sports-themed SVG icons as an unobtrusive playful background.
 * Usage: Place <SportsBackground/> near the root of your app.
 */
function SportsBackground() {
  return (
    <div className="iemo-bg-animated" aria-hidden="true">
      <div className="iemo-blob iemo-blob1"></div>
      <div className="iemo-blob iemo-blob2"></div>
      <div className="iemo-blob iemo-blob3"></div>
      <div className="iemo-blob iemo-blob4"></div>
      <FloatingSportsIcons count={8}/>
    </div>
  );
}

export default SportsBackground;
