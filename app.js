/* ============================================================
   Musicomp — daily CS micro-learning x 5-layer beat builder
   Vanilla JS + Tone.js (CDN). All audio synthesized live on the
   shared Tone.Transport clock — zero external audio files.
   ============================================================ */
"use strict";

/* ---------------- Layer + Track catalog (7-day rotation) ---------------- */
const LAYERS = [
  { key: "kick",   name: "Kick Drum",   short: "KICK",  color: "#ff3864" },
  { key: "hat",    name: "Hi-Hat",      short: "HATS",  color: "#ffc857" },
  { key: "bass",   name: "Bassline",    short: "BASS",  color: "#26d7ff" },
  { key: "chords", name: "Synth Chords",short: "CHORDS",color: "#8a5cff" },
  { key: "lead",   name: "Lead Melody", short: "LEAD",  color: "#2dffb3" },
];

/* Each pattern loop is 1 bar = 16 sixteenth-note steps.
   bass:  [step, note, dur?]   chords: [step, [notes], dur]   lead: [step, note, dur?] */
/* Round 6: the daily rotation is a set of SOFT focus beats — slow tempos
   (62-84 BPM), sparse kicks/hats, long warm chord swells and gentle,
   low-register lead phrases, chosen to sit quietly under studying
   ("best for neural networks" mode). Sakura Finale (id 7) is untouched. */
const TRACKS = [
  { id: 0, name: "Delta Drift",    genre: "Ambient Focus",  bpm: 62,
    kick: [0, 8],
    hat:  [4, 12],
    bass: [[0,"A1","2n"],[8,"F1","2n"]],
    chords: [[0,["A3","C4","E4"],"2n"],[8,["F3","A3","C4"],"2n"]],
    lead: [[2,"A4","4n"],[10,"E5","4n"]] },

  { id: 1, name: "Theta Bloom",    genre: "Downtempo",      bpm: 68,
    kick: [0, 10],
    hat:  [2, 6, 10, 14],
    bass: [[0,"D1","4n"],[8,"A#1","4n"]],
    chords: [[0,["D3","F3","A3"],"2n"],[8,["A#2","D3","F3"],"2n"]],
    lead: [[4,"A4","8n"],[12,"F4","8n"]] },

  { id: 2, name: "Paper Rain",     genre: "Lo-Fi Study",    bpm: 72,
    kick: [0, 7, 10],
    hat:  [0, 3, 6, 8, 11, 14],
    bass: [[0,"G1","4n"],[8,"D1","4n"]],
    chords: [[2,["G3","A#3","D4"],"2d"],[10,["D3","F3","A3"],"2d"]],
    lead: [[4,"D5","8n"],[12,"A#4","8n"]] },

  { id: 3, name: "Slow Orbit",     genre: "Mellow Techno",  bpm: 76,
    kick: [0, 8],
    hat:  [4, 12],
    bass: [[0,"C2","8n"],[3,"C2","16n"],[8,"G1","8n"],[11,"G1","16n"]],
    chords: [[0,["C4","E4","G4"],"2n"],[8,["A3","D4","E4"],"2n"]],
    lead: [[6,"E5","4n"],[14,"D5","4n"]] },

  { id: 4, name: "Aurora Idle",    genre: "Dream Chill",    bpm: 66,
    kick: [0, 8],
    hat:  [2, 6, 10, 14],
    bass: [[0,"E1","2n"],[8,"C2","2n"]],
    chords: [[0,["E3","G3","B3"],"2n"],[8,["C3","E3","G3"],"2n"]],
    lead: [[3,"B4","8n"],[7,"G4","8n"],[11,"E4","8n"],[14,"G4","8n"]] },

  { id: 5, name: "Synth Rain",     genre: "Downtempo Electronica", bpm: 80,
    kick: [0, 6, 10],
    hat:  [0, 4, 8, 12],
    bass: [[0,"A1","8n"],[4,"A1","16n"],[8,"E2","8n"],[12,"G1","16n"]],
    chords: [[0,["A3","C4","E4"],"2n"],[8,["E3","G3","A#3"],"2n"]],
    lead: [[5,"C5","8n"],[9,"A#4","8n"],[13,"G4","4n"]] },

  { id: 6, name: "Deep Focus",     genre: "Minimal Brainwave", bpm: 84,
    kick: [0, 8],
    hat:  [4, 12],
    bass: [[0,"F1","4n"],[4,"F1","16n"],[8,"C2","4n"],[12,"C2","16n"]],
    chords: [[0,["F3","A3","C4"],"2n"],[8,["C3","E3","G3"],"2n"]],
    lead: [[2,"A4","8n"],[6,"C5","8n"],[10,"G4","8n"],[14,"A4","8n"]] },

  /* id 7 — reserved bonus track: NEVER appears in the daily 7-day rotation.
     Plays for exactly 60s as the 7-day-streak anime reward (and from the library). */
  { id: 7, name: "Sakura Finale", genre: "Anime J-Rock", bpm: 164,
    kick: [0, 4, 8, 12],
    hat:  [2, 3, 6, 7, 10, 11, 14, 15],
    bass: [[0,"A1","16n"],[1,"A1","16n"],[3,"A1","16n"],[4,"A1","16n"],[6,"A1","16n"],[7,"G1","16n"],[8,"A1","16n"],[9,"A1","16n"],[11,"A1","16n"],[12,"C2","16n"],[13,"C2","16n"],[15,"G1","16n"]],
    chords: [[0,["A3","C4","E4"],"4n"],[4,["F3","A3","C4"],"4n"],[8,["G3","A#3","D4"],"4n"],[12,["E3","G3","B3"],"4n"]],
    lead: [[0,"E5","16n"],[1,"G5","16n"],[2,"A5","16n"],[4,"C6","8n"],[6,"B5","16n"],[7,"A5","16n"],
           [8,"G5","16n"],[9,"A5","16n"],[10,"E5","8n"],[12,"G5","16n"],[13,"A5","16n"],[14,"C6","8n"]] },
];

/* ---------------- Question bank: 1000+ fundamentals ----------------
   questions.js exposes window.QUESTION_BANK (flat array of {cat,q,opts,a}).
   Beats draw 5 consecutive cards from a category-interleaved deck, so every
   beat mixes 5 different topics. Round 7: the deck is unseen-first, rebuilt
   against state.seen at every beat start — a mastered card NEVER returns
   (except as review once all 1,059 are mastered, or right after a mistake,
   where the same card loops back within the unfinished beat). */
const BANK = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];

/* Bank stems/options were authored with HTML entities (&lt;form&gt; etc.) for
   innerHTML rendering; the flashcard now uses textContent, so decode once. */
(() => {
  const ta = document.createElement("textarea");
  const dec = (s) => {
    if (typeof s !== "string" || s.indexOf("&") === -1) return s;
    ta.innerHTML = s; return ta.value;
  };
  BANK.forEach(q => { q.q = dec(q.q); q.opts = q.opts.map(dec); });
})();

