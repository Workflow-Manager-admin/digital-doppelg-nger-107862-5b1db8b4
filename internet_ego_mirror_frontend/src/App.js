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
  React.useEffect(() => {
    const timeout = setTimeout(() => onDone && onDone(), 700);
    return () => clearTimeout(timeout);
  }, [onDone]);
  return (
    <div
      className="cracker-blast"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: "none"
      }}
      aria-hidden="true"
    >
      <span className="cracker-explosion">
        <svg width="148" height="148" viewBox="0 0 148 148">
          <g>
            {/* Bigger: Rays (20) */}
            {[...Array(20)].map((_, i) => {
              const angle = (i * 18);
              const length = 54 + 24 * (i % 2);
              const color = [
                "#ffd500", "#ff4ecd", "#6C63FF", "#23ce6b", "#FF6584", "#36c6e7", "#fc1cff", "#ff654f", "#fecdff", "#FED502",
                "#fffbe8", "#ff4ecd", "#36c6e7", "#fed502", "#fc1cff", "#6C63FF", "#23ce6b", "#ffe184", "#6c63ff", "#ffbf00"
              ][i % 20];
              return (
                <line
                  key={i}
                  x1="74"
                  y1="74"
                  x2={74 + length * Math.cos(angle * Math.PI / 180)}
                  y2={74 + length * Math.sin(angle * Math.PI / 180)}
                  stroke={color}
                  strokeWidth="8.7"
                  strokeLinecap="round"
                  opacity="0.94"
                />
              );
            })}
            {/* Exploding circles */}
            {[...Array(12)].map((_, i) => {
              const angle = i * (360 / 12) + 21;
              const dist = Math.random() * 31 + 46;
              const size = Math.random() * 8.7 + 6;
              const color = [
                "#fffbe8", "#ff6584", "#36c6e7", "#fed502", "#fc1cff", "#6C63FF", "#23ce6b", "#ffe184",
                "#ff4ecd", "#19e0ff", "#ffbf00", "#23ce6b"
              ][i % 12];
              return (
                <circle
                  key={`dot${i}`}
                  cx={74 + dist * Math.cos(angle * Math.PI / 180)}
                  cy={74 + dist * Math.sin(angle * Math.PI / 180)}
                  r={size}
                  fill={color}
                  fillOpacity="0.74"
                  filter="blur(0.46px)"
                />
              );
            })}
            <ellipse
              cx="74" cy="74" rx="29" ry="24"
              fill="#fffbe8" fillOpacity="0.36"
              filter="blur(5px)"
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
 * Refactored WelcomeScreen – floating text-only, bold, readable, no boxes or glass
 */
