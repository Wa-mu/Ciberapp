const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function app(saved) {
  const nodes = new Map();
  const document = {
    documentElement: { dataset: {} }, body: { dataset: {} },
    addEventListener() {}, querySelectorAll: () => [],
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, {
        style: {}, dataset: {}, setAttribute() {},
      });
      return nodes.get(selector);
    },
  };
  const context = vm.createContext({
    document, TextEncoder, TextDecoder,
    localStorage: { getItem: () => saved, setItem() {} },
  });
  context.window = context;
  for (const name of ['reviewer.js', 'solutions.js', 'study-bank.js', 'study.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'source', name), 'utf8'), context);
  }
  return { context, read: (code) => vm.runInContext(code, context) };
}
const plain = (value) => JSON.parse(JSON.stringify(value));

test('every reviewer topic has a lesson, sourced questions and core exam coverage', () => {
  const { read } = app();
  const { topics, lessons, questions, cards } = plain(read('({topics:CipherLabReviewer.topics,lessons,questions:Q,cards:flashcards})'));
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length);
  assert.equal(topics.length, 9);
  for (const topic of topics) {
    assert.ok(lessons.some((lesson) => lesson.id === topic.id || topic.id === 'cryptography' && lesson.id === 'foundations'));
    assert.ok(questions.filter((item) => item.topic === topic.id && item.tag === 'CORE').length >= 2);
  }
  for (const item of questions) {
    assert.ok(topics.some((topic) => topic.id === item.topic));
    assert.equal(item.a.length, 4);
    assert.equal(new Set(item.a).size, 4);
    assert.ok(Number.isInteger(item.c) && item.c >= 0 && item.c < 4);
    assert.ok(['CORE', 'BONUS'].includes(item.tag));
    assert.ok(item.source && item.exp);
  }
  assert.equal(new Set(questions.map((item) => item.q)).size, questions.length);
  assert.equal(cards[0][0], 'What is plaintext?');
  assert.equal(cards[17][0], 'What does a digital signature provide?');
  assert.ok(cards.some(([front]) => front.includes('FAR vs FRR')));
});

test('exam topic and scope filters determine the actual session and its length', () => {
  const { read } = app();
  for (const topic of plain(read('CipherLabReviewer.topics'))) {
    read(`S.examTopic=${JSON.stringify(topic.id)}; S.examScope='core'; startExam(1000)`);
    const bank = plain(read('examBank()'));
    const items = plain(read('S.exam.items'));
    assert.ok(items.length > 0);
    assert.equal(items.length, bank.length);
    assert.ok(items.every((item) => item.topic === topic.id && item.tag === 'CORE'));
  }
  read("S.examTopic='all'; S.examScope='all'; startExam(10)");
  assert.equal(read('S.exam.items.length'), 10);
  read('startExam(Q.length)');
  assert.equal(read('S.exam.items.length'), read('Q.length'));
  assert.equal(new Set(plain(read('S.exam.items.map(item=>item.q)'))).size, read('Q.length'));
});

test('existing saved lessons and original flashcard mastery survive the content update', () => {
  const { read } = app(JSON.stringify({
    completed: ['caesar', 'vernam', 'caesar', 'removed-lesson'],
    flashMastered: [0, 9, 17, 999, -1, 9], xp: 65, attempts: 5, correct: 4, theme: 'light',
  }));
  const progress = plain(read('progress'));
  assert.deepEqual(progress.completed, ['caesar', 'vernam']);
  assert.deepEqual(progress.flashMastered, [0, 9, 17]);
  assert.equal(progress.xp, 65);
  assert.equal(progress.theme, 'light');
});

test('invalid saved values are normalized and fresh progress does not share mutable arrays', () => {
  const { read } = app(JSON.stringify({
    completed: null, flashMastered: 'broken', attempts: 2, correct: 8,
    bestExam: 1000, xp: -10, theme: 'unexpected',
  }));
  assert.deepEqual(plain(read('progress.completed')), []);
  assert.deepEqual(plain(read('progress.flashMastered')), []);
  assert.equal(read('progress.correct'), 2);
  assert.equal(read('progress.bestExam'), 100);
  assert.equal(read('progress.xp'), 0);
  read("progress.completed.push('access'); progress.flashMastered.push(0); progress=freshProgress()");
  assert.deepEqual(plain(read('progress.completed')), []);
  assert.deepEqual(plain(read('progress.flashMastered')), []);
});

test('XOR missions check complete hex ciphertext or exact recovered plaintext', () => {
  const { read } = app();
  assert.equal(read("answerMatch('xor','151702','15 17 02',true)"), true);
  assert.equal(read("answerMatch('xor','15 zz 17 02','15 17 02',true)"), false);
  assert.equal(read("answerMatch('xor','CAT','CAT',false)"), true);
  assert.equal(read("answerMatch('xor','CAX','CAT',false)"), false);
  assert.equal(read("answerMatch('xor','cat','CAT',false)"), false);
  assert.equal(read("answerMatch('caesar','khoor','KHOOR')"), true);
});

test('invalid numerical cipher keys produce useful errors instead of broken calculations', () => {
  const { read } = app();
  for (const value of ['2.5', 'NaN', 'Infinity']) {
    assert.throws(() => read(`simulate('caesar','CAT','','encrypt',{shift:${value}})`), /whole number/);
    assert.throws(() => read(`simulate('columnar','CAT','','encrypt',{cols:${value}})`), /whole number of columns/);
    assert.throws(() => read(`simulate('rail','CAT','','encrypt',{rails:${value}})`), /whole number of rails/);
  }
});

