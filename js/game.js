/**
 * Word Hunt Game Logic
 *
 * State machine: START -> LOADING -> PLAYING -> COMPLETE
 */

// Game state
const GameState = {
    START: 'start',
    LOADING: 'loading',
    PLAYING: 'playing',
    COMPLETE: 'complete'
};

// Button colors
const COLORS = ['coral', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'teal'];

// Game instance
class WordHuntGame {
    constructor() {
        this.state = GameState.START;
        this.difficulty = 'alphabet';
        this.currentWordIndex = 0;
        this.targetWord = '';
        this.gameWords = [];
        this.displayedWords = [];

        // Scoring
        this.score = 0;
        this.roundStartTime = 0;
        this.gameStartTime = 0;
        this.timerInterval = null;

        // Streak tracking
        this.streak = 0;
        this.wrongThisRound = false;

        // Session tracking
        this.currentSession = null;

        // Dynamic distractor count for current word
        this.currentDistractorCount = WORDS_PER_ROUND;

        this.initElements();
        this.bindEvents();
        this.loadSettings();
    }

    initElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.loadingScreen = document.getElementById('loading-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.completeScreen = document.getElementById('complete-screen');

        // Buttons
        this.playBtn = document.getElementById('play-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.homeBtn = document.getElementById('home-btn');
        this.replayAudioBtn = document.getElementById('replay-audio-btn');
        this.backBtn = document.getElementById('back-btn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');

        // Game elements
        this.wordArea = document.getElementById('word-area');
        this.targetDisplay = document.getElementById('target-display');
        this.targetLabel = document.getElementById('target-label');
        this.targetWordEl = document.getElementById('target-word');
        this.currentWordEl = document.getElementById('current-word');
        this.totalWordsEl = document.getElementById('total-words');
        this.confettiContainer = document.getElementById('confetti-container');
        this.completeMessage = document.getElementById('complete-message');

        // Music toggle
        this.musicToggleBtn = document.getElementById('music-toggle-btn');
        this.musicIconOn = document.getElementById('music-icon-on');
        this.musicIconOff = document.getElementById('music-icon-off');

        // Scoring elements
        this.timerEl = document.getElementById('timer');
        this.scoreEl = document.getElementById('score');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalTimeEl = document.getElementById('final-time');
        this.leaderboardEl = document.getElementById('leaderboard');
        this.newHighScoreEl = document.getElementById('new-high-score');

        // Streak element
        this.streakEl = document.getElementById('streak-counter');

        // Dashboard elements
        this.dashboardScreen = document.getElementById('dashboard-screen');
        this.dashboardBtn = document.getElementById('dashboard-btn');
        this.dashboardBackBtn = document.getElementById('dashboard-back-btn');
        this.dashboardResetBtn = document.getElementById('dashboard-reset-btn');
    }

    bindEvents() {
        // Play button
        this.playBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.startGame());
        this.homeBtn.addEventListener('click', () => {
            audioManager.playClick();
            this.showScreen(GameState.START);
        });

        // Replay audio button
        this.replayAudioBtn.addEventListener('click', () => this.replayCurrentWord());

        // Back button
        this.backBtn.addEventListener('click', () => {
            audioManager.playClick();
            this.goToMenu();
        });

        // Music toggle
        this.musicToggleBtn.addEventListener('click', () => this.toggleMusic());
        // Set initial state
        this.updateMusicButton();

        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                audioManager.playClick();
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                ProgressTracker.updateSetting('lastDifficulty', this.difficulty);
            });
        });

        // Dashboard
        if (this.dashboardBtn) {
            this.dashboardBtn.addEventListener('click', () => {
                audioManager.playClick();
                this.showDashboard();
            });
        }
        if (this.dashboardBackBtn) {
            this.dashboardBackBtn.addEventListener('click', () => {
                audioManager.playClick();
                this.showScreen(GameState.START);
            });
        }
        if (this.dashboardResetBtn) {
            this.dashboardResetBtn.addEventListener('click', () => {
                if (confirm('Reset all progress? This cannot be undone.')) {
                    ProgressTracker.resetAllProgress();
                    this.showDashboard(); // refresh
                }
            });
        }
    }

    loadSettings() {
        const settings = ProgressTracker.getSettings();

        // Restore music preference
        audioManager.musicEnabled = settings.musicEnabled;
        this.updateMusicButton();

        // Restore last difficulty
        this.difficulty = settings.lastDifficulty || 'alphabet';
        this.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.difficulty);
        });
    }

    goToMenu() {
        this.stopTimer();
        audioManager.stopBackgroundMusic();
        this.showScreen(GameState.START);
    }

    toggleMusic() {
        audioManager.toggleMusic();
        this.updateMusicButton();
        ProgressTracker.updateSetting('musicEnabled', audioManager.musicEnabled);
    }

    updateMusicButton() {
        if (audioManager.musicEnabled) {
            this.musicToggleBtn.classList.add('active');
            this.musicIconOn.style.display = '';
            this.musicIconOff.style.display = 'none';
        } else {
            this.musicToggleBtn.classList.remove('active');
            this.musicIconOn.style.display = 'none';
            this.musicIconOff.style.display = '';
        }
    }

    isAlphabetMode() {
        return this.difficulty === 'alphabet';
    }

    showScreen(screenName) {
        const screens = [this.startScreen, this.loadingScreen, this.gameScreen, this.completeScreen, this.dashboardScreen].filter(Boolean);
        screens.forEach(screen => screen.classList.remove('active'));

        switch (screenName) {
            case GameState.START:
                this.startScreen.classList.add('active');
                break;
            case GameState.LOADING:
                this.loadingScreen.classList.add('active');
                break;
            case GameState.PLAYING:
                this.gameScreen.classList.add('active');
                break;
            case GameState.COMPLETE:
                this.completeScreen.classList.add('active');
                break;
        }

        this.state = screenName;
    }

    async startGame() {
        // Unlock audio on user interaction
        await audioManager.unlockAudio();
        audioManager.playGameStart();

        this.showScreen(GameState.LOADING);

        // Select words for this game (adaptive)
        this.selectGameWords();

        // Preload audio
        await audioManager.preloadWords(this.gameWords, this.isAlphabetMode());

        // Small delay for visual feedback
        await this.delay(500);

        // Start playing
        this.currentWordIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.wrongThisRound = false;
        this.scoreEl.textContent = '0';
        this.updateStreakDisplay();
        this.totalWordsEl.textContent = WORDS_PER_GAME;

        // Start session tracking
        this.currentSession = ProgressTracker.startSession('word-hunt', this.difficulty);

        this.showScreen(GameState.PLAYING);
        this.startTimer();
        audioManager.startBackgroundMusic();
        this.showNextWord();
    }

    selectGameWords() {
        this.gameWords = ProgressTracker.selectAdaptiveWords(this.difficulty, WORDS_PER_GAME);
    }

    startTimer() {
        this.gameStartTime = Date.now();
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => this.updateTimerDisplay(), 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const elapsed = Date.now() - this.gameStartTime;
        const seconds = Math.floor(elapsed / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getElapsedSeconds() {
        return (Date.now() - this.gameStartTime) / 1000;
    }

    calculateRoundScore(roundTimeMs) {
        // Base 100 points per word, bonus for speed
        // Under 2s = 100 bonus, under 4s = 50 bonus, under 7s = 25 bonus
        const seconds = roundTimeMs / 1000;
        const base = 100;
        let bonus = 0;
        if (seconds < 2) bonus = 100;
        else if (seconds < 4) bonus = 50;
        else if (seconds < 7) bonus = 25;
        return base + bonus;
    }

    getScores(difficulty) {
        try {
            const raw = localStorage.getItem(`wordhunt-scores-${difficulty}`);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    saveScore(difficulty, score, time) {
        const scores = this.getScores(difficulty);
        scores.push({ score, time, date: Date.now() });
        scores.sort((a, b) => b.score - a.score);
        // Keep top 3
        localStorage.setItem(`wordhunt-scores-${difficulty}`, JSON.stringify(scores.slice(0, 3)));
        return scores;
    }

    showNextWord() {
        if (this.currentWordIndex >= this.gameWords.length) {
            this.gameComplete();
            return;
        }

        this.targetWord = this.gameWords[this.currentWordIndex];
        this.currentWordEl.textContent = this.currentWordIndex + 1;
        this.roundStartTime = Date.now();
        this.wrongThisRound = false;

        // Set dynamic distractor count based on word mastery
        this.currentDistractorCount = ProgressTracker.getDistractorCount(this.targetWord);

        // Update display based on mode
        if (this.isAlphabetMode()) {
            this.targetDisplay.classList.add('audio-only');
            this.targetLabel.textContent = 'Listen for the letter!';
            this.targetWordEl.textContent = '';
        } else {
            this.targetDisplay.classList.remove('audio-only');
            this.targetLabel.textContent = 'Find the word:';
            this.targetWordEl.textContent = this.targetWord;
        }

        // Select distractor words
        this.selectDisplayedWords();

        // Render word buttons
        this.renderWords();

        // Play audio after a short delay
        setTimeout(() => {
            this.playTargetAudio();
        }, 500);
    }

    playTargetAudio() {
        if (this.isAlphabetMode()) {
            audioManager.playLetter(this.targetWord);
        } else {
            audioManager.playFindWord(this.targetWord);
        }
    }

    selectDisplayedWords() {
        const wordSet = WORD_SETS[this.difficulty];
        const totalButtons = this.currentDistractorCount;

        // Start with the target word
        const words = [this.targetWord];

        // Add random distractors
        const available = wordSet.filter(w => w !== this.targetWord);
        const shuffled = this.shuffle([...available]);

        while (words.length < totalButtons && shuffled.length > 0) {
            words.push(shuffled.pop());
        }

        // Shuffle final list
        this.displayedWords = this.shuffle(words);
    }

    renderWords() {
        // Clear previous words
        this.wordArea.innerHTML = '';

        const areaRect = this.wordArea.getBoundingClientRect();
        const buttons = [];

        // Create all buttons first to measure them
        this.displayedWords.forEach((word, index) => {
            const btn = document.createElement('button');
            btn.className = `word-btn ${COLORS[index % COLORS.length]}`;
            btn.textContent = word;
            btn.style.animationDelay = `${index * 0.08}s`;

            btn.addEventListener('click', () => this.handleWordClick(word, btn));

            this.wordArea.appendChild(btn);
            buttons.push({ btn, word, index });
        });

        // Position using improved grid-jitter algorithm
        requestAnimationFrame(() => {
            const measurements = buttons.map(({ btn }) => {
                const rect = btn.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });

            const positions = this._gridJitterLayout(
                areaRect.width, areaRect.height,
                measurements
            );

            for (let i = 0; i < buttons.length; i++) {
                const { btn } = buttons[i];
                btn.style.left = `${positions[i].x}px`;
                btn.style.top = `${positions[i].y}px`;
            }
        });
    }

    /**
     * Improved layout: compute grid cells then jitter within them.
     * Guarantees no text-on-text overlap while feeling scattered.
     */
    _gridJitterLayout(areaW, areaH, measurements) {
        const n = measurements.length;
        const padding = 8;

        // Find average button size to compute grid dimensions
        let avgW = 0, avgH = 0;
        for (const m of measurements) { avgW += m.width; avgH += m.height; }
        avgW /= n; avgH /= n;

        // Determine grid cols/rows that fit the area
        const cols = Math.max(2, Math.round(Math.sqrt(n * (areaW / areaH))));
        const rows = Math.ceil(n / cols);
        const cellW = areaW / cols;
        const cellH = areaH / rows;

        // Assign buttons to shuffled grid cells
        const cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                cells.push({ col: c, row: r });
            }
        }
        // Shuffle cells so placement doesn't follow a grid pattern
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        // Sort buttons by area (larger first) for best cell assignment
        const indices = measurements.map((_, i) => i);
        indices.sort((a, b) => {
            const areaA = measurements[a].width * measurements[a].height;
            const areaB = measurements[b].width * measurements[b].height;
            return areaB - areaA;
        });

        const positions = new Array(n);

        for (let i = 0; i < n; i++) {
            const idx = indices[i];
            const { width, height } = measurements[idx];
            const cell = cells[i];

            // Cell boundaries
            const cellLeft = cell.col * cellW;
            const cellTop = cell.row * cellH;

            // Jitter within the cell, keeping the button inside area bounds
            const maxJitterX = Math.max(0, cellW - width - padding);
            const maxJitterY = Math.max(0, cellH - height - padding);

            const x = Math.min(
                areaW - width - padding,
                Math.max(padding, cellLeft + Math.random() * maxJitterX)
            );
            const y = Math.min(
                areaH - height - padding,
                Math.max(padding, cellTop + Math.random() * maxJitterY)
            );

            positions[idx] = { x, y };
        }

        return positions;
    }

    async handleWordClick(word, btn) {
        if (word === this.targetWord) {
            await this.handleCorrect(btn);
        } else {
            await this.handleWrong(btn);
        }
    }

    async handleCorrect(btn) {
        // Calculate round score
        const roundTime = Date.now() - this.roundStartTime;
        const roundScore = this.calculateRoundScore(roundTime);
        this.score += roundScore;
        this.scoreEl.textContent = this.score;

        // Update streak
        if (!this.wrongThisRound) {
            this.streak++;
            // Record correct in progress tracker
            ProgressTracker.recordCorrect(this.targetWord, roundTime);
        }
        this.updateStreakDisplay();

        // Record to session
        if (this.currentSession) {
            ProgressTracker.addSessionResult(
                this.currentSession, this.targetWord,
                !this.wrongThisRound, this.wrongThisRound ? 2 : 1, roundTime
            );
        }

        // Show points earned on the button area
        this.showPointsPopup(btn, roundScore);

        // Visual feedback
        btn.classList.add('correct');
        this.createStarBurst(btn);

        // Streak milestone animation (3+ in a row)
        if (this.streak >= 3 && !this.wrongThisRound) {
            this.showStreakMilestone();
        }

        // Play correct sound effect
        audioManager.playCorrect();
        await this.delay(300);

        // Play victory phrase and wait for it to finish
        await audioManager.playVictory();

        // Small pause before next word
        await this.delay(400);

        // Next word
        this.currentWordIndex++;
        this.showNextWord();
    }

    showPointsPopup(btn, points) {
        const rect = btn.getBoundingClientRect();
        const areaRect = this.wordArea.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.textContent = `+${points}`;
        popup.style.left = `${rect.left - areaRect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - areaRect.top}px`;
        this.wordArea.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    async handleWrong(btn) {
        // Record wrong answer on first miss this round
        if (!this.wrongThisRound) {
            this.wrongThisRound = true;
            this.streak = 0;
            this.updateStreakDisplay();
            const roundTime = Date.now() - this.roundStartTime;
            ProgressTracker.recordWrong(this.targetWord, roundTime);
        }

        // Visual feedback
        btn.classList.add('wrong');

        // Play sound
        audioManager.playTryAgain();

        // Remove animation class after it completes
        await this.delay(500);
        btn.classList.remove('wrong');
    }

    createStarBurst(btn) {
        const rect = btn.getBoundingClientRect();
        const areaRect = this.wordArea.getBoundingClientRect();
        const centerX = rect.left - areaRect.left + rect.width / 2;
        const centerY = rect.top - areaRect.top + rect.height / 2;

        for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.className = 'star-burst';
            star.textContent = '★';
            star.style.left = `${centerX}px`;
            star.style.top = `${centerY}px`;
            star.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            star.style.animationDelay = `${i * 0.1}s`;

            this.wordArea.appendChild(star);

            // Remove after animation
            setTimeout(() => star.remove(), 1000);
        }
    }

    gameComplete() {
        this.stopTimer();
        audioManager.stopBackgroundMusic();
        const totalTime = (Date.now() - this.gameStartTime) / 1000;

        // End session tracking
        if (this.currentSession) {
            ProgressTracker.endSession(this.currentSession, this.score, totalTime);
            this.currentSession = null;
        }

        // Update message based on mode
        if (this.isAlphabetMode()) {
            this.completeMessage.textContent = 'You found all the letters!';
        } else {
            this.completeMessage.textContent = 'You found all the words!';
        }

        // Show final score and time
        this.finalScoreEl.textContent = this.score;
        const mins = Math.floor(totalTime / 60);
        const secs = Math.floor(totalTime % 60);
        this.finalTimeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Save and show leaderboard
        const allScores = this.saveScore(this.difficulty, this.score, totalTime);
        this.renderLeaderboard(allScores);

        // Check if new high score (top of the list)
        const isNewHigh = allScores[0].score === this.score && allScores[0].date >= Date.now() - 1000;
        const isTop3 = allScores.slice(0, 3).some(s => s.score === this.score && s.date >= Date.now() - 1000);
        if (isNewHigh) {
            this.newHighScoreEl.textContent = 'New High Score!';
            this.newHighScoreEl.style.display = 'block';
            audioManager.playHighScore();
        } else if (isTop3) {
            this.newHighScoreEl.textContent = 'Top 3 Score!';
            this.newHighScoreEl.style.display = 'block';
            audioManager.playTopThree();
        } else {
            this.newHighScoreEl.style.display = 'none';
            audioManager.playVictory();
        }

        this.showScreen(GameState.COMPLETE);
        this.createConfetti();
    }

    renderLeaderboard(scores) {
        const top3 = scores.slice(0, 3);
        if (top3.length === 0) {
            this.leaderboardEl.innerHTML = '';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        this.leaderboardEl.innerHTML = top3.map((s, i) => {
            const mins = Math.floor(s.time / 60);
            const secs = Math.floor(s.time % 60);
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            const isCurrentGame = s.score === this.score && s.date >= Date.now() - 1000;
            const highlight = isCurrentGame ? ' class="current-score"' : '';
            return `<div${highlight}><span class="medal">${medals[i]}</span> <span class="lb-score">${s.score}</span> <span class="lb-time">${timeStr}</span></div>`;
        }).join('');
    }

    createConfetti() {
        this.confettiContainer.innerHTML = '';

        const colors = ['#FF6B6B', '#FF9F43', '#FECA57', '#5CD85C', '#54A0FF', '#9B59B6', '#FF78C4', '#00CEC9'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;

            this.confettiContainer.appendChild(confetti);
        }
    }

    // ── Streak display ──

    updateStreakDisplay() {
        if (!this.streakEl) return;
        if (this.streak >= 2) {
            this.streakEl.textContent = `${this.streak} in a row!`;
            this.streakEl.style.display = '';
            this.streakEl.classList.remove('streak-pop');
            // trigger reflow to restart animation
            void this.streakEl.offsetWidth;
            this.streakEl.classList.add('streak-pop');
        } else {
            this.streakEl.style.display = 'none';
        }
    }

    showStreakMilestone() {
        if (!this.streakEl) return;
        this.streakEl.classList.remove('streak-milestone');
        void this.streakEl.offsetWidth;
        this.streakEl.classList.add('streak-milestone');
    }

    // ── Parent dashboard ──

    showDashboard() {
        this.renderDashboard();
        const screens = [this.startScreen, this.loadingScreen, this.gameScreen, this.completeScreen, this.dashboardScreen].filter(Boolean);
        screens.forEach(s => s.classList.remove('active'));
        if (this.dashboardScreen) {
            this.dashboardScreen.classList.add('active');
        }
    }

    renderDashboard() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        const progress = ProgressTracker.getProgress();
        const status = ProgressTracker.getWordsByStatus();
        const struggling = ProgressTracker.getStrugglingWords();
        const sessions = ProgressTracker.getRecentSessions(10);
        const totalTime = ProgressTracker.getTotalTimePlayed();

        const formatTime = (s) => {
            if (s < 60) return `${s}s`;
            const m = Math.floor(s / 60);
            const sec = s % 60;
            if (m < 60) return `${m}m ${sec}s`;
            const h = Math.floor(m / 60);
            return `${h}h ${m % 60}m`;
        };

        const milestones = [10, 25, 50, 100];
        const nextMilestone = milestones.find(m => m > progress.totalWordsLearned) || 'all';

        let html = '';

        // Summary stats
        html += `<div class="dash-section">`;
        html += `<h3>Overview</h3>`;
        html += `<div class="dash-stats-grid">`;
        html += `<div class="dash-stat"><div class="dash-stat-value">${progress.totalWordsLearned}</div><div class="dash-stat-label">Words Learned</div></div>`;
        html += `<div class="dash-stat"><div class="dash-stat-value">${progress.totalSessions}</div><div class="dash-stat-label">Sessions</div></div>`;
        html += `<div class="dash-stat"><div class="dash-stat-value">${formatTime(totalTime)}</div><div class="dash-stat-label">Time Played</div></div>`;
        html += `<div class="dash-stat"><div class="dash-stat-value">${nextMilestone === 'all' ? 'Done!' : nextMilestone}</div><div class="dash-stat-label">Next Milestone</div></div>`;
        html += `</div></div>`;

        // Word status breakdown
        html += `<div class="dash-section">`;
        html += `<h3>Word Progress</h3>`;
        html += `<div class="dash-bar">`;
        const total = status.mastered.length + status.almostThere.length + status.practising.length + status.learning.length + status.unseen.length;
        if (total > 0) {
            const pct = (arr) => Math.round(arr.length / total * 100);
            html += `<div class="dash-bar-seg mastered" style="width:${pct(status.mastered)}%" title="Mastered: ${status.mastered.length}"></div>`;
            html += `<div class="dash-bar-seg almost" style="width:${pct(status.almostThere)}%" title="Almost: ${status.almostThere.length}"></div>`;
            html += `<div class="dash-bar-seg practising" style="width:${pct(status.practising)}%" title="Practising: ${status.practising.length}"></div>`;
            html += `<div class="dash-bar-seg learning" style="width:${pct(status.learning)}%" title="Learning: ${status.learning.length}"></div>`;
            html += `<div class="dash-bar-seg unseen" style="width:${pct(status.unseen)}%" title="Unseen: ${status.unseen.length}"></div>`;
        }
        html += `</div>`;
        html += `<div class="dash-legend">`;
        html += `<span><i class="dot mastered"></i>Mastered (${status.mastered.length})</span>`;
        html += `<span><i class="dot almost"></i>Almost (${status.almostThere.length})</span>`;
        html += `<span><i class="dot practising"></i>Practising (${status.practising.length})</span>`;
        html += `<span><i class="dot learning"></i>Learning (${status.learning.length})</span>`;
        html += `<span><i class="dot unseen"></i>Unseen (${status.unseen.length})</span>`;
        html += `</div></div>`;

        // Struggling words
        if (struggling.length > 0) {
            html += `<div class="dash-section">`;
            html += `<h3>Needs Practice</h3>`;
            html += `<div class="dash-word-list">`;
            for (const w of struggling.slice(0, 10)) {
                const pct = w.attempts > 0 ? Math.round(w.correct / w.attempts * 100) : 0;
                html += `<span class="dash-word struggling">${w.word} <small>${pct}%</small></span>`;
            }
            html += `</div></div>`;
        }

        // Recent sessions
        if (sessions.length > 0) {
            html += `<div class="dash-section">`;
            html += `<h3>Recent Sessions</h3>`;
            html += `<div class="dash-sessions">`;
            for (const s of sessions) {
                const d = new Date(s.date);
                const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
                const accuracy = s.wordsAttempted > 0 ? Math.round(s.wordsCorrect / s.wordsAttempted * 100) : 0;
                html += `<div class="dash-session-row">`;
                html += `<span class="dash-session-date">${dateStr}</span>`;
                html += `<span class="dash-session-diff">${s.difficulty || ''}</span>`;
                html += `<span class="dash-session-score">${s.score}</span>`;
                html += `<span class="dash-session-acc">${accuracy}%</span>`;
                html += `<span class="dash-session-time">${formatTime(s.totalTime)}</span>`;
                html += `</div>`;
            }
            html += `</div></div>`;
        }

        container.innerHTML = html;
    }

    replayCurrentWord() {
        this.playTargetAudio();
    }

    // Utility functions
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordHuntGame();
});
