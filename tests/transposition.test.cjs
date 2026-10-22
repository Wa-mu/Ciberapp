const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function app(saved = '{}') {
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
  for (const file of ['reviewer.js', 'solutions.js', 'study-bank.js', 'study.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'source', file), 'utf8'), context);
  }
  return { context, read: code => vm.runInContext(code, context) };
}
const plain = value => JSON.parse(JSON.stringify(value));
const { context, read } = app();
const { columnarCipher, simulate } = context.CipherLabTest;

// Independent read-position oracle: group original indices by column, then
// sort those groups by key letter and original position before reading indices.
function referenceEncrypt(message, key) {
  const symbols = Array.from(message);
  const columns = typeof key === 'number' ? key : key.length;
  const groups = Array.from({ length: columns }, (_, column) => ({
    column, label: typeof key === 'number' ? column : key[column],
    positions: symbols.map((_, index) => index).filter(index => index % columns === column),
  }));
  groups.sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : a.column - b.column));
  return groups.flatMap(group => group.positions.map(index => symbols[index])).join('');
}

test('ZEBRA encryption produces the exact requested ranks, grid and ciphertext', () => {
  const result = columnarCipher('HELLOWORLD', 'ZEBRA', false);
  assert.equal(result.text, 'ODLREOLLHW');
  assert.deepEqual(plain(result.ranks), [5, 3, 2, 4, 1]);
  assert.deepEqual(plain(result.grid), [['H', 'E', 'L', 'L', 'O'], ['W', 'O', 'R', 'L', 'D']]);
  assert.deepEqual(plain(result.trace.map(column => [column.label, column.chunk])), [
    ['A', 'OD'], ['B', 'LR'], ['E', 'EO'], ['R', 'LL'], ['Z', 'HW'],
  ]);
  assert.equal(simulate('transposition', 'HELLOWORLD', 'ZEBRA', 'encrypt', { method: 'keyword' }).text, result.text);
});

test('ZEBRA decryption reconstructs the original grid and plaintext', () => {
  const result = simulate('transposition', 'ODLREOLLHW', 'ZEBRA', 'decrypt', { method: 'keyword' });
  assert.equal(result.text, 'HELLOWORLD');
  assert.deepEqual(plain(result.grid), [['H', 'E', 'L', 'L', 'O'], ['W', 'O', 'R', 'L', 'D']]);
  assert.deepEqual(plain(result.solution.table.rows[0]), [1, 5, 'A', 2, '1–2', 'OD']);
  assert.match(result.solution.source, /BONUS.*columnar.*separate method/);
});

test('numeric columnar preserves CATDOG compatibility and both simulator directions', () => {
  assert.equal(columnarCipher('CATDOG', 3, false).text, 'CDAOTG');
  assert.equal(columnarCipher('CDAOTG', 3, true).text, 'CATDOG');
  assert.equal(columnarCipher('CATDOG', '3', false).text, 'CDAOTG');
  assert.equal(simulate('transposition', 'CATDOG', '', 'encrypt', { method: 'numeric', columns: 3 }).text, 'CDAOTG');
  assert.equal(simulate('transposition', 'CDAOTG', '', 'decrypt', { method: 'numeric', columns: '3' }).text, 'CATDOG');
  assert.equal(simulate('transposition', 'CATDOG', 3, 'encrypt', { method: 'numeric' }).text, 'CDAOTG');
});

test('repeated keyword letters are retained and ties keep their left-to-right order', () => {
  const result = columnarCipher('ATTACKATDAWN', 'balloon', false);
  assert.equal(result.keyword, 'BALLOON');
  assert.deepEqual(plain(result.ranks), [2, 1, 3, 4, 6, 7, 5]);
  assert.equal(result.text, 'TDATTAAWACNK');
  assert.equal(columnarCipher(result.text, 'BALLOON', true).text, 'ATTACKATDAWN');
  assert.equal(columnarCipher('CATDOG', 'AAA', false).text, 'CDAOTG');
});

test('uneven decryption assigns the extra symbols by original position, not by rank', () => {
  const result = columnarCipher('HELLOWORLDX', 'ZEBRA', false);
  assert.equal(result.text, 'ODLREOLLHWX');
  assert.deepEqual(plain(result.lengths), [3, 2, 2, 2, 2]);
  assert.deepEqual(plain(result.trace.map(column => column.length)), [2, 2, 2, 2, 3]);
  const reverse = simulate('transposition', result.text, 'ZEBRA', 'decrypt', { method: 'keyword' });
  assert.equal(reverse.text, 'HELLOWORLDX');
  assert.deepEqual(plain(reverse.solution.table.rows[4]), [5, 1, 'Z', 3, '9–11', 'HWX']);
  assert.match(reverse.solution.steps[2].text, /first 1 columns in the original grid/);
});