test('Playfair missions grade prepared plaintext, including required fillers', () => {
  const { read } = app();
  for (const encrypt of [true, false]) {
    const mission = plain(read(`(() => {
      S.missionDifficulty='hard';
      const original=Math.random,values=[0.999,${encrypt ? 0 : 0.999},0,0];
      try{Math.random=()=>values.shift()??0;return generateMission()}
      finally{Math.random=original}
    })()`));
    assert.equal(mission.type, 'playfair');
    assert.equal(mission.encrypt, encrypt);
    const result = plain(read(`simulate('playfair',${JSON.stringify(mission.src)},${JSON.stringify(mission.key)},'${encrypt ? 'encrypt' : 'decrypt'}')`));
    assert.equal(mission.target, result.text);
    assert.match(read(`missionDescription(${JSON.stringify(mission)})`), /keep all filler letters/);
  }
  assert.ok(read("Q.filter(item=>/Playfair/.test(item.q)).every(item=>item.tag==='BONUS')"));
});

test('each selected mission cipher is honored at every difficulty in both directions', () => {
  const { read } = app();
  const methods = plain(read('types.map(type=>type.id)'));
  assert.equal(methods.length, 10);
  for (const type of methods) {
    for (const difficulty of ['easy', 'medium', 'hard', 'mixed']) {
      for (const encrypt of [true, false]) {
        const mission = plain(read(`(() => {
          S.missionCipher=${JSON.stringify(type)}; S.missionDifficulty=${JSON.stringify(difficulty)};
          const original=Math.random; let call=0;
          Math.random=()=>call++===${difficulty === 'mixed' ? 1 : 0}?${encrypt ? 0 : 0.75}:0.25;
          try{return generateMission()}finally{Math.random=original}
        })()`));
        assert.equal(mission.type, type);
        assert.equal(mission.encrypt, encrypt);
        assert.ok(['easy', 'medium', 'hard'].includes(mission.difficulty));
        if (difficulty !== 'mixed') assert.equal(mission.difficulty, difficulty);
        const result = plain(read(`simulate(${JSON.stringify(type)},${JSON.stringify(mission.src)},${JSON.stringify(mission.key)},'${encrypt ? 'encrypt' : 'decrypt'}',${JSON.stringify(mission.opts)})`));
        assert.equal(read(`answerMatch(${JSON.stringify(type)},${JSON.stringify(mission.target)},${JSON.stringify(result.text)},${encrypt})`), true);
        assert.ok(read(`missionHint(${JSON.stringify(mission)}).length`) > 30);
        if (type === 'vernam') assert.equal(mission.key.length, mission.src.replace(/[^A-Z]/g, '').length);
        if (type === 'mono') assert.equal(new Set(mission.key).size, 26);
        if (type === 'rsa') {
          assert.notEqual(mission.opts.p, mission.opts.q);
          assert.ok(mission.parameters.n > 26);
          const description = read(`missionDescription(${JSON.stringify(mission)})`);
          assert.match(description, new RegExp(`n=${mission.parameters.n}`));
          assert.match(description, encrypt ? /public e=/ : /private d=/);
        }
      }
    }
  }
});

test('mixed mission sets retain their difficulty-based rotation', () => {
  const { read } = app();
  const allowed = {
    easy: ['caesar', 'atbash', 'columnar'],
    medium: ['caesar', 'mono', 'columnar', 'vigenere', 'vernam'],
    hard: ['caesar', 'columnar', 'vigenere', 'vernam', 'rail', 'xor', 'playfair'],
  };
  read("S.missionCipher='mixed'; let missionSeed=17; Math.random=()=>((missionSeed=(missionSeed*1664525+1013904223)>>>0)/4294967296)");
  for (const difficulty of ['easy', 'medium', 'hard', 'mixed']) {
    read(`S.missionDifficulty=${JSON.stringify(difficulty)}`);
    const seen = new Set();
    for (let i = 0; i < 30; i++) {
      const mission = plain(read('generateMission()'));
      assert.ok(allowed[mission.difficulty].includes(mission.type));
      seen.add(mission.type);
    }
    assert.ok(seen.size > 1, `${difficulty} should vary its ciphers`);
  }
});

test('mission setup retains selected cipher, difficulty and length', () => {
  const { read } = app();
  read("S.missionCipher='vernam'; S.missionDifficulty='hard'; S.missionGoal=20; S.mission=null");
  const setup = read('renderMissions()');
  assert.match(setup, /id="mission-cipher"/);
  assert.match(setup, /value="vernam" selected/);
  assert.match(setup, /value="hard" selected/);
  assert.match(setup, /value="20" selected/);
  for (const method of plain(read('types'))) assert.ok(setup.includes(`value="${method.id}"`));
});

test('RSA missions compare the complete integer sequence and reject malformed numeric answers', () => {
  const { read } = app();
  for (const answer of ['42 29 68', '42,29,68', '042\n029 068']) {
    assert.equal(read(`answerMatch('rsa',${JSON.stringify(answer)},'42 29 68',true)`), true);
  }
  for (const answer of ['', ' ', 'wrong', '99 29 68', '42 29', '42 29 68 10', '422968', '42 x 29 68', '-42 29 68', '42.0 29 68', '42e0 29 68', '9007199254740993 29 68']) {
    assert.equal(read(`answerMatch('rsa',${JSON.stringify(answer)},'42 29 68',true)`), false, answer);
  }
  assert.equal(read("answerMatch('rsa','cat','CAT',false)"), true);
  assert.equal(read("answerMatch('rsa','DOG','CAT',false)"), false);
});
