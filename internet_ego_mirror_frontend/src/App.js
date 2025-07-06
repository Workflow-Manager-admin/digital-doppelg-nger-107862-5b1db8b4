import React, { useState, useEffect } from "react";
import "./App.css";
import SportsBackground from "./SportsBackground";
/*
 * ResultPieChart
 * Custom SVG animated pie chart for correct/incorrect answers breakdown, including hover tooltips and accessibility.
 */

/**
 * This is the Internet Ego Mirror Quiz App – enhanced with vibrant, animated backgrounds,
 * playful animated sports icons, and a much broader, more dynamic set of sports-themed result animations!
 */

// Themed color palette (still used in quiz cards)
const PALETTE = [
  "#ff4ecd", "#6c63ff", "#23ce6b", "#ffbf00", "#19e0ff", "#ff654f", "#fc1cff", "#FED502", "#36c6e7", "#FF6584"
];
const BG_GRAD = "linear-gradient(135deg, #fed502 0%, #ff4ecd 40%, #6c63ff 100%)";
const CARD_GRAD = "linear-gradient(135deg, #fff1de 10%, #dfebff 60%, #f4e0fa 100%)";
const PERSONA_TAGS = ["bookworm", "rebel", "clown", "ghost"];

// Animated sports icons – randomized coordinates, shapes, and speeds
const SPORTS_ICON_VARIANTS = [
  // SVG icon, label for debugging (not rendered), default style overrides
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="21" fill="#ffbf00" stroke="#ff4ecd" strokeWidth="3"/>
        <ellipse cx="30" cy="18" rx="8" ry="5" fill="#fff" opacity="0.18"/>
        <ellipse cx="20" cy="28" rx="6" ry="2.5" fill="#fff" opacity="0.13"/>
      </svg>
    ),
    name: "ball"
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <rect x="14" y="8" width="20" height="32" rx="10" fill="#23ce6b"/>
        <rect x="21" y="13" width="6" height="22" rx="5" fill="#36c6e7"/>
      </svg>
    ),
    name: "bat"
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48">
        <ellipse cx="24" cy="36" rx="9" ry="6" fill="#ff654f"/>
        <rect x="22" y="7" width="4" height="21" fill="#bca657"/>
        <ellipse cx="24" cy="7" rx="4" ry="2" fill="#ffe37a"/>
      </svg>
    ),
    name: "shuttlecock"
  },
  {
    icon: (
      <svg width="46" height="46" viewBox="0 0 46 46">
        <circle cx="23" cy="23" r="19" fill="#36c6e7"/>
        <rect x="19" y="15" width="8" height="16" fill="#23ce6b"/>
        <ellipse cx="23" cy="30" rx="7" ry="2.5" fill="#fff" opacity="0.21"/>
      </svg>
    ),
    name: "sports-disc"
  },
  {
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52">
        <rect x="17" y="8" width="18" height="36" rx="9" fill="#6C63FF"/>
        <ellipse cx="26" cy="11" rx="7" ry="2.2" fill="#fff" opacity="0.19"/>
      </svg>
    ),
    name: "racquet"
  }
];

function FloatingSportsIcons() {
  // Choose a random set of icons & coords per app mount for vibrancy
  // Each gets its own animation duration and delay
  const icons = [];
  for (let i = 0; i < 7; ++i) {
    const varIdx = Math.floor(Math.random() * SPORTS_ICON_VARIANTS.length);
    icons.push({
      ...SPORTS_ICON_VARIANTS[varIdx],
      style: {
        left: `${Math.random()*85+5}%`,
        top: `${Math.random()*55+10}%`,
        animationDuration: `${8 + Math.random()*7.5}s`,
        animationDelay: `${Math.random()*9-4.6}s`
      },
      key: `float-${i}-${varIdx}-${Math.random()}`
    });
  }
  return icons.map(({icon, style, key}) => (
    <div
      className="sports-float-icon"
      style={{
        ...style,
        width: 48,
        height: 48
      }}
      key={key}
      aria-hidden="true"
    >{icon}</div>
  ));
}