function WelcomeScreen({ onStart }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 160,
        maxWidth: "75vw",
        margin: "5vh auto 0 auto",
        textAlign: "center",
        background: "none",
        boxShadow: "none",
        borderRadius: 0,
        padding: 0,
        pointerEvents: "auto",
      }}
    >
      <h1
        className="rainbow-header"
        style={{
          fontWeight: 900,
          fontSize: "clamp(2.1em, 6vw, 3.8em)",
          padding: "0 0 0.2em 0",
          letterSpacing: "0.01em",
          filter: "drop-shadow(0 2px 14px #fffbe2) drop-shadow(0 6px 30px #ff4ecd59)",
          textShadow: "0 8px 50px #fff, 0 2px 12px #23ce6b59, 0 0px 6px #61199157",
          background: "linear-gradient(90deg,#ff4ecd,#6C63FF,#23ce6b,#FF6584 90%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}
      >
        <span role="img" aria-label="mirror" style={{ fontSize: "1.3em", verticalAlign: "middle" }}>🪞</span>{" "}
        Internet Ego Mirror
      </h1>
      <p
        style={{
          fontWeight: 700,
          fontSize: "clamp(1.1em, 2.6vw, 1.51rem)",
          color: "#fff",
          lineHeight: 1.25,
          margin: "0 auto 2.1em auto",
          textShadow: "0 2.5px 12px #311978, 0 1.5px 14px #ff4ecd84, 0 0px 32px #23ce6b50",
          background: "none",
          borderRadius: 0,
          maxWidth: "680px",
          filter: "brightness(1.16) saturate(1.22)",
          display: "inline-block",
        }}
      >
        Discover your digital alter ego with surprise internet trivia!<br />
        Every time you start, you get eight wild questions drawn live from the{" "}
        <a href="https://opentdb.com/" rel="noopener noreferrer"
          style={{
            color: "#fff",
            fontWeight: 800,
            WebkitTextStroke: "1px #23ce6b",
            filter: "drop-shadow(0 1px 11px #23ce6b94)"
          }}
        >
          Open Trivia DB
        </a>
        .<br />
        <span style={{ fontSize: "0.97em", color: "#ffbf00", fontWeight: 800 }}>No login, no key needed.</span> <b
          style={{ color: "#fff", textShadow: "0 0px 7px #6C63FFabe, 0 1.5px 7px #fff" }}>Click START for a new set!</b>
      </p>
      <div>
        <button
          className="iemo-btn iemo-btn-accent iemo-floating-btn-bounce"
          onClick={onStart}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#FF6584)",
            fontSize: "1.55em",
            fontWeight: 900,
            color: "#fff",
            border: "none",
            borderRadius: "2em",
            boxShadow: "0 0 28px #ff4ecd63,0 8px 36px #23ce6a63",
            textShadow: "0 2px 13px #fff",
            padding: "0.7em 2.2em",
            margin: "2.1em 0 0.7em 0",
            outline: "none",
          }}
        >
          🎉 Start Quiz 🎉
        </button>
      </div>
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
        maxWidth: "760px",
        margin: "7vh auto 3vh auto",
        padding: 0,
        background: "none",
        filter: "drop-shadow(0 2px 22px #fff5) drop-shadow(0 8px 44px #6c63ff61)",
        pointerEvents: "auto"
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: "0.8em",
          marginLeft: 2,
          animationDelay: `${delayBase + 80}ms`
        }}>
        <span
          style={{
            background: PALETTE[questionIdx % PALETTE.length],
            color: "#fff",
            fontWeight: 800,
            fontSize: "clamp(1.09em,2.2vw,1.34em)",
            borderRadius: "1.3em",
            padding: "5px 28px 5px 19px",
            marginRight: 0,
            letterSpacing: "0.09em",
            boxShadow: "0 2px 16px #ff4ecdba, 0 0 24px #23ce6b88"
          }}>
          Q{questionIdx + 1}
        </span>
        <span style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "clamp(1em,2.2vw,1.28em)",
          textShadow: "0 1px 12px #23ce6b,0 0 10px #6C63FF86"
        }}>
          of {total}
        </span>
      </div>
      <h2
        className="rampage-gradient"
        style={{
          fontWeight: 900,
          fontSize: "clamp(1.44em,3.1vw,2.5em)",
          color: "#fff",
          lineHeight: 1.17,
          marginBottom: "1.5em",
          letterSpacing: "0.005em",
          textShadow: "0 4px 22px #fffccf, 0 0px 18px #ff4ecd,0 0px 24px #23ce6bee",
          filter: "brightness(1.12) saturate(1.24)",
          animationDelay: `${delayBase + 185}ms`
        }}>
        {question.question}
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.6em",
          width: "100%",
          alignItems: "center"
        }}
      >
        {question.answers.map((a, idx) => (
          <button
            key={a.text}
            style={{
              animationDelay: `${delayBase + 275 + idx * 65}ms`,
              width: "100%",
              maxWidth: "520px",
              minWidth: "110px",
              minHeight: "2.1em",
              margin: "0.17em 0",
              border: "none",
              borderRadius: "2.5em",
              fontWeight: selected === idx ? 900 : 700,
              fontSize: "clamp(1.24em, 2.3vw, 1.54em)",
              color: "#fff",
              background: selected === idx
                ? `radial-gradient(circle at 79% 37%,#fffbe533 48%,#fffcec17 61%),linear-gradient(100deg,${PALETTE[(questionIdx + idx*2+1) % PALETTE.length]},#fff6f9 110%)`
                : `radial-gradient(circle at 10% 30%,#fff0 46%,#fff6ea11 91%),linear-gradient(120deg,${PALETTE[(questionIdx + idx) % PALETTE.length]},#f1f9ff 120%)`,
              outline: selected === idx ? `3.5px solid ${PALETTE[(questionIdx + idx) % PALETTE.length]}` : "none",
              boxShadow: selected === idx
                ? "0 0 52px #ff4ecd96,0 0px 56px #23ce6b7a,0 3px 64px #ffbf0055"
                : "0 0 34px #6c63ff3f, 0 2px 18px #23ce6b25",
              filter: selected === idx
                ? "drop-shadow(0 0 12px #fffccfba) brightness(1.17) saturate(1.19)"
                : "drop-shadow(0 2px 16px #6C63FF12) brightness(1.03) saturate(1.01)",
              cursor: typeof selected !== "undefined" ? "default" : "pointer",
              transition: "all .22s cubic-bezier(.44,.71,.44,1)",
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
          boxShadow: "0 2px 18px #23ce6a38, 0 4px 38px #ff4ecd19",
          background: "rgba(246,237,253,0.10)",
          borderRadius: "50%",
          display: "block",
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
                      ? `drop-shadow(0 0 8px ${seg.color}88)`
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
      {/* Center info donut label */}
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
            background: "rgba(255,255,255,0.91)",
            borderRadius: "53%",
            padding: "0.46em 1.18em",
            fontWeight: 900,
            fontSize: "1.57em",
            color: "#6C63FF",
            boxShadow: "0 2px 14px #36c6e71d",
            transition: "background 0.23s",
          }}
        >
          {percent}%
        </div>
        <div
          style={{
            fontSize: "0.85em",
            fontWeight: 700,
            color:
              hover === 0
                ? "#178b46"
                : hover === 1
                  ? "#d23b47"
                  : "#3e3257",
            marginTop: "3.5px",
            minHeight: "1.4em"
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

  // Animation
  const [animationIdx] = useState(() => Math.floor(Math.random() * 6));
  const Animation = () => <></>; // omit, placeholder, as original animations are unchanged

  return (
    <div
      style={{
        position: "relative",
        zIndex: 160,
        maxWidth: "95vw",
        margin: "7vh auto 8vh auto",
        background: "none",
        border: "none",
        borderRadius: 0,
        padding: 0,
        boxShadow: "none",
        textAlign: "center"
      }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.6em"
      }}>
        <span style={{filter: "drop-shadow(0 0 24px #fffbe988) drop-shadow(0 0 38px #ff4ecd9e)"}}>
          <Animation />
        </span>
        <ResultPieChart correct={correctCount} total={total} />
      </div>
      <div style={{
        fontWeight: 900,
        fontSize: "clamp(1.22em, 2.7vw, 1.96em)",
        color: "#fff",
        margin: "0.7em auto 0.7em auto",
        textShadow: "0 2.5px 15px #23ce6b,0 0px 12px #6C63FFbe,0 0px 26px #fffcd7b6"
      }}>
        You got <span style={{color:"#23CE6B"}}>{correctCount}</span> out of <span style={{color:"#FF6584"}}>{total}</span> correct!
        <br />
        <span style={{ color: "#fed502", fontWeight: 900 }}>{total === 0 ? 0 : Math.round((correctCount / total) * 100)}% correct</span>
      </div>
      {playMessage && (
        <div style={{
          fontWeight: 900,
          fontSize: "clamp(1.1em, 2vw, 1.3em)",
          color: "#fff",
          margin: "1.5em auto 1.9em auto",
          textShadow: "0 1.5px 10px #ff4ecdbe, 0 0 14px #23ce6bc7"
        }}>
          {playMessage}
        </div>
      )}
      <div style={{
        margin: "2em 0 0.8em 0",
        display: "flex",
        gap: "2.2vw",
        justifyContent: "center",
        flexWrap: "wrap",
        width: "100%"
      }}>
        <button
          className="iemo-btn iemo-btn-share iemo-floating-btn-bounce"
          onClick={onShare}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#36c6e7,#ffbf00 90%)",
            color: "#fff", fontWeight: 900,
            borderRadius: "2.2em",
            fontSize: "clamp(1.1em,2.1vw,1.31em)",
            boxShadow: "0 0 18px #ff4ecd55, 0 2px 28px #23ce6b42",
            textShadow: "0 2px 13px #fffcf7,0 0px 7px #FF6584ae"
          }}
        >
          {copied ? "Copied!" : "📋 Copy My Score"}
        </button>
        <button
          className="iemo-btn iemo-btn-restart iemo-floating-btn-bounce"
          onClick={onRestart}
          style={{
            background: "linear-gradient(90deg,#6C63FF,#23ce6b,#ffbf00)",
            color: "#fff", fontWeight: 800,
            borderRadius: "2.2em",
            fontSize: "clamp(1.1em,2.1vw,1.31em)",
            boxShadow: "0 0 12px #36c6e766, 0 2px 18px #ffbf0049"
          }}
        >
          🔄 Try Again
        </button>
      </div>
      <pre style={{
        border: "4px solid #ff4ecd",
        background: "rgba(255,255,255,0.03)",
        fontSize: "clamp(1em,2vw,1.18em)",
        color: "#ffbf00",
        fontWeight: 900,
        borderRadius: "2em",
        padding: "0.79em 1.45em",
        margin: "2.7em auto 1.3em auto",
        maxWidth: "670px",
        boxShadow: "0 1px 32px #23ce6a18",
        textShadow: "0 1px 7px #fff",
        filter: "brightness(1.09) drop-shadow(0 0 13px #ff4ecd55)",
        textAlign: "center",
        pointerEvents: "auto"
      }}>{shareText}</pre>
    </div>
  );
}

export default App;
