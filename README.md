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

Regenerate the bank with `node gen_questions.js` (validates uniqueness,
4 options, and correct-answer indexes).

## Tech

Vanilla HTML5 / CSS3 / JavaScript (ES2020) + Tone.js 14 CDN. No frameworks, no
dependencies, no tracking.