function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffleArr(arr, rng){ for (let i=arr.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

/* Round-robin interleave by category: consecutive cards never share a topic
   (while more than one category still has cards left in the rotation). */
/* Round 6: seed includes TODAY's date key, so every calendar day gets a
   freshly shuffled (and therefore unique) run of 5-question sets —
   no more "same 5 questions every day". Within one day the order is stable. */
/* Round 7: NO-REPEAT GUARANTEE. The deck is built from every card and then
   split: not-yet-mastered cards first, mastered cards only as an "review"
   tail after the whole bank has been answered. So the same question never
   comes back — unless the user made a mistake (in-beat shuffled retry), or
   the bank is fully exhausted and a mastery-lap review begins. The date salt
   keeps each calendar day's NEW cards in a fresh order. */
function buildDeck(bank, lap, day, seen){
  const groups = {};
  bank.forEach((q, i) => { (groups[q.cat] = groups[q.cat] || []).push(i); });
  const keys = Object.keys(groups);
  const rng = mulberry32(hashStr("deck|lap" + lap + "|day" + (day || "x")));
  keys.forEach(k => shuffleArr(groups[k], rng));
  const order = [];
  while (order.length < bank.length)
    keys.forEach(k => { if (groups[k].length) order.push(groups[k].shift()); });
  if (!seen) return order;
  const fresh = [], review = [];
  order.forEach(i => (seen[i] ? review : fresh).push(i));
  return fresh.concat(review);
}
function unseenCount(){
  return BANK.length - Object.keys(state.seen || {}).length;
}
let DECK = [];   /* seeded below, once TODAY/state exist */

/* setNumber counts completed sets (Round 7: the old deck cursor was
   replaced by the unseen-first queue + a completed-sets counter). */
function setNumber() { return (state.setsDone | 0) + 1; }

/* Round 7 queue model: DECK is [all unseen in day-salted order] +
   [all mastered review cards]. A beat ALWAYS takes its 5 cards from the
   unseen front — mastered cards can only re-enter when fewer than 5 unseen
   remain (topped up from the rotating review tail). So:
     * same question never repeats after a correct answer;
     * mistakes loop the card back WITHIN the beat only (shuffled retry);
     * quitting mid-beat resumes the same unfinished cards (they're still
       unseen and sit at the front — minus the ones you already got right). */
function beatQuestions() {
  if (!BANK.length) return [];
  DECK = buildDeck(BANK, state.lap || 0, dateKey(new Date()), state.seen);
  const freshN = unseenCount();
  const idx = [];
  const take = Math.min(5, freshN);
  for (let i = 0; i < take; i++) idx.push(DECK[i]);
  const revLen = DECK.length - freshN;
  if (revLen > 0) {
    for (let k = 0; k < 5 - take; k++) idx.push(DECK[freshN + ((state.reviewCursor | 0) + k) % revLen]);
    state.reviewCursor = ((state.reviewCursor | 0) + (5 - take)) % revLen;
  }
  if (take === 0 && revLen > 0 && !state.lapNotified) {
    state.lap = (state.lap || 0) + 1;
    state.lapNotified = true;
    toast("Full bank mastered \u2014 starting mastery lap " + (state.lap + 1) + " \uD83C\uDFB5");
  } else if (take > 0 && state.lapNotified) {
    state.lapNotified = false; /* new unseen cards exist again (fresh device/lap state) */
  }
  saveState();
  return idx.map(i => Object.assign({ retried: false, bid: i }, BANK[i]));
}

/* ---------------- Persistence (localStorage) ---------------- */
const LS_KEY = "musicomp_state_v1";
/* Platform-independent storage: iOS private mode, Safari "block all
   cookies", old WebKit sandboxes and file:// in some browsers can THROW
   on localStorage. Degrade to an in-memory store instead of crashing. */
const store = {
  mem: {},
  get(k) {
    try { return localStorage.getItem(k); }
    catch (e) { return Object.prototype.hasOwnProperty.call(this.mem, k) ? this.mem[k] : null; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); }
    catch (e) { this.mem[k] = v; }
  },
};
function defaultState() {
  return { streak: 0, lastDate: null, mixtape: [], cursor: 0, lap: 0, lastBonusStreak: null,
           beatDate: null, beatsToday: 0,
           /* Round 6 fields */
           seen: {},          // {bankIndex: 1} once answered correctly -> Subject Vault ✓
           answered: 0,       // total answers given (incl. retries)
           correct: 0,        // total correct answers
           bestStreak: 0,     // longest streak ever held
           name: "",          // profile display name
           created: null,     // join date YYYY-MM-DD
           setsDone: 0,       // completed 5-card sets (lifetime)
           reviewCursor: 0,   // rotation point inside the review tail
           lapNotified: false };// lap toast already fired for exhausted bank
  // mixtape: [{trackId, date, bonus?}]
}
function loadState() {
  try {
    const raw = store.get(LS_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    if (typeof s.streak !== "number" || !Array.isArray(s.mixtape)) return defaultState();
    if (typeof s.cursor !== "number" || s.cursor < 0) s.cursor = 0;
    if (typeof s.lap !== "number") s.lap = 0;
    if (typeof s.beatsToday !== "number" || s.beatsToday < 0) s.beatsToday = 0;
    if (typeof s.beatDate !== "string") s.beatDate = null;
    /* Migrate older saves that predate the round-6 fields. */
    const d = defaultState();
    Object.keys(d).forEach(k => { if (s[k] === undefined) s[k] = d[k]; });
    if (typeof s.bestStreak === "number" && s.bestStreak < s.streak) s.bestStreak = s.streak;
    return s;
  } catch (e) { return defaultState(); }
}
function saveState() {
  store.set(LS_KEY, JSON.stringify(state));
}
let state = loadState();

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const TODAY = dateKey(new Date());
const YESTERDAY = dateKey(new Date(Date.now() - 86400000));

/* Which of the 7 catalog days is today? (day-of-year rotation) */
function todayTrackIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const doy = Math.floor((now - start) / 86400000);
  return doy % 7;
}
/* BEAT ROTATION: the calendar day SEEDS the 7-track catalog, and every
   completed beat rolls to the NEXT track — so back-to-back practice never
   feels "stuck on one day". Persists across reloads via state.beatsToday. */
function rotationIndex() {
  if (state.beatDate !== TODAY) { state.beatDate = TODAY; state.beatsToday = 0; }
  return (todayTrackIndex() + (state.beatsToday | 0)) % 7;
}
/* Seed the day's deck order now that state + TODAY exist (module order). */
DECK = buildDeck(BANK, state.lap || 0, TODAY, state.seen);

/* ---------------- Audio engine (Tone.js) ----------------
   All 5 layers are synthesized on one shared Tone.Transport clock.
   A single 16n scheduleRepeat callback steps through the pattern and
   triggers whichever layers are audible (active && !muted && solo-gate). */
const LAYER_HITS = {}; // rebuilt per track: { kick:Set, hat:Set, bass:Set, chords:Set, lead:Set }

const Audio = {
  built: false,
  synth: {},
  loopId: null,
  step: 0,
  track: null,
  active: {},           // layer unlocked for playback
  muted: {},            // library mute toggles
  solo: {},             // library solo toggles
  mode: "game",         // "game" | "library"
  wants: false,         // user intends music to be playing (watchdog enforces it)
  stopAt: null,         // Date.now() deadline for auto-stop (60s anime bonus beat)
  onAutoStop: null,     // callback fired when the deadline passes
  preview: false,       // Play-button full-track preview (cleared by first answer)

  resetFlags() {
    LAYERS.forEach(l => { this.active[l.key] = false; this.muted[l.key] = false; this.solo[l.key] = false; });
  },

  async ensure() {
    if (!window.Tone) { toast("Audio library blocked — check your connection/ad-blocker."); return false; }
    try {
      const withTimeout = (p, ms) => Promise.race([p, new Promise(res => setTimeout(() => res("pending"), ms))]);
      if (!this.built) {
        await withTimeout(Tone.start(), 1500);
        /* Build the voices even if the context is still suspended: the
           transport keeps scheduling and the watchdog resumes audio the
           instant the context is unlocked, so music never silently dies. */
        this.build();
        if (Tone.context.state !== "running") { this.toastOnce("Tap again to enable audio \uD83C\uDFA7"); return false; }
      } else if (Tone.context.state !== "running") {
        await withTimeout(Tone.start(), 1500);
        if (Tone.context.state !== "running") { this.toastOnce("Tap again to enable audio \uD83C\uDFA7"); return false; }
      }
      return true;
    } catch (e) {
      console.warn("Audio init failed:", e);
      toast("Audio unavailable on this browser.");
      return false;
    }
  },

  toastOnce(msg) {
    const now = Date.now();
    if (now - (this._lastToast || 0) < 4000) return;
    this._lastToast = now;
    toast(msg);
  },

  build() {
    if (this.built) return;
    /* ===== SOOTHED SYNTH BANK (v3 "no more harshness" rebuild) =====
       The previous bank was edgy by design: buzzing fatsaw pads, white-noise
       hats with a 7.5 kHz sizzle band, a bright echo lead and a clicky kick.
       Kirti flagged it as disturbing, so every voice was replaced with a
       warmer, rounder design: pink-noise hats tucked in a dark band, an FM
       "pillow" pad, a soft-filtered bass, a thumpier kick, and a lead chain
       built to soothe — mellow triangle -> gentle lowpass -> slow vibrato ->
       darkened 4th-note echo, all fed through a master warmth filter at a
       lower ceiling. Same 5-layer API, entirely new timbre. */
    const master = new Tone.Gain(0.72).toDestination();
    /* Master "warmth" shelf: pass 2 pulled the brittle top down hard (5.6k -> 3.4k). */
    const warmth = new Tone.Filter({ type: "lowpass", frequency: 3400, Q: 0.2 });
    warmth.connect(master);
    const limiter = new Tone.Limiter(-9).connect(warmth);   // softer ceiling than before

    // 1. Kick — rounder membrane: slower pitch drop, fewer overtones, more body
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.11, octaves: 2.8,
      oscillator: { type: "sine" },
      envelope: { attack: 0.004, decay: 0.5, sustain: 0, release: 0.25 },
    });
    kick.volume.value = -9; kick.connect(limiter);

    // 2. Hi-Hat — PINK noise in a narrow, dark band: air without the sizzle
    const hatGain = new Tone.Gain(0.2).connect(limiter);
    const hatLP = new Tone.Filter(6200, "lowpass").connect(hatGain);
    const hatHP = new Tone.Filter(3600, "highpass").connect(hatLP);
    const hat = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.008, decay: 0.03, sustain: 0, release: 0.02 },
    });
    hat.volume.value = -17; hat.connect(hatHP);

    // 3. Bass — soft saw under a mellow lowpass; filter punch turned down
    const bassFilter = new Tone.Filter(320, "lowpass").connect(limiter);
    bassFilter.Q.value = 0.7;
    const bass = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.02, decay: 0.25, sustain: 0.45, release: 0.25 },
      filterEnvelope: { attack: 0.06, decay: 0.25, sustain: 0.4, release: 0.3, baseFrequency: 70, octaves: 1.1 },
    });
    bass.volume.value = -10; bass.connect(bassFilter);

    // 4. Chords — warm FM "pillow" pad (no more detuned-saw buzz) + bigger reverb
    const chordReverb = new Tone.Reverb({ decay: 3.6, preDelay: 0.03, wet: 0.5 }).connect(limiter);
    const chordGain = new Tone.Gain(0.66);
    chordGain.connect(limiter); chordGain.connect(chordReverb);
    const chords = new Tone.PolySynth(Tone.FMSynth, {
      maxPolyphony: 6,
      harmonicity: 2, modulationIndex: 1.4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.16, decay: 0.5, sustain: 0.32, release: 1.4 },
      modulation: { type: "triangle" },
      modulationEnvelope: { attack: 0.12, decay: 0.4, sustain: 0.2, release: 0.6 },
    });
    chords.volume.value = -20; chords.connect(chordGain);

    // 5. Lead — the SOOTHE chain: mellow triangle through a rounded lowpass,
    //    a slow light vibrato for warmth, longer attack & release so notes
    //    glide in instead of poking, and a darkened quarter-note echo that
    //    sits behind the note like space rather than repetition.
    /* Pass 3 (lead only): even rounder — LP 1.4k, slower deeper swell,
       gentler vibrato, quieter overall, and the echo's wet mix finally set
       to 0.35 (Tone defaults FeedbackDelay wet to 1.0 — the lead had been
       running almost entirely through the delay tail: that was the residual
       harshness Kirti kept hearing). */
    const leadFilter = new Tone.Filter(1400, "lowpass");
    leadFilter.Q.value = 0.4;
    const leadVib = new Tone.Vibrato({ frequency: 3.2, depth: 0.045, type: "sine" });
    const leadGain = new Tone.Gain(0.7);
    leadGain.connect(limiter);
    const echo = new Tone.FeedbackDelay({ delayTime: "4n", feedback: 0.22, maxDelay: 1.2, wet: 0.35 });
    const echoDamp = new Tone.Filter(1100, "lowpass");   // repeats are duller than the dry note
    echo.connect(echoDamp); echoDamp.connect(limiter);
    leadGain.connect(echo);
    const lead = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.2, decay: 0.45, sustain: 0.45, release: 1.6 },
    });
    lead.volume.value = -16;
    lead.chain(leadFilter, leadVib, leadGain);

    this.synth = { kick, hat, bass, chords, lead };
    /* NOTE: do NOT resetFlags() here. build() runs lazily inside ensure(),
       which can happen *after* selectLibraryTrack() has already armed all
       5 layers on a fresh page: wiping the flags made "Play full beat" a
       silent phantom playback (transport ran, nothing audible). Fresh
       state is already the { } defaults, which read as "off". */
    this.built = true;
    if (!this._watchdog) this._watchdog = setInterval(() => this.tick(), 900);
  },

  audible(layerKey) {
    return this.active[layerKey] &&
           !this.muted[layerKey] &&
           (!Object.values(this.solo).some(Boolean) || this.solo[layerKey]);
  },

  indexHits(track) {
    LAYER_HITS.kick   = new Set(track.kick);
    LAYER_HITS.hat    = new Set(track.hat);
    LAYER_HITS.bass   = new Set(track.bass.map(h => h[0]));
    LAYER_HITS.chords = new Set(track.chords.map(h => h[0]));
    LAYER_HITS.lead   = new Set(track.lead.map(h => h[0]));
  },

  /* Load + play a track on the shared transport. */
  playTrack(track) {
    if (!this.built) return;
    this.track = track;
    this.indexHits(track);
    this.wants = true;
    this.stopAt = null;
    this.onAutoStop = null;
    if (this.loopId !== null) { try { Tone.Transport.clear(this.loopId); } catch (e) {} }
    this.loopId = null;
    /* Bar-aligned clean start: only ever called when the TRACK actually
       changes (or after a stop) — never per answer, so the groove never
       hitches mid-playback. */
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    Tone.Transport.bpm.value = track.bpm;
    try { Tone.Transport.position = "0:0:0"; } catch (e) {}

    this.loopId = Tone.Transport.scheduleRepeat((time) => {
      /* Tick-exact step from the scheduled event time: cannot drift even if
         a scheduler callback fires late after tab-suspend/resume. */
      let s;
      if (Tone.Transport.getTicksAtTime) {
        const ppq = Tone.Transport.PPQ || 480;
        s = Math.floor(Tone.Transport.getTicksAtTime(time) / (ppq / 4)) % 16;
      } else {
        this.step = (this.step + 1) % 16; s = this.step;
      }
      this._lastStep = s;
      const t = this.track;
      if (!t) return;

      if (this.audible("kick") && LAYER_HITS.kick.has(s)) {
        this.synth.kick.triggerAttackRelease("C1", "8n", time, 0.8);
        this.pulse("kick", time);
      }
      if (this.audible("hat")) {
        if (LAYER_HITS.hat.has(s)) {
          this.synth.hat.triggerAttackRelease("16n", time, 0.55);
          this.pulse("hat", time);
        }
      }
      if (this.audible("bass")) {
        const hit = t.bass.find(h => h[0] === s);
        if (hit) { this.synth.bass.triggerAttackRelease(hit[1], hit[2] || "16n", time, 0.8); this.pulse("bass", time); }
      }
      if (this.audible("chords")) {
        const hit = t.chords.find(h => h[0] === s);
        if (hit) { this.synth.chords.triggerAttackRelease(hit[1], hit[2] || "2n", time, 0.65); this.pulse("chords", time); }
      }
      if (this.audible("lead")) {
        const hit = t.lead.find(h => h[0] === s);
        if (hit) { this.synth.lead.triggerAttackRelease(hit[1], hit[2] || "8n", time, 0.5); this.pulse("lead", time); }
      }
    }, "16n");

    Tone.Transport.start();
    setTransportUI(true);
  },

  /* Schedule a visual flash roughly when the note is heard. */
  pulse(layerKey, when) {
    /* Clamp: after a suspend/resume, (when - now) can be huge and the
       queued setTimeouts would burst-flash; 300 ms covers normal lookahead. */
    const delay = Math.min(300, Math.max(0, (when - Tone.now()) * 1000));
    setTimeout(() => flashBar(layerKey), delay);
  },

  pause() {
    this.wants = false;
    if (this.built) Tone.Transport.pause();
    setTransportUI(false);
  },
  resume() {
    if (!this.built || !this.track) return;
    this.wants = true;
    if (Tone.context.state !== "running") { try { Tone.context.resume(); } catch (e) {} }
    if (Tone.Transport.state !== "started") Tone.Transport.start();
    setTransportUI(true);
  },
  stop() {
    if (!this.built) return;
    this.wants = false;
    this.stopAt = null;
    this.onAutoStop = null;
    Tone.Transport.stop();
    setTransportUI(false);
  },
  isPlaying() { return this.built && Tone.Transport.state === "started"; },

  /* Watchdog: while the user wants music, keep the audio context running
     and the transport started. Browsers suspend both on tab-switch, idle
     or autoplay policy — without this the beat silently dies. Also enforces
     the 60s auto-stop deadline for the anime bonus beat. */
  tick() {
    if (!this.built || !this.wants || !window.Tone) return;
    if (this.stopAt && Date.now() >= this.stopAt) {
      const cb = this.onAutoStop;
      this.stop();
      if (cb) cb();
      return;
    }
    if (Tone.context.state !== "running") {
      /* Tone.start() is the autoplay-safe unlock; context.resume() alone
         can reject until a gesture exists (pointerdown listener supplies it). */
      try { const p = Tone.start ? Tone.start() : Tone.context.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    }
    if (Tone.Transport.state !== "started" && this.track) { try { Tone.Transport.start(); } catch (e) {} }
  },
};

