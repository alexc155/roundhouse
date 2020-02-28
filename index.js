#! /usr/bin/env node
'use strict';

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const { log } = require('./utils');
const { migrate } = require('./services/migrate');

const showHelp = () => {
  log.info(`
  Database Migration Utility using sql files and versioning based on source control.

  RoundhousE (RH) is a database migrations engine that uses plain old SQL Scripts to transition a database from one version to another.

  This is a node service replicating some of the functionality from the Windows project found here - https://github.com/chucknorris/roundhouse/wiki

  Available commands: (More info here: https://github.com/chucknorris/roundhouse/wiki/ConfigurationOptions)

    --help | -h
      This info
    
    --ConnString | --cs | -c
      Connection string to the database. REQUIRED
      Example: mssql://sa:P@ssw0rd@localhost:3341/Roundhouse_Local

    --SqlFilesDirectory | --Files | -f
      Base location of SQL files. Default: ./sql

    --Environment | --EnvironmentName | --env
      Which environment token to use for scripts. Default: LOCAL
      If SQL files are named in the pattern LOCAL.something**.ENV.sql then the script will not run is another environment is specified.
      Environment tokens can be chained in the file name e.g. LOCAL.INTEGRATION.run_me.ENV.sql

    --WarnOnOneTimeScriptChanges | -w
      Generate a warning rather than stopping with an error if a One-Time script has changed since it was ran. Still skip the file from running again though.
      Default: false

    --WarnAndIgnoreOnOneTimeScriptChanges
      Generate a warning rather than stopping with an error if a One-Time script has changed since it was ran. Re-run the script though.
      Default: false

    --RunAllAnyTimeScripts
      Even if an Any-Time script has been run before, run it again.
      Default: false

    --DryRun
      Don't run any of the scripts in the database - just show what would happen.
      Default: false


  Example usage:
    $ rh -c=mssql://sa:P@ssw0rd@localhost:3341/Roundhouse_Local -f=./sql --env=LOCAL --RunAllAnyTimeScripts --DryRun

  Notes:
    * Not all options from the Windows Roundhouse project are implemented - only those above.
    * Migration will happen as soon as you run - there is no prompt to press a key.
    * The utility will create a schema and 3 new tables in your database to track progress.
    * This utility _should_ run happily alongside the Windows project, but this is untested.
    * No log files are generated of the changes, however entries are made into the RoundhousE.ScriptRun table.
    * It's not great at handling the word 'go' in a comment... Sorry
`);
};

const main = () => {
  updateNotifier({
    pkg,
    updateCheckInterval: 0
  }).notify({
    isGlobal: true
  });

  const runKeys = ['-c', '--cs', '--connstring'];
  let run = false;

  const args = process.argv.slice(2).map(arg => {
    const keyAndValue = arg.split('=');
    if (runKeys.includes(keyAndValue[0].toLowerCase())) {
      run = true;
    }
    return { key: keyAndValue[0], value: keyAndValue[1] };
  });

  if (run) {
    migrate(args).then(result => {
      if (!result) {
        process.exit(1);
      }
      log.info('==================================================');
      log.info('Done.');
      process.exit(0);
    });
    return;
  }
  showHelp();
};

main();