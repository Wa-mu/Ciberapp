# CipherLab — INTE 401 Security Study Companion

A standalone study app based on the supplied **INTE 401 Information Assurance and Security 2 reviewer**, covering Modules 1–3 with clearly marked bonus material.

## Launch

1. Download or clone the repository.
2. Open `source/index.html` in Chrome, Edge, Firefox, or another modern desktop/mobile browser. Keep `styles.css`, `reviewer.js`, `app.js`, `solutions.js`, and the `fonts` folder alongside `index.html`.
3. No installation, accounts, server, or internet connection is required.

For a hosted version, follow the [Vercel deployment instructions](../README.md#deploy-to-vercel).

## What's inside

- 17 lessons with section/page references to the supplied reviewer: access control, firewalls, remote access, controls, IDPS, honeypots, scanning, biometrics and cryptography
- Cipher simulator: Caesar, substitution, columnar transposition, Vernam, Vigenère, XOR, plus Atbash, rail fence and toy RSA
- Encrypt/decrypt with numbered explanations, key alignment, worked arithmetic, wraparound examples, and labeled grids
- Generated practice missions (5, 10, or 20 questions)
- Mock exam with 62 sourced questions, topic filters and a core-only study option
- 44 flashcards and recognition-based Caesar cryptanalysis
- Points, course progress, and exam history saved in your browser
- Quick-reference sheet and JSON progress export
- Desktop and mobile layouts, plus dark/light modes

## Study-source details

The content source is `INTE_401_Information_Assurance_Security_2_Reviewer.pdf` in the supplied `IAS2 IM` folder. Page references use this 16-page reviewer, not the underlying module's printed pagination. The unrelated COMP 023 document is excluded, and the source PDFs are not bundled.

The reviewer uses A=1 through Z=26 for its Vernam example. It labels the A=0 Vigenère worked example as BONUS, along with theoretical-model depth and control-function taxonomy. Later asymmetric, PKI and broader attack details remain supplemental. Additional byte, columnar, Atbash, rail-fence, toy-RSA and automated-analysis features are marked as demonstrations or bonus practice.

Expanded simulator solutions reference the supplied `INTE_401_Information_Assurance_Security_2_Reviewer.pdf`, sections 10–13, pages 9–11. Source notes identify reviewer-aligned rules and additional demonstrations. The same explanations appear after answering practice missions.

## Source files

- `index.html`: application shell and page metadata
- `styles.css`: responsive visual design and color themes
- `reviewer.js`: reviewer topic map, eight security lessons, additional questions and flashcards
- `app.js`: cipher algorithms, training modes, quizzes, event handling, saved progress and self-tests
- `solutions.js`: input-specific worked explanations, source notes and solution tables
- `fonts/`: bundled Inter and JetBrains Mono webfonts, with their license notices

If customizing the source, keep these files and the `fonts` folder together and open `index.html`.

## Tests performed

- Run `node --test tests/*.test.cjs` from the repository root for cipher regressions, reviewer coverage, filters, progress compatibility and input validation.
- GitHub Actions runs these checks on pushes and pull requests.
- The browser also exposes 14 cipher self-checks through `CipherLabTest.selfTest()`.
- Tested the major simulator flows in headless Chromium.
- Tested mock exam, mission feedback, flashcards, lesson progress and mobile navigation.

## Progress and privacy

This app stores progress in the browser's local storage for the origin from which it is opened. If browser storage is cleared or the file is opened in a different browser/profile, the old progress may not be there. Use the in-app JSON export feature to keep a copy of your progress record. CipherLab does not send your answers or progress to any server.
