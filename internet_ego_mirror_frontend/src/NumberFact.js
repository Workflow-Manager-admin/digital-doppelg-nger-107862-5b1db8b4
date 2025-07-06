import React, { useEffect, useState } from "react";

/**
 * NumberFact component fetches and displays a trivia fact for a specific number using the Numbers API.
 * Shown on the quiz result page for the user's score or question count.
 * @param {number} number - The number (score or total questions) to get a fact for.
 * @param {boolean} [forScore=true] - If true, fact is for the score. If false, fact is for total questions.
 * @example
 *   <NumberFact number={8} forScore={true} />
 */
// PUBLIC_INTERFACE
function NumberFact({ number, forScore = true }) {
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!number && number !== 0) return;
    setLoading(true);
    setErr("");
    setFact("");
    // Numbers API endpoint (no key needed)
    const factUrl = `http://numbersapi.com/${number}/trivia`;
    fetch(factUrl)
      .then(resp => {
        if (!resp.ok) throw new Error("Fact not found");
        return resp.text();
      })
      .then(text => {
        setFact(text);
        setLoading(false);
      })
      .catch(() => {
        setErr("Couldn't load number fact. Try again later!");
        setLoading(false);
      });
  }, [number]);

  return (
    <div
      className="number-fact-float-fix"
      style={{
        margin: "2.3em auto 1.08em auto",
        background: "rgba(255, 234, 255, 0.22)",
        borderLeft: "6px solid #6C63FF",
        borderRadius: "1.25em",
        maxWidth: 600,
        boxShadow: "0 2px 18px #6C63FF23",
        fontWeight: 850,
        color: "#2e195c",
        padding: "1.15em 1.5em 1em 2em",
        fontSize: "clamp(1.01em, 2vw, 1.22em)",
        textAlign: "left",
        letterSpacing: "0.01em",
        pointerEvents: "none"
      }}
      aria-live="polite"
    >
      {loading ? (
        <span style={{ color: "#6c63ff", fontWeight: 900 }}>
          Fetching a fun number fact...
        </span>
      ) : err ? (
        <span style={{ color: "#ff4ecd" }}>{err}</span>
      ) : (
        <>
          <span style={{ color: "#6C63FF", fontWeight: 800, marginRight: ".25em" }}>
            {forScore ? "Your Score Fact:" : "Quiz Number Fact:"}
          </span>
          <span style={{ color: "#251c30", fontWeight: 800 }}>{fact}</span>
        </>
      )}
    </div>
  );
}

export default NumberFact;
