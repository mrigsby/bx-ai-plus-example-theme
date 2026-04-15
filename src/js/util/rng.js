// ---------------------------------------------------------------------------
// util/rng.js — seeded random walk used by live dashboard counters.
// Produces plausible "breathing" numbers clamped between [min, max] with
// capped step size so values don't jump wildly.
// ---------------------------------------------------------------------------

// Tiny deterministic PRNG (mulberry32) — lets us choose a seed per stat so
// two dashboards opened side-by-side drift differently but reproducibly.
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeDrifter(opts) {
  const { value, min, max, stepMax, rng } = opts;
  const r = rng || Math.random;
  let current = value;

  return function tick() {
    const delta = (r() * 2 - 1) * stepMax;
    current += delta;
    if (current < min) current = min + Math.abs(delta) * 0.5;
    if (current > max) current = max - Math.abs(delta) * 0.5;
    return current;
  };
}
