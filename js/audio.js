/**
 * Audio management for Word Hunt game
 *
 * Audio files hosted on Cloudflare R2:
 * https://pub-39b6eccef9ff4f43a7db37a762a6e6d8.r2.dev/word-hunt/audio/
 */

const AUDIO_BASE_URL = 'https://pub-39b6eccef9ff4f43a7db37a762a6e6d8.r2.dev/word-hunt/audio';

// Victory phrases available
const VICTORY_PHRASES = [
    'excellent',
    'great-job',
    'great-job-2',
    'victory1',
    'victory2',
    'victory3',
    'victory4',
    'victory5',
    'well-done',
    'you-did-it'
];

const HIGH_SCORE_PHRASES = ['high-score/high-score1', 'high-score/high-score2', 'high-score/high-score3'];
const TOP_THREE_PHRASES = ['high-score/top-three1', 'high-score/top-three2', 'high-score/top-three3'];

const BACKGROUND_TRACKS = [
    'background/Ever-Youre-Doing-Great',
    'background/Open-up-the-page',
    'background/Retrowave'
];

class AudioManager {
    constructor() {
        this.audioCache = new Map();
        this.audioUnlocked = false;
        this.audioEnabled = true;
        this.musicEnabled = true;
        this.bgMusic = null;
    }

