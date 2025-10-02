1. Data Layer

MongoDB → store paper metadata + processed summaries.

{
  "title": "...",
  "authors": ["..."],
  "arxiv_url": "...",
  "summary": "...",
  "why_it_matters": "...",
  "applications": "...",
  "createdAt": "2025-10-01"
}

2. Scraper + Processor (Python)

Use arXiv API (arxiv Python lib).

Process new papers daily (e.g., cron job).

Send abstract → LangGraph flow with LLM summarizer nodes:

Step 1: Summarize in plain English (3 lines).

Step 2: Generate "Why it matters".

Step 3: Suggest "Applications".

Insert into MongoDB.

3. API Layer (Node + Express)

Provides REST endpoints for frontend:

GET /feed → latest papers (paginated).

POST /like/:paperId → record user interest (for personalization later).

GET /trending → most liked/shared papers.

4. Frontend (React + UI Framework)

Choose UI framework that’s popular & easy for feed apps:

Chakra UI → simple, modern, lightweight.

Mantine → great components, infinite scroll support.

Shadcn/UI + Tailwind → developer favorite, but setup heavier.
👉 For speed: Mantine (infinite scroll, cards, notifications out-of-the-box).

UI components:

Feed page: card view, scrollable feed.

Paper card:

Title (clickable → arXiv link)

3–4 line summary

Why it matters & applications (collapsible)

❤️ Like button

5. Optional Notifications

For prototype: just have a "Subscribe" field (email).

Later: connect Node → Resend/Postmark for daily digest.

🔹 Prototype Flow (User Journey)

Landing page → "Daily AI Research Digest"

CTA: "See today’s highlights"

Feed scroll starts.

Feed → shows cards (title + summary + quick actions).

Interaction → like/share.

Backend → likes stored, used later for "Trending".

(Optional MVP+) Daily email digest for signed-up users.