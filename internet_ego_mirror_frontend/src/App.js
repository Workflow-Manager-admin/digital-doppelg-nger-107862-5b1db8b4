import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * This version uses the Open Trivia DB API to fetch new quiz questions
 * every session (https://opentdb.com/api_config.php).
 * - No API key is required (Open Trivia DB is fully free/public).
 * - API tips: category=any (random) & difficulty=randomized for more variety.
 * - Questions and answers are styled in SUPER colorful, playful, and modern palettes.
 */

// Themed color constants – we go even more vibrant and bold now!
const PALETTE = [
  "#ff4ecd", "#6c63ff", "#23ce6b", "#ffbf00", "#19e0ff", "#ff654f", "#fc1cff", "#FED502", "#36c6e7", "#FF6584"
];
const BG_GRAD = "linear-gradient(135deg, #fed502 0%, #ff4ecd 40%, #6c63ff 100%)";
const CARD_GRAD = "linear-gradient(135deg, #fff1de 10%, #dfebff 60%, #f4e0fa 100%)";

// Persona map for fun/quirky results (by majority answer type assigned to personality tags below)
const PERSONA_TYPES = [
  {
    key: "bookworm", color: "#36c6e7", emoji: "📚",
    name: "Multiverse Bookworm",
    desc: "You thirst for knowledge and can out-riddle any SphinxBot online. Forums or comment threads? You devour them all.",
    resume: "Trivia Gladiator • Curious Visionary",
    aura: "#36c6e7", social: "Quora, Wikipedia rabbit holes"
  },
  {
    key: "rebel", color: "#ff4ecd", emoji: "🤘",
    name: "Pixel Rebel",
    desc: "You challenge conventions, spot plot holes, and win flame wars. Chaos and creativity in equal measure.",
    resume: "Meme Instigator • Alt Poster",
    aura: "#ff4ecd", social: "Weird X threads, Discord chaos-servers"
  },
  {
    key: "clown", color: "#ffbf00", emoji: "🤡",
    name: "Clown Prince/ss of Memes",
    desc: "You live for likes, laughs, and the dopamine rush of every viral gif. Meme legend everywhere you go.",
    resume: "Senior Meme Dealer • Hype Machine",
    aura: "#ffbf00", social: "Instagram reels, TikTok, meme subreddits"
  },
  {
    key: "ghost", color: "#848cff", emoji: "👻",
    name: "Incognito Ghost",
    desc: "You lurk, you observe, and your opinions are silent daggers. The ultimate, mysterious observer.",
    resume: "Comments Ninja • Drama Ghost",
    aura: "#848cff", social: "Reddit, Twitter dark mode"
  }
];

function getPersonalityType(answers) {
  // Pick majority persona by tag assigned to each answer (see below during parse)
  if (!answers || !answers.length) return PERSONA_TYPES[0];
  const tally = {};
  answers.forEach(t => { tally[t] = (tally[t] || 0) + 1; });
  let max = -1, key = "bookworm";
  for (const k in tally) if (tally[k] > max) { max = tally[k]; key = k; }
  return PERSONA_TYPES.find(p => p.key === key) || PERSONA_TYPES[0];
}

// Trivia questions convert to this UX schema
function parseTrivia(qset) {
  // Assign shuffled personas to answers for randomness/fun
  return qset.map(q => {
    const tags = ["bookworm", "rebel", "clown", "ghost"];
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
      answers: allAnswers
    };
  });
}

/**
 * Decodes HTML entities and URL-encoded entities (e.g., &quot;, &#039;, %20) in quiz questions/answers.
 * This ensures trivia text is always human-readable, even when API returns mixed encodings.
 */
