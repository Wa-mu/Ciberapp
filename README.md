# CipherLab

**An interactive study companion for INTE 401 — Information Assurance and Security 2.**

CipherLab covers the supplied INTE 401 reviewer through guided lessons, hands-on
cipher experiments, and exam practice. **CORE** and **BONUS** labels distinguish
reviewer coverage from supplemental concepts and demonstrations.

The application runs entirely in your browser using HTML, CSS, and JavaScript.
No account, installation, or backend is required.

## Features

- **Guided lessons:** 18 lessons covering access control, firewalls, remote access,
  security controls, IDPS, honeypots, scanning tools, biometrics and cryptography,
  with supplemental cryptography lessons clearly labeled.
- **Cipher simulator:** Encrypt and decrypt messages with ten cipher methods,
  then follow numbered solutions with key alignment, intermediate arithmetic,
  wraparound examples, transposition grids, byte operations, and toy RSA key math.
- **Practice missions:** Generate sets of 5, 10, or 20 challenges with difficulty
  settings, hints, and answer feedback.
- **Mock examination:** Take randomized quizzes from a 66-question bank, filter by
  subject or core coverage, and review explanations with source notes.
- **Flashcards:** Review 48 definition and formula cards, and mark cards as mastered.
- **Cryptanalysis lab:** Explore letter frequencies and all 26 Caesar shifts.
- **Progress tracking:** Earn XP and track lesson completion, answer accuracy,
  exam statistics, and flashcard mastery.
- **Quick reference:** Review formulas and course-source notes, or export progress
  as JSON.
- **Responsive interface:** Study on desktop or mobile in dark or light mode.

## Supported ciphers

| Method | What you can explore | Material |
| --- | --- | --- |
| Caesar shift | Encrypt and decrypt with an alphabet shift | Core |
| Substitution alphabet | Map letters using a custom 26-letter alphabet | Core |
| Vernam | Apply the course's A=1 through Z=26 convention | Core |
| XOR bytes | Combine message and key bytes and inspect the binary steps | Core |
| Columnar transposition | Rearrange letters in a column grid | Bonus demonstration |
| Vigenère | Apply a repeating keyword using A=0 through Z=25 | Bonus worked method |
| Playfair | Transform letter pairs using a keyword-based 5×5 square | Bonus |
| Rail fence | Rearrange letters along a zigzag pattern | Bonus |
| Atbash | Substitute letters using a mirrored alphabet | Bonus |
| Toy RSA | Explore public/private key arithmetic with small primes | Bonus |

The Vernam and Vigenère simulators intentionally use different alphabet-numbering
conventions. Their labels and worked steps explain which convention applies.

These ciphers and small-key demonstrations are intended for learning. They should
not be used to protect sensitive information.

## Getting started

Clone the repository or download it as a ZIP:

```sh
git clone https://github.com/Wa-mu/Ciberapp.git
cd Ciberapp
```

Open [`source/index.html`](source/index.html) in a modern browser. Keep `index.html`,
`styles.css`, `reviewer.js`, `app.js`, `solutions.js`, and the bundled `fonts` folder together in
`source`. The downloaded app can run locally without an internet connection.

A suggested study session:

1. Start with **Learn the concepts** and mark lessons complete as you finish them.
2. Open the **Cipher simulator**, load an example, and follow its worked steps.
3. Test your understanding with **Practice missions** and a **Mock examination**.
4. Use **Flashcards** and **Quick reference** to review unfamiliar topics.

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

CipherLab saves progress in your browser's local storage. No answers or progress
are sent to a server.

Progress is specific to the browser, profile, and site address you use. A local
copy, a Vercel preview, and the production site have separate saved progress.
Clearing browser storage also clears that progress. Use **Export progress as JSON**
on the Quick reference screen to keep a separate record.

## Deploy to Vercel

1. Import [Wa-mu/Ciberapp](https://github.com/Wa-mu/Ciberapp) into
   [Vercel](https://vercel.com/new).
2. Keep the **Root Directory** set to the repository root (`./`).
3. Click **Deploy**.

The included [`vercel.json`](vercel.json) serves `source` as a static site using the
**Other** framework preset. No build command, dependency installation, environment
variables, or database setup is needed.

## Project structure

```text
CipherLab/
├── source/
│   ├── index.html    Application shell and navigation
│   ├── styles.css    Layout, responsive styles, and themes
│   ├── reviewer.js   Reviewer topics, lessons, questions and additional flashcards
│   ├── app.js        Ciphers, training modes, and saved progress
│   ├── solutions.js  Input-specific explanations and worked solution rendering
│   ├── fonts/        Local interface and monospace fonts, with their licenses
│   └── README.md     Additional study-source notes
├── .gitignore
├── tests/           Cipher, reviewer coverage and study behavior checks
├── .github/         Automated checks for pushes and pull requests
├── README.md
└── vercel.json       Vercel deployment configuration
```

## Development

Edit the files in `source` and refresh your browser to see changes. There are no
framework dependencies or bundling steps.

If Node.js is installed, check JavaScript syntax with:

```sh
node --check source/reviewer.js
node --check source/app.js
node --check source/solutions.js
node --test tests/*.test.cjs
```

To run the 16 built-in cipher checks, open the app's browser developer console and
execute:

```js
CipherLabTest.selfTest()
```

Each result contains a check name and a boolean; every boolean should be `true`.

The content reference is `INTE_401_Information_Assurance_Security_2_Reviewer.pdf`
from the supplied `IAS2 IM` folder. Lessons and quiz explanations cite sections
1–13 of this 16-page reviewer. It covers PUP Modules 1–3; later asymmetric-system,
PKI and attack details remain supplemental. The unrelated COMP 023 reviewer is
not part of this app. The PDFs are not redistributed with the application.

Simulator source notes refer to sections 10–13 (pages 9–11). They distinguish the
reviewer's examples from additional demonstrations. The course Vernam method
uses A=1; Vigenère uses A=0. Long calculation tables show 32 rows initially, with
the remaining calculations available in an expandable section.

GitHub Actions runs syntax and regression checks on every push and pull request.
Existing lesson completion and the original flashcard mastery positions are retained
when updating; new lessons increase the total used for course progress.

## Typography

CipherLab uses [Inter](https://github.com/rsms/inter) for interface text and
[JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) for cipher input,
output, and calculations. Fonts are bundled locally for offline use. Their SIL
Open Font License notices are included in [`source/fonts`](source/fonts).
