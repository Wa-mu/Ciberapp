/* Flashcard quizzes and generated four-cipher exams. No network dependencies. */
(function (global) {
  'use strict';
  const bank = global.CipherLabStudyBank;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letters = value => String(value ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const methods = [
    { id: 'substitution', name: 'Substitution cipher', source: 'Reviewer §10, p. 8 · IM Unit III, pp. 106–107' },
    { id: 'transposition', name: 'Transposition cipher', source: 'Reviewer §11, p. 8 · IM p. 107; specified columnar grid is added practice' },
    { id: 'vernam', name: 'Vernam cipher', source: 'Reviewer §12, p. 9 · IM Unit III, pp. 108–109 · Course A=1' },
    { id: 'vigenere', name: 'Vigenère cipher', source: 'Reviewer §13, p. 9 · IM p. 107 names the cipher; A=0 calculations are added practice' },
  ];
  let api = {};
  const state = {
    quiz: null, cipherExam: null,
    quizOptions: { topic: 'all', count: 100 },
    cipherOptions: { count: 16, difficulty: 'medium' },
  };
  function randomIndex(length) {
    if (global.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      global.crypto.getRandomValues(value);
      return value[0] % length;
    }
    return Math.floor(Math.random() * length);
  }
  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const pick = values => values[randomIndex(values.length)];
  const topicName = id => bank.topics.find(topic => topic.id === id)?.name || id;
  const methodName = id => methods.find(method => method.id === id).name;
  const quizBank = topic => bank.cards.filter(card => topic === 'all' || card.topic === topic);
  const head = (label, title, description) => `<div class="eyebrow">${escape(label)}</div><h1 class="page-heading">${escape(title)}</h1><p class="page-sub">${escape(description)}</p>`;
  const sourceNote = '<p class="smalltxt muted">Sources: August 2026 INTE 401 instructional material and updated reviewer. “Added context” labels identify details or worked exercises added by the reviewer.</p>';

  function createQuiz({ topic = 'all', count = 100, cards = quizBank(topic), previous = null } = {}) {
    if (!Number.isInteger(count) || count < 1 || !cards.length) throw Error('Choose a nonempty quiz and a positive whole-number length.');
    // Round-robin topic pools keep short mixed quizzes from omitting entire topics.
    const pools = shuffle([...new Set(cards.map(card => card.topic))])
      .map(id => shuffle(cards.filter(card => card.topic === id)));
    const selected = [];
    while (selected.length < Math.min(count, cards.length)) {
      for (const pool of pools) {
        if (pool.length && selected.length < count) selected.push(pool.pop());
      }
    }
    let items = shuffle(selected);
    if (items.length > 1 && previous?.items.map(card => card.id).join() === items.map(card => card.id).join()) {
      items = items.slice(1).concat(items[0]);
    }
    items = items.map(card => {
      const order = shuffle([0, 1, 2, 3]);
      return { ...card, choices: order.map(index => card.choices[index]), answer: order.indexOf(card.answer) };
    });
    return { items, answers: Array(items.length).fill(null), i: 0, revealed: false, finished: false };
  }

  function quizReport(quiz) {
    const correct = quiz.answers.filter(answer => answer?.correct).length;
    return {
      total: quiz.items.length, correct, percent: Math.round(correct * 100 / quiz.items.length),
      missed: quiz.items.filter((_, i) => !quiz.answers[i]?.correct),
    };
  }

  function answerQuiz(choice) {
    const quiz = state.quiz;
    if (!quiz || quiz.finished || quiz.answers[quiz.i]) return false;
    if (choice !== null && (!Number.isInteger(choice) || choice < 0 || choice > 3)) return false;
    const correct = choice === quiz.items[quiz.i].answer;
    quiz.answers[quiz.i] = { choice, correct };
    quiz.revealed = true;
    api.onQuizAnswer?.(correct);
    return true;
  }

  function phrasePool(difficulty) {
    const actions = ['PROTECT', 'VERIFY', 'AUDIT', 'CHECK', 'SECURE', 'REVIEW', 'GUARD', 'MONITOR', 'DEFEND', 'INSPECT'];
    const resources = ['ACCESS', 'DATA', 'FILES', 'SYSTEMS', 'NETWORKS', 'SECRETS', 'RECORDS', 'DEVICES', 'SERVICES', 'BACKUPS', 'MESSAGES', 'ACCOUNTS'];
    const qualities = ['PRIVATE', 'TRUSTED', 'CRITICAL', 'INTERNAL', 'REMOTE', 'SHARED', 'STORED', 'SECRET', 'LOCAL', 'DIGITAL'];
    if (difficulty === 'easy') return [...new Set([...actions, ...resources, ...qualities])];
    if (difficulty === 'medium') return actions.flatMap(action => resources.map(resource => `${action} ${resource}`));
    return actions.flatMap(action => qualities.flatMap(quality => resources.map(resource => `${action} ${quality} ${resource}`)));
  }

  function makeCipherQuestion(task, phrase, difficulty) {
    const method = methods.find(item => item.id === task.method);
    let type = task.method, key = '', options = {}, rule;
    if (task.method === 'substitution') {
      type = task.variant % 2 ? 'mono' : 'caesar';
      if (type === 'caesar') {
        options.shift = 1 + randomIndex(25);
        rule = `Caesar substitution. Shift forward by ${options.shift} to encrypt; backward by ${options.shift} to decrypt. Wrap A–Z. A=0 through Z=25.`;
      } else {
        key = shuffle(alphabet).join('');
        if (letters(api.simulate(type, phrase, key, 'encrypt', options).text) === letters(phrase)) key = alphabet.slice(1) + alphabet[0];
        rule = 'Custom monoalphabetic substitution. The key alphabet replaces A–Z in order. For decryption, find each ciphertext letter in the key alphabet and read the normal letter above it.';
      }
    } else if (task.method === 'transposition') {
      type = 'columnar';
      options.cols = 2 + randomIndex(difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 5);
      rule = `Use ${options.cols} columns. Remove spaces and uppercase letters. Encrypt by filling rows left to right, then reading columns top to bottom, from left to right. No padding. To decrypt, fill the columns using their original lengths, then read rows. This is the reviewer's added grid method.`;
    } else if (task.method === 'vernam') {
      key = Array.from({ length: letters(phrase).length }, () => alphabet[randomIndex(26)]).join('');
      rule = 'Course Vernam: A=1 through Z=26. Add plaintext and pad values to encrypt; subtract the pad to decrypt. Wrap into 1–26. Use one pad letter per message letter; spaces do not consume pad letters.';
    } else {
      key = pick(['KEY', 'LOCK', 'GUARD', 'CIPHER', 'SIGNAL', 'ACCESS', 'TRUST', 'SHIELD', 'SAFETY', 'ORANGE', 'RIVER', 'LEMON', 'VAULT', 'CLOUD', 'MAPLE', 'SILVER']);
      rule = 'Vigenère: A=0 through Z=25. Repeat the keyword over message letters only. Add key values modulo 26 to encrypt; subtract them modulo 26 to decrypt. Spaces do not advance the key. This worked algorithm is added practice for the pictured course topic.';
    }
    const encrypted = api.simulate(type, phrase, key, 'encrypt', options).text;
    return {
      method: task.method, type, key, options, rule, mode: task.mode, source: method.source,
      src: task.mode === 'encrypt' ? phrase : encrypted,
      target: task.mode === 'encrypt' ? encrypted : phrase,
    };
  }

  const examSignature = exam => JSON.stringify(exam.items.map(item => [item.method, item.type, item.mode, item.src, item.key, item.options]));
  function createCipherExam({ count = 16, difficulty = 'medium', previous = null } = {}) {
    if (![8, 16, 24].includes(count)) throw Error('Choose an exam with 8, 16 or 24 questions.');
    if (!['easy', 'medium', 'hard'].includes(difficulty)) throw Error('Choose a listed difficulty.');
    const perMethod = count / methods.length;
    const schedule = shuffle(methods.flatMap(method => Array.from({ length: perMethod }, (_, index) => ({
      method: method.id, variant: index, mode: index < perMethod / 2 ? 'encrypt' : 'decrypt',
    }))));
    const phrases = shuffle(phrasePool(difficulty));
    const exam = {
      items: schedule.map((task, index) => makeCipherQuestion(task, phrases[index], difficulty)),
      answers: Array(count).fill(''), i: 0, difficulty, result: null,
    };
    if (previous && examSignature(previous) === examSignature(exam)) {
      exam.items[0] = makeCipherQuestion(schedule[0], phrases[count], difficulty);
    }
    return exam;
  }

  function gradeAnswer(actual, expected) {
    const normalize = value => String(value ?? '').toUpperCase().replace(/\s/g, '');
    const answer = normalize(actual);
    return /^[A-Z]+$/.test(answer) && answer === normalize(expected);
  }
  function gradeCipherExam(exam) {
    const results = exam.items.map((item, index) => ({
      item, answer: exam.answers[index] || '', correct: gradeAnswer(exam.answers[index], item.target),
    }));
    const correct = results.filter(result => result.correct).length;
    return {
      results, total: results.length, correct, percent: Math.round(correct * 100 / results.length),
      unanswered: results.filter(result => !result.answer.trim()).length,
      byMethod: methods.map(method => {
        const subset = results.filter(result => result.item.method === method.id);
        return { ...method, total: subset.length, correct: subset.filter(result => result.correct).length };
      }),
    };
  }

  function startQuiz(cards) {
    const previous = state.quiz;
    state.quiz = createQuiz(cards ? { cards, count: cards.length, previous } : { ...state.quizOptions, previous });
  }
  function startCipherExam() {
    state.cipherExam = createCipherExam({ ...state.cipherOptions, previous: state.cipherExam });
  }
  function submitCipherExam() {
    const exam = state.cipherExam;
    if (!exam || exam.result) return false;
    exam.result = gradeCipherExam(exam);
    api.onCipherFinished?.(exam.result);
    return true;
  }
  function refresh(focus = '#study-question') {
    api.render?.();
    const target = global.document?.querySelector(focus) || global.document?.querySelector('#main-content .page-heading');
    target?.setAttribute('tabindex', '-1');
    target?.focus?.({ preventScroll: true });
    const bounds = target?.getBoundingClientRect?.();
    const header = global.document?.querySelector('.topbar')?.getBoundingClientRect?.();
    if (bounds && (bounds.top < (header?.height || 0) + 16 || bounds.bottom > global.innerHeight)) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function renderQuizSetup() {
    const options = state.quizOptions, available = quizBank(options.topic).length;
    const sizes = [...new Set([10, 25, 50, available].filter(count => count <= available))];
    const progress = api.getProgress();
    return `${head('100-CARD TOPIC QUIZ', 'INTE 401 quiz cards', 'Practice 100 original questions across the INTE 401 examination topics. Answer a card, flip to its explanation, then revisit what you missed.')}
      <div class="two-col">
        <section class="panel">
          <h2>Build your quiz deck</h2>
          <label class="input-label" for="study-quiz-topic">Topic</label>
          <select class="field" id="study-quiz-topic"><option value="all">All INTE 401 topics · 100 cards</option>${bank.topics.map(topic => `<option value="${topic.id}" ${options.topic === topic.id ? 'selected' : ''}>${escape(topic.name)} · ${quizBank(topic.id).length} cards</option>`).join('')}</select>
          <div class="form-row"><div><label class="input-label" for="study-quiz-count">Cards in this quiz</label>
            <select class="field" id="study-quiz-count">${sizes.map(count => `<option value="${count}" ${Math.min(options.count, available) === count ? 'selected' : ''}>${count === available ? `Full deck · ${count} cards` : `${count} cards`}</option>`).join('')}</select>
          </div></div>
          <p>Questions and answer choices shuffle for each quiz. Short mixed decks sample across the topic groups.</p>
          <button class="btn" id="start-study-quiz">Start flashcard quiz →</button>
        </section>
        <aside class="panel">
          <h2>Recall, answer, understand</h2>
          <ol><li>Read the question and choose the best answer.</li><li>The answer side explains why it is correct.</li><li>Finish for a score and a deck of missed cards.</li></ol>
          <div class="mini-cards"><div class="mini-card"><b class="big-stat">${progress.cardQuizSessions || 0}</b><p>Quizzes finished</p></div><div class="mini-card"><b class="big-stat">${progress.cardQuizBest || 0}%</b><p>Best card-quiz score</p></div></div>
          <div class="notice mt">A correct first answer earns 10 XP. Revealing without answering counts as a missed card, ready to retry.</div>
          ${sourceNote}
        </aside>
      </div>
      <section class="panel mt"><h2>INTE 401 examination coverage</h2><div class="study-topic-list">${bank.topics.map(topic => `<span class="pill">${escape(topic.name)} · ${quizBank(topic.id).length}</span>`).join('')}</div><p>Remote-access protocol details, control classifications and added cipher exercises carry an “Added context” label.</p></section>`;
  }

  function renderQuizResult() {
    const quiz = state.quiz, report = quizReport(quiz);
    return `${head('QUIZ DECK COMPLETE', 'Your recall checkpoint', 'Use the explanations to understand your misses, then test yourself with a fresh deck.')}
      <section class="panel centered center">
        <div class="exam-score">${report.percent}%</div><h2>${report.correct} / ${report.total} correct</h2>
        <p>Your first answer to each card determines the score. Quiz progress has been saved locally.</p>
        <div class="study-actions"><button class="btn" id="new-study-quiz">Create a new quiz →</button>${report.missed.length ? `<button class="btn secondary" id="retry-study-missed">Retry ${report.missed.length} missed cards</button>` : ''}<button class="btn ghost" id="study-quiz-settings">Quiz setup</button></div>
      </section>
      ${report.missed.length ? `<section class="mt"><h2>Cards to revisit</h2>${quiz.items.map((card, index) => {
        const answer = quiz.answers[index];
        if (answer.correct) return '';
        return `<details class="panel study-review"><summary>${index + 1}. ${escape(card.question)}</summary><p><b>Your choice:</b> ${escape(answer.choice === null ? 'Revealed without answering' : card.choices[answer.choice])}</p><p><b>Correct answer:</b> ${escape(card.choices[card.answer])}</p><div class="notice">${escape(card.explanation)}</div><p class="lesson-info">${escape(card.source)}</p></details>`;
      }).join('')}</section>` : '<div class="notice mt centered">You answered every card correctly. Create a new shuffled quiz or try a focused topic deck.</div>'}`;
  }

  function renderQuiz() {
    const quiz = state.quiz;
    if (!quiz) return renderQuizSetup();
    if (quiz.finished) return renderQuizResult();
    const card = quiz.items[quiz.i], answer = quiz.answers[quiz.i];
    const completed = quiz.answers.filter(Boolean).length, correct = quiz.answers.filter(value => value?.correct).length;
    return `${head('ACTIVE RECALL · QUIZ CARDS', 'One card, one concept', 'Choose an answer before you flip. Your first answer is scored; use the explanation to check your reasoning.')}
      <div class="flash-stage">
        <div class="split study-status"><span class="pill">CARD ${quiz.i + 1} / ${quiz.items.length}</span><span>${correct} correct · ${completed} answered</span></div>
        <div class="progress-track study-progress" role="progressbar" aria-label="Quiz cards answered" aria-valuemin="0" aria-valuemax="${quiz.items.length}" aria-valuenow="${completed}"><span style="width:${completed * 100 / quiz.items.length}%"></span></div>
        <article class="panel quiz-card ${quiz.revealed ? 'quiz-card-revealed' : ''}">
          <div class="split study-status"><span class="pill ${card.added ? 'bonus' : 'core'}">${card.added ? 'ADDED CONTEXT' : 'CORE TOPIC'}</span><span class="smalltxt muted">${escape(topicName(card.topic))}</span></div>
          ${quiz.revealed ? `<div class="quiz-answer-side"><div class="eyebrow">ANSWER & EXPLANATION</div><h2 id="study-question" tabindex="-1">${escape(card.choices[card.answer])}</h2><p>${escape(card.question)}</p><div class="feedback ${answer.correct ? 'good' : 'bad'}"><b>${answer.correct ? '✓ Correct · +10 XP' : answer.choice === null ? 'Revealed · retry this card' : 'Not quite · review this card'}</b><p>${escape(card.explanation)}</p>${answer.choice !== null && !answer.correct ? `<p>Your choice: ${escape(card.choices[answer.choice])}</p>` : ''}</div><p class="lesson-info">${escape(card.source)}</p></div>` :
            `<div class="eyebrow">QUESTION SIDE</div><h2 class="question-big" id="study-question" tabindex="-1">${escape(card.question)}</h2>${card.choices.map((choice, index) => `<button class="answer-option" data-quiz-choice="${index}" ${answer ? 'disabled' : ''}><span>${'ABCD'[index]}</span>${escape(choice)}</button>`).join('')}`}
          <div class="study-actions">
            ${answer ? `<button class="btn secondary" id="flip-study-quiz">${quiz.revealed ? 'Flip to question' : 'Flip to explanation'} ↻</button>` : '<button class="btn ghost" id="reveal-study-answer">Reveal answer (counts as missed)</button>'}
          </div>
        </article>
        <div class="study-actions"><button class="btn secondary" id="previous-study-card" ${quiz.i === 0 ? 'disabled' : ''}>← Previous</button><button class="btn" id="next-study-card" ${!answer ? 'disabled' : ''}>${quiz.i === quiz.items.length - 1 ? 'Finish quiz' : 'Next card'} →</button><button class="btn ghost" id="study-quiz-settings">Quiz setup</button></div>
      </div>`;
  }

  function renderCipherSetup() {
    const options = state.cipherOptions, progress = api.getProgress();
    return `${head('GENERATED FOUR-CIPHER EXAM', 'Work the ciphers on your own', 'Solve fresh encryption and decryption problems for substitution, transposition, Vernam and Vigenère. Answers and worked solutions appear after you submit.')}
      <div class="two-col">
        <section class="panel"><h2>Create a simulated exam</h2>
          <div class="form-row">
            <div><label class="input-label" for="study-cipher-count">Exam length</label><select class="field" id="study-cipher-count">${[8, 16, 24].map(count => `<option value="${count}" ${options.count === count ? 'selected' : ''}>${count} questions · ${count / 4} per cipher</option>`).join('')}</select></div>
            <div><label class="input-label" for="study-cipher-difficulty">Difficulty</label><select class="field" id="study-cipher-difficulty">${[['easy', 'Short words'], ['medium', 'Standard phrases'], ['hard', 'Longer phrases & grids']].map(([value, label]) => `<option value="${value}" ${options.difficulty === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
          </div>
          <ul class="study-method-list">${methods.map(method => `<li><b>${escape(method.name)}</b><span>Encryption + decryption</span></li>`).join('')}</ul>
          <p>Every exam balances all four ciphers and both directions. Messages, keys and question order change when you create a new exam.</p>
          <button class="btn" id="start-cipher-exam">Create simulated exam →</button>
        </section>
        <aside class="panel"><h2>Know the conventions</h2>
          <p><b>Substitution:</b> Caesar shifts and supplied 26-letter alphabets.</p><p><b>Transposition:</b> The reviewer's added row-fill, column-read grid. Each question specifies its column count; no padding is added.</p><p><b>Vernam:</b> Course A=1 through Z=26, with a full-length pad.</p><p><b>Vigenère:</b> Added A=0 through Z=25 exercises with a repeating keyword.</p>
          <div class="notice">This is an untimed practice exam. You may move between questions and revise answers before submitting. Case and spacing are ignored; use A–Z letters. Blank answers receive zero.</div>
          <div class="mini-cards mt"><div class="mini-card"><b class="big-stat">${progress.cipherExamSessions || 0}</b><p>Cipher exams finished</p></div><div class="mini-card"><b class="big-stat">${progress.cipherExamBest || 0}%</b><p>Best cipher-exam score</p></div></div>
          ${sourceNote}
        </aside>
      </div>`;
  }

  function keyHtml(item) {
    if (item.type === 'mono') return `<label class="input-label">Plain alphabet → replacement alphabet</label><pre class="codebox study-key">${alphabet}\n${escape(item.key)}</pre>`;
    if (item.type === 'caesar') return `<div class="notice"><b>Shift:</b> ${item.options.shift} · A=0 through Z=25</div>`;
    if (item.type === 'columnar') return `<div class="notice"><b>Grid key:</b> ${item.options.cols} columns · no padding</div>`;
    return `<label class="input-label">${item.type === 'vernam' ? 'One-time pad · A=1 through Z=26' : 'Repeating keyword · A=0 through Z=25'}</label><pre class="codebox study-key">${escape(item.key)}</pre>`;
  }

  function renderCipherResult() {
    const exam = state.cipherExam, report = exam.result;
    return `${head('CIPHER EXAM COMPLETE', 'Your cipher exam results', 'Review the calculations, identify the rules you missed, and create a new exam with different messages and keys.')}
      <section class="panel centered center"><div class="exam-score">${report.percent}%</div><h2>${report.correct} / ${report.total} correct</h2><p>${report.unanswered} unanswered · ${report.correct * 15} XP earned. Your score and practice accuracy have been saved locally.</p><div class="study-actions"><button class="btn" id="new-cipher-exam">Create a new simulated exam →</button><button class="btn secondary" id="cipher-exam-settings">Change exam settings</button></div></section>
      <div class="study-score-grid mt">${report.byMethod.map(method => `<div class="panel"><h3>${escape(method.name)}</h3><b class="big-stat">${method.correct} / ${method.total}</b><p>${Math.round(method.correct * 100 / method.total)}% correct</p></div>`).join('')}</div>
      <section class="mt"><h2>Answer review & worked solutions</h2><p>Expand any question to compare your answer and follow every calculation.</p>${report.results.map((result, index) => {
        const item = result.item;
        const calculation = api.simulate(item.type, item.src, item.key, item.mode, item.options);
        const solution = { ...calculation.solution, source: item.source };
        return `<details class="panel study-review"><summary>Q${index + 1} · ${escape(methodName(item.method))} · ${item.mode === 'encrypt' ? 'Encrypt' : 'Decrypt'} · ${result.correct ? '✓ Correct' : result.answer.trim() ? 'Missed' : 'Unanswered'}</summary><p><b>Question:</b> ${escape(item.src)}</p>${keyHtml(item)}<p><b>Your answer:</b> <span class="mono">${escape(result.answer || '(blank)')}</span></p><p><b>Correct answer:</b> <strong class="mono">${escape(item.target)}</strong></p>${api.renderSolution(solution)}</details>`;
      }).join('')}</section>`;
  }

  function renderCipherExam() {
    const exam = state.cipherExam;
    if (!exam) return renderCipherSetup();
    if (exam.result) return renderCipherResult();
    const item = exam.items[exam.i], answered = exam.answers.filter(answer => answer.trim()).length;
    return `${head('FOUR-CIPHER EXAM · ANSWERS HIDDEN', 'Solve before you submit', `Question ${exam.i + 1} of ${exam.items.length}. Your answers stay in this exam while you move between questions.`)}
      <div class="two-col cipher-exam-layout">
        <section class="panel">
          <div class="split study-status"><span class="pill core">${escape(methodName(item.method))}</span><span class="pill">${item.mode.toUpperCase()}</span></div>
          <h2 class="question-big" id="study-question" tabindex="-1">${item.mode === 'encrypt' ? 'Encrypt this plaintext.' : 'Decrypt this ciphertext.'}</h2>
          <p>${escape(item.rule)}</p>${keyHtml(item)}
          <div class="mission-prominent">${escape(item.src)}</div>
          <label class="input-label" for="study-cipher-answer">Your ${item.mode === 'encrypt' ? 'ciphertext' : 'plaintext'} answer</label>
          <textarea class="field answer-input study-answer" id="study-cipher-answer" rows="3" maxlength="256" spellcheck="false" autocomplete="off" autocapitalize="characters" aria-describedby="cipher-answer-help">${escape(exam.answers[exam.i])}</textarea>
          <p class="smalltxt muted" id="cipher-answer-help">Use A–Z letters. Case and spaces are ignored. You can revise this answer before submitting.</p>
          <div class="study-actions"><button class="btn secondary" id="previous-cipher-question" ${exam.i === 0 ? 'disabled' : ''}>← Previous</button><button class="btn secondary" id="next-cipher-question" ${exam.i === exam.items.length - 1 ? 'disabled' : ''}>Next question →</button></div>
          <p class="lesson-info">${escape(item.source)}</p>
        </section>
        <aside class="panel cipher-exam-nav"><h2>Question navigator</h2><p><b id="cipher-answered">${answered} / ${exam.items.length}</b> answered</p>
          <div class="study-question-map" role="group" aria-label="Exam questions">${exam.items.map((question, index) => `<button class="study-question-jump ${exam.answers[index].trim() ? 'answered' : ''}" data-study-question="${index}" ${index === exam.i ? 'aria-current="step"' : ''} aria-label="Question ${index + 1}, ${escape(methodName(question.method))}, ${exam.answers[index].trim() ? 'answered' : 'unanswered'}">${index + 1}</button>`).join('')}</div>
          <p class="smalltxt muted">Filled buttons have an answer. The outlined button is the question you are viewing.</p>
          <p id="cipher-remaining">${exam.items.length - answered} unanswered. Blank answers receive zero.</p>
          <div class="study-actions"><button class="btn" id="submit-cipher-exam">Submit exam & see results →</button><button class="btn ghost" id="new-cipher-exam" title="Replace this attempt with fresh questions and empty answers">New simulated exam</button><button class="btn ghost" id="cipher-exam-settings">Exam setup</button></div>
        </aside>
      </div>`;
  }

  function handleClick(button) {
    if (button.hasAttribute('data-quiz-choice')) {
      answerQuiz(Number(button.dataset.quizChoice)); refresh(); return true;
    }
    if (button.hasAttribute('data-study-question')) {
      const exam = state.cipherExam, index = Number(button.dataset.studyQuestion);
      if (exam && !exam.result && Number.isInteger(index) && index >= 0 && index < exam.items.length) {
        exam.i = index; refresh();
      }
      return true;
    }
    const quiz = state.quiz, exam = state.cipherExam;
    switch (button.id) {
      case 'start-study-quiz': case 'new-study-quiz': startQuiz(); break;
      case 'retry-study-missed': if (quiz?.finished) startQuiz(quizReport(quiz).missed); break;
      case 'study-quiz-settings': state.quiz = null; break;
      case 'reveal-study-answer': answerQuiz(null); break;
      case 'flip-study-quiz': if (quiz?.answers[quiz.i]) quiz.revealed = !quiz.revealed; break;
      case 'previous-study-card':
        if (quiz && quiz.i > 0) { quiz.i--; quiz.revealed = Boolean(quiz.answers[quiz.i]); }
        break;
      case 'next-study-card':
        if (!quiz || quiz.finished || !quiz.answers[quiz.i]) return true;
        if (quiz.i < quiz.items.length - 1) { quiz.i++; quiz.revealed = Boolean(quiz.answers[quiz.i]); }
        else { quiz.finished = true; api.onQuizFinished?.(quizReport(quiz)); }
        break;
      case 'start-cipher-exam': case 'new-cipher-exam': startCipherExam(); break;
      case 'cipher-exam-settings': state.cipherExam = null; break;
      case 'previous-cipher-question': if (exam && !exam.result && exam.i > 0) exam.i--; break;
      case 'next-cipher-question': if (exam && !exam.result && exam.i < exam.items.length - 1) exam.i++; break;
      case 'submit-cipher-exam': submitCipherExam(); break;
      default: return false;
    }
    refresh(); return true;
  }

  function handleInput(element) {
    if (element.id !== 'study-cipher-answer') return false;
    const exam = state.cipherExam;
    if (!exam || exam.result) return true;
    exam.answers[exam.i] = element.value;
    const answered = exam.answers.filter(answer => answer.trim()).length;
    const total = global.document.querySelector('#cipher-answered');
    if (total) total.textContent = `${answered} / ${exam.items.length}`;
    const remaining = global.document.querySelector('#cipher-remaining');
    if (remaining) remaining.textContent = `${exam.items.length - answered} unanswered. Blank answers receive zero.`;
    const jump = global.document.querySelector(`[data-study-question="${exam.i}"]`);
    if (jump) {
      jump.classList.toggle('answered', Boolean(element.value.trim()));
      jump.setAttribute('aria-label', `Question ${exam.i + 1}, ${methodName(exam.items[exam.i].method)}, ${element.value.trim() ? 'answered' : 'unanswered'}`);
    }
    return true;
  }

  function handleChange(element) {
    switch (element.id) {
      case 'study-quiz-topic':
        state.quizOptions.topic = element.value;
        state.quizOptions.count = quizBank(element.value).length;
        refresh('#study-quiz-topic'); return true;
      case 'study-quiz-count': state.quizOptions.count = Number(element.value); return true;
      case 'study-cipher-count': state.cipherOptions.count = Number(element.value); return true;
      case 'study-cipher-difficulty': state.cipherOptions.difficulty = element.value; return true;
      default: return false;
    }
  }

  global.CipherLabStudy = {
    methods, state, createQuiz, quizReport, answerQuiz, createCipherExam, gradeCipherExam,
    gradeAnswer, examSignature, startQuiz, startCipherExam, submitCipherExam,
    renderQuiz, renderCipherExam, handleClick, handleInput, handleChange,
    connect: bridge => { api = bridge; },
  };
})(window);
