'use strict';
const { openSync, readSync, closeSync } = require('fs');
const md5 = require('js-md5');

const createHash = (str, normalizeLineEndings) => {
  let input = str.replace(/'/g, "''");
  if (normalizeLineEndings) {
    input = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  const bytes = Buffer.from(input, 'utf8');

  const hash = md5.create();
  hash.update([...bytes].slice(3));

  const ret = hash.base64();
  return ret;
};

const getFileEncoding = file => {
  const buffer = Buffer.alloc(5, [0, 0, 0, 0, 0]);
  const fd = openSync(file, 'r');
  readSync(fd, buffer, 0, 5, 0);
  closeSync(fd);

  let enc = 'ascii';

  // https://en.wikipedia.org/wiki/Byte_order_mark

  if (buffer.slice(0, 3).join() == Buffer.from([0xef, 0xbb, 0xbf]).join()) {
    enc = 'utf8';
  } else if (buffer.slice(0, 2).join() == Buffer.from([0xfe, 0xff]).join()) {
    enc = 'utf16be'; // UTF-16 BE
  }
  if (buffer.slice(0, 2).join() == Buffer.from([0xff, 0xfe]).join()) {
    if (buffer.slice(2, 4).join() == Buffer.from([0, 0]).join()) {
      enc = 'utf32le'; // UTF-32 LE
    } else {
      enc = 'utf16le'; // UTF-16 LE
    }
  } else if (buffer.slice(0, 4).join() == Buffer.from([0, 0, 0xfe, 0xff]).join()) {
    enc = 'utf32be'; // UTF-32 BE
  } else if (buffer.slice(0, 3).join() == Buffer.from([0x2b, 0x2f, 0x76]).join()) {
    enc = 'utf7';
  }

  return enc;
};

module.exports = {
  createHash,
  getFileEncoding
};
