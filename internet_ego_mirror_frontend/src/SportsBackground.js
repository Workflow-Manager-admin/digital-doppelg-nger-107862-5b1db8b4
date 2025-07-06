import React from "react";
import "./App.css";

// Sports background main color gradient
// Subtle sports texture using multiple gradients and SVG icons

// SPORTS SVG ASSETS – lively, playful and colorful
const SPORTS_SVGS = [
  {
    key: "soccer",
    svg: (
      <svg width="46" height="46" viewBox="0 0 46 46" aria-label="Soccer Ball">
        <circle cx="23" cy="23" r="20" fill="#fff" stroke="#343434" strokeWidth="3"/>
        <polygon points="23,11 28,15 28,21 23,25 18,21 18,15" fill="#343434"/>
        <circle cx="23" cy="18" r="4" fill="#343434"/>
        <ellipse cx="33" cy="30" rx="5" ry="2" fill="#eee" opacity="0.18"/>
      </svg>
    ),
  },
  {
    key: "cricket-bat-ball",
    svg: (
      <svg viewBox="0 0 60 60" width="46" height="46" aria-label="Cricket Bat & Ball">
        {/* Bat */}
        <rect x="38" y="19" width="7" height="25" rx="2" fill="#f9c97d" stroke="#ba8530" strokeWidth="2" transform="rotate(22 41 32)" />
        {/* Grip */}
        <rect x="38" y="14" width="3.4" height="7" rx="1.1" fill="#ba2177" transform="rotate(22 41 17)" />
        {/* Ball */}
        <circle cx="17" cy="48" r="6" fill="#ff4ecd" stroke="#ba2177" strokeWidth="2"/>
        <ellipse cx="17" cy="48" rx="2" ry="6" fill="#fff" opacity="0.16"/>
      </svg>
    ),
  },
  {
    key: "basketball",
    svg: (
      <svg viewBox="0 0 50 50" width="46" height="46" aria-label="Basketball">
        <circle cx="25" cy="25" r="22" fill="#ff654f" stroke="#fe7b24" strokeWidth="3"/>
        <path d="M3 25h44" stroke="#fff" strokeWidth="1.3"/>
        <path d="M11 11c11 11 25 25 36 36" stroke="#fff" strokeWidth="1"/>
        <path d="M39 11C28 22 14 36 3 47" stroke="#fff" strokeWidth="1"/>
        <path d="M25 3v44" stroke="#fff" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: "tennis-racket",
    svg: (
      <svg viewBox="0 0 44 48" width="42" height="46" aria-label="Tennis Racket">
        <ellipse cx="23" cy="17" rx="12" ry="18" fill="#23ce6b" stroke="#36c6e7" strokeWidth="2"/>
        <rect x="19" y="29" width="8" height="15" rx="3" fill="#fed502" stroke="#bba101" strokeWidth="1.2"/>
        {/* Tennis ball */}
        <circle cx="36" cy="33" r="4" fill="#fefd46" stroke="#888e00" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: "volleyball",
    svg: (
      <svg width="46" height="46" viewBox="0 0 46 46" aria-label="Volleyball">
        <circle cx="23" cy="23" r="20" fill="#36c6e7" stroke="#15a3b4" strokeWidth="3"/>
        <path d="M6 34Q23 6 40 34" stroke="#fff" strokeWidth="2"/>
        <path d="M4 19Q23 44 42 19" stroke="#fff" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    key: "rugby",
    svg: (
      <svg width="48" height="40" viewBox="0 0 48 40" aria-label="Rugby Ball">
        <ellipse cx="24" cy="20" rx="22" ry="13" fill="#fff" stroke="#ffbf00" strokeWidth="2"/>
        <rect x="12" y="17" width="24" height="6" rx="3" fill="#23ce6b" />
        <ellipse cx="24" cy="20" rx="9" ry="2.5" fill="#ffbf00" opacity="0.2"/>
      </svg>
    ),
  },
  {
    key: "shuttlecock",
    svg: (
      <svg viewBox="0 0 46 46" width="42" height="46" aria-label="Shuttlecock">
        {/* Feathers */}
        <rect x="11" y="7" width="4" height="23" rx="1.1" fill="#b4eafe" />
        <rect x="21" y="7" width="4" height="23" rx="1.1" fill="#bafcd6" />
        <rect x="16" y="9" width="4" height="20" rx="1.1" fill="#fff"/>
        {/* Ball */}
        <ellipse cx="18" cy="33" rx="10" ry="5.5" fill="#dedede"/>
        <ellipse cx="18" cy="35" rx="7" ry="1.9" fill="#6C63FF" opacity="0.18"/>
      </svg>
    ),
  },
  {
    key: "goal-net",
    svg: (
      <svg width="52" height="36" viewBox="0 0 52 36" aria-label="Goal Net">
        <rect x="2" y="14" width="48" height="18" rx="4" fill="#fff" stroke="#36c6e7" strokeWidth="2"/>
        <line x1="2" y1="23" x2="50" y2="23" stroke="#fed502" strokeWidth="2"/>
        <line x1="10" y1="14" x2="10" y2="32" stroke="#fed502" strokeWidth="2"/>
        <line x1="26" y1="14" x2="26" y2="32" stroke="#fed502" strokeWidth="2"/>
        <line x1="42" y1="14" x2="42" y2="32" stroke="#fed502" strokeWidth="2"/>
      </svg>
    ),
  },
];

/**
 * Returns a random integer between a and b, inclusive
 */
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Generates N animated sports SVGs, much larger and more responsive (uses vw/vh for scaling).
function FloatingSportsSVGs({ count = 8 }) {
  let items = [];
  // Use CSS clamp for responsive sizes
  for (let i = 0; i < count; ++i) {
    const idx = Math.floor(Math.random() * SPORTS_SVGS.length);

    // Responsive large size: up to 24vw/25vh, minimum 100px, randomize per icon but always big
    const baseVw = randInt(16, 23); // Large width in vw
    const baseVh = randInt(16, 25); // Large height in vh
    // Center offset so SVG doesn't overflow out-of-bounds, accounting for larger icons
    const left = randInt(2, 74);  // less up to near edge to avoid cut-off
    const top = randInt(6, 65);

    // Use width/height via CSS clamp for scaling
    const style = {
      left: `clamp(0vw, ${left}vw, 90vw)`,
      top: `clamp(0vh, ${top}vh, 80vh)`,
      width: `clamp(100px, ${baseVw}vw, 34vw)`,
      height: `clamp(100px, ${baseVh}vh, 34vh)`,
      minWidth: '80px',
      minHeight: '80px',
      maxWidth: '40vw',
      maxHeight: '40vh',
      opacity: 0.92,
      zIndex: 2,
      animationDuration: `${randInt(10, 22)}s`,
      animationDelay: `${randInt(-5, 9)}s`,
      filter: "drop-shadow(0 5px 28px #6c63ff33) drop-shadow(0 8px 36px #ffbf0031)",
      pointerEvents: "none"
    };

    items.push(
      <div
        key={`big-anim-sports-icon-${i}-${idx}`}
        className="sports-float-icon large-sports-float-icon"
        style={style}
        aria-hidden="true"
      >
        {SPORTS_SVGS[idx].svg}
      </div>
    );
  }
  return items;
}

/**
 * PUBLIC_INTERFACE
 * Renders a sports-themed, vibrant gradient background with animated sports SVGs.
 * The gradient is green-to-blue with overlays for a stadium/field aesthetic.
 */
function SportsBackground() {
  // Main sports field/sky gradient underlay
  // Subtle texture: White stadium arc, semi-transparent lines for track/arena effect
  return (
    <div
      className="iemo-bg-animated"
      aria-hidden="true"
      style={{
        // Gradient goes from vibrant green (field) to blue (sky/stadium) bottom-right
        background:
          "linear-gradient(120deg, #23ce6b 0%, #36c6e7 70%, #84aaff 100%)",
        // Add secondary overlay effect: subtle repeating field lines
        position: "fixed",
        inset: 0,
        minWidth: "100vw",
        minHeight: "100vh",
        zIndex: 0,
        // Below floating SVG sports icons
        pointerEvents: "none",
        overflow: "hidden"
      }}
    >
      {/* Stadium arc - as an SVG overlay (top left corner, faded white) */}
      <svg
        width="640"
        height="340"
        viewBox="0 0 640 340"
        style={{
          position: "absolute",
          top: "-40px",
          left: "-40px",
          zIndex: 1,
          opacity: 0.14,
        }}
        aria-hidden="true"
      >
        <ellipse
          cx="300"
          cy="210"
          rx="290"
          ry="120"
          fill="white"
          opacity="0.18"
        />
        <ellipse
          cx="390"
          cy="88"
          rx="185"
          ry="53"
          fill="#fff"
          opacity="0.07"
        />
      </svg>

      {/* Field/track lines (horizontal) */}
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            position: "absolute",
            left: 0,
            width: "100vw",
            height: "2px",
            top: `${16 + n * 13}vh`,
            background:
              n % 2 === 0
                ? "rgba(255,255,255,0.12)"
                : "rgba(200,230,255,0.09)",
            zIndex: 2,
            borderRadius: "4px",
          }}
        />
      ))}
      {/* Optional: Add arena/track ring effect at bottom */}
      <svg
        width="930"
        height="120"
        viewBox="0 0 930 120"
        style={{
          position: "absolute",
          bottom: "-36px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          opacity: 0.16,
        }}
        aria-hidden="true"
      >
        <ellipse
          cx="465"
          cy="30"
          rx="340"
          ry="30"
          fill="#fff"
          opacity="0.19"
        />
        <ellipse
          cx="465"
          cy="86"
          rx="240"
          ry="18"
          fill="#fff"
          opacity="0.09"
        />
      </svg>
      {/* Finally, the large animated floating sports icons (on top of gradient) */}
      <FloatingSportsSVGs count={8} />
    </div>
  );
}

export default SportsBackground;
