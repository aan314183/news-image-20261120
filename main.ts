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
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

copyFileSync(source, target);
const digest = createHash('sha256').update(readFileSync(target)).digest('hex');
console.log(`wrote ${target} (${info.size} bytes, ${width}x${height}, sha256 ${digest})`);