/* ---------------- DOM refs ---------------- */
const $ = (sel) => document.querySelector(sel);
const el = {
  dayLabel: $("#dayLabel"), trackTitle: $("#trackTitle"), trackMeta: $("#trackMeta"),
  visualizer: $("#visualizer"), layerProgress: $("#layerProgress"), progressCaption: $("#progressCaption"),
  qCategory: $("#qCategory"), retryBadge: $("#retryBadge"), qCount: $("#qCount"),
  qText: $("#qText"), answers: $("#answers"), feedback: $("#feedback"),
  flashcard: $("#flashcard"), quizArea: $("#quizArea"), doneBanner: $("#doneBanner"), doneSub: $("#doneSub"),
  streakCount: $("#streakCount"), streakChip: $("#streakChip"), libCount: $("#libCount"),
  btnLibrary: $("#btnLibrary"), libraryModal: $("#libraryModal"), mixList: $("#mixList"),
  mixPlayer: $("#mixPlayer"), playerTitle: $("#playerTitle"), layerToggles: $("#layerToggles"),
  btnPlayerPlay: $("#btnPlayerPlay"), btnPlayerStop: $("#btnPlayerStop"), btnCloseLibrary: $("#btnCloseLibrary"),
  completeModal: $("#completeModal"), completeTrackName: $("#completeTrackName"),
  streakLine: $("#streakLine"), cassetteDay: $("#cassetteDay"), confetti: $("#confetti"),
  btnKeepListening: $("#btnKeepListening"), btnOpenLibraryDone: $("#btnOpenLibraryDone"),
  btnTransport: $("#btnTransport"), tIcon: $("#tIcon"), tLabel: $("#tLabel"),
  btnPracticeAgain: $("#btnPracticeAgain"), toast: $("#toast"),
  /* 7-day-streak anime bonus beat */
  btnBonusOpen: $("#btnBonusOpen"),
  bonusModal: $("#bonusModal"), btnBonusPlay: $("#btnBonusPlay"),
  btnBonusStop: $("#btnBonusStop"), btnBonusClose: $("#btnBonusClose"),
  bonusCount: $("#bonusCount"), bonusFill: $("#bonusFill"), bonusNote: $("#bonusNote"),
  /* Round 6: Subject Vault + Profile */
  btnVault: $("#btnVault"), vaultModal: $("#vaultModal"), vaultChips: $("#vaultChips"),
  vaultList: $("#vaultList"), vaultCount: $("#vaultCount"), btnCloseVault: $("#btnCloseVault"),
  btnProfile: $("#btnProfile"), profileModal: $("#profileModal"), btnCloseProfile: $("#btnCloseProfile"),
  profAvatar: $("#profAvatar"), profName: $("#profName"), profSince: $("#profSince"),
  profStats: $("#profStats"), profMastery: $("#profMastery"),
};

