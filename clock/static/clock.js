"use strict";

const TWO_PI = Math.PI * 2;
const CX = 150, CY = 150;  // SVG centre

// ── Build tick marks ──────────────────────────────────────────
(function buildTicks() {
  const g = document.getElementById("ticks");
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * TWO_PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = isMajor ? 118 : 127;
    const outer = 136;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", (CX + inner * Math.cos(angle)).toFixed(2));
    line.setAttribute("y1", (CY + inner * Math.sin(angle)).toFixed(2));
    line.setAttribute("x2", (CX + outer * Math.cos(angle)).toFixed(2));
    line.setAttribute("y2", (CY + outer * Math.sin(angle)).toFixed(2));
    line.setAttribute("class", isMajor ? "tick-major" : "tick-minor");
    g.appendChild(line);
  }

  // Hour numerals
  const NUMS = ["12","1","2","3","4","5","6","7","8","9","10","11"];
  NUMS.forEach((n, i) => {
    const angle = (i / 12) * TWO_PI - Math.PI / 2;
    const r = 101;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (CX + r * Math.cos(angle)).toFixed(2));
    text.setAttribute("y", (CY + r * Math.sin(angle)).toFixed(2));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", "14");
    text.setAttribute("fill", "rgba(224,224,255,0.7)");
    text.setAttribute("font-family", "'Segoe UI', system-ui, sans-serif");
    text.textContent = n;
    g.appendChild(text);
  });
})();

// ── Server time sync ─────────────────────────────────────────
let serverOffset = 0;  // ms: add to Date.now() to get server-equivalent time

async function syncWithServer() {
  try {
    const t0 = performance.now();
    const res = await fetch("/api/time");
    const t1 = performance.now();
    const data = await res.json();
    const rtt = (t1 - t0) / 2;
    // Build a Date from server fields and correct for half-RTT
    const serverDate = new Date();
    serverDate.setHours(data.hours, data.minutes, data.seconds, data.millis);
    serverOffset = serverDate.getTime() - (Date.now() - rtt);
  } catch (_) {
    // If the fetch fails just keep the previous offset
  }
}

// Re-sync every 10 minutes and on tab re-focus
setInterval(syncWithServer, 10 * 60 * 1000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncWithServer();
});

// ── Angle helpers ─────────────────────────────────────────────
function getAngles(h, m, s, ms) {
  const sec  = s + ms / 1000;
  const min  = m + sec / 60;
  const hour = (h % 12) + min / 60;
  return {
    hour:   (hour / 12) * TWO_PI - Math.PI / 2,
    minute: (min  / 60) * TWO_PI - Math.PI / 2,
    second: (sec  / 60) * TWO_PI - Math.PI / 2,
  };
}

// ── Analog drawing ────────────────────────────────────────────
const HAND_LENGTHS = {
  "hour-hand":   80,
  "minute-hand": 110,
  "second-hand": 112,
};
const TAIL_LENGTH = 20;

function setHand(id, angle, length) {
  const el = document.getElementById(id);
  el.setAttribute("x2", (CX + length * Math.cos(angle)).toFixed(3));
  el.setAttribute("y2", (CY + length * Math.sin(angle)).toFixed(3));
}

function drawAnalog(angles) {
  setHand("hour-hand",   angles.hour,   HAND_LENGTHS["hour-hand"]);
  setHand("minute-hand", angles.minute, HAND_LENGTHS["minute-hand"]);
  setHand("second-hand", angles.second, HAND_LENGTHS["second-hand"]);
  // Tail goes in the opposite direction
  const tailAngle = angles.second + Math.PI;
  setHand("second-tail", tailAngle, TAIL_LENGTH);
}

// ── Digital display ───────────────────────────────────────────
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

let lastSecond = -1;

function updateDigital(now) {
  const h  = now.getHours();
  const m  = now.getMinutes();
  const s  = now.getSeconds();

  if (s === lastSecond) return;  // only update DOM once per second
  lastSecond = s;

  const pad = n => String(n).padStart(2, "0");
  const h12 = h % 12 || 12;

  document.getElementById("dig-hours").textContent   = pad(h12);
  document.getElementById("dig-minutes").textContent = pad(m);
  document.getElementById("dig-seconds").textContent = pad(s);
  document.getElementById("dig-ampm").textContent    = h < 12 ? "AM" : "PM";

  document.getElementById("date-line").textContent =
    `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

// ── Main RAF loop ─────────────────────────────────────────────
function tick() {
  const now    = new Date(Date.now() + serverOffset);
  const h      = now.getHours();
  const m      = now.getMinutes();
  const s      = now.getSeconds();
  const ms     = now.getMilliseconds();
  const angles = getAngles(h, m, s, ms);

  drawAnalog(angles);
  updateDigital(now);

  requestAnimationFrame(tick);
}

// Kick off: sync first, then start the loop
syncWithServer().then(tick);
