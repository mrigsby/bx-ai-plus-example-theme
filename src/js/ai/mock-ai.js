// ---------------------------------------------------------------------------
// ai/mock-ai.js — canned AI replies for demo purposes.
// Replaced in the ColdBox 8.1+ module by a handler action (e.g. 'ai.ask')
// that calls the BoxLang AI service.
// ---------------------------------------------------------------------------

const REPLIES = {
  "summarize": [
    "Here's what's happening on this page: 4 unread alerts, one active anomaly on /api/agents (p95 1.2s), and 3 suggestions queued. Want details on any of them?"
  ],
  "anomaly": [
    "I'm looking at the /api/agents latency spike from 14:22 UTC. The p95 went from 380ms to 1,240ms — a 226% jump. Likely correlated with the planner-alpha cache flush at 14:20. Want me to open a ticket or compare to last week?"
  ],
  "token": [
    "Token spend this week by agent:\n• summarizer-v3 — 412k (on budget)\n• planner-alpha — 680k (14% over)\n• retriever-xl — 190k (under)\n\nplanner-alpha is trending to burn through its allocation by Friday."
  ],
  "status": [
    "Drafted a weekly status for you:\n\n1. All services green except planner-alpha (degraded).\n2. Token usage 12% up week-over-week.\n3. Two fine-tune jobs completed — retriever-xl v1.2 promoted.\n\nWant me to post it to #ops?"
  ],
  "compare": [
    "Comparing planner-alpha vs v2:\n• Latency — v2 is 38% faster (p95 220ms vs 350ms).\n• Quality (eval pass) — v2 94.1% vs 93.7%.\n• Token cost — v2 ~11% higher.\n\nv2 looks like the right default on latency-sensitive paths."
  ],
  "explain": [
    "Revenue metric = sum of successfully billed invoices in the period, net of refunds and credits. It's computed hourly from the billing ledger. It does NOT include deferred/subscription portions that haven't been recognized yet."
  ],
  "default": [
    "Got it — running that now. In a real environment I'd query the runtime, but this is the theme demo so replies are canned.",
    "Good question. If this were wired to the ColdBox AI handler, I'd check the runtime and come back with concrete numbers.",
    "Let me look into that. (Mock reply — the real agent will plug in via the ColdBox handler.)"
  ]
};

function pickBucket(text) {
  const t = text.toLowerCase();
  if (/summar/i.test(t))  return "summarize";
  if (/anomal|spike|latenc|\/api\/agents/i.test(t)) return "anomaly";
  if (/token|budget|spend|cost/i.test(t)) return "token";
  if (/status|update|weekly/i.test(t)) return "status";
  if (/compare|vs\b|versus/i.test(t)) return "compare";
  if (/explain|what is|define/i.test(t)) return "explain";
  return "default";
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function reply(text) {
  const bucket = pickBucket(text);
  return randomFrom(REPLIES[bucket]);
}

// Rough "typing" delay — realistic pacing without real latency.
export function thinkingTime() {
  return 600 + Math.random() * 900;
}

// Simulated transcription — picks a canned-ish phrase based on mic seed.
const TRANSCRIPTS = [
  "Show me the current anomalies.",
  "Summarize yesterday's activity in 3 bullets.",
  "What's the token budget looking like?",
  "Compare planner-alpha against v2.",
  "Draft a weekly status update for ops.",
  "Explain the Revenue metric."
];

export function transcribe() {
  return randomFrom(TRANSCRIPTS);
}
