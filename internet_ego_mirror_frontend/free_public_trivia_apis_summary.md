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
  - **TV/Show-Specific Note:** Sometimes there are show-specific (e.g., "Friends") clues in their database, but there is no official "Friends" category and no guarantee of regular coverage. You would have to search/filter question text for "Friends" or specific characters.

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
- For _show-specific_ like "Friends":  
  Free public APIs do **not** provide a dedicated "Friends" TV show category. However, you may sometimes get "Friends"-related questions via the "Entertainment: Television" (Open Trivia DB), "Film & TV" (The Trivia API), or by searching textual clues in **jService**.
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

# ⚡️ "Friends" TV Show Trivia API Support

**There are currently _no free public trivia APIs_ that offer a dedicated category or assured, regular supply of "Friends" TV show multiple-choice questions.**

- **Open Trivia DB:** No "Friends" category. You _might_ occasionally receive a Friends-related question when pulling from "Entertainment: Television", but it's rare, not guaranteed, and not filterable by show.
- **The Trivia API:** No show-specific or "Friends" category. "Film & TV" may include general TV trivia, but not guaranteed for "Friends".
- **QuizAPI.io:** No entertainment/TV categories; focused on tech topics only (requires API key anyway).
- **jService:** Sometimes has "Friends" clues in its Jeopardy! questions, but not a dedicated category. You must search the question field for "Friends", and coverage is neither plentiful nor consistent.

**API Key Summary:**
- All relevant, entertainment-focused APIs (Open Trivia DB, The Trivia API, jService) do _not_ require API keys, and no sign-up is needed.
- QuizAPI.io requires a key, but is not relevant for "Friends" trivia.

**User Procedure for API key:**
- If using QuizAPI.io (not applicable for "Friends" TV trivia anyway), sign up with email and get key from dashboard.
- For all others: You can fetch trivia immediately without any key or signup.

---

## **Summary for "Friends" Show Multiple-Choice Trivia Integration**

- _No_ free/public API currently provides a dedicated, filterable source of "Friends" TV show multi-choice questions.
- Your best practical approach is to use "Entertainment: Television" category from [Open Trivia DB](https://opentdb.com/api_config.php) or "Film & TV" from [The Trivia API](https://the-trivia-api.com/) and accept some questions may reference "Friends" incidentally.
- If you want _guaranteed Friends-specific_ coverage, you will need to curate/scrape your own dataset or look for paid/licensed databases.

---

**References:**  
- [Open Trivia DB documentation](https://opentdb.com/api_config.php)  
- [The Trivia API Docs](https://the-trivia-api.com/)  
- [QuizAPI.io Docs](https://quizapi.io/docs/1.0/overview)  
- [jService API](https://jservice.io/)  
