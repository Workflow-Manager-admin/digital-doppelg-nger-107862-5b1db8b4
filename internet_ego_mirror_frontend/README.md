# Internet Ego Mirror – React Quiz App

A vibrant, playful, and modern single-page React personality quiz that reveals your unique internet alter ego. Each time you play, fresh trivia questions are fetched live from a public trivia API!

## Features

- **Dynamic Quiz:** 8 brand new questions every session via [Open Trivia DB](https://opentdb.com/api_config.php)
- **No API key required:** The API is fully public & free—no signup, no config, just click and play.
- **Vibrant, animated interface:** Super-colorful, modern, and playful (see [`src/App.css`](src/App.css))
- **Fun Personas:** Persona name, description, résumé, aura color badge, social suggestion, emoji
- **Shareable Result Card:** Copy result to clipboard, easy sharing
- **No extra dependencies:** Pure React and CSS

## Color Palette & Theme

- 🌈 **Accent colors blast!**
- **Primary:** #6C63FF
- **Secondary:** #FF6584
- **Highlight:** #ff4ecd, #23CE6B, #FED502, #36c6e7, #ffbf00, and many more—see CSS gradients and answer cards!

## Screens

- **Welcome:** Title with rainbow gradient, quick instructions, prominent cheery Start button
- **Quiz:** One question per screen, wild color answer cards, animated progress, always randomized
- **Result:** Large badge, name, résumé, aura, playful sharable card, restart options, bold gradients

## Fetching Questions from the API

- **Powered by [Open Trivia DB](https://opentdb.com/api_config.php):** Each click of "Start" loads a brand new set of 8 random internet trivia questions!
- **No API key needed:** Just play and enjoy infinite variety.
- **Want to use your own trivia API?** See code in `src/App.js`—replace the API endpoint and parsing logic.

## Usage

- `npm start` – Launch development server ([http://localhost:3000](http://localhost:3000))
- `npm run build` – Build for production
- `npm test` – Run test runner (minimal for this template)

## Customizing

- To change how persona results are calculated or appear, see logic in `src/App.js`.
- To re-theme or go even more wild with effects, edit [`src/App.css`](src/App.css).

## FAQ

**Q: Do I need an API key for the trivia questions?**  
A: _No!_ This app uses Open Trivia DB, which is totally public and free for everyone. No key required.  
You can read how it works and add extra parameters here:  
https://opentdb.com/api_config.php

**Q: How do I make the questions even more random/difficult?**  
A: We randomize difficulty and category with each session automatically.

## License

MIT