    /**
     * Unlock audio on iOS/mobile (requires user interaction)
     */
    async unlockAudio() {
        if (this.audioUnlocked) return;

        // Create and play a silent audio context to unlock
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const buffer = ctx.createBuffer(1, 1, 22050);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
                await ctx.resume();
            }
            this.audioUnlocked = true;
        } catch (e) {
            console.log('Audio unlock not needed or failed:', e);
            this.audioUnlocked = true;
        }
    }

    /**
     * Preload audio files for a word set
     * @param {string[]} words - Array of words/letters to preload
     * @param {string} mode - 'words', 'alphabet', 'sound-match', or 'word-builder'
     */
    async preloadWords(words, mode = 'words') {
        const loadPromises = [];

        // Preload word/letter prompts
        if (mode === 'word-builder') {
            for (const word of words) {
                const w = word.toLowerCase();
                loadPromises.push(this.preloadAudio(`segment/${w}`));
                loadPromises.push(this.preloadAudio(`blend/${w}`));
            }
            // Preload builder prompt phrases
            for (let i = 1; i <= 5; i++) {
                loadPromises.push(this.preloadAudio(`word-builder/prompt-${i}`));
            }
        } else if (mode === 'sound-match') {
            for (const word of words) {
                const letter = word.toLowerCase();
                loadPromises.push(this.preloadAudio(`sound-match/${letter}`));
                loadPromises.push(this.preloadAudio(`phonemes/${letter}`));
                loadPromises.push(this.preloadAudio(`keywords/${letter}`));
            }
        } else {
            const folder = mode === 'alphabet' ? 'alphabet' : 'find';
            for (const word of words) {
                loadPromises.push(this.preloadAudio(`${folder}/${word.toLowerCase()}`));
            }
        }

        // Preload victory phrases
        for (const phrase of VICTORY_PHRASES) {
            loadPromises.push(this.preloadAudio(`victory/${phrase}`));
        }

        // Preload high score / top three phrases
        for (const phrase of HIGH_SCORE_PHRASES) {
            loadPromises.push(this.preloadAudio(`victory/${phrase}`));
        }
        for (const phrase of TOP_THREE_PHRASES) {
            loadPromises.push(this.preloadAudio(`victory/${phrase}`));
        }

        // Preload effects
        loadPromises.push(this.preloadAudio('effects/click'));
        loadPromises.push(this.preloadAudio('effects/game-start'));
        loadPromises.push(this.preloadAudio('effects/correct'));
        loadPromises.push(this.preloadAudio('effects/try-again'));

        // Wait for all to load (with timeout)
        await Promise.allSettled(loadPromises);
    }

    /**
     * Preload a single audio file
     */
    preloadAudio(path) {
        return new Promise((resolve) => {
            if (this.audioCache.has(path)) {
                resolve(this.audioCache.get(path));
                return;
            }

            const audio = new Audio();
            audio.preload = 'auto';

            const timeout = setTimeout(() => {
                console.log(`Audio load timeout: ${path}`);
                resolve(null);
            }, 5000);

            audio.oncanplaythrough = () => {
                clearTimeout(timeout);
                this.audioCache.set(path, audio);
                resolve(audio);
            };

            audio.onerror = () => {
                clearTimeout(timeout);
                console.log(`Audio load failed: ${path}`);
                resolve(null);
            };

            audio.src = `${AUDIO_BASE_URL}/${path}.mp3`;
        });
    }

    /**
     * Play audio for "Find the word... [word]"
     */
    async playFindWord(word) {
        if (!this.audioEnabled) return;
        await this.playAudio(`find/${word.toLowerCase()}`);
    }

    /**
     * Play audio for a letter (alphabet mode)
     */
    async playLetter(letter) {
        if (!this.audioEnabled) return;
        await this.playAudio(`alphabet/${letter.toLowerCase()}`);
    }

    /**
     * Play sound-match prompt for a letter ("What letter makes the /s/ sound?")
     */
    async playSoundMatchPrompt(letter) {
        if (!this.audioEnabled) return;
        await this.playAudio(`sound-match/${letter.toLowerCase()}`);
    }

    /**
     * Play raw phoneme sound for a letter
     */
    async playPhoneme(letter) {
        if (!this.audioEnabled) return;
        await this.playAudio(`phonemes/${letter.toLowerCase()}`);
    }

    /**
     * Play keyword audio for a letter ("s is for snake")
     */
    async playKeyword(letter) {
        if (!this.audioEnabled) return;
        await this.playAudio(`keywords/${letter.toLowerCase()}`);
    }

    /**
     * Play segmented phoneme audio for a word (word builder mode)
     */
    async playSegmented(word) {
        if (!this.audioEnabled) return;
        await this.playAudioAndWait(`segment/${word.toLowerCase()}`);
    }

    /**
     * Play blended word celebration audio (word builder mode)
     */
    async playBlend(word) {
        if (!this.audioEnabled) return;
        await this.playAudioAndWait(`blend/${word.toLowerCase()}`);
    }

    /**
     * Play a random builder prompt phrase (word builder mode)
     */
    async playBuilderPrompt() {
        if (!this.audioEnabled) return;
        const n = Math.floor(Math.random() * 5) + 1;
        await this.playAudioAndWait(`word-builder/prompt-${n}`);
    }

    /**
     * Play a random victory phrase and wait for it to finish
     */
    async playVictory() {
        if (!this.audioEnabled) return;
        const phrase = VICTORY_PHRASES[Math.floor(Math.random() * VICTORY_PHRASES.length)];
        await this.playAudioAndWait(`victory/${phrase}`);
    }

    /**
     * Play a random high score phrase and wait for it to finish
     */
    async playHighScore() {
        if (!this.audioEnabled) return;
        const phrase = HIGH_SCORE_PHRASES[Math.floor(Math.random() * HIGH_SCORE_PHRASES.length)];
        await this.playAudioAndWait(`victory/${phrase}`);
    }

    /**
     * Play a random top-three phrase and wait for it to finish
     */
    async playTopThree() {
        if (!this.audioEnabled) return;
        const phrase = TOP_THREE_PHRASES[Math.floor(Math.random() * TOP_THREE_PHRASES.length)];
        await this.playAudioAndWait(`victory/${phrase}`);
    }

    /**
     * Play click sound effect
     */
    async playClick() {
        if (!this.audioEnabled) return;
        await this.playAudio('effects/click');
    }

    /**
     * Play game start sound effect
     */
    async playGameStart() {
        if (!this.audioEnabled) return;
        await this.playAudio('effects/game-start');
    }

    /**
     * Play correct answer sound effect
     */
    async playCorrect() {
        if (!this.audioEnabled) return;
        await this.playAudio('effects/correct');
    }

    /**
     * Play wrong answer sound effect
     */
    async playTryAgain() {
        if (!this.audioEnabled) return;
        await this.playAudio('effects/try-again');
    }

    /**
     * Play an audio file (starts playback, doesn't wait for completion)
     */
    async playAudio(path) {
        const cached = this.audioCache.get(path);

        if (cached) {
            try {
                cached.currentTime = 0;
                await cached.play();
            } catch (e) {
                console.log('Audio play failed:', e);
            }
        } else {
            // Try to load and play on demand
            const audio = new Audio(`${AUDIO_BASE_URL}/${path}.mp3`);
            try {
                await audio.play();
                this.audioCache.set(path, audio);
            } catch (e) {
                console.log('Audio play failed:', e);
            }
        }
    }

    /**
     * Play an audio file and wait for it to finish
     */
    async playAudioAndWait(path) {
        const cached = this.audioCache.get(path);
        const audio = cached || new Audio(`${AUDIO_BASE_URL}/${path}.mp3`);

        return new Promise((resolve) => {
            const onEnded = () => {
                audio.removeEventListener('ended', onEnded);
                resolve();
            };

            audio.addEventListener('ended', onEnded);

            try {
                audio.currentTime = 0;
                audio.play().catch(() => resolve());

                if (!cached) {
                    this.audioCache.set(path, audio);
                }
            } catch (e) {
                console.log('Audio play failed:', e);
                resolve();
            }

            // Fallback timeout in case 'ended' never fires
            setTimeout(resolve, 5000);
        });
    }

    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        return this.audioEnabled;
    }

    /**
     * Start background music (random track, looping)
     */
    startBackgroundMusic() {
        this.stopBackgroundMusic();
        if (!this.musicEnabled) return;

        const track = BACKGROUND_TRACKS[Math.floor(Math.random() * BACKGROUND_TRACKS.length)];
        const parts = track.split('/');
        const encoded = parts.map(p => encodeURIComponent(p)).join('/');
        const audio = new Audio(`${AUDIO_BASE_URL}/${encoded}.mp3`);
        audio.loop = true;
        audio.volume = 0.25;

        audio.play().catch(e => console.log('Background music play failed:', e));
        this.bgMusic = audio;
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
            this.bgMusic = null;
        }
    }

    /**
     * Toggle background music on/off
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        return this.musicEnabled;
    }
}

// Global audio manager instance
const audioManager = new AudioManager();
