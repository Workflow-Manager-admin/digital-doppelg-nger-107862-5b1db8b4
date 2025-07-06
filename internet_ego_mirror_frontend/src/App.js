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
      <div className="iemo-footer" style={{
        width: "100vw",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: "1.03em",
        background: "linear-gradient(90deg,#ff4ecd,#6C63FF,#23ce6b,#ffc621,#FF6584)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        textShadow: "0 2px 6px #d0cdf1, 0 0px 32px #23ce6aa9"
      }}>
        <span className="iemo-footer-brand">
          <span style={{ color: "#6C63FF" }}>Internet</span>{" "}
          <span style={{ color: "#23ce6b" }}>Ego</span>{" "}
          <span style={{ color: "#FF6584" }}>Mirror</span>
        </span>
        <span className="iemo-footer-mini">| © 2024 | Uses <a href="https://opentdb.com/api_config.php" target="_blank" rel="noopener noreferrer" style={{ color: "#ffbf00", fontWeight: 700, textDecoration: "underline" }}>Open Trivia DB</a></span>
      </div>
    </div>
  );
}

/**
 * Refactored WelcomeScreen – now only big clear SVG symbol, new site name & custom tagline, all animated, with bold animated Start
 */
function WelcomeScreen({ onStart }) {
  // PUBLIC_INTERFACE
  // Modern vivid welcome, realistic, expressive SVG – cricket bat (wood grain), red stitched ball, classic football (pent/panels), tennis racquet with string mesh
  // Animated, rainbow neon-glow text, and energetic, glowing animated Start button

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
      {/* Custom sports SVG group: cricket bat+ball, football, tennis racquet+strings, in lively layout */}
      <div
        style={{
          display: "block",
          margin: "0 auto 2em auto",
          width: "clamp(325px,52vw,605px)",
          height: "clamp(220px,36vw,355px)",
          position: "relative",
          filter: "drop-shadow(0 12px 59px #23ce6baa) drop-shadow(0 2px 40px #fed50280)"
        }}
        aria-hidden="true"
      >
        <svg width="100%" height="100%" viewBox="0 0 650 340" style={{ maxWidth: "99vw" }}>
          {/* Cricket Bat – wood grain, angled left-back */}
          <g>
            {/* Bat blade - wood texture effect */}
            <rect x="50" y="105" width="37" height="150" rx="13" fill="url(#batwood)" stroke="#ba8530" strokeWidth="5" transform="rotate(-22 86 180)" />
            <defs>
              <linearGradient id="batwood" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.1" stopColor="#fce7c1"/>
                <stop offset="0.36" stopColor="#f8d18d"/>
                <stop offset="0.77" stopColor="#f0b96c"/>
                <stop offset="1" stopColor="#bb8431"/>
              </linearGradient>
            </defs>
            {/* Bat details: lines for grain */}
            <path d="M71 117 Q58 168 83 243" stroke="#e7bd70" strokeWidth="5.7" fill="none" opacity="0.3" transform="rotate(-16 86 180)" />
            {/* Bat Grip */}
            <rect x="77" y="83" width="12" height="38" rx="5" fill="#b80058" stroke="#fff" strokeWidth="2" transform="rotate(-20 83 92)" />
            <rect x="81" y="82" width="5" height="29" rx="2.5" fill="url(#gripstripes)" transform="rotate(-21 87 92)" />
            <defs>
              <linearGradient id="gripstripes" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.1" stopColor="#fcb5e8"/>
                <stop offset="0.73" stopColor="#ba2177"/>
                <stop offset="1" stopColor="#fff"/>
              </linearGradient>
            </defs>
          </g>
          {/* Cricket Ball (red, stitched, overlapping bat corner) */}
          <g>
            <circle cx="84" cy="247" r="24" fill="#d41b47" stroke="#930031" strokeWidth="5"/>
            {/* Ball shine */}
            <ellipse cx="87" cy="240" rx="6.7" ry="16" fill="#fff" opacity="0.09"/>
            {/* Stitches, white dashes */}
            <path d="M64 247 Q81 238 104 247" stroke="#fff" strokeDasharray="4,5" strokeWidth="3.1" fill="none"/>
            <path d="M69 241 Q84 238 99 242" stroke="#fff" strokeDasharray="2,6" strokeWidth="1.7" fill="none" opacity="0.66"/>
            <path d="M70 253 Q84 257 97 253" stroke="#fff" strokeDasharray="2,7" strokeWidth="1.7" fill="none" opacity="0.66"/>
          </g>
          {/* Football (soccer, classic pent/hex/circular patches), overlapped center */}
          <g>
            <circle cx="240" cy="110" r="52" fill="#fff" stroke="#343434" strokeWidth="7"/>
            {/* Black pentagons (using paths/hex for realism) */}
            <polygon points="240,91 257,105 252,127 228,127 223,105" fill="#222" />
            <polygon points="240,70 249,84 240,91 231,84" fill="#343434" />
            <polygon points="272,99 267,117 252,127 257,105" fill="#222" />
            <polygon points="208,99 223,105 228,127 213,117" fill="#222" />
            {/* Two bold arcs for seam effect */}
            <path d="M199 130 Q235 135 281 130" stroke="#282828" strokeWidth="5" fill="none" opacity="0.37" />
            <path d="M220 81 Q240 56 260 81" stroke="#343434" strokeWidth="3" fill="none" opacity="0.28" />
          </g>
          {/* Tennis Racquet (angled, mesh detail), tennis ball in front */}
          <g>
            {/* Racquet head */}
            <ellipse cx="487" cy="117" rx="54" ry="89" fill="#3ced89" stroke="#17816b" strokeWidth="8" transform="rotate(17 487 117)" />
            {/* Strings mesh */}
            {
              Array.from({ length: 12 }).map((_, idx) => (
                <line
                  key={`racq-str-main-${idx}`}
                  x1={487 - 42 + idx * 7.2}
                  y1={35}
                  x2={487 - 33 + idx * 6.15}
                  y2={199}
                  stroke="#eaf8fb" strokeWidth="2.2" opacity="0.59"
                  transform="rotate(17 487 117)"
                />
              ))
            }
            {
              Array.from({ length: 10 }).map((_, idx) => (
                <line
                  key={`racq-str-side-${idx}`}
                  x1={480}
                  y1={27 + idx*13}
                  x2={552}
                  y2={62 + idx*8}
                  stroke="#eaf8fb" strokeWidth="2.2" opacity="0.56"
                  transform="rotate(17 487 117)"
                />
              ))
            }
            {/* Racquet throat/handle */}
            <rect x="470" y="198" width="32" height="60" rx="13" fill="#fed502" stroke="#bba101" strokeWidth="4" transform="rotate(18 480 218.9)" />
          </g>
          {/* Tennis Ball (across racquet throat, overlapped for action) */}
          <g>
            <circle cx="537" cy="192" r="27" fill="#fde944" stroke="#d2bc22" strokeWidth="5"/>
            {/* Ball curved stripe */}
            <path d="M527 183 Q545 174 554 203" stroke="#fff" strokeWidth="3.2" fill="none" opacity="0.6"/>
          </g>
          {/* Layered, playful - balls and racquet cross, football prominent. */}
          {/* Shadow beneath for clarity */}
          <ellipse cx="330" cy="315" rx="195" ry="18" fill="#2323230d"/>
        </svg>
      </div>
      {/* Neon, animated site name */}
      <div
        style={{
          margin: "0 0 1.25em 0",
          fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2.9em, 8vw, 5.2em)",
          letterSpacing: "-0.01em",
          background: "linear-gradient(95deg,#fed502 0,#ff4ecd 38%,#36c6e7 70%,#23ce6b 90%,#ffbf00 99%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          lineHeight: 1.07,
          textShadow:
            "0 7.5px 49px #fff, 0 2.6px 29px #fed502cc, 0 0px 24px #23ce6bb0, 0 1.4px 12px #ff4ecd",
          animation: "pop-welcome-title 1.14s cubic-bezier(.62,-0.23,.54,1.38) both, neon-glow-title 2.2s ease-in-out infinite alternate"
        }}
      >
        the clueless cup
      </div>
      {/* Glowing, energetic animated tagline */}
      <div
        style={{
          fontWeight: 900,
          fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
          fontSize: "clamp(1.28em,3vw,2em)",
          background:
            "linear-gradient(90deg,#fed502 35%,#36c6e7 52%,#ff4ecd 99%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          margin: "0 0 2.3em 0",
          textShadow:
            "0 8px 29px #23ce6b90, 0 2.5px 16px #fff, 0 2.5px 24px #ff4ecd90, 0 1px 17px #fed502a8",
          letterSpacing: "0.015em",
          filter: "brightness(1.23) drop-shadow(0 4px 18px #fed502cc)",
          animation: "float-tagline 1.38s cubic-bezier(.63,-0.07,.57,1.18) both, neon-glow-tagline 3.7s ease-in-out infinite alternate"
        }}
      >
        For those who bench press trivia, not weights.
      </div>
      <div>
        <button
          className="iemo-btn iemo-btn-accent iemo-floating-btn-bounce"
          onClick={onStart}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#FF6584 97%)",
            fontSize: "clamp(2.5em,5.2vw,3.8em)",
            fontWeight: 900,
            color: "#fff",
            border: "none",
            borderRadius: "3.7em",
            boxShadow: "0 8px 51px #23ce6b99, 0 2px 28px #fed50292",
            textShadow: "0 0px 26px #fff, 0 2.1px 24px #ff4ecdcc",
            padding: "1.31em 2.8em",
            margin: "1.3em 0 2.4em 0",
            outline: "none",
            cursor: "pointer",
            animation: "sports-bounce-glow 1.1s cubic-bezier(.66,.09,.33,1.35) infinite alternate, neon-glow-btn 2.6s ease-in-out infinite alternate"
          }}
        >
          <span role="img" aria-label="start whistle" style={{ fontSize: "1.17em", verticalAlign: "middle", marginRight: "0.49em"}}>🏁</span>
          Start
          <span role="img" aria-label="tada" style={{ fontSize: "1.17em", verticalAlign: "middle", marginLeft: "0.45em"}}>🎉</span>
        </button>
      </div>
      {/* Custom keyframes for welcome animation */}
      <style>
        {`
          @keyframes pop-welcome-title {
            0% {
              opacity: 0;
              transform: scale(0.7) translateY(61px);
              filter: brightness(1.78) blur(5.5px);
            }
            80% {
              opacity: 1;
              transform: scale(1.18) translateY(-9px);
              filter: brightness(1.19) blur(0.6px);
            }
            87% {
              opacity: 1;
              transform: scale(0.92) translateY(4px);
              filter: brightness(1.13);
            }
            100% {
              opacity: 1;
              transform: scale(1.04) translateY(0);
              filter: brightness(1.09) blur(0px);
            }
          }
          @keyframes neon-glow-title {
            0% { filter: drop-shadow(0 0 18px #fed50280) drop-shadow(0 0 12px #36c6e7c7); }
            60% { filter: drop-shadow(0 0 22px #23ce6bcc) drop-shadow(0 0 23px #ff4ecdba); }
            100% { filter: drop-shadow(0 0 33px #ff4ecd) drop-shadow(0 0 19px #fed502d1);}
          }
          @keyframes float-tagline {
            0% {
              opacity: 0;
              transform: translateY(61px) scale(0.89) skewX(-7deg);
              filter: blur(3.8px) brightness(2.2);
            }
            62% {
              opacity: 1;
              transform: translateY(-7px) scale(1.11) skewX(4deg);
              filter: blur(0.5px) brightness(1.16);
            }
            88% {
              transform: translateY(4px) scale(0.97);
              filter: blur(0.5px) brightness(1.1);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1.03);
              filter: blur(0) brightness(1.13);
            }
          }
          @keyframes neon-glow-tagline {
            0%   { filter: drop-shadow(0 0 14px #fed50267) brightness(1.09);}
            56%  { filter: drop-shadow(0 0 28px #23ce6ba9) brightness(1.16);}
            100% { filter: drop-shadow(0 0 13px #fed502ab) brightness(1.08);}
          }
          @keyframes sports-bounce-glow {
            0%   { transform: translateY(0) scale(1); filter: drop-shadow(0 0 21px #36c6e765) brightness(1.12);}
            18%  { transform: translateY(-16px) scale(1.13); filter: drop-shadow(0 0 43px #fed502ac) brightness(1.18);}
            45%  { transform: translateY(9px) scale(1.05);  filter: drop-shadow(0 0 32px #23ce6bcc) brightness(1.14);}
            63%  { transform: translateY(-8px) scale(1.09); filter: drop-shadow(0 0 30px #ff4ecd88) brightness(1.23);}
            81%  { transform: translateY(6px) scale(1.07);  filter: drop-shadow(0 0 23px #fed502c0) brightness(1.11);}
            100% { transform: translateY(0) scale(1.01);    filter: drop-shadow(0 0 27px #23ce6baa) brightness(1.15);}
          }
          @keyframes neon-glow-btn {
            0%, 100% { filter: drop-shadow(0 0 19px #fed50296) drop-shadow(0 0 12px #ff4ecd96); }
            52% { filter: drop-shadow(0 0 33px #23ce6bcc) drop-shadow(0 0 22px #ffd502c9);}
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
