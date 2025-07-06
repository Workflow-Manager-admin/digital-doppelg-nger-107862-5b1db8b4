import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * This is the Internet Ego Mirror Quiz App, now revised for a pure sports-y summary finale!
 * 
 * Result (summary) page now:
 *   - Removes all "internet ego", persona resume, aura, and "social media suggestion" content.
 *   - After showing the score and joke, displays one of several playful sports SVG/animated illustrations chosen at random.
 */

// Themed color palette (still used in quiz cards)
const PALETTE = [
  "#ff4ecd", "#6c63ff", "#23ce6b", "#ffbf00", "#19e0ff", "#ff654f", "#fc1cff", "#FED502", "#36c6e7", "#FF6584"
];
const BG_GRAD = "linear-gradient(135deg, #fed502 0%, #ff4ecd 40%, #6c63ff 100%)";
const CARD_GRAD = "linear-gradient(135deg, #fff1de 10%, #dfebff 60%, #f4e0fa 100%)";

// No personas needed for result page, but keep tags for answer/card color
const PERSONA_TAGS = ["bookworm", "rebel", "clown", "ghost"];

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
    decoded = input; // Fallback
  }
  // Now handle HTML entities
  const temp = document.createElement("textarea");
  temp.innerHTML = decoded;
  return temp.value;
}

