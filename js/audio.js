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

class AudioManager {
    constructor() {
        this.audioCache = new Map();
        this.audioUnlocked = false;
        this.audioEnabled = true;
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
     * @param {boolean} isAlphabet - If true, load from alphabet/ folder
     */
    async preloadWords(words, isAlphabet = false) {
        const loadPromises = [];

        // Preload word/letter prompts
        const folder = isAlphabet ? 'alphabet' : 'find';
        for (const word of words) {
            loadPromises.push(this.preloadAudio(`${folder}/${word.toLowerCase()}`));
        }

        // Preload victory phrases
        for (const phrase of VICTORY_PHRASES) {
            loadPromises.push(this.preloadAudio(`victory/${phrase}`));
        }

        // Preload effects
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
     * Play a random victory phrase and wait for it to finish
     */
    async playVictory() {
        if (!this.audioEnabled) return;
        const phrase = VICTORY_PHRASES[Math.floor(Math.random() * VICTORY_PHRASES.length)];
        await this.playAudioAndWait(`victory/${phrase}`);
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
}

// Global audio manager instance
const audioManager = new AudioManager();
