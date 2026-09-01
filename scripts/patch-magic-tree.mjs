import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('node_modules/magic-tree-qr-upstream/src/main.jsx');
const before = 'if (_0x2d9aad <= 0 || _0x153546 !== 0) {';
const after = 'if (_0x2d9aad <= 0 || (_0x153546 !== 0 && _0x153546 !== 3)) {';

if (!fs.existsSync(file)) {
  throw new Error(`Magic Tree upstream source not found: ${file}`);
}

const source = fs.readFileSync(file, 'utf8');

if (source.includes(after)) {
  console.log('Magic Tree palette patch already applied.');
  process.exit(0);
}

if (!source.includes(before)) {
  throw new Error('Expected upstream palette condition was not found; refusing to apply an unsafe patch.');
}

fs.writeFileSync(file, source.replace(before, after));
console.log('Patched Magic Tree custom palette support for Spring and Winter.');
