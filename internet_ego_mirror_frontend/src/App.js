import React, { useState } from "react";
import "./App.css";

// Themed color constants
const COLORS = {
  accent: "#23CE6B",
  primary: "#6C63FF",
  secondary: "#FF6584",
};

// --- QUIZ DATA (8 quirky internet-themed questions) ---
const QUESTIONS = [
  {
    question: "What's your go-to reaction when a meme goes viral?",
    answers: [
      { text: "Make your own remix!", type: "Trendsetter" },
      { text: "Share it until it’s old news", type: "Amplifier" },
      { text: "Comment ‘seen it’ first", type: "Purist" },
      { text: "Quietly enjoy and move on", type: "Lurker" },
    ],
  },
  {
    question: "Your profile bio most likely includes:",
    answers: [
      { text: "Just emojis. Lots of them. 🔥🦄💫", type: "Amplifier" },
      { text: "\"Professional cat meme curator.\"", type: "Trendsetter" },
      { text: "A cryptic inside joke", type: "Purist" },
      { text: "Nothing. Why bother?", type: "Lurker" },
    ],
  },
  {
    question: "First thing you check online in the morning?",
    answers: [
      { text: "Social notifications", type: "Amplifier" },
      { text: "Trending hashtags", type: "Trendsetter" },
      { text: "Your old bookmarks", type: "Purist" },
      { text: "Lurk in comment sections", type: "Lurker" },
    ],
  },
  {
    question: "Someone starts internet drama in your feed. You:",
    answers: [
      { text: "Post a peacekeeping meme", type: "Trendsetter" },
      { text: "Drop a subtle GIF and watch", type: "Lurker" },
      { text: "Add popcorn emoji and buckle up", type: "Amplifier" },
      { text: "Correct their grammar", type: "Purist" },
    ],
  },
  {
    question: "Pick your virtual pet:",
    answers: [
      { text: "The rare Shiba Inu NFT", type: "Trendsetter" },
      { text: "Classic Nyan Cat", type: "Amplifier" },
      { text: "A mysterious ASCII frog", type: "Purist" },
      { text: "None, imaginary is fine", type: "Lurker" },
    ],
  },
  {
    question: "Old internet relic you secretly miss?",
    answers: [
      { text: "MSN Messenger vibes", type: "Purist" },
      { text: "Rage comics everywhere", type: "Amplifier" },
      { text: "Tumblr dash drama", type: "Lurker" },
      { text: "Vine, bring it back!", type: "Trendsetter" },
    ],
  },
  {
    question: "What’s your reply when someone’s wrong online?",
    answers: [
      { text: "Let it pass, not worth it", type: "Lurker" },
      { text: "Send a meme as correction", type: "Amplifier" },
      { text: "Give a sarcastic fact", type: "Purist" },
      { text: "Quote-tweet with flair", type: "Trendsetter" },
    ],
  },
  {
    question: "Your dream social platform would be:",
    answers: [
      { text: "Exclusive, invite-only, mysterious", type: "Purist" },
      { text: "Full of viral energy", type: "Amplifier" },
      { text: "Creative chaos and trends", type: "Trendsetter" },
      { text: "Just reading, no posting", type: "Lurker" },
    ],
  },
];

// --- PERSONA RESULT DATA ---
const PERSONAS = {
  Trendsetter: {
    name: "The Viral Visionary",
    description: "You’re always one step ahead! The internet tries to catch up with trends you set in motion. Hashtag wizard and originator of the next big meme.",
    resume: "Aspiring Meme CEO • Trend Launch Specialist",
    aura: COLORS.primary,
    social: "Launch your threads on X or TikTok—your ideas go viral!",
    emoji: "🚀",
  },
  Amplifier: {
    name: "The Meme Megaphone",
    description: "You give every post its fifteen minutes of fame—sharing, liking, and hyping up everything that’s buzzing. A true digital cheerleader.",
    resume: "Retweet Virtuoso • Certified Meme Dealer",
    aura: COLORS.secondary,
    social: "You were born to run a viral Instagram page!",
    emoji: "📣",
  },
  Purist: {
    name: "The Retro Netizen",
    description: "You love the relics, inside jokes, and secret codes of earlier web days. Old-school, cryptic, and always authentic.",
    resume: "Vintage Web Archaeologist • Lore Keeper",
    aura: "#888888",
    social: "Hang out on obscure forums or vintage Discord bots!",
    emoji: "💾",
  },
  Lurker: {
    name: "The Shadow Browser",
    description: "Never posting, always present. You know the deep cuts but prefer to watch the world meme itself into madness. The quiet observer.",
    resume: "Comment Section Ghost • Drama Detective",
    aura: COLORS.accent,
    social: "Lurk on Reddit and Hacker News—pro only!",
    emoji: "👀",
  },
};

// --- COMPONENTS ---

