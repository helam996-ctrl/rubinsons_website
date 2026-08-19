# CHATBOT ARCHITECTURE & AI ASSISTANT

## Architectural Overview
The Rubinsons Assistant is a site-embedded conversational widget. It acts as an interactive concierge, answering corporate questions, directing visitors to relevant pages, and guiding prospective investors. It relies on Retrieval-Augmented Generation (RAG) using the database as the single source of truth.

---

## 1. Request Processing Lifecycle
Every message sent to the assistant is processed server-side through these stages:

```text
                  User types message
                          │
                  Normalize text
           (lowercase, strip punctuation)
                          │
                  Intent Detection
       (Check database keywords & semantic match)
                          │
                 Retrieve Context
           (Query PostgreSQL for business,
             stories, or site settings)
                          │
                   Context Builder
         (Compile prompt template + DB info)
                          │
               Call LLM (Server-side API)
                          │
             Safety & Accuracy Validation
         (Verify no disallowed words or claims)
                          │
             Deliver Response with UI CTA
```

---

## 2. Dynamic Intent Detection System
The chatbot is controlled via admin settings. The server maps user intent by comparing the normalized message content with database records of the `ChatbotIntent` model:

### Verified Dynamic Intents
* **INVESTOR**: Triggered by keywords: `invest`, `funding`, `capital`, `shares`. Action: Retrieves investor overview, offers links to `/investors`, and prompts for the investor enquiry flow.
* **BUSINESS / SECTOR**: Matches sectors (e.g. `construction`, `builders`, `hospitality`, `dine`, `academia`, `medicine`, `media`). Action: Queries the matched `Business` record details and links directly to its detail page.
* **LEADERSHIP**: Keywords: `director`, `governance`, `management`, `board`. Action: Returns verified board names and redirects users to leadership sections.
* **IMPACT**: Keywords: `foundation`, `charity`, `social`, `rudra vahini`. Action: Describes Rudra Vahini Foundation's activities.
* **CONTACT / CAREERS**: Keywords: `job`, `apply`, `email`, `phone`, `office`. Action: Displays contact options or triggers inquiry flow.

---

## 3. Context Construction Prompt Template
The system prompt generated for the LLM must be tightly structured:
```text
System: You are the Rubinsons Assistant, the verified AI helper for the Rubinsons Group.
Rules:
- Speak in a professional, polite, and restrained corporate voice.
- Base your answers ONLY on the VERIFIED CONTEXT provided below.
- Do NOT use external pre-training knowledge to describe Rubinsons' statistics, projects, or financials.
- If the CONTEXT does not contain the answer to a question, politely say:
  "I don't have that verified detail in our records. Would you like me to connect you with our corporate office via an inquiry?"
  and display the inquiry form CTA.
- NEVER invent valuation, revenues, projects, employees, or awards.

VERIFIED CONTEXT:
[Database Content goes here]

CONVERSATION HISTORY:
[Last 4 messages go here]

User: [User Message]
Assistant:
```

---

## 4. Safety & Accuracy Verification
Before delivering the output:
1. **Financial Filter**: Screen the output string for terms like "percent return", "guarantee profit", "investment yield", or specific dollar/rupee amounts that are not explicitly present in the verified context.
2. **Private Document Filter**: Check if the session is authenticated. If the output attempts to link to a file key flagged as `isPrivate: true` for an anonymous user, strip the link and replace it with a prompt to log in to the Investor Portal.
3. **Transition to Inquiry**: If the fallback condition is met twice (i.e. user asks two questions where info is unavailable), inject an inline widget trigger: `[SHOW_INQUIRY_FORM]`.
