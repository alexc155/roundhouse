'use strict';
const { writeFileSync } = require('fs');
const mockFs = require('mock-fs');
const sut = require('./hash-generator');

beforeAll(() => {
  mockFs({ './': {} });
  writeFileSync('./utf8', '\ufeffTest', 'utf8');
  writeFileSync('./utf16le', '\ufeffTest', 'utf16le');
  writeFileSync('./ascii', 'Test', 'ascii');
  writeFileSync('./utf16be', Buffer.from([0xfe, 0xff]));
  writeFileSync('./utf32le', Buffer.from([0xff, 0xfe, 0, 0]));
  writeFileSync('./utf32be', Buffer.from([0, 0, 0xfe, 0xff]));
  writeFileSync('./utf7', Buffer.from([0x2b, 0x2f, 0x76]));
});

afterAll(() => {
  mockFs.restore();
});

describe('hash-generator', () => {
  describe('getFileEncoding', () => {
    it('returns utf8 for a utf8 file', () => {
      const actual = sut.getFileEncoding('./utf8');
      expect(actual).toBe('utf8');
    });
    it('returns utf16be for a utf16be file', () => {
      const actual = sut.getFileEncoding('./utf16be');
      expect(actual).toBe('utf16be');
    });
    it('returns utf32le for a utf32le file', () => {
      const actual = sut.getFileEncoding('./utf32le');
      expect(actual).toBe('utf32le');
    });
    it('returns utf16le for a utf16le file', () => {
      const actual = sut.getFileEncoding('./utf16le');
      expect(actual).toBe('utf16le');
    });
    it('returns utf32be for a utf32be file', () => {
      const actual = sut.getFileEncoding('./utf32be');
      expect(actual).toBe('utf32be');
    });
    it('returns utf7 for a utf7 file', () => {
      const actual = sut.getFileEncoding('./utf7');
      expect(actual).toBe('utf7');
    });
    it('returns ascii for a ascii file', () => {
      const actual = sut.getFileEncoding('./ascii');
      expect(actual).toBe('ascii');
    });
  });
  describe('createHash', () => {
    it('creates an MD5 hash', () => {
      const actual = sut.createHash('The quick \r\nbrown fox', false);
      expect(actual).toBe('S6NiIg0LMS6TnjoownCh5A==');
    });
    it('creates an MD5 hash', () => {
      const actual = sut.createHash('The quick \r\nbrown fox', true);
      expect(actual).toBe('EQ9/V0I3CcM+qsnHqDWttQ==');
    });
  });
});