test('empty columns, one-column messages, and genuine trailing X symbols need no padding', () => {
  assert.equal(columnarCipher('CAT', 'ZEBRA', false).text, 'TAC');
  assert.equal(columnarCipher('TAC', 'ZEBRA', true).text, 'CAT');
  assert.deepEqual(plain(columnarCipher('TAC', 'ZEBRA', true).lengths), [1, 1, 1, 0, 0]);
  for (const key of [1, 64, 'A', 'ZZZZZZZZ']) {
    const encrypted = columnarCipher('XX', key, false);
    assert.equal(encrypted.text.length, 2);
    assert.equal(columnarCipher(encrypted.text, key, true).text, 'XX');
  }
});

test('normalization is explicit and punctuation, digits, Unicode symbols and emoji survive', () => {
  const result = columnarCipher('Hi, World!\n123? 😀X', 'ZEBRA', false);
  assert.equal(result.normalized, 'HI,WORLD!123?😀X');
  assert.equal(result.text, referenceEncrypt(result.normalized, 'ZEBRA'));
  assert.equal(columnarCipher(result.text, 'ZEBRA', true).text, result.normalized);
  assert.match(result.normalization, /3 characters removed/);
  assert.match(result.normalization, /Punctuation, digits and other symbols are kept/);
  assert.match(result.normalization, /No padding.*spacing and original case cannot be recovered/);
});

test('independent position oracle verifies 1,008 encryptions and inverse operations', () => {
  const alphabet = Array.from('ABCXYZ019!?😀');
  for (let length = 1; length <= 112; length++) {
    const message = Array.from({ length }, (_, index) => alphabet[index % alphabet.length]).join('');
    for (const key of [1, 2, 3, 8, 64, 'ZEBRA', 'BALLOON', 'AAAA', 'ZZAAZA']) {
      const encrypted = columnarCipher(message, key, false);
      assert.equal(encrypted.text, referenceEncrypt(message, key), `${length} symbols, key ${key}`);
      assert.equal(columnarCipher(encrypted.text, key, true).text, message);
      assert.equal(Array.from(encrypted.text).length, Array.from(message).length);
    }
  }
});

test('empty messages, malformed keywords and invalid column counts fail clearly', () => {
  for (const value of ['', ' \n\t', null, undefined]) assert.throws(() => columnarCipher(value, 'KEY'), /Enter a message/);
  for (const value of ['', ' ', ' KEY ', 'A B', 'A1', 'KEY!', 'É', 'A'.repeat(65), null, undefined]) {
    assert.throws(() => columnarCipher('CAT', value), /keyword/);
    assert.throws(() => simulate('transposition', 'CAT', value, 'encrypt', { method: 'keyword' }), /keyword/);
  }
  for (const value of [0, -1, 1.5, NaN, Infinity, 65, '', '2.5', 'two', '3x', '1e1']) {
    assert.throws(() => simulate('transposition', 'CAT', '', 'encrypt', { method: 'numeric', columns: value }), /whole number of columns/);
  }
  assert.throws(() => simulate('transposition', 'CAT', 'KEY', 'encrypt', { method: 'unknown' }), /valid transposition method/);
});

test('legacy course permutation API, binary data and every other cipher still pass', () => {
  assert.equal(simulate('transposition', 'ABCDEFGH', '4 8 1 5 7 2 6 3', 'encrypt').text, 'GDBEHACF');
  assert.equal(simulate('transposition', '10101000', '4 8 1 5 7 2 6 3', 'decrypt').text, '01000011');
  assert.equal(simulate('transposition', 'GDBEHACF', '4 8 1 5 7 2 6 3', 'decrypt', { method: 'permutation' }).text, 'ABCDEFGH');
  for (const [name, passed] of context.CipherLabTest.selfTest()) assert.equal(passed, true, name);
});