function decodeHtml(input) {
  if (!input) return "";
  // First, handle URL encoding (like %20 etc)
  let decoded = "";
  try {
    decoded = decodeURIComponent(input);
  } catch (e) {
    decoded = input; // Fallback if not percent-encoded
  }
  // Now handle HTML entities (like &quot;, &#039; etc)
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

  // Fetch new questions on start (computer/gadget tech themed only)
  async function fetchQuestions() {
    setLoading(true);
    setFetchError("");
    setQuestions([]);
    setAnswers([]);
    // Always tech trivia: Category 18 (Science: Computers) from Open Trivia DB
    const DIFFICULTY = ["easy", "medium", "hard"][Math.floor(Math.random() * 3)];
    const categories = [18]; // 18 is Science: Computers, see https://opentdb.com/api_config.php
    // In the future, if Open Trivia DB adds a gadgets or related category, add its id to this array.
    const category = categories[Math.floor(Math.random() * categories.length)];
    let url =
      `https://opentdb.com/api.php?amount=8&type=multiple&category=${category}&encode=url3986`;
    if (Math.random() < 0.8) url += `&difficulty=${DIFFICULTY}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (!data.results || !data.results.length) {
        setFetchError(
          "Could not load technology questions from server. Please try again."
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
    setStep(1); // Main quiz begins after fetchQuestions (async)
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

  // Personas—majority tag picked
  let persona = null, personaType = null;
  if (answers.length === questions.length && questions.length > 0) {
    const tags = answers.map((idx, i) => questions[i].answers[idx].persona);
    personaType = getPersonalityType(tags);
    persona = {
      name: personaType.name,
      description: personaType.desc,
      resume: personaType.resume,
      aura: personaType.aura,
      emoji: personaType.emoji,
      social: personaType.social
    };
  }

  // Copy/share text
  function getShareText() {
    if (!persona) return "";
    return `🌈 My Internet Ego: ${persona.name}!  🤩\n\n${persona.description}\n\nRésumé: ${persona.resume}\nAura Color: ${persona.aura}\nSocial suggestion: ${persona.social}\n\nQuiz made with Open Trivia DB 🟣\nTry the Internet Ego Mirror!`;
  }
  function handleShare() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  }

  // Vibrant gradient background per step
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
            <button className="iemo-btn iemo-btn-restart" onClick={handleRestart} style={{marginTop: "2em"}}>Retry</button>
          </div>
        )}
        {(step > 0 && step <= (questions.length || 0) && !loading && !fetchError) && (
          <QuestionScreen
            questionIdx={step-1}
            total={questions.length}
            question={questions[step-1]}
            onAnswer={handleAnswer}
            selected={answers[step-1]}
          />
        )}
        {(step > (questions.length || 0) && persona != null && !loading && !fetchError) && (
          <ResultScreen
            persona={persona}
            shareText={getShareText()}
            copied={copied}
            onRestart={handleRestart}
            onShare={handleShare}
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
      <h1 className="iemo-title rainbow-header" style={{fontWeight:900}}>
        <span role="img" aria-label="mirror">🪞</span>{" "}
        <span>Internet Ego Mirror</span>
      </h1>
      <p className="iemo-desc" style={{fontSize:"1.16rem", background: "rgba(255,108,216,0.10)", borderRadius:"14px", padding:"1em", boxShadow:"0 4px 24px #ff4ecd21", color: "#611991"}}>
        Discover your digital alter ego with surprise internet trivia! Every time you start, you get eight colorful, wild questions drawn live from the <a href="https://opentdb.com/" rel="noopener noreferrer" style={{color:'#6C63FF', fontWeight:600}}>Open Trivia DB</a>.<br/>
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
                ? `linear-gradient(80deg,${PALETTE[(questionIdx + idx*2+1)%PALETTE.length]},#fff)`
                : `linear-gradient(120deg,${PALETTE[(questionIdx + idx)%PALETTE.length]},#f9f8ff 80%)`,
              borderColor: selected === idx ? PALETTE[questionIdx % PALETTE.length] : "#efefef",
              color: selected === idx ? "#2e195c" : "#21232c",
              fontWeight: selected === idx ? 800 : 600,
              fontSize: "1.13em",
              letterSpacing: selected===idx?"0.01em":"0.01em",
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
              marginLeft:"10px", fontSize:"0.72em", color:"#fff",
              background: "#7b04c4", borderRadius:"11px", padding:"2px 10px",
              opacity:0.7
            }}>{a.persona}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// --- RESULTS SCREEN ---
function ResultScreen({ persona, shareText, copied, onRestart, onShare }) {
  // blast aura
  return (
    <div className="iemo-result" style={{
      background: "linear-gradient(120deg,#f6edfd 70%,#d8fce9 100%)",
      borderRadius: "22px",
      boxShadow: "0 2px 36px #ffd0ff1f",
      margin: "-1em -1em 0",
      padding: "1em"
    }}>
      <div className="iemo-badge" style={{
        background: `radial-gradient(circle at 35% 48%,${persona.aura} 85%,#fff 100%)`,
        borderColor: persona.aura,
        color: "#fff",
        boxShadow: `0 2px 18px ${persona.aura}44`
      }}>
        {persona.emoji}
      </div>
      <h2 className="iemo-persona-name rampage-gradient">{persona.name}</h2>
      <div className="iemo-res-section">
        <div className="iemo-persona-title rainbow-label">{persona.resume}</div>
      </div>
      <div className="iemo-res-section">
        <span className="iemo-persona-desc" style={{
          background:"#fff8f9", color: "#a334be", padding:"0.7em", borderRadius:"12px"
        }}>{persona.description}</span>
      </div>
      <div className="iemo-res-section">
        <strong className="iemo-label">Aura Color</strong>
        <span className="iemo-color-sample" style={{
          background: persona.aura,
          borderColor: persona.aura,
          boxShadow: `0 1px 8px ${persona.aura}66`
        }}></span>
      </div>
      <div className="iemo-res-section">
        <strong className="iemo-label">Social Media Suggestion:</strong>
        <span className="iemo-social" style={{ color: persona.aura, fontWeight: 700 }}>{persona.social}</span>
      </div>
      <div className="iemo-share-section" style={{marginBottom: "1.5em"}}>
        <button
          className="iemo-btn iemo-btn-share"
          onClick={onShare}
          style={{
            background: "linear-gradient(90deg,#ff4ecd,#36c6e7,#ffbf00 90%)",
            color: "#fff", fontWeight: 700
          }}
        >
          {copied ? "Copied!" : "🎈 Copy Persona!"}
        </button>
        <button className="iemo-btn iemo-btn-restart" onClick={onRestart}>
          🔄 Try Again
        </button>
      </div>
      <pre className="iemo-share-card" style={{
        border: `2px solid ${persona.aura}`,
        background: "#fff6e6",
        color: "#9C27B0",
        fontWeight: 600
      }}>{shareText}</pre>
    </div>
  );
}

export default App;
