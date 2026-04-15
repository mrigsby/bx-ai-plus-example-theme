// ---------------------------------------------------------------------------
// ai/waveform.js — drives .bx-waveform bar heights via --bx-bar-amp.
// Uses a smoothed seeded PRNG so each bar pulses plausibly like a volume
// envelope. No real audio is captured — this is a pure visual mock.
// ---------------------------------------------------------------------------

export class Waveform {
  constructor(el) {
    this.el = el;
    this.bars = el ? Array.from(el.querySelectorAll(".bx-waveform__bar")) : [];
    this.running = false;
    this.rafId = null;
    this.amps = this.bars.map(() => 0.15 + Math.random() * 0.25);
    this.lastTick = 0;
  }

  start() {
    if (!this.el || this.running) return;
    this.running = true;
    this.lastTick = performance.now();
    const step = (now) => {
      if (!this.running) return;
      const dt = now - this.lastTick;
      if (dt >= 70) {
        this.lastTick = now;
        for (let i = 0; i < this.bars.length; i++) {
          // Smoothed random walk toward a new target.
          const target = 0.2 + Math.random() * 0.95;
          this.amps[i] = this.amps[i] * 0.45 + target * 0.55;
          this.bars[i].style.setProperty("--bx-bar-amp", this.amps[i].toFixed(3));
        }
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    // Settle bars back to a calm state.
    for (const bar of this.bars) bar.style.setProperty("--bx-bar-amp", "0.15");
  }
}
