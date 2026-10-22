/* Worked explanations shared by the simulator and practice missions. */
(function (global) {
  "use strict";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nl = String.fromCharCode(10);
  const letters = (value) =>
    String(value ?? "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
  const wrap = (value, modulus) => ((value % modulus) + modulus) % modulus;
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const preview = (value) =>
    String(value).length > 160
      ? String(value).slice(0, 160) + "… (preview)"
      : String(value);
  const sources = {
    caesar: 'Unit III, PDF pp. 106–107 · Substitution; MOM → PRP at shift +3',
    mono: 'Unit III, PDF pp. 106–107 · Substitution; supplied replacement alphabets are practice keys',
    transposition: 'Unit III, PDF p. 107 · Eight-position transposition key; binary positions numbered right to left',
    vernam: 'Unit III, PDF pp. 108–109 · Course Vernam, A=1 through Z=26',
    vigenere: 'Unit III, PDF p. 107 · Polyalphabetic classification; BONUS A=0 worked algorithm',
    xor: 'Unit III, PDF pp. 107–108 · CAT XOR repeated V; UTF-8 extension is added practice',
    atbash: 'Unit III, PDF p. 103 · Reversed alphabet in the history of cryptography',
    rail: 'BONUS · Additional transposition exercise outside the supplied PDF',
    rsa: 'Unit V, PDF pp. 133–136 · RSA arithmetic; tiny primes and letter mapping are added practice',
    playfair: 'BONUS · Playfair is outside the supplied PDF; rules checked against PBS NOVA’s The Playfair Cipher',
  };
  for (const kind of Object.keys(sources)) sources[kind] = global.CipherLabReviewer.filename + ' · ' + sources[kind];

  function build({ kind, input, key, mode, options = {}, result }) {
    const decrypt = mode === "decrypt";
    const inputLetters = letters(input),
      trace = result.trace || [];
    const solution = {
      source: sources[kind],
      operation: decrypt ? "Decryption" : "Encryption",
      steps: [],
      notes: [],
    };
    const step = (title, text, math, table) =>
      solution.steps.push({ title, text, math, table });
    const finish = () =>
      step(
        "Put the result together",
        `Read the output in order. ${decrypt ? "Recovered plaintext" : "Ciphertext"}: ${preview(result.text)}`,
      );
    const preserve =
      "Transform only A–Z letters. Keep spaces, punctuation, digits, and letter case in their original positions. Nonletters do not advance the key.";
    const normalize = `Keep A–Z letters and uppercase them: ${preview(inputLetters) || "(no letters)"}. This demonstration removes spaces, punctuation, and digits.`;

    if (["caesar", "vernam", "vigenere"].includes(kind)) {
      const oneBased = kind === "vernam",
        keyed = kind !== "caesar";
      const shift = wrap(Number(options.shift ?? 3) || 0, 26),
        pad = letters(key);
      solution.formula = oneBased
        ? decrypt
          ? "P = ((C − K − 1) mod 26) + 1"
          : "C = ((P + K − 1) mod 26) + 1"
        : decrypt
          ? `P = (C − ${keyed ? "K" : "k"}) mod 26`
          : `C = (P + ${keyed ? "K" : "k"}) mod 26`;
      solution.legend = `P = plaintext value; C = ciphertext value; ${keyed ? "K = paired key-letter value" : "k = shift"}. ${oneBased ? "Course Vernam: A=1, B=2, …, Z=26." : "Use A=0, B=1, …, Z=25."}`;
      step(
        "Prepare and number the letters",
        `${preserve} ${oneBased ? "The “−1, mod 26, +1” formula wraps into 1–26, so Z remains 26 rather than 0." : "A=0 means A contributes zero to the arithmetic."}`,
      );
      if (keyed) {
        const aligned = Array.from(
          inputLetters,
          (_, index) => pad[oneBased ? index : index % pad.length],
        ).join("");
        step(
          oneBased
            ? "Pair each letter with its own pad letter"
            : "Repeat and align the keyword",
          oneBased
            ? `The message and pad each contain ${inputLetters.length} letters. Use the corresponding pad position once; never repeat a shorter pad.`
            : `Repeat the ${pad.length}-letter keyword across all ${inputLetters.length} message letters. Restart at the beginning of the keyword whenever it ends.`,
          null,
          {
            caption: "Letter and key alignment (nonletters omitted)",
            columns: ["Sequence", "Letters"],
            rows: [
              [decrypt ? "Ciphertext" : "Plaintext", inputLetters],
              [oneBased ? "Pad" : "Repeated key", aligned],
            ],
          },
        );
      } else {
        step(
          "Choose the shift direction",
          `The shift is ${shift} after wrapping the supplied key into 0–25. ${decrypt ? "Subtract it to move backward" : "Add it to move forward"} through the alphabet.`,
        );
      }
      const workedRows = trace.map((row) => {
        const value = Number(row.p),
          keyValue = keyed
            ? alphabet.indexOf(row.key) + (oneBased ? 1 : 0)
            : shift;
        const raw = value + (decrypt ? -keyValue : keyValue),
          output = alphabet.indexOf(row.output) + (oneBased ? 1 : 0);
        return { row, value, keyValue, raw, output };
      });
      const first = workedRows[0];
      if (first) {
        const { row, value, keyValue, raw, output } = first;
        const wrapped = oneBased
          ? `((${raw} − 1) mod 26) + 1`
          : `${raw} mod 26`;
        step(
          `Work the first ${keyed ? "pair" : "letter"}: ${row.input}${keyed ? " and " + row.key : ""}`,
          `${row.input} has value ${value}. ${decrypt ? "Subtract" : "Add"} ${keyed ? `the key value ${row.key}=${keyValue}` : `the shift ${keyValue}`}, then wrap into ${oneBased ? "1–26" : "0–25"}. ${raw < (oneBased ? 1 : 0) ? "Add 26 repeatedly to a value below this range." : raw > (oneBased ? 26 : 25) ? "Subtract 26 repeatedly from a value above this range." : "This value already lies in the required range."}`,
          [
            `${value} ${decrypt ? "−" : "+"} ${keyValue} = ${raw}`,
            `${wrapped} = ${output} → ${row.output}`,
          ].join(nl),
        );
      }
      const wrappedRow = workedRows.find(({ raw, output }) => raw !== output);
      if (wrappedRow && wrappedRow !== first) {
        const { row, value, keyValue, raw, output } = wrappedRow;
        const correction = Math.abs(raw - output);
        step(
          `See why letter ${row.index} wraps around`,
          `${row.input}${keyed ? " paired with " + row.key : ""} produces ${raw}, which is outside ${oneBased ? "1–26" : "0–25"}. ${raw < output ? "Add" : "Subtract"} ${correction} (${correction / 26} full alphabet cycle) to reach ${output}, the value of ${row.output}.`,
          [
            `${value} ${decrypt ? "−" : "+"} ${keyValue} = ${raw}`,
            `${raw} ${raw < output ? "+" : "−"} ${correction} = ${output} → ${row.output}`,
          ].join(nl),
        );
      }
      solution.table = {
        caption: "Calculate each letter",
        columns: [
          "#",
          "Input value",
          keyed ? "Key value" : "Shift",
          "Arithmetic",
          "Wrapped value",
          "Output",
        ],
        rows: workedRows.map(({ row, value, keyValue, raw, output }) => [
          row.index,
          `${row.input} = ${value}`,
          keyed
            ? `${row.key} = ${keyValue}`
            : `${decrypt ? "−" : "+"}${keyValue}`,
          `${value} ${decrypt ? "−" : "+"} ${keyValue} = ${raw}`,
          `${raw} → ${output}`,
          `${row.output} = ${output}`,
        ]),
      };
      solution.notes.push(
        oneBased
          ? "Course wraparound: 27 → 1 (A), 26 → 26 (Z), 0 → 26 (Z), and −1 → 25 (Y). Do not substitute the A=0 Vigenère convention."
          : "“mod 26” wraps into 0–25: 26 → 0 (A), 27 → 1 (B), and −1 → 25 (Z). Add or subtract 26 until you are in range.",
      );
      if (oneBased)
        solution.notes.push(
          "A true one-time pad also needs uniformly random, independent, secret key material that is never reused. Matching the message length alone does not make an arbitrary pad secure.",
        );
      finish();
    }
    if (kind === "playfair") {
      solution.formula = decrypt
        ? "Same row: LEFT; same column: UP; rectangle: exchange columns"
        : "Same row: RIGHT; same column: DOWN; rectangle: exchange columns";
      solution.legend = "Use a 5×5 square with I/J combined. Coordinates below are (row, column), numbered 1–5.";
      step(
        "Build the keyword square",
        `Uppercase the keyword, merge J into I and remove repeated letters in order. Fill the remaining cells with unused letters A–Z, omitting J. Normalized keyword: ${preview(result.keyword)}.`,
      );
      solution.grid = {
        caption: "Playfair 5×5 key square (I also represents J)",
        columns: ["Row / column", 1, 2, 3, 4, 5],
        rows: result.grid.map((row, index) => [index + 1, ...row]),
      };
      const pairs = result.prepared.match(/../g) || [];
      step(
        decrypt ? "Read the ciphertext in pairs" : "Prepare the plaintext pairs",
        decrypt
          ? "Remove spaces and punctuation, then read consecutive pairs without inserting any letters. Ciphertext must have even length, use I rather than J, and contain different letters within each pair."
          : "Keep A–Z letters, uppercase them and replace J with I. Read two letters at a time. If they match, insert X after the first and reconsider the second. Pad an unpaired final letter. Use Q when a filler follows X, so no pair contains two identical letters.",
        `Normalized input: ${preview(result.normalized)}${nl}Pairs: ${preview(pairs.join(" "))}`,
      );
      if (result.fillers.length) {
        step(
          "Track the inserted fillers",
          `${result.fillers.length} filler letter(s) were inserted. Positions refer to the prepared plaintext, after earlier insertions. These letters will remain visible after decryption.`,
          null,
          {
            caption: "Inserted Playfair fillers",
            columns: ["Prepared position", "Filler", "Reason"],
            rows: result.fillers.map((item) => [item.position, item.letter, item.reason]),
          },
        );
      }
      step(
        "Apply the rule for each pair",
        `For letters in the same row, move ${decrypt ? "left" : "right"} one cell, wrapping at the edge. For letters in the same column, move ${decrypt ? "up" : "down"} one cell with wraparound. Otherwise use the other corners of the rectangle: keep each letter’s row and take its partner’s column.`,
      );
      const first = trace[0];
      if (first) step(
        `Work the first pair: ${first.input}`,
        `${first.positions}. Apply the ${first.rule.toLowerCase()} rule to obtain ${first.output}.`,
        `${first.input} → ${first.output}`,
      );
      solution.table = {
        caption: "Transform every Playfair pair",
        columns: ["Pair #", "Input pair", "Square positions", "Rule", "Output pair"],
        rows: trace.map((row) => [row.index, row.input, row.positions, row.rule, row.output]),
      };
      solution.notes.push(
        "Decryption returns prepared plaintext, including inserted X/Q fillers. Decide whether to remove them using the message context; genuine X or Q letters must not be deleted automatically.",
        "Spaces, punctuation, case and the original I/J distinction are not recoverable from this ciphertext. This X/Q filler convention must match between sender and receiver.",
      );
      finish();
    }
    if (kind === "mono" || kind === "atbash") {
      const mapping =
        kind === "atbash"
          ? Array.from(alphabet).reverse().join("")
          : letters(key);
      solution.formula =
        kind === "atbash"
          ? "output value = 25 − input value (A=0 … Z=25)"
          : decrypt
            ? "Find the letter in the key row → read the alphabet row"
            : "Find the letter in the alphabet row → read the key row";
      solution.legend =
        kind === "atbash"
          ? "Atbash mirrors the alphabet. The same operation encrypts and decrypts."
          : "Each key position replaces the alphabet letter directly above it.";
      step("Prepare the message", preserve);
      step(
        "Write the matching alphabets",
        kind === "atbash"
          ? "Place A–Z above Z–A. Each letter pairs with the letter the same distance from the opposite end."
          : "Use every alphabet letter exactly once in the replacement row, so each replacement has a unique inverse.",
        null,
        {
          caption: "Substitution mapping",
          columns: ["Row", "Alphabet"],
          rows: [
            ["Alphabet", alphabet],
            ["Key", mapping],
          ],
        },
      );
      const row = trace[0];
      if (row) {
        const position =
          kind === "atbash"
            ? alphabet.indexOf(row.input)
            : (decrypt ? mapping : alphabet).indexOf(row.input);
        step(
          `Look up ${row.input}`,
          kind === "atbash"
            ? `${row.input} is ${position} using A=0. Its mirror is position ${25 - position}, which is ${row.output}.`
            : `Find ${row.input} at position ${position + 1} in the ${decrypt ? "key" : "alphabet"} row. Read the same position in the ${decrypt ? "alphabet" : "key"} row to obtain ${row.output}.`,
          row.calc,
        );
      }
      solution.table = {
        caption: "Apply the mapping to every letter",
        columns: ["#", "Input", "Lookup", "Output"],
        rows: trace.map((row) => [row.index, row.input, row.calc, row.output]),
      };
      solution.notes.push(
        kind === "atbash"
          ? "Mirroring twice returns the original letter: A → Z → A. No extra key is needed."
          : "Decrypt with the inverse mapping. Looking up ciphertext in the alphabet row again would encrypt it a second time.",
      );
      finish();
    }
    if (kind === 'transposition' && result.method) {
      const { columns, rows, keyword, ranks, lengths, normalized } = result;
      const count = Array.from(normalized).length;
      solution.source = global.CipherLabReviewer.filename + ' · BONUS · Numeric and keyword columnar practice extends the transposition concept in Unit III, PDF p. 107; the PDF’s eight-position permutation is a separate method';
      solution.formula = decrypt
        ? 'Split ciphertext by column lengths in key order → fill columns → read rows.'
        : 'Write plaintext in rows → read columns top to bottom in key order.';
      solution.legend = `${columns} columns, ${rows} rows. ${keyword ? 'Rank keyword letters alphabetically; break ties by their original left-to-right order.' : 'Numeric columns are read in their original left-to-right order.'} No padding is added.`;
      step('Prepare the input', `${result.normalization} Normalized input: ${preview(normalized)}.`);
      step(keyword ? 'Rank the keyword' : 'Number the columns', keyword ? `Keyword: ${keyword}. Ranks: ${ranks.join(' ')}. Keep repeated letters; each column receives its own rank.` : `Use columns 1 through ${columns} in left-to-right order.`, null, {
        caption: 'Original column positions and read order', columns: ['Column', keyword ? 'Key letter' : 'Numeric label', 'Rank', 'Symbols'],
        rows: ranks.map((rank, index) => [index + 1, keyword ? keyword[index] : index + 1, rank, lengths[index]]),
      });
      if (decrypt) {
        step('Calculate unequal column lengths', `${count} = ${Math.floor(count / columns)} × ${columns} + ${count % columns}. Give each column ${Math.floor(count / columns)} symbols, then give one extra to the first ${count % columns} columns in the original grid. The extra symbols do not follow alphabetical rank.`, `Lengths left to right: ${lengths.join(', ')}`);
        step('Split ciphertext and fill columns', 'Consume chunks in increasing rank order using the length of the destination column. Place each chunk top to bottom. Empty columns consume no symbols.');
        step('Read the reconstructed rows', 'Read each row from left to right in the original column positions. Skip unoccupied final cells; keep every actual symbol.');
      } else {
        step('Place plaintext in rows', 'Fill the grid horizontally, left to right. Leave unused cells in the final row unoccupied.');
        step('Read columns by rank', `Visit original columns ${result.order.map(column => column + 1).join(' → ')}. Read each top to bottom, skipping unoccupied cells.`);
        step('Join the column contributions', result.trace.map(column => `${column.label} (column ${column.column}, rank ${column.rank}): ${preview(column.chunk) || '(empty)'}`).join(' | '));
      }
      let offset = 0;
      solution.table = {
        caption: decrypt ? 'Ciphertext chunks assigned in key order' : 'Column contributions to ciphertext',
        columns: ['Rank', 'Original column', keyword ? 'Key letter' : 'Label', 'Length', 'Ciphertext positions', 'Chunk'],
        rows: result.trace.map(column => {
          const start = offset + 1; offset += column.length;
          return [column.rank, column.column, column.label, column.length, column.length ? `${start}–${offset}` : '(none)', column.chunk || '(empty)'];
        }),
      };
      solution.grid = {
        caption: 'Original grid — dashes are unoccupied cells, not padding',
        columns: ranks.map((rank, index) => `${keyword ? keyword[index] : index + 1} (rank ${rank})`),
        rows: result.grid.map(row => row.map(symbol => symbol === null ? '—' : symbol)),
      };
      solution.notes.push(result.normalization, 'Substitution replaces symbols; transposition changes only their positions. Keep the same method and key when reversing the operation.');
      finish();
    }
    if (kind === 'transposition' && !result.method) {
      const permutation = result.permutation;
      solution.formula = decrypt ? 'For each encryption arrow source → destination, move destination → source.' : 'C[destination] = P[source] inside each 8-symbol block.';
      solution.legend = 'Position 1 is the rightmost symbol: label positions 8 7 6 5 4 3 2 1 from left to right. The key lists destinations for source positions 1 through 8.';
      step('Prepare complete blocks', 'Remove whitespace and uppercase letters. Use either A–Z letters or binary bits. Process each eight-symbol block independently. No padding is added automatically.');
      step('Read the position key', decrypt ? `Reverse every encryption arrow to recover the original block. For this key, 1→${permutation[0]} becomes ${permutation[0]}→1 when decrypting.` : 'Move the symbol at each source position to the destination specified by the key.', null, {
        caption: 'Position mapping — right-to-left numbering',
        columns: ['Encryption source', 'Encryption destination', 'This operation'],
        rows: permutation.map((destination,index)=>[index+1,destination,decrypt ? destination+' → '+(index+1) : (index+1)+' → '+destination]),
      });
      solution.table = {
        caption: 'Move every symbol', columns: ['Block', 'Symbol', 'Input position', 'Output position'],
        rows: trace.map(row=>[row.block,row.input,row.source,row.destination]),
      };
      solution.grid = {
        caption: 'Blocks read from left to right', columns: ['Block', 'Input: positions 8…1', 'Output: positions 8…1'],
        rows: result.blocks.map((block,index)=>[index+1,block.input,block.output]),
      };
      solution.notes.push('The PDF specifies right-to-left numbering for binary data. Letter practice explicitly uses that same convention. Spaces and original case are not restored.', 'Retain any padding supplied as part of the question; deleting X symbols could erase real data.');
      finish();
    }
    if (kind === "rail") {
      const grid = result.grid,
        rails = grid.length;
      const pattern = Array.from(
        { length: inputLetters.length },
        (_, position) => grid.findIndex((row) => row[position] !== "·") + 1,
      );
      const chunks = grid.map((row) =>
        row.filter((value) => value !== "·").join(""),
      );
      solution.formula = [
        "Encrypt: follow the zigzag → read each rail",
        "Decrypt: fill each rail → follow the zigzag",
      ].join(nl);
      solution.legend = `Use ${rails} rails. Move down one rail per letter, reverse at the bottom, and reverse again at the top.`;
      step("Prepare the letters", normalize);
      step(
        "Trace the zigzag positions",
        `The ${pattern.length > 24 ? "first 24 " : ""}rail visits are ${pattern.slice(0, 24).join(" → ")}${pattern.length > 24 ? " → …" : ""}. A full down-and-up cycle spans ${2 * (rails - 1)} positions. The path depends on the message length and rail count.`,
      );
      step(
        decrypt ? "Count and fill the rails" : "Place letters on their rails",
        decrypt
          ? "Count the path positions on each rail. Split the ciphertext into blocks of these lengths, then fill each rail left to right."
          : "Put each next message letter at the next zigzag position. Collect the occupied positions of each rail from left to right.",
        null,
        {
          caption: decrypt
            ? "Ciphertext blocks assigned to rails"
            : "Letters collected by rail",
          columns: ["Rail", "Positions in the message", "Letters"],
          rows: chunks.map((chunk, index) => [
            index + 1,
            pattern
              .flatMap((rail, position) =>
                rail === index + 1 ? [position + 1] : [],
              )
              .join(", ") || "(none)",
            chunk || "(empty)",
          ]),
        },
      );
      step(
        decrypt ? "Follow the path to recover the message" : "Join the rails",
        decrypt
          ? `Read occupied cells along the original down-and-up path, not along whole rows. Result: ${preview(result.text)}.`
          : `Read the top rail first, then each lower rail. Join ${chunks.filter(Boolean).map(preview).join(" | ")} to get ${preview(result.text)}.`,
      );
      solution.grid = {
        caption: "Zigzag layout — dots are unoccupied positions",
        columns: ["Rail", ...pattern.map((_, index) => index + 1)],
        rows: grid.map((row, index) => [index + 1, ...row]),
      };
      solution.notes.push(
        "Rail fence rearranges letters rather than replacing them. This demonstration removes spacing and punctuation, so those cannot be recovered during decryption.",
      );
    }
    if (kind === "xor") {
      const keyBytes = new TextEncoder().encode(key);
      const hex = (value) => value.toString(16).padStart(2, "0").toUpperCase();
      solution.formula = decrypt
        ? "plaintext byte = ciphertext byte ⊕ key byte"
        : "ciphertext byte = plaintext byte ⊕ key byte";
      solution.legend =
        "XOR compares corresponding bits: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. Different bits give 1; matching bits give 0.";
      step(
        decrypt
          ? "Read the hexadecimal ciphertext as bytes"
          : "Encode the message as UTF-8 bytes",
        decrypt
          ? `Each pair of hexadecimal digits represents one byte. Whitespace separates bytes for readability and is ignored. The input contains ${trace.length} bytes.`
          : `UTF-8 produces ${trace.length} bytes. ASCII letters use one byte each; other characters can use several bytes. This calculation processes bytes, not alphabet positions.`,
      );
      step(
        "Repeat and align the key bytes",
        `Encode the key as UTF-8: ${Array.from(keyBytes).map(hex).join(" ")} (hexadecimal). Repeat these ${keyBytes.length} bytes so each data byte has a partner.`,
      );
      const row = trace[0];
      if (row) {
        const value = parseInt(row.input, 2),
          keyValue = parseInt(row.key, 2),
          output = parseInt(row.output, 2);
        step(
          "XOR the first eight-bit pair",
          `The first data byte is ${hex(value)} hex (${value} decimal); its key byte is ${hex(keyValue)} hex (${keyValue} decimal). Compare each aligned pair of bits.`,
          [
            `Data  ${row.input}`,
            `Key   ${row.key}`,
            `XOR   ${row.output}`,
            `${row.output} binary = ${output} decimal = ${hex(output)} hex`,
          ].join(nl),
        );
      }
      step(
        decrypt
          ? "Decode the recovered bytes"
          : "Write two hexadecimal digits per result",
        decrypt
          ? `XOR with the same key reverses the operation because (P ⊕ K) ⊕ K = P. Decode the resulting byte sequence as UTF-8. ${result.validUtf8 === false ? "These bytes are not valid UTF-8; check the key and ciphertext." : `Recovered text: ${preview(result.text)}`}`
          : `Keep leading zeros so each result has two hexadecimal digits, then separate the bytes with spaces: ${preview(result.text)}.`,
      );
      solution.table = {
        caption: "Byte-by-byte XOR calculation",
        columns: [
          "Byte",
          "Data (hex / decimal)",
          "Data bits",
          "Key bits",
          "XOR result bits",
          "Result hex",
        ],
        rows: trace.map((row) => [
          row.index,
          `${hex(parseInt(row.input, 2))} / ${parseInt(row.input, 2)}`,
          row.input,
          row.key,
          row.output,
          hex(parseInt(row.output, 2)),
        ]),
      };
      solution.notes.push(
        "Use identical key bytes and alignment to decrypt. A wrong key may produce invalid UTF-8 or meaningless text. Repeating-key XOR is not a secure one-time pad.",
      );
    }
    if (kind === "rsa") {
      const { p, q, n, phi, e, d } = result.parameters;
      const exponent = decrypt ? d : e;
      solution.formula = decrypt ? "m = c^d mod n" : "c = m^e mod n";
      solution.legend =
        "m = message number (A=1 … Z=26); c = ciphertext number. Public key: (e, n). Private key: (d, n).";
      step(
        "Build the modulus and totient",
        "Choose two different primes. Their product is the modulus; the totient controls the exponent arithmetic.",
        [
          `n = p × q = ${p} × ${q} = ${n}`,
          `φ(n) = (p − 1)(q − 1) = ${p - 1} × ${q - 1} = ${phi}`,
        ].join(nl),
      );
      const candidates = [];
      for (let candidate = 3; candidate <= e; candidate += 2) {
        let a = candidate,
          b = phi;
        while (b) [a, b] = [b, a % b];
        candidates.push(
          `${candidate}: gcd(${candidate}, ${phi}) = ${a}${candidate === e ? " → choose e" : " → reject"}`,
        );
      }
      step(
        "Find public and private exponents",
        "Try odd public exponents starting at 3 and choose the first coprime to φ(n): their greatest common divisor must be 1. The private exponent d is the modular inverse of e; e × d leaves remainder 1 modulo φ(n).",
        [
          ...candidates,
          `d = ${d}; e × d = ${e} × ${d} = ${e * d}`,
          `${e * d} mod ${phi} = 1`,
        ].join(nl),
      );
      step(
        decrypt ? "Read the ciphertext blocks" : "Number the message letters",
        decrypt
          ? `Each space- or comma-separated integer is a ciphertext block below n=${n}. Decrypt each block with d=${d}.`
          : `${normalize} Map letters to 1–26 and encrypt each separately using e=${e}.`,
      );
      const first = trace[0];
      if (first) {
        const base = decrypt
          ? Number(first.input)
          : alphabet.indexOf(first.input) + 1;
        let power = 1,
          residue = base % n,
          remaining = exponent,
          accumulated = 1;
        const powers = [],
          rows = [];
        while (remaining > 0) {
          const used = remaining % 2 === 1,
            previous = accumulated;
          if (used) {
            accumulated = (accumulated * residue) % n;
            powers.push(power);
          }
          rows.push([
            power,
            residue,
            used ? "Yes" : "No",
            used
              ? `(${previous} × ${residue}) mod ${n} = ${accumulated}`
              : `Keep ${accumulated}`,
          ]);
          residue = (residue * residue) % n;
          power *= 2;
          remaining = Math.floor(remaining / 2);
        }
        step(
          "Work the first block with repeated squaring",
          `Compute ${base}^${exponent} mod ${n} without writing out the full power. Square each residue modulo n, then multiply only rows needed for the exponent. Here ${exponent} = ${powers.join(" + ")}. The final residue is ${accumulated}${decrypt ? `, which maps to ${first.output}` : ", the first ciphertext number"}.`,
          first.calc,
          {
            caption: "Repeated squaring for the first block",
            columns: [
              "Power of 2",
              `Base^power mod ${n}`,
              "Use this row?",
              "Running product mod n",
            ],
            rows,
          },
        );
      }
      solution.table = {
        caption: "Apply RSA to each block",
        columns: [
          "#",
          decrypt ? "Ciphertext number" : "Letter",
          "Exponent",
          "Modular power",
          decrypt ? "Recovered letter" : "Ciphertext number",
        ],
        rows: trace.map((row) => [
          row.index,
          row.input,
          exponent,
          row.calc,
          row.output,
        ]),
      };
      finish();
      solution.notes.push(
        "This unpadded, letter-by-letter toy uses tiny primes to explain the mathematics. It is not secure real-world RSA, and it cannot recover formatting removed before encryption.",
      );
    }
    return solution;
  }

  function tableHtml(table, rows = table.rows) {
    return `<div class="trace-wrap" tabindex="0" role="region" aria-label="${escape(table.caption)}"><table class="trace-table solution-table"><caption>${escape(table.caption)}</caption><thead><tr>${table.columns.map((column) => `<th scope="col">${escape(column)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function render(solution) {
    const steps = solution.steps
      .map(
        (step) =>
          `<li><h4>${escape(step.title)}</h4><p>${escape(step.text)}</p>${step.math ? `<pre class="solution-math">${escape(step.math)}</pre>` : ""}${step.table ? tableHtml(step.table) : ""}</li>`,
      )
      .join("");
    let calculations = "";
    if (solution.table?.rows.length) {
      calculations = tableHtml(
        solution.table,
        solution.table.rows.slice(0, 32),
      );
      if (solution.table.rows.length > 32)
        calculations += `<details class="solution-more"><summary>Show the remaining ${solution.table.rows.length - 32} calculations (${solution.table.rows.length} total)</summary>${tableHtml(solution.table, solution.table.rows.slice(32))}</details>`;
    }
    return `<div class="solution-guide"><div class="solution-rule"><span class="solution-label">${escape(solution.operation)} rule</span><pre class="solution-math">${escape(solution.formula)}</pre><p>${escape(solution.legend)}</p></div><ol class="solution-steps">${steps}</ol>${solution.grid ? tableHtml(solution.grid) : ""}${calculations}<div class="solution-notes">${solution.notes.map((note) => `<p>${escape(note)}</p>`).join("")}</div><p class="solution-source">${escape(solution.source)}. References use the supplied 162-page PDF’s page numbers.</p></div>`;
  }
  global.CipherLabSolutions = Object.freeze({ build, render });
})(window);
