const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function app(saved = '{}') {
  const nodes = new Map(), listeners = new Map();
  const document = {
    documentElement: { dataset: {} }, body: { dataset: {} },
    addEventListener: (name, listener) => listeners.set(name, listener),
    querySelectorAll: () => [],
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, {
        style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {}, focus() {},
      });
      return nodes.get(selector);
    },
  };
  const context = vm.createContext({
    document, TextEncoder, TextDecoder,
    localStorage: { getItem: () => saved, setItem: (key, value) => { saved = value; } },
  });
  context.window = context;
  context.scrollTo = () => {};
  for (const name of ['reviewer.js', 'solutions.js', 'study-bank.js', 'study.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'source', name), 'utf8'), context);
  }
  return {
    study: context.CipherLabStudy, bank: context.CipherLabStudyBank,
    read: code => vm.runInContext(code, context),
    saved: () => JSON.parse(saved),
    click(id, dataset = {}) {
      const button = { id, dataset, hasAttribute: name => Object.hasOwn(dataset, name.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())) };
      listeners.get('click')({ target: { closest: () => button } });
    },
  };
}
const plain = value => JSON.parse(JSON.stringify(value));
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const clean = value => value.toUpperCase().replace(/[^A-Z]/g, '');
const wrap = value => (value % 26 + 26) % 26;

// Independent formulas verify the generated problem statements and expected answers.
function referenceAnswer(item) {
  const input = clean(item.src), direction = item.mode === 'decrypt' ? -1 : 1;
  if (item.type === 'transposition') {
    const destinations = item.key.split(' ').map(Number);
    // Find which input supplies each output position, using the inverse lookup
    // rather than the simulator's source-to-destination assignments.
    return input.match(/.{8}/g).map(block => Array.from({ length: 8 }, (_, column) => {
      const position = 8 - column;
      const inputPosition = direction === 1 ? destinations.indexOf(position) + 1 : destinations[position - 1];
      return block[8 - inputPosition];
    }).join('')).join('');
  }
  return [...input].map((letter, i) => {
    if (item.type === 'mono') return direction === 1 ? item.key[alphabet.indexOf(letter)] : alphabet[item.key.indexOf(letter)];
    const shift = item.type === 'caesar' ? item.options.shift : alphabet.indexOf(item.key[i % item.key.length]) + (item.type === 'vernam' ? 1 : 0);
    return alphabet[wrap(alphabet.indexOf(letter) + direction * shift)];
  }).join('');
}

test('the bank contains 160 distinct, sourced four-choice cards across all seven PDF units', () => {
  const { bank } = app();
  assert.equal(bank.cards.length, 160);
  assert.equal(new Set(bank.cards.map(card => card.id)).size, 160);
  assert.equal(new Set(bank.cards.map(card => card.question)).size, 160);
  assert.deepEqual(plain(bank.topics.map(topic => topic.id)), ['access', 'firewalls', 'remote', 'controls', 'idps', 'honeypots', 'scanning', 'biometrics', 'cryptography', 'implementation', 'symmetric', 'public-key', 'pki', 'attacks']);
  assert.deepEqual(plain(bank.topics.map(topic => bank.cards.filter(card => card.topic === topic.id).length)), [14, 12, 8, 10, 14, 8, 10, 10, 14, 10, 15, 15, 10, 10]);
  for (const card of bank.cards) {
    assert.equal(new Set(card.choices).size, 4);
    assert.equal(card.choices.length, 4);
    assert.ok(Number.isInteger(card.answer) && card.answer >= 0 && card.answer < 4);
    assert.ok(card.explanation.length > 35);
    assert.ok(card.source.startsWith(bank.sources.module));
    assert.match(card.source, /Unit [IVX]+, PDF pp\./);
    assert.equal(typeof card.added, 'boolean');
  }
  assert.ok(bank.cards.filter(card => card.topic === 'remote').every(card => card.added));
  assert.equal(bank.cards.find(card => card.question.includes('what is ABCDEFGH')).added, false);
  assert.ok(bank.cards.find(card => card.question.includes('standard added Vigenère')).added);
  assert.match(bank.sources.module, /IASv2026/);
  assert.equal(bank.sources.module, '_IM_INTE-401-IASv2026 (1).pdf');
});

test('quiz filtering and choice shuffling retain correct answers without mutating the bank', () => {
  const { bank, study } = app(), original = JSON.stringify(bank.cards);
  for (const topic of ['all', ...bank.topics.map(topic => topic.id)]) {
    const quiz = study.createQuiz({ topic, count: bank.cards.length });
    assert.equal(quiz.items.length, topic === 'all' ? bank.cards.length : bank.cards.filter(card => card.topic === topic).length);
    assert.equal(new Set(quiz.items.map(card => card.id)).size, quiz.items.length);
    for (const card of quiz.items) {
      const source = bank.cards.find(source => source.id === card.id);
      assert.equal(card.choices[card.answer], source.choices[source.answer]);
      assert.ok(topic === 'all' || card.topic === topic);
    }
  }
  assert.equal(new Set(study.createQuiz({ count: 10 }).items.map(card => card.topic)).size, 10);
  assert.equal(JSON.stringify(bank.cards), original);
  assert.throws(() => study.createQuiz({ count: 0 }), /positive/);
  assert.throws(() => study.createQuiz({ topic: 'unknown' }), /nonempty/);
});

