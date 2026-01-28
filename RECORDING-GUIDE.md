# Recording Guide for Dad's Voice

This guide explains how to record the audio prompts for Word Hunt.

## What to Record

### Word Prompts (45 total)

For each word, say clearly:

> "Find the word... [word]"

**Easy words (20):**
the, a, I, is, it, in, to, and, can, see, go, me, my, we, up, at, on, no, yes, he

**Harder words (25):**
cat, dog, mat, hat, sat, run, sun, big, red, blue, green, like, look, come, play, said, good, want, this, that, was, are, have, they, with

### Tips for Recording Word Prompts

- Speak warmly and encouragingly
- Pause briefly after "word" for emphasis: "Find the word... [pause]... cat"
- Keep consistent volume across recordings
- Each recording should be 2-4 seconds

### Victory Phrases (4-5)

Record these celebration phrases:

1. "Great job!"
2. "Well done!"
3. "You did it!"
4. "Excellent!"
5. (Optional) "That's right!"

### Tips for Victory Phrases

- Sound genuinely excited and proud
- Keep them short and punchy (1-2 seconds)
- Vary your enthusiasm slightly between recordings

### Sound Effects (Optional)

If you want custom effects, you can also record:

- **correct.mp3** - A happy "ding" or chime sound
- **try-again.mp3** - A gentle "oops" or "uh-oh" sound

Or use free sound effect libraries like [Freesound.org](https://freesound.org).

## Recording Setup

### Equipment

Any of these will work:
- iPhone Voice Memos app
- Android Voice Recorder app
- Computer with microphone
- Any recording app

### Environment

- Quiet room (turn off fans, close windows)
- No echo (soft furnishings help)
- Consistent distance from microphone

### Format

- **Format:** MP3 (or M4A, which can be converted)
- **Quality:** Any reasonable quality is fine
- **Length:** 1-4 seconds per recording

## File Naming

Name each file exactly as follows (lowercase, no spaces):

### Word Prompts
```
the.mp3
a.mp3
i.mp3    (note: lowercase)
is.mp3
it.mp3
... etc
```

### Victory Phrases
```
great-job.mp3
well-done.mp3
you-did-it.mp3
excellent.mp3
```

### Effects
```
correct.mp3
try-again.mp3
```

## Uploading to Cloudflare R2

### Option 1: Cloudflare Dashboard

1. Go to Cloudflare Dashboard > R2
2. Open the `guardrail-data` bucket
3. Create folder: `word-hunt/audio/find/`
4. Upload all word prompt files
5. Create folder: `word-hunt/audio/victory/`
6. Upload victory phrase files
7. Create folder: `word-hunt/audio/effects/`
8. Upload effect files

### Option 2: Command Line

If you have AWS CLI configured for R2:

```bash
# Set up your audio files in this structure:
# audio/
# ├── find/
# │   ├── the.mp3
# │   └── ...
# ├── victory/
# │   ├── great-job.mp3
# │   └── ...
# └── effects/
#     ├── correct.mp3
#     └── try-again.mp3

# Upload all at once
aws s3 sync ./audio s3://guardrail-data/word-hunt/audio \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
```

## Testing Audio

After uploading, test that files are accessible:

1. Open browser to: `https://pub-39b6eccef9ff4f43a7db37a762a6e6d8.r2.dev/word-hunt/audio/find/the.mp3`
2. You should hear the recording play

Then test in the game:
1. Open `index.html`
2. Start a game
3. Check that audio plays when each word appears

## Troubleshooting

### Audio doesn't play

- Check file names are lowercase
- Check files are MP3 format
- Check R2 bucket has public access enabled
- On mobile, make sure to tap "Play" first (iOS requires user interaction)

### Audio too quiet/loud

- Re-record at consistent distance from microphone
- Use audio editing software to normalize volume

### Missing words

Check that all 45 words have corresponding audio files in the `find/` folder.

## Quick Checklist

- [ ] 20 easy word recordings
- [ ] 25 harder word recordings
- [ ] 4-5 victory phrase recordings
- [ ] 2 sound effect files (or use defaults)
- [ ] All files named correctly (lowercase, .mp3)
- [ ] All files uploaded to correct R2 folders
- [ ] Tested audio plays in browser
- [ ] Tested audio plays in game
