import React, { useEffect, useState } from "react";

/**
 * WordOfTheMatch displays a "sports" term (or random word if needed) with its definition and part of speech
 * using the free https://dictionaryapi.dev/ API. Shown after the quiz result/number fact area.
 * The word is styled in a prominent, playful way.
 */
// PUBLIC_INTERFACE
function WordOfTheMatch({ sportsWordList = null }) {
  const fallbackWords = [
    "goal", "cricket", "stamina", "referee", "strategy", "bat", "ace", "pitch", "dunk", "penalty",
    "sprint", "match", "serve", "rally", "medal", "trophy", "league", "score", "umpire", "field",
    "racket", "cheer", "shot", "block", "foe", "foul", "champion", "fitness", "streak", "coach",
    "pace", "assist", "vault", "kick", "sweat", "rival", "title", "break", "court", "fans", "net",
    "team", "win", "draw", "stadium", "dribble", "squad", "finale", "marathon"
  ];
  // Sports words are prioritized; otherwise, random from fallbackWords.
  const pool = sportsWordList && Array.isArray(sportsWordList) && sportsWordList.length > 0
    ? sportsWordList
    : fallbackWords;

  const [word, setWord] = useState("");
  const [defn, setDefn] = useState("");
  const [pos, setPOS] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Pick a random word from pool
  useEffect(() => {
    const w = pool[Math.floor(Math.random() * pool.length)];
    setWord(w);
    setDefn("");
    setPOS("");
    setError("");
    setLoading(true);

    // Fetch definition from Dictionary API
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`)
      .then(resp => resp.json())
      .then(json => {
        if (Array.isArray(json) && json.length > 0) {
          const first = json[0];
          let foundDef = "";
          let foundPOS = "";
          if (
            first.meanings &&
            Array.isArray(first.meanings) &&
            first.meanings.length > 0
          ) {
            foundPOS = first.meanings[0].partOfSpeech;
            foundDef =
              first.meanings[0].definitions &&
              first.meanings[0].definitions.length > 0 &&
              first.meanings[0].definitions[0].definition
                ? first.meanings[0].definitions[0].definition
                : "";
          }
          setDefn(foundDef || "(No definition found)");
          setPOS(foundPOS || "");
        } else {
          setDefn("");
          setError("Couldn't fetch definition. Try again!");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't fetch definition. Try again!");
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  return (
    <div
      style={{
        margin: "2.6em auto 1.1em auto",
        padding: "1.67em 1.2em 0.91em 2em",
        background: "linear-gradient(90deg,#fffde4 55%,#ffabe6 104%,#d3f4fe 100%)",
        border: "4.5px solid #23ce6b",
        borderRadius: "1.9em",
        boxShadow: "0 6px 34px #23ce6b29, 0 2px 18px #ff4ecd33",
        maxWidth: "550px",
        color: "#2e195c",
        fontWeight: 900,
        fontSize: "clamp(1.21em,2vw,1.34em)",
        textAlign: "left",
        position: "relative"
      }}
      aria-live="polite"
    >
      <div style={{
        position: "absolute",
        top: "-1.85em",
        left: "-1.2em",
        zIndex: 10,
        fontWeight: 950,
        fontSize: "clamp(1.29em,2.6vw,1.8em)",
        color: "#fff",
        background: "linear-gradient(90deg,#ff4ecd,#23ce6b,#fed502 90%)",
        borderRadius: "1.45em",
        boxShadow: "0 2px 29px #ff4ecd66, 0 1px 12px #23ce6baa",
        padding: "0.44em 1.45em 0.44em 1.62em",
        textShadow: "0 7px 19px #23ce6baa, 0 0px 14px #ff4ecd, 0 0px 24px #6c63ff77",
        letterSpacing: "0.03em"
      }}>
        <span role="img" aria-label="star fun">✨</span> Word of the Match
      </div>
      {loading ? (
        <span style={{ color: "#23ce6b", fontWeight: 900 }}>Loading word...</span>
      ) : error ? (
        <span style={{ color: "#ff4ecd" }}>{error}</span>
      ) : (
        <div style={{marginTop:".55em"}}>
          <span style={{
            display: "inline-block",
            fontWeight: 980,
            fontSize: "clamp(1.34em,2.9vw,1.8em)",
            color: "#23ce6b",
            background: "linear-gradient(90deg,#23ce6b,#ff4ecd 70%,#fed502 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.02em",
            borderRadius: "12px",
            padding: "0.06em 0.5em",
            marginRight: "0.12em"
          }}>
            {word}
          </span>
          {pos && <span style={{
            fontWeight: 900, fontSize: "0.86em", color: "#ff4ecd", marginLeft: "0.28em"
          }}>{pos}</span>}
          <div style={{marginTop:".65em", fontWeight:700, color:"#251c30",fontSize:"1.04em"}}>
            {defn}
          </div>
        </div>
      )}
      <div style={{
        marginTop: "1.1em", fontSize: "0.99em", color: "#6C63FF", fontWeight: 700, opacity: 0.72,
        letterSpacing: "0.02em"
      }}>
        <span role="img" aria-label="info sparkle">🌈</span> Powered by <a href="https://dictionaryapi.dev/" target="_blank" rel="noopener noreferrer"
        style={{color:"#23ce6b",fontWeight:800}}>dictionaryapi.dev</a>
      </div>
    </div>
  );
}

export default WordOfTheMatch;
