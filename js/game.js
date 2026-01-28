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

        this.initElements();
        this.bindEvents();
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
            });
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
        const screens = [this.startScreen, this.loadingScreen, this.gameScreen, this.completeScreen];
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

        // Select words for this game
        this.selectGameWords();

        // Preload audio
        await audioManager.preloadWords(this.gameWords, this.isAlphabetMode());

        // Small delay for visual feedback
        await this.delay(500);

        // Start playing
        this.currentWordIndex = 0;
        this.score = 0;
        this.scoreEl.textContent = '0';
        this.totalWordsEl.textContent = WORDS_PER_GAME;
        this.showScreen(GameState.PLAYING);
        this.startTimer();
        audioManager.startBackgroundMusic();
        this.showNextWord();
    }

    selectGameWords() {
        const wordSet = WORD_SETS[this.difficulty];
        const shuffled = this.shuffle([...wordSet]);
        this.gameWords = shuffled.slice(0, WORDS_PER_GAME);
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

        // Start with the target word
        const words = [this.targetWord];

        // Add random distractors
        const available = wordSet.filter(w => w !== this.targetWord);
        const shuffled = this.shuffle([...available]);

        while (words.length < WORDS_PER_ROUND && shuffled.length > 0) {
            words.push(shuffled.pop());
        }

        // Shuffle final list
        this.displayedWords = this.shuffle(words);
    }

    renderWords() {
        // Clear previous words
        this.wordArea.innerHTML = '';

        // Get area dimensions
        const areaRect = this.wordArea.getBoundingClientRect();
        const positions = [];
        const buttons = [];

        const edgePadding = 8;

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

        // Position all buttons in a single rAF to avoid staggered placement
        requestAnimationFrame(() => {
            // Measure all buttons
            const measurements = buttons.map(({ btn }) => {
                const rect = btn.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            });

            // Sort by size (place larger words first for better packing)
            const indices = buttons.map((_, i) => i);
            indices.sort((a, b) => {
                const areaA = measurements[a].width * measurements[a].height;
                const areaB = measurements[b].width * measurements[b].height;
                return areaB - areaA;
            });

            // Place each button
            for (const idx of indices) {
                const { btn } = buttons[idx];
                const { width, height } = measurements[idx];

                const maxX = Math.max(0, areaRect.width - width - edgePadding);
                const maxY = Math.max(0, areaRect.height - height - edgePadding);

                const position = this.findPosition(
                    edgePadding, edgePadding, maxX, maxY,
                    width, height, positions
                );

                positions.push({
                    x: position.x,
                    y: position.y,
                    width: width,
                    height: height
                });

                btn.style.left = `${position.x}px`;
                btn.style.top = `${position.y}px`;
            }
        });
    }

    findPosition(minX, minY, maxX, maxY, width, height, existing) {
        // Shrink collision box to allow slight visual overlap of edges/shadows
        // while ensuring text centers stay well separated and readable
        const overlapAllowX = width * 0.2;
        const overlapAllowY = height * 0.2;

        const maxAttempts = 200;
        let bestPosition = null;
        let bestScore = -Infinity;

        for (let i = 0; i < maxAttempts; i++) {
            const x = minX + Math.random() * Math.max(0, maxX - minX);
            const y = minY + Math.random() * Math.max(0, maxY - minY);

            // Check overlap using shrunk collision boxes
            const hasHeavyOverlap = existing.some(pos => {
                return x + overlapAllowX < pos.x + pos.width - overlapAllowX &&
                       x + width - overlapAllowX > pos.x + overlapAllowX &&
                       y + overlapAllowY < pos.y + pos.height - overlapAllowY &&
                       y + height - overlapAllowY > pos.y + overlapAllowY;
            });

            if (!hasHeavyOverlap) {
                return { x, y };
            }

            // Track the position with the least total overlap for fallback
            let totalOverlap = 0;
            for (const pos of existing) {
                const ox = Math.max(0, Math.min(x + width, pos.x + pos.width) - Math.max(x, pos.x));
                const oy = Math.max(0, Math.min(y + height, pos.y + pos.height) - Math.max(y, pos.y));
                totalOverlap += ox * oy;
            }
            const score = -totalOverlap;
            if (score > bestScore) {
                bestScore = score;
                bestPosition = { x, y };
            }
        }

        // Return the position with the least overlap
        return bestPosition || {
            x: Math.max(minX, Math.min(maxX, minX + Math.random() * Math.max(0, maxX - minX))),
            y: Math.max(minY, Math.min(maxY, minY + Math.random() * Math.max(0, maxY - minY)))
        };
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

        // Show points earned on the button area
        this.showPointsPopup(btn, roundScore);

        // Visual feedback
        btn.classList.add('correct');
        this.createStarBurst(btn);

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
