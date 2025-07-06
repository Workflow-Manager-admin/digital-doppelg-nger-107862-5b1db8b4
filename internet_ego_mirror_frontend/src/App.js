import React, { useState, useEffect } from "react";
import "./App.css";
import SportsBackground from "./SportsBackground";

// Themed color palette (still used for vivid floating answer gradients)
const PALETTE = [
  "#ff4ecd", "#6c63ff", "#23ce6b", "#ffbf00", "#19e0ff", "#ff654f", "#fc1cff", "#FED502", "#36c6e7", "#FF6584"
];

function FloatingSportsIcons() { /* -- omitted for brevity; unchanged -- */ return null; } // not used

// Animated color blobs for background (see SportsBackground.js, used in App)
function AnimatedBackgroundBlobs() { /* -- omitted for brevity; not used -- */ return null; }

// Trivia questions convert to this UX schema
function parseTrivia(qset) {
  return qset.map(q => {
    const allAnswers = [q.correct_answer, ...q.incorrect_answers].map((a) => ({
      text: decodeHtml(a)
    }));
    // Shuffle
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    return {
      question: decodeHtml(q.question),
      answers: allAnswers,
      correct_answer: decodeHtml(q.correct_answer)
    };
  });
}

function decodeHtml(input) {
  if (!input) return "";
  let decoded = "";
  try { decoded = decodeURIComponent(input); } catch (e) { decoded = input; }
  const temp = document.createElement("textarea");
  temp.innerHTML = decoded;
  return temp.value;
}

