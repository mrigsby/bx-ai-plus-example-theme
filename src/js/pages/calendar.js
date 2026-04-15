// ---------------------------------------------------------------------------
// pages/calendar.js — FullCalendar integration.
// Reads events + categories from data attributes on the mount node.
// Resolves "T+0", "T+1" etc. into ISO datetimes anchored to "today".
// ---------------------------------------------------------------------------

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

function resolveDate(token) {
  // "T+N HH:MM" → ISO. Falls back to a real ISO string if it doesn't match.
  const m = /^T\+(\d+)\s+(\d{1,2}):(\d{2})$/.exec(token);
  if (!m) return token;
  const [, days, hh, mm] = m;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + Number(days));
  d.setHours(Number(hh), Number(mm), 0, 0);
  return d.toISOString();
}

export function init() {
  const el = document.querySelector("[data-bx-calendar]");
  if (!el) return;

  const eventsRaw = JSON.parse(el.getAttribute("data-bx-calendar-events"));
  const cats = JSON.parse(el.getAttribute("data-bx-calendar-categories"));
  const catById = Object.fromEntries(cats.map((c) => [c.id, c]));

  const events = eventsRaw.map((e) => {
    const cat = catById[e.category];
    return {
      id: e.id,
      title: e.title,
      start: resolveDate(e.start),
      end: resolveDate(e.end),
      allDay: !!e.allDay,
      backgroundColor: cat?.color || undefined,
      borderColor: cat?.color || undefined,
      textColor: e.tone === "primary" || e.tone === "success" ? "#041310" : "#fff",
      extendedProps: { category: e.category }
    };
  });

  const calendar = new Calendar(el, {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
    },
    height: "auto",
    nowIndicator: true,
    editable: true,
    selectable: true,
    weekends: true,
    dayMaxEventRows: 3,
    events
  });

  calendar.render();
}