test('interactive frames cover all six phases with one active column and a complete final readout', () => {
  for (const decrypt of [false, true]) {
    const result = columnarCipher(decrypt ? 'ODLREOLLHWX' : 'HELLOWORLDX', 'ZEBRA', decrypt);
    context.result = result;
    const frames = read('columnarSteps(result)');
    assert.deepEqual([...new Set(frames.map(frame => frame.phase))].sort(), [1, 2, 3, 4, 5, 6]);
    let placed = 0;
    for (const frame of frames) {
      assert.ok(frame.placed >= placed && frame.placed <= 11);
      placed = frame.placed;
      context.frame = frame;
      const html = read('columnarScene(result,frame)');
      const activeHeaders = [...html.matchAll(/<th scope="col" data-column="(\d+)" class="is-active"/g)];
      assert.equal(activeHeaders.length, frame.active === undefined ? 0 : 1);
      if (activeHeaders.length) assert.equal(Number(activeHeaders[0][1]), frame.active);
    }
    context.frame = frames.at(-1);
    const final = read('columnarScene(result,frame)');
    assert.match(final, new RegExp(result.text));
    assert.doesNotMatch(final, /is-pending/);
    assert.equal(frames.at(-1).completed, 5);
  }
});

test('columnar explanations and interactive scenes escape message characters', () => {
  const result = simulate('transposition', '<img src=x onerror=evil()>', 'ZEBRA', 'encrypt', { method: 'keyword' });
  const solutionHtml = context.CipherLabSolutions.render(result.solution);
  context.result = result;
  const interactiveHtml = read('columnarInteractive(result)');
  for (const html of [solutionHtml, interactiveHtml]) {
    assert.doesNotMatch(html, /<img|<IMG/);
    assert.match(html, /&lt;/);
  }
  assert.equal(result.solution.steps.length, 6);
  assert.match(solutionHtml, /unoccupied cells, not padding/);
});

test('method selector exposes the appropriate field without duplicating cipher entries', () => {
  for (const method of ['numeric', 'keyword', 'permutation']) {
    read(`S.cipher='transposition';S.simStore.transposition.method='${method}'`);
    const controls = read('simControls()');
    assert.equal((controls.match(/id="sim-method"/g) || []).length, 1);
    assert.match(controls, new RegExp(`value="${method}" selected`));
    assert.match(controls, method === 'numeric' ? /id="sim-columns"/ : /id="sim-key"/);
    assert.match(read('renderLab()'), /id="sim-clear"/);
  }
  assert.equal(read('types.filter(type=>type.id==="transposition").length'), 1);
  assert.equal(read('lessons.filter(lesson=>lesson.id==="transposition").length'), 1);
});

test('columnar missions cover all methods and both directions with independently checked answers', () => {
  read("S.missionCiphers=['transposition'];S.missionCipherQueue=[];let seed=174;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)");
  const methods = new Set(), directions = new Set();
  for (let i = 0; i < 120; i++) {
    const mission = read('generateMission()');
    methods.add(mission.opts.method); directions.add(`${mission.opts.method}:${mission.encrypt}`);
    if (mission.opts.method === 'permutation') continue;
    const plaintext = mission.encrypt ? mission.src : mission.target;
    const ciphertext = mission.encrypt ? mission.target : mission.src;
    assert.equal(ciphertext, referenceEncrypt(plaintext, mission.opts.method === 'numeric' ? mission.opts.columns : mission.key));
    context.mission = mission;
    assert.match(read('missionDescription(mission)'), /BONUS.*No padding/);
    assert.ok(read('missionHint(mission)').length > 50);
  }
  assert.deepEqual([...methods].sort(), ['keyword', 'numeric', 'permutation']);
  assert.equal(directions.size, 6);
});

test('existing lesson IDs, all prior flashcard indices and saved scores remain compatible', () => {
  const { read } = app(JSON.stringify({
    xp: 105, completed: ['transposition', 'caesar'], attempts: 8, correct: 6,
    flashMastered: [0, 44, 75], exams: 3, bestExam: 90, theme: 'light',
    cipherExamSessions: 2, cipherExamBest: 88, cardQuizSessions: 4, cardQuizBest: 80,
  }));
  assert.deepEqual(plain(read('progress')), {
    xp: 105, completed: ['transposition', 'caesar'], attempts: 8, correct: 6,
    flashMastered: [0, 44, 75], exams: 3, bestExam: 90, theme: 'light', achievements: [],
    cipherExamSessions: 2, cipherExamBest: 88, cardQuizSessions: 4, cardQuizBest: 80,
  });
  assert.equal(read('lessons.length'), 27);
  assert.equal(read('types.length'), 10);
  assert.equal(read('flashcards[75][0]'), read('CipherLabReviewer.extraFlashcards.at(-1)[0]'));
  assert.equal(read('Q.filter(item=>item.source.includes("Supplemental columnar")).length'), 6);
  read("S.examScope='core'");
  assert.ok(read('examBank().every(item=>!item.source.includes("Supplemental columnar"))'));
});
