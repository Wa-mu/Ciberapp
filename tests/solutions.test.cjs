const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = (name) =>
  fs.readFileSync(path.join(__dirname, "..", "source", name), "utf8");
const context = vm.createContext({ TextEncoder, TextDecoder });
context.window = context;
vm.runInContext(source("reviewer.js"), context);
vm.runInContext(source("solutions.js"), context);
// Load the calculation layer without starting the browser interface.
vm.runInContext(source("app.js").split(/const\s+types\s*=/)[0], context);
const simulate = vm.runInContext("simulate", context);
const plain = (value) => JSON.parse(JSON.stringify(value));

test("reviewer Caesar example and negative decryption wraparound", () => {
  const encrypted = simulate("caesar", "HELLO", "", "encrypt", { shift: 3 });
  assert.equal(encrypted.text, "KHOOR");
  assert.deepEqual(plain(encrypted.solution.table.rows[0]), [
    1,
    "H = 7",
    "+3",
    "7 + 3 = 10",
    "10 → 10",
    "K = 10",
  ]);
  const decrypted = simulate("caesar", "ABC", "", "decrypt", { shift: 3 });
  assert.equal(decrypted.text, "XYZ");
  assert.equal(decrypted.solution.table.rows[0][3], "0 − 3 = -3");
  assert.equal(decrypted.solution.table.rows[0][4], "-3 → 23");
});

test("course Vernam uses A=1, including 27, 52, and zero wraparound", () => {
  const encrypted = simulate("vernam", "CAT", "DOG", "encrypt");
  assert.equal(encrypted.text, "GPA");
  const wrapStep = encrypted.solution.steps.find(
    (step) => step.title === "See why letter 3 wraps around",
  );
  assert.match(wrapStep.math, /27 − 26 = 1 → A/);
  assert.deepEqual(plain(encrypted.solution.table.rows[2]), [
    3,
    "T = 20",
    "G = 7",
    "20 + 7 = 27",
    "27 → 1",
    "A = 1",
  ]);
  assert.equal(simulate("vernam", "GPA", "DOG", "decrypt").text, "CAT");
  const z = simulate("vernam", "Z", "Z", "encrypt");
  assert.equal(z.text, "Z");
  assert.equal(z.solution.table.rows[0][4], "52 → 26");
  assert.equal(
    simulate("vernam", "Z", "Z", "decrypt").solution.table.rows[0][4],
    "0 → 26",
  );
  assert.throws(
    () => simulate("vernam", "CAT", "DO", "encrypt"),
    /exactly 3 letters/,
  );
});

test("reviewer Vigenere example and key alignment skip nonletters", () => {
  const encrypted = simulate("vigenere", "ATTACKATDAWN", "LEMON", "encrypt");
  assert.equal(encrypted.text, "LXFOPVEFRNHR");
  assert.equal(encrypted.solution.steps[1].table.rows[1][1], "LEMONLEMONLE");
  assert.equal(encrypted.solution.table.rows[0][1], "A = 0");
  assert.equal(
    simulate("vigenere", "LXFOPVEFRNHR", "LEMON", "decrypt").text,
    "ATTACKATDAWN",
  );
  const formatted = simulate("vigenere", "At tack!", "LEMON", "encrypt");
  assert.equal(formatted.text, "Lx fopv!");
  assert.equal(formatted.solution.steps[1].table.rows[1][1], "LEMONL");
});

test("PDF transposition uses the published arrows and right-to-left numbering", () => {
  const key = '4 8 1 5 7 2 6 3';
  const encrypted = simulate('transposition', 'ABCD EFGH', key, 'encrypt');
  assert.equal(encrypted.text, 'GDBEHACF');
  assert.equal(simulate('transposition', encrypted.text, key, 'decrypt').text, 'ABCDEFGH');
  assert.match(encrypted.solution.source, /Unit III, PDF p\. 107/);
  assert.match(encrypted.solution.legend, /Position 1 is the rightmost/);
  assert.deepEqual(plain(encrypted.solution.table.rows[0]), [1, 'H', 1, 4]);
  const decrypted = simulate('transposition', 'GDBEHACF', key, 'decrypt');
  assert.deepEqual(plain(decrypted.solution.table.rows[0]), [1, 'H', 4, 1]);
  assert.deepEqual(plain(decrypted.solution.grid.rows), [[1, 'GDBEHACF', 'ABCDEFGH']]);
  const custom = simulate('transposition', 'HGFEDCBA', '8 7 6 5 4 3 2 1', 'decrypt');
  assert.equal(custom.text, 'ABCDEFGH');
  assert.match(custom.solution.steps[1].text, /1→8 becomes 8→1/);
  // Each one-bit input independently verifies every source → destination arrow.
  for (const [index, destination] of [4, 8, 1, 5, 7, 2, 6, 3].entries()) {
    const input = (1 << index).toString(2).padStart(8, '0');
    const expected = (1 << (destination - 1)).toString(2).padStart(8, '0');
    assert.equal(simulate('transposition', input, key, 'encrypt').text, expected);
    assert.equal(simulate('transposition', expected, key, 'decrypt').text, input);
  }
});

