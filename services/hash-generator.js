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
  const buffer = new Buffer.alloc(5, [0, 0, 0, 0, 0]);
  const fd = openSync(file, 'r');
  readSync(fd, buffer, 0, 5, 0);
  closeSync(fd);

  let enc = 'ascii';

  // https://en.wikipedia.org/wiki/Byte_order_mark

  if (buffer[0] == 0xef && buffer[1] == 0xbb && buffer[2] == 0xbf) {
    enc = 'utf8';
  } else if (buffer[0] == 0xfe && buffer[1] == 0xff) {
    enc = 'utf16be'; // UTF-16 BE
  }
  if (buffer[0] == 0xff && buffer[1] == 0xfe) {
    if (buffer[2] == 0 && buffer[3] == 0) {
      enc = 'utf32le'; // UTF-32 LE
    } else {
      enc = 'utf16le'; // UTF-16 LE
    }
  } else if (buffer[0] == 0 && buffer[1] == 0 && buffer[2] == 0xfe && buffer[3] == 0xff) {
    enc = 'utf32be'; // UTF-32 BE
  } else if (buffer[0] == 0x2b && buffer[1] == 0x2f && buffer[2] == 0x76) {
    enc = 'utf7';
  }

  return enc;
};

module.exports = {
  createHash,
  getFileEncoding
};