// PUBLIC_INTERFACE
function App() {
  const [step, setStep] = useState(0); // step 0: Welcome. 1...N: questions. step > N: results
  const [answers, setAnswers] = useState([]);
  // for share card animation
  const [copied, setCopied] = useState(false);

  // PUBLIC_INTERFACE
  function handleStart() {
    setStep(1);
  }

  // PUBLIC_INTERFACE
  function handleAnswer(answerIdx) {
    setAnswers((prev) => [...prev, answerIdx]);
    setStep((s) => s + 1);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setStep(0);
    setAnswers([]);
    setCopied(false);
  }

  // Calculate result: tally most frequent type among chosen answers
  function getResultKey() {
    if (answers.length !== QUESTIONS.length) return null;
    const resultTally = {};
    answers.forEach((ansIdx, i) => {
      const type = QUESTIONS[i].answers[ansIdx].type;
      resultTally[type] = (resultTally[type] || 0) + 1;
    });
    // find max frequency
    return Object.entries(resultTally).reduce((maxKey, cur) =>
      !maxKey || cur[1] > resultTally[maxKey] ? cur[0] : maxKey,
    null);
  }

  const resultKey = answers.length === QUESTIONS.length ? getResultKey() : null;
  const persona = resultKey ? PERSONAS[resultKey] : null;

  // Shareable card text generation
  function getShareText() {
    if (!persona) return "";
    return `🌐 My Internet Ego: ${persona.name}! 🌈\n\n${persona.description}\n\nFake Résumé: ${persona.resume}\nAura Color: ${persona.aura}\nSocial suggestion: ${persona.social}\n\nWhat’s your internet alter ego? ➡️ Try the Internet Ego Mirror!`;
  }

  // Handle share: copy result to clipboard
  function handleShare() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1700);
  }

  // --- Theming for modern, playful, minimal style
  React.useEffect(() => {
    // Minimal accent for the quiz app
    document.body.style.background =
      step === 0
        ? "var(--bg-primary)"
        : step > QUESTIONS.length
        ? "#fcfdff"
        : "#fcfdff";
    document.body.style.transition = "background .3s";
  }, [step]);

  // MAIN FLOW
  return (
    <div className="iemo-app">
      <div className="iemo-card">
        {step === 0 && <WelcomeScreen onStart={handleStart} />}
        {step > 0 && step <= QUESTIONS.length && (
          <QuestionScreen
            questionIdx={step - 1}
            total={QUESTIONS.length}
            onAnswer={handleAnswer}
            selected={answers[step - 1]}
          />
        )}
        {step > QUESTIONS.length && persona && (
          <ResultScreen
            persona={persona}
            shareText={getShareText()}
            copied={copied}
            onRestart={handleRestart}
            onShare={handleShare}
          />
        )}
      </div>
      <div className="iemo-footer">
        <span className="iemo-footer-brand">
          <span style={{ color: COLORS.primary }}>Internet</span>{" "}
          <span style={{ color: COLORS.accent }}>Ego</span>{" "}
          <span style={{ color: COLORS.secondary }}>Mirror</span>
        </span>
        <span className="iemo-footer-mini">| © 2024</span>
      </div>
    </div>
  );
}

// --- WELCOME SCREEN ---
function WelcomeScreen({ onStart }) {
  return (
    <>
      <h1 className="iemo-title">
        <span role="img" aria-label="mirror">
          🪞
        </span>{" "}
        Internet Ego Mirror
      </h1>
      <p className="iemo-desc">
        Discover your digital alter ego through 8 playful, quirky internet questions! Find out who you *really* are online, then share your persona.
      </p>
      <button className="iemo-btn iemo-btn-accent" onClick={onStart}>
        Start Quiz
      </button>
    </>
  );
}

// --- QUESTION SCREEN ---
function QuestionScreen({ questionIdx, total, onAnswer, selected }) {
  const q = QUESTIONS[questionIdx];
  return (
    <>
      <div className="iemo-steps">
        Question {questionIdx + 1} of {total}
      </div>
      <h2 className="iemo-q">{q.question}</h2>
      <div className="iemo-answers">
        {q.answers.map((a, idx) => (
          <button
            key={a.text}
            className={`iemo-answer-card ${selected === idx ? "selected" : ""}`}
            onClick={() => onAnswer(idx)}
            tabIndex="0"
            aria-pressed={selected === idx}
            aria-label={a.text}
            disabled={selected === idx}
          >
            {a.text}
          </button>
        ))}
      </div>
    </>
  );
}

// --- RESULTS SCREEN ---
function ResultScreen({ persona, shareText, copied, onRestart, onShare }) {
  return (
    <div className="iemo-result">
      <div
        className="iemo-badge"
        style={{
          background: persona.aura,
          borderColor: persona.aura,
          color: "#fff",
        }}
      >
        {persona.emoji}
      </div>
      <h2 className="iemo-persona-name">{persona.name}</h2>
      <div className="iemo-res-section">
        <div className="iemo-persona-title">{persona.resume}</div>
      </div>
      <div className="iemo-res-section">
        <span className="iemo-persona-desc">{persona.description}</span>
      </div>
      <div className="iemo-res-section">
        <strong className="iemo-label">Aura Color</strong>
        <span
          className="iemo-color-sample"
          style={{
            background: persona.aura,
            borderColor: persona.aura,
          }}
        ></span>
      </div>
      <div className="iemo-res-section">
        <strong className="iemo-label">Social Media Suggestion:</strong>
        <span className="iemo-social">{persona.social}</span>
      </div>
      <div className="iemo-share-section">
        <button className="iemo-btn iemo-btn-share" onClick={onShare}>
          {copied ? "Copied!" : "Copy your persona card"}
        </button>
        <button className="iemo-btn iemo-btn-restart" onClick={onRestart}>
          Try Again
        </button>
      </div>
      <pre className="iemo-share-card">{shareText}</pre>
    </div>
  );
}

export default App;
