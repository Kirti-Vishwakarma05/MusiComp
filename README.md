# Musicomp 🎧⌨️

**Daily code beats** — a gamified micro-learning app that turns CS-fundamentals
practice into a music studio. Answer questions, unlock instrument layers, and
build a real 5-layer track every day.

## Features

- **1,059+ question bank** across 17 CS-fundamentals categories (Data Structures,
  Algorithms & Complexity, Networking, HTML, CSS, JavaScript, Operating Systems,
  Databases & SQL, Git, Web & Security, Cloud & DevOps, Software Engineering,
  Web APIs, Compilers, CS Math & Logic, CS Concepts & OOP, Programming Concepts).
  - Questions are never repeated until the whole bank has been mastered once
    ("mastery laps" with a fresh shuffle each lap).
  - Each beat draws 5 cards from 5 *different* categories.
  - Wrong answers get a **Shuffled Retry** badge and are re-inserted randomly
    into the queue before the track can be finished.
- **5-layer live beat builder** — Kick, Hi-Hat, Bass, Synth Chords, Lead Melody,
  all synthesized in real time with [Tone.js](https://tonejs.github.io/) on one
  shared transport clock. Zero audio files. Each correct answer unmutes the next
  layer and lights its visualizer bar.
- **7-day rotating track catalog** — a different genre every day (Synthwave,
  Funk, Chiptune, House, Lo-Fi, Trap, Future Bass).
  - **Beat rotation:** the calendar day seeds the rotation, and every completed
    beat rolls you to the *next* track — so back-to-back practice always shows
    progress ("Day 3/7 · Retro Arcade") instead of repeating one day. The
    calendar streak is separate: it grows once per real date, and the app now
    spells that out ("finish a beat tomorrow to grow it to Day N+1").
- **Daily streak + Mixtape Library** (`localStorage`) — replay any unlocked beat,
  with per-layer mute/solo toggles and stop control.
- **🌸 7-day streak anime bonus** — every time your streak hits a multiple of 7,
  "Sakura Finale" (anime J-Rock, 164 BPM) unlocks: a special one-minute track
  with all 5 layers firing at once, with a live 60-second countdown and
  auto-stop. Saved to the Mixtape Library forever.
- **Audio-consistency engine** — a playback watchdog + visibility/pointer
  re-unlock keeps the music alive through browser audio-context suspensions
  (tab switches, idle, autoplay re-locking) on desktop and mobile.
- Responsive dark music-studio UI (mobile-first, tap-friendly, works at 360 px).

## Platform independence

Musicomp runs *everywhere*, with zero online requirements:

- **Tone.js is bundled locally** (`vendor/tone.min.js`); the CDN is only a
  fallback. Works offline, on flaky networks, and behind ad-blockers.
- **No server needed** — double-click `index.html` and it runs from `file://`.
- **Installable PWA** — `manifest.webmanifest` + a service worker cache the
  whole app shell: "Install app" on desktop Chrome/Edge, "Add to Home Screen"
  on Android and iOS Safari. Once visited, it launches offline.
- **Storage-proof** — if `localStorage` is blocked or throws (iOS private mode,
  hardened privacy settings), progress falls back to an in-memory store instead
  of crashing.
- **Touch-first CSS** — no tap delay, no tap highlight, notch/gesture-bar safe
  areas, momentum scrolling in modals. Tested paths: desktop Chrome, mobile
  Chrome/Safari patterns, Firefox scrollbar colors, `file://`, https hosting.

## Run it

Static app — no build step.

```bash
# any static server works, e.g.
python3 -m http.server 8000
# open http://localhost:8000
```

First tap starts audio (browser autoplay policy).

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell, modals (library, completion, anime bonus) |
| `style.css` | Dark studio UI, responsive layout, sakura theme |
| `app.js` | Tone.js engine, game loop, deck cursor, streak, mixtape |
| `questions.js` | Generated bank: `window.QUESTION_BANK` (1,059 MCQs) |
| `gen_questions.js` | Deterministic generator that produces `questions.js` |
| `vendor/tone.min.js` | Bundled Tone.js 14.8.49 (offline-first, CDN fallback) |
| `sw.js` / `manifest.webmanifest` / `icons/` | PWA offline shell + install icons |
| `make_icons.py` | Regenerates the PWA icons (needs Pillow) |

Regenerate the bank with `node gen_questions.js` (validates uniqueness,
4 options, and correct-answer indexes).

## Tech

Vanilla HTML5 / CSS3 / JavaScript (ES2020) + bundled Tone.js 14 (CDN only as a
fallback). No frameworks, no build, no server required, no tracking, no network
needed after the files are on your device.
