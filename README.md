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
  - **No-repeat guarantee (Round 7):** the deck is built unseen-first every
    beat — a card you answered correctly can never come back. The *only* two
    ways a question returns are (1) a mistake, which shuffles it back inside
    the same beat until you get it right, or (2) all 1,059 cards mastered,
    after which rotating review sets begin.
  - **Every calendar day gets its own unique 5-question sets** — the deck
    shuffle is salted with the date, so tomorrow's questions are always new.
  - **Every answer is explained** — correct or wrong, you get the *why*
    (and, on a miss, the right answer) before the next card.
  - Each card is tagged **Basic / Intermediate / Advanced**.
  - Each beat draws 5 cards from 5 *different* categories.
  - Wrong answers get a **Shuffled Retry** badge and are re-inserted randomly
    into the queue before the track can be finished.
- **Subject Vault** — a personal library *per subject*, just like the Mixtape
  Library is for beats. Every question you answer correctly is filed there with
  its explanation and the correct option highlighted, sorted basic → advanced.
- **Profile** — name, member-since date, current & best streak, beats
  completed, mixtapes, answers given, accuracy, cards mastered, mastery laps,
  and per-subject mastery bars. All progress persists in `localStorage`.
- **5-layer live beat builder** — Kick, Hi-Hat, Bass, Synth Chords, Lead Melody,
  all synthesized in real time with [Tone.js](https://tonejs.github.io/) on one
  shared transport clock. Zero audio files. Each correct answer unmutes the next
  layer and lights its visualizer bar.
- **7-day rotating track catalog** — a different genre every day (Synthwave,
  Funk, Chiptune, House, Lo-Fi, Trap, Future Bass). → now **7 soft focus beats
  tuned for deep work / "neural sessions"**: *Delta Drift* (Ambient, 62 BPM),
  *Theta Bloom* (Downtempo, 68), *Paper Rain* (Lo-Fi Study, 72), *Slow Orbit*
  (Mellow Techno, 76), *Aurora Idle* (Dream Chill, 66), *Synth Rain*
  (Downtempo Electronica, 80), *Deep Focus* (Minimal Brainwave, 84) — sparse
  kicks, quiet hats, long warm chord swells and gentle low-register leads.
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
  - **Engine v10 "Full-Signal Focus" (Round 8)** replaced the synth bank
    outright: it had been softened until phone/laptop speakers couldn't
    reproduce it (55 Hz bass under a 320 Hz lid, −17 dB hats). Warmth now
    lives in midrange *harmonics* (audible on tiny speakers), levels sit at
    a healthy −4 dBFS peak through a glue compressor, chords run on a fixed
    4-voice pool (no FM/PolySynth churn on mobile), and a **stale-event
    guard** drops late scheduler backlog instead of playing the
    post-resume "stuck/burst" artifact.
  - **Master volume slider** next to the Play button (saved per device).
    Tip: on iPhone the physical Silent switch also mutes WebAudio — flip it
    off if nothing is audible.
- **"Aurora Desk" UI (Round 7)** — a full visual redesign: ambient drifting
  light-orbs over a console grid, sticky glass header with gradient wordmark,
  glass cards with gradient hairline borders, a two-column desk layout on
  desktop (sticky stage left, flashcard right), neon per-layer visualizer
  tubes that glow in their instrument's color, letter-capped answer buttons
  with hover sweep, gradient stat tiles and mastery bars in the Profile.
  Still mobile-first, tap-friendly and works at 360 px.

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
| `style.css` | "Aurora Desk" theme: glass panels, neon tubes, sakura bonus, responsive grid |
| `app.js` | Tone.js engine, game loop, unseen-first no-repeat queue, streak, mixtape |
| `questions.js` | Generated bank: `window.QUESTION_BANK` (1,059 MCQs) |
| `gen_questions.js` | Deterministic generator that produces `questions.js` |
| `enrich_questions.js` | Post-processor that merges AI-written explanations (`e`) + difficulty (`d`) into the bank |
| `vendor/tone.min.js` | Bundled Tone.js 14.8.49 (offline-first, CDN fallback) |
| `sw.js` / `manifest.webmanifest` / `icons/` | PWA offline shell + install icons |
| `make_icons.py` | Regenerates the PWA icons (needs Pillow) |

Regenerate the bank with `node gen_questions.js` (validates uniqueness,
4 options, and correct-answer indexes).

## Tech

Vanilla HTML5 / CSS3 / JavaScript (ES2020) + bundled Tone.js 14 (CDN only as a
fallback). No frameworks, no build, no server required, no tracking, no network
needed after the files are on your device.
