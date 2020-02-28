'use strict';
const path = require('path');
const { existsSync, readdirSync, readFileSync } = require('fs');
const { createHash, getFileEncoding } = require('./hash-generator');
const { checkScriptHash } = require('./database');
const { filterScriptsToEnvironment } = require('./scripts-utils');
const { log } = require('../utils');

const checkOneTimeScriptsForUnexpectedChanges = async config => {
  try {
    log.info('==================================================');
    log.info('Checking one-time scripts for unexpected changes...');
    let scriptPath = path.join(process.cwd(), config.sqlFilesDirectory, './up');
    const upScripts = existsSync(scriptPath)
      ? readdirSync(scriptPath).map(file => ({
          path: path.join(scriptPath, file),
          filename: file
        }))
      : [];

    scriptPath = path.join(process.cwd(), config.sqlFilesDirectory, './runAfterCreateDatabase');
    const runAfterCreateDatabaseScripts = existsSync(scriptPath)
      ? readdirSync(scriptPath).map(file => ({
          path: path.join(scriptPath, file),
          filename: file
        }))
      : [];

    const oneTimeScripts = upScripts.concat(runAfterCreateDatabaseScripts);

    const environmentSpecificOneTimeScripts = filterScriptsToEnvironment(config.environment, oneTimeScripts);

    for (const oneTimeScript of environmentSpecificOneTimeScripts) {
      const contents = readFileSync(oneTimeScript.path, getFileEncoding(oneTimeScript.path));
      let scriptHash = createHash(contents, false);
      let scriptHashCheck = await checkScriptHash(config, oneTimeScript.filename, scriptHash);
      if (scriptHashCheck.result && scriptHashCheck.result === 'Changed') {
        scriptHash = createHash(contents, true);
        scriptHashCheck = await checkScriptHash(config, oneTimeScript.filename, scriptHash);
        if (scriptHashCheck.result && scriptHashCheck.result === 'Changed') {
          return `${oneTimeScript.filename} has been changed`;
        }
      }
    }

    return true;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  checkOneTimeScriptsForUnexpectedChanges
};
