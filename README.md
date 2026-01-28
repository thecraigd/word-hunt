# Word Hunt

A reading game for young children where words are scattered on screen, dad's voice says "find the word... [target]", and the child taps the matching word.

## Quick Start

1. Open `index.html` in a web browser
2. The game works without audio, but is better with dad's voice recordings

## How to Play

1. Select difficulty (Easy or Harder)
2. Tap "Play"
3. Listen for the word to find (or read it on screen)
4. Tap the matching word from the scattered options
5. Find all 10 words to complete the game!

## Word Sets

### Easy (20 words)
Dolch Pre-Primer sight words:
`the`, `a`, `I`, `is`, `it`, `in`, `to`, `and`, `can`, `see`, `go`, `me`, `my`, `we`, `up`, `at`, `on`, `no`, `yes`, `he`

### Harder (25 words)
Kindergarten Dolch + CVC words:
`cat`, `dog`, `mat`, `hat`, `sat`, `run`, `sun`, `big`, `red`, `blue`, `green`, `like`, `look`, `come`, `play`, `said`, `good`, `want`, `this`, `that`, `was`, `are`, `have`, `they`, `with`

## Adding Audio

See [RECORDING-GUIDE.md](RECORDING-GUIDE.md) for instructions on recording dad's voice prompts.

Audio files should be uploaded to Cloudflare R2 at:
```
https://pub-39b6eccef9ff4f43a7db37a762a6e6d8.r2.dev/word-hunt/audio/
```

### Required Audio Files

```
word-hunt/audio/
├── find/                   # "Find the word..." prompts
│   ├── the.mp3
│   ├── cat.mp3
│   └── ... (one per word)
├── victory/                # Celebration phrases
│   ├── great-job.mp3
│   ├── well-done.mp3
│   ├── you-did-it.mp3
│   └── excellent.mp3
└── effects/
    ├── correct.mp3         # Victory ding
    └── try-again.mp3       # Gentle "oops"
```

## Deployment

### GitHub Pages

1. Create a new repo `word-hunt`
2. Push this folder's contents
3. Enable GitHub Pages in Settings
4. Access at `https://yourusername.github.io/word-hunt/`

### Any Static Host

Just upload all files. No build step required.

## Customizing Words

Edit `js/words.js` to add or change words:

```javascript
const WORD_SETS = {
    easy: ['word1', 'word2', ...],
    harder: ['word1', 'word2', ...]
};
```

Remember to record audio for any new words!

## Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge

Works on tablets, phones, and desktop computers.

## Technical Notes

- No build step required
- No npm dependencies
- Fonts loaded from Google Fonts
- Audio loaded from Cloudflare R2
- Touch-optimized with large tap targets (80x80px minimum)
