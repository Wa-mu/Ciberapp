# CipherLab

**An interactive cryptography study companion for INTE 401 — Information Assurance and Security 2.**

CipherLab helps students understand cryptographic concepts through guided lessons,
hands-on cipher experiments, and exam practice. Its study content draws on the PUP
CCIS instructional material, with **CORE** and **BONUS** labels distinguishing course
material from additional demonstrations.

The application runs entirely in your browser using HTML, CSS, and JavaScript.
No account, installation, or backend is required.

## Features

- **Guided lessons:** Nine lessons covering cryptography fundamentals, classical
  ciphers, XOR, symmetric and asymmetric encryption, hashing, PKI, and cryptanalysis.
- **Cipher simulator:** Encrypt and decrypt messages with nine cipher methods,
  then inspect calculation tables, transposition grids, or binary operations.
- **Practice missions:** Generate sets of 5, 10, or 20 challenges with difficulty
  settings, hints, and answer feedback.
- **Mock examination:** Take randomized quizzes from a 28-question bank, with
  explanations and a review of your answers.
- **Flashcards:** Practice definitions and formulas, and mark cards as mastered.
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
`styles.css`, and `app.js` together in the `source` folder. The downloaded app can
run locally without an internet connection.

A suggested study session:

1. Start with **Learn the concepts** and mark lessons complete as you finish them.
2. Open the **Cipher simulator**, load an example, and follow its worked steps.
3. Test your understanding with **Practice missions** and a **Mock examination**.
4. Use **Flashcards** and **Quick reference** to review unfamiliar topics.

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
│   ├── app.js        Study content, ciphers, training modes, and saved progress
│   └── README.md     Additional study-source notes
├── .gitignore
├── README.md
└── vercel.json       Vercel deployment configuration
```

## Development

Edit the files in `source` and refresh your browser to see changes. There are no
framework dependencies or bundling steps.

If Node.js is installed, check JavaScript syntax with:

```sh
node --check source/app.js
```

To run the 14 built-in cipher checks, open the app's browser developer console and
execute:

```js
CipherLabTest.selfTest()
```

Each result contains a check name and a boolean; every boolean should be `true`.
