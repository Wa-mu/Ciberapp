# Ciberapp / CipherLab

An interactive INTE 401 cryptography trainer with lessons, cipher simulators,
practice missions, mock exams, flashcards, cryptanalysis, and browser-saved progress.

## Deploy to Vercel

1. Open [Vercel New Project](https://vercel.com/new) and import
   [Wa-mu/Ciberapp](https://github.com/Wa-mu/Ciberapp).
2. Keep the **Root Directory** at the repository root (`./`).
3. Click **Deploy**. The checked-in `vercel.json` configures everything:

   | Setting | Value |
   | --- | --- |
   | Framework Preset | Other |
   | Build Command | None |
   | Install Command | None |
   | Output Directory | `source` |

The entire app runs in the browser. No environment variables, database, API server,
or dependencies are required. After connecting the repository, pushes to `main`
trigger production deployments through Vercel's Git integration.

See [Vercel's configuration documentation](https://vercel.com/docs/project-configuration/vercel-json)
for the configuration options used here.

## Run locally

Open `source/index.html` in a modern browser. Keep `index.html`, `styles.css`, and
`app.js` together in `source/`.

## Project structure

```text
source/
  index.html   Application shell
  styles.css   Responsive styles and themes
  app.js       Lessons, ciphers, practice, exams, and progress
  README.md    App features and study-source notes
vercel.json    Static deployment configuration
```

## Verification

Check JavaScript syntax with `node --check source/app.js`. In the browser's
developer console, run `CipherLabTest.selfTest()` to run the 14 built-in cipher
checks; every result should have `true` as its second value.

## Progress and privacy

Progress stays in the browser's local storage for the current origin. Your hosted
Vercel app, a local file, and a preview deployment each have separate progress.
Use the app's JSON export to keep a copy of your progress. No progress or answers
are sent to a server.
