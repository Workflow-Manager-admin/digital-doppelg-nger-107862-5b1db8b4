import React, { useRef, useEffect } from "react";
import "./App.css";

/**
 * SparklesLayer: Twinkling glitter background layer (unchanged from previous, for festival vibe)
 */
function SparklesLayer({ count = 32 }) {
  const sparkles = Array.from({ length: count }).map((_, i) => {
    // Twinkle with random size/tone and offset
    const sizeClass = Math.random() < 0.13 ? "big" : (Math.random() < 0.38 ? "tiny" : "");
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = (Math.random() * 4).toFixed(2) - 2.1;
    const hue = Math.random() * 50 - 25;
    return (
      <span
        className={`sparkle ${sizeClass}`}
        key={`sparkle${i}`}
        style={{
          left: `${left}vw`,
          top: `${top}vh`,
          animationDelay: `${delay}s`,
          filter: `drop-shadow(0 0 13px #fffdd399) hue-rotate(${hue}deg) brightness(${1.08 + Math.random() * 0.29})`
        }}
        aria-hidden="true"
      >
        <svg className="sparkle-glint" width="100%" height="100%" viewBox="0 0 18 18">
          <polygon points="9,1 11,7.2 17,9 11,10.8 9,17 7,10.8 1,9 7,7.2"
                   fill="#fffbe9" fillOpacity="0.91"
                   stroke="#ffe184" strokeWidth="0.7" strokeLinejoin="round" />
          <ellipse className="sparkle-dot"
                   cx="9" cy="9" rx="2.1" ry="2.1"
                   fill="#ffe396" fillOpacity="0.57" />
        </svg>
      </span>
    );
  });
  return <div className="sparkles-bg" aria-hidden="true">{sparkles}</div>;
}

