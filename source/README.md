# CipherLab — INTE 401 Cryptography Trainer

A standalone, interactive study app based on the PUP CCIS **Information Assurance and Security 2** instructional material, with clearly marked bonus demonstrations.

## Launch

1. Download or clone the repository.
2. Open `source/index.html` in Chrome, Edge, Firefox, or another modern desktop/mobile browser. Keep `styles.css`, `app.js`, and the `fonts` folder alongside `index.html`.
3. No installation, accounts, server, or internet connection is required.

For a hosted version, follow the [Vercel deployment instructions](../README.md#deploy-to-vercel).

## What's inside

- Guided lessons, sourced to printed module pages
- Cipher simulator: Caesar, substitution, columnar transposition, Vernam, Vigenère, XOR, plus Atbash, rail fence and toy RSA
- Encrypt/decrypt and step-by-step working tables or grids
- Generated practice missions (5, 10, or 20 questions)
- Mock exam with a 28-question bank and explanation feedback
- Flashcards and recognition-based Caesar cryptanalysis
- Points, course progress, and exam history saved in your browser
- Quick-reference sheet and JSON progress export
- Desktop and mobile layouts, plus dark/light modes

## Study-source details

The uploaded module uses the alphabet positions A=1 through Z=26 for its Vernam worked example. The Vigenère worked method in this app uses A=0 through Z=25 and is explicitly marked BONUS because the uploaded material identifies Vigenère but does not explain the complete worked algorithm. The columnar, Atbash, rail fence, toy RSA and automated cryptanalysis features are also bonus teaching extensions. Classical ciphers should not be used to protect sensitive real-world information.

## Source files

- `index.html`: application shell and page metadata
- `styles.css`: responsive visual design and color themes
- `app.js`: lesson data, cipher algorithms, training modes, quizzes, event handling and self-tests
- `fonts/`: bundled Inter and JetBrains Mono webfonts, with their license notices

If customizing the source, keep these files and the `fonts` folder together and open `index.html`.

## Tests performed

- Built-in 14-algorithm-example test suite passed.
- Tested the major simulator flows in headless Chromium.
- Tested mock exam, mission feedback, flashcards, lesson progress and mobile navigation.

## Progress and privacy

This app stores progress in the browser's local storage for the origin from which it is opened. If browser storage is cleared or the file is opened in a different browser/profile, the old progress may not be there. Use the in-app JSON export feature to keep a copy of your progress record. CipherLab does not send your answers or progress to any server.
