const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname, '..', 'source', name), 'utf8');
const context = vm.createContext({ TextEncoder, TextDecoder });
context.window = context;
vm.runInContext(source('reviewer.js'), context);
vm.runInContext(source('solutions.js'), context);
vm.runInContext(source('app.js').split(/const\s+types\s*=/)[0], context);
const simulate = vm.runInContext('simulate', context);
const run = (input, key = 'PLAYFAIR EXAMPLE', mode = 'encrypt') => simulate('playfair', input, key, mode);
const plain = value => JSON.parse(JSON.stringify(value));

test('Playfair matches the published PBS NOVA example in both directions', () => {
  // https://www.pbs.org/wgbh/nova/decoding/playfair.html
  const result = run('THIS SECRET MESSAGE IS ENCRYPTED', 'MANCHESTER');
  assert.equal(result.prepared, 'THISSECRETMESXSAGEISENCRYPTEDX');
  assert.equal(result.text, 'BNFRTSRISREDTWFSDTFRTMRIXQRSGV');
  assert.equal(run(result.text, 'MANCHESTER', 'decrypt').text, result.prepared);
});

test('classic Playfair example explains the square, inserted filler and every pair', () => {
  const result = run('Hide the gold in the tree stump!');
  assert.equal(result.text, 'BMODZBXDNABEKUDMUIXMMOUVIF');
  assert.equal(result.prepared, 'HIDETHEGOLDINTHETREXESTUMP');
  assert.equal(run(result.text, 'PLAYFAIR EXAMPLE', 'decrypt').text, result.prepared);
  assert.equal(result.square, 'PLAYFIREXMBCDGHKNOQSTUVWZ');
  assert.deepEqual(plain(result.fillers), [{ position: 20, letter: 'X', reason: 'Split repeated letters' }]);
  assert.equal(result.solution.grid.rows.length, 5);
  assert.equal(result.solution.table.rows.length, 13);
  assert.deepEqual(plain(result.solution.table.rows[0]), [1, 'HI', 'H: (3, 5); I: (2, 1)', 'Rectangle', 'BM']);
  assert.match(result.solution.source, /BONUS.*not covered/);
  assert.match(result.solution.notes.join(' '), /genuine X or Q/);
});

test('Playfair row/column wraparound and rectangle rules match worked positions', () => {
  for (const [input, encrypted, rule] of [
    ['AR', 'RM', 'Same row'], ['MU', 'CM', 'Same column'], ['HS', 'BP', 'Rectangle'],
  ]) {
    const result = run(input, 'MONARCHY');
    assert.equal(result.text, encrypted);
    assert.equal(result.trace[0].rule, rule);
    assert.equal(run(encrypted, 'MONARCHY', 'decrypt').text, input);
  }
});

test('Playfair handles repeated X, odd messages and I/J without deleting genuine letters', () => {
  for (const [input, prepared] of [
    ['BALLOON', 'BALXLOON'], ['XX', 'XQXQ'], ['X', 'XQ'],
    ['Jiggle!', 'IXIGGLEX'], ['AX', 'AX'], ['FAQ', 'FAQX'],
  ]) {
    const result = run(input);
    assert.equal(result.prepared, prepared);
    assert.equal(run(result.text, 'PLAYFAIR EXAMPLE', 'decrypt').text, prepared);
    assert.ok(result.trace.every(row => row.input[0] !== row.input[1]));
  }
  assert.equal(run('AB', 'jiggle').square, run('AB', 'IGLE').square);
});

test('Playfair rejects empty keys and malformed ciphertext before producing a trace', () => {
  assert.throws(() => run('AB', '123'), /keyword/);
  assert.throws(() => run('123'), /message/);
  assert.throws(() => run('ABC', 'KEY', 'decrypt'), /even number/);
  assert.throws(() => run('AJ', 'KEY', 'decrypt'), /instead of J/);
  assert.throws(() => run('AA', 'KEY', 'decrypt'), /identical-letter pair/);
});

test('Playfair inverts all 600 distinct ordered pairs and retains the complete trace', () => {
  const letters = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const input = [...letters].flatMap(a => [...letters].filter(b => a !== b).map(b => a + b)).join('');
  const result = run(input, 'MONARCHY');
  assert.equal(result.trace.length, 600);
  assert.equal(result.solution.table.rows.length, 600);
  assert.equal(run(result.text, 'MONARCHY', 'decrypt').text, input);
  const html = context.CipherLabSolutions.render(result.solution);
  assert.match(html, /remaining 568 calculations \(600 total\)/);
  assert.match(html, /<td>600<\/td>/);
});
