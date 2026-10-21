# CipherLab — INTE 401 Security Study Companion

A standalone study app based on the supplied **INTE 401 Information Assurance and Security 2 reviewer**, covering Modules 1–3 with clearly marked bonus material.

## Launch

1. Download or clone the repository.
2. Open `source/index.html` in Chrome, Edge, Firefox, or another modern desktop/mobile browser. Keep `styles.css`, `reviewer.js`, `app.js`, `solutions.js`, `study-bank.js`, `study.js`, the favicon files, and the `fonts` folder alongside `index.html`.
3. No installation, accounts, server, or internet connection is required.

For a hosted version, follow the [Vercel deployment instructions](../README.md#deploy-to-vercel).

## What's inside

- 18 lessons with section/page references to the supplied reviewer: access control, firewalls, remote access, controls, IDPS, honeypots, scanning, biometrics and cryptography
- Cipher simulator: Caesar, substitution, columnar transposition, Vernam, Vigenère, XOR, Playfair, plus Atbash, rail fence and toy RSA
- Encrypt/decrypt with numbered explanations, key alignment, worked arithmetic, wraparound examples, and labeled grids
- **Explain this cipher** guides for all ten methods, with key instructions, encryption/decryption steps, worked examples and common mistakes
- Generated practice missions (5, 10, or 20 questions), with a checkbox dropdown to check any combination of the ten ciphers, balanced rotation through checked choices, difficulty settings and cipher-specific hints
- Mock exam with 66 sourced questions, topic filters and a core-only study option
- 100 original INTE 401 quiz cards with shuffled choices, topic filters, answer-side explanations and missed-card retries
- Generated 8-, 16- or 24-question exams for substitution, transposition, Vernam and Vigenère, with editable answers, final grading, worked solutions and a new-exam button
- 48 flashcards and recognition-based Caesar cryptanalysis
- Points, course progress, and exam history saved in your browser
- Quick-reference sheet and JSON progress export
- Desktop and mobile layouts, plus dark/light modes

## Study-source details

The **100-card topic quiz** and **Four-cipher exam** use the supplied `_IM_INTE-401-IASv2026.pdf` (162 PDF pages) and `INTE_401_Information_Assurance_Security_2_Reviewer_Aug2026.pdf` (16 PDF pages), aligned with the supplied INTE 401 examination-coverage image. Individual cards and exam questions cite these editions. Remote-access protocol details, control classifications, interaction-level distinctions and added cipher calculations are labeled as added study context.

The card quiz scores the first answer and saves completed-deck statistics. Revealing a card without answering counts as a miss. The cipher exam balances all four methods and both encryption/decryption, accepts case and spacing variations, and grades blanks as incorrect. It uses course A=1 Vernam, added A=0 Vigenère, and explicitly specified unpadded columnar transposition. Answers and worked solutions appear after submission. New exams change the generated set. Exam statistics are saved separately from the original mock exam, with existing progress preserved.

Active quiz/exam answers survive navigation within the page session; reloading clears the active attempt. Completed scores remain in local storage. The reference PDFs are not redistributed.

The original lesson and simulator content source is `INTE_401_Information_Assurance_Security_2_Reviewer.pdf` in the supplied `IAS2 IM` folder. Those page references use that 16-page reviewer, not the underlying module's printed pagination.

The reviewer uses A=1 through Z=26 for its Vernam example. It labels the A=0 Vigenère worked example as BONUS, along with theoretical-model depth and control-function taxonomy. Later asymmetric, PKI and broader attack details remain supplemental. Additional byte, columnar, Atbash, rail-fence, toy-RSA and automated-analysis features are marked as demonstrations or bonus practice.

Expanded simulator solutions reference the supplied `INTE_401_Information_Assurance_Security_2_Reviewer.pdf`, sections 10–13, pages 9–11. Source notes identify reviewer-aligned rules and additional demonstrations. The same explanations appear after answering practice missions.

## Source files

- `index.html`: application shell and page metadata
- `styles.css`: responsive visual design and color themes
- `reviewer.js`: reviewer topic map, eight security lessons, additional questions and flashcards
- `app.js`: cipher algorithms, training modes, quizzes, event handling, saved progress and self-tests
- `solutions.js`: input-specific worked explanations, source notes and solution tables
- `study-bank.js`: 100 original sourced questions across the nine INTE 401 topic groups
- `study.js`: quiz-card sessions, generated four-cipher exams, final grading, results and event handling
- `favicon.svg` / `favicon.ico`: matching vector favicon and multi-size fallback
- `fonts/`: bundled Inter and JetBrains Mono webfonts, with their license notices

If customizing the source, keep these files and the `fonts` folder together and open `index.html`.

## Tests performed

- Run `node --test tests/*.test.cjs` from the repository root for cipher regressions, reviewer coverage, filters, progress compatibility and input validation.
- GitHub Actions runs these checks on pushes and pull requests.
- The browser also exposes 16 cipher self-checks through `CipherLabTest.selfTest()`.
- Tested the major simulator flows in headless Chromium.
- Tested mock exam, mission feedback, flashcards, lesson progress and mobile navigation.
- Tests check all 100 cards, topic balance, shuffled-answer correctness, generated cipher answers against independent formulas, final grading, retry decks and saved-progress compatibility.

## Playfair convention

Select **Cipher simulator → Playfair**. Enter a keyword and a message, then encrypt
or decrypt to see the 5×5 square, prepared pairs, filler insertions and every pair's
transformation. Playfair is BONUS material outside the supplied INTE 401 reviewer.

The square combines I/J. Plaintext is uppercased and formatting is removed. Repeated
letters in a pair and an odd final letter receive an X filler; Q is used after X.
Decryption returns prepared plaintext with fillers retained, because automatically
removing X/Q could erase genuine letters. Hard practice missions use the same rule.

Rules were checked against [PBS NOVA's Playfair instructions](https://www.pbs.org/wgbh/nova/decoding/playfair.html).
The Q fallback after X and retaining fillers are explicit app conventions. Regression
checks include a published example, every ordered pair of distinct square letters,
and repeated-letter and malformed-input cases.

## Progress and privacy

This app stores progress in the browser's local storage for the origin from which it is opened. If browser storage is cleared or the file is opened in a different browser/profile, the old progress may not be there. Use the in-app JSON export feature to keep a copy of your progress record. CipherLab does not send your answers or progress to any server.
