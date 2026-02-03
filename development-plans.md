# Word Hunt — Development Plans

> A comprehensive development report covering new game modes, progression systems, data tracking, UI/UX improvements, audio strategy, and a phased implementation roadmap.

---

## Table of Contents

1. [New Game Modes](#1-new-game-modes)
2. [Progression & Scaffolding System](#2-progression--scaffolding-system)
3. [Data Tracking & Adaptive Learning](#3-data-tracking--adaptive-learning)
4. [UI/UX Improvements](#4-uiux-improvements)
5. [Audio Recording Strategy](#5-audio-recording-strategy)
6. [Phased Implementation Roadmap](#6-phased-implementation-roadmap)
7. [Technical Architecture](#7-technical-architecture)
8. [Appendices](#8-appendices)

---

## 1. New Game Modes

Six new modes, ordered by pedagogical sequence — each builds on the skills developed by the previous one.

### 1.1 Sound Match (Letter-Sound Correspondence)

**What it is:** Dad's voice says a phoneme (not a letter name) — for example, "/s/ as in snake" — and the child taps the correct letter from a scattered set. This is the inverse of the current Alphabet mode: instead of hearing a letter name and finding it, the child hears the *sound* a letter makes and maps it to the written symbol.

A second sub-mode reverses direction: the screen shows a letter, and dad's voice plays two or three sounds. The child taps the speaker button for the correct sound. This reinforces the bidirectional bond between grapheme and phoneme.

**Evidence-Based Rationale:** Ehri's research on orthographic mapping demonstrates that reading acquisition depends on bonding spellings to their pronunciations. The NRP (2000) found that systematic phonics instruction (teaching letter-sound correspondences explicitly) produced significant effects on word reading accuracy. Starting with high-utility letters (s, a, t, p, i, n, m, d) follows the sequence used in programs like Jolly Phonics and UFLI, ensuring early success by prioritising letters that combine into the most decodable words.

**Dad-Voice Integration:**
- Dad records each phoneme with a keyword: "sss… snake… sss" or simply "/m/… /m/"
- Dad can add encouraging context: "What letter makes the /b/ sound?"
- Correct answer triggers the existing victory phrases

**Audio Recordings Needed:**
- 26 phoneme recordings (one per letter): ~26 files
- 26 prompt recordings ("What letter makes the /s/ sound?"): ~26 files
- Optional: keyword association recordings ("s is for snake"): ~26 files
- **Total: 52–78 new recordings**

**Implementation Notes:**
- Reuses the existing scattered-button UI from `renderWords()` in `game.js`
- Add a new entry in `WORD_SETS` for phoneme-letter mappings
- Add a new difficulty option in the start screen selector
- Audio folder: `audio/phonemes/` for the sound files, `audio/sound-match/` for prompts
- The display logic in `showNextWord()` already supports an "audio-only" mode (used by Alphabet) — this mode extends it

---

### 1.2 Word Builder (CVC Blending)

**What it is:** Dad's voice slowly segments a CVC word into its individual phonemes: "/c/… /a/… /t/". The child sees individual letter tiles scattered on screen and must tap them *in the correct order* to build the word. After each correct letter tap, the letter snaps into a building area at the top, visually assembling the word left-to-right. When complete, dad's voice blends the word together: "c-a-t… cat!" followed by a victory phrase.

For scaffolding, an easier sub-mode shows the completed word at the top and the child simply taps letters in order (matching). The harder sub-mode plays only the segmented audio with no visual target.

**Evidence-Based Rationale:** Blending and segmenting are the two most critical phonemic awareness skills for reading (Ehri et al., 2001). The NRP found that phonemic awareness instruction combined with letters (not purely oral) was substantially more effective. This mode implements "Elkonin box" methodology digitally: the child physically constructs the word phoneme-by-phoneme, creating the orthographic map. The sequential tapping mirrors finger-stretching techniques used in Orton-Gillingham instruction.

**Dad-Voice Integration:**
- Dad records segmented versions of each word: "/c/… /a/… /t/"
- Dad records the blended version: "cat!"
- Dad provides the prompt: "Can you build the word? Listen… /c/… /a/… /t/"
- Individual phoneme audio from Sound Match mode can be reused

**Audio Recordings Needed:**
- Segmented word recordings for each CVC word: ~30–40 files (one per word, with the phonemes segmented within a single recording)
- Blended confirmation: can reuse existing `find/` word audio
- Prompt recordings: "Can you build this word? Listen carefully…" — 3–5 generic prompts
- **Total: 35–45 new recordings**

**Implementation Notes:**
- New screen layout needed: a "building zone" (3 blank boxes at top) + scattered letter tiles below
- Modify `handleWordClick()` to track sequential order rather than single-tap correctness
- Letters should visually animate (fly up) into position when tapped correctly
- Wrong letter taps use the existing shake animation + try-again sound
- Word list starts with CVC words using continuous sounds (sat, man, fin) before stop sounds (cat, dog, bed)
- Add to `words.js` as a structured object: `{ word: 'cat', phonemes: ['c', 'a', 't'] }`

---

### 1.3 Rhyme Time

**What it is:** Dad's voice says: "Which word rhymes with cat?" The screen shows 4–6 word buttons (e.g., hat, dog, run, mat, see, bat). The child taps any word that rhymes with the target. Multiple correct answers are possible and all are accepted. After the child finds one rhyming word, a brief celebration plays and the remaining rhyming words highlight to reinforce the pattern. Then dad says: "hat and cat both end in -at!"

**Evidence-Based Rationale:** Rhyme awareness is one of the earliest phonological awareness skills to develop (ages 3–5) and is a strong predictor of later reading success (Bradley & Bryant, 1983). Rhyme helps children notice that words share sound patterns, which lays groundwork for onset-rime awareness and analogy-based decoding. It is also inherently fun for young children — nursery rhymes exist for a reason.

**Dad-Voice Integration:**
- Dad records rhyme prompts: "Which word rhymes with cat?"
- Dad records pattern explanations: "Hat and cat both end in -at! They rhyme!"
- These explanations are a natural teaching moment and feel warm coming from dad

**Audio Recordings Needed:**
- Rhyme prompts (one per target word): ~20 files
- Pattern explanation recordings: ~10–15 files (one per word family: -at, -an, -ig, -un, -ed, etc.)
- **Total: 30–35 new recordings**

**Implementation Notes:**
- Organise words by word families in `words.js`: `{ family: 'at', words: ['cat', 'hat', 'mat', 'sat', 'bat', 'rat', 'fat'] }`
- Modify answer checking: multiple correct answers per round
- After first correct answer, animate remaining correct answers to glow/highlight before advancing
- Fewer buttons per round (4–6 instead of 10) since multiple are correct
- New visual: word family highlight (the `-at` portion of each rhyming word could be coloured differently)

---

### 1.4 Sentence Reading

**What it is:** A short sentence appears on screen with one word missing (shown as a blank). Dad reads the full sentence aloud with emphasis on the missing word. Four word buttons appear below, and the child taps the correct word to complete the sentence. Example: "The cat sat on the ___." with options: mat, dog, run, blue. This introduces reading in context and basic comprehension.

**Evidence-Based Rationale:** The Simple View of Reading (Gough & Tunmer, 1986) defines reading as Decoding × Comprehension. All prior modes target decoding; this mode begins developing comprehension. Scarborough's Reading Rope shows that vocabulary, sentence structure, and verbal reasoning must develop alongside decoding. Cloze tasks (fill-in-the-blank) are a well-established technique for building contextual reading and predicting meaning from syntax.

**Dad-Voice Integration:**
- Dad reads each sentence naturally, pausing at the blank: "The cat sat on the… hmm, what goes here?"
- Dad's reading of full sentences models fluent reading prosody (pacing, expression)
- Correct answer: dad reads the complete sentence smoothly, then a victory phrase

**Audio Recordings Needed:**
- Sentence prompts (one per sentence): ~25–30 files
- Complete sentence readings (for after correct answer): ~25–30 files
- **Total: 50–60 new recordings**

**Implementation Notes:**
- New data structure in `words.js`: `{ sentence: 'The cat sat on the ___', answer: 'mat', options: ['mat', 'dog', 'run', 'blue'] }`
- New layout: sentence display area at top (larger text), word buttons in a row/grid below (not scattered)
- Sentence text should use large, clear font with the blank clearly marked (underline or coloured box)
- Start with sentences using only words from Easy and Harder word sets
- Gradually introduce new vocabulary through context

---

### 1.5 Spelling Bee (Audio-to-Spelling)

**What it is:** Dad says a word. No text is shown on screen. The child sees a full alphabet of letter buttons and must spell the word by tapping letters in order. Letters appear in a building zone at the top as they are tapped. A hint system provides increasing support: first hint highlights the vowels, second hint shows the first letter, third hint shows the full word briefly.

**Evidence-Based Rationale:** Spelling and reading are reciprocal skills that share the same orthographic knowledge (Ehri, 2000). Spelling requires *production* of letter sequences rather than mere *recognition*, which creates deeper orthographic mapping. The act of spelling forces the child to segment the word into phonemes and select the correct grapheme for each — precisely the encoding process that strengthens decoding. Invented/developmental spelling research (Read, 1971; Treiman, 1993) shows that attempting to spell accelerates reading development.

**Dad-Voice Integration:**
- Dad says the word clearly: "Can you spell… cat?"
- Hints in dad's voice: "The first sound is /c/…" or "Listen again… c-a-t"
- Success: "You spelled it! C-A-T spells cat!"

**Audio Recordings Needed:**
- Spelling prompts: "Can you spell [word]?" — ~30–40 files
- Segmented hints (can reuse from Word Builder): 0 additional
- Spelling confirmation: "You spelled it! [word]!" — ~30–40 files
- **Total: 60–80 new recordings**

**Implementation Notes:**
- Full alphabet keyboard layout (not scattered) — use a QWERTY layout
- Building zone at top shows letters as they are entered, with a backspace/undo button
- Start with 3-letter CVC words, progress to 4-letter, then words with digraphs
- Hint system uses a counter per word: `hintLevel` increments on a "Hint" button press
- This mode has the highest difficulty — place it later in the progression

---

### 1.6 Story Time (Listening Comprehension)

**What it is:** Dad reads a short story (3–5 sentences). The story appears on screen sentence by sentence as dad reads, with each word highlighted as it is spoken (karaoke-style). After the story, 2–3 simple comprehension questions appear: "Who sat on the mat?" with picture or word answer choices.

**Evidence-Based Rationale:** Listening comprehension is the other half of the Simple View of Reading equation. Children's listening comprehension exceeds their reading comprehension at this age, making it an ideal scaffold. Read-aloud with text tracking has been shown to improve sight word acquisition and print awareness (Justice & Ezell, 2002). The word highlighting creates temporal bonding between spoken and written forms.

**Dad-Voice Integration:**
- This is the ultimate dad-voice feature: dad reading bedtime-style stories
- Stories can reference the child by name or include personal details
- Dad's expressive reading models prosody and fluency

**Audio Recordings Needed:**
- Story narrations: ~10–15 stories × 30–60 seconds each = 10–15 files
- Comprehension question prompts: ~30–45 files
- **Total: 40–60 new recordings (but longer recordings)**

**Implementation Notes:**
- Requires word-level timing data for highlight sync — could use a simple JSON timestamp array per story
- Stories should use primarily words from the existing word sets (controlled vocabulary)
- Question format reuses the existing button-tap mechanic
- Most complex feature to implement — save for later phases
- Consider a simple recording tool/script that helps dad timestamp word boundaries

---

## 2. Progression & Scaffolding System

### 2.1 Mastery-Based Progression

**Current state:** All words are equally available. No tracking of which words the child knows or struggles with. Difficulty is manually selected.

**Proposed system:** Each word/skill has a mastery score from 0–100, calculated as:

```
mastery = (correct_count / total_attempts) × recency_weight × consistency_bonus
```

- **recency_weight:** More recent attempts count more heavily (exponential decay on older data)
- **consistency_bonus:** Multiplier for getting it right across multiple sessions (not just within one session)

**Mastery thresholds:**

| Range  | Label        | Behaviour                                                       |
|--------|--------------|-----------------------------------------------------------------|
| 0–40   | Learning     | Appears frequently, always with full scaffolding                |
| 40–70  | Practising   | Appears at moderate frequency, scaffolding available on request |
| 70–90  | Almost there | Appears less often, no scaffolding unless asked                 |
| 90–100 | Mastered     | Rarely appears (spaced repetition schedule), counted as known   |

**Advancement criteria:** A difficulty level is "complete" when 80% of its words reach 70+ mastery across at least 3 separate sessions. This prevents a child from "completing" a level in a single lucky game. The 80% threshold (not 100%) follows the principle that a few stragglers will continue to be reinforced through spaced repetition.

### 2.2 Spaced Repetition (Leitner System)

Implement a simplified Leitner system using localStorage:

| Box | Label              | Criteria                                           | Review Frequency  |
|-----|--------------------|----------------------------------------------------|-------------------|
| 1   | New / Struggling   | Seen 0–2 times or answered wrong recently          | Every session     |
| 2   | Learning           | Answered correctly 2+ times                        | Every other session |
| 3   | Familiar           | Answered correctly 4+ times across sessions        | Every 3rd session |
| 4   | Known              | Answered correctly 6+ times across 3+ sessions     | Every 5th session |

A wrong answer drops a word back one box. This is simpler than full SM-2 but effective for a 5-year-old's word set size.

**Evidence:** Spaced repetition produces stronger memory effects in children than in adults (Toppino et al., 2009). The spacing effect is one of the most robust findings in memory research. For a 5-year-old, the intervals should be measured in sessions (not days), since session frequency varies.

### 2.3 Skill Map Visualisation

Rather than a flat difficulty selector, present progression as a visual map or path:

```
[Letters] ──► [Letter Sounds] ──► [CVC Words] ──► [Rhyme Families] ──► [Word Building]
                                       │
                                       ▼
                                 [Sight Words] ──► [Sentences] ──► [Stories]
```

Each node on the map shows a star rating (0–3 stars based on mastery percentage). Completed nodes glow. The next available node pulses with an inviting animation. Locked nodes appear greyed out with a small lock icon.

This replaces the current three-button difficulty selector with something that feels like an adventure — a journey the child is on. The path metaphor supports narrative framing and gives the child a sense of autonomy ("I want to go to the word building island!").

**Implementation Notes:**
- The map screen replaces the current start screen's difficulty selector
- Each node stores its unlock criteria: `{ requires: ['letter-sounds'], minMastery: 70 }`
- The map is a CSS-styled HTML layout (not canvas), keeping it simple
- Nodes can be themed visually (jungle, space, ocean) without narrative complexity
- Start simple: a horizontal scrolling path with circular nodes

---

## 3. Data Tracking & Adaptive Learning

### 3.1 localStorage Schema

All data lives in localStorage. No server, no accounts, no privacy concerns.

**Per-word tracking:**

```javascript
// Key: "wh-word-{word}"
{
    attempts: 12,            // total times presented
    correct: 10,             // total correct on first tap
    wrongFirst: 2,           // times wrong before getting right
    streak: 3,               // current consecutive correct
    bestStreak: 5,           // all-time consecutive correct
    lastSeen: 1706400000,    // Unix timestamp
    lastCorrect: 1706400000,
    box: 2,                  // Leitner box (1–4)
    avgResponseMs: 2400,     // average time to correct answer
    sessions: [              // last 10 session results
        { date: 1706400000, correct: true, ms: 1800 },
        // ...
    ]
}
```

**Session tracking:**

```javascript
// Key: "wh-session-{timestamp}"
{
    date: 1706400000,
    mode: "word-builder",
    difficulty: "cvc",
    wordsAttempted: 10,
    wordsCorrect: 9,
    totalTime: 87,           // seconds
    score: 1450,
    words: ["cat", "dog", ...],
    results: [
        { word: "cat", correct: true, attempts: 1, ms: 1200 },
        { word: "dog", correct: true, attempts: 2, ms: 4500 },
        // ...
    ]
}
```

**Progress summary:**

```javascript
// Key: "wh-progress"
{
    totalSessions: 45,
    totalWordsLearned: 38,    // words at mastery >= 70
    currentLevel: "cvc",
    unlockedModes: ["alphabet", "sound-match", "easy", "harder", "word-builder"],
    lastSession: 1706400000
}
```

### 3.2 Adaptive Word Selection Algorithm

Replace the current `selectGameWords()` random selection with an adaptive algorithm:

```
For each game of N words:
  - 20% from Box 1 (struggling/new) — highest priority
  - 30% from Box 2 (learning)
  - 30% from Box 3 (familiar, due for review)
  - 20% from Box 4 (known, due for spaced review)

If any box is empty, redistribute proportionally.
If all words are mastered, introduce new words from next difficulty.
```

This ensures every game session is productive: the child is always working on their weakest words while reinforcing known ones. The 80% success rate target (from Self-Determination Theory research on competence) is maintained by mixing easy and hard items.

### 3.3 Parent Dashboard

A simple stats screen accessible from the start screen (small gear/chart icon in the corner). Not visible or interesting to the child. Shows:

- Total words mastered (with milestone list: 10, 25, 50, 100)
- Words currently being learned (with attempt counts)
- Struggling words (words with >3 wrong answers and <50% accuracy)
- Session history (last 10 sessions with scores and times)
- Time played (total and per-week average)
- A "Reset Progress" button (with confirmation)

**Implementation:** A new screen in `index.html`, rendered entirely from localStorage data. No additional audio needed. Pure HTML/CSS/JS.

---

## 4. UI/UX Improvements

### 4.1 Visual Polish

**Themed backgrounds:** Replace the flat `#FFF9E6` background with subtle, themed illustrations per mode. CSS gradients and simple SVG shapes can create scenes (clouds, grass, stars) without image assets. Each mode/level on the skill map gets a visual theme.

**Improved button layout:** The current random-placement algorithm (`findPosition()`) sometimes produces overlapping or awkwardly placed buttons. Replace with a physics-based or grid-snapped layout:
- Use a flexible grid system that respects button sizes
- Add a gentle "magnetic" repulsion between buttons (simulated via constraint-based positioning)
- Ensure buttons never overlap text with text

**Animated mascot:** A simple CSS-animated character (a friendly owl, bear, or star) that reacts to correct/wrong answers. Not a replacement for dad's voice, but a visual companion. Even a 3-element SVG face with expression changes (happy/surprised/encouraging) adds warmth.

**Better typography for words:** Display target words with letter spacing and optional colour-coding:
- Vowels in one colour, consonants in another
- Silent letters or tricky parts ("heart word" portions) in a third colour
- Supports the Heart Words approach to sight words

### 4.2 Interaction Improvements

**Tap feedback:** Add haptic feedback on supported devices (`navigator.vibrate(50)`) for both correct and wrong answers. The existing visual feedback (green pulse, shake) is good but tactile feedback adds a third sensory channel.

**Audio replay with visual cue:** The current replay button is functional but easy to miss. Add a pulsing animation to the replay button 3 seconds after the audio finishes, reminding the child they can hear it again. For younger/newer players, auto-replay after 5 seconds of inactivity.

**Streak counter:** Show a visible streak counter during gameplay ("3 in a row!"). Streaks of 3+ trigger a special animation. Provides moment-to-moment motivation beyond the end-of-game score.

**Adaptive distractor count:** Currently always 10 buttons. For words the child is learning (Box 1), show only 4–6 buttons, making success more likely. As mastery increases, increase to 8, then 10. Implements the scaffolding principle of reducing cognitive load for new material.

### 4.3 Accessibility & Quality of Life

**Persistent settings:** Save music preference, last-played difficulty, and display settings to localStorage so they survive page reloads. The current `musicEnabled` flag resets on refresh.

**Offline support (Service Worker):** Add a service worker to cache the HTML, CSS, JS, and most-used audio files. The app currently requires network access for every audio file. Given the R2 CDN setup, a cache-first strategy would make the app usable offline after first load. Important for car rides, waiting rooms, etc.

**Install as PWA:** The app already has some PWA meta tags (`apple-mobile-web-app-capable`). Add a `manifest.json` and service worker to make it fully installable on the home screen. A 5-year-old should be able to tap an icon, not navigate to a URL.

**Large touch targets:** The current minimum of 80×80px is good. Ensure all new modes maintain this. For the alphabet keyboard in Spelling Bee, minimum 48×48px per key with generous spacing.

---

## 5. Audio Recording Strategy

### 5.1 Recording Priority Tiers

| Tier | Enables         | Recordings | Description                                               |
|------|-----------------|------------|-----------------------------------------------------------|
| 1a   | Sound Match     | ~52        | 26 phoneme sounds + 26 sound-match prompts                |
| 1b   | Word Builder    | ~40        | ~35 CVC word segmentations + 5 generic prompts            |
| 2    | Rhyme Time      | ~35        | 20 rhyme prompts + 15 word-family explanations            |
| 3    | Sentence Reading| ~60        | 30 sentence prompt readings + 30 complete sentence reads  |
| 4    | Spelling Bee    | ~70        | 35 spelling prompts + 35 spelling confirmations           |
| 5    | Story Time      | ~50        | 10–15 story narrations + 30–45 comprehension questions    |

### 5.2 Recording Session Plan

| Session | Tier | Content                                | Est. Recordings |
|---------|------|----------------------------------------|-----------------|
| 1       | 1a   | Phoneme sounds + prompts               | ~52              |
| 2       | 1b   | CVC segmentations + generic prompts    | ~40              |
| 3       | 2    | Rhyme prompts + word-family explanations| ~35              |
| 4       | 3    | Sentence readings                      | ~60              |
| 5       | 4    | Spelling prompts + confirmations       | ~70              |
| 6+      | 5    | Story narrations and questions         | ~50              |

### 5.3 Recording Tips

Update `RECORDING-GUIDE.md` with:
- **Phoneme pronunciation guide:** Common mistakes — /b/ is "buh" not "buh-uh"; keep stop consonants crisp
- **Segmentation pacing:** 0.5-second pause between phonemes
- **Sentence reading:** Natural pace, slight pause at the blank, expressive but not theatrical
- **Story reading:** Bedtime-story warmth, consistent pacing

### 5.4 File Organisation

```
audio/
  alphabet/           # existing: letter name audio (A, B, C…)
  find/               # existing: "Find the word [word]" prompts
  victory/            # existing: celebration phrases
  effects/            # existing: click, correct, try-again, game-start
  background/         # existing: background music tracks
  phonemes/           # NEW: individual phoneme sounds (/s/, /a/, /t/…)
  sound-match/        # NEW: "What letter makes the /s/ sound?"
  segment/            # NEW: segmented CVC words (/c/… /a/… /t/)
  rhyme/              # NEW: "Which word rhymes with cat?"
  word-family/        # NEW: "Hat and cat both end in -at!"
  sentence-prompt/    # NEW: sentence readings with blank
  sentence-full/      # NEW: complete sentence readings
  spell-prompt/       # NEW: "Can you spell… cat?"
  spell-confirm/      # NEW: "You spelled it! C-A-T spells cat!"
  stories/            # NEW: story narrations
  comprehension/      # NEW: comprehension question prompts
```

---

## 6. Phased Implementation Roadmap

Phases are ordered by impact-to-effort ratio and pedagogical sequencing.

### Phase 1: Foundation

**Goal:** Data tracking + adaptive learning + UI improvements. No new audio needed.

1. Implement per-word data tracking (`js/progress.js`)
   - Per-word tracking object in localStorage
   - Session logging
   - Mastery score calculation
   - Leitner box assignment and advancement
2. Replace `selectGameWords()` with adaptive selection in `game.js`
   - Box-based word selection algorithm
   - Dynamic distractor count (4–10 based on word mastery)
3. Add persistent settings to localStorage (music, last difficulty)
4. Add parent dashboard screen (stats display, no audio needed)
5. Improve button layout algorithm in `renderWords()`
6. Add streak counter to game screen

**Audio needed:** None
**Why first:** This infrastructure benefits all existing and future modes. The child sees immediate improvement in the current game (adaptive difficulty, streak counter, better layout). The parent gets visibility into progress. Everything else builds on this data layer.

### Phase 2: Sound Match

**Goal:** First new game mode, targeting letter-sound correspondence.

1. Record Tier 1a audio (phonemes + prompts)
2. Add Sound Match mode to `words.js` with phoneme-letter mappings
3. Add "Sound Match" button to difficulty selector (or skill map if built)
4. Implement the mode in `game.js` (reuses scattered-button mechanic)
5. Integrate with data tracking from Phase 1

**Audio needed:** ~52 recordings (1 session)
**Why second:** Smallest audio investment for a new mode. Letter-sound correspondence is the pedagogically correct next step after letter recognition. Reuses existing UI patterns almost entirely.

### Phase 3: Word Builder

**Goal:** CVC blending mode — the signature new feature.

1. Record Tier 1b audio (segmented CVC words)
2. Build new screen layout: building zone + letter tiles
3. Implement sequential-tap mechanic (order matters)
4. Add fly-up animation for correct letter placement
5. Add phoneme highlighting (optional: colour-code vowel position)
6. Integrate with data tracking

**Audio needed:** ~40 recordings (1 session)
**Why third:** Highest-value pedagogical feature. Blending is the single most important skill for transitioning from pre-reader to reader. The mechanic is novel (sequential tapping) and engaging. Requires the most new UI work, but phoneme audio from Phase 2 is partially reusable.

### Phase 4: Rhyme Time + Progression Map

**Goal:** Add rhyming mode and replace the flat difficulty selector with a visual progression path.

1. Record Tier 2 audio (rhyme prompts + word families)
2. Build Rhyme Time mode with multi-correct-answer logic
3. Build skill map / progression path screen
4. Define unlock criteria for each node
5. Add star ratings based on mastery data
6. Migrate existing difficulty selection into the map

**Audio needed:** ~35 recordings (1 session)
**Why fourth:** Rhyming is pedagogically appropriate alongside CVC blending. The progression map is the key UX upgrade that transforms the app from "three buttons" into a structured learning journey. By this phase, there are enough modes (5+) to justify the map.

### Phase 5: Sentences + Spelling

**Goal:** Two modes that introduce reading in context and productive spelling.

1. Record Tier 3 audio (sentences)
2. Build Sentence Reading mode with cloze task mechanic
3. Record Tier 4 audio (spelling prompts)
4. Build Spelling Bee mode with alphabet keyboard + building zone
5. Add hint system for Spelling Bee
6. Integrate both with data tracking and progression map

**Audio needed:** ~130 recordings (2 sessions)
**Why fifth:** These modes are more advanced and the child may not be ready for them until he has spent time on Phases 2–4. The higher audio investment is justified by this point — dad has a recording workflow established.

### Phase 6: Story Time + PWA

**Goal:** Listening comprehension + offline/installable app.

1. Record Tier 5 audio (stories + questions)
2. Build Story Time mode with word-level highlight sync
3. Build comprehension question interface
4. Add service worker for offline caching
5. Add `manifest.json` for PWA installability
6. Add any remaining visual polish (themes, character animations)

**Audio needed:** ~50 recordings (1–2 sessions, longer per recording)
**Why last:** Story Time is the most complex feature technically (word-level timing) and pedagogically (the child needs a base of decoded words to benefit from text tracking). The PWA work is a quality-of-life improvement that doesn't affect learning outcomes.

---

## 7. Technical Architecture

### 7.1 Proposed File Structure

```
word-hunt/
  index.html                # main HTML (add new screens)
  manifest.json             # NEW: PWA manifest
  sw.js                     # NEW: service worker
  css/
    style.css               # existing styles + new mode styles
  js/
    game.js                 # core game logic (refactor into modes)
    words.js                # word sets (expand with new data structures)
    audio.js                # audio manager (expand with new paths)
    progress.js             # NEW: data tracking, mastery, spaced repetition
    dashboard.js            # NEW: parent dashboard
    modes/                  # NEW: mode-specific logic
      word-hunt.js          #   extract current mechanic
      sound-match.js        #   Phase 2
      word-builder.js       #   Phase 3
      rhyme-time.js         #   Phase 4
      sentences.js          #   Phase 5
      spelling.js           #   Phase 5
      stories.js            #   Phase 6
  assets/
    favicon.svg
    icons/                  # NEW: PWA icons
  audio/
    (see file organisation in §5.4)
```

### 7.2 Game.js Refactoring Strategy

The current `WordHuntGame` class handles everything: screen management, word selection, button rendering, scoring, and game flow. As modes are added, this becomes unwieldy.

**Proposed refactor:** Extract a base `GameMode` pattern (not a formal class hierarchy — keep it simple for vanilla JS):

```javascript
// Each mode implements:
const mode = {
    name: 'word-builder',
    setup(gameWords) { ... },       // initialise mode-specific state
    render(container) { ... },      // render the play area
    handleInput(element) { ... },   // process a tap
    getAudioPrompt(word) { ... },   // return audio path for current word
    cleanup() { ... }               // tear down mode-specific state
};
```

The main `WordHuntGame` class retains: screen management, scoring, timer, progress tracking, and the game loop (select word → play audio → wait for input → advance). Mode-specific rendering and input handling are delegated to the mode object.

This refactor should happen incrementally. Phase 1 extracts the current mechanic into `modes/word-hunt.js`. Each subsequent phase adds a new mode file.

### 7.3 Audio Manager Extensions

The current `AudioManager` class needs minimal changes:
- Add new `play*` methods for each audio category (`playPhoneme`, `playSegmented`, `playRhymePrompt`, etc.) — one-liners that delegate to `playAudio` with the correct path
- Extend `preloadWords` to accept a mode parameter and preload the appropriate audio set
- Consider a generic `playPrompt(category, key)` method to avoid method proliferation

### 7.4 localStorage Budget

| Data              | Estimate                             |
|-------------------|--------------------------------------|
| Current (scores)  | ~1 KB                                |
| Per-word tracking  | ~500 bytes × 200 words = ~100 KB    |
| Session logs       | ~2 KB × 100 sessions = ~200 KB      |
| **Total**          | **~300 KB** (well within 5 MB limit) |

Implement a cleanup routine that prunes session logs older than 90 days.

### 7.5 No Build Tools Policy

This project intentionally avoids npm, webpack, and frameworks. All new JS files should be added as `<script>` tags in `index.html` in dependency order. If the number of script tags grows unwieldy (>10), consider a simple concatenation script (a 3-line shell script), but do not introduce a build tool.

---

## 8. Appendices

### Appendix A: Word Lists for New Modes

#### CVC Words by Phoneme Complexity (for Word Builder)

**Continuous sounds first (easier to blend):**
sat, man, fan, sun, fin, van, Sam, Nan, run, fun, sin, son, win, ran, rim

**Stop sounds (harder to blend):**
cat, bat, hat, dog, big, bed, bug, cup, pot, pig, tag, kid, mud, got, tub

**Mixed consonant types:**
red, log, zip, fox, wet, mix, hop, jet, yam

#### Word Families (for Rhyme Time)

| Family | Words                                  |
|--------|----------------------------------------|
| -at    | cat, hat, mat, sat, bat, rat, fat, pat |
| -an    | can, man, fan, van, ran, pan, tan, Dan |
| -ig    | big, pig, dig, wig, fig, jig           |
| -un    | sun, run, fun, bun, gun, pun           |
| -ed    | red, bed, fed, led, Ted                |
| -og    | dog, log, fog, hog, jog, bog           |
| -ot    | hot, pot, dot, got, lot, not           |
| -ug    | bug, rug, mug, hug, dug, tug           |
| -in    | in, fin, pin, win, bin, tin            |
| -op    | hop, mop, pop, top, stop, drop         |

#### Starter Sentences (for Sentence Reading)

| #  | Sentence                        | Answer | Distractors        |
|----|---------------------------------|--------|--------------------|
| 1  | "The cat sat on the ___."       | mat    | dog, run, blue     |
| 2  | "I can ___ fast."               | run    | the, big, at       |
| 3  | "The ___ is big."               | dog    | at, on, up         |
| 4  | "We can ___ the cat."           | see    | is, at, to         |
| 5  | "He said ___ to me."            | yes    | cat, run, mat      |

### Appendix B: Estimated Recording Counts by Phase

| Phase | Mode(s)                 | New Recordings | Cumulative Total | Sessions Needed |
|-------|-------------------------|----------------|------------------|-----------------|
| 1     | Foundation              | 0              | ~100 (existing)  | 0               |
| 2     | Sound Match             | ~52            | ~152             | 1               |
| 3     | Word Builder            | ~40            | ~192             | 1               |
| 4     | Rhyme Time              | ~35            | ~227             | 1               |
| 5     | Sentences + Spelling    | ~130           | ~357             | 2               |
| 6     | Story Time              | ~50            | ~407             | 1–2             |
| **Total** |                     | **~307**       | **~407**         | **6–7 sessions**|

### Appendix C: Research References

- **Simple View of Reading:** Gough & Tunmer (1986). *Decoding, reading, and reading disability.*
- **Scarborough's Reading Rope:** Scarborough (2001). *Connecting early language and literacy to later reading (dis)abilities.*
- **Ehri's Phases:** Ehri (2005, 2014). *Learning to read words: Theory, findings, and issues.*
- **NRP Phonics Findings:** National Reading Panel (2000). *Teaching children to read.*
- **Phonemic Awareness:** Ehri et al. (2001). *Systematic phonics instruction helps students learn to read.*
- **Spaced Repetition in Children:** Toppino et al. (2009). *The spacing effect in preschool children's free recall.*
- **Heart Words:** Really Great Reading methodology; O'Connor (2014).
- **Self-Determination Theory:** Deci & Ryan (2000). *Intrinsic motivation and self-determination in human behavior.*
- **Orton-Gillingham VAKT:** Birsh & Carreker (2018). *Multisensory teaching of basic language skills.*
- **Spelling-Reading Reciprocity:** Ehri (2000). *Learning to read and learning to spell.*
- **Gamification in Education:** Hamari et al. (2014). *Does gamification work?* MDA framework.
- **Read-Aloud + Print Awareness:** Justice & Ezell (2002). *Use of storybook reading to increase print awareness.*
- **Rhyme & Reading:** Bradley & Bryant (1983). *Categorizing sounds and learning to read.*
- **Developmental Spelling:** Read (1971); Treiman (1993). *Beginning to spell.*
- **Handwriting & Reading:** Iowa Reading Research Center (2024). *Handwriting improves reading outcomes.*

### Appendix D: Systematic Phonics Scope & Sequence

For reference when expanding word lists beyond CVC:

1. **Letter-Sound Correspondences** — s, a, t, p, i, n, m, d first (high-utility, visually distinct)
2. **VC and CVC Words** — at, sat, pin, mud
3. **Consonant Digraphs** — sh, ch, th, wh, ck
4. **FLOSS Rule** — off, hill, miss, buzz
5. **Consonant Blends/Clusters** — bl-, cr-, sn-, sp-, -nd, -mp
6. **Glued/Welded Sounds** — -ang, -ing, -ong, -ung, -ank, -ink
7. **Silent-e / CVCe** — make, bike, hope
8. **Vowel Teams** — ai, ea, oa, ee, igh
9. **R-Controlled Vowels** — ar, er, ir, or, ur
10. **Multisyllabic Words** — sunset, jumping

Key principles: start with continuous consonants (m, s, n, f, l, r) because they can be stretched for blending. Use connected phonation ("mmmmaaaat" not "m…a…t"). Cumulative review is essential.

---

## Appendix E: Word Builder (Phase 3) — Complete Audio Recording Scripts

This appendix provides exact recording scripts for all 65 audio files needed for the Word Builder game mode. All files should be recorded in dad's voice, saved as MP3, and uploaded to the R2 CDN.

### E.1 Recording Tips Specific to Word Builder

**Phoneme segmentation pacing:**
- Leave approximately 0.5–0.8 seconds of silence between each phoneme
- Stretch continuous consonants (f, l, m, n, r, s, v, w, z) for about 0.5 seconds each
- Keep stop consonants (b, c/k, d, g, h, j, p, t) crisp and short — do NOT add a schwa vowel (say "b" not "buh", "t" not "tuh")
- Vowels should be clear and slightly elongated

**Blended word recordings:**
- Say the word naturally and enthusiastically, as if celebrating
- Slightly emphasise the word — it's the payoff moment

**General:**
- Warm, encouraging tone throughout
- Consistent volume and distance from microphone
- Record in a quiet room, same as previous sessions

### E.2 Segmented Word Recordings (30 files)

**Folder:** `audio/segment/`
**Format:** `[word].mp3`
**What to say:** Each phoneme separately, with ~0.5s pauses between them. Stretch continuous sounds. Keep stop sounds crisp.

#### Group 1 — Continuous Consonant Words (easiest to blend)

| # | File | Script | Phoneme Notes |
|---|------|--------|---------------|
| 1 | `segment/sat.mp3` | "sss ... aaa ... t" | Stretch the /s/, clear /a/ as in "cat", crisp /t/ |
| 2 | `segment/man.mp3` | "mmm ... aaa ... nnn" | Stretch /m/, clear /a/, stretch /n/ |
| 3 | `segment/fan.mp3` | "fff ... aaa ... nnn" | Stretch /f/, clear /a/, stretch /n/ |
| 4 | `segment/sun.mp3` | "sss ... uuu ... nnn" | Stretch /s/, /u/ as in "up", stretch /n/ |
| 5 | `segment/fin.mp3` | "fff ... iii ... nnn" | Stretch /f/, /i/ as in "sit", stretch /n/ |
| 6 | `segment/van.mp3` | "vvv ... aaa ... nnn" | Stretch /v/, clear /a/, stretch /n/ |
| 7 | `segment/run.mp3` | "rrr ... uuu ... nnn" | Stretch /r/, /u/ as in "up", stretch /n/ |
| 8 | `segment/fun.mp3` | "fff ... uuu ... nnn" | Stretch /f/, /u/ as in "up", stretch /n/ |
| 9 | `segment/win.mp3` | "www ... iii ... nnn" | Stretch /w/, /i/ as in "sit", stretch /n/ |
| 10 | `segment/ran.mp3` | "rrr ... aaa ... nnn" | Stretch /r/, clear /a/, stretch /n/ |

#### Group 2 — Stop Consonant Words

| # | File | Script | Phoneme Notes |
|---|------|--------|---------------|
| 11 | `segment/cat.mp3` | "c ... aaa ... t" | Crisp /k/ sound (no "kuh"), clear /a/, crisp /t/ |
| 12 | `segment/bat.mp3` | "b ... aaa ... t" | Crisp /b/ (no "buh"), clear /a/, crisp /t/ |
| 13 | `segment/hat.mp3` | "h ... aaa ... t" | Quick /h/ breath, clear /a/, crisp /t/ |
| 14 | `segment/dog.mp3` | "d ... ooo ... g" | Crisp /d/, /o/ as in "hot", crisp /g/ |
| 15 | `segment/big.mp3` | "b ... iii ... g" | Crisp /b/, /i/ as in "sit", crisp /g/ |
| 16 | `segment/bed.mp3` | "b ... eee ... d" | Crisp /b/, /e/ as in "red", crisp /d/ |
| 17 | `segment/bug.mp3` | "b ... uuu ... g" | Crisp /b/, /u/ as in "up", crisp /g/ |
| 18 | `segment/cup.mp3` | "c ... uuu ... p" | Crisp /k/ sound, /u/ as in "up", crisp /p/ |
| 19 | `segment/pot.mp3` | "p ... ooo ... t" | Crisp /p/, /o/ as in "hot", crisp /t/ |
| 20 | `segment/pig.mp3` | "p ... iii ... g" | Crisp /p/, /i/ as in "sit", crisp /g/ |

#### Group 3 — Mixed Consonant Words

| # | File | Script | Phoneme Notes |
|---|------|--------|---------------|
| 21 | `segment/red.mp3` | "rrr ... eee ... d" | Stretch /r/, /e/ as in "red", crisp /d/ |
| 22 | `segment/log.mp3` | "lll ... ooo ... g" | Stretch /l/, /o/ as in "hot", crisp /g/ |
| 23 | `segment/zip.mp3` | "zzz ... iii ... p" | Stretch /z/, /i/ as in "sit", crisp /p/ |
| 24 | `segment/fox.mp3` | "fff ... ooo ... ks" | Stretch /f/, /o/ as in "hot", /ks/ said quickly together |
| 25 | `segment/wet.mp3` | "www ... eee ... t" | Stretch /w/, /e/ as in "red", crisp /t/ |
| 26 | `segment/hop.mp3` | "h ... ooo ... p" | Quick /h/ breath, /o/ as in "hot", crisp /p/ |
| 27 | `segment/jet.mp3` | "j ... eee ... t" | Crisp /j/, /e/ as in "red", crisp /t/ |
| 28 | `segment/tag.mp3` | "t ... aaa ... g" | Crisp /t/, clear /a/, crisp /g/ |
| 29 | `segment/kid.mp3` | "c ... iii ... d" | Crisp /k/ sound (same as "cat"), /i/ as in "sit", crisp /d/ |
| 30 | `segment/mud.mp3` | "mmm ... uuu ... d" | Stretch /m/, /u/ as in "up", crisp /d/ |

### E.3 Blended Word Confirmation Recordings (30 files)

**Folder:** `audio/blend/`
**Format:** `[word].mp3`
**What to say:** The word said clearly and enthusiastically — this is the celebration moment after the child builds the word successfully.

| # | File | Script | Delivery Notes |
|---|------|--------|----------------|
| 1 | `blend/sat.mp3` | "Sat!" | Enthusiastic, celebrating |
| 2 | `blend/man.mp3` | "Man!" | Enthusiastic, celebrating |
| 3 | `blend/fan.mp3` | "Fan!" | Enthusiastic, celebrating |
| 4 | `blend/sun.mp3` | "Sun!" | Enthusiastic, celebrating |
| 5 | `blend/fin.mp3` | "Fin!" | Enthusiastic, celebrating |
| 6 | `blend/van.mp3` | "Van!" | Enthusiastic, celebrating |
| 7 | `blend/run.mp3` | "Run!" | Enthusiastic, celebrating |
| 8 | `blend/fun.mp3` | "Fun!" | Enthusiastic, celebrating |
| 9 | `blend/win.mp3` | "Win!" | Enthusiastic, celebrating |
| 10 | `blend/ran.mp3` | "Ran!" | Enthusiastic, celebrating |
| 11 | `blend/cat.mp3` | "Cat!" | Enthusiastic, celebrating |
| 12 | `blend/bat.mp3` | "Bat!" | Enthusiastic, celebrating |
| 13 | `blend/hat.mp3` | "Hat!" | Enthusiastic, celebrating |
| 14 | `blend/dog.mp3` | "Dog!" | Enthusiastic, celebrating |
| 15 | `blend/big.mp3` | "Big!" | Enthusiastic, celebrating |
| 16 | `blend/bed.mp3` | "Bed!" | Enthusiastic, celebrating |
| 17 | `blend/bug.mp3` | "Bug!" | Enthusiastic, celebrating |
| 18 | `blend/cup.mp3` | "Cup!" | Enthusiastic, celebrating |
| 19 | `blend/pot.mp3` | "Pot!" | Enthusiastic, celebrating |
| 20 | `blend/pig.mp3` | "Pig!" | Enthusiastic, celebrating |
| 21 | `blend/red.mp3` | "Red!" | Enthusiastic, celebrating |
| 22 | `blend/log.mp3` | "Log!" | Enthusiastic, celebrating |
| 23 | `blend/zip.mp3` | "Zip!" | Enthusiastic, celebrating |
| 24 | `blend/fox.mp3` | "Fox!" | Enthusiastic, celebrating |
| 25 | `blend/wet.mp3` | "Wet!" | Enthusiastic, celebrating |
| 26 | `blend/hop.mp3` | "Hop!" | Enthusiastic, celebrating |
| 27 | `blend/jet.mp3` | "Jet!" | Enthusiastic, celebrating |
| 28 | `blend/tag.mp3` | "Tag!" | Enthusiastic, celebrating |
| 29 | `blend/kid.mp3` | "Kid!" | Enthusiastic, celebrating |
| 30 | `blend/mud.mp3` | "Mud!" | Enthusiastic, celebrating |

### E.4 Generic Prompt Recordings (5 files)

**Folder:** `audio/word-builder/`
**Format:** `prompt-[1-5].mp3`
**What to say:** A warm, encouraging prompt played before the segmented phonemes. Varied to avoid repetition across rounds.

| # | File | Script | Delivery Notes |
|---|------|--------|----------------|
| 1 | `word-builder/prompt-1.mp3` | "Can you build this word? Listen carefully..." | Warm, inviting, slight pause at the end before segmented audio plays |
| 2 | `word-builder/prompt-2.mp3` | "Listen to the sounds and build the word!" | Encouraging, upbeat |
| 3 | `word-builder/prompt-3.mp3` | "Let's build a word! Here are the sounds..." | Collaborative tone ("let's"), slight pause at the end |
| 4 | `word-builder/prompt-4.mp3` | "Time to build! Listen..." | Shorter, energetic, good for when the child is in the flow |
| 5 | `word-builder/prompt-5.mp3` | "Here comes a word! Listen to each sound..." | Playful anticipation |

### E.5 Audio File Summary

| Category | Folder | Count | Description |
|----------|--------|-------|-------------|
| Segmented words | `audio/segment/` | 30 | Phonemes spoken with pauses between each |
| Blended words | `audio/blend/` | 30 | Word spoken enthusiastically as celebration |
| Generic prompts | `audio/word-builder/` | 5 | Varied intro prompts before each word |
| **Total** | | **65** | **1 recording session** |

### E.6 Recording Session Plan

**Recommended recording order** (to maintain consistent energy and tone):

1. **Warm up** with the 5 generic prompts (short, varied, easy to get right)
2. **Group 1 segmented words** (10 continuous-consonant words — these are the easiest to segment cleanly)
3. **Group 1 blended words** (10 — quick, single words with enthusiasm)
4. **Group 2 segmented words** (10 stop-consonant words — requires more care to avoid adding schwa)
5. **Group 2 blended words** (10)
6. **Group 3 segmented words** (10 mixed words)
7. **Group 3 blended words** (10)

**Common mistakes to avoid:**
- Adding "uh" after stop consonants: say /b/ not /buh/, /t/ not /tuh/, /p/ not /puh/
- Rushing the pauses between phonemes — leave a clear gap
- Inconsistent volume between phonemes in the same word
- Saying the letter name instead of the sound: /s/ not "ess", /m/ not "em"
- For "fox": the final sound is /ks/ (two sounds blended), not /k/ then /s/ separately
