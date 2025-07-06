# Survey of Free/Public Trivia APIs with Themed Categories

This document summarizes support for non-general knowledge/quirky/specialized quiz categories (e.g., TV shows, music, pop culture, sports, regional, etc.) in the most popular free/public trivia APIs. It also notes if an API key is required and how to obtain one.

---

## 1. Open Trivia DB ([opentdb.com](https://opentdb.com/api_config.php))

- **API Key Required?**  
  NO. Entirely free/public, unlimited use.
- **Category Theming (as of 2024):**
  - Broad categories: General, Entertainment, Science, Sports, etc.
  - Special/quirky: Some, e.g. "Entertainment: Music", "Entertainment: Film", "Entertainment: Video Games", "Entertainment: Board Games", "Entertainment: Television".
  - _No show-specific_ (e.g., "Friends", "Simpsons") and limited regional/language (English only).
  - **Pop Culture:** Limited (only via broad "Entertainment").
  - **Music:** "Entertainment: Music", but mostly Western/global music.
  - **TV/Show-Specific:** Only to the extent of "Entertainment: Television".
  - **Movies:** "Entertainment: Film".
  - **Sports:** "Sports".
- **Integration Ease:**  
  Direct HTTP API, no auth—suitable for browser apps.
- **Example:**
  - Category IDs are used (see [API Docs](https://opentdb.com/api_config.php)).

---

## 2. The Trivia API ([the-trivia-api.com](https://the-trivia-api.com/))

- **API Key Required?**  
  NO. Free for public, but with fair-use/no commercial clause. Higher quotas require contact.
- **Category Theming:**
  - Categories: General Knowledge, Film & TV, Music, Food & Drink, History, Science, Society & Culture, Sport & Leisure, Geography, Arts & Literature.
  - **Specialized:** "Film & TV" covers movies and some TV, but _not show-specific_.
  - **Music:** "Music" covers pop/rock/general music, not regional or specific artists.
  - **Pop Culture:** Under "Society & Culture" and "Music"/"Film & TV", but not highly granular.
  - **Sports:** Yes—"Sport & Leisure".
  - **Regional/Language:** English only.
- **Integration Ease:**  
  Simple REST API, used in frontends.

---

## 3. QuizAPI.io ([quizapi.io](https://quizapi.io/))

- **API Key Required?**  
  YES. Free signup provides limited quota; higher quotas available with paid plans.
  - To get a key: Sign up at https://quizapi.io/ and get immediate key/email.
- **Category Theming:**
  - Focused on tech/coding/dev topics—NOT pop culture, TV, movies, or music.
  - Categories: Linux, DevOps, Docker, MySQL, Security, CMS, WordPress, etc.
  - **Very little for TV/music/pop culture/entertainment.**
- **Integration Ease:**  
  REST API, key via header.

---

## 4. Other Niche APIs

- **jService (www.jservice.io):**  
  Large Jeopardy! question database; has some quirky topics/categories (US-centric). No API key.

- **TriviaAPI (triviaapi.com):**
  Previously offered category options, but as of 2024, not very stable or rich in themed content.

---

## **Table: API Feature Comparison**

| API Name         | API Key Required  | TV/Movie/Show | Music      | Pop Culture | Sports      | Regional/Lang |
|------------------|------------------|---------------|------------|-------------|-------------|---------------|
| Open Trivia DB   | ❌               | TV, Movie (broad) | Some      | Minimal     | Yes         | English only  |
| The Trivia API   | ❌               | TV, Movie (broad)| Some      | Some        | Yes         | English only  |
| QuizAPI.io       | ✅ (free)        | No            | No         | No          | No          | English only  |
| jService         | ❌               | Jeopardy Topics (sometimes show-/theme-specific, US bias) | Minimal | Some | Yes | English only  |

---

## **Summary & Suggestions**

- For broad entertainment (music, movies, TV, sports, some pop culture):  
  Use **Open Trivia DB** or **The Trivia API**. Both are free, no API key, REST access, but **no highly granular show/artist-specific quizzes**.
- For tech/programming/dev:  
  Use **QuizAPI.io** (requires a free API key).
- For _quirky categories or rare TV/music trivia_:  
  Check **jService**, but database is old and US-centric.
- **Show-specific or regional/language quizzes are not well-supported by free public APIs as of 2024.**  
  - If you want, for example, Tamil music or "Friends" TV trivia, you'll likely need to scrape, curate, or pay for/licensed datasets.

---

## **How to Get API Keys (if required):**

- **QuizAPI.io**:
  1. Visit [quizapi.io](https://quizapi.io/)
  2. Register/free account with email.
  3. Dashboard will show API key.
  4. Include API key in HTTP headers per docs.

All others can be used without an API key.

---

## **Integration Notes**

- All listed APIs provide HTTP endpoints easily called from frontend code (fetch/XHR), except for QuizAPI.io which requires an API key in the request header.

---

**References:**  
- [Open Trivia DB documentation](https://opentdb.com/api_config.php)  
- [The Trivia API Docs](https://the-trivia-api.com/)  
- [QuizAPI.io Docs](https://quizapi.io/docs/1.0/overview)  
- [jService API](https://jservice.io/)  

