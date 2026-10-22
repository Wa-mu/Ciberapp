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
  assert.equal(topics.length, 14);
  for (const topic of topics) {
    assert.ok(lessons.some((lesson) => lesson.topic === topic.id));
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

test('mixed mock exams cover all seven PDF units and reuse the sourced card answers', () => {
  const { read } = app();
  for (const scope of ['all', 'core']) {
    read(`S.examTopic='all'; S.examScope=${JSON.stringify(scope)}; startExam(20)`);
    const units = plain(read('S.exam.items.map(item=>CipherLabReviewer.topics.find(topic=>topic.id===item.topic).unit)'));
    assert.equal(new Set(units).size, 7);
  }
  assert.equal(read('Q.length'), 232);
  assert.equal(read('lessons.length'), 27);
  assert.equal(read('flashcards.length'), 80);
  assert.equal(read('CipherLabReviewer.units.length'), 7);
  assert.ok(read("CipherLabStudyBank.cards.every(card=>Q.some(item=>item.q===card.question&&item.a[item.c]===card.choices[card.answer]&&item.source===card.source&&item.tag===(card.added?'BONUS':'CORE')))"));
  assert.ok(read("[...lessons,...Q].every(item=>item.source.includes(CipherLabReviewer.filename))"));
  assert.ok(read("['modern','hashes','attacks'].every(id=>lessons.find(lesson=>lesson.id===id).level==='CORE')"));
});

test('all original flashcard mastery positions stay attached to the same cards', () => {
  const { read } = app(JSON.stringify({ flashMastered: [0, 17, 18, 43, 44, 45, 46, 47] }));
  assert.deepEqual(plain(read('progress.flashMastered')), [0, 17, 18, 43, 44, 45, 46, 47]);
  assert.equal(read('flashcards[44][0]'), 'What does Playfair transform at each step?');
  assert.equal(read('flashcards[47][0]'), 'Should Playfair decryption automatically delete every X?');
  assert.equal(read('flashcards[48][0]'), 'What are the PDF’s six information-system components?');
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
    assert.throws(() => read(`simulate('transposition','ABCDEFGH',${JSON.stringify(value)},'encrypt')`), /each destination/);
    assert.throws(() => read(`simulate('rail','CAT','','encrypt',{rails:${value}})`), /whole number of rails/);
  }
});

test('Playfair missions grade prepared plaintext, including required fillers', () => {
  const { read } = app();
  for (const encrypt of [true, false]) {
    const mission = plain(read(`(() => {
      S.missionDifficulty='hard'; S.missionCiphers=['playfair']; S.missionCipherQueue=[];
      const original=Math.random,values=[${encrypt ? 0 : 0.999},0,0];
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
          S.missionCiphers=[${JSON.stringify(type)}]; S.missionCipherQueue=[]; S.missionDifficulty=${JSON.stringify(difficulty)};
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

test('checkbox-selected mission sets contain only checked ciphers and balance their counts', () => {
  const { read } = app();
  read('let missionSeed=17; Math.random=()=>((missionSeed=(missionSeed*1664525+1013904223)>>>0)/4294967296)');
  for (const difficulty of ['easy', 'medium', 'hard', 'mixed']) {
    for (const selection of [['vernam', 'vigenere'], ['mono', 'transposition', 'playfair'], plain(read('types.map(type=>type.id)'))]) {
      read(`S.missionDifficulty=${JSON.stringify(difficulty)}; S.missionCiphers=${JSON.stringify(selection)}; S.missionCipherQueue=[]`);
      const counts = new Map(selection.map(id => [id, 0]));
      for (let i = 0; i < 20; i++) {
        const mission = plain(read('generateMission()'));
        assert.ok(selection.includes(mission.type));
        counts.set(mission.type, counts.get(mission.type) + 1);
      }
      assert.ok(Math.max(...counts.values()) - Math.min(...counts.values()) <= 1);
    }
  }
});

test('mission setup renders a checkbox dropdown and retains all checked ciphers', () => {
  const { read } = app();
  read("S.missionCiphers=['vernam','vigenere']; S.missionDifficulty='hard'; S.missionGoal=20; S.mission=null");
  const setup = read('renderMissions()');
  assert.match(setup, /<details class="mission-cipher-picker"/);
  assert.match(setup, /type="checkbox" data-mission-cipher id="mission-cipher-vernam" value="vernam" checked/);
  assert.match(setup, /type="checkbox" data-mission-cipher id="mission-cipher-vigenere" value="vigenere" checked/);
  assert.doesNotMatch(setup, /value="caesar" checked/);
  assert.match(read('missionCipherSummary()'), /Vernam.*Vigenère/);
  assert.match(setup, /value="hard" selected/);
  assert.match(setup, /value="20" selected/);
  for (const method of plain(read('types'))) assert.ok(setup.includes(`value="${method.id}"`));
});

test('select all, clear, and individual checkboxes update the mission pool without duplicates', () => {
  const { read } = app();
  read("setMissionCipherChecked('all',false)");
  assert.deepEqual(plain(read('selectedMissionCiphers()')), []);
  assert.throws(() => read('generateMission()'), /Check at least one cipher/);
  assert.match(read('renderMissions()'), /id="begin-mission" disabled/);
  read("setMissionCipherChecked('vernam',true); setMissionCipherChecked('vigenere',true); setMissionCipherChecked('vernam',true)");
  assert.deepEqual(plain(read('selectedMissionCiphers()')), ['vernam', 'vigenere']);
  read("setMissionCipherChecked('vernam',false)");
  assert.deepEqual(plain(read('selectedMissionCiphers()')), ['vigenere']);
  read("setMissionCipherChecked('all',true)");
  assert.equal(read('selectedMissionCiphers().length'), 10);
  assert.equal(read('missionCipherSummary()'), 'All ciphers (10)');
});

test('changing checked ciphers clears any queued missions from the earlier selection', () => {
  const { read } = app();
  read("S.missionCiphers=['caesar','vernam']; S.missionCipherQueue=['caesar']; setMissionCipherChecked('caesar',false)");
  assert.deepEqual(plain(read('S.missionCipherQueue')), []);
  assert.equal(read('generateMission().type'), 'vernam');
  read("S.missionCiphers=['unknown','vernam','vernam']; S.missionCipherQueue=[]");
  assert.deepEqual(plain(read('selectedMissionCiphers()')), ['vernam']);
  assert.equal(read('generateMission().type'), 'vernam');
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
