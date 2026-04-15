// ---------------------------------------------------------------------------
// pages/forms-advanced.js
// Wires up Choices.js, Flatpickr, Inputmask, noUiSlider, Quill, Dropzone,
// and SweetAlert2 on the /forms/advanced/ page.
//
// Every plugin init is wrapped in its own try/catch so one bad library
// can't take out the whole page.
// ---------------------------------------------------------------------------

import Choices from "choices.js";
import flatpickr from "flatpickr";
import * as InputmaskNS from "inputmask";
import noUiSlider from "nouislider";
import Quill from "quill";
import Dropzone from "dropzone";
import Swal from "sweetalert2";

// Inputmask is published as UMD with a deeply-nested default export. Walk
// the namespace until we find something that's actually a function — the
// constructor may live at .Inputmask, .default, .default.default, etc.
function resolveCtor(ns, max = 4) {
  let cur = ns;
  for (let i = 0; i < max; i++) {
    if (typeof cur === "function") return cur;
    if (cur && typeof cur === "object") {
      if (typeof cur.Inputmask === "function") return cur.Inputmask;
      if (typeof cur.default === "function")  return cur.default;
      if (cur.default && typeof cur.default === "object") { cur = cur.default; continue; }
    }
    return null;
  }
  return null;
}
const Inputmask = resolveCtor(InputmaskNS);

function safe(name, fn) {
  try { fn(); }
  catch (err) { console.error(`[BX-AI+ forms-advanced] ${name} init failed:`, err); }
}

// Choices.js — single + multi
// NOTE: Choices v11 requires each classNames value to be a SINGLE token (no
// spaces). Our skin keys off `.choices` directly (see plugins/_choices.scss).
function initChoices() {
  document.querySelectorAll("[data-bx-choices]").forEach((el) => {
    new Choices(el, { shouldSort: false, itemSelectText: "" });
  });
  document.querySelectorAll("[data-bx-choices-multi]").forEach((el) => {
    new Choices(el, {
      removeItemButton: true,
      shouldSort: false,
      itemSelectText: ""
    });
  });
}

// Flatpickr — date / datetime / range / time
function initFlatpickr() {
  document.querySelectorAll("[data-bx-flatpickr]").forEach((el) => flatpickr(el, { dateFormat: "Y-m-d" }));
  document.querySelectorAll("[data-bx-flatpickr-datetime]").forEach((el) => flatpickr(el, { enableTime: true, dateFormat: "Y-m-d H:i" }));
  document.querySelectorAll("[data-bx-flatpickr-range]").forEach((el) => flatpickr(el, { mode: "range", dateFormat: "Y-m-d" }));
  document.querySelectorAll("[data-bx-flatpickr-time]").forEach((el) => flatpickr(el, { enableTime: true, noCalendar: true, dateFormat: "H:i" }));
}

// Inputmask — phone, card, etc.
function initInputmask() {
  if (typeof Inputmask !== "function") {
    console.warn("[BX-AI+ forms-advanced] Inputmask constructor not resolved — check the UMD interop in pages/forms-advanced.js");
    return;
  }
  document.querySelectorAll("[data-bx-mask]").forEach((el) => {
    new Inputmask(el.getAttribute("data-bx-mask")).mask(el);
  });
}

// noUiSlider — token budget range
function initSlider() {
  document.querySelectorAll("[data-bx-slider]").forEach((el) => {
    noUiSlider.create(el, {
      start: [200, 600],
      connect: true,
      step: 25,
      range: { min: 0, max: 1000 },
      tooltips: true,
      format: { to: (v) => Math.round(v) + "k", from: (v) => parseInt(v, 10) }
    });
  });
}

// Quill — rich text editor
function initQuill() {
  document.querySelectorAll("[data-bx-quill]").forEach((el) => {
    const q = new Quill(el, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "blockquote", "code-block"],
          ["clean"]
        ]
      },
      placeholder: "Write something…"
    });
    q.setText("Drafted from BX-AI prompt — edit as needed.\n");
  });
}

// Dropzone — file upload
function initDropzone() {
  Dropzone.autoDiscover = false;
  document.querySelectorAll("[data-bx-dropzone]").forEach((el) => {
    new Dropzone(el, {
      url: "#",
      autoProcessQueue: false,
      maxFilesize: 50,
      acceptedFiles: ".png,.jpg,.jpeg,.gif,.pdf,.mp4",
      addRemoveLinks: true,
      dictRemoveFile: "Remove"
    });
  });
}

// SweetAlert2 — themed alert dialogs
function initSweet() {
  const base = { customClass: { popup: "bx-swal" }, buttonsStyling: false };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bx-swal]");
    if (!btn) return;
    const kind = btn.getAttribute("data-bx-swal");
    if (kind === "info")    Swal.fire({ ...base, icon: "info",    title: "Heads up", text: "Just an informational notice.", confirmButtonText: "OK", customClass: { popup: "bx-swal", confirmButton: "btn btn-primary" } });
    if (kind === "success") Swal.fire({ ...base, icon: "success", title: "Saved",    text: "Your changes were saved.",        confirmButtonText: "Done", customClass: { popup: "bx-swal", confirmButton: "btn btn-primary" } });
    if (kind === "warning") Swal.fire({ ...base, icon: "warning", title: "Are you sure?", text: "Double-check before proceeding.", confirmButtonText: "Got it", customClass: { popup: "bx-swal", confirmButton: "btn btn-warning" } });
    if (kind === "confirm") Swal.fire({
      ...base,
      icon: "question",
      title: "Delete this conversation?",
      text: "This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: { popup: "bx-swal", confirmButton: "btn btn-danger me-2", cancelButton: "btn btn-outline-secondary" }
    });
  });
}

export function init() {
  safe("choices",   initChoices);
  safe("flatpickr", initFlatpickr);
  safe("inputmask", initInputmask);
  safe("slider",    initSlider);
  safe("quill",     initQuill);
  safe("dropzone",  initDropzone);
  safe("swal",      initSweet);
}
