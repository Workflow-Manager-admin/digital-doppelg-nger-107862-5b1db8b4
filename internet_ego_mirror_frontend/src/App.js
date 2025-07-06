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
          filter:
            "drop-shadow(0 9px 44px #ff4ecdba) drop-shadow(0 3px 41px #36c6e7b0)",
        }}
        aria-hidden="true"
      >
        {/* --- NEW TROPHY SVG: Enhanced metallic effects and dimensional shading, ultra-detailed sports symbols --- */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 340 340"
          style={{ maxWidth: "99vw", display: "block" }}
          aria-label="Realistic Sports Trophy Cup"
        >
          <defs>
            {/* Metallic gold gradients */}
            <linearGradient id="trophyGold" x1="15%" y1="10%" x2="85%" y2="92%">
              <stop offset="0%" stopColor="#fffbe8" />
              <stop offset="18%" stopColor="#fff8ca" />
              <stop offset="42%" stopColor="#fad54a" />
              <stop offset="70%" stopColor="#ffd502" />
              <stop offset="83%" stopColor="#b59842" />
              <stop offset="100%" stopColor="#a17d30" />
            </linearGradient>
            <radialGradient id="goldInner" cx="45%" cy="39%" r="80%">
              <stop offset="0%" stopColor="#fff6c4" />
              <stop offset="33%" stopColor="#ffe16f" />
              <stop offset="70%" stopColor="#eebe34" />
              <stop offset="84%" stopColor="#ebd88b" />
              <stop offset="99%" stopColor="#966b0a" />
            </radialGradient>
            <linearGradient id="goldRimFlat" x1="20%" y1="35%" x2="85%" y2="62%">
              <stop offset="0%" stopColor="#fffbe8"/>
              <stop offset="50%" stopColor="#ffd502"/>
              <stop offset="90%" stopColor="#a57b2d"/>
              <stop offset="100%" stopColor="#fed67a"/>
            </linearGradient>
            <radialGradient id="goldBase" cx="55%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#ffeab8" />
              <stop offset="50%" stopColor="#ffbd3d" />
              <stop offset="83%" stopColor="#856319" />
              <stop offset="100%" stopColor="#957220" />
            </radialGradient>
            <radialGradient id="cupShine3D" cx="35%" cy="25%" r="80%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.72"/>
              <stop offset="25%" stopColor="#fffbe0" stopOpacity="0.39"/>
              <stop offset="42%" stopColor="#f8e698" stopOpacity="0.2"/>
              <stop offset="88%" stopColor="#ffd502" stopOpacity="0.11"/>
              <stop offset="100%" stopColor="#fffbe0" stopOpacity="0" />
            </radialGradient>
            {/* Glassy blue gradient for tennis racquet */}
            <linearGradient id="racketBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bbf6ff" />
              <stop offset="60%" stopColor="#36c6e7" />
              <stop offset="100%" stopColor="#148a99" />
            </linearGradient>
            {/* Bat handle brown */}
            <linearGradient id="batWood" x1="10%" y1="14%" x2="74%" y2="92%">
              <stop offset="0%" stopColor="#ffeabb" />
              <stop offset="40%" stopColor="#f4ce8a" />
              <stop offset="100%" stopColor="#ae8338" />
            </linearGradient>
            <linearGradient id="batGripNew" x1="12%" y1="16%" x2="90%" y2="88%">
              <stop offset="0%" stopColor="#e04b43" />
              <stop offset="1" stopColor="#940d22" />
            </linearGradient>
            <radialGradient id="ballRedReal" cx="48%" cy="44%" r="85%">
              <stop offset="0%" stopColor="#fff3e0" />
              <stop offset="14%" stopColor="#ff7272" />
              <stop offset="44%" stopColor="#e4321a" />
              <stop offset="80%" stopColor="#9d1817" />
              <stop offset="100%" stopColor="#5a0e0b" />
            </radialGradient>
            {/* Football gradients */}
            <radialGradient id="footballPatch" cx="60%" cy="55%" r="75%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="80%" stopColor="#eceffa" />
              <stop offset="100%" stopColor="#c2c9d5" />
            </radialGradient>
            <linearGradient id="footballDark" x1="22%" y1="62%" x2="92%" y2="20%">
              <stop offset="0%" stopColor="#ededed" />
              <stop offset="1" stopColor="#9aa4b2" />
            </linearGradient>
            {/* Tennis ball fill */}
            <radialGradient id="tennisBall" cx="43%" cy="36%" r="95%">
              <stop offset="0%" stopColor="#ffffad" />
              <stop offset="80%" stopColor="#f3e334" />
              <stop offset="100%" stopColor="#b5a800" />
            </radialGradient>
          </defs>
          {/* 1. Extra realistic handles, with metallic rim-light */}
          <path
            d="M77 97 Q10 174 110 263 Q146 299 179 214"
            fill="none"
            stroke="url(#trophyGold)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.97"
            filter="url(#shadow1)"
          />
          <path
            d="M263 97 Q330 174 230 263 Q194 299 161 214"
            fill="none"
            stroke="url(#trophyGold)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.97"
            filter="url(#shadow2)"
          />
          {/* Rim: chrome edge w/ highlight */}
          <ellipse
            cx="170"
            cy="79"
            rx="109"
            ry="32"
            fill="url(#goldRimFlat)"
            stroke="#fff8e2"
            strokeWidth="5"
            opacity="0.76"
          />
          {/* Cup body: deep gold shading with highlights */}
          <ellipse
            cx="170"
            cy="134"
            rx="94"
            ry="88"
            fill="url(#trophyGold)"
            stroke="url(#goldInner)"
            strokeWidth="12"
            opacity="0.97"
          />
          {/* Trophy 3D shine */}
          <ellipse
            cx="154"
            cy="116"
            rx="24"
            ry="10"
            fill="url(#cupShine3D)"
            opacity="0.92"
          />
          {/* Trophy base with strong metallic foot */}
          <rect
            x="110"
            y="228"
            width="120"
            height="44"
            rx="22"
            fill="url(#goldBase)"
            stroke="#856319"
            strokeWidth="12"
            opacity="0.94"
          />
          {/* Plinth dimension ellipse */}
          <ellipse
            cx="170"
            cy="273"
            rx="52"
            ry="19"
            fill="#fffbe8"
            opacity="0.18"
            style={{filter:"blur(0.5px)"}}
          />
          {/* Bottom 3D oval shadow */}
          <ellipse
            cx="170"
            cy="284"
            rx="32"
            ry="7.5"
            fill="#a08036"
            opacity="0.18"
            style={{filter:"blur(2.2px)"}}
          />
          {/* 2. Richly detailed SPORTS SYMBOLS INSIDE CUP */}
          {/* CRICKET BAT (angled, wooden, textured) */}
          <g>
            {/* Blade */}
            <rect
              x="94"
              y="80"
              width="22"
              height="92"
              rx="6.7"
              fill="url(#batWood)"
              stroke="#a97c50"
              strokeWidth="2.6"
              transform="rotate(-17 106 128)"
              style={{filter:"drop-shadow(0 4px 7px #c49a3842)"}}
            />
            {/* Grip */}
            <rect
              x="105"
              y="60"
              width="7.8"
              height="27"
              rx="3"
              fill="url(#batGripNew)"
              stroke="#fff"
              strokeWidth="1"
              transform="rotate(-17 108.9 74)"
            />
            {/* Bat shadow for realism */}
            <rect
              x="104"
              y="99"
              width="10"
              height="55"
              rx="2.1"
              fill="#91682a"
              opacity="0.22"
              transform="rotate(-17 109 123)"
            />
          </g>
          {/* CRICKET BALL (realistic stitched, rich red) */}
          <g>
            <circle
              cx="111"
              cy="192"
              r="15.4"
              fill="url(#ballRedReal)"
              stroke="#833b24"
              strokeWidth="2.1"
            />
            {/* Ball shine */}
            <ellipse
              cx="117.5"
              cy="185"
              rx="3"
              ry="6"
              fill="#fff"
              opacity="0.13"
              transform="rotate(-25 117.5 185)"
            />
            {/* Stitched seam, realistic arc */}
            <path
              d="M98.1 198 Q113 182 126 203"
              stroke="#fff4d4"
              strokeDasharray="2.4,2.9"
              strokeWidth="1.7"
              fill="none"
              opacity="0.76"
            />
            {/* Subtle ball shadow */}
            <ellipse
              cx="111"
              cy="201"
              rx="7.2"
              ry="3.3"
              fill="#970b14"
              opacity="0.12"
            />
          </g>
          {/* FOOTBALL (soccer, classic pent/hex pattern with proper patches) */}
          <g>
            <ellipse
              cx="168"
              cy="196"
              rx="22.5"
              ry="22.5"
              fill="url(#footballPatch)"
              stroke="#202318"
              strokeWidth="3.2"
              opacity="0.94"
            />
            {/* Black pentagon center */}
            <polygon
              points="168,181 184,191 178,208 168,213 158,208 153,191"
              fill="#2a2920"
              stroke="#24241d"
              strokeWidth="1.4"
            />
            {/* Small classic hex patches */}
            <polygon
              points="160,192 168,186 175,192 172,202 163,202"
              fill="#fff"
              stroke="#c4c5cc"
              strokeWidth="1"
              opacity="0.57"
            />
            <polygon
              points="175,192 184,192 178,208"
              fill="#adadad"
              opacity="0.49"
            />
            {/* Panel seams */}
            <path
              d="M158 208 Q168 226 178 208"
              stroke="#7b7f80"
              strokeWidth="1.2"
              fill="none"
              opacity="0.6"
            />
            {/* Lower oval shadow */}
            <ellipse
              cx="168"
              cy="213"
              rx="14"
              ry="6"
              fill="#232323"
              opacity="0.09"
            />
          </g>
          {/* TENNIS RACQUET, realistic head, string mesh, shaded handle */}
          <g>
            {/* Racquet rim */}
            <ellipse
              cx="234"
              cy="122"
              rx="27"
              ry="45"
              fill="url(#racketBlue)"
              stroke="#283670"
              strokeWidth="3.5"
              transform="rotate(13 234 122)"
              opacity="0.99"
            />
            {/* Strings – vertical */}
            {Array.from({ length: 7 }).map((_, idx) => (
              <line
                key={`racket-vert-${idx}`}
                x1={234-18+idx*6}
                y1={77}
                x2={234-10+idx*4.7}
                y2={170}
                stroke="#fff"
                strokeWidth="1"
                opacity="0.73"
                transform="rotate(13 234 122)"
              />
            ))}
            {/* Strings – horizontal */}
            {Array.from({ length: 5 }).map((_, idx) => (
              <line
                key={`racket-horiz-${idx}`}
                x1={209}
                y1={95+idx*13}
                x2={259}
                y2={100+idx*10}
                stroke="#fff"
                strokeWidth="1"
                opacity="0.66"
                transform="rotate(13 234 122)"
              />
            ))}
            {/* Handle */}
            <rect
              x="222"
              y="164"
              width="19"
              height="38"
              rx="6"
              fill="#a17d30"
              stroke="#684d0a"
              strokeWidth="2"
              transform="rotate(19 231 183)"
              style={{filter:"brightness(0.92)"}}
            />
            {/* Handle stripes */}
            <rect
              x="226"
              y="185"
              width="11"
              height="3.1"
              rx="1.2"
              fill="#603b16"
              opacity="0.54"
              transform="rotate(19 231.5 186.9)"
            />
            <rect
              x="226"
              y="192"
              width="11"
              height="3.1"
              rx="1.2"
              fill="#603b16"
              opacity="0.48"
              transform="rotate(19 231.5 193.9)"
            />
          </g>
          {/* Tennis BALL SHADOW */}
          <ellipse
            cx="256"
            cy="204"
            rx="13"
            ry="4.7"
            fill="#f3e334"
            opacity="0.11"
            transform="rotate(-12 256 204)"
          />
          {/* TENNIS BALL */}
          <g>
            <circle
              cx="256"
              cy="194"
              r="13"
              fill="url(#tennisBall)"
              stroke="#cec94c"
              strokeWidth="2.1"
            />
            {/* Tennis ball seam */}
            <path
              d="M247 186 Q262 181 260 201"
              stroke="#fff"
              strokeWidth="1.5"
              fill="none"
              opacity="0.62"
            />
            <ellipse
              cx="260"
              cy="189"
              rx="3.1"
              ry="6"
              fill="#fff"
              opacity="0.10"
              transform="rotate(-18 260 189)"
            />
          </g>
          {/* Trophy highlight overlay for ultra real feel */}
          <ellipse
            cx="155"
            cy="110"
            rx="17"
            ry="8"
            fill="#fff"
            opacity="0.18"
            style={{
              filter: "blur(1.6px)"
            }}
          />
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
