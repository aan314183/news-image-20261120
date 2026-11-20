// Entry program for the make.fun news-image-20261120 bounty.
//
// The front page is finished artwork, built in the build directory from a
// generated cyclone banner plus ffmpeg drawtext. This program only verifies
// the shipped image is a whole PNG inside the gate's size cap and copies it
// to the grader's output directory. It never touches the network and draws
// nothing at run time, so both graded runs write identical bytes. The
// output path comes from MAKEFUN_OUTPUT_DIR outside the grader.

import { copyFileSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1048576;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// CRC32 of the ASCII string "IEND" (the trailer chunk has no data).
const IEND_CRC = 0xae426082;

// CRC32 (IEEE 802.3, polynomial 0xedb88320), built from a lookup table so
// no external dependency is needed.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

const info = statSync(source);
if (info.size === 0 || info.size > MAX_BYTES) {
  throw new Error(`entry.png is ${info.size} bytes, outside the 1 MiB cap`);
}

const bytes = readFileSync(source);
// The first eight bytes of every PNG are fixed; anything else is not a PNG.
if (!bytes.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
  throw new Error('entry.png does not start with the PNG signature');
}
// A minimal whole PNG is 8 signature bytes + 25 IHDR bytes + 12 IEND bytes.
if (bytes.length < 45 || !bytes.subarray(12, 16).equals(Buffer.from('IHDR'))) {
  throw new Error('entry.png is not a whole PNG (missing/invalid IEND)');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

// The first chunk must be IHDR (13 data bytes), and its stored CRC must
// match the CRC32 of the chunk type plus chunk data.
if (bytes.readUInt32BE(8) !== 13) {
  throw new Error('entry.png has a malformed IHDR chunk');
}
const ihdrCrc = crc32(Buffer.concat([bytes.subarray(12, 16), bytes.subarray(16, 29)]));
if (ihdrCrc !== bytes.readUInt32BE(29)) {
  throw new Error('entry.png IHDR CRC mismatch');
}

// A whole PNG ends with a 12-byte IEND chunk: zero length, the "IEND"
// type, and the CRC32 of "IEND". Anything else means the file is cut off.
const tail = bytes.subarray(bytes.length - 12);
if (
  tail.readUInt32BE(0) !== 0 ||
  !tail.subarray(4, 8).equals(Buffer.from('IEND')) ||
  tail.readUInt32BE(8) !== IEND_CRC
) {
  throw new Error('entry.png is not a whole PNG (missing/invalid IEND)');
}

copyFileSync(source, target);
const digest = createHash('sha256').update(readFileSync(target)).digest('hex');
console.log(`wrote ${target} (${info.size} bytes, ${width}x${height}, sha256 ${digest})`);