/* ---------------- Visualizer ---------------- */
const barEls = {};
function buildVisualizer() {
  el.visualizer.innerHTML = "";
  LAYERS.forEach((l, i) => {
    const bar = document.createElement("div");
    bar.className = "vbar";
    bar.dataset.layer = l.key;
    bar.innerHTML =
      `<div class="tube"><span class="num">${i + 1}</span><div class="fill"></div></div>` +
      `<span class="vlabel">${l.short}</span>`;
    el.visualizer.appendChild(bar);
    barEls[l.key] = bar;
  });
}
function flashBar(layerKey) {
  const bar = barEls[layerKey];
  if (!bar || !bar.classList.contains("active")) return;
  const fill = bar.querySelector(".fill");
  const h = 45 + Math.round(Math.random() * 50);
  fill.classList.add("flash");
  fill.style.height = h + "%";
  clearTimeout(fill._t);
  fill._t = setTimeout(() => {
    fill.style.height = "26%";
    setTimeout(() => fill.classList.remove("flash"), 140);
  }, 130);
}
function setBarActive(layerKey, on) {
  const bar = barEls[layerKey];
  if (!bar) return;
  bar.classList.toggle("active", on);
  bar.classList.toggle("idle", on);
  const fill = bar.querySelector(".fill");
  fill.style.height = on ? "26%" : "14%";
}
function renderProgress() {
  el.layerProgress.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const d = document.createElement("span");
    d.className = "ldot" + (i < game.unlocked ? " on" : "");
    el.layerProgress.appendChild(d);
  }
  el.progressCaption.textContent = `${game.unlocked} of 5 layers unlocked`;
}