// --- Large playful sports SVGs & configs ---
const SPORTS_SVGS = [
  // Many of these get bold neon-style drop-shadows via CSS!
  {
    key: "soccer",
    svg: (
      <svg width="120" height="120" viewBox="0 0 46 46" aria-label="Soccer Ball">
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
      <svg viewBox="0 0 60 60" width="120" height="120" aria-label="Cricket Bat & Ball">
        <rect x="38" y="19" width="7" height="25" rx="2" fill="#f9c97d" stroke="#ba8530" strokeWidth="2" transform="rotate(22 41 32)" />
        <rect x="38" y="14" width="3.4" height="7" rx="1.1" fill="#ba2177" transform="rotate(22 41 17)" />
        <circle cx="17" cy="48" r="6" fill="#ff4ecd" stroke="#ba2177" strokeWidth="2"/>
        <ellipse cx="17" cy="48" rx="2" ry="6" fill="#fff" opacity="0.16"/>
      </svg>
    ),
  },
  {
    key: "basketball",
    svg: (
      <svg viewBox="0 0 50 50" width="120" height="120" aria-label="Basketball">
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
      <svg viewBox="0 0 44 48" width="120" height="120" aria-label="Tennis Racket">
        <ellipse cx="23" cy="17" rx="12" ry="18" fill="#23ce6b" stroke="#36c6e7" strokeWidth="2"/>
        <rect x="19" y="29" width="8" height="15" rx="3" fill="#fed502" stroke="#bba101" strokeWidth="1.2"/>
        <circle cx="36" cy="33" r="4" fill="#fefd46" stroke="#888e00" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: "volleyball",
    svg: (
      <svg width="120" height="120" viewBox="0 0 46 46" aria-label="Volleyball">
        <circle cx="23" cy="23" r="20" fill="#36c6e7" stroke="#15a3b4" strokeWidth="3"/>
        <path d="M6 34Q23 6 40 34" stroke="#fff" strokeWidth="2"/>
        <path d="M4 19Q23 44 42 19" stroke="#fff" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    key: "rugby",
    svg: (
      <svg width="120" height="90" viewBox="0 0 48 40" aria-label="Rugby Ball">
        <ellipse cx="24" cy="20" rx="22" ry="13" fill="#fff" stroke="#ffbf00" strokeWidth="2"/>
        <rect x="12" y="17" width="24" height="6" rx="3" fill="#23ce6b" />
        <ellipse cx="24" cy="20" rx="9" ry="2.5" fill="#ffbf00" opacity="0.18"/>
      </svg>
    ),
  },
  {
    key: "shuttlecock",
    svg: (
      <svg viewBox="0 0 46 46" width="120" height="120" aria-label="Shuttlecock">
        <rect x="11" y="7" width="4" height="23" rx="1.1" fill="#b4eafe" />
        <rect x="21" y="7" width="4" height="23" rx="1.1" fill="#bafcd6" />
        <rect x="16" y="9" width="4" height="20" rx="1.1" fill="#fff"/>
        <ellipse cx="18" cy="33" rx="10" ry="5.5" fill="#dedede"/>
        <ellipse cx="18" cy="35" rx="7" ry="1.9" fill="#6C63FF" opacity="0.18"/>
      </svg>
    ),
  },
  {
    key: "goal-net",
    svg: (
      <svg width="120" height="80" viewBox="0 0 52 36" aria-label="Goal Net">
        <rect x="2" y="14" width="48" height="18" rx="4" fill="#fff" stroke="#36c6e7" strokeWidth="2"/>
        <line x1="2" y1="23" x2="50" y2="23" stroke="#fed502" strokeWidth="2"/>
        <line x1="10" y1="14" x2="10" y2="32" stroke="#fed502" strokeWidth="2"/>
        <line x1="26" y1="14" x2="26" y2="32" stroke="#fed502" strokeWidth="2"/>
        <line x1="42" y1="14" x2="42" y2="32" stroke="#fed502" strokeWidth="2"/>
      </svg>
    ),
  },
];

// Return a random number in [a, b]
function rand(a, b) {
  return a + Math.random() * (b - a);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getRandomPathAnim(n = 16) {
  // Create a random path using keyframes: list of {x,y,rot,scale,...}
  const keyframes = [];
  let x = rand(2, 80), y = rand(7, 75), angle = rand(-180, 180), scale = rand(1, 1.16);
  let prevT = 0;
  for (let i = 0; i < n; ++i) {
    let t = i / (n - 1);
    let dx = rand(-18, 18), dy = rand(-16, 16),
        dAngle = rand(-120, 180), dScale = rand(-0.14, 0.17);
    if (i === 0) dx = dy = dAngle = dScale = 0;
    // Make movement spikier & zig-zag/climb/rebound
    let newX = x + dx * easeInOut(Math.sin(t * Math.PI * rand(1, 2))),
        newY = y + dy * Math.sin(t * rand(1.2, 2.7) * Math.PI),
        newRot = angle + dAngle * Math.sin(t * 2 * Math.PI * rand(1, 1.8)),
        newScale = Math.max(0.93, Math.min(1.19, scale + dScale));
    keyframes.push({
      percent: Math.round(t * 100),
      x: newX, y: newY, angle: newRot, scale: newScale
    });
    x = newX;
    y = newY;
    angle = newRot;
    scale = newScale;
    prevT = t;
  }
  return keyframes;
}

// One wiggling, floating, rotating SVG sports equipment
function AnimatedSportsSVG({ iconIdx, animKey, total, layerIdx }) {
  // Fixed, unique animation path for each SVG on mount
  const path = useRef(getRandomPathAnim(rand(10, 27)));
  // Random animation duration, in seconds
  const duration = rand(17, 33 + 6 * Math.random());
  // Random direction: normal or alternate-reverse
  const direction = Math.random() < 0.47 ? "alternate" : "alternate-reverse";
  // An extra-large/giant SVG every few
  const isXL = iconIdx % 3 === 1;
  // Unique CSS class/id for dynamic keyframes
  const animClass = `moving-sports-svg-anim-${animKey}`;

  useEffect(() => {
    // Create a style tag for each unique keyframes for this SVG at mount
    let style = document.createElement("style");
    let kfs = "";
    for (let i = 0; i < path.current.length; ++i) {
      const { percent, x, y, angle, scale } = path.current[i];
      kfs += `
        ${percent}% {
          transform:
            translate(${x}vw, ${y}vh)
            rotate(${angle}deg)
            scale(${scale});
          filter:
            drop-shadow(0 7px 44px #23ce6b44)
            drop-shadow(0 13px 44px #fed50236)
            drop-shadow(0 18px 48px #ff4ecd32)
            brightness(${isXL ? "1.08" : "1.13"})
            saturate(1.21)
        }
      `;
    }
    style.innerHTML = `
      @keyframes ${animClass} {
        ${kfs}
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
    // eslint-disable-next-line
  }, []);

  const shadow = [
    "drop-shadow(0 8px 38px #ffbf005e)",
    "drop-shadow(0 16px 55px #36c6e75b)",
    "drop-shadow(0 18px 99px #FF658444)"
  ].join(" ");

  // Layering: some SVGs appear higher up (higher z-index)
  const z = 5 + layerIdx;
  // Unique filter per SVG
  const accentColor = ["#ff4ecd", "#23ce6b", "#FED502", "#36c6e7", "#ffbf00", "#ff654f", "#6C63FF"][iconIdx % 7];

  return (
    <div
      className={`sports-float-icon sports-move-unique ${isXL ? "very-large" : ""}`}
      aria-hidden="true"
      style={{
        animation: `${animClass} ${duration}s cubic-bezier(.36,1.3,.55,0.84) infinite ${direction}`,
        position: "absolute",
        left: 0, top: 0,
        pointerEvents: "none",
        willChange: "transform, filter",
        zIndex: z,
        opacity: 0.92,
        filter: `${shadow} brightness(${isXL ? 1.03 : 1.18}) saturate(1.23) drop-shadow(0 0 13px ${accentColor}91)`,
        mixBlendMode: "lighter",
        width: isXL ? "clamp(150px, 26vw, 49vw)" : "clamp(110px, 20vw, 38vw)",
        height: isXL ? "clamp(150px, 27vh, 49vh)" : "clamp(100px, 18vh, 36vh)",
        minWidth: isXL ? "120px" : "90px",
        minHeight: isXL ? "120px" : "90px"
      }}
    >
      {SPORTS_SVGS[iconIdx % SPORTS_SVGS.length].svg}
    </div>
  );
}

// Generates many more moving, varied sports SVGs in layers
function TrulyAnimatedSportsLayer() {
  // Distinct svg count, layer z-order, and randomness
  const TOTAL_ICONS = 11;
  const layers = [];
  for (let n = 0; n < TOTAL_ICONS; ++n) {
    // Each icon drawn from the available SVGs, layered with distinct paths
    // Assign random layer grouping for further depth
    layers.push(
      <AnimatedSportsSVG
        key={`bg-float-sports-${n}`}
        iconIdx={n % SPORTS_SVGS.length}
        animKey={`${n}-sports-k-${Math.floor(Math.random()* 100000)}`}
        total={TOTAL_ICONS}
        layerIdx={n}
      />
    );
  }
  return layers;
}

// PUBLIC_INTERFACE
function SportsBackground() {
  // Render vivid multi-gradient, animated stadium, and new wild SVGs
  return (
    <div className="iemo-bg-animated sports-animated-gradient" aria-hidden="true">
      {/* Sparkles always on top for a festival, trophy-glitter vibe */}
      <SparklesLayer count={33} />
      {/* Glowing animated stadium/light overlays as before */}
      <div className="sports-bg-lights-bg"></div>
      <div className="sports-bg-glow1"></div>
      <div className="sports-bg-glow2"></div>
      {/* Stadium shapes (pre-existing) */}
      <svg width="640" height="340" viewBox="0 0 640 340"
        className="sports-bg-stadium-arc" aria-hidden="true">
        <ellipse cx="300" cy="210" rx="290" ry="120" fill="white" opacity="0.17"/>
        <ellipse cx="390" cy="88" rx="185" ry="53" fill="#fff" opacity="0.07"/>
      </svg>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="sports-bg-line" style={{ top: `${16 + n * 13}vh` }}/>
      ))}
      <svg width="930" height="120" viewBox="0 0 930 120"
        className="sports-bg-bottom-ellipse" aria-hidden="true">
        <ellipse cx="465" cy="30" rx="340" ry="30" fill="#fff" opacity="0.15"/>
        <ellipse cx="465" cy="86" rx="240" ry="18" fill="#fff" opacity="0.1"/>
      </svg>
      {/* Ultra-animated, festive, large movable SVGs */}
      <TrulyAnimatedSportsLayer />
    </div>
  );
}

export default SportsBackground;
