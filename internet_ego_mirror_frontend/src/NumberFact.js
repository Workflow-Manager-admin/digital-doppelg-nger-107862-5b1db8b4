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
        // If fetching fails, provide a playful, static fallback fact
        // (no error message shown!)
        let staticFallbacks = [
          // General playful sports/internet line
          "In cricket, a score of zero is called a duck. Better luck on your next number!",
          "In basketball, the number 23 is iconic thanks to Michael Jordan.",
          "A perfect 10 is the best score in gymnastics—how close did you get?",
          "The number 8 is lucky in some cultures and worn by many top footballers!",
          "Four goals by a player in a football match? That’s called a super hat-trick.",
          "Cricket fans know: 99 is the score everyone fears missing by one!",
          "In soccer, 0 is a clean sheet for goalkeepers—defense wins games!",
          "Did you know? The marathon distance is precisely 42.195 kilometers.",
          "Five rings on the Olympic flag: one for each inhabited continent.",
          "It's said that Wayne Gretzky scored his 50th goal in just 39 games—hockey history!",
          "The number 7 shirt is revered by many in football (soccer) legends.",
          "An over in cricket has 6 balls. Every ball can change the match!",
          "A hat-trick means scoring 3 goals in a match—legendary!",
          "Numeral trivia: Zero wasn’t used in Europe until the Middle Ages!",
          // Playful catch-all
          "Fun fact: Some numbers are so cool, they have their own sports legends!"
        ];
        // Pick a quasi-random fallback (based on the number, so it's stable per input)
        let pick = number;
        // Normalize to a valid index
        if (typeof pick !== "number" || isNaN(pick) || pick < 0) pick = 0;
        let fallbackText = staticFallbacks[pick % staticFallbacks.length];
        setFact(fallbackText);
        setErr(""); // Hide error msg
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
