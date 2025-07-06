import React, { useEffect, useState } from "react";

/**
 * QuoteBox fetches and displays a random motivational, sports, or funny quote from quotable.io.
 * It tries to fetch with a "sports|motivational|funny" tags filter. If the quote returned is not sports-oriented,
 * it falls back to fetching just "motivational|funny".
 * Designed to be highly visible on the Welcome and Result screens.
 */
// PUBLIC_INTERFACE
function QuoteBox({ prominent = false }) {
  const [quote, setQuote] = useState(null);
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [fallbackTried, setFallbackTried] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchQuote = (tags, tryFallback = false) => {
      setLoading(true);
      fetch(`https://api.quotable.io/random?tags=${tags}`)
        .then((resp) => resp.json())
        .then((data) => {
          if (!isMounted) return;
          // If we filtered for sports, motivational, or funny, but did NOT get a sports quote and haven't tried fallback
          if (!tryFallback && (!data.tags || !data.tags.some((tag) => ["sports", "motivational", "funny"].includes(tag)))) {
            // Try again, but only motivating/funny
            setFallbackTried(true);
            fetchQuote("motivational|funny", true);
            return;
          }
          setQuote(data.content || "Stay inspired and keep having fun!");
          setAuthor(data.author || "");
          setLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setQuote("Can't fetch quote. Stay positive & playful!");
          setAuthor("");
          setLoading(false);
        });
    };

    fetchQuote("sports|motivational|funny");
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="quote-box"
      style={{
        margin: prominent ? "2em auto 2.2em auto" : "1.1em auto 1.3em auto",
        maxWidth: prominent ? 630 : 470,
        background: "rgba(255,254,218,0.33)",
        borderLeft: "5px solid #ff4ecd",
        borderRadius: "1.2em",
        padding: prominent ? "1.55em 1.5em 1.2em 2.1em" : "0.98em 1.1em 0.7em 1.25em",
        boxShadow: "0 4px 32px #23ce6b19",
        fontStyle: "italic",
        fontWeight: 700,
        color: "#2e195c",
        fontSize: prominent ? "clamp(1.15em, 2.4vw, 1.44em)" : "clamp(1.07em, 2vw, 1.19em)",
        textAlign: "left",
        letterSpacing: "0.01em",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
      }}
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <span style={{color:"#6c63ff",fontWeight:900}}>Fetching inspiration...</span>
      ) : (
        <>
          <span>
            <span style={{color:"#FF6584",fontSize:"1.28em",marginRight:"0.25em"}}>“</span>
            {quote}
            <span style={{color:"#FF6584",fontSize:"1.28em",marginLeft:"0.25em"}}>”</span>
          </span>
          {author && (
            <span style={{
              display:"block",
              marginTop:".43em",
              color:"#6C63FF",
              fontWeight:800,
              fontSize: prominent ? "1.04em":"0.99em",
              letterSpacing: "0.017em"
            }}>– {author}</span>
          )}
        </>
      )}
    </div>
  );
}

export default QuoteBox;
