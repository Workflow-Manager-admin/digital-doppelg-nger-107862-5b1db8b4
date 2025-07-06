# Survey of Genuinely Free, Public Chatbot APIs for Sports Knowledge Q&A (2024)

## Summary

As of mid-2024, there are **no truly free, unlimited, public chatbot APIs** offering general conversational AI for sports knowledge Q&A (i.e., ChatGPT-style responses) that:
- Do **not** require a paid subscription or API key,
- Are **not** OpenAI or based on paid LLM providers,
- Provide reasonable accuracy/competence on sports questions.

### Direct Answer:
- **No viable general chatbot API exists that is fully public, unlimited, and free, capable of answering arbitrary sports questions at the level of ChatGPT, Claude, Gemini, etc.**
- Most "chatbot" APIs are either:
  - **Paid** (OpenAI, Google Gemini, Anthropic Claude, Cohere, etc.);
  - **Key-gated, free-tier limited** (e.g., Hugging Face Inference Endpoint with strict quotas);
  - **Purpose-limited** (only do trivia, jokes, or question-answer lookups, not true conversational AI).

---

## Most Accessible "Chatbot-Like" APIs

### 1. Trivia/Fact APIs (Not Real Chatbots)
- **Open Trivia DB, The Trivia API, Numbers API, JService:** *Not true chatbots*, just multiple-choice Q&A. [See existing trivia API summaries].
- **Use-case:** Serve individual questions from a sports category, but cannot conduct a real conversation, answer opinion questions, or explain rules.

### 2. Open Source Model Demo Endpoints
- **Hugging Face Inference API**: Offers endpoints for open-source LLMs.  
  - **BUT:** Free public endpoints are throttled and sometimes limited to "demo" usage (50-100 calls/day/IP, resets may happen, latent gating). Most sports knowledge coverage is weaker than commercial models.
  - **Example:** [https://huggingface.co/docs/api-inference/index](https://huggingface.co/docs/api-inference/index)
  - **How to Use:** Usually requires a (free) HF token, cannot be considered truly "public/unlimited".
- **OpenAssistant API demo:** Sometimes available as demo endpoints—no guarantees, rate-limited, not meant for integration.

### 3. Rule-Based/Simple Q&A Bots
- **Some universities/NGOs have static Q&A bots** with fixed sports facts/rules, not true conversational agents.
- **Not suitable** for dynamic chat or open Q&A.

---

## Why? (Industry Context)
- Any service offering free, public LLM chatbot access at scale is rapidly abused (spam/automation).
- Even "open" models like LLaMA, Mistral, etc., are generally not hosted as *open, unlimited* online APIs—only as limited demos or requiring keys.
- No government or sports organization provides a publicly-hosted, unlimited conversational AI for sports Q&A as of this writing.

---

## What are your best options? (as of 2024)

| Name                            | Type         | Free?   | API Key? | Unlimited? | Suitability      | Example                 |
|----------------------------------|--------------|---------|----------|------------|------------------|-------------------------|
| Open Trivia DB / The Trivia API  | Trivia Facts | Yes     | No       | Yes        | Only fixed Q&A   | See API docs            |
| Hugging Face Model Endpoints     | Demo Chatbot | Partly* | Yes      | No         | *Unstable/limited| hf.co/docs/api-inference|
| OpenAssistant demo               | Demo Chatbot | Yes     | No       | No         | Flaky/demos only | (if up)                 |

> \*Hugging Face only for low-traffic/demo use, requires signup for stable use.

---

## Sports FAQs/Knowledge: Chatbot Integration Suitability

- **If you require true conversational Q&A (i.e., chat with context, followup, explanations):**
  - You **must** host your own open-source LLM (e.g., OpenChat, Mistral, LLaMA derivatives) or pay for a service.
  - No "copy-paste" public endpoint is available.
- **If you just want to serve sports trivia facts, jokes, or rules:**  
  - Use existing trivia-style APIs (see `free_public_trivia_apis_summary.md`). Not a real chatbot.

---

## Sample API (for trivia/fact Q&A integration, **not chatbot**):

- **Open Trivia DB (Sports):**
  ```
  https://opentdb.com/api.php?amount=8&category=21&type=multiple
  ```
- **The Trivia API (Sport & Leisure):**
  ```
  https://the-trivia-api.com/api/questions?categories=sport_and_leisure&limit=8
  ```
- **Numbers API (Sports facts, via numbers):**
  ```
  http://numbersapi.com/random/trivia
  ```

---

## Recommendation

- There is **no truly free, public, unlimited conversational chatbot API** for sports Q&A suitable for direct web integration.
- **For real, conversational sports chatbots:**  
  - Deploy your own open-source model (requires server, compute—see OpenChat, Mistral, etc.).
  - Pay for a commercial API (OpenAI, Gemini, etc.).
- **For trivia/fact-only widgets:** Integrate the above trivia APIs.

---

## References
- [Open Trivia DB API](https://opentdb.com/api_config.php)
- [The Trivia API](https://the-trivia-api.com/)
- [Numbers API](http://numbersapi.com/)
- [Hugging Face API](https://huggingface.co/docs/api-inference/index)
- [OpenAssistant](https://open-assistant.io/)

*Compiled June 2024*
