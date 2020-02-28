'use strict';
const cloneDeep = require('lodash/cloneDeep');
const { log } = require('../utils');
const { testConnection, updateVersion } = require('./database');
const baseConfig = require('../config/rh-base-config.json');
const { initRoundhouse } = require('./roundhouse');
const { checkOneTimeScriptsForUnexpectedChanges } = require('./one-time-scripts');
const { runScripts } = require('./script-runner');

const parseArgsIntoConfig = (args, baseConfig) => {
  const config = cloneDeep(baseConfig);
  args.forEach(arg => {
    switch (arg.key.toLowerCase()) {
      case '-c':
      case '--cs':
      case '--connstring':
        config.connString = arg.value;
        break;
      case '-f':
      case '--files':
      case '--sqlfilesdirectory':
        config.sqlFilesDirectory = arg.value;
        break;
      case '--env':
      case '--environment':
      case '--environmentname':
        config.environment = arg.value;
        break;
      case '-w':
      case '--warnononetimescriptchanges':
        if (!arg.value || arg.value.toLowerCase() !== 'false') {
          config.warnOnOneTimeScriptChanges = true;
        }
        break;
      case '--warnandignoreononetimescriptchanges':
        if (!arg.value || arg.value.toLowerCase() !== 'false') {
          config.warnAndIgnoreOnOneTimeScriptChanges = true;
        }
        break;
      case '--disableoutput':
        if (!arg.value || arg.value.toLowerCase() !== 'false') {
          config.disableOutput = true;
        }
        break;
      case '--runallanytimescripts':
        if (!arg.value || arg.value.toLowerCase() !== 'false') {
          config.runAllAnyTimeScripts = true;
        }
        break;
      case '--dryrun':
        if (!arg.value || arg.value.toLowerCase() !== 'false') {
          config.dryRun = true;
        }
        break;
      default:
        log.error('Unknown config param - ', arg.key);
        break;
    }
  });
  return config;
};

const migrate = async args => {
  const config = parseArgsIntoConfig(args, baseConfig);
  const SQLOK = await testConnection(config);
  if (SQLOK !== true) {
    log.error('Database connection failure!', config.connString, SQLOK);
    return false;
  }

  // Setup RH tables
  const rhOK = await initRoundhouse(config);
  if (rhOK !== true) {
    log.error('Roundhouse table init failure!', rhOK);
    return false;
  }

  // Warn if one-time scripts have changed
  const oneTimeScriptsUnexpectedChanges = await checkOneTimeScriptsForUnexpectedChanges(config);
  if (
    oneTimeScriptsUnexpectedChanges !== true &&
    !config.warnOnOneTimeScriptChanges &&
    !config.warnAndIgnoreOnOneTimeScriptChanges
  ) {
    log.error(oneTimeScriptsUnexpectedChanges);
    return false;
  }

  // Version
  const versionResult = await updateVersion(config);
  if (!Number.isInteger(versionResult)) {
    log.error(versionResult);
    return false;
  }

  // Run scripts
  const scriptRunResult = await runScripts(config, versionResult);
  if (scriptRunResult !== true) {
    log.error(scriptRunResult);
    return false;
  }
  return true;
};

module.exports = {
  migrate
};
