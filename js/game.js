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
    }

    bindEvents() {
        // Play button
        this.playBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.startGame());

        // Replay audio button
        this.replayAudioBtn.addEventListener('click', () => this.replayCurrentWord());

        // Back button
        this.backBtn.addEventListener('click', () => this.goToMenu());

        // Difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
            });
        });
    }

    goToMenu() {
        this.showScreen(GameState.START);
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

        this.showScreen(GameState.LOADING);

        // Select words for this game
        this.selectGameWords();

        // Preload audio
        await audioManager.preloadWords(this.gameWords, this.isAlphabetMode());

        // Small delay for visual feedback
        await this.delay(500);

        // Start playing
        this.currentWordIndex = 0;
        this.totalWordsEl.textContent = WORDS_PER_GAME;
        this.showScreen(GameState.PLAYING);
        this.showNextWord();
    }

    selectGameWords() {
        const wordSet = WORD_SETS[this.difficulty];
        const shuffled = this.shuffle([...wordSet]);
        this.gameWords = shuffled.slice(0, WORDS_PER_GAME);
    }

    showNextWord() {
        if (this.currentWordIndex >= this.gameWords.length) {
            this.gameComplete();
            return;
        }

        this.targetWord = this.gameWords[this.currentWordIndex];
        this.currentWordEl.textContent = this.currentWordIndex + 1;

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

        // Minimum spacing between words and edge padding
        const minSpacing = 24;
        const edgePadding = 10;

        this.displayedWords.forEach((word, index) => {
            const btn = document.createElement('button');
            btn.className = `word-btn ${COLORS[index % COLORS.length]}`;
            btn.textContent = word;
            btn.style.animationDelay = `${index * 0.08}s`;

            btn.addEventListener('click', () => this.handleWordClick(word, btn));

            this.wordArea.appendChild(btn);

            // Position after adding to DOM to get dimensions
            requestAnimationFrame(() => {
                const btnRect = btn.getBoundingClientRect();

                // Calculate valid positioning bounds (with edge padding)
                const maxX = Math.max(0, areaRect.width - btnRect.width - edgePadding);
                const maxY = Math.max(0, areaRect.height - btnRect.height - edgePadding);

                const position = this.findPosition(
                    edgePadding,
                    edgePadding,
                    maxX,
                    maxY,
                    btnRect.width + minSpacing,
                    btnRect.height + minSpacing,
                    positions
                );

                positions.push({
                    x: position.x,
                    y: position.y,
                    width: btnRect.width + minSpacing,
                    height: btnRect.height + minSpacing
                });

                btn.style.left = `${position.x}px`;
                btn.style.top = `${position.y}px`;
            });
        });
    }

    findPosition(minX, minY, maxX, maxY, width, height, existing) {
        const maxAttempts = 100;

        for (let i = 0; i < maxAttempts; i++) {
            // Generate random position within valid bounds
            const x = minX + Math.random() * Math.max(0, maxX - minX);
            const y = minY + Math.random() * Math.max(0, maxY - minY);

            // Check for overlaps
            const overlaps = existing.some(pos =>
                x < pos.x + pos.width &&
                x + width > pos.x &&
                y < pos.y + pos.height &&
                y + height > pos.y
            );

            if (!overlaps) {
                return { x, y };
            }
        }

        // Fallback: clamp to valid bounds
        return {
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
        // Update message based on mode
        if (this.isAlphabetMode()) {
            this.completeMessage.textContent = 'You found all the letters!';
        } else {
            this.completeMessage.textContent = 'You found all the words!';
        }

        this.showScreen(GameState.COMPLETE);
        this.createConfetti();
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