// Animated color blobs for background
function AnimatedBackgroundBlobs() {
  return (
    <div className="iemo-bg-animated">
      <div className="iemo-blob iemo-blob1"></div>
      <div className="iemo-blob iemo-blob2"></div>
      <div className="iemo-blob iemo-blob3"></div>
      <div className="iemo-blob iemo-blob4"></div>
      <FloatingSportsIcons />
    </div>
  );
}

// Trivia questions convert to this UX schema
function parseTrivia(qset) {
  // Assign tags just for answer color variety
  return qset.map(q => {
    const tags = PERSONA_TAGS;
    const allAnswers = [q.correct_answer, ...q.incorrect_answers].map((a, idx) => ({
      text: decodeHtml(a),
      persona: tags[idx % tags.length]
    }));
    // Shuffle:
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

/**
 * Decodes HTML entities and URL-encoded entities (e.g., &quot;, &#039;, %20) in quiz questions/answers.
 */
function decodeHtml(input) {
  if (!input) return "";
  // Handle URL encoding
  let decoded = "";
  try {
    decoded = decodeURIComponent(input);
  } catch (e) {
    decoded = input;
  }
  // HTML entities
  const temp = document.createElement("textarea");
  temp.innerHTML = decoded;
  return temp.value;
}

// PUBLIC_INTERFACE
function App() {
  const [step, setStep] = useState(0); // 0: Welcome, ...N: quiz, N+1: Results
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [answers, setAnswers] = useState([]);
  const [copied, setCopied] = useState(false);

  // Fetch new questions on start (sports-themed)
  async function fetchQuestions() {
    setLoading(true);
    setFetchError("");
    setQuestions([]);
    setAnswers([]);
    // Open Trivia DB: Sports
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
  function handleAnswer(answerIdx) {
    setAnswers(prev => [...prev, answerIdx]);
    setStep(s => s + 1);
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

  // For shareable scores only (not persona anymore)
  function getShareText() {
    const { correctCount, total } = computeScore(answers, questions);
    return `🏆 My Sports Knowledge Quiz Score: ${correctCount}/${total} (${total === 0 ? 0 : Math.round(correctCount / total * 100)}%)\n\nTake the Internet Ego Mirror Sports Quiz yourself! https://opentdb.com/api_config.php`;
  }
  function handleShare() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  }

  // Gradient bg per step still (for edge cases), but most color is from animated blobs
  useEffect(() => {
    document.body.style.background =
      "radial-gradient(circle at 55vw 29vh,#fffad0 0%,#e0ffef 45%,#d5fcf6 90%)";
    document.body.style.transition = "background .5s";
  }, [step, questions.length]);

  // Animation helpers
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
      {step === 0 && AnimationWrappers.fade(<WelcomeScreen onStart={handleStart} />, 20)}
      {loading && AnimationWrappers.bounce(
        <div style={{
          color: "#ff4ecd",
          fontWeight: 600,
          fontSize: "1.18em",
          minHeight: "12em",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <span className="rainbow-spinner"></span>
          <div style={{ marginTop: "2em" }}>Loading new quiz...</div>
        </div>, 30
      )}
      {fetchError && AnimationWrappers.bounce(
        <div style={{
          color: "#ff654f",
          fontWeight: 700,
          background: "#fff2f2",
          borderRadius: "16px",
          padding: "1em",
          textAlign: "center",
          boxShadow: "0 2px 24px #ff4ecd41"
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
 * Refactored WelcomeScreen for floating/animated UI, no card.
 */
function WelcomeScreen({ onStart }) {
  return (
    <div className="iemo-float-welcome">
      <h1 className="iemo-title rainbow-header iemo-float-header-glow" style={{ fontWeight: 900 }}>
        <span className="iemo-float-emoji" role="img" aria-label="mirror">🪞</span>{" "}
        <span>Internet Ego Mirror</span>
      </h1>
      <p className="iemo-desc iemo-float-desc-glow" style={{
        fontSize: "1.16rem",
        background: "rgba(255,108,216,0.10)",
        borderRadius: "14px",
        padding: "1em 1.8em",
        marginBottom: "2em",
        boxShadow: "0 8px 30px #ff4ecd25, 0 2px 32px #6C63FF17",
        color: "#611991"
      }}>
        Discover your digital alter ego with surprise internet trivia! Every time you start, you get eight colorful,
        wild questions drawn live from the <a href="https://opentdb.com/" rel="noopener noreferrer" style={{ color: '#6C63FF', fontWeight: 600 }}>Open Trivia DB</a>.<br />
        No login, no key needed. <b>Click START for a new set!</b>
      </p>
      <button
        className="iemo-btn iemo-btn-accent iemo-floating-btn-bounce iemo-float-glow"
        onClick={onStart}
        style={{
          background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#FF6584)",
          fontSize: "1.38em",
          boxShadow: "0 4px 32px #ff4ecd3c, 0 6px 32px #23ce6a3e",
          marginBottom: "0.5em",
        }}
      >
        🎉 Start Quiz 🎉
      </button>
    </div>
  );
}

// --- QUESTION SCREEN ---
function QuestionScreen({ questionIdx, total, question, onAnswer, selected, floatUI }) {
  if (!question) return null;
  // Extra animation delays for floating effect
  const delayBase = 80 + 40 * (questionIdx % 5);
  return (
    <div className={`iemo-float-qa-wrap${floatUI ? " iemo-float-active" : ""}`}>
      <div className="iemo-float-question-step iemo-float-slidein"
        style={{ animationDelay: `${delayBase + 80}ms` }}>
        <span
          className="iemo-steps rainbow-label iemo-float-bounce-glow"
          style={{
            background: PALETTE[questionIdx % PALETTE.length],
            color: "#fff",
            padding: "2px 17px",
            borderRadius: "21px",
            marginRight: "12px",
            fontWeight: 800,
            fontSize: "1.07em",
            letterSpacing: "0.08em",
            boxShadow: "0 2px 18px #23ce6c99, 0 0 12px #ff4ecd66"
          }}>
          Q{questionIdx + 1}
        </span>
        <span className="iemo-float-stepof">of {total}</span>
      </div>
      <h2 className="iemo-q rampage-gradient iemo-float-question-glow"
        style={{ animationDelay: `${delayBase + 185}ms` }}>
        {question.question}
      </h2>
      <div className="iemo-answers iemo-float-answers-flare">
        {question.answers.map((a, idx) => (
          <button
            key={a.text}
            className={`iemo-answer-card iemo-float-answer-btn iemo-fab-glow ${selected === idx ? "selected" : ""}`}
            style={{
              animationDelay: `${delayBase + 275 + idx * 65}ms`,
              background: selected === idx
                ? `linear-gradient(80deg,${PALETTE[(questionIdx + idx * 2 + 1) % PALETTE.length]},#fff)`
                : `linear-gradient(120deg,${PALETTE[(questionIdx + idx) % PALETTE.length]},#f9f8ff 80%)`,
              borderColor: selected === idx ? PALETTE[(questionIdx + idx) % PALETTE.length] : "#efefef",
              color: selected === idx ? "#2e195c" : "#21232c",
              fontWeight: selected === idx ? 800 : 600,
              fontSize: "1.13em",
              letterSpacing: selected === idx ? "0.01em" : "0.01em",
              filter: selected === idx
                ? "drop-shadow(0 0 18px #ff4ecd77) brightness(1.06)"
                : "drop-shadow(0 2px 16px #6C63FF15)",
              transition: "all .23s"
            }}
            onClick={() => onAnswer(idx)}
            tabIndex="0"
            aria-pressed={selected === idx}
            aria-label={a.text}
            disabled={typeof selected !== "undefined"}
          >
            <b>{a.text}</b>
            <span className="persona-tag" style={{
              marginLeft: "10px", fontSize: "0.72em", color: "#fff",
              background: "#7b04c4", borderRadius: "11px", padding: "2px 10px",
              opacity: 0.7
            }}>{a.persona}</span>
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

function ResultPieChart({ correct, total }) {
  // Draw a custom SVG pie chart with two slices, and percentage/tooltip in the center.
  const incorrect = Math.max(0, total - correct);
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [hover, setHover] = React.useState(null);

  // Compute arc for the correct slice:
  // Uses SVG arc formula on a 70px radius circle in 154x154px SVG.
  const size = 154, radius = 66, center = 77;
  const toRadians = x => (x / 100) * 360 * (Math.PI / 180);
  const sliceAngle = total > 0 ? (correct / total) * 360 : 0;
  // SVG arc sweep flag
  function describeArc(cx, cy, r, startAngle, endAngle){
    // From https://stackoverflow.com/a/18473154/2441655
    const polarToCartesian = (cx, cy, r, angleDeg) => {
      var angleRad = (angleDeg-90) * Math.PI / 180.0;
      return {
        x: cx + (r * Math.cos(angleRad)),
        y: cy + (r * Math.sin(angleRad))
      };
    };
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M", start.x, start.y,
      "A", r, r, 0, arcSweep, 0, end.x, end.y
    ].join(" ");
    return d;
  }
  // For < 100% correctness, always render both slices
  const arcProps = {
    correct: {
      d: describeArc(center, center, radius, 0, sliceAngle),
      color: "#23CE6B"
    },
    incorrect: {
      d: describeArc(center, center, radius, sliceAngle, 360),
      color: "#FF6584"
    }
  };
  // Tooltip/label logic
  const SLICE_LABELS = [
    {
      label: `${percent}% Correct`,
      desc: `${correct} out of ${total} Correct`
    },
    {
      label: `${100 - percent}% Incorrect`,
      desc: `${incorrect} out of ${total} Incorrect`
    }
  ];
  return (
    <div style={{ width: size, height: size, marginBottom: "1.4em", position: "relative", userSelect: "none" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{
        boxShadow: "0 2px 18px #23ce6a38, 0 4px 38px #ff4ecd19",
        background: "rgba(246,237,253,0.10)",
        borderRadius: "50%",
        display: "block"
      }}>
        {/* Background ring */}
        <circle cx={center} cy={center} r={radius} stroke="#ece4fb" strokeWidth="28" fill="none"/>
        {/* Correct arc */}
        {total > 0 && correct > 0 &&
          <path
            d={arcProps.correct.d}
            stroke={arcProps.correct.color}
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
            style={{ filter: hover === 0 ? "drop-shadow(0 0 8px #23CE6B44)" : "" , cursor: "pointer"}}
            onMouseOver={() => setHover(0)}
            onFocus={() => setHover(0)}
            onMouseOut={() => setHover(null)}
            onBlur={() => setHover(null)}
            tabIndex={0}
          />
        }
        {/* Incorrect arc */}
        {total > 0 && incorrect > 0 &&
          <path
            d={arcProps.incorrect.d}
            stroke={arcProps.incorrect.color}
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
            style={{ filter: hover === 1 ? "drop-shadow(0 0 8px #FF658444)" : "" , cursor: "pointer"}}
            onMouseOver={() => setHover(1)}
            onFocus={() => setHover(1)}
            onMouseOut={() => setHover(null)}
            onBlur={() => setHover(null)}
            tabIndex={0}
          />
        }
      </svg>
      {/* Center donut/label */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
        flexDirection: "column",
        zIndex: 2
      }}>
        <div style={{
          background: "rgba(255,255,255,0.89)",
          borderRadius: "54%",
          padding: "0.5em 1.2em",
          fontWeight: 900,
          fontSize: "1.58em",
          color: "#6C63FF",
          boxShadow: "0 2px 15px #36c6e71d"
        }}>
          {percent}%
        </div>
        <div style={{
          fontSize: "0.82em",
          fontWeight: 700,
          color: hover === 0 ? "#178b46" : (hover === 1 ? "#b43b47" : "#341c3d"),
          marginTop: "4px"
        }}>
          {hover === 0 ? SLICE_LABELS[0].desc : hover === 1 ? SLICE_LABELS[1].desc : "Accuracy"}
        </div>
      </div>
      {/* Accessible legend */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
        <span style={{ display: "flex", alignItems: "center", fontSize: "0.98em" }}>
          <span style={{
            width: 14, height: 14, borderRadius: "50%", background: "#23CE6B", display: "inline-block", marginRight: 5
          }}/>
          <span style={{ color: "#23CE6B", fontWeight: 800 }}>Correct</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", fontSize: "0.98em" }}>
          <span style={{
            width: 14, height: 14, borderRadius: "50%", background: "#FF6584", display: "inline-block", marginRight: 5
          }}/>
          <span style={{ color: "#FF6584", fontWeight: 800 }}>Incorrect</span>
        </span>
      </div>
    </div>
  );
}
// --- SPORTS ANIMATION ---
// (SVG or animated React snippets, random pick among these components)
const SPORTS_ANIMATIONS = [
  // Confetti
  function Confetti() {
    return (
      <svg width="170" height="55" viewBox="0 0 170 55" fill="none" style={{marginBottom: 10}}>
        <g>
          <circle cx="15" cy="25" r="5" fill="#ff4ecd"><animate attributeName="cy" values="15;35;15" dur="1.4s" repeatCount="indefinite"/></circle>
          <circle cx="45" cy="30" r="3.3" fill="#6c63ff"><animate attributeName="cy" values="30;50;22;30" dur="1.18s" repeatCount="indefinite"/></circle>
          <circle cx="80" cy="38" r="4.2" fill="#23ce6b"><animate attributeName="cy" values="38;41;27;38" dur="1.6s" repeatCount="indefinite"/></circle>
          <rect x="100" y="35" width="6" height="6" rx="2" fill="#ffbf00"><animate attributeName="y" values="15;35;15" dur="0.99s" repeatCount="indefinite"/></rect>
          <circle cx="120" cy="20" r="4.5" fill="#36c6e7"><animate attributeName="cy" values="20;35;20" dur="1.55s" repeatCount="indefinite"/></circle>
          <circle cx="150" cy="24" r="5.2" fill="#ff654f"><animate attributeName="cy" values="24;44;29;24" dur="1.11s" repeatCount="indefinite"/></circle>
        </g>
      </svg>
    );
  },
  // Trophy
  function Trophy() {
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{marginBottom: 10}}>
        <g>
          <rect x="36" y="62" width="8" height="12" rx="3" fill="#BCA657" />
          <ellipse cx="40" cy="51" rx="12" ry="10" fill="#ffe37a" stroke="#bca657" strokeWidth="2" />
          <ellipse cx="40" cy="27" rx="24" ry="18" fill="#ffe37a" stroke="#bca657" strokeWidth="3"/>
          <ellipse cx="40" cy="27" rx="13" ry="10" fill="#ffe37a" opacity="0.5"/>
          <rect x="8" y="18" width="8" height="20" rx="4" fill="#cfc8b1" />
          <rect x="64" y="18" width="8" height="20" rx="4" fill="#cfc8b1" />
          <ellipse cx="12" cy="38" rx="6" ry="6" fill="#ffe37a" opacity="0.5"/>
          <ellipse cx="68" cy="38" rx="6" ry="6" fill="#ffe37a" opacity="0.5"/>
        </g>
      </svg>
    );
  },
  // Animated Soccer Ball moving and rolling
  function SoccerBall() {
    return (
      <svg width="58" height="58" viewBox="0 0 58 58" fill="none" style={{marginBottom: 10, animation: "soccer-bounce 1.3s infinite cubic-bezier(.53,.43,.73,.92)"}}>
        <circle cx="29" cy="29" r="28" fill="#fff" stroke="#222" strokeWidth="2"/>
        <polygon points="29,18 34,23 29,29 24,23" fill="#222" />
        <polygon points="29,29 34,35 29,40 24,35" fill="#222" />
        <circle cx="29" cy="29" r="8" fill="#222"/>
        <style>
          {`
            @keyframes soccer-bounce {
              0% { transform: translateY(0) rotate(0deg);}
              35% {transform: translateY(-18px) rotate(-23deg);}
              75% {transform: translateY(8px) rotate(13deg);}
              100% { transform: translateY(0) rotate(0);}
            }
          `}
        </style>
      </svg>
    );
  },
  // Bouncing Basketball
  function Basketball() {
    return (
      <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{marginBottom:10, animation: "basketball-bounce 1.0s infinite cubic-bezier(.49,.21,.59,.91)"}}>
        <circle cx="27" cy="27" r="24" fill="#FF654F" stroke="#fe7b24" strokeWidth="2.5"/>
        <path d="M3 27h48M27 3v48M9 9c11 11 25 25 36 36M45 9C34 20 20 34 9 45" stroke="#fff2e6" strokeWidth="2"/>
        <style>
          {`
            @keyframes basketball-bounce {
              0% { transform: translateY(0);}
              45% {transform: translateY(-14px);}
              75% {transform: translateY(4px);}
              100% { transform: translateY(0);}
            }
          `}
        </style>
      </svg>
    );
  },
  // Cricket bat and ball: ball rolls and bat swings
  function CricketBatBall() {
    return (
      <svg width="80" height="45" viewBox="0 0 80 45" fill="none" style={{marginBottom:6}}>
        <g>
          <rect x="45" y="17" width="20" height="9" rx="4" fill="#bca657" transform="rotate(-24 45 17)" style={{transformOrigin: '55px 21.5px', animation: "swingBat 1.25s infinite alternate"}} />
          <ellipse cx="27" cy="36" rx="9" ry="9" fill="#ff4ecd">
              <animate attributeName="cx" values="27;52;27" dur="1.35s" repeatCount="indefinite"/>
          </ellipse>
        </g>
        <style>
          {`
            @keyframes swingBat {
              0% { transform: rotate(-20deg);}
              50% { transform: rotate(30deg);}
              100%{ transform: rotate(-20deg);}
            }
          `}
        </style>
      </svg>
    );
  },
  // Tennis racket swiping at a floating yellow ball
  function TennisRacket() {
    return (
      <svg width="90" height="42" viewBox="0 0 90 42" fill="none" style={{marginBottom:9}}>
        <ellipse cx="27" cy="21" rx="14" ry="18" fill="#23ce6b" stroke="#222" strokeWidth="2.2"
          style={{transformOrigin: "27px 21px", animation: "tennis-racket 1.2s infinite alternate"}}
        />
        <rect x="36" y="20" width="14" height="4.8" rx="1.8" fill="#bca657"
          style={{transformOrigin: "36px 22px", animation: "tennis-racket 1.2s infinite alternate"}}
        />
        <ellipse cx="65" cy="24" rx="5.2" ry="5.2" fill="#FED502">
          <animate attributeName="cy" values="19;34;24;19" dur="1.15s" repeatCount="indefinite"/>
        </ellipse>
        <style>
          {`
            @keyframes tennis-racket {
              0% { transform: rotate(6deg);}
              50% { transform: rotate(-22deg);}
              100%{ transform: rotate(6deg);}
            }
          `}
        </style>
      </svg>
    );
  },
  // Medal (original)
  function Medal() {
    return (
      <svg width="55" height="68" viewBox="0 0 55 68" fill="none" style={{marginBottom:10}}>
        <circle cx="27.5" cy="44" r="20" fill="#FFF176" stroke="#FBC02D" strokeWidth="3"/>
        <circle cx="27.5" cy="44" r="8.9" fill="#ffd600" />
        <rect x="15" y="5" width="8" height="30" rx="4" fill="#6c63ff"/>
        <rect x="32" y="5" width="8" height="30" rx="4" fill="#23ce6b"/>
        <ellipse cx="23" cy="30" rx="6" ry="4" fill="#ff4ecd" opacity="0.7"/>
        <ellipse cx="34" cy="32" rx="5" ry="2" fill="#fff" opacity="0.7"/>
      </svg>
    );
  },
  // Volleyball (volley movement)
  function Volleyball() {
    return (
      <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{marginBottom:8, animation: "volleymove 1.3s infinite"}}>
        <circle cx="27" cy="27" r="23" fill="#36c6e7" stroke="#23ce6b" strokeWidth="2"/>
        <path d="M7 40Q27 7 47 40" stroke="#fff" strokeWidth="2"/>
        <path d="M6 23Q27 46 48 23" stroke="#fff" strokeWidth="2"/>
        <style>
          {`
            @keyframes volleymove {
              0% { transform: translateY(0);}
              45% {transform: translateY(-14px);}
              75% {transform: translateY(5px);}
              100% { transform: translateY(0);}
            }
          `}
        </style>
      </svg>
    );
  },
  // Football helmet (shake effect)
  function FootballHelmet() {
    return (
      <svg width="62" height="45" viewBox="0 0 62 45" fill="none" style={{marginBottom:10, animation: "helmet-shake 0.95s infinite alternate"}}>
        <ellipse cx="31" cy="27" rx="25" ry="16" fill="#6C63FF"/>
        <path d="M10 35q10-16 42 0" stroke="#fff" strokeWidth="3"/>
        <rect x="47" y="21" width="11" height="9" rx="3.5" fill="#FED502"/>
        <style>
          {`
            @keyframes helmet-shake {
              0% { transform: rotate(-3deg);}
              60% { transform: rotate(6deg);}
              100% { transform: rotate(-3deg);}
            }
          `}
        </style>
      </svg>
    );
  }
];

/**
 * Refactored ResultScreen – floating, highlight animation and glowy feedback.
 */
function ResultScreen({ answers, questions, onRestart, onShare, copied, shareText, floatUI }) {
  // Compute stats
  const { correctCount, total } = computeScore(answers, questions);

  let playMessage = "";
  if (total > 0) {
    const percent = Math.round((correctCount / total) * 100);
    if (percent >= 90) {
      playMessage = "🏅 You are a walking sports Wikipedia!";
    } else if (percent >= 60) {
      playMessage = "💪 Solid performance—you’d own the local sports bar quiz!";
    } else if (percent >= 40) {
      playMessage = "😄 You watch the highlights, don’t you?";
    } else {
      playMessage = "🤔 Maybe try playing some Fantasy Sports?";
    }
  }

  // Animation
  const [animationIdx] = useState(() => Math.floor(Math.random() * SPORTS_ANIMATIONS.length));
  const Animation = SPORTS_ANIMATIONS[animationIdx];

  return (
    <div className={`iemo-result iemo-float-result-bubble${floatUI ? " iemo-float-active" : ""}`}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.4em"
      }}>
        <span className="iemo-float-result-anim iemo-float-bounceglow">
          <Animation />
        </span>
        {/* Pie chart under icon */}
        <ResultPieChart correct={correctCount} total={total} />
      </div>
      <div className="iemo-res-section iemo-float-res-perf-glow">
        You got <b>{correctCount}</b> out of <b>{total}</b> correct!<br />
        <span style={{ color: "#23CE6B" }}>{total === 0 ? 0 : Math.round((correctCount / total) * 100)}% correct</span>
      </div>
      {playMessage && (
        <div className="iemo-res-section iemo-float-res-message" style={{
          fontWeight: 900, fontSize: "1.19em"
        }}>
          {playMessage}
        </div>
      )}
      <div className="iemo-share-section iemo-float-share-btns" style={{ marginBottom: "1.2em", marginTop:"1em" }}>
        <button
          className="iemo-btn iemo-btn-share iemo-floating-btn-bounce iemo-float-glow"
          onClick={onShare}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#36c6e7,#ffbf00 90%)",
            color: "#fff", fontWeight: 700
          }}
        >
          {copied ? "Copied!" : "📋 Copy My Score"}
        </button>
        <button className="iemo-btn iemo-btn-restart iemo-floating-btn-bounce" onClick={onRestart}>
          🔄 Try Again
        </button>
      </div>
      <pre className="iemo-share-card iemo-float-glow" style={{
        border: `2px solid #23ce6b`,
        background: "#fff6e6",
        color: "#9C27B0",
        fontWeight: 600
      }}>{shareText}</pre>
    </div>
  );
}

export default App;