/* ---------------- Game state ---------------- */
const game = {
  trackIndex: 0,
  track: null,
  queue: [],        // remaining questions (objects, may include retried marks)
  current: null,
  unlocked: 0,
  busy: false,
  done: false,
};

function newSession() {
  /* Roll to the rotated beat for this practice session (see rotationIndex). */
  game.trackIndex = rotationIndex();
  game.track = TRACKS[game.trackIndex];
  el.trackTitle.textContent = game.track.name;
  el.trackMeta.innerHTML =
    `${game.track.genre} <span class="bpm-dot">\u25CF</span> ${game.track.bpm} BPM <span class="bpm-dot">\u25CF</span> 5 layers to unlock \u00B7 ${BANK.length.toLocaleString()}-card bank`;
  game.queue = beatQuestions();
  game.current = null;
  game.unlocked = 0;
  game.busy = false;
  game.done = false;
  Audio.resetFlags();
  LAYERS.forEach(l => setBarActive(l.key, false));
  renderProgress();
  el.dayLabel.textContent = `Beat Rotation \u00B7 Day ${game.trackIndex + 1}/7 \u00B7 Set #${setNumber()} of the bank`;
  updateBankInfo();
  nextQuestion();
}

function nextQuestion() {
  if (game.queue.length === 0) return;
  game.current = game.queue.shift();
  renderQuestion();
}

function renderQuestion() {
  const q = game.current;
  if (!q) return;
  /* Round 6: difficulty chip beside the subject (basic -> advanced). */
  el.qCategory.textContent = q.cat + (q.d ? "  \u00B7  " + ["", "Basic", "Intermediate", "Advanced"][q.d] : "");
  el.qCategory.dataset.cat = q.cat;
  el.retryBadge.classList.toggle("hidden", !q.retried);
  el.qCount.textContent = `Set #${setNumber()} · Q${5 - game.queue.length} / 5`;
  el.qText.textContent = q.q; /* raw text: bank stems contain literal <tag> chars */
  el.feedback.textContent = "";
  el.feedback.className = "feedback";

  el.answers.innerHTML = "";
  q.opts.forEach((opt, i) => {
    const b = document.createElement("button");
    b.className = "ans";
    b.type = "button";
    const key = document.createElement("span");
    key.className = "key";
    key.textContent = "ABCD"[i];
    const label = document.createElement("span");
    label.textContent = opt;
    b.appendChild(key); b.appendChild(label);
    b.addEventListener("click", () => handleAnswer(i, b));
    el.answers.appendChild(b);
  });
}

async function handleAnswer(choiceIdx, btn) {
  if (game.busy || game.done || !game.current) return;
  game.busy = true;

  // First user interaction anywhere: unlock mobile audio.
  const audioOK = await Audio.ensure();

  const q = game.current;
  const buttons = [...el.answers.querySelectorAll(".ans")];
  buttons.forEach(b => (b.disabled = true));

  if (choiceIdx === q.a) {
    /* A full-track preview from the Play button never outlives a CORRECT
       answer: drop it here so layers join one-by-one from this moment.
       (Wrong answers keep the preview playing — nothing dies silently.) */
    const wasPreview = Audio.preview;
    if (wasPreview) {
      Audio.preview = false;
      LAYERS.forEach(l => { Audio.active[l.key] = false; setBarActive(l.key, false); });
    }
    btn.classList.add("correct");
    /* Round 6: explain the answer right in the feedback line. */
    state.answered = (state.answered | 0) + 1;
    state.correct = (state.correct | 0) + 1;
    if (q.bid != null) state.seen[q.bid] = 1;
    saveState();
    el.feedback.textContent = q.e
      ? "Correct! " + q.e
      : "Correct! Next layer armed\u2026";
    el.feedback.classList.add("good");
    if (q.e) el.feedback.classList.add("explain");

    game.unlocked++;
    const layerKey = LAYERS[game.unlocked - 1].key;
    Audio.active[layerKey] = true;
    setBarActive(layerKey, true);
    renderProgress();

    if (audioOK || Audio.built) {
      /* Game owns the transport. But if the SAME track is already playing,
         leave the groove untouched — new layers simply join on their next
         pattern hit. (Previously every correct answer reloaded the track,
         which jolted the beat mid-bar: the "inconsistent music".) */
      Audio.mode = "game";
      Audio.muted = {}; Audio.solo = {};
      if (Audio.track !== game.track || !Audio.isPlaying() || (wasPreview && game.unlocked === 1)) {
        Audio.playTrack(game.track);
      }
    }

    setTimeout(() => {
      game.busy = false;
      if (game.unlocked >= 5) completeTrack();
      else nextQuestion();
    }, q.e ? 2100 : 750);
  } else {
    /* Wrong: preview (if any) simply keeps running; nothing to clean. */
    btn.classList.add("wrong");
    buttons[q.a] && buttons[q.a].classList.add("reveal"); // brief correct-answer tease
    /* Round 6: teach even on misses — answer + why, before the shuffle-back. */
    state.answered = (state.answered | 0) + 1;
    saveState();
    el.feedback.textContent = q.e
      ? "Answer: " + q.opts[q.a] + " \u2014 " + q.e
      : "Not quite \u2014 that question goes back in the shuffle.";
    el.feedback.classList.add("bad");
    if (q.e) el.feedback.classList.add("explain");
    el.flashcard.classList.add("shake");
    setTimeout(() => el.flashcard.classList.remove("shake"), 450);

    // Mark + insert randomly back into the remaining queue.
    q.retried = true;
    const pos = Math.floor(Math.random() * (game.queue.length + 1));
    game.queue.splice(pos, 0, q);

    setTimeout(() => {
      buttons.forEach(b => b.classList.remove("reveal"));
      game.busy = false;
      nextQuestion();
    }, q.e ? 2400 : 1100);
  }
}

