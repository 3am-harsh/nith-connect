const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'src', 'app', 'dashboard-client.tsx');
const code = fs.readFileSync(filepath, 'utf8');

let braces = 0;
let parens = 0;
let tagStack = [];
let lines = code.split('\n');

// A very basic parser to find unbalanced braces
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
  }
  if (braces < 0) {
    console.log(`Error: Extra closing brace at line ${i + 1}`);
    braces = 0; // reset to continue
  }
  if (parens < 0) {
    console.log(`Error: Extra closing parenthesis at line ${i + 1}`);
    parens = 0; // reset to continue
  }
}

console.log(`Final counts: braces remaining open = ${braces}, parens remaining open = ${parens}`);
