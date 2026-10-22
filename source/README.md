# CipherLab source

Open `index.html` in a modern browser. Keep JavaScript, CSS, favicons and `fonts`
beside it. The app works offline without installation.

The source is **`_IM_INTE-401-IASv2026 (1).pdf`**, the supplied 162-page instructional
material. References use its PDF pages. All seven units are covered, with 27
lessons, 160 quiz cards, 232 mock questions and 80 recall cards. The PDF remains
local and is not redistributed.

## Files

- `reviewer.js`: canonical filename, seven-unit/14-topic maps, security lessons,
  extra mock questions and recall cards. The legacy filename is retained; the
  data now cites the supplied instructional material.
- `app.js`: cipher algorithms, cryptography lessons, simulator and interactive
  columnar visualization, missions,
  combined mock bank, navigation and saved progress.
- `solutions.js`: worked steps and source notes shared by the simulator, missions
  and written exam.
- `study-bank.js`: 160 original multiple-choice cards, also used by the mock bank
  with their answer keys, references and added-context labels intact.
- `study.js`: topic quizzes, generated four-cipher exams, grading and review.
- `index.html` / `styles.css`: shell, navigation, layout and themes.
- `fonts/`: Inter and JetBrains Mono files with license notices.

## Conventions

Transposition has numeric and keyword columnar methods as BONUS practice, plus
the existing course permutation. Columnar methods share `columnarCipher(input,
key, decrypt)`: a numeric key gives the column count, while a letter keyword
determines stable alphabetical order. `simulate('transposition', input, key,
mode, {method:'numeric', columns:3})` and `{method:'keyword'}` select these methods.
Omitting `method` or choosing `permutation` preserves the legacy API and the
four-cipher exam. No duplicate cipher entry or lesson is added.

Columnar input uppercases A–Z and removes whitespace with a visible explanation;
it retains punctuation, digits and other symbols. No padding is added. Unequal
column lengths follow original left-to-right positions before ranked readout.
`HELLOWORLD` / `ZEBRA` → `ODLREOLLHW`; `CATDOG` / 3 → `CDAOTG`. Both operations
reverse to the normalized original. Next Step, Previous Step and Reset control
the grid; static worked explanations remain shared with missions and guides.

The course method uses PDF p. 107’s permutation. Destinations for sources 1–8 are
`4 8 1 5 7 2 6 3`. Number right to left: position 1 is at the right. The source
states this for binary data; letter exercises explicitly use the same numbering.
`ABCDEFGH` encrypts to `GDBEHACF`; `01000011` encrypts to `10101000`. Reverse the
arrows to decrypt each eight-symbol block. The simulator requires complete blocks;
generated questions show any required X padding and retain it in the answer.

Vernam uses course A=1…Z=26 with a full-length pad (PDF pp. 108–109). Vigenère is
named as polyalphabetic on p. 107; its worked A=0 calculations are added practice.
XOR reproduces CAT/repeated V. RSA is covered in Unit V; small primes and the
letter mapping are classroom conventions.

Core labels include symmetric systems, public-key systems, PKI and attacks.
Remote protocols, theoretical model names, control-function classifications,
behavioral-biometric examples, Playfair and rail fence remain supplemental. The
symmetric lesson explains conflicting DES/IDEA figures and distinguishes master
keys from round keys.

## Checks and progress

Run `node --test tests/*.test.cjs` from the repository root. GitHub Actions also
checks all five JavaScript files for syntax errors. Browser cipher checks are
available through `CipherLabTest.selfTest()`.

Original lesson IDs and all original flashcard positions remain stable. New cards
are appended after the original Playfair cards to preserve saved mastery. Completed
scores stay in local storage; active answers last for the current page session.
See the [main README](../README.md) for usage and Vercel setup.