/* ---------------- Completion + streak ---------------- */
function completeTrack() {
  game.done = true;

  /* The 5 cards of this beat are now permanently consumed: each became
     "mastered" when answered correctly, so they left the unseen queue. */
  state.setsDone = (state.setsDone | 0) + 1;
  saveState();

  /* This set is done: the NEXT session rolls to the next day of the 7-track
     rotation, so repeated practice visibly progresses instead of repeating
     the same "day". (The calendar streak is separate and grows tomorrow.) */
  state.beatDate = TODAY;
  state.beatsToday = (state.beatsToday | 0) + 1;
  saveState();

  const alreadyToday = state.mixtape.some(m => m.trackId === game.trackIndex && m.date === TODAY);

  if (!alreadyToday) {
    // Streak: +1 if last completion was yesterday, reset to 1 otherwise.
    if (state.lastDate === YESTERDAY) state.streak += 1;
    else if (state.lastDate !== TODAY) state.streak = 1;
    state.lastDate = TODAY;
    state.mixtape.push({ trackId: game.trackIndex, date: TODAY });
    if ((state.bestStreak | 0) < state.streak) state.bestStreak = state.streak;
    saveState();
    el.streakChip.classList.remove("bump");
    void el.streakChip.offsetWidth;
    el.streakChip.classList.add("bump");
  }
  refreshHeader();
  updateBankInfo();

  /* --- 7-day streak anime reward: fires at streak 7, 14, 21, ... ------ */
  const bonusEligible = state.streak > 0 && state.streak % 7 === 0 &&
                        state.lastBonusStreak !== state.streak;
  el.btnBonusOpen.classList.toggle("hidden", !bonusEligible);
  if (bonusEligible && !state.mixtape.some(m => m.trackId === 7 && m.date === TODAY)) {
    state.mixtape.push({ trackId: 7, date: TODAY, bonus: true }); // replayable forever
    saveState();
    refreshHeader();
  }

  el.completeTrackName.textContent = game.track.name;
  el.streakLine.innerHTML = alreadyToday
    ? `Beat recorded! Streak stays at <b>${state.streak}</b> today \u2014 finish a beat tomorrow to grow it to Day ${state.streak + 1}`
    : `Streak: <b>${state.streak}</b> day${state.streak === 1 ? "" : "s"} \u2022 saved to your Mixtape Library`;
  if (bonusEligible) el.streakLine.innerHTML += ' \u2022 <b class="sakura">&#127880; Anime bonus beat unlocked!</b>';
  el.cassetteDay.textContent = String(game.trackIndex + 1);
  el.quizArea.classList.add("hidden");
  el.doneBanner.classList.remove("hidden");
  const nextIdx = rotationIndex();   /* beatsToday already incremented: the beat you'll get next */
  el.doneSub.textContent = "Next beat: \u201C" + TRACKS[nextIdx].name + "\u201D (Day " + (nextIdx + 1) +
    "/7) \u00B7 5 fresh cards from the " + BANK.length.toLocaleString() + "-question bank.";

  show(el.completeModal);
  spawnConfetti();
}

function spawnConfetti() {
  el.confetti.innerHTML = "";
  const colors = LAYERS.map(l => l.color).concat(["#ffffff"]);
  for (let i = 0; i < 36; i++) {
    const bit = document.createElement("i");
    bit.style.left = Math.random() * 100 + "%";
    bit.style.background = colors[i % colors.length];
    bit.style.animationDuration = (1.6 + Math.random() * 1.8) + "s";
    bit.style.animationDelay = (Math.random() * 0.7) + "s";
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    el.confetti.appendChild(bit);
  }
}

/* Footer: bank size + progress across mastery laps. */
function updateBankInfo() {
  const n = document.getElementById("bankInfo");
  if (!n) return;
  const mastered = Object.keys(state.seen || {}).length;
  const fresh = BANK.length - mastered;
  n.textContent = BANK.length.toLocaleString() + "-question bank \u00B7 " +
    mastered.toLocaleString() + " mastered \u00B7 " +
    (fresh > 0 ? fresh.toLocaleString() + " fresh cards left — no repeats"
               : "bank exhausted — review rotation");
}

/* ---------------- Mixtape Library ---------------- */
let libSelected = null; // trackId currently shown in player

function refreshHeader() {
  el.streakCount.textContent = state.streak;
  el.libCount.textContent = state.mixtape.length;
  if (el.vaultCount) el.vaultCount.textContent = Object.keys(state.seen || {}).length;
}

function renderLibrary() {
  el.mixList.innerHTML = "";
  if (state.mixtape.length === 0) {
    el.mixList.innerHTML =
      `<div class="mix-empty"><span class="big">\u25C8</span>No beats yet.<br>Unlock all 5 layers today to record your first mixtape!</div>`;
    el.mixPlayer.classList.add("hidden");
    libSelected = null;
    return;
  }
  // newest first
  [...state.mixtape].reverse().forEach(entry => {
    const t = TRACKS[entry.trackId];
    const item = document.createElement("button");
    item.type = "button";
    item.className = "mix-item" + (libSelected === entry.trackId ? " selected" : "");
    item.innerHTML =
      `<div class="mix-thumb" style="background:linear-gradient(135deg,${LAYERS[entry.trackId % 5].color},${LAYERS[(entry.trackId + 2) % 5].color})">${entry.bonus ? "\uD83C\uDF38" : entry.trackId + 1}</div>` +
      `<div class="mix-info"><div class="mix-name">${entry.bonus ? "\u2605 " : ""}${t.name}</div>` +
      `<div class="mix-sub">${t.genre} \u2022 ${t.bpm} BPM \u2022 recorded ${entry.date}</div></div>` +
      `<span class="mix-play-hint">\u25B6 Open</span>`;
    item.addEventListener("click", () => selectLibraryTrack(entry.trackId));
    el.mixList.appendChild(item);
  });
}

function selectLibraryTrack(trackId) {
  const t = TRACKS[trackId];
  libSelected = trackId;
  renderLibrary();
  el.mixPlayer.classList.remove("hidden");
  el.playerTitle.textContent = `${t.name} — ${t.genre} · ${t.bpm} BPM`;

  Audio.resetFlags();
  LAYERS.forEach(l => (Audio.active[l.key] = true));

  el.layerToggles.innerHTML = "";
  LAYERS.forEach((l, i) => {
    const row = document.createElement("div");
    row.className = "lt-row";
    row.dataset.layer = l.key;
    row.innerHTML =
      `<span class="lt-dot" style="background:${l.color};box-shadow:0 0 8px ${l.color}"></span>` +
      `<span class="lt-name">${i + 1}. ${l.name}</span>` +
      `<button class="lt-btn" data-mode="mute" title="Mute layer">M</button>` +
      `<button class="lt-btn" data-mode="solo" title="Solo layer">S</button>`;
    row.querySelector('[data-mode="mute"]').addEventListener("click", () => toggleLayerFlag("muted", l.key, row));
    row.querySelector('[data-mode="solo"]').addEventListener("click", () => toggleLayerFlag("solo", l.key, row));
    el.layerToggles.appendChild(row);
  });
  updateLibraryPlayLabel();
}

async function toggleLayerFlag(kind, layerKey, row) {
  Audio[kind][layerKey] = !Audio[kind][layerKey];   /* instant UI state */
  syncLayerRows();
  await Audio.ensure();
  if (Audio.isPlaying()) pulseAllActive(); // immediate visual refresh on toggle
}

function syncLayerRows() {
  [...el.layerToggles.children].forEach(row => {
    const k = row.dataset.layer;
    const mBtn = row.querySelector('[data-mode="mute"]');
    const sBtn = row.querySelector('[data-mode="solo"]');
    mBtn.classList.toggle("on-mute", !!Audio.muted[k]);
    sBtn.classList.toggle("on-solo", !!Audio.solo[k]);
    row.classList.toggle("dimmed", !Audio.audible(k) && Audio.isPlaying());
  });
}

function pulseAllActive() {
  LAYERS.forEach(l => { if (Audio.audible(l.key)) flashBar(l.key); });
  syncLayerRows();
}

async function playerPlay() {
  if (libSelected === null) return;
  const ok = await Audio.ensure();
  if (!ok && !Audio.built) return;   /* locked context: still schedule; watchdog + next tap bring sound */
  Audio.mode = "library";
  /* The library player always performs the FULL saved beat: re-arm every
     layer right here too, so first-play-after-reload can never end up
     silent even if selection happened before the engine existed. */
  LAYERS.forEach(l => (Audio.active[l.key] = true));
  Audio.playTrack(TRACKS[libSelected]);
  syncLayerRows();
  updateLibraryPlayLabel();
}

function updateLibraryPlayLabel() {
  el.btnPlayerPlay.innerHTML = Audio.isPlaying() && Audio.mode === "library"
    ? "\u23F8 Restart beat"
    : "\u25B6 Play full beat";
}

