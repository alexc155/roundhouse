'use strict';
const path = require('path');
const { existsSync, readdirSync, readFileSync } = require('fs');
const { checkScriptHash, executeScript } = require('./database');
const { filterScriptsToEnvironment } = require('./scripts-utils');
const { createHash, getFileEncoding } = require('./hash-generator');
const { log } = require('../utils');

const migrationSteps = [
  { order: 1, name: 'AlterDatabase', path: 'alterDatabase', type: 'AnyTime' },
  { order: 2, name: 'Run Before Update', path: 'runBeforeUp', type: 'AnyTime' },
  { order: 3, name: 'Update', path: 'up', type: 'OneTime' },
  { order: 4, name: 'Run First After Update', path: 'runFirstAfterUp', type: 'AnyTime' },
  { order: 5, name: 'Function', path: 'functions', type: 'AnyTime' },
  { order: 6, name: 'View', path: 'views', type: 'AnyTime' },
  { order: 7, name: 'Stored Procedure', path: 'sprocs', type: 'AnyTime' },
  { order: 8, name: 'Index', path: 'indexes', type: 'AnyTime' },
  { order: 9, name: 'Run after Other Anytime Scripts', path: 'runAfterOtherAnyTimeScripts', type: 'AnyTime' },
  { order: 10, name: 'Permission', path: 'permissions', type: 'EveryTime' }
];

const runAnyTimeScript = async scriptParams => {
  const contents = readFileSync(scriptParams.path, getFileEncoding(scriptParams.path));
  const scriptHash = createHash(contents, false);
  const scriptHashCheck = await checkScriptHash(scriptParams, scriptParams.filename, scriptHash);
  if (
    (scriptHashCheck.result && scriptHashCheck.result === 'Not Run') ||
    (scriptHashCheck.result && scriptHashCheck.result === 'Changed') ||
    scriptParams.runAllAnyTimeScripts ||
    scriptParams.path.toUpperCase().indexOf('.EVERYTIME.') > 0
  ) {
    return await executeScript({ hash: scriptHash, ...scriptParams }, contents);
  }
  return true;
};

const runOneTimeScript = async scriptParams => {
  const contents = readFileSync(scriptParams.path, getFileEncoding(scriptParams.path));
  const scriptHash = createHash(contents, false);
  const scriptHashCheck = await checkScriptHash(scriptParams, scriptParams.filename, scriptHash);
  if (
    (scriptHashCheck.result && scriptHashCheck.result === 'Not Run') ||
    scriptParams.warnAndIgnoreOnOneTimeScriptChanges
  ) {
    return await executeScript({ hash: scriptHash, ...scriptParams }, contents);
  }
  return true;
};

const runEveryTimeScript = async scriptParams => {
  const contents = readFileSync(scriptParams.path, getFileEncoding(scriptParams.path));
  const scriptHash = createHash(contents, false);
  return await executeScript({ hash: scriptHash, ...scriptParams }, contents);
};

const runMigrationScript = async scriptParams => {
  if (scriptParams.type === 'AnyTime') {
    return await runAnyTimeScript(scriptParams);
  } else if (scriptParams.type === 'OneTime') {
    return await runOneTimeScript(scriptParams);
  } else if (scriptParams.type === 'EveryTime') {
    return await runEveryTimeScript(scriptParams);
  }
  throw Error(`Message type not reognized: \n${scriptParams}`);
};

const runScripts = async (config, version) => {
  try {
    log.info('==================================================');
    log.info('Migration Scripts');
    log.info('==================================================');
    const sequencedMigrationSteps = migrationSteps.sort((a, b) => a.order - b.order);
    for (const step of sequencedMigrationSteps) {
      log.info('--------------------------------------------------');
      log.info(`Looking for ${step.name} scripts in ".\\${step.path}".`);
      if (existsSync(path.join(process.cwd(), config.sqlFilesDirectory, `./${step.path}`))) {
        const scripts = readdirSync(path.join(process.cwd(), config.sqlFilesDirectory, `./${step.path}`)).map(
          file => ({
            path: path.join(process.cwd(), config.sqlFilesDirectory, `./${step.path}/`, file),
            filename: file
          })
        );
        const environmentSpecificScripts = filterScriptsToEnvironment(config.environment, scripts);
        for (const script of environmentSpecificScripts) {
          const scriptResult = await runMigrationScript({
            type: step.type,
            version,
            ...script,
            ...config
          });
          if (scriptResult !== true) {
            throw Error(scriptResult);
          }
        }
      }
      log.info('--------------------------------------------------');
    }
    return true;
  } catch (error) {
    return error.message;
  }
};

module.exports = { runScripts };
