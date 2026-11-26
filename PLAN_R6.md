# ROUND 6 PLAN (2026-11-26 22:17 IST) — user's 6 asks
1. "same 5 questions everyday" -> DATE-SALTED DECK: buildDeck seed currently
   hashStr("deck|lap"+lap) ONLY -> same order/lap = same 5 daily unless cursor moves.
   FIX: seed "deck|lap"+lap+"|"+TODAY (pass dateKey); each calendar day = unique 5-per-day
   sets. Wrap logic unchanged. Update both call sites: line ~115 top-level DECK,
   ~126 nextBeat wrap, ~1042 boot.
2. "explain the answers" -> add `e` (explanation) + `d` (difficulty 1-3) to every bank item
   via BATCH LLM pass (builtin-llm-models skill READ; use manus-node or sandbox python).
   Pipeline: enrich_questions.mjs reads questions.js (window shim), builds items
   "cat|q|opts|correctOpt" -> LLM JSON schema {e,d} -> writes /home/ubuntu/musicomp/enrich.jsonl
   (checkpointed by index) -> final step rewrites questions.js with e,d fields.
   Pilot 30 first, then full 1,059 at low reasoning. UI: show explanation in feedback after
   EACH answer (correct AND wrong), difficulty chip on question, e/d guarded (fallback if missing).
3. "questions saved like mixtape library; separate libraries per subject with actual answer+
   explanation, basic->advanced" -> SUBJECT VAULT modal: header button #btnVault; category
   tabs/chips (17 cats); each card: question, 4 options w/ correct highlighted, explanation,
   difficulty badge, ✓ when answered correctly (state.seen[qid]=1 qid=bank index). Sort by
   difficulty asc inside category. Show seen/total per category.
4. "user profile to save progress" -> PROFILE modal #btnProfile: editable name (state.name,
   prompt or inline input), member-since (state.created dateKey once), stats: streak, best
   (compute? store state.bestStreak updated on completion), beats completed = state.cursor/5,
   mixtape count, answered count (state.seen size + misses? track state.answered, state.correct
   counters increment in handleAnswer), accuracy %, per-category mastery mini-bars from seen map.
5. "replace beats with soother ones, best for neural networks" -> rewrite TRACKS[0..6] as 7
   calm focus beats (60-92 BPM, sparse kick, soft hats, warm pads, gentle lead): names like
   Delta Waves/Theta Drift/Aurora Idle/Paper Planets/Deep Focus/Synth Rain/Slow Orbit. Genres:
   Ambient, Lo-Fi, Downtempo, Study Pop... keep same data shape {id,name,genre,bpm,kick,hat,
   bass,chords,lead}; Sakura id 7 UNTOUCHED (still 7-day-streak anime reward, still 60s auto-stop).
6. anime every 7 streak: already done — verify still wired after track swap (rotation uses
   TRACKS indices 0-6; bonus index 7 untouched by design).
+ Bump sw CACHE v5->v6. node --check, browser verify (day-salt, explanation shows, vault,
  profile, new beats play softly, console clean). Update README + PROGRESS. Commit+push
  (message file trick, Co-authored-by trailer). Session pollution: fresh exec session if
  rgb: junk. Browser: trusted browser_click for gesture; IIFE single-expression console eval.
Repo: Kirti-Vishwakarma05/MusiComp main@2e26343. Serve: http://localhost:8000 (cwd
/home/ubuntu/musicomp). Preview: https://8000-ix3exjroipy3mn5to722q-d337e669.sg2.manus.computer/
