'use strict';

const sinon = require('sinon');

const sut = require('./');

describe('#utils', () => {
  it('logs info messages', function() {
    const consoleLog = console.log;
    console.log = function() {};
    sinon.spy(console, 'log');
    sut.log.info('INFO');
    expect(console.log.calledWith('INFO')).toBeTruthy();
    console.log.restore();
    console.log = consoleLog;
  });

  it('logs error messages', () => {
    const consoleError = console.error;
    console.error = function() {};
    sinon.spy(console, 'error');
    sut.log.error('ERROR');
    expect(console.error.calledWith('ERROR')).toBeTruthy();
    console.error.restore();
    console.error = consoleError;
  });
});
