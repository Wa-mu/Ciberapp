const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname, '..', 'source', name), 'utf8');

function app({ saved = '{}', reducedMotion = false, animated = true, blockedStorage = false } = {}) {
  const nodes = new Map(), classes = new Set(), transitions = [], listeners = new Map();
  const document = {
    documentElement: {
      dataset: {},
      classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    },
    body: { dataset: {} },
    addEventListener: (name, listener) => listeners.set(name, listener),
    querySelectorAll: () => [],
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, {
        dataset: {}, style: {}, attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
      });
      return nodes.get(selector);
    },
  };
  if (animated) document.startViewTransition = update => {
    let resolveReady, rejectReady, resolveFinished;
    const transition = {
      ready: new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; }),
      finished: new Promise(resolve => { resolveFinished = resolve; }),
      skipTransition() { rejectReady(new Error('Transition skipped')); },
      update() { update(); resolveReady(); },
      finish: () => resolveFinished(),
    };
    transitions.push(transition);
    return transition;
  };
  const context = vm.createContext({
    document, TextEncoder, TextDecoder,
    matchMedia: () => ({ matches: reducedMotion }),
    localStorage: {
      getItem() { if (blockedStorage) throw Error('Storage unavailable'); return saved; },
      setItem(key, value) { if (blockedStorage) throw Error('Storage unavailable'); saved = value; },
    },
  });
  context.window = context;
  const read = code => vm.runInContext(code, context);
  read(source('index.html').match(/<script>([\s\S]*?)<\/script>/)[1]);
  const initialTheme = document.documentElement.dataset.theme;
  for (const name of ['reviewer.js', 'solutions.js', 'app.js']) read(source(name));
  return {
    document, nodes, classes, transitions, read, initialTheme,
    saved: () => JSON.parse(saved),
    click() {
      const button = { id: 'theme-toggle', dataset: {}, hasAttribute: () => false };
      listeners.get('click')({ target: { closest: () => button } });
    },
  };
}

function assertTheme(app, theme) {
  assert.equal(app.document.documentElement.dataset.theme, theme);
  assert.equal(app.document.body.dataset.theme, theme);
  assert.equal(app.read('progress.theme'), theme);
  assert.equal(app.nodes.get('meta[name="theme-color"]').content, theme === 'light' ? '#f4f7fb' : '#0c1220');
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  assert.equal(app.nodes.get('#theme-toggle').attributes['aria-label'], label);
  assert.equal(app.nodes.get('#theme-toggle').title, label);
}

test('saved appearance is applied before startup without animating or losing study progress', () => {
  const instance = app({ saved: JSON.stringify({ theme: 'light', xp: 65, completed: ['caesar'] }) });
  assert.equal(instance.initialTheme, 'light');
  assertTheme(instance, 'light');
  assert.equal(instance.transitions.length, 0);
  assert.equal(instance.classes.size, 0);
  instance.click();
  assert.equal(instance.saved().theme, 'dark');
  assert.equal(instance.saved().xp, 65);
  assert.deepEqual(instance.saved().completed, ['caesar']);
  instance.transitions[0].update();
  assertTheme(instance, 'dark');
});

test('rapid toggles keep the latest saved choice when delayed updates and cleanup finish', async () => {
  const instance = app();
  instance.click();
  instance.click();
  instance.click();
  assert.equal(instance.saved().theme, 'light');
  assert.equal(instance.transitions.length, 3);
  for (const transition of instance.transitions) transition.update();
  assertTheme(instance, 'light');
  assert.ok(instance.classes.has('theme-transitioning'));
  instance.transitions[0].finish();
  instance.transitions[1].finish();
  await Promise.resolve();
  assert.ok(instance.classes.has('theme-transitioning'));
  instance.transitions[2].finish();
  await Promise.resolve();
  assert.equal(instance.classes.size, 0);
  assertTheme(instance, 'light');
  const reloaded = app({ saved: JSON.stringify(instance.saved()) });
  assert.equal(reloaded.initialTheme, 'light');
  assertTheme(reloaded, 'light');
});

test('reduced motion and browsers without view transitions switch immediately in both directions', () => {
  for (const options of [{ reducedMotion: true }, { animated: false }]) {
    const instance = app(options);
    instance.click();
    assertTheme(instance, 'light');
    assert.equal(instance.saved().theme, 'light');
    instance.click();
    assertTheme(instance, 'dark');
    assert.equal(instance.saved().theme, 'dark');
    assert.equal(instance.transitions.length, 0);
    assert.equal(instance.classes.size, 0);
  }
});

test('malformed or unavailable browser storage still allows switching appearance', () => {
  for (const options of [{ saved: '{broken' }, { saved: 'null' }, { blockedStorage: true }]) {
    const instance = app({ ...options, animated: false });
    assert.equal(instance.initialTheme, 'dark');
    assertTheme(instance, 'dark');
    instance.click();
    assertTheme(instance, 'light');
  }
});