test('quiz cards score the first answer once, preserve old progress and retry only missed cards', () => {
  const instance = app(JSON.stringify({ xp: 65, completed: ['caesar'], flashMastered: [0, 9], theme: 'light' }));
  const { study } = instance;
  study.state.quizOptions = { topic: 'all', count: 10 };
  instance.click('start-study-quiz');
  const quiz = study.state.quiz;
  for (let i = 0; i < quiz.items.length; i++) {
    const choice = i === 0 ? (quiz.items[i].answer + 1) % 4 : quiz.items[i].answer;
    instance.click('', { quizChoice: String(choice) });
    assert.equal(study.answerQuiz(choice), false);
    instance.click('next-study-card');
  }
  assert.ok(quiz.finished);
  assert.equal(study.quizReport(quiz).percent, 90);
  assert.equal(instance.saved().attempts, 10);
  assert.equal(instance.saved().correct, 9);
  assert.equal(instance.saved().xp, 155);
  assert.equal(instance.saved().cardQuizSessions, 1);
  assert.equal(instance.saved().cardQuizBest, 90);
  assert.deepEqual(instance.saved().completed, ['caesar']);
  assert.deepEqual(instance.saved().flashMastered, [0, 9]);
  assert.equal(instance.saved().theme, 'light');
  instance.click('next-study-card');
  assert.equal(instance.saved().cardQuizSessions, 1);
  instance.click('retry-study-missed');
  assert.equal(study.state.quiz.items.length, 1);
  assert.equal(study.state.quiz.items[0].id, quiz.items[0].id);
  assert.equal(study.state.quiz.answers[0], null);
});

test('revealing a quiz answer counts as missed and flipping cannot earn repeated credit', () => {
  const instance = app(), { study } = instance;
  study.startQuiz();
  const before = study.renderQuiz();
  assert.ok(!before.includes(study.state.quiz.items[0].explanation));
  instance.click('reveal-study-answer');
  assert.equal(study.quizReport(study.state.quiz).correct, 0);
  assert.equal(instance.saved().attempts, 1);
  assert.equal(instance.saved().xp, 0);
  assert.ok(study.renderQuiz().includes(study.state.quiz.items[0].explanation));
  instance.click('flip-study-quiz');
  instance.click('flip-study-quiz');
  assert.equal(study.answerQuiz(study.state.quiz.items[0].answer), false);
  assert.equal(instance.saved().attempts, 1);
});

test('every generated exam balances four methods and both directions, with independently correct expected answers', () => {
  const { study } = app();
  let paddedTransposition = false;
  for (const difficulty of ['easy', 'medium', 'hard']) {
    for (const count of [8, 16, 24]) {
      for (let run = 0; run < 3; run++) {
        const exam = study.createCipherExam({ count, difficulty });
        assert.equal(exam.items.length, count);
        assert.equal(exam.answers.length, count);
        assert.ok(exam.answers.every(answer => answer === ''));
        for (const method of study.methods) {
          const questions = exam.items.filter(item => item.method === method.id);
          assert.equal(questions.length, count / 4);
          assert.equal(questions.filter(item => item.mode === 'encrypt').length, count / 8);
          assert.equal(questions.filter(item => item.mode === 'decrypt').length, count / 8);
        }
        assert.equal(new Set(exam.items.map(item => item.mode === 'encrypt' ? clean(item.src) : clean(item.target))).size, count);
        for (const item of exam.items) {
          assert.equal(clean(item.target), referenceAnswer(item), JSON.stringify(item));
          assert.ok(item.rule.length > 60);
          assert.match(item.source, /_IM_INTE-401-IASv2026 \(1\)\.pdf.*Unit III, PDF p/);
          if (item.type === 'vernam') assert.equal(item.key.length, clean(item.src).length);
          if (item.type === 'mono') assert.equal(new Set(item.key).size, 26);
          if (item.type === 'transposition') {
            assert.equal(clean(item.src).length % 8, 0);
            assert.deepEqual(item.key.split(' ').map(Number).sort(), [1,2,3,4,5,6,7,8]);
            assert.match(item.rule, /right to left.*reversing every arrow.*retain/);
            if (/X+$/.test(item.mode === 'encrypt' ? item.src : item.target)) paddedTransposition = true;
          }
        }
      }
    }
  }
  assert.ok(paddedTransposition, 'Coverage includes explicit padding retained by decryption');
  assert.throws(() => study.createCipherExam({ count: 10 }), /8, 16 or 24/);
  assert.throws(() => study.createCipherExam({ difficulty: 'unknown' }), /difficulty/);
});