function playerStop() {
  Audio.stop();
  syncLayerRows();
  updateLibraryPlayLabel();
}

/* ---------------- Transport control (main screen) ---------------- */
async function toggleTransport() {
  const ok = await Audio.ensure();
  if (!ok && !Audio.built) return;   /* same autoplay-lock fallback as playTrack paths */
  if (Audio.isPlaying()) {
    Audio.pause();
  } else if (game.unlocked === 0) {
    /* "Play today's track" before answering anything: instead of a dead
       toast, preview the FULL daily track now (the library player can do
       this too, so refusing felt broken). Answering demobilises the
       preview back to the staged unlock flow (see handleAnswer). */
    Audio.mode = "game";
    Audio.muted = {}; Audio.solo = {};
    Audio.preview = true;
    LAYERS.forEach(l => { Audio.active[l.key] = true; setBarActive(l.key, true); });
    Audio.playTrack(game.track);
    toast("Previewing the full beat \u2014 answer to build it layer by layer! \uD83C\uDFB5");
  } else {
    if (Audio.mode === "library") {
      Audio.mode = "game";
      Audio.muted = {}; Audio.solo = {};
      if (Audio.track !== game.track) Audio.playTrack(game.track); /* steal back, fresh bar */
      else Audio.resume();                                          /* already the game track: just resume */
    } else {
      Audio.resume();
    }
  }
}

function setTransportUI(playing) {
  el.btnTransport.classList.toggle("playing", playing);
  el.btnTransport.setAttribute("aria-pressed", String(playing));
  el.tIcon.innerHTML = playing ? "&#9632;" : "&#9654;";
  el.tLabel.textContent = playing ? "Stop" : "Play";
}

/* ---------------- 7-day streak: anime bonus beat (exactly 60 s) ----------------
   Every time the streak lands on a multiple of 7 (7, 14, 21\u2026) the completion
   modal offers "Sakura Finale" \u2014 a special anime J-Rock instrumental built from
   the same synth engine. It auto-stops at 60 s via the Audio watchdog. */
let bonusTimer = null;

function bonusResetUI() {
  el.bonusNote.classList.add("hidden");
  el.bonusCount.textContent = "60";
  el.bonusFill.style.width = "0%";
  el.btnBonusPlay.classList.remove("hidden");
  el.btnBonusStop.classList.add("hidden");
}

function openBonusModal() {
  hide(el.completeModal);
  bonusResetUI();
  show(el.bonusModal);
}

async function startBonusBeat() {
  await Audio.ensure();
  if (!Audio.built) { toast("Audio unavailable \u2014 reconnect and try again."); return; }
  state.lastBonusStreak = state.streak;
  saveState();

  Audio.mode = "bonus";
  Audio.resetFlags();
  LAYERS.forEach(l => { Audio.active[l.key] = true; setBarActive(l.key, true); });
  Audio.playTrack(TRACKS[7]);
  Audio.stopAt = Date.now() + 60000;          // one minute, then silence
  Audio.onAutoStop = () => bonusFinished();

  el.btnBonusPlay.classList.add("hidden");
  el.btnBonusStop.classList.remove("hidden");
  el.bonusNote.classList.add("hidden");
  const t0 = Date.now();
  clearInterval(bonusTimer);
  bonusTimer = setInterval(() => {
    const left = Math.max(0, 60 - Math.floor((Date.now() - t0) / 1000));
    el.bonusCount.textContent = String(left);
    el.bonusFill.style.width = (((60 - left) / 60) * 100).toFixed(1) + "%";
  }, 250);
}

function bonusFinished() {                     // auto-stop at 60 s (or manual stop)
  clearInterval(bonusTimer); bonusTimer = null;
  Audio.wants = false; Audio.stopAt = null; Audio.onAutoStop = null;
  if (Audio.isPlaying()) Audio.stop();
  el.bonusCount.textContent = "0";
  el.bonusFill.style.width = "100%";
  el.btnBonusStop.classList.add("hidden");
  el.btnBonusPlay.classList.remove("hidden");
  el.bonusNote.classList.remove("hidden");
  toast("Sakura Finale saved \u2014 replay it anytime from your Mixtape Library \uD83C\uDF38");
}

function closeBonusBeat() {                     // stop + restore the game's visual state
  clearInterval(bonusTimer); bonusTimer = null;
  Audio.stopAt = null; Audio.onAutoStop = null;
  if (Audio.isPlaying()) Audio.stop();
  hide(el.bonusModal);
  Audio.resetFlags();
  LAYERS.forEach((l, i) => { if (i < game.unlocked) Audio.active[l.key] = true; setBarActive(l.key, i < game.unlocked); });
}

/* ---------------- Modals + toast ---------------- */
const show = (m) => m.classList.remove("hidden");
const hide = (m) => m.classList.add("hidden");

let toastTimer = null;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add("hidden"), 2600);
}

/* ---------------- Wiring ---------------- */
function openLibrary() { renderLibrary(); show(el.libraryModal); }

el.btnLibrary.addEventListener("click", openLibrary);
el.btnCloseLibrary.addEventListener("click", () => { hide(el.libraryModal); });
el.btnPlayerPlay.addEventListener("click", playerPlay);
el.btnPlayerStop.addEventListener("click", playerStop);
el.btnTransport.addEventListener("click", toggleTransport);

el.btnKeepListening.addEventListener("click", () => { hide(el.completeModal); toast("Beat saved to your Mixtape Library \uD83C\uDF9F"); });
el.btnOpenLibraryDone.addEventListener("click", () => {
  hide(el.completeModal);
  openLibrary();
  if (libSelected === null) selectLibraryTrack(game.trackIndex);
});

el.btnPracticeAgain.addEventListener("click", () => {
  hide(el.completeModal);
  el.doneBanner.classList.add("hidden");
  el.quizArea.classList.remove("hidden");
  newSession();
  Audio.stop();
  setTransportUI(false);
});

/* 7-day-streak anime bonus beat */
el.btnBonusOpen.addEventListener("click", openBonusModal);
el.btnBonusPlay.addEventListener("click", startBonusBeat);
el.btnBonusStop.addEventListener("click", bonusFinished);
el.btnBonusClose.addEventListener("click", closeBonusBeat);

[el.libraryModal, el.completeModal].forEach(m =>
  m.addEventListener("click", (e) => { if (e.target === m) hide(m); })
);

/* ---------------- Subject Vault (round 6) ----------------
   Questions you've answered correctly are filed here by subject, each with
   the correct option highlighted, the explanation, and a difficulty badge.
   Sorted basic -> advanced inside every subject. All built via textContent
   (bank stems contain literal <tag> characters). */
let vaultCat = "all";
const DIFF_LABEL = ["", "Basic", "Intermediate", "Advanced"];

