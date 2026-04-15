// ---------------------------------------------------------------------------
// ai/voice-toast.js — state machine for the bottom-right voice toast.
// Triggered by any [data-bx-voice-trigger]. Purely mocked — no real audio.
// States: idle → listening → processing → result → error → (idle)
// ---------------------------------------------------------------------------

import { Waveform } from "./waveform.js";
import { transcribe } from "./mock-ai.js";
import * as chatPanel from "./chat-panel.js";

const LISTEN_MIN_MS = 2200;
const LISTEN_MAX_MS = 4200;
const PROCESS_MS = 1100;

let rootEl, titleEl, subtitleEl, actionBtn, actionLabelEl, transcriptEl;
let wave;
let state = "idle";
let listenStartedAt = 0;
let listenTimeout;
let processTimeout;
let lastTranscript = "";

function cache() {
  rootEl = document.getElementById("bx-voice-toast");
  if (!rootEl) return false;
  titleEl = rootEl.querySelector("[data-bx-voice-title]");
  subtitleEl = rootEl.querySelector("[data-bx-voice-subtitle]");
  actionBtn = rootEl.querySelector("[data-bx-voice-action]");
  actionLabelEl = rootEl.querySelector("[data-bx-voice-action-label]");
  transcriptEl = rootEl.querySelector("[data-bx-voice-transcript]");
  const waveEl = rootEl.querySelector("[data-bx-waveform]");
  wave = new Waveform(waveEl);
  return true;
}

function setState(next) {
  state = next;
  if (rootEl) {
    rootEl.setAttribute("data-bx-voice-state", next);
    rootEl.setAttribute("aria-hidden", next === "idle" ? "true" : "false");
  }
}

function setText(title, subtitle) {
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

function setActionButton(label, action) {
  if (actionLabelEl) actionLabelEl.textContent = label;
  if (actionBtn) actionBtn.setAttribute("data-bx-voice-action", action);
}

// ---- State transitions ----
function toListening() {
  setState("listening");
  setText("Listening…", "Speak now — press stop when you're done.");
  setActionButton("Stop", "stop");
  lastTranscript = "";
  if (transcriptEl) { transcriptEl.textContent = ""; transcriptEl.hidden = true; }
  wave.start();
  listenStartedAt = performance.now();

  // Auto-stop after a plausible spoken duration if user doesn't hit stop first.
  const duration = LISTEN_MIN_MS + Math.random() * (LISTEN_MAX_MS - LISTEN_MIN_MS);
  clearTimeout(listenTimeout);
  listenTimeout = setTimeout(() => {
    if (state === "listening") toProcessing();
  }, duration);
}

function toProcessing() {
  clearTimeout(listenTimeout);
  wave.stop();
  setState("processing");
  setText("Processing your request…", "Transcribing and routing to BX-AI.");
  setActionButton("Cancel", "cancel");

  clearTimeout(processTimeout);
  processTimeout = setTimeout(() => {
    if (state === "processing") toResult();
  }, PROCESS_MS);
}

function toResult() {
  lastTranscript = transcribe();
  setState("result");
  setText("Got it.", "Review and send to BX-AI.");
  setActionButton("Send to chat", "open-chat");
  if (transcriptEl) {
    transcriptEl.textContent = "\u201c" + lastTranscript + "\u201d";
    transcriptEl.hidden = false;
  }
}

function toError(message = "Didn't catch that. Try again?") {
  clearTimeout(listenTimeout);
  clearTimeout(processTimeout);
  wave.stop();
  setState("error");
  setText("No audio detected.", message);
  setActionButton("Try again", "retry");
  if (transcriptEl) transcriptEl.hidden = true;
}

function toIdle() {
  clearTimeout(listenTimeout);
  clearTimeout(processTimeout);
  wave.stop();
  setState("idle");
  lastTranscript = "";
  if (transcriptEl) { transcriptEl.hidden = true; transcriptEl.textContent = ""; }
}

function handleActionClick() {
  const action = actionBtn?.getAttribute("data-bx-voice-action");
  switch (action) {
    case "stop":      return toProcessing();
    case "cancel":    return toIdle();
    case "open-chat": {
      // Capture the transcript BEFORE toIdle() clears it.
      const transcript = lastTranscript;
      toIdle();
      if (transcript) chatPanel.submit(transcript);
      return;
    }
    case "retry":     return toListening();
  }
}

export function open() {
  if (!rootEl && !cache()) return;
  toListening();
}

export function init() {
  if (!cache()) return;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-bx-voice-trigger]");
    if (trigger) {
      e.preventDefault();
      if (state === "idle") toListening();
      else toIdle();
      return;
    }

    if (!rootEl.contains(e.target)) return;

    if (e.target.closest("[data-bx-voice-dismiss]") || e.target.closest("[data-bx-voice-cancel]")) {
      toIdle();
      return;
    }
    if (e.target.closest("[data-bx-voice-action]")) {
      handleActionClick();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (state === "idle") return;
    if (e.key === "Escape") toIdle();
  });
}