test('new exams change messages and keys, including deterministic random-source fallback', () => {
  const { study, read } = app();
  const signatures = new Set(), keys = new Set();
  for (let i = 0; i < 12; i++) {
    const exam = study.createCipherExam();
    signatures.add(study.examSignature(exam));
    keys.add(exam.items.find(item => item.type === 'vernam').key);
  }
  assert.equal(signatures.size, 12);
  assert.ok(keys.size > 1);
  read('Math.random=()=>0');
  const first = study.createCipherExam(), second = study.createCipherExam({ previous: first });
  assert.notEqual(study.examSignature(first), study.examSignature(second));
  const quiz = study.createQuiz(), nextQuiz = study.createQuiz({ previous: quiz });
  assert.notDeepEqual(plain(quiz.items.map(card => card.id)), plain(nextQuiz.items.map(card => card.id)));
});

test('cipher exam grading ignores case and spacing, rejects extra symbols, and retains blanks as misses', () => {
  const { study } = app();
  assert.equal(study.gradeAnswer('g p a', 'GPA'), true);
  assert.equal(study.gradeAnswer('  hello\nworld ', 'HELLO WORLD'), true);
  assert.equal(study.gradeAnswer('GPA123', 'GPA'), false);
  assert.equal(study.gradeAnswer('<GPA>', 'GPA'), false);
  assert.equal(study.gradeAnswer('', 'GPA'), false);
  const exam = study.createCipherExam();
  exam.answers = exam.items.map(item => item.target.toLowerCase());
  exam.answers[0] = 'WRONG'; exam.answers[1] = '';
  const report = study.gradeCipherExam(exam);
  assert.equal(report.correct, 14);
  assert.equal(report.percent, 88);
  assert.equal(report.unanswered, 1);
  assert.equal(report.byMethod.reduce((sum, method) => sum + method.correct, 0), 14);
  assert.equal(report.byMethod.reduce((sum, method) => sum + method.total, 0), 16);
});

test('answers remain editable across navigation and are scored and saved only once on submission', () => {
  const instance = app(), { study } = instance;
  instance.click('start-cipher-exam');
  const exam = study.state.cipherExam;
  const answer = exam.items[0].target;
  study.handleInput({ id: 'study-cipher-answer', value: answer });
  instance.click('next-cipher-question');
  assert.equal(exam.i, 1);
  instance.click('', { studyQuestion: '0' });
  assert.equal(exam.answers[0], answer);
  assert.equal(instance.read('progress.attempts'), 0);
  assert.equal(instance.read('progress.cipherExamSessions'), 0);
  assert.doesNotMatch(study.renderCipherExam(), /Correct answer:|solution-guide|exam-score/);
  exam.answers = exam.items.map(item => item.target);
  instance.click('submit-cipher-exam');
  assert.equal(instance.saved().cipherExamSessions, 1);
  assert.equal(instance.saved().cipherExamBest, 100);
  assert.equal(instance.saved().attempts, 16);
  assert.equal(instance.saved().correct, 16);
  assert.equal(instance.saved().xp, 240);
  assert.match(study.renderCipherExam(), /Correct answer:|solution-guide/);
  instance.click('submit-cipher-exam');
  assert.equal(instance.saved().cipherExamSessions, 1);
  assert.equal(instance.saved().xp, 240);
  study.handleInput({ id: 'study-cipher-answer', value: 'CHANGED' });
  assert.equal(exam.answers[0], answer);
  instance.click('new-cipher-exam');
  assert.equal(study.state.cipherExam.result, null);
  assert.ok(study.state.cipherExam.answers.every(answer => answer === ''));
  assert.notEqual(study.examSignature(study.state.cipherExam), study.examSignature(exam));
});

test('exam answer review escapes user input and cites the supplied PDF page numbers', () => {
  const { study } = app();
  study.startCipherExam();
  study.state.cipherExam.answers[0] = '<img src=x onerror=alert(1)>';
  study.submitCipherExam();
  const review = study.renderCipherExam();
  assert.doesNotMatch(review, /<img/);
  assert.match(review, /&lt;img/);
  assert.match(review, /Unit III, PDF pp\. 108–109/);
  assert.match(review, /A=0 calculations are added practice/);
  assert.doesNotMatch(review, /Reviewer|Aug2026/);
});

test('new statistics restore safely and do not replace existing scores or flashcard mastery', () => {
  const instance = app(JSON.stringify({
    xp: 100, exams: 4, bestExam: 80, flashMastered: [0, 9],
    cardQuizSessions: 2, cardQuizBest: 500, cipherExamSessions: -1, cipherExamBest: 'bad',
  }));
  assert.equal(instance.read('progress.cardQuizSessions'), 2);
  assert.equal(instance.read('progress.cardQuizBest'), 100);
  assert.equal(instance.read('progress.cipherExamSessions'), 0);
  assert.equal(instance.read('progress.cipherExamBest'), 0);
  assert.equal(instance.read('progress.exams'), 4);
  assert.equal(instance.read('progress.bestExam'), 80);
  assert.deepEqual(plain(instance.read('progress.flashMastered')), [0, 9]);
});
