import React, { useState, useEffect } from "react";
import "./App.css";
import SportsBackground from "./SportsBackground";
import QuoteBox from "./QuoteBox";
import NumberFact from "./NumberFact";
import WordOfTheMatch from "./WordOfTheMatch";
import JokeWidget from "./JokeWidget";

// --- UTILITIES/JUDGEMENT (helper for score computation) ---
/**
 * Computes quiz score summary.
 * Returns object { correctCount, total }
 */
function computeScore(answers, questions) {
  let correctCount = 0, total = 0;
  if (answers && questions && questions.length === answers.length && questions.length > 0) {
    total = questions.length;
    correctCount = answers.reduce((cnt, ansIdx, idx) => {
      const currQ = questions[idx];
      if (
        typeof ansIdx !== "undefined" &&
        currQ &&
        currQ.answers && currQ.correct_answer &&
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

// PUBLIC_INTERFACE
function ResultScreen({ answers, questions, onRestart, onShare, copied, shareText }) {
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

  // Main result card info is always shown at the top
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

      {/* Supporting widgets appear below the main result bubble */}
      <NumberFact number={correctCount} forScore={true} />
      {/* Defensive: show widget but never allow to shadow/hide result */}
      <WordOfTheMatch />
      <JokeWidget />
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

/**
 * WelcomeScreen displays the main welcome view:
 * - Custom Olympic rings logo with sports equipment (cricket bat, red cricket ball, football, tennis racquet) hanging/intertwined.
 * - Website name ("The Clueless Cup") in a large, bright, animated font.
 * - Tagline styled and below site name.
 * - Only Start button below, no extra widgets or old content.
 */
// PUBLIC_INTERFACE
function WelcomeScreen({ onStart }) {
  // SVG Olympic rings with sports equipment integrated
  // Colors: Blue (#0081C8), Yellow (#FFD700), Black (#000), Green (#009F3D), Red (#DF0024)
  // Arranged left-to-right as in Olympic emblem; equipment visually "hanging" or looped.

  return (
    <div
      className="iemo-float-welcome"
      style={{
        zIndex: 210,
        position: "relative",
        minHeight: "68vh",
        textAlign: "center",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        boxShadow: "none"
      }}
    >
      {/* Custom Olympic Rings Logo with Hanging Equipment */}
      <div style={{ margin: "2.5em 0 1.0em 0", filter: "drop-shadow(0 6px 32px #23ce6baa) drop-shadow(0 0 14px #ff4ecd88)" }}>
        <svg
          width="230"
          height="110"
          viewBox="0 0 230 110"
          aria-label="Olympic Rings with Sports Equipment"
          style={{ display: "inline-block", verticalAlign: "middle" }}
        >
          {/* Olympic rings */}
          {/* Top row: Blue, Black, Red */}
          <circle cx="45" cy="48" r="28" stroke="#0081C8" strokeWidth="6" fill="none"/>
          <circle cx="90" cy="48" r="28" stroke="#000" strokeWidth="6" fill="none"/>
          <circle cx="135" cy="48" r="28" stroke="#DF0024" strokeWidth="6" fill="none"/>
          {/* Bottom row: Yellow, Green (slightly below and between) */}
          <circle cx="67.5" cy="76" r="28" stroke="#FFD700" strokeWidth="6" fill="none"/>
          <circle cx="112.5" cy="76" r="28" stroke="#009F3D" strokeWidth="6" fill="none"/>

          {/* Cricket Bat (hanging from blue ring - leftmost) */}
          <rect x="38" y="77" width="8" height="32" rx="3.2" fill="#f9c97d" stroke="#ba8530" strokeWidth="2.1"/>
          <rect x="38" y="71.5" width="8" height="10" rx="2" fill="#ba2177"/>
          {/* Rope/line for bat */}
          <line x1="42" y1="64" x2="42" y2="77" stroke="#8e7cff" strokeWidth="2.2" />

          {/* Red Cricket Ball (hanging from yellow ring) */}
          <circle cx="67.5" cy="106" r="8" fill="#ea2d33" stroke="#fff" strokeWidth="2.2"/>
          <ellipse cx="67.5" cy="106" rx="2" ry="8" fill="#fff" opacity="0.17"/>
          {/* Rope/line for ball */}
          <line x1="67.5" y1="91" x2="67.5" y2="98" stroke="#999" strokeWidth="2.2" />

          {/* Football (hanging from black ring) */}
          <circle cx="90" cy="104" r="9" fill="#fff" stroke="#222" strokeWidth="2.2" />
          {/* Football patches */}
          <polygon points="90,97.5 93.7,103.3 90,109 86.3,103.3" fill="#1a1a1a"/>
          <polygon points="90,100.7 92,104.65 88,104.65" fill="#434343"/>
          {/* Rope for football */}
          <line x1="90" y1="84" x2="90" y2="94" stroke="#666" strokeWidth="2"/>

          {/* Tennis Racquet (angled, hanging from red ring on right) */}
          <ellipse cx="135" cy="102" rx="6.8" ry="15.5" fill="#23ce6b" stroke="#36c6e7" strokeWidth="2.2" transform="rotate(-23 135 102)" />
          {/* Racquet handle */}
          <rect x="132" y="110" width="6" height="13" rx="2" fill="#fed502" stroke="#bba101" strokeWidth="1" transform="rotate(-23 135 116)"/>
          {/* Rope for racquet */}
          <line x1="135" y1="85" x2="135" y2="91" stroke="#DF0024" strokeWidth="2" />

          {/* Slight shadow under equipment for depth */}
          <ellipse cx="90" cy="117" rx="59" ry="7" fill="#000" opacity="0.14"/>
        </svg>
      </div>
      {/* App Name – "The Clueless Cup", vivid, large, playful & animated font */}
      <div
        style={{
          fontWeight: 900,
          fontSize: "clamp(2.3em,5.3vw,3.8em)",
          letterSpacing: "0.025em",
          background: "linear-gradient(92deg, #ff4ecd, #FED502 44%, #23ce6b 70%, #36c6e7 95%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: ".19em",
          textShadow: "0 6px 16px #23ce6b95, 0 2px 20px #ff4ecd6b, 0 0px 34px #fed502aa",
          animation: "cupTitlePop 2.1s ease-in-out infinite alternate"
        }}
      >
        The Clueless Cup
      </div>
      {/* Keyframes for font animation (injects once, safe for client) */}
      <style>
        {`
        @keyframes cupTitlePop {
          0% { 
            letter-spacing: 0.021em;
            filter: brightness(1.11) saturate(1.24) drop-shadow(0 0px 25px #6c63ff4b);
            text-shadow: 0 6px 16px #23ce6bc5, 0 2px 20px #ff4ecd76, 0 0px 34px #fed5029e;
            transform: scale(1.01) rotate(-2deg);
          }
          38% {
            letter-spacing: 0.04em;
            filter: brightness(1.18) saturate(1.26) drop-shadow(0 14px 22px #36c6e789);
            transform: scale(1.03) rotate(2deg);
            text-shadow: 0 6px 20px #ff4ecdcc, 0 8px 20px #fed502cc, 0 0px 29px #FFFCCB;
          }
          52% {
            letter-spacing: 0.013em;
            filter: brightness(1.2) saturate(1.33) drop-shadow(0 12px 30px #fed50297);
            transform: scale(0.98) rotate(-2deg);
          }
          84% {
            filter: brightness(1.26) saturate(1.32) drop-shadow(0 5px 22px #36c6e776);
            letter-spacing: 0.017em;
            transform: scale(1.015) rotate(2deg);
          }
          100% {
            filter: brightness(1.17) saturate(1.12) drop-shadow(0 2px 12px #23ce6baa);
            letter-spacing: 0.023em;
            transform: scale(1) rotate(-1deg);
            text-shadow: 0 3.4px 13px #23ce6baa,0 2.7px 17px #ff4ecdbe,0 0px 28px #FFFCD7;
          }
        }
        `}
      </style>
      {/* Tagline */}
      <div
        style={{
          fontWeight: 860,
          fontSize: "clamp(1.18em,2.5vw,1.81em)",
          color: "#fff",
          background: "linear-gradient(91deg,#23ce6b,#fed502 39%,#ff6584 81%, #36c6e7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: "0 0 1.4em 0",
          textShadow: "0 4px 19px #23ce6baa, 0 1px 7px #ff4ecd8d, 0 0px 18px #fff",
          filter: "drop-shadow(0 2px 12px #23ce6b3b)",
        }}
      >
        For those who bench press trivia, not weights.
      </div>
      {/* Big animated Start button */}
      <button
        className="iemo-btn iemo-btn-accent"
        style={{
          fontWeight: 900,
          fontSize: "clamp(1.35em,2.7vw,1.86em)",
          padding: "0.89em 3.5em",
          marginBottom: "2.5em",
          boxShadow: "0 4px 17px #23ce6b47, 0 1px 13px #ff4ecd57",
          border: "none",
          outline: "none",
          background: "linear-gradient(90deg,#23ce6b 20%,#fed502 53%,#ff6584 90%)",
          color: "#fff",
          borderRadius: "3.1em",
          animation: "pulse-in-quiz-btn 1.3s infinite alternate"
        }}
        onClick={onStart}
        aria-label="Begin the Quiz"
      >
        <span style={{
          fontWeight: 890, letterSpacing: "0.02em"
        }}>
          🚀 Start
        </span>
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function QuestionScreen({ questions, step, onAnswer, loading, fetchError }) {
  if (loading) return (
    <div className="iemo-float-qa-wrap" style={{
      textAlign: "center", fontWeight: 900, fontSize: "1.28em",
      color: "#23ce6b", margin: "7vh auto"
    }}>
      Loading questions...
    </div>
  );
  if (fetchError) return (
    <div className="iemo-float-qa-wrap" style={{
      color: "#FF6584", fontWeight: 900, background: "rgba(255,234,255,0.22)", borderRadius: "19px", margin: "4vw", padding: "2em 3em"
    }}>{fetchError}</div>
  );
  // Guard
  if (!questions || !questions[step - 1]) return null;
  const q = questions[step - 1];

  return (
    <div className="iemo-float-qa-wrap" style={{
      textAlign: "center",
      margin: "5.3vh auto 5.7vh auto",
      zIndex: 212,
      position: "relative"
    }}>
      <div className="iemo-float-question-glow" style={{
        fontWeight: 900,
        fontSize: "clamp(1.19em,2.8vw,2em)",
        color: "#fff",
        margin: "0 0 1.9em 0",
        textShadow: "0 4px 27px #36c6e7, 0 1.7px 18px #ff4ecd77"
      }}>
        Question {step} of {questions.length}
      </div>
      <div className="iemo-float-header-glow" style={{
        fontWeight: 900,
        fontSize: "clamp(1.24em,3vw,2.19em)",
        color: "#fafafa",
        marginBottom: "1em",
        textShadow: "0 6px 28px #6c63ff63, 0 0px 19px #fed5027f"
      }}>
        {q.question}
      </div>
      <div className="iemo-answers iemo-float-answers-flare" style={{
        display: "flex", flexDirection: "column", gap: "2.1em", width: "100%", maxWidth: "700px", margin: "0 auto"
      }}>
        {q.answers.map((a, idx) => (
          <button
            key={idx}
            className="iemo-answer-card iemo-float-answer-btn"
            style={{
              background: "none", border: "none", borderRadius: "2em",
              padding: "0.98em 2.5em", fontSize: "1.13em", fontWeight: 900, color: "#fff",
              margin: "0.25em 0", textShadow: "0 2px 14px #23ce6b, 0 2px 10px #ff4ecd95, 0 0px 24px #6c63ff72",
              position: "relative",
              cursor: "pointer",
              outline: "none",
              transition: "filter 0.18s"
            }}
            onClick={evt => onAnswer(idx, evt)}
            aria-label={a.text}
          >
            {a.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Fancy fireworks/celebration UI (on answering) ----
function CrackerBlast({ x, y, onDone }) {
  React.useEffect(() => {
    const timeout = setTimeout(() => onDone && onDone(), 1200);
    return () => clearTimeout(timeout);
  }, [onDone]);

  const width = Math.max(window.innerWidth, 1400);
  const height = Math.max(window.innerHeight, 900);
  const centerX = width / 2;
  const centerY = height / 2;

  const RAY_COLORS = [
    "#FFDE00", "#FF6584", "#36C6E7", "#23CE6B", "#FF4ECD", "#FEC800", "#FED502", "#ffffff",
    "#00FFA2", "#ffbf00", "#19e0ff", "#fc1cff", "#FFFBE8"
  ];
  const DOT_COLORS = [
    "#FFFAE3", "#FF4ECD", "#FED502", "#36C6E7", "#23ce6b", "#FF6584", "#fffbe8",
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
            {[...Array(28)].map((_, i) => {
              const angle = ((i * (360 / 28)) + ((i % 3) * 7)) % 360;
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
            {[...Array(28)].map((_, i) => {
              const angle = i * (360 / 28) + Math.random() * 17;
              const dist = 260 + Math.random() * 0.48 * Math.min(width, height);
              const size = 38 + Math.random() * ((i % 2 === 0) ? 76 : 130);
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
                    filter: `blur(${14 + Math.random() * 9}px) drop-shadow(0 0 48px ${color}) brightness(1.22)`
                  }}
                />
              );
            })}
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={width / 8.5}
              ry={height / 8.6}
              fill="#fffbe8"
              fillOpacity="0.16"
              style={{ filter: "blur(38px)" }}
            />
            <ellipse
              cx={centerX}
              cy={centerY}
              rx={width / 4.5}
              ry={height / 4.9}
              fill="#fcf9e5"
              fillOpacity="0.08"
              style={{ filter: "blur(64px)" }}
            />
          </g>
        </svg>
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE - Main App
function App() {
  // --- Quiz flow state ---
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [answers, setAnswers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [crackerBlasts, setCrackerBlasts] = useState([]);

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

  // === REACT RENDER TREE ===
  // The main quiz/welcome/result is ALWAYS rendered at top; all API widgets below.
  return (
    <div className="iemo-app float-ui-app">
      {/* Always-on animated background */}
      <SportsBackground />

      {/* Cracker effect overlay */}
      <div className="cracker-blast-container" aria-hidden="true" style={{ pointerEvents: "none" }}>
        {crackerBlasts.map(({ x, y, id }) =>
          <CrackerBlast key={id} x={x} y={y} onDone={() => handleCrackerBlastDone(id)} />
        )}
      </div>

      {/* Main Quiz Flow Tree */}
      <main>
        {/* Welcome */}
        {step === 0 && (
          <WelcomeScreen onStart={handleStart} />
        )}
        {/* Quiz flow - one question at a time */}
        {(step > 0 && step <= (questions.length || 0)) && (
          <>
            <QuestionScreen
              questions={questions}
              step={step}
              onAnswer={handleAnswer}
              loading={loading}
              fetchError={fetchError}
            />
            {/* Supporting widgets - always below main Q/A area, never in place of it */}
            <section aria-label="Support widgets area" style={{
              margin: "1.7em auto 0 auto", maxWidth: 760, display: "flex", flexDirection: "column", gap: "1.21em"
            }}>
              <QuoteBox />
              <NumberFact number={step - 1} forScore={false} />
            </section>
          </>
        )}
        {/* Results */}
        {(step > (questions.length || 0) && (questions.length > 0) && !loading && !fetchError) && (
          <ResultScreen
            answers={answers}
            questions={questions}
            onRestart={handleRestart}
            onShare={handleShare}
            copied={copied}
            shareText={getShareText()}
          />
        )}
      </main>

      {/* Global footer: always below main content */}
      <footer className="iemo-footer" style={{
        margin: "2.7em auto 2em auto",
        color: "#7c6ead", fontWeight: 700, textAlign: "center", fontSize: "1em",
        textShadow: "0 1.3px 7px #36c6e71a"
      }}>
        <span className="iemo-footer-brand">
          &copy; {new Date().getFullYear()} Internet Ego Mirror &mdash; Playful sports persona quizzes
        </span>
      </footer>
    </div>
  );
}

export default App;
