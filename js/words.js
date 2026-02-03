/**
 * Word sets for Word Hunt game
 *
 * Alphabet: Letters A-Z (audio only mode - target not displayed)
 * Easy: Dolch Pre-Primer sight words
 * Harder: Kindergarten Dolch + CVC words
 */

// Word Builder phoneme data: maps each CVC word to its letter sequence and difficulty group
const WORD_BUILDER_DATA = {
    // Group 1 — Continuous consonant words (easiest to blend)
    sat: { letters: ['s', 'a', 't'], group: 1 },
    man: { letters: ['m', 'a', 'n'], group: 1 },
    fan: { letters: ['f', 'a', 'n'], group: 1 },
    sun: { letters: ['s', 'u', 'n'], group: 1 },
    fin: { letters: ['f', 'i', 'n'], group: 1 },
    van: { letters: ['v', 'a', 'n'], group: 1 },
    run: { letters: ['r', 'u', 'n'], group: 1 },
    fun: { letters: ['f', 'u', 'n'], group: 1 },
    win: { letters: ['w', 'i', 'n'], group: 1 },
    ran: { letters: ['r', 'a', 'n'], group: 1 },

    // Group 2 — Stop consonant words
    cat: { letters: ['c', 'a', 't'], group: 2 },
    bat: { letters: ['b', 'a', 't'], group: 2 },
    hat: { letters: ['h', 'a', 't'], group: 2 },
    dog: { letters: ['d', 'o', 'g'], group: 2 },
    big: { letters: ['b', 'i', 'g'], group: 2 },
    bed: { letters: ['b', 'e', 'd'], group: 2 },
    bug: { letters: ['b', 'u', 'g'], group: 2 },
    cup: { letters: ['c', 'u', 'p'], group: 2 },
    pot: { letters: ['p', 'o', 't'], group: 2 },
    pig: { letters: ['p', 'i', 'g'], group: 2 },

    // Group 3 — Mixed consonant words
    red: { letters: ['r', 'e', 'd'], group: 3 },
    log: { letters: ['l', 'o', 'g'], group: 3 },
    zip: { letters: ['z', 'i', 'p'], group: 3 },
    fox: { letters: ['f', 'o', 'x'], group: 3 },
    wet: { letters: ['w', 'e', 't'], group: 3 },
    hop: { letters: ['h', 'o', 'p'], group: 3 },
    jet: { letters: ['j', 'e', 't'], group: 3 },
    tag: { letters: ['t', 'a', 'g'], group: 3 },
    kid: { letters: ['k', 'i', 'd'], group: 3 },
    mud: { letters: ['m', 'u', 'd'], group: 3 }
};

const WORD_SETS = {
    alphabet: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
    'sound-match': [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
    easy: [
        'the', 'a', 'I', 'is', 'it',
        'in', 'to', 'and', 'can', 'see',
        'go', 'me', 'my', 'we', 'up',
        'at', 'on', 'no', 'yes', 'he'
    ],
    harder: [
        'cat', 'dog', 'mat', 'hat', 'sat',
        'run', 'sun', 'big', 'red', 'blue',
        'green', 'like', 'look', 'come', 'play',
        'said', 'good', 'want', 'this', 'that',
        'was', 'are', 'have', 'they', 'with'
    ],
    'word-builder': Object.keys(WORD_BUILDER_DATA)
};

// Number of words to display at once
const WORDS_PER_ROUND = 10;

// Number of words to find per game
const WORDS_PER_GAME = 10;
