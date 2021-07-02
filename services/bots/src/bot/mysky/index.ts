// COPIED from skynet-mysky scripts/seed-display.ts
import { removeAdjacentChars } from 'skynet-mysky-utils';
import { hash } from 'tweetnacl';

import { dictionary } from './dictionary';
// import { saltSeed } from './utils';
const SEED_LENGTH = 16;
const SEED_WORDS_LENGTH = 13;
const CHECKSUM_WORDS_LENGTH = 2;
const PHRASE_LENGTH = SEED_WORDS_LENGTH + CHECKSUM_WORDS_LENGTH;

/**
 * Generates a 15-word seed phrase for 16 bytes of entropy plus 20 bits of checksum. The dictionary length is 1024 which gives 10 bits of entropy per word.
 */
export function generatePhrase(): string {
  const seedWords = new Uint16Array(SEED_WORDS_LENGTH);
  // window.crypto.getRandomValues(seedWords);
  seedWords.forEach((_word, i) => {
    seedWords[i] = Math.floor(Math.random() * 256);
  });

  // Populate the seed words from the random values.
  for (let i = 0; i < SEED_WORDS_LENGTH; i++) {
    let numBits = 10;
    // For the 13th word, only the first 256 words are considered valid.
    if (i === 12) {
      numBits = 8;
    }
    seedWords[i] = seedWords[i] % (1 << numBits);
  }

  // Generate checksum from hash of the seed.
  const checksumWords = generateChecksumWordsFromSeedWords(seedWords);

  const phraseWords: string[] = new Array(PHRASE_LENGTH);
  for (let i = 0; i < SEED_WORDS_LENGTH; i++) {
    phraseWords[i] = dictionary[seedWords[i]];
  }
  for (let i = 0; i < CHECKSUM_WORDS_LENGTH; i++) {
    phraseWords[i + SEED_WORDS_LENGTH] = dictionary[checksumWords[i]];
  }

  return phraseWords.join(' ');
}

/**
 * Validate the phrase by checking that for every word, there is a dictionary word that starts with the first 3 letters of the word. For the last word of the seed phrase (the 12th word), only the first 256 words of the dictionary are considered valid.
 *
 * @param phrase - The phrase to check.
 * @returns - A boolean indicating whether the phrase is valid, and a string explaining the error if it's not.
 */
function validatePhrase(phrase: string): [boolean, string, Uint8Array | null] {
  phrase = sanitizePhrase(phrase);
  const phraseWords = phrase.split(' ');
  if (phraseWords.length !== PHRASE_LENGTH) {
    return [
      false,
      `Phrase must be 15 words long, was ${phraseWords.length}`,
      null,
    ];
  }

  // Build the seed from words.
  const seedWords = new Uint16Array(SEED_WORDS_LENGTH);
  let i = 0;
  for (const word of phraseWords) {
    // Check word length.
    if (word.length < 3) {
      return [false, `Word ${i + 1} is not at least 3 letters long`, null];
    }

    // Check word prefix.
    const prefix = word.slice(0, 3);
    let bound = dictionary.length;
    if (i === 12) {
      bound = 256;
    }
    let found = -1;
    for (let j = 0; j < bound; j++) {
      const curPrefix = dictionary[j].slice(0, 3);
      if (curPrefix === prefix) {
        found = j;
        break;
      } else if (curPrefix > prefix) {
        break;
      }
    }
    if (found < 0) {
      if (i === 12) {
        return [
          false,
          `Prefix for word ${
            i + 1
          } must be found in the first 256 words of the dictionary`,
          null,
        ];
      } else {
        return [
          false,
          `Unrecognized prefix "${prefix}" at word ${
            i + 1
          }, not found in dictionary`,
          null,
        ];
      }
    }

    seedWords[i] = found;

    i++;
  }

  // Validate checksum.
  const checksumWords = generateChecksumWordsFromSeedWords(seedWords);
  for (let i = 0; i < CHECKSUM_WORDS_LENGTH; i++) {
    const prefix = dictionary[checksumWords[i]].slice(0, 3);
    if (phraseWords[i + SEED_WORDS_LENGTH].slice(0, 3) !== prefix) {
      return [
        false,
        `Word "${
          phraseWords[i + SEED_WORDS_LENGTH]
        }" is not a valid checksum for the seed`,
        null,
      ];
    }
  }

  return [true, '', seedWordsToSeed(seedWords)];
}

// ================
// Helper Functions
// ================

/**
 * @param seedWords
 */
function generateChecksumWordsFromSeedWords(
  seedWords: Uint16Array
): Uint16Array {
  if (seedWords.length != SEED_WORDS_LENGTH) {
    throw new Error(`Input seed was not of length ${SEED_WORDS_LENGTH}`);
  }

  const seed = seedWordsToSeed(seedWords);
  const h = hash(seed);
  const checksumWords = hashToChecksumWords(h);

  return checksumWords;
}

/**
 * @param h
 */
function hashToChecksumWords(h: Uint8Array): Uint16Array {
  let word1 = h[0] << 8;
  word1 += h[1];
  word1 >>= 6;
  let word2 = h[1] << 10;
  word2 &= 0xffff;
  word2 += h[2] << 2;
  word2 >>= 6;
  return new Uint16Array([word1, word2]);
}

/**
 * @param seedWords
 */
function seedWordsToSeed(seedWords: Uint16Array): Uint8Array {
  if (seedWords.length != SEED_WORDS_LENGTH) {
    throw new Error(`Input seed was not of length ${SEED_WORDS_LENGTH}`);
  }

  // We are getting 16 bytes of entropy.
  const bytes = new Uint8Array(SEED_LENGTH);
  let curByte = 0;
  let curBit = 0;

  for (let i = 0; i < SEED_WORDS_LENGTH; i++) {
    const word = seedWords[i];
    let wordBits = 10;
    if (i === SEED_WORDS_LENGTH - 1) {
      wordBits = 8;
    }

    // Iterate over the bits of the 10- or 8-bit word.
    for (let j = 0; j < wordBits; j++) {
      const bitSet = (word & (1 << (wordBits - j - 1))) > 0;

      if (bitSet) {
        bytes[curByte] |= 1 << (8 - curBit - 1);
      }

      curBit += 1;
      if (curBit >= 8) {
        curByte += 1;
        curBit = 0;
      }
    }
  }

  return bytes;
}

/**
 * @param phrase
 */
function sanitizePhrase(phrase: string): string {
  // Remove duplicate adjacent spaces.
  return removeAdjacentChars(phrase.trim().toLowerCase(), ' ');
}

/**
 * @param phrase
 */
export function phraseToSeed(phrase: string): Uint8Array {
  phrase = sanitizePhrase(phrase);
  const [valid, error, seed] = validatePhrase(phrase);
  if (!valid || !seed) {
    throw new Error(error);
  }

  return seed;
}