function CrackerBlast({ x, y, onDone }) {
  // Firework effect: massive background SVG and vivid, big strokes/dots so always seen & celebratory
  React.useEffect(() => {
    const timeout = setTimeout(() => onDone && onDone(), 1200);
    return () => clearTimeout(timeout);
  }, [onDone]);

  // Fill the background, burst out from x,y as best-guess for visual anchor.
  // Center explosion, randomize color order, scatter rays for variety.
  // Our SVG will be as big as the viewport; ray origin is centered.
  const width = Math.max(window.innerWidth, 1400);
  const height = Math.max(window.innerHeight, 900);
  const centerX = width / 2;
  const centerY = height / 2;

  // Colors - more vivid (lots of bright, light-additive shades)
  const RAY_COLORS = [
    "#FFDE00", "#FF6584", "#36C6E7", "#23CE6B", "#FF4ECD", "#FEC800", "#FED502", "#ffffff",
    "#00FFA2", "#ffbf00", "#19e0ff", "#fc1cff", "#FFFBE8"
  ];
  const DOT_COLORS = [
    "#FFFAE3", "#FF4ECD", "#FED502", "#36C6E7", "#23CE6B", "#FF6584", "#fffbe8",
    "#FEC800", "#6C63FF", "#00FFA2", "#FFB000", "#fc1cff", "#FFF", "#e0ffef", "#ffd500", "#FF6584"
  ];

  return (
    <div
      className="cracker-blast"
      aria-hidden="true"
    >
      <span className="cracker-explosion">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            display: "block"
          }}
        >
          <g>
            {/* Massive vivid rays, evenly radiating, covers width/height */}
            {[...Array(28)].map((_, i) => {
              const angle = ((i * (360 / 28)) + ((i % 3) * 7)) % 360;
              // Alternate burst radii for visual variety, spread over much bigger area.
              const rayLen = (0.41 + 0.37 * (i % 2)) * Math.max(width, height);
              const color = RAY_COLORS[i % RAY_COLORS.length];
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + rayLen * Math.cos(angle * Math.PI / 180)}
                  y2={centerY + rayLen * Math.sin(angle * Math.PI / 180)}
                  stroke={color}
                  strokeWidth={Math.max(38, width / 31)}
                  strokeLinecap="round"
                  opacity="0.94"
                  style={{
                    filter: `drop-shadow(0 0 32px ${color}) brightness(1.44)`,
                    mixBlendMode: i % 3 === 0 ? "screen" : "lighter"
                  }}
                />
              );
            })}
            {/* Fat, blurred vivid dots at many radii */}
            {[...Array(28)].map((_, i) => {
              // More 'depth': larger # of layers, larger spread
              const angle = i * (360 / 28) + Math.random() * 17;
              const dist = 260 + Math.random() * 0.48 * Math.min(width, height);
              const size = 38 + Math.random() * ((i%2===0) ? 76 : 130);
              const color = DOT_COLORS[i % DOT_COLORS.length];
              return (
                <ellipse
                  key={`dot${i}`}
                  cx={centerX + dist * Math.cos(angle * Math.PI / 180)}
                  cy={centerY + dist * Math.sin(angle * Math.PI / 180)}
                  rx={size}
                  ry={size * (0.74 + Math.random() * 0.45)}
                  fill={color}
                  fillOpacity="0.79"
                  style={{
                    filter: `blur(${14 + Math.random()*9}px) drop-shadow(0 0 48px ${color}) brightness(1.22)`
                  }}
                />
              );
            })}
            {/* Giant soft glow at center */}
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={width / 8.5}
              ry={height / 8.6}
              fill="#fffbe8"
              fillOpacity="0.16"
              style={{
                filter: "blur(38px)"
              }}
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={width / 4.5}
              ry={height / 4.9}
              fill="#fcf9e5"
              fillOpacity="0.08"
              style={{
                filter: "blur(64px)"
              }}
            />
          </g>
        </svg>
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [step, setStep] = useState(0); // 0: Welcome, ...N: quiz, N+1: Results
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [answers, setAnswers] = useState([]);
  const [copied, setCopied] = useState(false);

  const [crackerBlasts, setCrackerBlasts] = useState([]);

  async function fetchQuestions() {
    setLoading(true);
    setFetchError("");
    setQuestions([]);
    setAnswers([]);
    setCrackerBlasts([]);
    const DIFFICULTY = ["easy", "medium", "hard"][Math.floor(Math.random() * 3)];
    const urlBase = "https://opentdb.com/api.php?amount=8&type=multiple&category=21&encode=url3986";
    let url = urlBase;
    if (Math.random() < 0.8) url += `&difficulty=${DIFFICULTY}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (!data.results || !data.results.length) {
        setFetchError(
          "Could not load sports questions from server. Please try again."
        );
        setLoading(false);
        return;
      }
      setQuestions(parseTrivia(data.results));
    } catch (e) {
      setFetchError("Failed to load. Please check your connection.");
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  function handleStart() {
    fetchQuestions();
    setStep(1);
  }

  // PUBLIC_INTERFACE
  function handleAnswer(answerIdx, evt) {
    let x = null, y = null;
    if (evt?.target) {
      const rect = evt.target.getBoundingClientRect();
      x = rect.left + rect.width / 2 + window.scrollX;
      y = rect.top + rect.height / 2 + window.scrollY;
    } else {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2.1;
    }
    setCrackerBlasts(prev => [
      ...prev,
      { x, y, id: Date.now() + Math.random() }
    ]);
    setAnswers(prev => [...prev, answerIdx]);
    setStep(s => s + 1);
  }
  function handleCrackerBlastDone(id) {
    setCrackerBlasts(blasts => blasts.filter(b => b.id !== id));
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setStep(0);
    setAnswers([]);
    setCopied(false);
    setQuestions([]);
    setFetchError("");
    setLoading(false);
  }

  function getShareText() {
    const { correctCount, total } = computeScore(answers, questions);
    return `🏆 My Sports Knowledge Quiz Score: ${correctCount}/${total} (${total === 0 ? 0 : Math.round(correctCount / total * 100)}%)`;
  }
  function handleShare() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  }

  useEffect(() => {
    document.body.style.background =
      "radial-gradient(circle at 55vw 29vh,#fffad0 0%,#e0ffef 45%,#d5fcf6 90%)";
    document.body.style.transition = "background .5s";
  }, [step, questions.length]);

  const AnimationWrappers = {
    fade: (children, delay = 0) => (
      <div className="iemo-float-fadein" style={{ animationDelay: `${delay}ms` }}>{children}</div>
    ),
    slideUp: (children, delay = 0) => (
      <div className="iemo-float-slideup" style={{ animationDelay: `${delay}ms` }}>{children}</div>
    ),
    bounce: (children, delay = 0) => (
      <div className="iemo-float-bounce" style={{ animationDelay: `${delay}ms` }}>{children}</div>
    ),
    glow: (children, delay = 0) => (
      <div className="iemo-glow-float" style={{ animationDelay: `${delay}ms` }}>{children}</div>
    ),
  };

  return (
    <div className="iemo-app float-ui-app">
      <SportsBackground />
      {/* Firework cracker effect overlay - appears above everything else */}
      <div className="cracker-blast-container" aria-hidden="true" style={{ pointerEvents: "none" }}>
        {crackerBlasts.map(({ x, y, id }) =>
          <CrackerBlast key={id} x={x} y={y} onDone={() => handleCrackerBlastDone(id)} />
        )}
      </div>
      {step === 0 && AnimationWrappers.fade(<WelcomeScreen onStart={handleStart} />, 20)}
      {loading && AnimationWrappers.bounce(
        <div style={{
          color: "#ff4ecd",
          fontWeight: 700,
          fontSize: "1.3em",
          minHeight: "12em",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "none", boxShadow: "none", border: "none"
        }}>
          <span className="rainbow-spinner"></span>
          <div style={{ marginTop: "2em" }}>Loading new quiz...</div>
        </div>, 30
      )}
      {fetchError && AnimationWrappers.bounce(
        <div style={{
          color: "#ff654f",
          fontWeight: 800,
          background: "none",
          border: "none",
          borderRadius: 0,
          padding: "1.4em",
          textAlign: "center",
          boxShadow: "none"
        }}>
          {fetchError}
          <button className="iemo-btn iemo-btn-restart iemo-floating-btn-bounce" onClick={handleRestart} style={{ marginTop: "2em" }}>Retry</button>
        </div>, 60
      )}
      {(step > 0 && step <= (questions.length || 0) && !loading && !fetchError) &&
        AnimationWrappers.slideUp(
          <QuestionScreen
            questionIdx={step - 1}
            total={questions.length}
            question={questions[step - 1]}
            onAnswer={handleAnswer}
            selected={answers[step - 1]}
            floatUI
          />, 120
        )}
      {(step > (questions.length || 0) && (questions.length > 0) && !loading && !fetchError) &&
        AnimationWrappers.fade(
          <ResultScreen
            answers={answers}
            questions={questions}
            onRestart={handleRestart}
            onShare={handleShare}
            copied={copied}
            shareText={getShareText()}
            floatUI
          />, 180
        )
      }
      {/* Footer removed per request: No legacy attribution text should remain */}
    </div>
  );
}

/**
 * Refactored WelcomeScreen for new design: Trophy cup SVG badge with all 4 sports icons inside, extremely visible animated title and tagline, huge animated Start button.
 */
function WelcomeScreen({ onStart }) {
  // PUBLIC_INTERFACE
  // Trophy cup SVG with cricket bat, red ball, football, and tennis racquet artfully packed inside.
  // Ultra-bright, animated site title/tagline, big animated Start button.

  return (
    <div
      style={{
        position: "relative",
        zIndex: 160,
        width: "100vw",
        maxWidth: "99vw",
        margin: "7vh auto 0 auto",
        textAlign: "center",
        background: "none",
        boxShadow: "none",
        borderRadius: 0,
        padding: 0,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* Trophy cup badge with clear, stylized sports gear packed inside */}
      <div
        style={{
          display: "block",
          margin: "0 auto 2em auto",
          width: "clamp(222px,33vw,340px)",
          height: "clamp(222px,33vw,340px)",
          position: "relative",
          filter: "drop-shadow(0 9px 44px #ff4ecdba) drop-shadow(0 3px 41px #36c6e7b0)",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 340 340"
          style={{ maxWidth: "99vw", display: "block" }}
          aria-label="Energetic Sports Trophy Badge"
        >
          <defs>
            <linearGradient id="cupGoldA" x1="7%" y1="35%" x2="93%" y2="84%">
              <stop offset="0%" stopColor="#fff4a3"/>
              <stop offset="43%" stopColor="#ffd902"/>
              <stop offset="100%" stopColor="#ff8536"/>
            </linearGradient>
            <radialGradient id="cupShine" cx="52%" cy="19%" r="98%">
              <stop offset="18%" stopColor="#fff"/>
              <stop offset="92%" stopColor="#ffe68c90"/>
              <stop offset="100%" stopColor="#fffde780"/>
            </radialGradient>
            <radialGradient id="cupBodyFill" cx="47%" cy="44%" r="80%">
              <stop offset="0%" stopColor="#fffbe0"/>
              <stop offset="72%" stopColor="#ffd502"/>
              <stop offset="100%" stopColor="#ffe36b" />
            </radialGradient>
            <linearGradient id="batBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0.23" stopColor="#ffeab2"/>
              <stop offset="0.68" stopColor="#f7cc82"/>
              <stop offset="1" stopColor="#c18240"/>
            </linearGradient>
            <linearGradient id="batGrip" x1="10%" y1="15%" x2="85%" y2="78%">
              <stop offset="0.02" stopColor="#eb3451"/>
              <stop offset="0.96" stopColor="#ab0435"/>
            </linearGradient>
            <radialGradient id="ballRed" cx="51%" cy="51%" r="75%">
              <stop offset="0%" stopColor="#ff5f42"/>
              <stop offset="74%" stopColor="#bc130c"/>
              <stop offset="100%" stopColor="#8e121b"/>
            </radialGradient>
            <linearGradient id="arenaArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0.1" stopColor="#23ce6b"/>
              <stop offset="0.52" stopColor="#36c6e7"/>
              <stop offset="1" stopColor="#6C63FF"/>
            </linearGradient>
            <linearGradient id="goalLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffbf00"/>
              <stop offset="100%" stopColor="#FF6584"/>
            </linearGradient>
            <linearGradient id="fieldLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75"/>
              <stop offset="100%" stopColor="#a0e7ff" stopOpacity="0.27"/>
            </linearGradient>
            <radialGradient id="stadiumGlow" cx="50%" cy="65%" r="61%">
              <stop offset="0%" stopColor="#fffbe0" stopOpacity="0.41"/>
              <stop offset="95%" stopColor="#23ce6b" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* --- STADIUM/ARENA and TRACK/LINES BG (inside cup shape) --- */}
          {/* Stadium arena ellipse backdrop */}
          <ellipse cx="170" cy="143" rx="82" ry="34" fill="url(#stadiumGlow)" />
          {/* Arena outline */}
          <ellipse cx="170" cy="147" rx="79" ry="27" fill="none" stroke="url(#arenaArc)" strokeWidth="8" opacity="0.33"/>
          {/* Field lines (track curves) */}
          <ellipse cx="170" cy="154" rx="60" ry="13" fill="none" stroke="url(#fieldLine)" strokeWidth="4" opacity="0.7"/>
          <ellipse cx="170" cy="158" rx="38" ry="8.5" fill="none" stroke="url(#fieldLine)" strokeWidth="2" opacity="0.56"/>
          {/* Bold goal line (bottom band) */}
          <rect x="92" y="175" width="156" height="8.5" rx="2.4" fill="url(#goalLine)" opacity="0.76"/>
          {/* Track hash marks left */}
          {[0,1,2].map(i=>(
            <rect key={"hashleft"+i} x={99+13*i} y={165-3*i} width="8" height="2.3" rx="1.1" fill="#23ce6b" opacity="0.35"/>
          ))}
          {/* Track hash marks right */}
          {[0,1,2].map(i=>(
            <rect key={"hashright"+i} x={169+18*i} y={156+4*i} width="8" height="2.3" rx="1.1" fill="#36c6e7" opacity="0.35"/>
          ))}
          {/* --- END ARENA/SPORTS FIELD LAYER --- */}
          {/* Trophy handles: extra bold */}
          <path
            d="M57,87 Q-12,141 62,222 Q121,278 160,192"
            fill="none"
            stroke="url(#cupGoldA)"
            strokeWidth="15"
            strokeLinecap="round"
            opacity="0.93"
          />
          <path
            d="M283,87 Q352,141 278,222 Q219,278 180,192"
            fill="none"
            stroke="url(#cupGoldA)"
            strokeWidth="15"
            strokeLinecap="round"
            opacity="0.93"
          />
          {/* Cup body (large, stylized) */}
          <ellipse
            cx="170"
            cy="133"
            rx="93"
            ry="82"
            fill="url(#cupBodyFill)"
            stroke="url(#cupGoldA)"
            strokeWidth="11"
            opacity="0.99"
          />
          {/* Cup rim: strong */}
          <ellipse
            cx="170"
            cy="81"
            rx="112"
            ry="32"
            fill="url(#cupShine)"
            stroke="url(#cupGoldA)"
            strokeWidth="14"
            opacity="0.77"
          />
          {/* Base */}
          <rect
            x="115"
            y="222"
            width="110"
            height="43"
            rx="20"
            fill="url(#cupGoldA)"
            stroke="#856319"
            strokeWidth="10"
            opacity="0.92"
          />
          {/* Plinth oval */}
          <ellipse
            cx="170"
            cy="272"
            rx="46"
            ry="18"
            fill="#fffbe8"
            opacity="0.26"
          />
          {/* Shine center */}
          <ellipse
            cx="170"
            cy="130"
            rx="36"
            ry="14"
            fill="#fff9be"
            opacity="0.19"
          />
          {/* --- INSIDE: STYLIZED SPORTS GEAR --- */}
          {/* Cricket bat */}
          <g>
            <rect
              x="84"
              y="64"
              width="21"
              height="90"
              rx="7"
              fill="url(#batBody)"
              stroke="#bc9454"
              strokeWidth="2"
              transform="rotate(-21 94 112)"
            />
            {/* Bat grip */}
            <rect
              x="93"
              y="44"
              width="10"
              height="22"
              rx="3.1"
              fill="url(#batGrip)"
              stroke="#fff"
              strokeWidth="1"
              transform="rotate(-21 98 54)"
            />
          </g>
          {/* Red cricket ball */}
          <g>
            <circle cx="81" cy="177" r="15.5" fill="url(#ballRed)" stroke="#7e070f" strokeWidth="2.2"/>
            <ellipse cx="81" cy="173" rx="3.2" ry="8.3" fill="#fff" opacity="0.07"/>
            <path d="M67 177 Q81 158 95 177" stroke="#fff" strokeDasharray="2.4,5.2" strokeWidth="1.32" fill="none" />
            <ellipse cx="81" cy="177" rx="11" ry="6.5" fill="#ffe36b" opacity="0.045"/>
          </g>
          {/* Football (soccer) */}
          <g>
            <circle cx="116" cy="186" r="22" fill="#fff" stroke="#222" strokeWidth="3"/>
            {/* Black pentagon patch */}
            <polygon points="116,170 130,179 125,195 116,199 107,195 102,179" fill="#222"/>
            {/* Football seams */}
            <path d="M104 195 Q116 204 128 195" stroke="#444" strokeWidth="1.4" fill="none"/>
            <ellipse cx="116" cy="186" rx="18" ry="10" fill="#ddd" opacity="0.13"/>
          </g>
          {/* Tennis racquet and ball */}
          <g>
            {/* Head */}
            <ellipse cx="230" cy="109" rx="26" ry="44" fill="#36c6e7" stroke="#23ce6b" strokeWidth="4" transform="rotate(17 230 109)" />
            {/* Strings – 5 vertical */}
            {
              Array.from({ length: 5 }).map((_, idx) => (
                <line
                  key={`tenstrv2-${idx}`}
                  x1={230-17.5+idx*8.8} y1={70} x2={230-8+idx*7} y2={152}
                  stroke="#fffbee"
                  strokeWidth="1.1"
                  opacity="0.74"
                  transform="rotate(17 230 109)"
                />
              ))
            }
            {/* Strings – 2 horizontal */}
            <line x1={209} y1={114} x2={251} y2={116} stroke="#fffbee" strokeWidth="1.1" opacity="0.56" transform="rotate(17 230 109)" />
            <line x1={213} y1={101} x2={247} y2={105} stroke="#fffbee" strokeWidth="1.1" opacity="0.35" transform="rotate(17 230 109)" />
            {/* Handle */}
            <rect x="221" y="154" width="16" height="34" rx="5.6" fill="#1ccda6" stroke="#25b981" strokeWidth="2.1" transform="rotate(24 229 171)" />
            {/* Tennis ball */}
            <circle cx="259" cy="164" r="15.5" fill="#fefd55" stroke="#b7ae22" strokeWidth="2"/>
            <path d="M248 156 Q269 153 267 172" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.45"/>
          </g>
          {/* Extra: Sporty color bands overlay for high-energy */}
          <ellipse
            cx="170"
            cy="142"
            rx="88"
            ry="36"
            fill="none"
            stroke="url(#arenaArc)"
            strokeWidth="6.7"
            opacity="0.55"
            style={{ filter: "blur(1.4px)" }}
          />
          {/* End SVG */}
        </svg>
      </div>
      {/* Extra-bold, animated site title in RED */}
      <div
        style={{
          margin: "0 0 0.6em 0",
          fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
          fontWeight: 990,
          fontSize: "clamp(2.95em, 8vw, 5.4em)",
          letterSpacing: "-0.024em",
          color: "#ff2222",
          lineHeight: 1.04,
          textShadow:
            "0 9.5px 42px #fff, 0 2.8px 31px #ff3a69e6, 0 0px 26px #ff5959d9, 0 3.8px 31px #6d0000b2",
          filter: "brightness(1.47) drop-shadow(0 5px 30px #ff5555c4)",
          animation: "pop-red-title 1.17s cubic-bezier(.62,-0.23,.54,1.38) both, neon-glow-title-red 1.47s ease-in-out infinite alternate"
        }}
      >
        The Clueless Cup
      </div>
      {/* Extra-bold animated tagline in BLUE */}
      <div
        style={{
          fontWeight: 950,
          fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
          fontSize: "clamp(1.48em,3vw,2.29em)",
          color: "#0d4fff",
          margin: "0 0 2.15em 0",
          textShadow:
            "0 4.8px 24px #36c6e9b0, 0 3.5px 22px #127effc4, 0 0px 25px #2d71fdc2, 0 2px 11px #fff",
          letterSpacing: "0.012em",
          filter: "brightness(1.43) drop-shadow(0 4px 17px #1eafffaf)",
          animation: "float-blue-tagline 1.13s cubic-bezier(.63,-0.07,.57,1.18) both, neon-glow-tagline-blue 1.77s ease-in-out infinite alternate"
        }}
      >
        For those who bench press trivia, not weights.
      </div>
      {/* 
        -- Add keyframes for new title/tagline animation colors (much brighter/cheerful, bounce & pulsate shadow/neon!)
      */}
      <div>
        <button
          className="iemo-btn iemo-btn-accent iemo-floating-btn-bounce"
          onClick={onStart}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#FF6584 99%)",
            fontSize: "clamp(2.45em,5vw,3.8em)",
            fontWeight: 900,
            color: "#fff",
            border: "none",
            borderRadius: "3.6em",
            boxShadow: "0 8px 49px #23ce6bb6, 0 2px 28px #fed50284",
            textShadow: "0 0px 26px #fff, 0 2.3px 25px #ff4ecdcb",
            padding: "1.22em 2.77em",
            margin: "1.1em 0 2.1em 0",
            outline: "none",
            cursor: "pointer",
            animation: "sports-bounce-glow 1.1s cubic-bezier(.66,.09,.33,1.35) infinite alternate, neon-glow-btn 2.6s ease-in-out infinite alternate",
            filter: "brightness(1.13)"
          }}
        >
          <span role="img" aria-label="start whistle" style={{ fontSize: "1.16em", verticalAlign: "middle", marginRight: "0.48em"}}>🏆</span>
          Start
          <span role="img" aria-label="tada" style={{ fontSize: "1.16em", verticalAlign: "middle", marginLeft: "0.48em"}}>🎉</span>
        </button>
      </div>
      {/* Keyframes for welcome screen (overrides if needed) */}
      <style>
        {`
          /* Animated pop for red site title */
          @keyframes pop-red-title {
            0%   {opacity:0;transform:scale(0.7) translateY(60px);filter:brightness(2.8) blur(10px);}
            73%  {opacity:1;transform:scale(1.22) translateY(-12px);filter:brightness(1.7) blur(1.3px);}
            81%  {opacity:1;transform:scale(0.95) translateY(5px);filter:brightness(1.4);}
            100% {opacity:1;transform:scale(1.09) translateY(0);filter:brightness(1.63) blur(0);}
          }
          @keyframes neon-glow-title-red {
            0% { filter: drop-shadow(0 0 28px #ff525785) drop-shadow(0 0 25px #fff5eece);}
            53% { filter: drop-shadow(0 0 63px #ff3434d2) drop-shadow(0 0 31px #fffbeaed);}
            100% { filter: drop-shadow(0 0 53px #ff4ecd) drop-shadow(0 0 44px #ffeede);}
          }
          /* Animated blue tagline - float w/ glow */
          @keyframes float-blue-tagline {
            0%   {opacity:0;transform:translateY(59px) scale(0.89) skewX(-8deg);filter:blur(3.6px) brightness(2.41);}
            63%  {opacity:1;transform:translateY(-11px) scale(1.17) skewX(7deg);filter:blur(0.8px) brightness(1.49);}
            81%  {transform:translateY(7px) scale(0.98);filter:blur(0.4px) brightness(1.23);}
            100% {opacity:1;transform:translateY(0) scale(1.08);filter:blur(0) brightness(1.33);}
          }
          @keyframes neon-glow-tagline-blue {
            0%   { filter: drop-shadow(0 0 17px #338affc6) brightness(1.17);}
            51%  { filter: drop-shadow(0 0 31px #53ccff) brightness(1.31);}
            100% { filter: drop-shadow(0 0 23px #87f2ffd3) brightness(1.19);}
          }
          /* Previous styles (welcome yellow/pink) for backward compat: */
          @keyframes pop-welcome-title {
            0%   {opacity:0;transform:scale(0.7) translateY(60px);filter:brightness(2.0) blur(6px);}
            83%  {opacity:1;transform:scale(1.19) translateY(-10px);filter:brightness(1.21) blur(0.5px);}
            89%  {opacity:1;transform:scale(0.93) translateY(3px);filter:brightness(1.13);}
            100% {opacity:1;transform:scale(1.03) translateY(0);filter:brightness(1.17) blur(0px);}
          }
          @keyframes neon-glow-title {
            0% { filter: drop-shadow(0 0 23px #fed50292) drop-shadow(0 0 19px #36c6e7ce);}
            51% { filter: drop-shadow(0 0 49px #ff4ecdff) drop-shadow(0 0 38px #36c6e7b7);}
            100% { filter: drop-shadow(0 0 39px #23ce6bd3) drop-shadow(0 0 28px #fed502c1);}
          }
          @keyframes float-tagline {
            0%   {opacity:0;transform:translateY(49px) scale(0.89) skewX(-8deg);filter:blur(3.3px) brightness(2.13);}
            65%  {opacity:1;transform:translateY(-9px) scale(1.15) skewX(4deg);filter:blur(0.7px) brightness(1.23);}
            86%  {transform:translateY(3px) scale(0.98);filter:blur(0.3px) brightness(1.10);}
            100% {opacity:1;transform:translateY(0) scale(1.05);filter:blur(0) brightness(1.16);}
          }
          @keyframes neon-glow-tagline {
            0%   { filter: drop-shadow(0 0 20px #fed50285) brightness(1.07);}
            48%  { filter: drop-shadow(0 0 33px #36c6e7b4) brightness(1.21);}
            100% { filter: drop-shadow(0 0 22px #ff4ecdce) brightness(1.10);}
          }
          @keyframes sports-bounce-glow {
            0%   { transform: translateY(0) scale(1); filter: drop-shadow(0 0 19px #36c6e766) brightness(1.19);}
            18%  { transform: translateY(-11px) scale(1.10); filter: drop-shadow(0 0 33px #fed502bb) brightness(1.20);}
            45%  { transform: translateY(7px) scale(1.05);  filter: drop-shadow(0 0 31px #23ce6bcc) brightness(1.13);}
            63%  { transform: translateY(-7px) scale(1.09); filter: drop-shadow(0 0 35px #ff4ecd98) brightness(1.25);}
            81%  { transform: translateY(7px) scale(1.06);  filter: drop-shadow(0 0 29px #fed502c0) brightness(1.11);}
            100% { transform: translateY(0) scale(1.01);    filter: drop-shadow(0 0 29px #23ce6baa) brightness(1.21);}
          }
          @keyframes neon-glow-btn {
            0%,100% { filter: drop-shadow(0 0 20px #fed502a6) drop-shadow(0 0 15px #ff4ecdbe);}
            55% { filter: drop-shadow(0 0 38px #23ce6bcc) drop-shadow(0 0 26px #ffd502d4);}
          }
        `}
      </style>
    </div>
  );
}

/* --- QUESTION SCREEN, 100% floating, no boxes --- */
function QuestionScreen({ questionIdx, total, question, onAnswer, selected, floatUI }) {
  if (!question) return null;
  const delayBase = 80 + 40 * (questionIdx % 5);
  return (
    <div
      style={{
        position: "relative",
        zIndex: 150,
        width: "100%",
        maxWidth: "920px",
        margin: "8vh auto 5vh auto",
        padding: 0,
        background: "none",
        boxShadow: "none",
        pointerEvents: "auto"
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: "0.7em",
          marginLeft: 3,
          animationDelay: `${delayBase + 80}ms`
        }}>
        <span
          style={{
            background: PALETTE[questionIdx % PALETTE.length],
            color: "#fff",
            fontWeight: 900,
            fontSize: "clamp(1.19em,2.8vw,1.67em)",
            borderRadius: "1.75em",
            padding: "5px 33px 5px 22px",
            marginRight: 0,
            letterSpacing: "0.13em",
            boxShadow: "none",
            textShadow: "0 3px 16px #ff4ecd, 0 0 24px #23ce6baa"
          }}>
          Q{questionIdx + 1}
        </span>
        <span style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: "clamp(1.11em,2.7vw,1.51em)",
          textShadow: "0 1.6px 13px #23ce6b,0 0 15px #fff"
        }}>
          of {total}
        </span>
      </div>
      <h2
        className="rampage-gradient"
        style={{
          fontWeight: 900,
          fontSize: "clamp(1.7em,4vw,2.52em)",
          color: "#fff",
          lineHeight: 1.17,
          marginBottom: "1.5em",
          letterSpacing: "0.005em",
          textShadow: "0 9px 32px #fffccf, 0 0px 20px #ff4ecd,0 0px 20px #23ce6be9",
          filter: "brightness(1.17) saturate(1.22)",
          animationDelay: `${delayBase + 185}ms`
        }}>
        {question.question}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2em",
          width: "100%",
          alignItems: "center"
        }}
      >
        {question.answers.map((a, idx) => (
          <button
            key={a.text}
            className="iemo-answer-card iemo-float-answer-btn"
            style={{
              animationDelay: `${delayBase + 300 + idx * 70}ms`,
              width: "clamp(120px,65vw,540px)",
              minWidth: "110px",
              minHeight: "2.2em",
              margin: "0.17em 0",
              border: "none",
              borderRadius: "3.1em",
              fontWeight: selected === idx ? 900 : 800,
              fontSize: "clamp(1.33em, 3vw, 1.67em)",
              color: selected === idx ? "#fed502" : "#fff",
              background: "none",
              outline: "none",
              boxShadow: "none",
              textShadow:
                selected === idx
                  ? "0 6px 32px #23ce6bbd, 0 4px 14px #ff4ecdbe, 0 3px 22px #fff"
                  : "0 2px 14px #23ce6b, 0 2px 10px #ff4ecd, 0 0px 24px #6c63ff",
              cursor: typeof selected !== "undefined" ? "default" : "pointer",
              transition: "all .19s cubic-bezier(.44,.71,.44,1)",
              pointerEvents: typeof selected !== "undefined" ? "none" : "auto"
            }}
            tabIndex="0"
            aria-pressed={selected === idx}
            aria-label={a.text}
            disabled={typeof selected !== "undefined"}
            onClick={(evt) => onAnswer(idx, evt)}
          >
            <b>{a.text}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

// Compute quiz score summary
function computeScore(answers, questions) {
  let correctCount = 0, total = 0;
  if (answers && questions && questions.length === answers.length && questions.length > 0) {
    total = questions.length;
    correctCount = answers.reduce((cnt, ansIdx, idx) => {
      const currQ = questions[idx];
      if (
        typeof ansIdx !== "undefined" &&
        currQ &&
        currQ.answers &&
        currQ.correct_answer &&
        currQ.answers[ansIdx].text === currQ.correct_answer
      ) {
        return cnt + 1;
      }
      return cnt;
    }, 0);
  }
  return { correctCount, total };
}

// PUBLIC_INTERFACE
function ResultPieChart({ correct, total }) {
  const incorrect = Math.max(0, total - correct);
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [hover, setHover] = React.useState(null);
  const [animPercent, setAnimPercent] = React.useState(0);
  React.useEffect(() => {
    let raf;
    let start;
    const target = percent;
    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      let prog = Math.min(1, elapsed / 900);
      setAnimPercent(Math.round(target * prog));
      if (prog < 1) raf = requestAnimationFrame(animate);
      else setAnimPercent(target);
    }
    setAnimPercent(0);
    raf = requestAnimationFrame(animate);
    return () => raf && cancelAnimationFrame(raf);
  }, [percent, correct, total]);

  const size = 157;
  const radius = 64;
  const center = size / 2;
  const STROKE = 28;
  function describeArc(cx, cy, r, pStart, pEnd) {
    const startAngle = (pStart / 100) * 360;
    const endAngle = (pEnd / 100) * 360;
    const polarToCartesian = (cx, cy, r, angleDeg) => {
      const rad = ((angleDeg - 90) * Math.PI) / 180.0;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
      };
    };
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArc, 0, end.x, end.y
    ].join(" ");
  }
  const displayedPercent = Math.max(0, Math.min(100, animPercent));
  const correctEnd = total === 0 ? 0 : (displayedPercent / 100) * 100;
  const incorrectStart = correctEnd;
  const SLICE_CONFIG = [
    {
      d: describeArc(center, center, radius, 0, correctEnd),
      color: "#23CE6B",
      label: `${percent}% Correct`,
      desc: `${correct} out of ${total} Correct`,
      idx: 0,
      visible: correct > 0 && total > 0 && displayedPercent > 0
    },
    {
      d: describeArc(center, center, radius, incorrectStart, 100),
      color: "#FF6584",
      label: `${100 - percent}% Incorrect`,
      desc: `${incorrect} out of ${total} Incorrect`,
      idx: 1,
      visible: incorrect > 0 && total > 0 && displayedPercent === percent
    },
  ];

  return (
    <div
      style={{
        width: size,
        height: size,
        marginBottom: "1.4em",
        position: "relative",
        userSelect: "none",
        cursor: "default"
      }}
      aria-label={`Quiz Results Pie Chart. ${percent}% correct, ${100 - percent}% incorrect.`}
      tabIndex={0}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          background: "none",
          borderRadius: "50%",
          display: "block",
          boxShadow: "none"
        }}
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#ece4fb"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Render each arc segment */}
        {SLICE_CONFIG.map(
          (seg) =>
            seg.visible && (
              <path
                key={seg.idx}
                d={seg.d}
                stroke={seg.color}
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
                tabIndex={0}
                onMouseOver={() => setHover(seg.idx)}
                onFocus={() => setHover(seg.idx)}
                onMouseOut={() => setHover(null)}
                onBlur={() => setHover(null)}
                style={{
                  filter:
                    hover === seg.idx
                      ? `drop-shadow(0 0 12px ${seg.color}cc)`
                      : "",
                  cursor: "pointer",
                  transition: "filter 0.18s cubic-bezier(.42,.62,.52,.91)",
                  outline: hover === seg.idx ? `3px dashed ${seg.color}` : "none",
                }}
                aria-label={seg.label}
              />
            )
        )}
      </svg>
      {/* Center info donut label – Now purely floating, no bg/box, vivid bold */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          flexDirection: "column",
          zIndex: 2,
        }}
      >
        <div
          style={{
            background: "none",
            borderRadius: 0,
            padding: "0.23em 0.27em",
            fontWeight: 900,
            fontSize: "1.66em",
            color: "#fed502",
            boxShadow: "none",
            textShadow: "0 2px 14px #23ce6b, 0 2px 10px #ff4ecd95, 0 0px 24px #6c63ff67",
            transition: "background 0.23s",
            lineHeight: 1,
          }}
        >
          {percent}%
        </div>
        <div
          style={{
            fontSize: "0.99em",
            fontWeight: 800,
            color:
              hover === 0
                ? "#23ce6b"
                : hover === 1
                  ? "#FF6584"
                  : "#fff",
            marginTop: "3.5px",
            minHeight: "1.4em",
            background: "none",
            textShadow: "0 2.5px 10px #23ce6b77, 0 4.5px 18px #ff4ecd94, 0 0px 36px #6c63ff49"
          }}
          aria-live="polite"
        >
          {hover === 0
            ? SLICE_CONFIG[0].desc
            : hover === 1
              ? SLICE_CONFIG[1].desc
              : "Score Accuracy"}
        </div>
      </div>
      {/* Tooltips on hover */}
      {hover != null && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            transform: "translate(-50%, -125%)",
            zIndex: 4,
            background: "#fff8fc",
            color: hover === 0 ? "#23ce6b" : "#FF6584",
            borderRadius: "13px",
            padding: "0.48em 1.1em",
            fontWeight: 800,
            fontSize: "1.01em",
            boxShadow:
              "0 2px 18px #ff4ecd23, 0 4px 18px #23ce6b18, 0 0.4px 4px #6c63ff18",
            pointerEvents: "none",
            border: `2px solid ${hover === 0 ? "#23CE6B" : "#FF6584"}`,
            opacity: 0.97,
            transition: "opacity 0.13s cubic-bezier(.45,.64,.52,.97)",
          }}
        >
          {SLICE_CONFIG[hover].label}
        </div>
      )}
      {/* Accessible legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.99em",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: "#23CE6B",
              display: "inline-block",
              marginRight: 6,
              boxShadow: "0 0px 9px #23ce6baa"
            }}
          />
          <span style={{ color: "#23CE6B" }}>Correct</span>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.99em",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: 15,
              height: 15,
              borderRadius: "50%",
              background: "#FF6584",
              display: "inline-block",
              marginRight: 6,
              boxShadow: "0 0px 9px #ff658488"
            }}
          />
          <span style={{ color: "#FF6584" }}>Incorrect</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Refactored ResultScreen – floating, vivid, no background/box
 */
function ResultScreen({ answers, questions, onRestart, onShare, copied, shareText, floatUI }) {
  const { correctCount, total } = computeScore(answers, questions);
  let playMessage = "";
  if (total > 0) {
    const percent = Math.round((correctCount / total) * 100);
    if (percent >= 90) {
      const highJokes = [
        "🏆 You're the MVP! Are you secretly a commentator?",
        "🏅 Hall of Fame alert! Your sport facts just set a new record.",
        "🎉 You scored more than a referee's whistle at the World Cup!",
        "🥇 If sports knowledge were an Olympic event, you'd win gold!"
      ];
      playMessage = highJokes[Math.floor(Math.random() * highJokes.length)];
    } else if (percent >= 60) {
      const midHighJokes = [
        "💪 Solid performance—you'd own the local sports bar quiz!",
        "👏 Not bad! Your trivia game is strong, give yourself a victory lap.",
        "🥈 You'd make the playoffs—just work on those fundamentals!",
        "😎 Your sports memory is almost as good as instant replay!"
      ];
      playMessage = midHighJokes[Math.floor(Math.random() * midHighJokes.length)];
    } else if (percent >= 40) {
      const midLowJokes = [
        "😄 You watch the highlights, don’t you?",
        "🤷‍♂️ You might call a timeout to check those answers!",
        "⚾ Swing and a miss, but hey, there's always next season.",
        "🏀 Almost a triple-double! Study up for the rematch."
      ];
      playMessage = midLowJokes[Math.floor(Math.random() * midLowJokes.length)];
    } else {
      const lowJokes = [
        "🤔 Time to check the rulebook! Maybe quiz the mascot next time.",
        "🦆 You're more waterboy than wonderkid—study up for the next game!",
        "⛳️ Missed the green, but at least you kept score!",
        "🚴 Looks like you just crashed into the trivia barriers. Try again!"
      ];
      playMessage = lowJokes[Math.floor(Math.random() * lowJokes.length)];
    }
  }
  const [animationIdx] = useState(() => Math.floor(Math.random() * 6));
  const Animation = () => <></>;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 160,
        maxWidth: "99vw",
        margin: "8vh auto 8vh auto",
        background: "none",
        border: "none",
        borderRadius: 0,
        padding: 0,
        boxShadow: "none",
        textAlign: "center"
      }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.2em"
      }}>
        <span style={{ filter: "none" }}>
          <Animation />
        </span>
        <ResultPieChart correct={correctCount} total={total} />
      </div>
      <div style={{
        fontWeight: 900,
        fontSize: "clamp(1.36em, 3.4vw, 2.24em)",
        color: "#fff",
        margin: "0.8em auto 0.7em auto",
        textShadow: "0 2.7px 17px #23ce6b,0 1.5px 14px #ff4ecdbe,0 0px 28px #fffcd7b8"
      }}>
        You got <span style={{ color: "#23CE6B" }}>{correctCount}</span> out of <span style={{ color: "#FF6584" }}>{total}</span> correct!
        <br />
        <span style={{ color: "#fed502", fontWeight: 900 }}>
          {total === 0 ? 0 : Math.round((correctCount / total) * 100)}% correct
        </span>
      </div>
      {playMessage && (
        <div style={{
          fontWeight: 900,
          fontSize: "clamp(1.14em, 2.5vw, 1.56em)",
          color: "#fff",
          margin: "2.1em auto 2.3em auto",
          textShadow: "0 2.2px 14px #ff4ecdbe, 0 0 15px #23ce6bad"
        }}>
          {playMessage}
        </div>
      )}
      <div style={{
        margin: "2em 0 0.9em 0",
        display: "flex",
        gap: "2.7vw",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%"
      }}>
        <button
          className="iemo-btn iemo-btn-share iemo-floating-btn-bounce"
          onClick={onShare}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#36c6e7,#ffbf00 89%)",
            color: "#fff", fontWeight: 900,
            borderRadius: "2.6em",
            fontSize: "clamp(1.17em,2.7vw,1.51em)",
            boxShadow: "none",
            textShadow: "0 2px 19px #fff,0 0px 11px #FF6584ee"
          }}
        >
          {copied ? "Copied!" : "📋 Copy My Score"}
        </button>
        <button
          className="iemo-btn iemo-btn-restart iemo-floating-btn-bounce"
          onClick={onRestart}
          style={{
            background: "linear-gradient(90deg,#6C63FF,#23ce6b,#ffbf00)",
            color: "#fff", fontWeight: 900,
            borderRadius: "2.6em",
            fontSize: "clamp(1.17em,2.7vw,1.51em)",
            boxShadow: "none"
          }}
        >
          🔄 Try Again
        </button>
      </div>
      <pre style={{
        background: "none",
        border: "none",
        fontSize: "clamp(1.02em,2.5vw,1.23em)",
        color: "#fed502",
        fontWeight: 900,
        borderRadius: 0,
        padding: "0.63em 0.81em",
        margin: "2.7em auto 1.3em auto",
        maxWidth: "700px",
        boxShadow: "none",
        textShadow: "0 2.7px 13px #23ce6baa, 0 1.5px 9px #ff4ecd66, 0 0 14px #fff",
        filter: "brightness(1.19)",
        textAlign: "center",
        pointerEvents: "auto",
        letterSpacing: "0.01em"
      }}>{shareText}</pre>
    </div>
  );
}

export default App;
