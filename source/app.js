/* CipherLab — Self-contained study app, no external dependencies. */
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const E=(str)=>String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const onlyLetters=s=>String(s??'').toUpperCase().replace(/[^A-Z]/g,'');
const normalized=s=>String(s??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const mod=(a,n)=>((a%n)+n)%n;
const randomIndex=n=>{if(typeof crypto!=='undefined'&&crypto.getRandomValues){const t=new Uint32Array(1);crypto.getRandomValues(t);return t[0]%n;}return Math.floor(Math.random()*n)};
const pick=a=>a[randomIndex(a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomIndex(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const INITIAL={xp:0,completed:[],attempts:0,correct:0,exams:0,bestExam:0,flashMastered:[],achievements:[],theme:'dark',cardQuizSessions:0,cardQuizBest:0,cipherExamSessions:0,cipherExamBest:0};
const freshProgress=()=>({...INITIAL,completed:[],flashMastered:[],achievements:[]});
function restoreProgress(value){
 const restored=freshProgress();
 if(!value||typeof value!=='object'||Array.isArray(value))return restored;
 for(const key of ['xp','attempts','correct','exams','bestExam','cardQuizSessions','cardQuizBest','cipherExamSessions','cipherExamBest'])if(Number.isSafeInteger(value[key])&&value[key]>=0)restored[key]=value[key];
 restored.correct=Math.min(restored.correct,restored.attempts);
 restored.bestExam=Math.min(restored.bestExam,100);
 restored.cardQuizBest=Math.min(restored.cardQuizBest,100);
 restored.cipherExamBest=Math.min(restored.cipherExamBest,100);
 for(const key of ['completed','achievements'])if(Array.isArray(value[key]))restored[key]=[...new Set(value[key].filter(item=>typeof item==='string'))];
 if(Array.isArray(value.flashMastered))restored.flashMastered=[...new Set(value.flashMastered.filter(item=>Number.isInteger(item)&&item>=0))];
 restored.theme=value.theme==='light'?'light':'dark';
 return restored;
}
let progress=freshProgress();
try{progress=restoreProgress(JSON.parse(localStorage.getItem('cipherlab-progress-v1')||'{}'))}catch{}
const save=()=>{try{localStorage.setItem('cipherlab-progress-v1',JSON.stringify(progress))}catch{};renderTop()};
const earn=(xp)=>{progress.xp+=xp;save()};
const markResult=(ok)=>{progress.attempts++;if(ok)progress.correct++;save()};
const toast=message=>{let n=document.createElement('div');n.className='toast';n.textContent=message;$('#toast-container').append(n);setTimeout(()=>n.remove(),2900)};
const lessons=[
 ...CipherLabReviewer.lessons,
 {"id":"foundations","name":"Cryptography basics","topic":"cryptography","source":"CORE · Unit III, PDF pp. 101–106","level":"CORE","summary":"Cryptology includes cryptography and cryptanalysis. Encryption transforms plaintext into ciphertext using an algorithm and key; authorized decryption reverses it.","bullets":["Plaintext is readable input; ciphertext is encrypted output. A key is also called a cryptovariable.","Keyspace is the set of possible keys; work factor is the effort needed for cryptanalysis.","Bit-stream methods transform one bit at a time; block methods transform fixed-size groups.","Substitution replaces symbols; transposition rearranges their positions; XOR combines bits.","Steganography hides a message’s existence. Link encryption decrypts and re-encrypts at successive network hops."],"formula":"PLAINTEXT + ALGORITHM + KEY → CIPHERTEXT\nCIPHERTEXT + CORRECT KEY → PLAINTEXT","example":"The PDF encrypts MOM as PRP with a Caesar shift of +3.","trap":"Encoding is not secret-key encryption. Hashing is not reversible encryption."},
 {"id":"caesar","name":"Substitution & Caesar","topic":"cryptography","source":"CORE · Unit III, PDF pp. 106–107","level":"CORE","summary":"A substitution cipher exchanges one symbol for another. Caesar uses a constant alphabet shift and is monoalphabetic.","bullets":["One fixed mapping is monoalphabetic. Vigenère is the PDF’s example of polyalphabetic substitution.","Encrypt by shifting forward; decrypt by shifting backward.","This app uses A=0 through Z=25 to calculate Caesar shifts.","Wrap around the alphabet: X + 3 = A.","A full replacement alphabet must contain every A–Z letter once."],"formula":"C = (P + shift) mod 26\nP = (C − shift) mod 26","example":"PDF example: MOM → PRP at shift +3.","trap":"Replacing symbols is substitution. Moving unchanged symbols is transposition."},
 {id:'transposition',name:'Transposition cipher',topic:'cryptography',source:'CORE · Unit III, PDF p. 107 · Eight-position permutation; BONUS numeric and keyword columnar practice',level:'CORE',
  summary:'Transposition hides a message by rearranging its symbols. Substitution replaces symbols; transposition keeps their identities and changes their positions. The course teaches an eight-position permutation; columnar methods below are added practice.',
  bullets:[
   'Numeric column transposition: choose 1–64 columns, write the message horizontally in rows, then read whole columns from left to right.',
   'Keyword columnar transposition: use one column per keyword letter. Rank letters alphabetically starting at 1; equal letters receive successive ranks in their original left-to-right order. Do not delete repeated letters.',
   'Encrypt: uppercase A–Z letters, remove whitespace, keep punctuation and digits, and fill rows left to right. Read top to bottom down each column in rank order, joining the column chunks.',
   'Decrypt: for N symbols and C columns, each column has floor(N/C) symbols; the first N mod C columns in the original grid have one extra. Split ciphertext in rank order using those lengths, fill each column, then read rows left to right.',
   'No padding is added. Blank cells in the final row are unoccupied, not encrypted characters. A keyword may be longer than the message, leaving empty columns.',
   'Columnar normalization is displayed before and after running: original spacing and letter case cannot be recovered, but punctuation, digits and other symbols are retained.',
   'Course permutation: destinations for sources 1–8 are 4 8 1 5 7 2 6 3 (arrows 8→3, 7→6, 6→2, 5→7, 4→5, 3→1, 2→8, 1→4). Position 1 is at the right for binary data; letter exercises explicitly use the same numbering.',
   'The course method still requires complete eight-symbol blocks of A–Z letters or binary digits, with whitespace removed. Reverse every arrow to decrypt; retain any explicitly supplied padding.'
  ],
  formula:'KEYWORD: Z E B R A\nRANK:    5 3 2 4 1\n         H E L L O\n         W O R L D\nREAD: OD | LR | EO | LL | HW → ODLREOLLHW\n\nNUMERIC (3): CAT / DOG → CD | AO | TG → CDAOTG\n\nCOURSE POSITIONS: 8 7 6 5 4 3 2 1\nABCDEFGH → GDBEHACF',
  example:'ZEBRA: HELLOWORLD ↔ ODLREOLLHW. Uneven example: HELLOWORLDX ↔ ODLREOLLHWX; the leftmost Z column holds 3 symbols and the others hold 2. Numeric 3: CATDOG ↔ CDAOTG.',
  trap:'Do not read columns in keyword spelling order, drop repeated keyword letters, give extra symbols to the first alphabetically ranked columns, or insert/remove X padding. Columnar columns use left-to-right positions; the course block permutation uses right-to-left numbering.',
  exercises:[
   {question:'Encrypt CATDOG with 3 numeric columns.',answer:'CDAOTG: CD | AO | TG.'},
   {question:'Decrypt ODLREOLLHW with keyword ZEBRA.',answer:'HELLOWORLD. Fill A=OD, B=LR, E=EO, R=LL, Z=HW; read the two rows.'},
   {question:'Rank BALLOON, retaining repeated letters.',answer:'2 1 3 4 6 7 5. The first L precedes the second L, and the first O precedes the second O.'},
   {question:'Decrypt ODLREOLLHWX with ZEBRA. Which column is longer?',answer:'HELLOWORLDX. The leftmost Z column holds HWX (3 symbols); all other columns hold 2.'}
  ]},
 {"id":"xor","name":"XOR & stream methods","topic":"cryptography","source":"CORE · Unit III, PDF pp. 107–108 · CAT with repeated V","level":"CORE","summary":"Exclusive OR outputs 1 when its two input bits differ and 0 when they match. Applying the same key stream again reverses it.","bullets":["Truth table: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0.","The PDF combines ASCII CAT with repeated V (01010110).","CAT XOR V gives bytes 15 17 02 in hexadecimal.","The simulator also supports UTF-8 messages as added byte practice.","XOR is a building block. A repeating-byte XOR cipher alone does not securely protect sensitive data."],"formula":"C = P ⊕ K; P = C ⊕ K\n01000011 (C) ⊕ 01010110 (V) = 00010101","example":"CAT with repeated V → 15 17 02 (hex). XOR the bytes with V again to recover CAT.","trap":"XOR is not the same operation as adding letter values modulo 26."},
 {"id":"vernam","name":"Vernam / one-time pad","topic":"cryptography","source":"CORE · Unit III, PDF pp. 108–109 · Course A=1","level":"CORE","summary":"The course’s Vernam exercise adds pad values to plaintext letter positions numbered A=1 through Z=26, wrapping into 1–26.","bullets":["Add paired values to encrypt; subtract the pad to decrypt.","If a sum exceeds 26, subtract 26. If a decryption result is zero or negative, add 26.","The PDF uses SACK GAUL SPARE NO ONE and demonstrates S(19)+F(6)=Y(25) and K(11)+R(18)=29→C(3).","Use one pad letter per message letter; whitespace does not consume pad positions in this app.","A true one-time pad needs secret, uniformly random, full-length material that is never reused."],"formula":"C = ((P + K − 1) mod 26) + 1\nP = ((C − K − 1) mod 26) + 1","example":"PDF: K(11)+R(18)=29−26=3→C. Reverse: C(3)−R(18)=−15+26=11→K.","trap":"Do not substitute A=0 Vigenère values for the course’s A=1 Vernam rule."},
 {"id":"vigenere","name":"Vigenère cipher","topic":"cryptography","source":"CORE classification · Unit III, PDF p. 107 · BONUS worked A=0 algorithm","level":"BONUS","summary":"The PDF names Vigenère as a polyalphabetic substitution. Its full keyword calculations below are supplemental practice.","bullets":["The simulator uses A=0 through Z=25.","Repeat the keyword over A–Z letters only; spaces and punctuation do not consume a key position.","Encrypt by adding paired values modulo 26; decrypt by subtracting.","A repeated keyword selects different shifts by position.","A short repeated keyword is vulnerable to cryptanalysis."],"formula":"C = (P + K) mod 26\nP = (C − K) mod 26\nA=0, B=1, …, Z=25","example":"ATTACKATDAWN with LEMON → LXFOPVEFRNHR (added worked example).","trap":"The source establishes the classification; this A=0 worked convention is explicitly added."},
 {"id":"modern","name":"Symmetric & asymmetric","topic":"public-key","source":"CORE · Units III–V, PDF pp. 102, 115, 131–133","level":"CORE","summary":"Symmetric encryption uses a shared secret. Asymmetric systems use a mathematically related public/private pair.","bullets":["DES, IDEA, RC5 and AES are symmetric block ciphers studied in Unit IV.","RSA and ElGamal are public-key cryptosystems studied in Unit V.","For confidentiality, encrypt for a recipient with their public key; decrypt with their private key.","A signature is created with a signing key and checked with a verification key.","Systems can establish a session key with public-key techniques and use symmetric encryption for data."],"formula":"SYMMETRIC: shared secret\nASYMMETRIC: public key + private key","example":"A sender encrypts for the recipient’s public key; only the recipient’s private key should recover the message.","trap":"A public key need not be secret, but its identity must be authenticated."},
 {"id":"hashes","name":"Hash properties & digital signatures","topic":"symmetric","source":"CORE · Units III–V, PDF pp. 109–111, 124–128, 139–140","level":"CORE","summary":"A hash produces a fixed-length digest. A digital signature can authenticate a signed message and detect alteration without hiding it.","bullets":["Preimage resistance: hard to find an input for a given digest.","Second-preimage resistance: hard to find a different input matching a chosen message’s digest.","Collision resistance: hard to find any two distinct inputs with one digest.","A MAC uses a shared secret; digital signatures use private/public keys.","Signature verification depends on trusting the association between the public key and signer."],"formula":"MESSAGE → HASH → FIXED-LENGTH DIGEST\nPRIVATE KEY → SIGN\nPUBLIC KEY → VERIFY","example":"Changing a signed file invalidates verification against the original signature.","trap":"A plain unprotected hash does not prove who sent a message, and signatures do not automatically encrypt it."},
 {"id":"attacks","name":"Attacks & cryptanalysis","topic":"attacks","source":"CORE · Unit VII, PDF pp. 154–159","level":"CORE","summary":"Unit VII distinguishes passive observation from active manipulation and explains attacks against ciphertext, key exchange, credentials and implementation behavior.","bullets":["Passive attacks eavesdrop without changing data; active attacks modify, inject, delete or deny access.","Brute force tests candidate keys; frequency analysis examines symbol patterns.","Known-plaintext attacks use known message/ciphertext pairs; selected-plaintext attacks obtain encryption for selected messages.","Man-in-the-middle attacks substitute unauthenticated key exchanges. Validate the identity of public keys.","Correlation attacks seek statistical relationships; dictionary attacks test likely secrets; timing attacks analyze observed timing.","Replay resubmits previously captured authentication data; it does not require decrypting the data. Key management includes authorized recovery and protection against loss."],"formula":"PASSIVE: observe\nACTIVE: change / inject / disrupt\nAUTHENTICATE KEYS + PROTECT SECRETS + MANAGE RECOVERY","example":"An attacker replaces a public key during exchange and relays both parties’ encrypted messages: man-in-the-middle.","trap":"Strong encryption cannot fix unauthenticated keys, compromised endpoints or lost key material."},
 {id:'playfair',name:'Playfair cipher',topic:'cryptography',level:'BONUS',source:'BONUS · Playfair extension outside the supplied PDF; rules checked with PBS NOVA',
 summary:'Playfair substitutes pairs of letters using a 5×5 keyword square. This app combines I/J and uses a documented X/Q filler convention.',
 bullets:['Write the keyword without repeated letters, then add unused A–Z letters in order, omitting J.','Remove formatting, uppercase the plaintext and map J to I. Split into pairs; insert X between repeated pair letters and after an unpaired final letter. Use Q after X.','Same row: shift both letters right for encryption, left for decryption, wrapping at the edge.','Same column: shift both letters down for encryption, up for decryption, with wraparound.','Rectangle: keep each letter’s row and take the other letter’s column.','Decryption retains fillers: use context to distinguish inserted X/Q from genuine letters.'],
 formula:'5×5 KEY SQUARE · I/J COMBINED\nSAME ROW: right / left\nSAME COLUMN: down / up\nRECTANGLE: exchange columns',
 example:'Key PLAYFAIR EXAMPLE: HIDE THE GOLD IN THE TREE STUMP prepares as HI DE TH EG OL DI NT HE TR EX ES TU MP. Ciphertext: BMODZBXDNABEKUDMUIXMMOUVIF.',
 trap:'Do not automatically delete every X or Q after decrypting. Fillers and real message letters can look identical.'}
];
for(const lesson of lessons)if(!lesson.source.includes(CipherLabReviewer.filename))lesson.source=CipherLabReviewer.filename+' · '+lesson.source;
const flashcards=[
 ['What is plaintext?','The original unencrypted, readable message.'],['What is ciphertext?','The result of encrypting plaintext.'],['What is a cryptographic key?','The information (cryptovariable) that controls an encryption/decryption algorithm.'],['What is a substitution cipher?','A method that replaces symbols with other symbols.'],['What is a transposition cipher?','A method that rearranges symbols without changing their identities.'],['What makes a Caesar cipher monoalphabetic?','A fixed shift maps each plaintext letter to one corresponding ciphertext letter.'],['What is polyalphabetic substitution?','A substitution system that can use different letter mappings at different positions.'],['What does XOR output for 1 ⊕ 0?','1 — the input bits are different.'],['What is the special course convention for Vernam?','A=1 through Z=26, add the pad value and wrap modulo 26.'],['What is the common Vigenère convention?','A=0 through Z=25; repeat the keyword over letters only.'],['What are the one-time-pad conditions?','Uniformly random secret pad, as long as the message, and never reused.'],['What is cryptanalysis?','The study and analysis of ways to defeat or assess cryptographic protection.'],['Symmetric vs asymmetric?','Symmetric uses a shared secret key; asymmetric uses public/private keys.'],['Does hashing require a decryption key?','No. A cryptographic hash is a one-way digest, not reversible encryption.'],['What is the purpose of PKI?','To bind public keys to identities using certificates and trust relationships.'],['What does brute forcing Caesar mean?','Trying every possible shift to reveal the plaintext.'],['What is frequency analysis?','Examining the distribution of letter occurrences to help analyze a cipher.'],['What does a digital signature provide?','Verification of origin/authenticity and message integrity when securely implemented.'],
 ...CipherLabReviewer.flashcards,
 ['What does Playfair transform at each step?','A pair of letters (digraph) using a keyword-based 5×5 square; this is BONUS practice.'],
 ['How are I and J handled in this Playfair variant?','J is mapped to I, so the square contains 25 letters.'],
 ['What are the Playfair pair rules?','Same row: right to encrypt, left to decrypt. Same column: down to encrypt, up to decrypt. Rectangle: exchange columns.'],
 ['Should Playfair decryption automatically delete every X?','No. Decryption keeps X/Q fillers; message context is needed to distinguish them from genuine letters.'],
 ...CipherLabReviewer.extraFlashcards,
 ['BONUS: How does numeric column transposition encrypt CATDOG with 3 columns?','Write CAT / DOG, then read CD | AO | TG. Ciphertext: CDAOTG. No padding is added.'],
 ['BONUS: How is ZEBRA ranked for columnar transposition?','5 3 2 4 1. Read columns A, B, E, R, Z. HELLOWORLD encrypts to ODLREOLLHW.'],
 ['BONUS: How are repeated keyword letters ranked?','Keep every occurrence. Rank equal letters from left to right: BALLOON → 2 1 3 4 6 7 5.'],
 ['BONUS: Which unpadded columns are longer during columnar decryption?','For N symbols and C columns, start with floor(N/C) symbols per column. The first N mod C columns in the original grid get one extra; split ciphertext in key order using those lengths.']
];
progress.completed=progress.completed.filter(id=>lessons.some(lesson=>lesson.id===id));
progress.flashMastered=progress.flashMastered.filter(index=>index<flashcards.length);
function lettersWithTransform(str,fn){let i=0,trace=[];let text=Array.from(String(str)).map(ch=>{if(!/[a-z]/i.test(ch)||!/[A-Za-z]/.test(ch))return ch;let before=ch.toUpperCase(),v=fn(before,i);trace.push({index:i+1,input:before,...v});i++;return ch===ch.toLowerCase()?v.output.toLowerCase():v.output}).join('');return {text,trace,count:i}}
function shiftCipher(input,k,decrypt=false){if(!Number.isSafeInteger(Number(k)))throw Error('The alphabet shift must be a whole number.');let shift=mod(Number(k)||0,26)*(decrypt?-1:1);let r=lettersWithTransform(input,(letter,i)=>{let p=ALPHA.indexOf(letter),q=mod(p+shift,26);return {key:String(mod(shift,26)),p:String(p),calc:`(${p} ${shift>=0?'+':'−'} ${Math.abs(shift)}) mod 26 = ${q}`,output:ALPHA[q]}});return {...r,explain:'A=0 through Z=25. Move each letter forward for encryption or backward for decryption.',cols:['#','Input','Key','Calculation','Result']}}
function atbash(input){let r=lettersWithTransform(input,l=>{let p=ALPHA.indexOf(l),v=25-p;return {key:'mirror',p:String(p),calc:`25 − ${p} = ${v}`,output:ALPHA[v]}});return {...r,explain:'Atbash mirrors the alphabet (A↔Z, B↔Y). The same operation encrypts and decrypts.'}}
function monoCipher(input,alphabet,decrypt){alphabet=onlyLetters(alphabet);if(alphabet.length!==26||new Set(alphabet).size!==26)throw Error('Enter a 26-letter substitution alphabet with every letter used exactly once.');return {...lettersWithTransform(input,l=>{let p=decrypt?alphabet.indexOf(l):ALPHA.indexOf(l),out=decrypt?ALPHA[p]:alphabet[p];return{key:'mapping',p:String(p),calc:decrypt?`${l} → ${out} (inverse mapping)`:`${l} → ${out} (alphabet mapping)`,output:out}}),explain:'Custom monoalphabetic substitution. The 26-letter mapping replaces ABCDEFGHIJKLMNOPQRSTUVWXYZ in order.'}}
const TRANSPOSITION_KEY='4 8 1 5 7 2 6 3';
function transpositionCipher(input,key=TRANSPOSITION_KEY,decrypt=false){
 const tokens=String(key??'').trim().split(/[\s,]+/);
 if(tokens.length!==8||tokens.some(value=>!(/^[1-8]$/.test(value)))||new Set(tokens).size!==8)throw Error('The transposition key must contain each destination 1–8 exactly once, separated by spaces or commas.');
 const permutation=tokens.map(Number),str=String(input??'').toUpperCase().replace(/\s/g,'');
 if(!str||!(/^(?:[A-Z]+|[01]+)$/.test(str)))throw Error('Enter A–Z letters or binary digits (0 and 1), with optional spaces. Do not mix letters and bits.');
 if(str.length%8)throw Error(`Transposition requires complete 8-symbol blocks. You entered ${str.length} symbols; add ${8-str.length%8} symbols explicitly. No padding is added automatically.`);
 const blocks=[],trace=[];
 for(let offset=0;offset<str.length;offset+=8){
  const block=str.slice(offset,offset+8),out=Array(8);
  for(let source=1;source<=8;source++){
   const destination=permutation[source-1],from=decrypt?destination:source,to=decrypt?source:destination;
   out[8-to]=block[8-from];
   trace.push({block:offset/8+1,source:from,destination:to,input:block[8-from]});
  }
  blocks.push({input:block,output:out.join('')});
 }
 return {text:blocks.map(block=>block.output).join(''),permutation,blocks,trace,explain:'Unit III, PDF p. 107: rearrange positions inside each 8-symbol block. Position 1 is at the right; number right to left. Decryption reverses each arrow. Letter exercises use the same explicit numbering convention.'};
}
// Numeric and keyword columnar methods share the same unpadded grid model.
// Keep the course's eight-position permutation above available independently.
function columnarCipher(input,key,decrypt=false){
 const numeric=typeof key==='number'||/^\d+$/.test(String(key??'')),original=String(input??'');
 let keyword='',columns;
 if(numeric){
  columns=Number(key);
  if(!Number.isSafeInteger(columns)||columns<1||columns>64)throw Error('Choose a whole number of columns from 1 to 64.');
 }else{
  const raw=String(key??'');
  if(!/^[a-z]{1,64}$/i.test(raw))throw Error('Enter a keyword of 1–64 A–Z letters, without spaces, digits or punctuation. Repeated letters are allowed.');
  keyword=raw.toUpperCase();columns=keyword.length;
 }
 const normalized=original.replace(/[a-z]/g,letter=>letter.toUpperCase()).replace(/\s/gu,''),symbols=Array.from(normalized);
 if(!symbols.length)throw Error('Enter a message containing at least one non-whitespace character.');
 const order=Array.from({length:columns},(_,index)=>index);
 if(keyword)order.sort((a,b)=>keyword[a].charCodeAt(0)-keyword[b].charCodeAt(0)||a-b);
 const ranks=Array(columns);order.forEach((column,index)=>{ranks[column]=index+1});
 const rows=Math.ceil(symbols.length/columns),remainder=symbols.length%columns;
 const lengths=Array.from({length:columns},(_,column)=>Math.floor(symbols.length/columns)+(column<remainder?1:0));
 const grid=Array.from({length:rows},()=>Array(columns).fill(null)),placements=[];
 let offset=0;
 if(decrypt){
  for(const column of order)for(let row=0;row<lengths[column];row++){
   grid[row][column]=symbols[offset];placements.push({row,column,letter:symbols[offset++]});
  }
 }else{
  symbols.forEach((letter,index)=>{const row=Math.floor(index/columns),column=index%columns;grid[row][column]=letter;placements.push({row,column,letter})});
 }
 const chunks=Array.from({length:columns},(_,column)=>grid.map(row=>row[column]??'').join(''));
 const trace=order.map((column,index)=>({rank:index+1,column:column+1,label:keyword?keyword[column]:String(column+1),length:lengths[column],chunk:chunks[column]}));
 const text=decrypt?grid.map(row=>row.filter(letter=>letter!==null).join('')).join(''):order.map(column=>chunks[column]).join('');
 const removed=Array.from(original).filter(letter=>/\s/u.test(letter)).length;
 const normalization=`A–Z letters are uppercased; whitespace is removed (${removed} ${removed===1?'character':'characters'} removed). Punctuation, digits and other symbols are kept and transposed. No padding is added; removed spacing and original case cannot be recovered.`;
 return {text,original,normalized,keyword,method:numeric?'numeric':'keyword',decrypt,columns,rows,order,ranks,lengths,grid,chunks,trace,placements,normalization,explain:normalization};
}
function columnarSteps(result){
 const {decrypt,placements,columns,order,lengths,grid,ranks}=result,n=placements.length;
 const steps=[
  {phase:1,title:decrypt?'Start with the ciphertext':'Start with the plaintext',text:'Keep the original input and key below in view. The normalized message is the exact sequence used in the grid.',placed:0,completed:0},
  {phase:2,title:result.keyword?'Number the keyword alphabetically':'Number the columns from left to right',text:result.keyword?`Keyword ${result.keyword} has ranks ${ranks.join(' ')}. Read equal letters from left to right; keep every occurrence.`:`The ${columns} numeric columns have ranks ${ranks.join(' ')}.`,placed:0,completed:0}
 ];
 if(decrypt){
  steps.push({phase:3,title:'Calculate the column lengths',text:`${n} = ${Math.floor(n/columns)} × ${columns} + ${n%columns}. The first ${n%columns} columns in the original grid get one extra symbol. Lengths, left to right: ${lengths.join(', ')}.`,placed:0,completed:0});
  let placed=0;
  order.forEach((column,index)=>{
   steps.push({phase:4,title:`Assign ciphertext to column ${column+1} (rank ${index+1})`,text:`Take the next ${lengths[column]} ${lengths[column]===1?'symbol':'symbols'} for this column, filling top to bottom.${lengths[column]===0?' This column is empty; consume no ciphertext.':''}`,placed,active:column,completed:index});
   for(let row=0;row<lengths[column];row++){
    placed++;
    steps.push({phase:4,title:`Fill column ${column+1}, row ${row+1}`,text:`Place ciphertext symbol ${placed} of ${n} into the original grid.`,placed,active:column,completed:index,flash:true});
   }
  });
  grid.forEach((row,index)=>steps.push({phase:5,title:`Recover plaintext row ${index+1}`,text:`Read this row left to right: ${row.filter(letter=>letter!==null).join('')}. Skip unoccupied cells.`,placed:n,completed:columns,readRows:index+1,activeRow:index}));
 }else{
  placements.forEach(({row,column,letter},index)=>steps.push({phase:3,title:`Place symbol ${index+1} of ${n}`,text:`${letter} goes into row ${row+1}, column ${column+1}. Fill rows from left to right; leave unused final cells empty.`,placed:index+1,completed:0,flash:true}));
  order.forEach((column,index)=>{
   steps.push({phase:4,title:`Read column ${column+1} (rank ${index+1})`,text:`Read top to bottom: ${result.chunks[column]||'(empty column)'}. Only this column is active.`,placed:n,active:column,completed:index,outputChunks:index});
   steps.push({phase:5,title:`Append rank ${index+1} to the ciphertext`,text:`${result.chunks[column]||'(empty)'} contributes ${lengths[column]} ${lengths[column]===1?'symbol':'symbols'} to the output.`,placed:n,active:column,completed:index+1,outputChunks:index+1});
  });
 }
 steps.push({phase:6,title:decrypt?'Recovered plaintext':'Final ciphertext',text:'All columns are complete. The result contains exactly the normalized message’s symbols, rearranged without padding.',placed:n,completed:columns,outputChunks:columns,readRows:grid.length});
 return steps;
}
function columnarScene(result,frame){
 const shown=new Set(result.placements.slice(0,frame.placed).map(({row,column})=>row*result.columns+column));
 const latest=frame.flash?result.placements[frame.placed-1]:null;
 const columnClass=column=>frame.active===column?'is-active':result.ranks[column]<=frame.completed?'is-complete':'';
 const partial=result.decrypt?result.grid.slice(0,frame.readRows||0).map(row=>row.filter(letter=>letter!==null).join('')).join(''):result.order.slice(0,frame.outputChunks||0).map(column=>result.chunks[column]).join('');
 return `<div class="columnar-explanation" role="status" aria-live="polite" aria-atomic="true"><span class="pill">STEP ${frame.phase} / 6</span><h4>${E(frame.title)}</h4><p>${E(frame.text)}</p></div>
 <dl class="columnar-input"><div><dt>Original ${result.decrypt?'ciphertext':'plaintext'}</dt><dd>${E(result.original)}</dd></div><div><dt>${result.keyword?'Keyword':'Columns'}</dt><dd>${E(result.keyword||result.columns)}</dd></div><div><dt>Normalized input</dt><dd>${E(result.normalized)}</dd></div></dl>
 <div class="trace-wrap columnar-grid-wrap" tabindex="0" role="region" aria-label="Interactive transposition grid; scroll to see all columns"><table class="columnar-grid"><caption>${result.decrypt?'Reconstruct the original grid':'Fill rows, read ranked columns'} · ${result.rows} ${result.rows===1?'row':'rows'}, ${result.columns} ${result.columns===1?'column':'columns'}</caption><thead><tr>${result.ranks.map((rank,column)=>`<th scope="col" data-column="${column}" class="${columnClass(column)}"><span>${E(result.keyword?result.keyword[column]:column+1)}</span><small>${frame.phase>=2?'Rank '+rank:'Rank —'}${columnClass(column)==='is-complete'?' ✓':''}</small>${result.decrypt&&frame.phase>=3?`<small>${result.lengths[column]} symbols</small>`:''}</th>`).join('')}</tr></thead><tbody>${result.grid.map((row,rowIndex)=>`<tr ${frame.activeRow===rowIndex?'class="is-reading"':''}>${row.map((letter,column)=>{
  const visible=shown.has(rowIndex*result.columns+column),fresh=latest?.row===rowIndex&&latest.column===column;
  return `<td data-column="${column}" class="${columnClass(column)} ${letter===null?'is-empty':visible?'is-placed':'is-pending'} ${fresh?'is-new':''}" aria-label="Row ${rowIndex+1}, column ${column+1}: ${E(letter===null?'unoccupied; no padding':visible?letter:'awaiting placement')}">${letter===null?'—':visible?E(letter):'&nbsp;'}</td>`;
 }).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="smalltxt muted columnar-legend"><span>◉ Active column</span><span>✓ Completed column</span><span>— Unoccupied, no padding</span></p>
 <ol class="columnar-chunks" aria-label="Column contributions in key order">${result.trace.map((chunk,index)=>{
  const assigned=result.decrypt?frame.placed>=result.trace.slice(0,index+1).reduce((total,column)=>total+column.length,0)&&frame.phase>=4:(frame.outputChunks||0)>index;
  return `<li class="${columnClass(chunk.column-1)}"><span>${chunk.rank}. ${E(chunk.label)} (column ${chunk.column})</span><code>${assigned?E(chunk.chunk||'(empty)'):'…'}</code>${assigned?'<small>✓</small>':''}</li>`;
 }).join('')}</ol><div class="input-label">${frame.phase===6?(result.decrypt?'Recovered plaintext':'Final ciphertext'):(result.decrypt?'Plaintext recovered so far':'Ciphertext assembled so far')}</div><div class="output-box columnar-output ${partial?'':'muted'}">${E(partial||'Waiting for the reading steps…')}</div>`;
}
function columnarInteractive(result,index=0){
 const steps=columnarSteps(result),position=clamp(index,0,steps.length-1);
 return `<div class="columnar-visual"><p class="smalltxt muted">${E(result.normalization)}</p><div id="columnar-scene">${columnarScene(result,steps[position])}</div><div class="tool-row columnar-controls" role="group" aria-label="Transposition steps"><button class="btn secondary small" id="transposition-prev" ${position===0?'disabled':''}>← Previous Step</button><button class="btn small" id="transposition-next" ${position===steps.length-1?'disabled':''}>Next Step →</button><button class="btn ghost small" id="transposition-reset">Reset</button></div><p class="smalltxt muted" id="transposition-position">Frame ${position+1} of ${steps.length}</p></div><details class="solution-more"><summary>Full worked explanation</summary>${traceHtml(result)}</details>`;
}
function simulatorTrace(result){return result.method?columnarInteractive(result,S.transpositionStep):traceHtml(result)}
function moveTranspositionStep(delta){
 const result=S.simulation;if(!result?.method)return;
 const steps=columnarSteps(result);
 S.transpositionStep=delta===null?0:clamp(S.transpositionStep+delta,0,steps.length-1);
 // Preserve the grid nodes and scroll position so column colors can transition
 // smoothly and wide grids stay where the learner has scrolled them.
 const scene=$('#columnar-scene'),next=document.createElement('template');
 next.innerHTML=columnarScene(result,steps[S.transpositionStep]);
 const cells=$$('th,td',next.content);
 $$('th,td',scene).forEach((cell,index)=>{
  const replacement=cells[index];cell.className=replacement.className;
  if(cell.tagName==='TH'){if(cell.innerHTML!==replacement.innerHTML)cell.innerHTML=replacement.innerHTML}
  else{cell.textContent=replacement.textContent;cell.setAttribute('aria-label',replacement.getAttribute('aria-label'))}
 });
 const rows=$$('tbody tr',next.content);
 $$('tbody tr',scene).forEach((row,index)=>{row.className=rows[index].className});
 for(const selector of ['.columnar-explanation','.columnar-chunks','.columnar-output'])$(selector,scene).replaceWith($(selector,next.content));
 $('.input-label',scene).textContent=$('.input-label',next.content).textContent;
 $('#transposition-prev').disabled=S.transpositionStep===0;
 $('#transposition-next').disabled=S.transpositionStep===steps.length-1;
 $('#transposition-position').textContent=`Frame ${S.transpositionStep+1} of ${steps.length}`;
}
function railCipher(input,rails,decrypt){if(!Number.isInteger(Number(rails))||Number(rails)<2||Number(rails)>8)throw Error('Choose a whole number of rails from 2 to 8.');const str=onlyLetters(input),n=Number(rails);let pattern=[],r=0,dir=1;for(let i=0;i<str.length;i++){pattern.push(r);if(r===0)dir=1;else if(r===n-1)dir=-1;r+=dir}let grid=Array.from({length:n},()=>Array(str.length).fill('·'));
 if(!decrypt){let out=Array(n).fill('').map(()=>[]);for(let i=0;i<str.length;i++){out[pattern[i]].push(str[i]);grid[pattern[i]][i]=str[i]}return{text:out.flat().join(''),grid,explain:'BONUS: Write letters in a zigzag across the rails and read one rail at a time.'}}
 let p=0;for(let rail=0;rail<n;rail++)for(let i=0;i<str.length;i++)if(pattern[i]===rail)grid[rail][i]=str[p++];return{text:pattern.map((rail,i)=>grid[rail][i]).join(''),grid,explain:'BONUS: Fill each rail in ciphertext order, then follow the original zigzag path.'}}
function pairedLetters(input,key,kind,decrypt){const letters=onlyLetters(key),n=onlyLetters(input).length;if(!letters)throw Error('Enter a letter-only key.');if(kind==='vernam'&&letters.length!==n)throw Error(`Vernam pad must contain exactly ${n} letters. Your pad contains ${letters.length}.`);let r=lettersWithTransform(input,(letter,i)=>{let p=ALPHA.indexOf(letter)+(kind==='vernam'?1:0), k=ALPHA.indexOf(letters[kind==='vernam'?i:i%letters.length])+(kind==='vernam'?1:0),offset=kind==='vernam'?1:0;let q=mod(p+(decrypt?-k:k)-offset,26)+offset;return{key:ALPHA[k-offset],p:String(p),calc:`(${p} ${decrypt?'−':'+'} ${k}${offset?' − 1':''}) mod 26${offset?' + 1':''} = ${q}`,output:ALPHA[q-offset]}});return {...r,explain:kind==='vernam'?'Course-specific Vernam example: alphabet positions 1..26. The secret pad is used once; spaces are retained without using pad letters.':'BONUS worked Vigenère: alphabet positions 0..25. The keyword repeats over letters; spaces do not consume keyword positions.'}}
function xorCipher(input,key,decrypt){if(!key)throw Error('Enter an XOR key (one or more characters).');let bytes,enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});if(decrypt){let hex=String(input).replace(/\s/g,'');if(!hex||hex.length%2||!/^[0-9a-f]+$/i.test(hex))throw Error('XOR decryption requires even-length hexadecimal ciphertext, e.g. 151702.');bytes=Uint8Array.from(hex.match(/../g).map(v=>parseInt(v,16)));}else bytes=enc.encode(input);let keyb=enc.encode(key),out=bytes.map((v,i)=>v^keyb[i%keyb.length]);let result,validUtf8=true;if(decrypt){try{result=dec.decode(out)}catch{validUtf8=false;result='[Result is not valid UTF-8; verify the ciphertext and key.]'}}else result=Array.from(out).map(v=>v.toString(16).padStart(2,'0').toUpperCase()).join(' ');let trace=Array.from(bytes).map((v,i)=>({index:i+1,input:v.toString(2).padStart(8,'0'),key:keyb[i%keyb.length].toString(2).padStart(8,'0'),calc:`${v.toString(16).padStart(2,'0').toUpperCase()} ⊕ ${keyb[i%keyb.length].toString(16).padStart(2,'0').toUpperCase()}`,output:out[i].toString(2).padStart(8,'0')}));return{text:result,trace,validUtf8,explain:'ASCII/UTF-8 byte demonstration. XOR each data byte with a repeating key byte, then output encrypted bytes as hexadecimal. This is NOT safe standalone encryption.'}}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function inverse(a,m){for(let i=1;i<m;i++)if(mod(a*i,m)===1)return i;throw Error('Unable to find modular inverse.')}
function modpow(a,e,n){let result=1;a%=n;for(;e>0;e=Math.floor(e/2)){if(e%2)result=result*a%n;a=a*a%n}return result}
function rsaCipher(input,p,q,decrypt){p=Number(p);q=Number(q);let primes=[3,5,7,11,13,17,19,23,29,31];if(!primes.includes(p)||!primes.includes(q)||p===q||p*q<=26)throw Error('Choose two different prime numbers from the list, with p×q > 26.');let n=p*q,phi=(p-1)*(q-1),e=3;while(e<phi&&gcd(e,phi)!==1)e+=2;if(e>=phi)throw Error('Cannot choose an exponent.');let d=inverse(e,phi),trace=[],text='';if(!decrypt){let vals=onlyLetters(input).split('').map(l=>ALPHA.indexOf(l)+1),encrypted=vals.map((v,i)=>{let c=modpow(v,e,n);trace.push({index:i+1,input:ALPHA[v-1],key:String(e),calc:`${v}^${e} mod ${n} = ${c}`,output:String(c)});return c});text=encrypted.join(' ')}else{let vs=String(input).trim().split(/[\s,]+/).filter(Boolean);if(vs.some(v=>!/^[0-9]+$/.test(v)))throw Error('For RSA decryption, enter encrypted integers separated by spaces.');text=vs.map((v,i)=>{let c=Number(v);if(c>=n)throw Error(`Each RSA ciphertext number must be below n=${n}.`);let m=modpow(c,d,n);if(m<1||m>26)throw Error('A decoded number is not a letter (1..26). Check keys and ciphertext.');trace.push({index:i+1,input:String(c),key:String(d),calc:`${c}^${d} mod ${n} = ${m}`,output:ALPHA[m-1]});return ALPHA[m-1]}).join('')}return{text,trace,parameters:{p,q,n,phi,e,d},explain:`BONUS TOY RSA (not secure): p=${p}, q=${q}, n=p×q=${n}, φ(n)=${phi}, public e=${e}, private d=${d}, and (e×d) mod φ(n)=1. Encrypt A=1..Z=26 with c=m^e mod n; decrypt m=c^d mod n.`}}
function playfairCipher(input,key,decrypt=false){
 const keyword=onlyLetters(key).replace(/J/g,'I');
 if(!keyword)throw Error('Enter a Playfair keyword containing at least one A–Z letter.');
 const alphabet='ABCDEFGHIKLMNOPQRSTUVWXYZ';
 const square=[...new Set(keyword+alphabet)].join('');
 const grid=Array.from({length:5},(_,row)=>square.slice(row*5,row*5+5).split(''));
 const raw=onlyLetters(input),normalized=raw.replace(/J/g,'I');
 if(!normalized)throw Error('Enter a Playfair message containing A–Z letters.');
 if(decrypt&&raw.includes('J'))throw Error('Playfair ciphertext uses I instead of J in this 5×5 square.');
 if(decrypt&&normalized.length%2)throw Error('Playfair ciphertext must contain an even number of letters.');
 let prepared='',fillers=[];
 for(let i=0;i<normalized.length;){
  const a=normalized[i],b=normalized[i+1];
  if(decrypt){
   if(a===b)throw Error('Playfair ciphertext cannot contain an identical-letter pair. Check the ciphertext.');
   prepared+=a+b;i+=2;
  }else if(!b||a===b){
   const filler=a==='X'?'Q':'X';
   fillers.push({position:prepared.length+2,letter:filler,reason:b?'Split repeated letters':'Pad the final letter'});
   prepared+=a+filler;i++;
  }else{prepared+=a+b;i+=2}
 }
 const trace=[],direction=decrypt?-1:1;
 let text='';
 for(let i=0;i<prepared.length;i+=2){
  const a=prepared[i],b=prepared[i+1],pa=square.indexOf(a),pb=square.indexOf(b);
  const ra=Math.floor(pa/5),ca=pa%5,rb=Math.floor(pb/5),cb=pb%5;
  let output,rule;
  if(ra===rb){output=grid[ra][mod(ca+direction,5)]+grid[rb][mod(cb+direction,5)];rule='Same row'}
  else if(ca===cb){output=grid[mod(ra+direction,5)][ca]+grid[mod(rb+direction,5)][cb];rule='Same column'}
  else{output=grid[ra][cb]+grid[rb][ca];rule='Rectangle'}
  trace.push({index:i/2+1,input:a+b,positions:`${a}: (${ra+1}, ${ca+1}); ${b}: (${rb+1}, ${cb+1})`,rule,output});
  text+=output;
 }
 return{text,trace,grid,keyword,square,normalized,prepared,fillers,explain:'BONUS Playfair: use a keyword-based 5×5 square, merge J into I and transform pairs. Insert X fillers (Q after X). Decryption retains fillers.'};
}
function simulate(kind,input,key,mode,options={}){
 const decrypt=mode==='decrypt';
 let result;
 switch(kind){
  case'caesar':result=shiftCipher(input,options.shift??3,decrypt);break;
  case'atbash':result=atbash(input);break;
  case'mono':result=monoCipher(input,key,decrypt);break;
  case'playfair':result=playfairCipher(input,key,decrypt);break;
  case'transposition':
   if(options.method==='numeric'){
    if(!/^\d+$/.test(String(options.columns??key)))throw Error('Choose a whole number of columns from 1 to 64.');
    result=columnarCipher(input,Number(options.columns??key),decrypt);
   }else if(options.method==='keyword'){
    if(!/^[a-z]{1,64}$/i.test(String(key??'')))throw Error('Enter a keyword of 1–64 A–Z letters, without spaces, digits or punctuation. Repeated letters are allowed.');
    result=columnarCipher(input,key,decrypt);
   }else if(!options.method||options.method==='permutation')result=transpositionCipher(input,key??TRANSPOSITION_KEY,decrypt);
   else throw Error('Choose a valid transposition method.');
   break;
  case'rail':result=railCipher(input,options.rails??3,decrypt);break;
  case'vernam':result=pairedLetters(input,key,'vernam',decrypt);break;
  case'vigenere':result=pairedLetters(input,key,'vigenere',decrypt);break;
  case'xor':result=xorCipher(input,key,decrypt);break;
  case'rsa':result=rsaCipher(input,options.p??7,options.q??13,decrypt);break;
  default:throw Error('Unknown cipher.');
 }
 return {...result,solution:CipherLabSolutions.build({kind,input,key,mode,options,result})};
}
const types=[{id:'caesar',name:'Caesar shift',tag:'CORE',sub:'Fixed-shift monoalphabetic substitution.'},{id:'mono',name:'Substitution alphabet',tag:'CORE',sub:'One-to-one letter substitution.'},{id:'transposition',name:'Transposition cipher',tag:'CORE',sub:'Numeric and keyword columnar methods, plus the course’s eight-position permutation.'},{id:'vernam',name:'Vernam (A=1)',tag:'CORE',sub:'Exact A=1 convention from the module.'},{id:'vigenere',name:'Vigenère (A=0)',tag:'BONUS',sub:'Polyalphabetic keyword method.'},{id:'playfair',name:'Playfair',tag:'BONUS',sub:'Encrypt letter pairs with a keyword-based 5×5 square.'},{id:'xor',name:'XOR bytes',tag:'CORE',sub:'See bits and XOR operations.'},{id:'rail',name:'Rail fence',tag:'BONUS',sub:'Zigzag transposition extension.'},{id:'atbash',name:'Atbash',tag:'CORE',sub:'Reversed alphabet described in the PDF’s history.'},{id:'rsa',name:'Toy RSA',tag:'BONUS',sub:'Public/private math with small primes.'}];
const defaults={caesar:{text:'HELLO WORLD',key:'',shift:3},mono:{text:'HELLO WORLD',key:'QWERTYUIOPASDFGHJKLZXCVBNM'},transposition:{text:'HELLOWORLD',key:TRANSPOSITION_KEY,keyword:'ZEBRA',columns:3,method:'keyword'},vernam:{text:'CAT',key:'DOG'},vigenere:{text:'ATTACKATDAWN',key:'LEMON'},playfair:{text:'HIDE THE GOLD IN THE TREE STUMP',key:'PLAYFAIR EXAMPLE'},xor:{text:'CAT',key:'V'},rail:{text:'WEAREDISCOVERED',rails:3},atbash:{text:'HELLO'},rsa:{text:'J',p:7,q:13}};
const cipherGuides={
 caesar:{
  summary:'Imagine the alphabet as a wheel. A Caesar cipher moves every letter the same number of places around that wheel. With a shift of 3, A becomes D and B becomes E.',
  key:'The shift is the number of places to move. This app offers 0–25; a shift of 0 leaves the message unchanged.',
  encrypt:['Write A=0, B=1, …, Z=25. Convert each message letter to its number.','Add the shift. If the result is 26 or more, subtract 26 to wrap back to the beginning of the alphabet.','Convert the result to a letter. Keep spaces, punctuation and letter case as they were.'],
  decrypt:'Subtract the same shift instead of adding it. If the result is negative, add 26. For example, decrypting A with shift 3 gives 0 − 3 = −3; adding 26 gives 23, or X.',
  mistake:'Use the same shift in both directions. Decryption moves backward through the alphabet, and wraparound works at both ends.'
 },
 mono:{
  summary:'A substitution alphabet is a lookup table. Each normal alphabet letter has one replacement letter, and that replacement stays the same throughout the message.',
  key:'Enter all 26 letters exactly once, in the order you want them to replace A through Z. For the example key, A maps to Q, B maps to W and C maps to E.',
  encrypt:['Write the normal alphabet A–Z on one row and the 26-letter key directly underneath it.','Find a message letter in the normal alphabet row. Replace it with the key letter in the same column.','Repeat for every letter. This app keeps spaces, punctuation and letter case.'],
  decrypt:'Find each ciphertext letter in the key row, then read the normal alphabet letter above it. This reverses the lookup: with the example key, Q decrypts to A.',
  mistake:'Every key letter must be unique. To decrypt, search the key row first; searching the normal alphabet row applies encryption again.'
 },
 transposition:{
  summary:'Transposition changes symbol positions while substitution changes the symbols themselves. Choose numeric columns or keyword-based columnar transposition for added practice, or keep the PDF’s eight-position block permutation.',
  key:'Numeric: choose 1–64 columns and read them from left to right. Keyword: use 1–64 A–Z letters; rank them alphabetically, with ties ranked from left to right. ZEBRA has ranks 5 3 2 4 1; BALLOON has 2 1 3 4 6 7 5. Course permutation: destinations 4 8 1 5 7 2 6 3 for sources 1–8, numbered right to left.',
  encrypt:['Columnar: uppercase A–Z letters and remove whitespace; keep punctuation, digits and other symbols. Write the normalized message horizontally, one row at a time. Add no padding.','Read each column top to bottom in rank order. ZEBRA with HELLOWORLD gives A=OD, B=LR, E=EO, R=LL, Z=HW → ODLREOLLHW. Numeric 3 with CATDOG gives CD | AO | TG → CDAOTG.','For the course permutation, use complete 8-symbol blocks of A–Z letters or binary digits. Position 1 is at the right. Move each source symbol to its destination; ABCDEFGH becomes GDBEHACF.'],
  decrypt:'Columnar: let N be the symbol count and C the number of columns. Give every column floor(N/C) symbols; the first N mod C original columns get one extra. Split the ciphertext in rank order using those lengths, fill columns top to bottom, then read rows left to right. ODLREOLLHW with ZEBRA returns HELLOWORLD; ODLREOLLHWX returns HELLOWORLDX. Course permutation: reverse every arrow with the same right-to-left numbering.',
  mistake:'Keep repeated keyword letters, assign longer columns by their original positions, and keep every real symbol. No automatic padding is used. Whitespace and original case cannot be restored. The course permutation and columnar methods use different keys.'
 },
 vernam:{
  summary:'The course’s Vernam exercise pairs each message letter with one pad letter and adds their alphabet values. Each position gets its own pad letter, rather than repeating a short keyword.',
  key:'Use a pad with exactly as many A–Z letters as the message has letters. This course convention uses A=1, B=2, …, Z=26. Spaces and punctuation do not use a pad position.',
  encrypt:['Number the message and pad letters from 1 to 26. Line them up one letter at a time.','Add each pair of numbers. If the sum is greater than 26, subtract 26. For example, T(20) + G(7) = 27, which wraps to 1, or A.','Convert the values back to letters. Keep the message’s spaces, punctuation and letter case.'],
  decrypt:'Subtract each pad value from the matching ciphertext value. If the result is 0 or negative, add 26 to bring it into 1–26. For GPA with pad DOG: 7 − 4 = 3 → C; 16 − 15 = 1 → A; 1 − 7 = −6, then +26 = 20 → T.',
  mistake:'Do not use Vigenère’s A=0 values here. A true one-time pad also needs a uniformly random, secret pad that is never reused; matching the pad length alone is not enough.'
 },
 vigenere:{
  summary:'Vigenère is like a Caesar cipher whose shift changes with each letter. A keyword supplies those shifts, and starts over whenever it reaches the end.',
  key:'Use a keyword made of letters. Here A=0, B=1, …, Z=25, so key letter A shifts by 0, B by 1, and so on. The keyword repeats over message letters only.',
  encrypt:['Repeat the keyword until it lines up with every message letter. Skip spaces and punctuation when lining up the key.','Convert each message letter and its key letter to A=0 values, then add them. Wrap values of 26 or more back into 0–25.','Turn each result into a letter. Preserve the original spaces, punctuation and letter case.'],
  decrypt:'Repeat the same keyword over the ciphertext letters and subtract each key value. Add 26 if the result is negative. For the first example letter, L(11) − L(11) = 0 → A.',
  mistake:'Vigenère uses A=0 in this app; course Vernam uses A=1. Do not advance the keyword at a space, and do not treat a repeated keyword as a one-time pad.'
 },
 playfair:{
  summary:'Playfair encrypts two letters at a time. A keyword builds a 5×5 letter square, and the positions of each pair tell you how to replace it.',
  key:'Remove repeated keyword letters, map J to I, then add unused alphabet letters in order, omitting J. Place the resulting 25 letters into a 5×5 square.',
  encrypt:['Uppercase the message, keep letters only and map J to I. Split it into pairs. If a pair would repeat a letter, insert X after the first letter and pair the second letter again. Also pad an unpaired final letter. Use Q instead of X after X.','Find both letters in the square. In the same row, move each letter one cell right; in the same column, move each one cell down. Wrap at the edges.','If the pair makes opposite corners of a rectangle, keep each letter’s row and take the other letter’s column. Join the transformed pairs.'],
  decrypt:'Use the same square and read the ciphertext in pairs. Move left for a same-row pair and up for a same-column pair. The rectangle rule stays the same. This app keeps inserted X/Q fillers in the recovered text.',
  mistake:'Do not delete every X or Q after decrypting: some may be genuine letters. Playfair also loses the original spacing, case and distinction between I and J.'
 },
 xor:{
  summary:'XOR compares two bits: matching bits produce 0, and different bits produce 1. The app applies this rule to every bit in a message byte and its matching key byte.',
  key:'Enter one or more characters. The app encodes the message and key as UTF-8 bytes, repeating the key bytes to cover the message. A Unicode character can occupy more than one byte.',
  encrypt:['Encode the message and key as bytes, then align one key byte with each message byte. Repeat the key bytes as needed.','XOR corresponding bits: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. For C and V, 01000011 ⊕ 01010110 = 00010101.','Write each encrypted byte as two hexadecimal digits. The app separates bytes with spaces, so that first result is 15.'],
  decrypt:'Enter the hexadecimal ciphertext and use exactly the same key. XOR each encrypted byte with its key byte again, then decode the recovered bytes as UTF-8. XOR reverses itself because (P ⊕ K) ⊕ K = P.',
  mistake:'15 in the example is hexadecimal, not decimal 15. Decryption needs complete two-digit hex bytes. A wrong key may produce unreadable text, and repeating-key XOR is only an educational demonstration.'
 },
 rail:{
  summary:'Rail fence rearranges letters by writing them in a zigzag over several rows, called rails. Reading one rail at a time hides the original reading order.',
  key:'The key is the number of rails (2–8 in this app). The zigzag starts on the top rail, travels downward, then reverses direction at the bottom and top.',
  encrypt:['Uppercase the message and keep only A–Z letters.','Place one letter at each point of the zigzag. With 3 rails, the row pattern is 1, 2, 3, 2, 1, 2, 3, … .','Read the top rail from left to right, followed by each lower rail. Join those rail blocks to form the ciphertext.'],
  decrypt:'Draw the empty zigzag for the ciphertext’s length and count the positions on each rail. Fill the top rail from the ciphertext, then the next rail, and so on. Follow the zigzag path to read the recovered message.',
  mistake:'For decryption, fill whole rails first, then read along the zigzag. The letters themselves never change, and spaces and punctuation are removed.'
 },
 atbash:{
  summary:'Atbash mirrors the alphabet: the first letter swaps with the last, the second with the second-last, and so on. A pairs with Z, B with Y and C with X.',
  key:'No key is needed. The reversed alphabet is always the same.',
  encrypt:['Write A–Z on one row and Z–A directly underneath it.','Find each message letter in the first row and replace it with the letter directly below it.','Leave spaces, punctuation and letter case as they were. For example, H becomes S and E becomes V.'],
  decrypt:'Apply exactly the same mirrored lookup again. Since each pair swaps in both directions, S becomes H and V becomes E. Encrypting twice recovers the original text.',
  mistake:'Atbash does not reverse the order of the message. It replaces each letter in its existing position, so HELLO becomes SVOOL.'
 },
 rsa:{
  summary:'RSA uses a public key to encrypt and a related private key to decrypt. This tiny demonstration turns each letter into a number so you can follow the arithmetic by hand.',
  key:'Choose two different primes p and q with p×q greater than 26. The app derives n=p×q and φ(n)=(p−1)(q−1), chooses the first odd e starting at 3 that is coprime to φ(n), then finds d so that e×d mod φ(n)=1. The public key is (e,n); the private key is (d,n).',
  encrypt:['Keep A–Z letters, uppercase them and number them A=1, …, Z=26. Each letter is a separate message number m.','Use the public key: compute c=m^e mod n. “Mod n” means keep the remainder after division by n.','Write the ciphertext numbers separated by spaces. With the PDF’s p=7 and q=13, the app gets n=91, e=5 and d=29. Its numerical message 10 (J in the app) becomes 10^5 mod 91 = 82.'],
  decrypt:'Keep the same primes so the app derives the same key pair. For each ciphertext number c, compute m=c^d mod n, then turn the result from 1–26 into a letter. In the PDF example, 82^29 mod 91 = 10 → J using the app’s letter mapping.',
  mistake:'Encryption uses e; decryption uses d. This unpadded, letter-by-letter example with tiny primes explains RSA mathematics and is not secure real-world RSA.'
 }
};
function openCipherExplanation(){
 const type=types.find(item=>item.id===S.cipher),guide=cipherGuides[S.cipher],example=S.cipher==='transposition'?transpositionExample(S.simStore.transposition.method||'permutation'):defaults[S.cipher];
 const tag=S.cipher==='transposition'&&example.method!=='permutation'?'BONUS':type.tag;
 const result=simulate(S.cipher,example.text,simulatorKey(example), 'encrypt',example);
 const setting=S.cipher==='caesar'?`Shift ${example.shift}`:S.cipher==='transposition'?(example.method==='keyword'?`Keyword ${example.keyword}`:example.method==='numeric'?`${example.columns} columns`:`Destinations for sources 1–8: ${example.key}; number right to left`):S.cipher==='rail'?`${example.rails} rails`:S.cipher==='rsa'?`p = ${example.p}, q = ${example.q}`:example.key||'No key needed';
 $('#cipher-explanation-title').textContent=`${type.name} explained`;
 const content=$('#cipher-explanation-content');
 content.innerHTML=`<span class="pill ${tag==='CORE'?'core':'bonus'}">${E(tag)}</span><p id="cipher-explanation-summary">${E(guide.summary)}</p><section><h3>What the key does</h3><p>${E(guide.key)}</p></section><section><h3>How to encrypt</h3><ol class="cipher-explanation-steps">${guide.encrypt.map(step=>`<li>${E(step)}</li>`).join('')}</ol></section><section><h3>How to decrypt</h3><p>${E(guide.decrypt)}</p></section><section class="cipher-explanation-example"><h3>Worked example</h3><dl><div><dt>Plaintext</dt><dd>${E(example.text)}</dd></div><div><dt>Key / setting</dt><dd>${E(setting)}</dd></div><div><dt>Ciphertext</dt><dd>${E(result.text)}</dd></div></dl><details class="cipher-explanation-calculations"><summary>Show example step by step</summary>${traceHtml(result)}</details></section><div class="notice amber"><b>Common mistake: </b>${E(guide.mistake)}</div>`;
 $('#cipher-explanation').showModal();
 content.scrollTop=0;
}
const Q=[
 {q:'Which word describes the message before encryption?',a:['Ciphertext','Plaintext','Keyspace','Digest'],c:1,exp:'Plaintext is the original readable message.',tag:'CORE'},
 {q:'The action of recovering plaintext from ciphertext using the correct key is...',a:['Hashing','Decryption','Steganography','Transposition'],c:1,exp:'Decryption reverses an encryption operation.',tag:'CORE'},
 {q:'A substitution cipher primarily...',a:['Reorders letters','Changes letters to other symbols','Compresses all data','Removes the key'],c:1,exp:'Substitution replaces symbols; transposition rearranges them.',tag:'CORE'},
 {q:'A pure transposition cipher primarily...',a:['Reorders symbols','Replaces each letter with another','Hashes the message','Generates a key pair'],c:0,exp:'Transposition changes positions, not letter identities.',tag:'CORE'},
 {q:'Caesar shift +3 encrypts HELLO as...',a:['EBIIL','KHOOR','HELLO','LXFOP'],c:1,exp:'H→K, E→H, L→O, L→O, O→R: HELLO→KHOOR. The PDF demonstrates the same +3 rule with MOM→PRP.',tag:'CORE'},
 {q:'What is the result of Caesar shift +3 for XYZ?',a:['ABC','CBA','UVW','YZA'],c:0,exp:'X→A, Y→B and Z→C with wraparound.',tag:'CORE'},
 {q:'Which type describes the Caesar cipher?',a:['Polyalphabetic','Monoalphabetic','Asymmetric','Hash function'],c:1,exp:'With one shift, each letter always has the same replacement.',tag:'CORE'},
 {q:'Which type describes the Vigenère cipher?',a:['Pure transposition','Polyalphabetic substitution','Digital signature','Hash function'],c:1,exp:'Vigenère changes its substitution shift according to the repeating keyword.',tag:'CORE'},
 {q:'In the module’s Vernam letter arithmetic, the value for A is...',a:['0','1','2','26 only for decryption'],c:1,exp:'The provided instructional module uses A=1 through Z=26 for its Vernam example.',tag:'CORE'},
 {q:'Using course Vernam A=1, what is CAT + DOG?',a:['GPA','F O Z','F O A','GOB'],c:0,exp:'C(3)+D(4)=G(7), A(1)+O(15)=P(16), T(20)+G(7)=27→A.',tag:'CORE'},
 {q:'For the app’s Vigenère method, which is the standard classroom value of A?',a:['1','0','25','26'],c:1,exp:'Standard Vigenère worksheets usually use A=0; this is different from the source’s Vernam A=1 calculation.',tag:'BONUS'},
 {q:'Which XOR statement is TRUE?',a:['1⊕1=1','0⊕0=1','1⊕0=1','0⊕1=0'],c:2,exp:'XOR outputs 1 when the inputs differ.',tag:'CORE'},
 {q:'Which operation reverses simple XOR encryption?',a:['XOR with the same key again','Square the ciphertext','Convert to decimal only','Delete the key'],c:0,exp:'(P⊕K)⊕K = P.',tag:'CORE'},
 {q:'What is an essential condition for a true one-time pad?',a:['Reuse the same pad','Use a short password repeatedly','Pad is secret, random, message-length, never reused','Publish pad to verify it'],c:2,exp:'Perfect secrecy requires a fresh uniformly random pad kept secret and never reused.',tag:'CORE'},
 {q:'A cipher’s keyspace is...',a:['Physical memory','The set of possible keys','The length of plaintext only','A certificate store'],c:1,exp:'Keyspace is the collection of all possible keys.',tag:'CORE'},
 {q:'A brute-force attack on a Caesar cipher can try...',a:['26 shift settings','One billion passwords necessarily','Only the first letter','No possible keys'],c:0,exp:'The Caesar cipher has 26 shifts (including the identity shift).',tag:'BONUS'},
 {q:'Compared with transposition, what characteristic does substitution change?',a:['Character identity','The number of times a character occurs always','Message length necessarily','Networking protocol'],c:0,exp:'Substitution changes the symbol mapping.',tag:'CORE'},
 {q:'What is the main property of a cryptographic hash output?',a:['Must be human-readable','Fixed length for a chosen hash function','Reversibly decryptable','Must have a private key'],c:1,exp:'A hash function maps arbitrary-length inputs to fixed-length digests.',tag:'CORE'},
 {q:'Which principle means hard to find any TWO distinct inputs with the same digest?',a:['Confidentiality','Collision resistance','Transposition','Decryption'],c:1,exp:'Collision resistance is about resisting the search for any colliding pair.',tag:'CORE'},
 {q:'Symmetric encryption uses...',a:['A shared secret key','No keys','Only public keys','Hash values in place of keys'],c:0,exp:'Symmetric encryption has a common shared secret for encryption and decryption.',tag:'CORE'},
 {q:'Asymmetric systems are based on...',a:['Only a Caesar shift','A public/private key pair','One shared password','Alphabet frequency alone'],c:1,exp:'Asymmetric cryptography uses mathematically related public and private keys.',tag:'CORE'},
 {q:'What does PKI commonly use to bind a public key to an identity?',a:['A rail fence','An X.509 digital certificate','A repeating XOR key','The Caesar table'],c:1,exp:'Digital certificates establish a verified association between a public key and identity.',tag:'CORE'},
 {q:'Which statement about hashing is correct?',a:['Hashing is decryptable using a key','A hash is a fixed-length digest, not ciphertext','Hashing and transposition are identical','Every file has its own unique hash mathematically'],c:1,exp:'Hash functions have finite outputs, so collisions are possible. Hashing is not reversible encryption.',tag:'CORE'},
 {q:'A frequency analysis technique is useful when...',a:['The cipher preserves recognizable letter frequency patterns','No characters exist','Public keys are revoked','All data is hashed'],c:0,exp:'Simple monoalphabetic substitutions retain frequency distributions up to relabeling.',tag:'BONUS'},
 {q:'Which of these is NOT safe for sensitive real-world data on its own?',a:['Properly configured AES-GCM','A simple repeating-key XOR cipher','A secure TLS deployment','Validated modern encryption'],c:1,exp:'Repeating-key XOR is educational but vulnerable to analysis and key recovery.',tag:'BONUS'},
 {q:'In the PDF’s transposition key, where does source position 1 move?',a:['Position 8','Position 4','Position 1','Position 3'],c:1,exp:'PDF p. 107 gives 1→4. For binary data, position 1 is the rightmost bit.',tag:'CORE'},
 {q:'What does the one-time pad “never reused” rule protect against?',a:['Nothing','Relations between messages exposed by pad reuse','Computer overheating','Large ciphertext files'],c:1,exp:'Reusing a pad can reveal the XOR (or relationships) of the two plaintexts.',tag:'CORE'},
 {q:'Which is a correct purpose for a digital signature?',a:['Confidentiality of the plaintext alone','Proving origin and integrity','Sorting ciphertext alphabetically','Shortening a password'],c:1,exp:'A digital signature authenticates a signer and detects modification when properly implemented.',tag:'CORE'}
];
Q.forEach((item,index)=>{
 item.topic=index===21?'pki':[20,27].includes(index)?'public-key':[15,23].includes(index)?'attacks':index===19?'symmetric':'cryptography';
 item.source=CipherLabReviewer.source(item.topic);
 item.tag=index===10?'BONUS':'CORE';
 if(index===10)item.source+=' · Added A=0 calculation convention';
});
Q.push(...CipherLabReviewer.questions);
for(const card of CipherLabStudyBank.cards){
 const item={q:card.question,a:card.choices,c:card.answer,exp:card.explanation,tag:card.added?'BONUS':'CORE',topic:card.topic,source:card.source},existing=Q.find(question=>question.q===card.question);
 if(existing)Object.assign(existing,item);else Q.push(item);
}
Q.push(...[
 {q:'What unit does the Playfair cipher transform?',a:['A single bit only','A pair of letters','An entire file at once','A public/private key pair'],c:1,exp:'Playfair is a digraph substitution cipher: its rules transform two letters at a time.'},
 {q:'How does this Playfair simulator fit the alphabet into a 5×5 square?',a:['It removes every vowel','It uses six rows','It combines I and J','It stores digits instead'],c:2,exp:'This variant maps J to I and keeps 25 distinct letters in the square.'},
 {q:'To encrypt a Playfair pair in the same row, move each letter...',a:['One cell right, with wraparound','One cell left only','To the top row','To its alphabet mirror'],c:0,exp:'Same-row encryption moves right; decryption reverses it by moving left.'},
 {q:'Why does Playfair decryption keep X/Q fillers visible?',a:['All letters must remain encrypted','The keyword is unknown','Every X is always genuine','Automatic deletion can remove real message letters'],c:3,exp:'Inserted fillers and genuine letters are ambiguous without message context.'}
].map(item=>({...item,topic:'cryptography',tag:'BONUS',source:CipherLabReviewer.filename+' · Supplemental Playfair practice outside the supplied PDF'})));

Q.push(...[
 {q:'With numeric column transposition and 3 columns, CATDOG encrypts to...',a:['CDAOTG','GODTAC','CATDOG','CDATOG'],c:0,exp:'Write CAT / DOG in two rows. Read columns top to bottom from left to right: CD | AO | TG → CDAOTG.'},
 {q:'Which ranks belong to the columnar keyword ZEBRA?',a:['1 2 3 4 5','5 3 2 4 1','5 4 3 2 1','4 2 1 3 5'],c:1,exp:'Alphabetical order is A, B, E, R, Z. Place those ranks back over the original keyword: Z=5, E=3, B=2, R=4, A=1.'},
 {q:'Using keyword columnar transposition, HELLOWORLD with ZEBRA becomes...',a:['HWEOLRLLOD','ODLREOLLHW','DLROWOLLEH','KHOORZRUOG'],c:1,exp:'Write HELLO / WORLD beneath ZEBRA, then collect A=OD, B=LR, E=EO, R=LL, Z=HW. Join them as ODLREOLLHW.'},
 {q:'Decrypt ODLREOLLHW with the columnar keyword ZEBRA.',a:['WORLDHELLO','HELLOWORLD','HELLOWORLDX','ODLREOLLHW'],c:1,exp:'Each column has two symbols. Fill A=OD, B=LR, E=EO, R=LL, Z=HW, then read rows in original ZEBRA column order: HELLO / WORLD.'},
 {q:'For 11 unpadded symbols and keyword ZEBRA, which column receives 3 symbols?',a:['A, because its rank is 1','Every column','Z, because it is the original leftmost column','No column; append four X letters'],c:2,exp:'11 = 2×5 + 1. The first original column, Z, has one extra symbol. Ranked read order determines chunk order, not which column is longer.'},
 {q:'How should repeated L letters in the columnar keyword BALLOON be ranked?',a:['Delete the second L','Give both L letters rank 3','Give the first L rank 3 and the second L rank 4','Read the rightmost L first'],c:2,exp:'Keep all keyword positions. Break alphabetical ties from left to right: BALLOON has ranks 2 1 3 4 6 7 5.'}
].map(item=>({...item,topic:'cryptography',tag:'BONUS',source:CipherLabReviewer.filename+' · Supplemental columnar transposition practice; extends Unit III, PDF p. 107'})));

function examBank(){return Q.filter(item=>(S.examTopic==='all'||item.topic===S.examTopic)&&(S.examScope==='all'||item.tag==='CORE'))}
const S={route:'home',lesson:0,cipher:'caesar',mode:'encrypt',simStore:JSON.parse(JSON.stringify(defaults)),simulation:null,transpositionStep:0,mission:null,missionAnswer:false,missionHint:false,missionRound:0,missionGoal:10,missionRight:0,missionTotal:0,missionDifficulty:'mixed',missionCiphers:types.map(type=>type.id),missionCipherQueue:[],exam:null,examReveal:false,examLength:10,examTopic:'all',examScope:'all',flashIndex:0,flashFlipped:false,analysisText:'KHOOR ZRUOG',analysisResults:null};
function renderTop(){let done=progress.completed.length,pct=Math.round(100*done/lessons.length);$('#top-xp').textContent=progress.xp;$('#side-progress-label').textContent=pct+'%';$('#side-progress-bar').style.width=pct+'%';$('#side-progress-sub').textContent=`${done} of ${lessons.length} lessons completed`}
function nav(route){S.route=route;$$('.nav-item').forEach(b=>b.classList.toggle('selected',b.dataset.route===route));let labels={home:'Dashboard',learn:'Learn',lab:'Simulator',missions:'Missions',exam:'Mock exam',quiz:'Topic quiz', 'cipher-exam':'Cipher exam',flashcards:'Flashcards',analysis:'Cryptanalysis',reference:'Quick reference'};$('#crumb').textContent=labels[route];$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');render();window.scrollTo({top:0,behavior:'instant'})}
function render(){const views={home:renderHome,learn:renderLearn,lab:renderLab,missions:renderMissions,exam:renderExam,quiz:CipherLabStudy.renderQuiz,'cipher-exam':CipherLabStudy.renderCipherExam,flashcards:renderFlashcards,analysis:renderAnalysis,reference:renderReference};$('#main-content').innerHTML=views[S.route]();renderTop();bindView()}
function pageHead(eyebrow,title,subtitle){return `<div class="eyebrow">${eyebrow}</div><h1 class="page-heading">${title}</h1><p class="page-sub">${subtitle}</p>`}
function renderHome(){let accuracy=progress.attempts?Math.round(100*progress.correct/progress.attempts):0;let features=[['▧','Topic quiz','Answer INTE 401 quiz cards, flip for explanations and retry your misses.','quiz'],['✎','Four-cipher exam','Solve fresh substitution, transposition, Vernam and Vigenère problems.','cipher-exam'],['◈','Learn the concepts','Review access control, network defense, biometrics and cryptography.','learn'],['⌘','Cipher simulator','Encrypt, decrypt and reveal the intermediate calculation for each letter.','lab'],['◎','Practice missions','Solve generated challenges and check your answer in real time.','missions'],['◫','Mock examination','Take randomized multiple-choice tests with explained answers.','exam'],['▤','Flashcards','Test recall of definitions, formulas and differences.','flashcards'],['⌁','Cryptanalysis lab','Explore letter frequencies and try every possible Caesar shift.','analysis']];return `<div class="hero"><div class="eyebrow">WELCOME TO YOUR TRAINING GROUND</div><h1>Think like a <em>security analyst.</em><br>Train like an examiner.</h1><p>Understand access decisions, network defenses and cipher calculations. Study all seven PDF units, then challenge yourself with focused practice.</p><div class="hero-actions"><button class="btn" data-go="quiz">Start the topic quiz <span>→</span></button><button class="btn secondary" data-go="cipher-exam">Create a cipher exam ↗</button></div><div class="hero-lower">◆ 100% offline &nbsp; ◆ ${lessons.length} lessons &nbsp; ◆ ${CipherLabStudyBank.cards.length} quiz cards &nbsp; ◆ fresh four-cipher exams</div></div>
<div class="metric-grid"><div class="metric"><div class="metric-icon">✦</div><div class="metric-number">${progress.xp}</div><div class="metric-label">Experience points</div></div><div class="metric"><div class="metric-icon">◈</div><div class="metric-number">${progress.completed.length}<span class="muted" style="font-size:14px"> / ${lessons.length}</span></div><div class="metric-label">Lessons completed</div></div><div class="metric"><div class="metric-icon">◎</div><div class="metric-number">${accuracy}%</div><div class="metric-label">Practice accuracy · ${progress.attempts} attempts</div></div><div class="metric"><div class="metric-icon">◫</div><div class="metric-number">${progress.bestExam}%</div><div class="metric-label">Best mock exam score</div></div></div><div class="section-head"><h2 class="section-title">Choose your training path</h2><small>LEARN → PRACTICE → MASTER</small></div><div class="feature-grid">${features.map(x=>`<article class="feature-card"><div class="feature-symbol">${x[0]}</div><strong>${x[1]}</strong><p>${x[2]}</p><button class="card-go" data-go="${x[3]}">LAUNCH MODULE →</button></article>`).join('')}</div><div class="notice amber mt-lg"><b>Exam accuracy note:</b> Your PUP instructional material teaches Vernam with <b>A=1</b> letter values, while the Vigenère worked extension uses <b>A=0</b>. CipherLab labels each convention clearly. Source: Unit III, PDF pp. 107–109.</div><div class="notice purple mt"><b>Bonus material is labeled.</b> The source covers Units I–VII, including symmetric ciphers, public-key systems, PKI and cryptosystem attacks. Added Vigenère calculations, remote protocol details, named theoretical models and Playfair retain supplemental labels.</div>`}
function renderLearn(){let item=lessons[S.lesson];return `${pageHead('GUIDED STUDY','Learn the concepts',`${lessons.length} focused lessons covering the supplied INTE 401 instructional material. Work through the explanations, then mark each lesson complete.`)}<div class="learn-layout"><div class="lesson-list" role="tablist" aria-label="Course lessons">${lessons.map((l,i)=>`<button class="lesson-button ${i===S.lesson?'active':''}" data-lesson="${i}" role="tab" aria-selected="${i===S.lesson}"><span class="lesson-idx">${String(i+1).padStart(2,'0')}</span><strong>${E(l.name)}</strong>${progress.completed.includes(l.id)?'<small>✓</small>':''}</button>`).join('')}</div><article class="panel lesson-body" role="tabpanel"><div class="split"><span class="pill ${item.level==='BONUS'?'bonus':'core'}">${item.level==='BONUS'?'BONUS WORKED EXAMPLE':'SOURCE-BASED'}</span><span class="pill">LESSON ${S.lesson+1} / ${lessons.length}</span></div><h2>${E(item.name)}</h2><div class="lesson-info">${E(item.source)}</div><p>${E(item.summary)}</p><h3>What you should know</h3><ul>${item.bullets.map(b=>`<li>${E(b)}</li>`).join('')}</ul><h3>Formula or demonstration</h3><pre class="codebox">${E(item.formula)}</pre><div class="notice mt"><b>Worked takeaway: </b>${E(item.example)}</div><div class="notice amber mt"><b>Common exam trap: </b>${E(item.trap)}</div>${item.exercises?`<h3>Practice exercises · BONUS columnar methods</h3>${item.exercises.map(exercise=>`<details class="solution-more"><summary>${E(exercise.question)}</summary><p>${E(exercise.answer)}</p></details>`).join('')}`:''}<div class="lesson-footer"><button class="btn ghost" data-lesson-prev ${S.lesson===0?'disabled':''}>← Previous lesson</button><button class="btn ${progress.completed.includes(item.id)?'secondary':''}" data-complete>${progress.completed.includes(item.id)?'✓ Marked complete':'✓ Mark lesson complete (+20 XP)'}</button><button class="btn secondary" data-lesson-next ${S.lesson===lessons.length-1?'disabled':''}>Next lesson →</button></div></article></div>`}
function simControls(){let d=S.simStore[S.cipher];if(S.cipher==='caesar')return `<div class="form-row"><div><label class="input-label" for="sim-shift">Alphabet shift · 0–25</label><input id="sim-shift" class="field" type="number" min="0" max="25" value="${E(d.shift)}"></div><div><label class="input-label">Sample mapping</label><div class="output-box muted" style="min-height:46px;padding:10px">A → ${ALPHA[mod(Number(d.shift)||0,26)]} &nbsp; B → ${ALPHA[mod((Number(d.shift)||0)+1,26)]}</div></div></div>`;
 if(S.cipher==='transposition'){
  const method=d.method||'permutation';
  return `<div class="mt"><label class="input-label" for="sim-method">Transposition method</label><select id="sim-method" class="field">${[['numeric','Numeric Column Transposition'],['keyword','Keyword-Based Columnar Transposition'],['permutation','Course eight-position permutation']].map(([value,label])=>`<option value="${value}" ${method===value?'selected':''}>${label}</option>`).join('')}</select></div>
  <div class="form-row"><div>${method==='numeric'?`<label class="input-label" for="sim-columns">Number of columns · 1–64</label><input id="sim-columns" class="field mono" type="number" min="1" max="64" step="1" value="${E(d.columns??3)}" aria-describedby="sim-normalization sim-error">`:`<label class="input-label" for="sim-key">${method==='keyword'?'Keyword · 1–64 A–Z letters':'Destination positions for sources 1 through 8'}</label><input id="sim-key" class="field mono" value="${E(method==='keyword'?d.keyword||'':d.key||'')}" spellcheck="false" autocomplete="off" ${method==='keyword'?'maxlength="64"':''} aria-describedby="sim-normalization sim-error">`}</div>
  <div class="notice">${method==='permutation'?'<b>Position 1 is at the right.</b> Enter each 1–8 once. Use complete 8-symbol blocks; add any padding yourself.':method==='keyword'?'<b>BONUS columnar method.</b> Rank letters alphabetically; ties keep their left-to-right order. Fill rows, then read columns by rank.':'<b>BONUS columnar method.</b> Fill rows left to right; read columns left to right. Decryption restores the same unpadded grid.'}</div></div>
  <p class="smalltxt muted" id="sim-normalization">${method==='permutation'?'Whitespace is removed and letters are uppercased. Use A–Z letters or binary digits without mixing them. No automatic padding.':'A–Z letters are uppercased; all whitespace is removed. Punctuation, digits and other symbols are kept and transposed. No padding is added. Original spacing and case cannot be recovered.'}</p>`;
 }
 if(['mono','vernam','vigenere','xor','playfair'].includes(S.cipher))return `<div class="form-row"><div><label class="input-label" for="sim-key">${{mono:'26-letter replacement alphabet',vernam:'One-time pad · one letter per message letter',vigenere:'Keyword · letters only',xor:'XOR key · repeating bytes',playfair:'Keyword · 5×5 square (I/J combined)'}[S.cipher]}</label><input id="sim-key" class="field mono" value="${E(d.key||'')}" spellcheck="false" autocomplete="off"></div><div><label class="input-label">${S.cipher==='vernam'?'Pad assistant':S.cipher==='mono'?'Mapping guide':'Key guide'}</label><div class="tool-row" style="margin-top:0">${S.cipher==='vernam'?'<button class="btn secondary small" id="pad-generate">Generate random pad</button>':''}${S.cipher==='mono'?'<button class="btn secondary small" id="alphabet-generate">Randomize alphabet</button>':''}<small class="muted smalltxt">${{mono:'A maps to the first key letter, B to second, etc.',vernam:'A=1...Z=26. Never reuse a real one-time pad.',vigenere:'A=0...Z=25. Keyword repeats over letters.',xor:'XOR demonstrates byte operations; do not rely on it for secrecy.',playfair:'J→I; spaces removed. Insert X (Q after X); decryption keeps fillers.'}[S.cipher]}</small></div></div></div>`;
 if(S.cipher==='rail')return `<div class="form-row"><div><label class="input-label" for="sim-number">Number of rails</label><input id="sim-number" type="number" min="2" max="8" class="field" value="${E(d.rails)}"></div><div class="notice">Follow the zigzag rail pattern. Spaces are removed.</div></div>`;
 if(S.cipher==='rsa')return `<div class="form-row"><div><label class="input-label" for="rsa-p">Prime p</label><select id="rsa-p" class="field">${[3,5,7,11,13,17,19,23,29,31].map(x=>`<option value="${x}" ${Number(d.p)===x?'selected':''}>${x}</option>`).join('')}</select></div><div><label class="input-label" for="rsa-q">Prime q</label><select id="rsa-q" class="field">${[3,5,7,11,13,17,19,23,29,31].map(x=>`<option value="${x}" ${Number(d.q)===x?'selected':''}>${x}</option>`).join('')}</select></div></div>`;return `<div class="notice">No extra key needed. Atbash mirrors A↔Z, B↔Y, ...</div>`}
function traceHtml(result){if(result.solution)return CipherLabSolutions.render(result.solution);let table='';if(result.trace?.length){table=`<div class="trace-wrap"><table class="trace-table"><thead><tr><th>#</th><th>Input</th><th>Key</th><th>Calculation</th><th>Result</th></tr></thead><tbody>${result.trace.slice(0,32).map(t=>`<tr><td>${E(t.index)}</td><td>${E(t.input)}</td><td>${E(t.key)}</td><td>${E(t.calc)}</td><td style="color:var(--primary)">${E(t.output)}</td></tr>`).join('')}</tbody></table></div>${result.trace.length>32?'<p class="smalltxt muted">First 32 characters shown. All characters are processed.</p>':''}`}
 if(result.grid){table+=`<div class="trace-wrap"><table class="trace-table"><tbody>${result.grid.map(row=>`<tr>${row.map(v=>`<td class="center" style="min-width:30px;color:var(--primary)">${E(v||'·')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
 return `<p class="smalltxt muted">${E(result.explain||'')}</p>${table}`}
function renderLab(){
 const def=S.simStore[S.cipher],type=types.find(t=>t.id===S.cipher),result=S.simulation;
 const columnar=S.cipher==='transposition'&&def.method!=='permutation';
 return `${pageHead('INTERACTIVE WORKBENCH','Cipher simulator','Type a message, choose a cipher, and study the exact transformations. Encrypt or decrypt with columnar transposition, the course permutation, and the other cipher methods.')}
 <div class="tabs" role="group" aria-label="Choose cipher">${types.map(t=>`<button class="tab ${S.cipher===t.id?'active':''}" data-cipher="${t.id}">${E(t.name)}</button>`).join('')}</div>
 <div class="two-col mt simulator-layout"><section class="panel"><div class="split"><h3 style="margin:0">${E(type.name)}</h3><span class="pill ${columnar?'bonus':type.tag==='CORE'?'core':'bonus'}">${columnar?'BONUS COLUMNAR':type.tag}</span></div><p style="margin:6px 0 12px">${E(type.sub)}</p>
 <button type="button" class="btn secondary cipher-explanation-trigger" id="explain-cipher" aria-haspopup="dialog" aria-controls="cipher-explanation"><span aria-hidden="true">ⓘ</span> Explain this cipher</button>
 <div class="tabs" role="group" aria-label="Encryption mode"><button class="tab ${S.mode==='encrypt'?'active':''}" data-mode="encrypt" aria-pressed="${S.mode==='encrypt'}">Encrypt →</button><button class="tab ${S.mode==='decrypt'?'active':''}" data-mode="decrypt" aria-pressed="${S.mode==='decrypt'}">← Decrypt</button></div>
 <div class="mt"><label class="input-label" for="sim-text">${S.mode==='encrypt'?'Plaintext':'Ciphertext'} / message</label><textarea class="field mono" id="sim-text" rows="3" spellcheck="false" placeholder="Type your message..." aria-describedby="${S.cipher==='transposition'?'sim-normalization ':''}sim-error">${E(def.text||'')}</textarea></div>
 ${simControls()}<div class="tool-row"><button class="btn" id="run-sim">${S.mode==='encrypt'?'Encrypt':'Decrypt'} message →</button><button class="btn secondary" id="sim-swap">Use output as input ↕</button><button class="btn ghost" id="sim-example">Load example</button><button class="btn ghost" id="sim-clear">Clear</button></div>
 <hr class="subtle-line"><div class="split"><span class="input-label">${S.mode==='encrypt'?'Ciphertext':'Recovered plaintext'}</span>${result?.text!==undefined?'<button class="btn ghost small" id="copy-output">Copy result</button>':''}</div>
 <div class="output-box ${!result?'muted':''}" id="sim-output" aria-live="polite">${result?E(result.text):'Run the simulator to reveal the result...'}</div><div id="sim-error" class="smalltxt" role="alert" style="color:var(--danger);margin-top:9px"></div></section>
 <aside class="side-col"><div class="panel"><div class="split"><h3>Step-by-step breakdown</h3><span class="pill">VISUAL TRACE</span></div><div id="sim-trace">${result?simulatorTrace(result):'<p>Run a simulation to see the worked solution. Columnar methods include an interactive grid with Next Step, Previous Step and Reset controls.</p>'}</div></div>
 <div class="notice amber"><b>Exam reminder:</b> The course permutation uses an eight-position key; columnar methods are added practice. Vernam uses A=1. Vigenère’s A=0 calculations and toy RSA letter arithmetic are added exercises.</div></aside></div>`;
}
const PHRASES={easy:['CAT','DOG','HELLO','WORLD','SAFE','DATA','CODE','SECRET','NETWORK','CYBER','CIPHER','TRUST'],medium:['HELLO WORLD','SECURE DATA','FIREWALL','SECRET CODE','INFORMATION','DIGITAL TRUST','OPEN SOURCE','ATTACK AT DAWN','NETWORK ACCESS','DATA PRIVACY'],hard:['CRYPTOGRAPHY','INFORMATION SECURITY','VERIFY THE KEY','PROTECT PRIVATE DATA','DEFEND THE NETWORK','IMPORTANT MESSAGE','SECURITY AWARENESS','ENCRYPT THE MESSAGE','KNOW YOUR CIPHERS']};
function selectedMissionCiphers(){return types.filter(type=>Array.isArray(S.missionCiphers)&&S.missionCiphers.includes(type.id)).map(type=>type.id)}
function missionCipherSummary(){const selected=selectedMissionCiphers();return !selected.length?'Choose your ciphers':selected.length===types.length?`All ciphers (${selected.length})`:selected.length<=2?selected.map(id=>types.find(type=>type.id===id).name).join(', '):`${selected.length} ciphers selected`}
function syncMissionCipherPicker(){
 const selected=selectedMissionCiphers(),all=$('#mission-cipher-all');
 if(all){all.checked=selected.length===types.length;all.indeterminate=selected.length>0&&selected.length<types.length}
 $$('[data-mission-cipher]').forEach(input=>{input.checked=selected.includes(input.value)});
 const summary=$('#mission-cipher-summary');if(summary)summary.textContent=missionCipherSummary();
 const error=$('#mission-cipher-error');if(error)error.hidden=selected.length>0;
 const begin=$('#begin-mission');if(begin)begin.disabled=!selected.length;
}
function setMissionCipherChecked(id,checked){
 if(id==='all')S.missionCiphers=checked?types.map(type=>type.id):[];
 else if(types.some(type=>type.id===id))S.missionCiphers=checked?[...new Set([...selectedMissionCiphers(),id])]:selectedMissionCiphers().filter(value=>value!==id);
 S.missionCipherQueue=[];
 syncMissionCipherPicker();
}
function nextMissionCipher(){
 const selected=selectedMissionCiphers();
 if(!selected.length)throw Error('Check at least one cipher before starting a mission set.');
 if(!S.missionCipherQueue.length||S.missionCipherQueue.some(id=>!selected.includes(id)))S.missionCipherQueue=shuffle(selected);
 return S.missionCipherQueue.shift();
}
function generateMission(){let difficulty=S.missionDifficulty==='mixed'?pick(['easy','medium','hard']):S.missionDifficulty;let type=nextMissionCipher();let encrypt=randomIndex(2)===0,phrase=pick(PHRASES[difficulty]);let opts={},key='';if(type==='caesar')opts.shift=2+randomIndex(22);if(type==='transposition'){
 opts.method=pick(['permutation','numeric','keyword']);phrase=onlyLetters(phrase);
 if(opts.method==='permutation'){key=shuffle([1,2,3,4,5,6,7,8]).join(' ');phrase=phrase.padEnd(Math.ceil(phrase.length/8)*8,'X')}
 else if(opts.method==='numeric')opts.columns=2+randomIndex(5);
 else key=pick(['ZEBRA','BALLOON','SECRET','LETTER']);
 }if(type==='rail')opts.rails=2+randomIndex(3);if(type==='playfair')key=pick(['PLAYFAIR EXAMPLE','MONARCHY','KEYWORD']);if(type==='vigenere')key=pick(['KEY','SAFE','CODE','SECRET','LOCK']);if(type==='vernam'){key=Array.from({length:onlyLetters(phrase).length},()=>ALPHA[randomIndex(26)]).join('')}
 if(type==='xor')key=pick(['V','K','Q']);
 if(type==='mono')key=shuffle(ALPHA.split('')).join('');
 if(type==='rsa'){const primes=difficulty==='easy'?[5,7,11]:difficulty==='medium'?[7,11,13,17]:[11,13,17,19,23];opts.p=pick(primes);opts.q=pick(primes.filter(prime=>prime!==opts.p))}
 let encrypted=simulate(type,phrase,key,'encrypt',opts);
 let src=encrypt?phrase:encrypted.text,target=encrypt?encrypted.text:type==='playfair'?encrypted.prepared:phrase;
 return {difficulty,type,encrypt,src,target,key,opts,parameters:encrypted.parameters,answered:false,correct:false,explanation:'',userAnswer:'',showHint:false};}
function missionDescription(m){let label=types.find(t=>t.id===m.type).name,desc='';if(m.type==='caesar')desc=`Shift by ${m.opts.shift}. A=0..Z=25.`;else if(m.type==='transposition')desc=m.opts.method==='keyword'?`BONUS columnar transposition; keyword: ${m.key}. Rank alphabetically, resolving equal letters from left to right. Fill rows, read columns by rank. No padding.`:m.opts.method==='numeric'?`BONUS numeric column transposition; ${m.opts.columns} columns. Fill rows left to right, then read whole columns from left to right. No padding.`:`Eight-symbol blocks; source→destination key for positions 1–8: ${m.key}. Number right to left. Reverse arrows to decrypt. Any X padding shown is part of the answer.`;else if(m.type==='vernam')desc=`Use A=1..Z=26, secret pad: ${m.key}. The pad has one letter per message letter.`;else if(m.type==='vigenere')desc=`Use A=0..Z=25, repeating keyword: ${m.key}.`;else if(m.type==='playfair')desc=`BONUS 5×5 square, keyword: ${m.key}. Merge J→I; insert X (Q after X) when preparing plaintext. For decryption, keep all filler letters.`;else if(m.type==='mono')desc=`Substitution alphabet: ${m.key}.`;else if(m.type==='rail')desc=`BONUS rail fence, ${m.opts.rails} rails.`;else if(m.type==='xor')desc=`XOR each byte with the repeated ASCII key “${m.key}”. Encrypted form is HEX.`;else if(m.type==='atbash')desc='Mirror A↔Z, B↔Y ...';else if(m.type==='rsa'){const {p,q,n,e,d}=m.parameters;desc=`Toy RSA: p=${p}, q=${q}, n=${n}; ${m.encrypt?'public e='+e:'private d='+d}. Use A=1..Z=26; remove spaces. Ciphertext is a sequence of integers separated by spaces.`}return `${label} · ${desc}`}
function missionHint(m){
 if(m.type==='playfair')return `Build the 5×5 keyword square and work in pairs. Same row: ${m.encrypt?'right':'left'}; same column: ${m.encrypt?'down':'up'}; rectangle: exchange columns. Keep fillers when decrypting.`;
 if(m.type==='rsa')return m.encrypt?`Convert letters to A=1..Z=26, then compute m^${m.parameters.e} mod ${m.parameters.n} for each letter. Separate the resulting integers with spaces.`:`For each ciphertext integer c, compute c^${m.parameters.d} mod ${m.parameters.n}, then convert 1..26 back to letters.`;
 if(m.type==='transposition'&&['numeric','keyword'].includes(m.opts.method))return m.encrypt?'Write the message across rows; read whole columns in key order. With a keyword, rank alphabetically and break ties from left to right. Do not add padding.':'Count the symbols per original column: the first N mod C columns get one extra. Fill columns in key order, then read rows left to right.';
 if(m.type==='transposition')return m.encrypt?'Number each block right to left. Move the symbol at each source position to its key destination.':'Reverse each source→destination arrow, keeping the right-to-left numbering. Retain all explicit padding.';
 if(m.type==='mono')return m.encrypt?'Write A–Z above the substitution alphabet. Replace each plaintext letter with the key letter directly below it.':'Find each ciphertext letter in the substitution alphabet, then read the normal A–Z letter above it.';
 if(m.type==='vernam')return `Use A=1..Z=26. ${m.encrypt?'Add':'Subtract'} the pad value for each letter, wrapping the result into 1..26. Spaces do not use pad positions.`;
 if(m.type==='vigenere')return `Repeat the keyword over letters only. With A=0..Z=25, ${m.encrypt?'add':'subtract'} the key value and wrap modulo 26.`;
 if(m.type==='xor')return m.encrypt?'XOR each UTF-8 byte with the repeating key byte. Write each result as two hexadecimal digits.':'Read ciphertext as hexadecimal bytes, XOR with the same repeating key bytes, then decode the resulting text.';
 if(m.type==='rail')return m.encrypt?'Write letters along the zigzag rail path, then read the rails from top to bottom.':'Mark the zigzag path, fill each rail with ciphertext in order, then follow the path to recover the message.';
 if(m.type==='atbash')return 'Mirror the alphabet: A↔Z, B↔Y, C↔X. The same operation works in both directions.';
 return `Move each letter ${m.encrypt?'forward':'backward'} by ${m.opts.shift} positions, wrapping around A–Z.`;
}
function answerMatch(type,a,b,encrypt=true){
 if(type==='xor'){
  if(!encrypt)return String(a)===String(b);
  const hex=value=>String(value).replace(/\s/g,'').toUpperCase();
  const actual=hex(a),expected=hex(b);
  return actual.length>0&&actual.length%2===0&&/^[0-9A-F]+$/.test(actual)&&actual===expected;
 }
 if(type==='rsa'&&encrypt){
  const integers=value=>{const text=String(value).trim();if(!/^\d+(?:[\s,]+\d+)*$/.test(text))return null;const values=text.split(/[\s,]+/).map(Number);return values.every(Number.isSafeInteger)?values:null};
  const actual=integers(a),expected=integers(b);
  return !!actual&&!!expected&&actual.length===expected.length&&actual.every((value,index)=>value===expected[index]);
 }
 return onlyLetters(a)===onlyLetters(b);
}
function renderMissions(){
 if(!S.mission)return `${pageHead('SKILL-BASED TRAINING','Practice missions','Check the ciphers you want to practice, then solve generated challenges with instant feedback.')}
 <div class="two-col"><div class="panel"><h3>Configure your training session</h3>
 <p>Choose one or more ciphers. Each challenge supplies the key or layout, with hints available when you get stuck.</p>
 <div class="input-label" id="mission-cipher-label">Ciphers to practice</div>
 <details class="mission-cipher-picker" id="mission-cipher-picker">
 <summary aria-labelledby="mission-cipher-label mission-cipher-summary" aria-describedby="mission-cipher-help" aria-controls="mission-cipher-options"><span id="mission-cipher-summary">${E(missionCipherSummary())}</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg></summary>
 <div class="mission-cipher-menu" id="mission-cipher-options">
 <label class="mission-cipher-option mission-cipher-all"><input type="checkbox" id="mission-cipher-all" ${selectedMissionCiphers().length===types.length?'checked':''}><span>Select all ciphers</span></label>
 <div role="group" aria-label="Choose ciphers">${types.map(type=>`<label class="mission-cipher-option"><input type="checkbox" data-mission-cipher id="mission-cipher-${type.id}" value="${type.id}" ${selectedMissionCiphers().includes(type.id)?'checked':''}><span>${E(type.name)}</span>${type.tag==='BONUS'?'<small class="pill bonus">BONUS</small>':''}</label>`).join('')}</div>
 <div class="mission-cipher-footer"><button class="btn secondary small" type="button" id="mission-cipher-done">Done</button></div></div></details>
 <p class="smalltxt muted" id="mission-cipher-help">Check one or more ciphers in the dropdown. Your set rotates through the checked choices. Difficulty controls message length.</p>
 <p class="smalltxt mission-cipher-error" id="mission-cipher-error" role="status" ${selectedMissionCiphers().length?'hidden':''}>Check at least one cipher to begin.</p>
 <div class="form-row"><div><label class="input-label" for="difficulty-select">Difficulty</label>
 <select class="field" id="difficulty-select"><option value="mixed" ${S.missionDifficulty==='mixed'?'selected':''}>Mixed — varied message lengths</option><option value="easy" ${S.missionDifficulty==='easy'?'selected':''}>Easy — short messages</option><option value="medium" ${S.missionDifficulty==='medium'?'selected':''}>Medium — standard phrases</option><option value="hard" ${S.missionDifficulty==='hard'?'selected':''}>Hard — longer messages</option></select>
 </div><div><label class="input-label" for="mission-count">Number of challenges</label>
 <select class="field" id="mission-count">${[5,10,20].map(count=>`<option value="${count}" ${S.missionGoal===count?'selected':''}>${count} questions</option>`).join('')}</select></div></div>
 <button class="btn" id="begin-mission" ${selectedMissionCiphers().length?'':'disabled'}>Begin mission set →</button></div>
 <div class="panel"><h3>How it works</h3><div class="mini-cards"><div class="mini-card"><b>01 — Identify</b><p>Read the key and operation.</p></div><div class="mini-card"><b>02 — Solve</b><p>Work through the letter math or grid.</p></div><div class="mini-card"><b>03 — Check</b><p>Submit to receive a verdict.</p></div><div class="mini-card"><b>04 — Improve</b><p>Review step-by-step reasoning.</p></div></div><div class="notice mt"><b>Tip:</b> Want to learn the procedure first? Open the <button class="btn link" data-go="lab">cipher simulator ↗</button> and study the worked calculations.</div></div></div>`;
 if(S.missionRound>=S.missionGoal)return renderMissionResult();
 const m=S.mission,i=S.missionRound+1,type=types.find(item=>item.id===m.type),tag=m.type==='transposition'&&['numeric','keyword'].includes(m.opts.method)?'BONUS':type.tag;
 return `${pageHead('MISSION CONTROL','Decode the challenge',`Mission ${i} of ${S.missionGoal} · ${E(m.difficulty.toUpperCase())} difficulty · ${m.encrypt?'ENCRYPT':'DECRYPT'}`)}
 <div class="steps">${Array.from({length:S.missionGoal},(_,k)=>`<div class="step-dot ${k<S.missionRound?'done':''}" ${k===S.missionRound?'style="background:var(--secondary)"':''}></div>`).join('')}</div>
 <div class="two-col"><section class="panel"><div class="split"><span class="pill ${tag==='CORE'?'core':'bonus'}">${E(tag)} · ${E(type.name)}</span><span class="pill">${String(i).padStart(2,'0')} / ${String(S.missionGoal).padStart(2,'0')}</span></div>
 <h2 class="question-big">${m.encrypt?'Encrypt':'Decrypt'} the following ${m.encrypt?'plaintext':'ciphertext'}.</h2><p>${E(missionDescription(m))}</p><div class="mission-prominent">${E(m.src)}</div>
 <label class="input-label" for="mission-answer">Your ${m.encrypt?'ciphertext':'plaintext'} answer</label><input id="mission-answer" class="field answer-input" autocomplete="off" spellcheck="false" placeholder="Type your answer here..." value="${E(m.userAnswer)}" ${m.answered?'disabled':''}>
 <div class="tool-row">${!m.answered?`<button class="btn" id="check-mission">Check answer →</button><button class="btn secondary" id="mission-hint">${m.showHint?'Hide hint':'Show a hint'}</button>`:`<button class="btn" id="next-mission">${i===S.missionGoal?'See my results':'Next challenge'} →</button>`}</div>
 ${!m.answered&&m.showHint?`<div class="notice mt"><b>Hint: </b>${E(missionHint(m))}</div>`:''}
 ${m.answered?`<div class="feedback ${m.correct?'good':'bad'}"><b>${m.correct?'✓ Correct! Great work.':'✕ Not quite. Review the calculation.'}</b><div>Your answer: <span class="mono">${E(m.userAnswer||'(blank)')}</span></div><div>Correct answer: <strong class="mono">${E(m.target)}</strong></div><div>${m.correct?'+15 XP earned!':'You can revisit this type in the simulator.'}</div></div>`:''}</section>
 <aside class="side-col"><div class="panel"><div class="grid-headline"><h2>Performance</h2><span class="pill">CURRENT SET</span></div><div class="mini-cards"><div class="mini-card"><div class="big-stat">${S.missionRight}</div><p>Correct answers</p></div><div class="mini-card"><div class="big-stat">${S.missionTotal}</div><p>Completed</p></div></div></div><div class="panel"><h3>${m.answered?'Step-by-step solution':'How to tackle this'}</h3>${m.answered?traceHtml(simulate(m.type,m.src,m.key,m.encrypt?'encrypt':'decrypt',m.opts)):'<p>Read the operation and key carefully. Follow the rules for the selected cipher, and use a hint if you need help getting started.</p><div class="notice">The correct output will appear after you submit an answer.</div>'}</div></aside></div>`;
}
function renderMissionResult(){let pct=Math.round(100*S.missionRight/Math.max(1,S.missionTotal));return `<div class="centered panel center" style="padding:43px 30px"><div class="eyebrow">TRAINING SET COMPLETE</div><div class="exam-score">${pct}%</div><h1 class="page-heading">${pct>=85?'Excellent codebreaking.':pct>=60?'Good progress.':'Keep sharpening your skills.'}</h1><p>${S.missionRight} of ${S.missionTotal} answers correct. Review misses in the simulator, then try another mission set. Results contribute to your saved accuracy metric.</p><div class="hero-actions" style="justify-content:center"><button class="btn" id="missions-again">Another mission set →</button><button class="btn secondary" data-go="lab">Review cipher methods</button></div></div>`}
function startExam(n){
 const bank=examBank(),count=Math.min(n,bank.length),pools=shuffle(CipherLabReviewer.units).map(unit=>shuffle(bank.filter(item=>CipherLabReviewer.topics.find(topic=>topic.id===item.topic).unit===unit.id))),items=[];
 while(items.length<count)for(const pool of pools)if(pool.length&&items.length<count)items.push(pool.pop());
 S.exam={items:shuffle(items),i:0,answers:[],reviewed:false,finished:false};S.examReveal=false;
}
function renderExam(){if(!S.exam){
 const bank=examBank(),sizes=[...new Set([Math.min(10,bank.length),Math.min(20,bank.length),bank.length])],selected=Math.min(S.examLength,bank.length);
 return `${pageHead('EXAM PREPARATION','Mock examination','Practice all seven PDF units or focus on one subject. Questions sample across the selected PDF units, with explanations and source notes.')}<div class="two-col"><div class="panel"><h3>Configure your exam</h3><div class="form-row"><div><label class="input-label" for="exam-topic">Review topic</label><select id="exam-topic" class="field"><option value="all">All PDF topics</option>${CipherLabReviewer.topics.map(topic=>`<option value="${topic.id}" ${S.examTopic===topic.id?'selected':''}>${E(topic.name)}</option>`).join('')}</select></div><div><label class="input-label" for="exam-scope">Study scope</label><select id="exam-scope" class="field"><option value="all" ${S.examScope==='all'?'selected':''}>Core + bonus practice</option><option value="core" ${S.examScope==='core'?'selected':''}>Core coverage only</option></select></div></div><p>${bank.length} questions available in this selection.</p><div class="tabs" id="exam-lengths">${sizes.filter(n=>n>0).map(n=>`<button class="tab ${selected===n?'active':''}" data-exam-length="${n}">${n===bank.length?`Full bank (${n})`:`${n} questions`}</button>`).join('')}</div><div class="tool-row mt"><button class="btn" id="begin-exam" ${!bank.length?'disabled':''}>Start mock exam →</button></div></div><div class="panel"><h3>Your test history</h3><div class="mini-cards"><div class="mini-card"><b class="big-stat">${progress.exams}</b><p>Exams completed</p></div><div class="mini-card"><b class="big-stat">${progress.bestExam}%</b><p>Best score</p></div></div><div class="notice mt"><b>Source distinction:</b> The supplied PDF covers access control, firewalls, remote access, controls, IDPS, honeypots, scanning, biometrics and cryptography. BONUS questions cover explicitly supplemental concepts.</div></div></div>`;
 }
 let exam=S.exam;if(exam.finished)return renderExamResult();let item=exam.items[exam.i],picked=exam.answers[exam.i],answered=Number.isInteger(picked);return `${pageHead('EXAM SIMULATION','Knowledge checkpoint',`Question ${exam.i+1} of ${exam.items.length}. Answer each question to unlock its explanation.`)}<div class="steps">${exam.items.map((_,i)=>`<div class="step-dot ${i<exam.i?'done':''}" ${i===exam.i?'style="background:var(--secondary)"':''}></div>`).join('')}</div><div class="panel centered"><div class="split"><span class="pill ${item.tag==='BONUS'?'bonus':'core'}">${item.tag}</span><span class="pill">QUESTION ${exam.i+1} / ${exam.items.length}</span></div><p class="lesson-info">${E(CipherLabReviewer.topics.find(topic=>topic.id===item.topic).name)} · ${E(item.source)}</p><h2 class="question-big">${E(item.q)}</h2>${item.a.map((a,i)=>`<button class="answer-option ${answered&&i===item.c?'correct':''} ${answered&&i===picked&&i!==item.c?'incorrect':''}" data-choice="${i}" ${answered?'disabled':''}><span>${'ABCD'[i]}</span>${E(a)}</button>`).join('')}${answered?`<div class="feedback ${picked===item.c?'good':'bad'}"><b>${picked===item.c?'✓ Correct.':'✕ Incorrect.'}</b> ${E(item.exp)}</div><div class="tool-row"><button id="exam-next" class="btn">${exam.i===exam.items.length-1?'Finish exam':'Next question'} →</button></div>`:'<p class="smalltxt muted">Choose the single best answer. The app will explain it immediately.</p>'}</div>`}
function renderExamResult(){const exam=S.exam,correct=exam.answers.filter((c,i)=>c===exam.items[i].c).length,n=exam.items.length,pct=Math.round(correct*100/n);return `<div class="panel centered center" style="padding:39px 28px"><div class="eyebrow">MOCK EXAM COMPLETE</div><div class="exam-score">${pct}%</div><h1 class="page-heading">${correct} / ${n} correct</h1><p>${pct>=90?'Outstanding performance.':pct>=70?'You have a solid foundation.':'Review the concepts and try again.'} Your exam score and experience points have been saved locally.</p><div class="hero-actions" style="justify-content:center"><button class="btn" id="restart-exam">Retake another exam →</button><button class="btn secondary" id="exam-toggle-review">${exam.reviewed?'Hide':'Show'} answer review</button></div></div>${exam.reviewed?`<div class="mt">${exam.items.map((q,i)=>`<div class="panel mt"><div class="split"><span class="pill ${exam.answers[i]===q.c?'complete':'mild'}">${exam.answers[i]===q.c?'CORRECT':'MISSED'}</span><small class="muted">Q${i+1} · ${q.tag}</small></div><h3 style="margin-top:12px">${E(q.q)}</h3><p><b>Your choice:</b> ${E(q.a[exam.answers[i]])}<br><b>Correct answer:</b> ${E(q.a[q.c])}</p><div class="notice">${E(q.exp)}</div><p class="lesson-info">${E(q.source)}</p></div>`).join('')}</div>`:''}`}
function renderFlashcards(){let [front,back]=flashcards[S.flashIndex],mastered=progress.flashMastered.includes(S.flashIndex);return `${pageHead('ACTIVE RECALL','Flashcards','Build quick recall for definitions, formulas and common exam traps. Flip a card, rate it, and repeat what you have not mastered.')}<div class="flash-stage"><div class="split margins"><span class="pill">CARD ${S.flashIndex+1} / ${flashcards.length}</span><span class="pill complete">${progress.flashMastered.length} MASTERED</span></div><div class="progress-track" style="margin-bottom:20px"><span style="width:${100*progress.flashMastered.length/flashcards.length}%"></span></div><button id="flip-card" class="flash-card ${S.flashFlipped?'flipped':''}" title="Click to flip the flashcard" aria-label="${S.flashFlipped?'Hide answer':'Reveal answer'}"><span class="overline">${S.flashFlipped?'THE ANSWER':'QUESTION · THINK FIRST'}</span>${S.flashFlipped?`<div class="answer">${E(back)}</div>`:`<div class="front">${E(front)}</div>`}<span class="hint">${S.flashFlipped?'Click to see the question again':'Click to reveal the answer'}</span></button><div class="tool-row" style="justify-content:center;margin-top:19px"><button class="btn secondary" id="flash-prev">← Previous</button><button class="btn ${mastered?'secondary':''}" id="flash-master">${mastered?'✓ Mastered (undo)':'✓ I know this (+5 XP)'}</button><button class="btn secondary" id="flash-next">Next →</button></div><div class="notice mt"><b>Quick technique:</b> Read the question, say your answer aloud, then flip. Mark “I know this” only if you could recall the answer before viewing it.</div></div>`}
const ENGLISH_FREQ=[8.17,1.49,2.78,4.25,12.70,2.23,2.02,6.09,6.97,.15,.77,4.03,2.41,6.75,7.51,1.93,.10,5.99,6.33,9.06,2.76,.98,2.36,.15,1.97,.07];
function frequencies(text){const s=onlyLetters(text),count=Array(26).fill(0);for(const c of s)count[ALPHA.indexOf(c)]++;return{count,total:s.length}}
function chiScore(str){let f=frequencies(str);if(!f.total)return Infinity;return f.count.reduce((s,actual,i)=>{let expected=ENGLISH_FREQ[i]*f.total/100;return s+(actual-expected)**2/Math.max(expected,.01)},0)}
function analyzeCaesar(text){return Array.from({length:26},(_,k)=>({shift:k,text:shiftCipher(text,k,true).text,score:chiScore(shiftCipher(text,k,true).text)})).sort((a,b)=>a.score-b.score)}
function renderAnalysis(){let f=frequencies(S.analysisText),max=Math.max(1,...f.count),results=S.analysisResults;return `${pageHead('BONUS · PATTERN RECOGNITION','Cryptanalysis lab','Observe letter frequencies and test every possible Caesar shift. This bonus simulation shows why simple classical ciphers are vulnerable.')}<div class="two-col"><div class="panel"><h3>Capture the ciphertext</h3><label class="input-label" for="analysis-input">Encrypted text</label><textarea class="field mono" id="analysis-input" rows="4" spellcheck="false">${E(S.analysisText)}</textarea><div class="tool-row"><button class="btn" id="analyze-text">Analyze 26 shifts →</button><button class="btn secondary" id="analysis-example">Load longer example</button></div><h3 class="mt">Character frequencies</h3><div class="frequency-bars">${ALPHA.split('').map((l,i)=>`<div class="freq-col" title="${l}: ${f.count[i]} occurrence(s)"><div class="bar" style="height:${Math.max(1,f.count[i]/max*112)}px"></div><small>${l}</small></div>`).join('')}</div><p class="smalltxt muted">Counted letters: ${f.total}. Letters E, T, A, O and I are common in longer English passages, but short samples can be misleading.</p></div><aside class="panel"><div class="split"><h3 style="margin:0">Likely Caesar decodings</h3><span class="pill bonus">BONUS ANALYSIS</span></div><p>Try all 26 shifts. Sorted by a simple English letter-frequency score (smaller is better). On short phrases, the top guess can be wrong.</p>${results?results.map((v,i)=>`<button class="ranked-candidate" data-pick-shift="${v.shift}"><b>#${i+1}</b><span class="candidate-text">${E(v.text)}</span><small>shift −${v.shift}</small></button>`).join(''):'<div class="notice">Enter ciphertext and click Analyze. You will see the 26 candidate plaintexts.</div>'}</aside></div><div class="notice amber mt"><b>Important:</b> Statistical ranking is not cryptographic proof. Use grammatical clues and context to confirm candidates. This frequency-analysis ranking feature extends beyond the PDF’s worked cipher examples.</div>`}
function renderReference(){return `${pageHead('LAST-MINUTE REVISION','Quick reference','Review the security concepts, cipher formulas and source map from the supplied INTE 401 instructional material.')}<div class="panel"><h3>All seven PDF units</h3><div class="study-topic-list">${CipherLabReviewer.units.map(unit=>`<span class="pill">Unit ${E(unit.id)} · ${E(unit.name)} · pp. ${E(unit.pages)}</span>`).join('')}</div><h3 class="mt">PDF coverage at a glance</h3><div class="reference-topics">${CipherLabReviewer.lessons.map(lesson=>`<article><h4>${E(lesson.name)}</h4><pre class="codebox">${E(lesson.formula)}</pre><p class="smalltxt">${E(lesson.trap)}</p><small class="muted">${E(lesson.source)}</small></article>`).join('')}</div></div><div class="two-col mt"><section class="panel"><h3>Essential formulas</h3><table class="ref-table"><thead><tr><th>Method</th><th>Formula / procedure</th></tr></thead><tbody><tr><td>Caesar, encrypt</td><td class="mono">C=(P+k) mod 26 (A=0)</td></tr><tr><td>Caesar, decrypt</td><td class="mono">P=(C−k) mod 26 (A=0)</td></tr><tr><td>Vigenère, encrypt <span class="pill bonus">BONUS</span></td><td class="mono">C=(P+K) mod 26 (A=0)</td></tr><tr><td>Vigenère, decrypt <span class="pill bonus">BONUS</span></td><td class="mono">P=(C−K) mod 26 (A=0)</td></tr><tr><td>Vernam, course version</td><td class="mono">C=((P+K−1) mod 26)+1 (A=1)</td></tr><tr><td>Vernam, decrypt</td><td class="mono">P=((C−K−1) mod 26)+1 (A=1)</td></tr><tr><td>Playfair <span class="pill bonus">BONUS</span></td><td>5×5 square, I/J combined. Row: right/left; column: down/up; rectangle: exchange columns. X filler (Q after X); retain fillers on decryption.</td></tr><tr><td>XOR bits</td><td class="mono">C=P⊕K; P=C⊕K</td></tr><tr><td>Columnar transposition <span class="pill bonus">BONUS</span></td><td>Fill rows; read columns by numeric order or alphabetical keyword rank, breaking ties left to right. Decrypt with original column lengths: floor(N/C), plus one in the first N mod C original columns. No padding.</td></tr><tr><td>Course transposition</td><td>8-symbol blocks; positions 8 7 6 5 4 3 2 1 run left to right. Key destinations for sources 1–8: 4 8 1 5 7 2 6 3. Reverse arrows to decrypt.</td></tr></tbody></table><h3 class="mt">XOR truth table</h3><table class="ref-table"><thead><tr><th>A</th><th>B</th><th>A ⊕ B</th></tr></thead><tbody>${[[0,0,0],[0,1,1],[1,0,1],[1,1,0]].map(x=>`<tr>${x.map(v=>`<td class="mono">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></section><aside class="side-col"><div class="panel"><h3>Fast memory hooks</h3><p><b>Substitution:</b> Same positions, changed symbols.</p><p><b>Transposition:</b> Same symbols, changed positions.</p><p><b>Monoalphabetic:</b> One mapping; Caesar.</p><p><b>Polyalphabetic:</b> Multiple mappings; Vigenère.</p><p><b>Encryption:</b> Reversible with the correct key.</p><p><b>Hashing:</b> One-way fixed-length digest.</p><p><b>Cryptanalysis:</b> Attempts to understand or defeat protection.</p></div><div class="panel"><h3>Watch out for exam traps</h3><ul class="smalltxt muted"><li>Do not interchange <b>A=1 Vernam</b> and <b>A=0 Vigenère</b>.</li><li>Check the transposition key, numbering direction and block size.</li><li>A pad reused across messages is not a secure one-time pad.</li><li>Hashing is not reversible encryption.</li><li>Modern cryptography is not equivalent to classical toy ciphers.</li></ul></div></aside></div><div class="panel mt"><h3>Source map: where each topic comes from</h3><table class="ref-table"><thead><tr><th>Topic</th><th>Instructional material reference</th><th>Status</th></tr></thead><tbody>${lessons.map(x=>`<tr><td>${E(x.name)}</td><td>${E(x.source)}</td><td><span class="pill ${x.level==='BONUS'?'bonus':'core'}">${x.level}</span></td></tr>`).join('')}</tbody></table><div class="notice purple mt"><b>Reference:</b> ${E(CipherLabReviewer.filename)}, supplied in the IAS2 IM folder. References use the supplied 162-page PDF’s page numbers. All seven units are included. Supplemental explanations retain BONUS labels.</div></div><div class="panel mt"><div class="split"><div><h3>Export or manage your progress</h3><p>Saved locally in this browser, on this device. No account or network connection is required.</p></div><div class="clear-actions"><button class="btn secondary" id="export-progress">Export progress as JSON ↓</button><button class="btn ghost" id="reset-progress">Reset saved progress</button></div></div></div>`}
function bindView(){if(S.route==='missions'&&!S.mission)syncMissionCipherPicker()}
function simulatorKey(data,kind=S.cipher){return kind==='transposition'&&data.method==='keyword'?data.keyword||'':data.key||''}
function transpositionExample(method){return {...defaults.transposition,method,text:method==='permutation'?'ABCDEFGH':method==='numeric'?'CATDOG':'HELLOWORLD'}}
function invalidateSimulation(){
 S.simulation=null;S.transpositionStep=0;
 if(S.route!=='lab')return;
 $('#sim-output').textContent='Run the simulator to reveal the result...';$('#sim-output').classList.add('muted');
 $('#sim-trace').innerHTML='<p>Run the simulation to see the updated worked solution.</p>';
 $('#sim-error').textContent='';$('#copy-output')?.remove();
 for(const field of ['sim-text','sim-key','sim-columns'])$('#'+field)?.removeAttribute('aria-invalid');
}
function updateSimInput(el){
 const d=S.simStore[S.cipher],id=el.id;
 if(id==='sim-text')d.text=el.value;
 if(id==='sim-key'){if(S.cipher==='transposition'&&d.method==='keyword')d.keyword=el.value;else d.key=el.value}
 if(id==='sim-columns')d.columns=el.value;
 if(id==='sim-shift')d.shift=Number(el.value);
 if(id==='sim-number')d.rails=Number(el.value);
 if(id==='rsa-p')d.p=Number(el.value);
 if(id==='rsa-q')d.q=Number(el.value);
 if(S.cipher==='transposition')invalidateSimulation();
}
function runSimulation(){
 try{
  const d=S.simStore[S.cipher],r=simulate(S.cipher,d.text||'',simulatorKey(d),S.mode,{shift:d.shift,rails:d.rails,p:d.p,q:d.q,method:d.method,columns:d.columns});
  S.simulation=r;S.transpositionStep=0;
  $('#sim-output').textContent=r.text;$('#sim-output').classList.remove('muted');$('#sim-trace').innerHTML=simulatorTrace(r);$('#sim-error').textContent='';
  for(const field of ['sim-text','sim-key','sim-columns'])$('#'+field)?.removeAttribute('aria-invalid');
  if(!$('#copy-output')){
   const label=$('.split .input-label',$('#sim-output').parentElement);
   if(label){const btn=document.createElement('button');btn.className='btn ghost small';btn.id='copy-output';btn.textContent='Copy result';label.parentElement.appendChild(btn)}
  }
 }catch(e){
  S.simulation=null;$('#copy-output')?.remove();$('#sim-output').textContent='Please correct the input and try again.';$('#sim-error').textContent=e.message;$('#sim-trace').innerHTML='<p>Correct the input to view the calculation trace.</p>';
  const field=/keyword|key must/.test(e.message)?'sim-key':/number of columns/.test(e.message)?'sim-columns':'sim-text';
  $('#'+field)?.setAttribute('aria-invalid','true');toast('Check input: '+e.message);
 }
}
function doCopy(text){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(()=>toast('Copied to clipboard')).catch(()=>copyFallback(text));else copyFallback(text)}
function copyFallback(text){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('Copied to clipboard')}catch{toast('Select the output and copy manually')}t.remove()}
function downloadFile(name,textData,mime){let blob=new Blob([textData],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function handleClick(event){
 const picker=$('#mission-cipher-picker');if(picker?.open&&!picker.contains(event.target))picker.open=false;
 if(event.target.id==='cipher-explanation'){
  const dialog=event.target,bounds=dialog.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  return;
 }
 let b=event.target.closest('button');if(!b||b.disabled)return;
 if(b.id==='mission-cipher-done'){picker.open=false;picker.querySelector('summary').focus({preventScroll:true});return}
 if(CipherLabStudy.handleClick(b))return;
 if(b.id==='explain-cipher'){openCipherExplanation();return}
 if(b.hasAttribute('data-close-explanation')){$('#cipher-explanation').close();return}
 if(b.dataset.route){nav(b.dataset.route);return}
 if(b.dataset.go){nav(b.dataset.go);return}
 if(b.dataset.lesson!==undefined){S.lesson=Number(b.dataset.lesson);render();return}
 if(b.hasAttribute('data-lesson-prev')){S.lesson=clamp(S.lesson-1,0,lessons.length-1);render();return}
 if(b.hasAttribute('data-lesson-next')){S.lesson=clamp(S.lesson+1,0,lessons.length-1);render();return}
 if(b.id==='menu-toggle'){let opening=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',opening);b.setAttribute('aria-expanded',String(opening));return}
 if(b.id==='theme-toggle'){toggleTheme();return}
 if(b.id==='copy-output'){if(S.simulation)doCopy(S.simulation.text);return}
 if(b.id==='sim-example'){S.simStore[S.cipher]=S.cipher==='transposition'?transpositionExample(S.simStore.transposition.method||'permutation'):{...defaults[S.cipher]};S.mode='encrypt';S.simulation=null;S.transpositionStep=0;render();return}
 if(b.id==='sim-clear'){const data=S.simStore[S.cipher];data.text='';if(S.cipher==='transposition'&&data.method==='keyword')data.keyword='';S.simulation=null;S.transpositionStep=0;render();$('#sim-text').focus();return}
 if(b.id==='transposition-next'){moveTranspositionStep(1);return}
 if(b.id==='transposition-prev'){moveTranspositionStep(-1);return}
 if(b.id==='transposition-reset'){moveTranspositionStep(null);return}
 if(b.id==='sim-swap'){if(!S.simulation){toast('Run the current cipher first to get an output.');return}S.simStore[S.cipher].text=S.simulation.text;S.mode=S.mode==='encrypt'?'decrypt':'encrypt';S.simulation=null;render();return}
 if(b.id==='run-sim'){runSimulation();return}
 if(b.dataset.cipher){S.cipher=b.dataset.cipher;S.mode='encrypt';S.simulation=null;render();return}
 if(b.dataset.mode){S.mode=b.dataset.mode;S.simulation=null;render();return}
 if(b.id==='pad-generate'){let n=onlyLetters(S.simStore.vernam.text).length;if(!n){toast('Enter some letters first.');return}S.simStore.vernam.key=Array.from({length:n},()=>ALPHA[randomIndex(26)]).join('');S.simulation=null;render();toast('Generated a fresh pad for this practice message.');return}
 if(b.id==='alphabet-generate'){S.simStore.mono.key=shuffle(ALPHA.split('')).join('');S.simulation=null;render();return}
 if(b.hasAttribute('data-complete')){let id=lessons[S.lesson].id;if(!progress.completed.includes(id)){progress.completed.push(id);earn(20);toast('Lesson mastered: +20 XP')}render();return}
 if(b.id==='begin-mission'){if(!selectedMissionCiphers().length){syncMissionCipherPicker();return}S.missionGoal=Number($('#mission-count').value);S.missionDifficulty=$('#difficulty-select').value;S.missionCipherQueue=[];S.missionRound=0;S.missionRight=0;S.missionTotal=0;S.mission=generateMission();render();return}
 if(b.id==='mission-hint'){S.mission.showHint=!S.mission.showHint;render();return}
 if(b.id==='check-mission'){let m=S.mission;if(m.answered)return;m.userAnswer=$('#mission-answer').value.trim();if(!m.userAnswer){toast('Type an answer before checking.');return}m.correct=answerMatch(m.type,m.userAnswer,m.target,m.encrypt);m.answered=true;S.missionTotal++;if(m.correct){S.missionRight++;earn(15)}markResult(m.correct);render();return}
 if(b.id==='next-mission'){S.missionRound++;if(S.missionRound<S.missionGoal)S.mission=generateMission();render();return}
 if(b.id==='missions-again'){S.mission=null;render();return}
 if(b.dataset.examLength){S.examLength=Number(b.dataset.examLength);render();return}
 if(b.id==='begin-exam'){startExam(S.examLength);render();return}
 if(b.dataset.choice!==undefined){let i=Number(b.dataset.choice),exam=S.exam;if(Number.isInteger(exam.answers[exam.i]))return;exam.answers[exam.i]=i;let correct=i===exam.items[exam.i].c;markResult(correct);if(correct)earn(10);render();return}
 if(b.id==='exam-next'){let exam=S.exam;exam.i++;if(exam.i>=exam.items.length){exam.finished=true;progress.exams++;let correct=exam.answers.filter((a,i)=>a===exam.items[i].c).length,pct=Math.round(100*correct/exam.items.length);progress.bestExam=Math.max(progress.bestExam,pct);save();if(pct>=90){earn(30);toast('Excellent exam result! Bonus +30 XP')}}render();return}
 if(b.id==='exam-toggle-review'){S.exam.reviewed=!S.exam.reviewed;render();return}
 if(b.id==='restart-exam'){S.exam=null;render();return}
 if(b.id==='flip-card'){S.flashFlipped=!S.flashFlipped;render();return}
 if(b.id==='flash-prev'){S.flashIndex=mod(S.flashIndex-1,flashcards.length);S.flashFlipped=false;render();return}
 if(b.id==='flash-next'){S.flashIndex=(S.flashIndex+1)%flashcards.length;S.flashFlipped=false;render();return}
 if(b.id==='flash-master'){const n=S.flashIndex;if(progress.flashMastered.includes(n))progress.flashMastered=progress.flashMastered.filter(x=>x!==n);else{progress.flashMastered.push(n);earn(5);toast('+5 XP for a mastered flashcard')}save();render();return}
 if(b.id==='analyze-text'){S.analysisResults=analyzeCaesar(S.analysisText);render();return}
 if(b.id==='analysis-example'){S.analysisText=shiftCipher('THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THE SECRET MESSAGE',3,false).text;S.analysisResults=analyzeCaesar(S.analysisText);render();return}
 if(b.dataset.pickShift!==undefined){let chosen=shiftCipher(S.analysisText,Number(b.dataset.pickShift),true).text;doCopy(chosen);toast(`Candidate shift ${b.dataset.pickShift}: copied plaintext`);return}
 if(b.id==='export-progress'){downloadFile('cipherlab-progress.json',JSON.stringify({...progress,exportedAt:new Date().toISOString()},null,2),'application/json');toast('Progress file generated');return}
 if(b.id==='reset-progress'){if(confirm('Reset all saved lessons, scores, XP and flashcards? This cannot be undone.')){let theme=progress.theme;progress={...freshProgress(),theme};save();render();toast('Progress reset.')}return}
}
document.addEventListener('click',handleClick);
document.addEventListener('toggle',e=>{
 if(e.target.id!=='mission-cipher-picker'||!e.target.open)return;
 if($('#mission-cipher-options').getBoundingClientRect().bottom>window.innerHeight-12)e.target.scrollIntoView({block:'start',behavior:'instant'});
},true);
document.addEventListener('input',e=>{const el=e.target;if(CipherLabStudy.handleInput(el))return;if(['sim-text','sim-key','sim-columns','sim-shift','sim-number','rsa-p','rsa-q'].includes(el.id)){updateSimInput(el)}if(el.id==='analysis-input')S.analysisText=el.value;if(el.id==='mission-answer'&&S.mission)S.mission.userAnswer=el.value});
document.addEventListener('change',e=>{
 if(CipherLabStudy.handleChange(e.target))return;
 if(e.target.id==='sim-method'){S.simStore.transposition.method=e.target.value;S.simulation=null;S.transpositionStep=0;render();$('#sim-method').focus();return}
 if(e.target.id==='mission-cipher-all')setMissionCipherChecked('all',e.target.checked);
 if(e.target.hasAttribute('data-mission-cipher'))setMissionCipherChecked(e.target.value,e.target.checked);
 if(e.target.id==='difficulty-select')S.missionDifficulty=e.target.value;
 if(e.target.id==='mission-count')S.missionGoal=Number(e.target.value);
 if(['rsa-p','rsa-q'].includes(e.target.id))updateSimInput(e.target);
 if(e.target.id==='exam-topic'){S.examTopic=e.target.value;render()}
 if(e.target.id==='exam-scope'){S.examScope=e.target.value;render()}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const picker=$('#mission-cipher-picker');if(picker?.open){picker.open=false;picker.querySelector('summary').focus({preventScroll:true});e.preventDefault()}}if(e.key==='Enter'&&e.target.id==='mission-answer'&&!S.mission?.answered){e.preventDefault();$('#check-mission')?.click()}if((e.key===' '||e.key==='Enter')&&e.target.classList?.contains('flash-card')){e.preventDefault();e.target.click()}});
function selfTest(){const checks=[['Caesar encrypt',shiftCipher('HELLO',3,false).text==='KHOOR'],['Caesar decrypt',shiftCipher('KHOOR',3,true).text==='HELLO'],['Vernam A1',pairedLetters('CAT','DOG','vernam',false).text==='GPA'],['Vernam decryption',pairedLetters('GPA','DOG','vernam',true).text==='CAT'],['Vigenere classic',pairedLetters('ATTACKATDAWN','LEMON','vigenere',false).text==='LXFOPVEFRNHR'],['Vigenere decrypt',pairedLetters('LXFOPVEFRNHR','LEMON','vigenere',true).text==='ATTACKATDAWN'],['Numeric columnar',columnarCipher('CATDOG',3,false).text==='CDAOTG'],['Numeric columnar inverse',columnarCipher('CDAOTG',3,true).text==='CATDOG'],['Keyword columnar',columnarCipher('HELLOWORLD','ZEBRA',false).text==='ODLREOLLHW'],['Keyword columnar inverse',columnarCipher('ODLREOLLHW','ZEBRA',true).text==='HELLOWORLD'],['Transposition PDF key',transpositionCipher('ABCDEFGH',TRANSPOSITION_KEY,false).text==='GDBEHACF'],['Transposition inverse',transpositionCipher('GDBEHACF',TRANSPOSITION_KEY,true).text==='ABCDEFGH'],['XOR CAT V',xorCipher('CAT','V',false).text==='15 17 02'],['XOR reverse',xorCipher('15 17 02','V',true).text==='CAT'],['Atbash',atbash('HELLO').text==='SVOOL'],['Mono reverse',monoCipher(monoCipher('HELLO','QWERTYUIOPASDFGHJKLZXCVBNM',false).text,'QWERTYUIOPASDFGHJKLZXCVBNM',true).text==='HELLO'],['Rail roundtrip',railCipher(railCipher('HELLOWORLD',3,false).text,3,true).text==='HELLOWORLD'],['Playfair encrypt',playfairCipher('HIDETHEGOLDINTHETREESTUMP','PLAYFAIR EXAMPLE',false).text==='BMODZBXDNABEKUDMUIXMMOUVIF'],['Playfair decrypt',playfairCipher('BMODZBXDNABEKUDMUIXMMOUVIF','PLAYFAIR EXAMPLE',true).text==='HIDETHEGOLDINTHETREXESTUMP'],['RSA roundtrip',rsaCipher(rsaCipher('CAT',11,13,false).text,11,13,true).text==='CAT']];return checks}
window.CipherLabTest={selfTest,simulate,examBank,answerMatch,restoreProgress,playfairCipher,shiftCipher,transpositionCipher,columnarCipher,pairedLetters,xorCipher,railCipher,rsaCipher,monoCipher,atbash};
CipherLabStudy.connect({
 simulate,renderSolution:solution=>CipherLabSolutions.render(solution),getProgress:()=>progress,render,
 onQuizAnswer(correct){markResult(correct);if(correct)earn(10)},
 onQuizFinished(report){progress.cardQuizSessions++;progress.cardQuizBest=Math.max(progress.cardQuizBest,report.percent);save()},
 onCipherFinished(report){progress.cipherExamSessions++;progress.cipherExamBest=Math.max(progress.cipherExamBest,report.percent);progress.attempts+=report.total;progress.correct+=report.correct;progress.xp+=report.correct*15;save()}
});
let themeTransition=null;
function toggleTheme(){
 progress.theme=progress.theme==='dark'?'light':'dark';
 save();
 // Read the latest choice inside delayed callbacks so rapid clicks stay in sync.
 const update=()=>applyTheme(progress.theme);
 themeTransition?.skipTransition();
 if(!document.startViewTransition||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  update();
  return;
 }
 const root=document.documentElement;
 root.classList.add('theme-transitioning');
 const transition=document.startViewTransition(update);
 themeTransition=transition;
 // Skipping an interrupted transition rejects ready, even when its update succeeds.
 transition.ready.catch(()=>{});
 const finish=()=>{
  if(themeTransition!==transition)return;
  themeTransition=null;
  root.classList.remove('theme-transitioning');
 };
 transition.finished.then(finish,finish);
}
function applyTheme(theme){
 const light=theme==='light';
 progress.theme=light?'light':'dark';
 document.documentElement.dataset.theme=progress.theme;
 document.body.dataset.theme=progress.theme;
 document.querySelector('meta[name="theme-color"]').content=light?'#f4f7fb':'#0c1220';
 const toggle=$('#theme-toggle');
 const label=light?'Switch to dark mode':'Switch to light mode';
 toggle.setAttribute('aria-label',label);
 toggle.title=label;
 toggle.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${light?'<path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z"/>':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42M6.35 17.65l-1.42 1.42"/>'}</svg>`;
}
applyTheme(progress.theme);render();