test('transposition reverses every binary byte and independent blocks without deleting explicit padding', () => {
  const key = '4,8,1,5,7,2,6,3';
  for (let byte = 0; byte < 256; byte++) {
    const input = byte.toString(2).padStart(8, '0');
    const encrypted = simulate('transposition', input, key, 'encrypt').text;
    assert.equal(simulate('transposition', encrypted, key, 'decrypt').text, input);
    assert.equal([...encrypted].filter(bit => bit === '1').length, [...input].filter(bit => bit === '1').length);
  }
  const encrypted = simulate('transposition', 'ABCDEFGHCATXXXXX', key, 'encrypt');
  assert.equal(encrypted.text.slice(0, 8), 'GDBEHACF');
  assert.equal(simulate('transposition', encrypted.text, key, 'decrypt').text, 'ABCDEFGHCATXXXXX');
  assert.equal(encrypted.trace.length, 16);
});

test('transposition rejects malformed permutations, mixed symbols and incomplete blocks', () => {
  for (const key of ['', '1 1 2 3 4 5 6 7', '1 2 3', '0 1 2 3 4 5 6 7', '1 2 3 4 5 6 7 9', '1 2 3 4 5 6 7 8.0', '12345678']) {
    assert.throws(() => simulate('transposition', 'ABCDEFGH', key, 'encrypt'), /each destination 1–8 exactly once/);
  }
  for (const input of ['CAT', '12345678', 'ABCD0101', 'ABCDEFG!', '']) {
    assert.throws(() => simulate('transposition', input, '4 8 1 5 7 2 6 3', 'encrypt'), /complete 8-symbol blocks|A–Z letters or binary/);
  }
});

test("substitution decryption looks in the key row and Atbash is its own inverse", () => {
  const key = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const encrypted = simulate("mono", "HELLO", key, "encrypt");
  const decrypted = simulate("mono", encrypted.text, key, "decrypt");
  assert.equal(decrypted.text, "HELLO");
  assert.match(decrypted.solution.steps[2].text, /in the key row/);
  assert.equal(decrypted.solution.table.rows[0][3], "H");
  assert.equal(simulate("atbash", "HELLO", "", "encrypt").text, "SVOOL");
  assert.equal(simulate("atbash", "SVOOL", "", "decrypt").text, "HELLO");
});

test("rail fence shows counts, original positions, and reverse readout", () => {
  const encrypted = simulate("rail", "HELLOWORLD", "", "encrypt", { rails: 3 });
  assert.equal(encrypted.text, "HOLELWRDLO");
  const decrypted = simulate("rail", encrypted.text, "", "decrypt", {
    rails: 3,
  });
  assert.equal(decrypted.text, "HELLOWORLD");
  assert.deepEqual(plain(decrypted.solution.steps[2].table.rows), [
    [1, "1, 5, 9", "HOL"],
    [2, "2, 4, 6, 8, 10", "ELWRD"],
    [3, "3, 7", "LO"],
  ]);
  assert.match(decrypted.solution.steps[3].text, /not along whole rows/);
});

test("XOR explains bytes, preserves Unicode, and flags invalid UTF-8", () => {
  const encrypted = simulate("xor", "CAT", "V", "encrypt");
  assert.equal(encrypted.text, "15 17 02");
  assert.deepEqual(plain(encrypted.solution.table.rows[0]), [
    1,
    "43 / 67",
    "01000011",
    "01010110",
    "00010101",
    "15",
  ]);
  const unicode = simulate("xor", "Café 🔐", "🔑", "encrypt");
  assert.equal(
    unicode.solution.table.rows.length,
    new TextEncoder().encode("Café 🔐").length,
  );
  assert.equal(simulate("xor", unicode.text, "🔑", "decrypt").text, "Café 🔐");
  const invalid = simulate("xor", "FF", "A", "decrypt");
  assert.equal(invalid.validUtf8, false);
  assert.match(invalid.solution.steps.at(-1).text, /not valid UTF-8/);
});

test("RSA key derivation and repeated squaring agree with exact BigInt arithmetic", () => {
  const encrypted = simulate("rsa", "CAT", "", "encrypt", { p: 11, q: 13 });
  assert.deepEqual(plain(encrypted.parameters), {
    p: 11,
    q: 13,
    n: 143,
    phi: 120,
    e: 7,
    d: 103,
  });
  assert.equal(encrypted.text.split(" ")[0], String(3n ** 7n % 143n));
  assert.equal(
    encrypted.solution.steps[3].table.rows.at(-1)[3],
    "(27 × 81) mod 143 = 42",
  );
  const decrypted = simulate("rsa", encrypted.text, "", "decrypt", {
    p: 11,
    q: 13,
  });
  assert.equal(decrypted.text, "CAT");
  const expected = String(42n ** 103n % 143n);
  assert.match(
    decrypted.solution.steps[3].text,
    new RegExp("final residue is " + expected),
  );
  assert.match(
    encrypted.solution.steps[1].math,
    /3: gcd\(3, 120\) = 3 → reject/,
  );
});

test("all XOR bytes remain available after the first 32 displayed rows", () => {
  const result = simulate("xor", "A".repeat(80), "V", "encrypt");
  assert.equal(result.trace.length, 80);
  assert.equal(result.solution.table.rows.length, 80);
  const html = context.CipherLabSolutions.render(result.solution);
  assert.match(html, /remaining 48 calculations \(80 total\)/);
  assert.match(html, /<td>80<\/td>/);
});

test("rendered explanations escape user text and distinguish source material", () => {
  const result = simulate(
    "caesar",
    "<img src=x onerror=alert(1)>",
    "",
    "encrypt",
    { shift: 0 },
  );
  const html = context.CipherLabSolutions.render(result.solution);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.match(result.solution.source, /Unit III, PDF pp\. 106–107/);
  assert.match(
    simulate("rsa", "A", "", "encrypt").solution.source,
    /Unit V, PDF pp\. 133–136.*added practice/,
  );
});
