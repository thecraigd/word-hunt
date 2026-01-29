/**
 * Word sets for Word Hunt game
 *
 * Alphabet: Letters A-Z (audio only mode - target not displayed)
 * Easy: Dolch Pre-Primer sight words
 * Harder: Kindergarten Dolch + CVC words
 */

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
    ]
};

// Number of words to display at once
const WORDS_PER_ROUND = 10;

// Number of words to find per game
const WORDS_PER_GAME = 10;