// PUBLIC_INTERFACE
function App() {
  const [step, setStep] = useState(0); // 0: Welcome, 1...N: quiz, N+1: Results
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [answers, setAnswers] = useState([]);
  const [copied, setCopied] = useState(false);

  // Fetch new questions on start (sports-themed, always playful!)
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

  // Gradient bg per step
  useEffect(() => {
    document.body.style.background =
      step === 0 ? BG_GRAD :
        step > (questions.length || 0) ? CARD_GRAD : BG_GRAD;
    document.body.style.transition = "background .4s";
  }, [step, questions.length]);

  return (
    <div className="iemo-app">
      <div className="iemo-card blitz-card">
        {step === 0 && <WelcomeScreen onStart={handleStart} />}
        {loading && (
          <div style={{
            color: "#ff4ecd",
            fontWeight: 600,
            fontSize: "1.18em",
            minHeight: "12em",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <span className="rainbow-spinner"></span>
            <div style={{ marginTop: "2em" }}>Loading new quiz...</div>
          </div>
        )}
        {fetchError && (
          <div style={{
            color: "#ff654f",
            fontWeight: 700,
            background: "#fff2f2",
            borderRadius: "12px",
            padding: "1em",
            textAlign: "center"
          }}>
            {fetchError}
            <button className="iemo-btn iemo-btn-restart" onClick={handleRestart} style={{ marginTop: "2em" }}>Retry</button>
          </div>
        )}
        {(step > 0 && step <= (questions.length || 0) && !loading && !fetchError) && (
          <QuestionScreen
            questionIdx={step - 1}
            total={questions.length}
            question={questions[step - 1]}
            onAnswer={handleAnswer}
            selected={answers[step - 1]}
          />
        )}
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
      </div>
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

// --- WELCOME SCREEN ---
function WelcomeScreen({ onStart }) {
  return (
    <>
      <h1 className="iemo-title rainbow-header" style={{ fontWeight: 900 }}>
        <span role="img" aria-label="mirror">🪞</span>{" "}
        <span>Internet Ego Mirror</span>
      </h1>
      <p className="iemo-desc" style={{
        fontSize: "1.16rem", background: "rgba(255,108,216,0.10)", borderRadius: "14px", padding: "1em",
        boxShadow: "0 4px 24px #ff4ecd21", color: "#611991"
      }}>
        Discover your digital alter ego with surprise internet trivia! Every time you start, you get eight colorful, wild questions drawn live from the <a href="https://opentdb.com/" rel="noopener noreferrer" style={{ color: '#6C63FF', fontWeight: 600 }}>Open Trivia DB</a>.<br />
        No login, no key needed. <b>Click START for a new set!</b>
      </p>
      <button className="iemo-btn iemo-btn-accent" onClick={onStart} style={{
        background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#FF6584)",
        fontSize: "1.38em", boxShadow: "0 2px 18px #ff4ecd2a,0 1.5px 12px #23ce6a36"
      }}>
        🎉 Start Quiz 🎉
      </button>
    </>
  );
}

// --- QUESTION SCREEN ---
function QuestionScreen({ questionIdx, total, question, onAnswer, selected }) {
  if (!question) return null;
  return (
    <>
      <div className="iemo-steps rainbow-label">
        <span style={{
          background: PALETTE[questionIdx % PALETTE.length],
          color: "#fff",
          padding: "2px 14px",
          borderRadius: "18px",
          marginRight: "9px",
          fontWeight: 700
        }}>Q{questionIdx + 1}</span>
        <span>of {total}</span>
      </div>
      <h2 className="iemo-q rampage-gradient">{question.question}</h2>
      <div className="iemo-answers rainbow-bg">
        {question.answers.map((a, idx) => (
          <button
            key={a.text}
            className={`iemo-answer-card vibe-card ${selected === idx ? "selected" : ""}`}
            style={{
              background: selected === idx
                ? `linear-gradient(80deg,${PALETTE[(questionIdx + idx * 2 + 1) % PALETTE.length]},#fff)`
                : `linear-gradient(120deg,${PALETTE[(questionIdx + idx) % PALETTE.length]},#f9f8ff 80%)`,
              borderColor: selected === idx ? PALETTE[questionIdx % PALETTE.length] : "#efefef",
              color: selected === idx ? "#2e195c" : "#21232c",
              fontWeight: selected === idx ? 800 : 600,
              fontSize: "1.13em",
              letterSpacing: selected === idx ? "0.01em" : "0.01em",
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
    </>
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

// --- SPORTS ANIMATION ---
// (SVG or animated React snippet, random pick among these components)
const SPORTS_ANIMATIONS = [
  function Confetti() {
    // Simple confetti SVG
    return (
      <svg width="180" height="55" viewBox="0 0 180 55" fill="none" style={{marginBottom: 10}}>
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
  function Trophy() {
    // Trophy SVG
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
  function BouncingBall() {
    // Bouncing ball SVG, animated via CSS (see inline below)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
        <svg className="bouncing-ball" width="40" height="40" viewBox="0 0 40 40" style={{marginBottom:6}}>
          <circle cx="20" cy="20" r="17" fill="#36c6e7" stroke="#23ce6b" strokeWidth="3" />
          <ellipse cx="17" cy="18" rx="4" ry="2.2" fill="#fff" opacity="0.7"/>
          <ellipse cx="28" cy="26" rx="3.3" ry="1.2" fill="#fff" opacity="0.3"/>
        </svg>
        <style>
          {`
            .bouncing-ball {
              animation: ballbounce 1.1s infinite cubic-bezier(.74,.07,.53,.99);
            }
            @keyframes ballbounce {
              0% { transform: translateY(0); }
              40% { transform: translateY(20px);}
              60% { transform: translateY(12px);}
              100%{ transform: translateY(0);}
            }
          `}
        </style>
      </div>
    );
  },
  function Medal() {
    // Medal SVG
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
  }
];

// PUBLIC_INTERFACE
function ResultScreen({ answers, questions, onRestart, onShare, copied, shareText }) {
  // Compute stats
  const { correctCount, total } = computeScore(answers, questions);

  // Score-based playful message
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

  // Pick a random animation (changes each mounting of result page)
  const [animationIdx] = useState(() => Math.floor(Math.random() * SPORTS_ANIMATIONS.length));
  const Animation = SPORTS_ANIMATIONS[animationIdx];

  return (
    <div className="iemo-result" style={{
      background: "linear-gradient(120deg,#f6edfd 70%,#d8fce9 100%)",
      borderRadius: "22px",
      boxShadow: "0 2px 36px #ffd0ff1f",
      margin: "-1em -1em 0",
      padding: "1em"
    }}>
      <div style={{display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"1.4em"}}>
        <Animation />
      </div>
      <div className="iemo-res-section" style={{
        background: "#fff2f4", borderRadius: "13px", padding: "0.76em 0.5em",
        boxShadow: "0 2px 14px #ff4ecd10", marginTop: "0.8em", fontWeight: 700,
        fontSize: "1.21em"
      }}>
        You got <b>{correctCount}</b> out of <b>{total}</b> correct!<br />
        <span style={{ color: "#23CE6B" }}>{total === 0 ? 0 : Math.round((correctCount / total) * 100)}% correct</span>
      </div>
      {playMessage && (
        <div className="iemo-res-section" style={{
          color: "#FF6584", background: "#fff0ec", margin: "0.75em 0",
          fontWeight: 900, borderRadius: "12px", fontSize: "1.19em", boxShadow: "0 2px 12px #ffd0ff22"
        }}>
          {playMessage}
        </div>
      )}
      <div className="iemo-share-section" style={{ marginBottom: "1.2em", marginTop:"1em" }}>
        <button
          className="iemo-btn iemo-btn-share"
          onClick={onShare}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#36c6e7,#ffbf00 90%)",
            color: "#fff", fontWeight: 700
          }}
        >
          {copied ? "Copied!" : "📋 Copy My Score"}
        </button>
        <button className="iemo-btn iemo-btn-restart" onClick={onRestart}>
          🔄 Try Again
        </button>
      </div>
      <pre className="iemo-share-card" style={{
        border: `2px solid #23ce6b`,
        background: "#fff6e6",
        color: "#9C27B0",
        fontWeight: 600
      }}>{shareText}</pre>
    </div>
  );
}

export default App;
