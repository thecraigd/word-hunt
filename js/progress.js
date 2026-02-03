/**
 * Progress Tracking & Adaptive Learning System
 *
 * Manages per-word tracking, session logging, mastery scores,
 * and Leitner box-based spaced repetition — all via localStorage.
 */

const ProgressTracker = {
    // ── localStorage key prefixes ──
    WORD_PREFIX: 'wh-word-',
    SESSION_PREFIX: 'wh-session-',
    PROGRESS_KEY: 'wh-progress',
    SETTINGS_KEY: 'wh-settings',

    // ── Leitner box definitions ──
    BOXES: {
        1: { label: 'New / Struggling', reviewEvery: 1 },
        2: { label: 'Learning',         reviewEvery: 2 },
        3: { label: 'Familiar',         reviewEvery: 3 },
        4: { label: 'Known',            reviewEvery: 5 }
    },

    // ── Mastery thresholds ──
    MASTERY: {
        LEARNING:     40,
        PRACTISING:   70,
        ALMOST_THERE: 90
    },

    // ── Box advancement criteria ──
    BOX_ADVANCE: {
        2: { correctNeeded: 2 },
        3: { correctNeeded: 4, sessionsNeeded: 2 },
        4: { correctNeeded: 6, sessionsNeeded: 3 }
    },

    // ────────────────────────────────────────────
    //  Per-word tracking
    // ────────────────────────────────────────────

    /**
     * Get tracking data for a word, or create a fresh record.
     */
    getWordData(word) {
        const key = this.WORD_PREFIX + word.toLowerCase();
        try {
            const raw = localStorage.getItem(key);
            if (raw) return JSON.parse(raw);
        } catch { /* ignore parse errors */ }

        return {
            word: word.toLowerCase(),
            attempts: 0,
            correct: 0,
            wrongFirst: 0,
            streak: 0,
            bestStreak: 0,
            lastSeen: 0,
            lastCorrect: 0,
            box: 1,
            avgResponseMs: 0,
            sessions: []
        };
    },

    /**
     * Save tracking data for a word.
     */
    saveWordData(data) {
        const key = this.WORD_PREFIX + data.word.toLowerCase();
        localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * Record a correct first-tap answer for a word.
     */
    recordCorrect(word, responseMs) {
        const data = this.getWordData(word);
        const now = Date.now();

        data.attempts++;
        data.correct++;
        data.streak++;
        if (data.streak > data.bestStreak) {
            data.bestStreak = data.streak;
        }
        data.lastSeen = now;
        data.lastCorrect = now;

        // Rolling average response time
        if (data.avgResponseMs === 0) {
            data.avgResponseMs = responseMs;
        } else {
            data.avgResponseMs = Math.round(
                data.avgResponseMs * 0.7 + responseMs * 0.3
            );
        }

        // Session log (keep last 10)
        data.sessions.push({ date: now, correct: true, ms: responseMs });
        if (data.sessions.length > 10) {
            data.sessions = data.sessions.slice(-10);
        }

        // Leitner advancement
        this._advanceBox(data);

        this.saveWordData(data);
        return data;
    },

    /**
     * Record a wrong answer for a word.
     */
    recordWrong(word, responseMs) {
        const data = this.getWordData(word);
        const now = Date.now();

        data.attempts++;
        data.wrongFirst++;
        data.streak = 0;
        data.lastSeen = now;

        // Session log (keep last 10)
        data.sessions.push({ date: now, correct: false, ms: responseMs });
        if (data.sessions.length > 10) {
            data.sessions = data.sessions.slice(-10);
        }

        // Leitner demotion — drop one box, minimum box 1
        if (data.box > 1) {
            data.box--;
        }

        this.saveWordData(data);
        return data;
    },

    /**
     * Advance a word's Leitner box if criteria are met.
     */
    _advanceBox(data) {
        if (data.box >= 4) return; // already at max

        const nextBox = data.box + 1;
        const criteria = this.BOX_ADVANCE[nextBox];
        if (!criteria) return;

        if (data.correct < criteria.correctNeeded) return;

        if (criteria.sessionsNeeded) {
            const uniqueSessions = this._countUniqueSessions(data.sessions);
            if (uniqueSessions < criteria.sessionsNeeded) return;
        }

        data.box = nextBox;
    },

    /**
     * Count unique sessions from session log entries.
     * Sessions on different calendar days count as unique.
     */
    _countUniqueSessions(sessions) {
        const days = new Set();
        for (const s of sessions) {
            const d = new Date(s.date);
            days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        }
        return days.size;
    },

    // ────────────────────────────────────────────
    //  Mastery score
    // ────────────────────────────────────────────

    /**
     * Calculate mastery score 0–100 for a word.
     *
     * mastery = accuracy × recency_weight × consistency_bonus
     */
    calculateMastery(word) {
        const data = this.getWordData(word);
        if (data.attempts === 0) return 0;

        // Base accuracy (0–1)
        const accuracy = data.correct / data.attempts;

        // Recency weight: recent activity counts more.
        // Decays from 1.0 toward 0.5 over 14 days of inactivity.
        const daysSinceSeen = data.lastSeen
            ? (Date.now() - data.lastSeen) / (1000 * 60 * 60 * 24)
            : 14;
        const recency = 0.5 + 0.5 * Math.exp(-daysSinceSeen / 7);

        // Consistency bonus: reward correct answers across multiple sessions.
        const uniqueSessions = this._countUniqueSessions(
            data.sessions.filter(s => s.correct)
        );
        const consistency = Math.min(1.3, 1 + uniqueSessions * 0.1);

        return Math.min(100, Math.round(accuracy * recency * consistency * 100));
    },

    /**
     * Get the mastery label for a score.
     */
    getMasteryLabel(score) {
        if (score >= this.MASTERY.ALMOST_THERE) return 'Mastered';
        if (score >= this.MASTERY.PRACTISING)   return 'Almost there';
        if (score >= this.MASTERY.LEARNING)     return 'Practising';
        return 'Learning';
    },

    // ────────────────────────────────────────────
    //  Session tracking
    // ────────────────────────────────────────────

    /**
     * Start a new session. Returns a session object to pass to endSession().
     */
    startSession(mode, difficulty) {
        return {
            date: Date.now(),
            mode: mode || 'word-hunt',
            difficulty: difficulty,
            wordsAttempted: 0,
            wordsCorrect: 0,
            totalTime: 0,
            score: 0,
            words: [],
            results: []
        };
    },

    /**
     * Record a word result into the active session.
     */
    addSessionResult(session, word, correct, attempts, ms) {
        session.wordsAttempted++;
        if (correct) session.wordsCorrect++;
        session.words.push(word);
        session.results.push({ word, correct, attempts, ms });
    },

    /**
     * Finish and persist a session.
     */
    endSession(session, score, totalTimeSeconds) {
        session.score = score;
        session.totalTime = Math.round(totalTimeSeconds);

        const key = this.SESSION_PREFIX + session.date;
        localStorage.setItem(key, JSON.stringify(session));

        // Update progress summary
        this._updateProgressSummary(session);

        // Prune old sessions (keep last 90 days)
        this._pruneOldSessions();

        return session;
    },

    /**
     * Update the global progress summary after a session.
     */
    _updateProgressSummary(session) {
        const progress = this.getProgress();
        progress.totalSessions++;
        progress.lastSession = session.date;

        // Count mastered words across all difficulties
        let mastered = 0;
        for (const difficulty of Object.keys(WORD_SETS)) {
            for (const word of WORD_SETS[difficulty]) {
                if (this.calculateMastery(word) >= this.MASTERY.PRACTISING) {
                    mastered++;
                }
            }
        }
        progress.totalWordsLearned = mastered;

        localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    },

    /**
     * Get global progress summary.
     */
    getProgress() {
        try {
            const raw = localStorage.getItem(this.PROGRESS_KEY);
            if (raw) return JSON.parse(raw);
        } catch { /* ignore */ }

        return {
            totalSessions: 0,
            totalWordsLearned: 0,
            lastSession: 0
        };
    },

    /**
     * Remove session logs older than 90 days.
     */
    _pruneOldSessions() {
        const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.SESSION_PREFIX)) {
                const ts = parseInt(key.slice(this.SESSION_PREFIX.length), 10);
                if (ts < cutoff) {
                    keysToRemove.push(key);
                }
            }
        }

        for (const key of keysToRemove) {
            localStorage.removeItem(key);
        }
    },

    // ────────────────────────────────────────────
    //  Adaptive word selection
    // ────────────────────────────────────────────

    /**
     * Select game words using Leitner box-based adaptive algorithm.
     *
     * Distribution targets:
     *   Box 1 (struggling/new): 20%
     *   Box 2 (learning):       30%
     *   Box 3 (familiar):       30%
     *   Box 4 (known):          20%
     *
     * Words in higher boxes only appear if due for review based on session count.
     */
    selectAdaptiveWords(difficulty, count) {
        const wordSet = WORD_SETS[difficulty];
        if (!wordSet) return [];

        const progress = this.getProgress();
        const sessionNum = progress.totalSessions + 1; // upcoming session

        // Bucket words by Leitner box
        const buckets = { 1: [], 2: [], 3: [], 4: [] };
        for (const word of wordSet) {
            const data = this.getWordData(word);
            const box = data.box || 1;

            // Check if word is due for review based on session frequency
            const reviewEvery = this.BOXES[box].reviewEvery;
            if (box === 1 || sessionNum % reviewEvery === 0 || data.attempts === 0) {
                buckets[box].push(word);
            }
        }

        // Target distribution
        const targets = {
            1: Math.max(1, Math.round(count * 0.2)),
            2: Math.round(count * 0.3),
            3: Math.round(count * 0.3),
            4: Math.round(count * 0.2)
        };

        const selected = [];
        const used = new Set();

        // Pull from each bucket according to targets
        for (const box of [1, 2, 3, 4]) {
            const shuffled = this._shuffle([...buckets[box]]);
            let needed = targets[box];

            for (const word of shuffled) {
                if (needed <= 0) break;
                if (used.has(word.toLowerCase())) continue;
                selected.push(word);
                used.add(word.toLowerCase());
                needed--;
            }
        }

        // If we haven't reached count, fill from any remaining words
        if (selected.length < count) {
            const allShuffled = this._shuffle([...wordSet]);
            for (const word of allShuffled) {
                if (selected.length >= count) break;
                if (used.has(word.toLowerCase())) continue;
                selected.push(word);
                used.add(word.toLowerCase());
            }
        }

        // Shuffle the final selection so box order isn't predictable
        return this._shuffle(selected).slice(0, count);
    },

    /**
     * Get the dynamic distractor count for a word based on its mastery.
     *
     * Low mastery (learning) → fewer distractors (4–6)
     * Medium mastery → moderate distractors (7–8)
     * High mastery → full distractors (9–10)
     */
    getDistractorCount(word) {
        const mastery = this.calculateMastery(word);

        if (mastery < this.MASTERY.LEARNING) return 4;        // 0–39: 4 total
        if (mastery < this.MASTERY.PRACTISING) return 6;      // 40–69: 6 total
        if (mastery < this.MASTERY.ALMOST_THERE) return 8;    // 70–89: 8 total
        return 10;                                             // 90–100: 10 total
    },

    // ────────────────────────────────────────────
    //  Persistent settings
    // ────────────────────────────────────────────

    /**
     * Load user settings from localStorage.
     */
    getSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            if (raw) return JSON.parse(raw);
        } catch { /* ignore */ }

        return {
            musicEnabled: true,
            lastDifficulty: 'alphabet'
        };
    },

    /**
     * Save user settings to localStorage.
     */
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    },

    /**
     * Update a single setting key.
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    },

    // ────────────────────────────────────────────
    //  Dashboard data helpers
    // ────────────────────────────────────────────

    /**
     * Get all tracked words with their data, sorted by mastery ascending.
     */
    getAllWordData() {
        const allWords = [];
        for (const difficulty of Object.keys(WORD_SETS)) {
            for (const word of WORD_SETS[difficulty]) {
                const data = this.getWordData(word);
                data.mastery = this.calculateMastery(word);
                data.difficulty = difficulty;
                allWords.push(data);
            }
        }
        return allWords.sort((a, b) => a.mastery - b.mastery);
    },

    /**
     * Get words grouped by mastery status.
     */
    getWordsByStatus() {
        const all = this.getAllWordData();
        return {
            mastered:   all.filter(w => w.mastery >= this.MASTERY.ALMOST_THERE),
            almostThere: all.filter(w => w.mastery >= this.MASTERY.PRACTISING && w.mastery < this.MASTERY.ALMOST_THERE),
            practising: all.filter(w => w.mastery >= this.MASTERY.LEARNING && w.mastery < this.MASTERY.PRACTISING),
            learning:   all.filter(w => w.mastery < this.MASTERY.LEARNING && w.attempts > 0),
            unseen:     all.filter(w => w.attempts === 0)
        };
    },

    /**
     * Get struggling words (>3 wrong answers and <50% accuracy).
     */
    getStrugglingWords() {
        return this.getAllWordData().filter(
            w => w.wrongFirst > 3 && w.attempts > 0 && (w.correct / w.attempts) < 0.5
        );
    },

    /**
     * Get average mastery score for a mode/difficulty (0-100).
     * Used for star ratings on the progression map.
     */
    getModeMastery(difficulty) {
        const wordSet = WORD_SETS[difficulty];
        if (!wordSet || wordSet.length === 0) return 0;

        let totalMastery = 0;
        for (const word of wordSet) {
            totalMastery += this.calculateMastery(word);
        }
        return Math.round(totalMastery / wordSet.length);
    },

    /**
     * Get recent session history (last N sessions).
     */
    getRecentSessions(limit = 10) {
        const sessions = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.SESSION_PREFIX)) {
                try {
                    sessions.push(JSON.parse(localStorage.getItem(key)));
                } catch { /* ignore */ }
            }
        }

        sessions.sort((a, b) => b.date - a.date);
        return sessions.slice(0, limit);
    },

    /**
     * Get total time played in seconds.
     */
    getTotalTimePlayed() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.SESSION_PREFIX)) {
                try {
                    const session = JSON.parse(localStorage.getItem(key));
                    total += session.totalTime || 0;
                } catch { /* ignore */ }
            }
        }
        return total;
    },

    /**
     * Reset all progress data.
     */
    resetAllProgress() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.startsWith(this.WORD_PREFIX) ||
                key.startsWith(this.SESSION_PREFIX) ||
                key === this.PROGRESS_KEY
            )) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove) {
            localStorage.removeItem(key);
        }
    },

    // ── utility ──
    _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
