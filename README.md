# CipherLab

An offline study companion for **INTE 401 — Information Assurance and Security 2**,
based on **`_IM_INTE-401-IASv2026 (1).pdf`**, the supplied 162-page instructional
material. Open [source/index.html](source/index.html) in a modern browser. No
account, backend, installation or build step is required.

## Coverage

All seven units are included. References use the supplied PDF’s page numbers.

| Unit | Topics | PDF pages |
| --- | --- | --- |
| I | Access control, firewalls, remote-access objectives, information systems, SDLC/SecSDLC and security roles | 13–41 |
| II | IDPS, management/deployment, honeypots, assessment tools and biometrics | 43–100 |
| III | Cryptography, substitution, transposition, XOR, Vernam and hash properties | 101–114 |
| IV | DES, Triple DES, IDEA, RC5, AES, block modes and message authentication | 115–130 |
| V | RSA, Diffie–Hellman, ElGamal, ECC, DSA and Schnorr signatures | 131–142 |
| VI | PKI, certificates, trust chains, CRLs and OCSP | 144–152 |
| VII | Passive/active attacks, cryptanalysis, key exchange attacks and key recovery | 154–161 |

**CORE** identifies source coverage. **BONUS / added context** identifies details
outside the PDF: remote protocols, named theoretical access models, control-function
classifications, worked A=0 Vigenère calculations, behavioral-biometric examples,
Playfair and rail fence. Atbash appears in the source’s history. Toy RSA illustrates
source mathematics using small parameters and an added letter mapping.

Lessons explain the source’s conflicting key figures: DES has 56 effective key bits
and 48-bit round keys; IDEA has a 128-bit key. Historical algorithms and toy
calculations are educational material.

## Features

- **27 lessons** with source notes, examples and exam traps.
- **Ten cipher simulators** with guides and input-specific worked solutions.
- **Practice missions** of 5, 10 or 20 questions using any checked cipher selection.
- **232-question mock bank**, with topic/core-only filters and sampling across
  selected PDF units before repeating units.
- **160-question topic quiz** across 14 groups, with shuffled choices, explanations
  and missed-card retries. Choose 10, 25, 50, 100 or the full available deck.
- **Four-cipher written exam** with 8, 16 or 24 questions, balanced across
  substitution, transposition, Vernam and Vigenère and both operation directions.
  Revise answers before submission, then review grading and worked solutions.
- **80 flashcards**, Caesar analysis, quick reference, progress export, local
  XP/history, responsive layouts and light/dark appearance.

## Transposition methods

The existing Transposition entry offers **numeric column transposition**,
**keyword-based columnar transposition**, and the **course eight-position
permutation**. Both columnar methods encrypt and decrypt without adding padding.
The simulator defaults to keyword `ZEBRA`; Load example follows the selected method.

Columnar methods are labeled BONUS practice. Choose 1–64 columns or a keyword of
1–64 A–Z letters. Write the message across rows, then read whole columns. Numeric
columns are read left to right; keyword columns are read alphabetically, with
repeated letters ranked in their original left-to-right order.

```text
Keyword: Z E B R A       Numeric: 3 columns
Rank:    5 3 2 4 1       C A T
         H E L L O       D O G
         W O R L D
OD | LR | EO | LL | HW   CD | AO | TG
→ ODLREOLLHW             → CDAOTG
```

Decrypt by splitting the ciphertext in column-read order, filling those columns
top to bottom, then reading the original rows. For N symbols and C columns, the
first N mod C columns **in the original grid** have floor(N/C)+1 symbols; all
others have floor(N/C). For example, `ODLREOLLHWX` with `ZEBRA` decrypts to
`HELLOWORLDX`; Z is the longer column despite being read last.

Columnar normalization is explained beside the input and in the result: A–Z
letters are uppercased and all whitespace is removed, while punctuation, digits
and other symbols are retained. Removed spacing and original case cannot be
recovered. The grid distinguishes unused cells from actual symbols. Next Step,
Previous Step and Reset replay letter placement, ranked column contributions and
decryption; animations respect reduced-motion preferences. The updated lesson,
missions, six mock questions and four appended recall cards cover these methods.

The **course permutation from PDF p. 107** remains available in the simulator and
missions; the four-cipher written exam retains that convention. The source gives
these source-to-destination arrows:

```text
8→3, 7→6, 6→2, 5→7, 4→5, 3→1, 2→8, 1→4
```

The key field lists destinations for source positions **1 through 8**:

```text
4 8 1 5 7 2 6 3
```

Position **1 is at the right**. The PDF states this for binary data; letter
exercises explicitly use the same numbering.

```text
Positions:  8 7 6 5 4 3 2 1
Input:      A B C D E F G H
Output:     G D B E H A C F
```

Move each source symbol to its destination. Decrypt by reversing every arrow.
Repeat independently for each block. Binary `01000011` encrypts to `10101000`.

For this course method, use A–Z letters or binary digits, with optional whitespace. The simulator uppercases
letters, removes whitespace, requires complete eight-symbol blocks, and never
silently adds or removes padding. Generated questions include any required X padding
in the message; retain it when answering. Easy written exams use the PDF key;
other settings can provide fresh valid permutations.

## Other cipher conventions

| Method | Convention |
| --- | --- |
| Caesar / substitution | Alphabet shifts or a supplied 26-letter replacement alphabet |
| Vernam | Course **A=1…Z=26**, full-length pad, wrap into 1–26; PDF pp. 108–109 |
| Vigenère | Added **A=0…Z=25** keyword calculation; polyalphabetic classification on PDF p. 107 |
| XOR | Source example `CAT` with repeated `V` → hex `15 17 02`; UTF-8 extension supported |
| Atbash | Mirrored alphabet, described in the history on p. 103 |
| Toy RSA | Default p=7, q=13, e=5, d=29 and message 10 → 82, matching the source arithmetic |
| Playfair | Bonus 5×5 square, I/J combined; X fillers, Q after X; retain fillers when decrypting |
| Rail fence | Bonus zigzag rearrangement |

Playfair rules were checked against
[PBS NOVA’s instructions](https://www.pbs.org/wgbh/nova/decoding/playfair.html).
The X/Q fallback is an explicit app convention.

## Progress and privacy

Progress stays in browser local storage. Existing lesson IDs, all original
flashcard mastery positions and completed scores are preserved. New lessons
increase the progress denominator. Active answers survive navigation in the page
session; reloading starts a fresh attempt. Export progress from Quick reference
before clearing browser data or changing site addresses.

The PDF stays local and is not redistributed with the app.

## Development and checks

Keep the entire `source` directory together, including its bundled fonts. Edit
source files and reload the browser. With Node.js installed, run:

```sh
node --check source/reviewer.js
node --check source/app.js
node --check source/solutions.js
node --check source/study-bank.js
node --check source/study.js
node --test tests/*.test.cjs
```

Tests cover source coverage, independently calculated generated answers,
numeric/keyword columnar transposition (including 1,008 independent position
checks), course permutation direction/binary inputs, validation, exam behavior,
saved progress, Playfair and appearance. Browser checks are available through
`CipherLabTest.selfTest()`. GitHub Actions runs syntax and regression checks on
pushes and pull requests.

See [source/README.md](source/README.md) for file roles. Inter and JetBrains Mono
are bundled with SIL Open Font License notices in [source/fonts](source/fonts).

## Vercel hosting

Import [Wa-mu/Ciberapp](https://github.com/Wa-mu/Ciberapp) into Vercel with the
repository root (`./`) as Root Directory. [vercel.json](vercel.json) selects the
Other preset and serves `source` without installation, a build command,
environment variables or a database.