function vaultSeenIds() {
  const seen = state.seen || {};
  return Object.keys(seen).map(Number).filter(i => BANK[i]);
}
function vaultCatCounts(ids) {
  const counts = {};
  ids.forEach(i => { const c = BANK[i].cat; counts[c] = (counts[c] || 0) + 1; });
  return counts;
}
function mk(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function renderVault() {
  const ids = vaultSeenIds();
  const counts = vaultCatCounts(ids);
  el.vaultCount.textContent = ids.length;

  el.vaultChips.innerHTML = "";
  const defs = [{ k: "all", label: "All subjects", n: ids.length }]
    .concat(Object.keys(counts).sort().map(k => ({ k, label: k, n: counts[k] })));
  defs.forEach(d => {
    const b = mk("button", "v-chip" + (vaultCat === d.k ? " on" : ""));
    b.type = "button";
    b.textContent = d.n ? `${d.label} (${d.n})` : "";
    if (!d.n) { b.disabled = true; b.textContent = `${d.label} (0)`; }
    b.addEventListener("click", () => { vaultCat = d.k; renderVault(); });
    el.vaultChips.appendChild(b);
  });

  const list = ids
    .filter(i => vaultCat === "all" || BANK[i].cat === vaultCat)
    .sort((x, y) => ((BANK[x].d || 2) - (BANK[y].d || 2)) || (BANK[x].q < BANK[y].q ? -1 : 1));
  el.vaultList.innerHTML = "";
  if (!list.length) {
    el.vaultList.appendChild(mk("div", "vault-empty",
      "Nothing filed yet — answer questions correctly in a beat and they land here with answers + explanations."));
    return;
  }
  const shown = list.slice(0, 250); /* keep the DOM light on phones */
  shown.forEach(i => {
    const q = BANK[i];
    const card = mk("div", "v-card");
    const meta = mk("div", "v-meta");
    const cat = mk("span", "chip", q.cat); cat.dataset.cat = q.cat;
    meta.appendChild(cat);
    meta.appendChild(mk("span", "v-diff d" + (q.d || 2), DIFF_LABEL[q.d] || "Intermediate"));
    card.appendChild(meta);
    card.appendChild(mk("p", "v-q", q.q));
    const opts = mk("ul", "v-opts");
    q.opts.forEach((o, j) => {
      const li = mk("li", j === q.a ? "correct" : "", ("ABCD"[j]) + ".  " + o + (j === q.a ? "  \u2713" : ""));
      opts.appendChild(li);
    });
    card.appendChild(opts);
    if (q.e) card.appendChild(mk("p", "v-exp", "\uD83D\uDCA1 " + q.e));
    el.vaultList.appendChild(card);
  });
  if (list.length > shown.length)
    el.vaultList.appendChild(mk("p", "vault-more", `+ ${list.length - shown.length} more in this subject — filter by topic to narrow it down.`));
}
function openVault() { renderVault(); show(el.vaultModal); }

/* ---------------- Profile (round 6) ---------------- */
function renderProfile() {
  const nm = (state.name || "").trim();
  el.profAvatar.textContent = nm ? nm[0].toUpperCase() : "\u266B";
  el.profName.value = state.name || "";
  el.profSince.textContent = "Member since " + (state.created || TODAY) +
    " \u00B7 saved on this device";
  const beats = state.setsDone | 0;
  const acc = state.answered ? Math.round(100 * (state.correct | 0) / state.answered) : 0;
  const mastered = vaultSeenIds().length;
  const stats = [
    ["Current streak", state.streak + "d"],
    ["Best streak", (state.bestStreak | 0) + "d"],
    ["Beats completed", String(beats)],
    ["Mixtapes", String(state.mixtape.length)],
    ["Answers given", String(state.answered | 0)],
    ["Accuracy", acc + "%"],
    ["Cards mastered", mastered + " / " + BANK.length.toLocaleString()],
    ["Mastery laps", String(state.lap | 0)],
  ];
  el.profStats.innerHTML = "";
  stats.forEach(([label, val]) => {
    const cell = mk("div", "p-stat");
    cell.appendChild(mk("b", null, val));
    cell.appendChild(mk("span", null, label));
    el.profStats.appendChild(cell);
  });
  const tot = {}, got = {};
  BANK.forEach((q, i) => {
    tot[q.cat] = (tot[q.cat] || 0) + 1;
    if ((state.seen || {})[i]) got[q.cat] = (got[q.cat] || 0) + 1;
  });
  el.profMastery.innerHTML = "";
  Object.keys(tot).sort().forEach(cat => {
    const n = got[cat] || 0;
    const pct = Math.round(100 * n / tot[cat]);
    const row = mk("div", "m-row");
    row.appendChild(mk("span", "m-name", cat));
    const bar = mk("div", "m-bar");
    const fill = mk("i");
    fill.style.width = pct + "%";
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(mk("span", "m-num", n + "/" + tot[cat]));
    el.profMastery.appendChild(row);
  });
}
function openProfile() { renderProfile(); show(el.profileModal); }

el.btnVault.addEventListener("click", openVault);
el.btnCloseVault.addEventListener("click", () => hide(el.vaultModal));
el.vaultModal.addEventListener("click", (e) => { if (e.target === el.vaultModal) hide(el.vaultModal); });
el.btnProfile.addEventListener("click", openProfile);
el.btnCloseProfile.addEventListener("click", () => hide(el.profileModal));
el.profileModal.addEventListener("click", (e) => { if (e.target === el.profileModal) hide(el.profileModal); });
el.profName.addEventListener("input", () => {
  state.name = el.profName.value.slice(0, 24);
  const nm = state.name.trim();
  el.profAvatar.textContent = nm ? nm[0].toUpperCase() : "\u266B";
  saveState();
});

el.bonusModal.addEventListener("click", (e) => { if (e.target === el.bonusModal) closeBonusBeat(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hide(el.libraryModal); hide(el.completeModal);
    if (!el.bonusModal.classList.contains("hidden")) closeBonusBeat();
    hide(el.vaultModal); hide(el.profileModal);
  }
});

/* Keep the music consistent: browsers suspend the audio context on tab
   switch / idle. Re-unlock on return, and on any tap as a bonus gesture. */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Audio.built && Audio.wants && window.Tone) {
    try { const p = Tone.start ? Tone.start() : Tone.context.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
    if (Tone.Transport.state !== "started" && Audio.track) { try { Tone.Transport.start(); } catch (e) {} }
  }
});
document.addEventListener("pointerdown", () => {
  if (Audio.built && window.Tone && Tone.context.state !== "running") {
    try { const p = Tone.start ? Tone.start() : Tone.context.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  }
});

/* ---------------- Boot ---------------- */
function boot() {
  buildVisualizer();

  if (!BANK.length) {
    el.qText.textContent = "Question bank failed to load (questions.js missing?).";
    return;
  }
  /* Resume the exact card order of the saved mastery lap. */
  if ((state.lap || 0) !== 0) DECK = buildDeck(BANK, state.lap, TODAY, state.seen);
  if (typeof state.created !== "string" || !state.created) { state.created = TODAY; saveState(); }

  game.trackIndex = rotationIndex();
  game.track = TRACKS[game.trackIndex];

  el.dayLabel.textContent = `Beat Rotation \u00B7 Day ${game.trackIndex + 1}/7 \u00B7 Set #${setNumber()} of the bank`;
  el.trackTitle.textContent = game.track.name;
  el.trackMeta.innerHTML =
    `${game.track.genre} <span class="bpm-dot">\u25CF</span> ${game.track.bpm} BPM <span class="bpm-dot">\u25CF</span> 5 layers to unlock \u00B7 ${BANK.length.toLocaleString()}-card bank`;

  refreshHeader();
  updateBankInfo();

  /* With a 1,000+ card bank the daily beat can be replayed all day long:
     every completed set advances the shared deck cursor; the streak and the
  mixtape entry are still granted only once per calendar date. */
  newSession();

  /* The static markup starts labelled "Stop" — reflect reality so the
     button honestly reads "Play" until music is actually running. */
  setTransportUI(Audio.isPlaying());
}
boot();
  BANK.forEach(q => { if (typeof q.e === "string") q.e = dec(q.e); });
function setNumberOld_unused() {}
