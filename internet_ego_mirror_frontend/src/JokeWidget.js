import React, { useEffect, useState } from "react";

/**
 * JokeWidget fetches and displays a random sports or general joke
 * using the Official Joke API (https://official-joke-api.appspot.com/).
 * Prioritizes sports jokes, falls back to general if none available.
 * Displayed as a fun widget on the quiz result page.
 */
// PUBLIC_INTERFACE
function JokeWidget() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    // Try sports joke first, fallback to general/random
    const fetchJoke = async () => {
      setLoading(true);
      setErr("");
      setJoke(null);

      const endpoints = [
        "https://official-joke-api.appspot.com/jokes/sports/random",
        "https://official-joke-api.appspot.com/jokes/general/random",
        "https://official-joke-api.appspot.com/jokes/random"
      ];
      let found = false;
      for (let ep of endpoints) {
        try {
          const resp = await fetch(ep);
          if (!resp.ok) continue;
          const data = await resp.json();
          if (Array.isArray(data) && data[0]?.setup && data[0]?.punchline) {
            if (!isMounted) return;
            setJoke({ setup: data[0].setup, punchline: data[0].punchline });
            found = true;
            break;
          } else if (data?.setup && data?.punchline) {
            if (!isMounted) return;
            setJoke({ setup: data.setup, punchline: data.punchline });
            found = true;
            break;
          }
        } catch (_) {
          // Ignore and try next endpoint
        }
      }
      if (!found && isMounted) {
        setErr("Couldn't fetch a joke. Refresh for more laughs!");
      }
      setLoading(false);
    };

    fetchJoke();
    return () => { isMounted = false; };
  }, []);

  return (
    <div
      className="joke-widget-float-fix"
      style={{
        margin: "2.7em auto 1.18em auto",
        background: "linear-gradient(92deg, #ffeaff 65%, #def8e1 110%)",
        borderLeft: "6px solid #FF6584",
        borderRadius: "1.39em",
        maxWidth: 540,
        boxShadow: "0 2px 18px #ff658421",
        fontWeight: 900,
        color: "#251c30",
        padding: "1.17em 1.65em 1em 2.2em",
        fontSize: "clamp(1.07em, 2vw, 1.26em)",
        textAlign: "left",
        position: "relative",
        letterSpacing: "0.009em",
        transition: "background 0.14s",
        minHeight: "3.6em",
        pointerEvents: "none"
      }}
      aria-live="polite"
    >
      <div
        style={{
          position: "absolute",
          top: "-1.57em",
          left: "-0.91em",
          zIndex: 10,
          fontWeight: 950,
          fontSize: "clamp(1.19em,2vw,1.41em)",
          color: "#fff",
          background: "linear-gradient(90deg,#FF6584,#23ce6b,#fed502 96%)",
          borderRadius: "1.09em",
          boxShadow: "0 2px 25px #ff658483, 0 1px 8px #23ce6baa",
          padding: "0.34em 1.17em 0.39em 1.21em",
          textShadow: "0 7px 19px #23ce6baa, 0 0px 13px #ff4ecd, 0 0px 19px #6c63ff77",
          letterSpacing: "0.02em"
        }}
      >
        <span role="img" aria-label="joke laugh">😂</span> Joke Break
      </div>
      {loading ? (
        <span style={{ color: "#FF6584", fontWeight: 900 }}>
          Loading a joke for you...
        </span>
      ) : err ? (
        <span style={{ color: "#ff4ecd" }}>{err}</span>
      ) : joke ? (
        <div>
          <span style={{
            fontWeight: 900,
            color: "#6C63FF",
            fontSize: "1.07em",
            marginBottom: ".37em",
            display: "block",
          }}>
            {joke.setup}
          </span>
          <span style={{
            color: "#23ce6b",
            fontWeight: 900,
            fontSize: "1.06em",
            display: "block",
            marginTop: ".58em",
            letterSpacing: "0.01em"
          }}>
            {joke.punchline}
          </span>
        </div>
      ) : null}
      <div style={{
        marginTop: "1.01em",
        fontSize: "0.99em",
        color: "#FF6584",
        fontWeight: 700,
        opacity: 0.68,
        letterSpacing: "0.009em"
      }}>
        <span role="img" aria-label="info sparkle">🎈</span> Powered by <a href="https://official-joke-api.appspot.com/" target="_blank" rel="noopener noreferrer"
          style={{ color: "#FF6584", fontWeight: 800 }}>Official Joke API</a>
      </div>
    </div>
  );
}

export default JokeWidget;
