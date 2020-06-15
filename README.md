[![NPM Version](https://img.shields.io/npm/v/roundhouse.svg?style=flat-square)](https://www.npmjs.com/package/roundhouse)
[![License](https://img.shields.io/npm/l/roundhouse)](https://www.npmjs.com/package/roundhouse)
[![NPM Downloads](https://img.shields.io/npm/dm/roundhouse.svg?style=flat-square)](https://www.npmjs.com/package/roundhouse)
[![Build Status](https://travis-ci.org/alexc155/roundhouse.svg?branch=master)](https://travis-ci.org/alexc155/roundhouse)
[![Node.js CI](https://github.com/alexc155/roundhouse/workflows/Node.js%20CI/badge.svg)](https://github.com/alexc155/roundhouse/actions?query=workflow%3A%22Node.js+CI%22)
[![Coverage Status](https://coveralls.io/repos/github/alexc155/roundhouse/badge.svg?branch=master)](https://coveralls.io/github/alexc155/roundhouse?branch=master)

[![dependencies Status](https://david-dm.org/alexc155/roundhouse/status.svg)](https://david-dm.org/alexc155/roundhouse)
[![devDependencies Status](https://david-dm.org/alexc155/roundhouse/dev-status.svg)](https://david-dm.org/alexc155/roundhouse?type=dev)

[![GitHub language count](https://img.shields.io/github/languages/count/alexc155/roundhouse)](https://www.github.com/alexc155/roundhouse)
[![GitHub top language](https://img.shields.io/github/languages/top/alexc155/roundhouse)](https://www.github.com/alexc155/roundhouse)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/alexc155/roundhouse)](https://www.github.com/alexc155/roundhouse)
[![GitHub repo size](https://img.shields.io/github/repo-size/alexc155/roundhouse)](https://www.github.com/alexc155/roundhouse)
[![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/alexc155/roundhouse)](https://www.codefactor.io/repository/github/alexc155/roundhouse)

# Roundhouse

Database Migration Utility using sql files and versioning based on source control.

RoundhousE (RH) is a database migrations engine that uses plain old SQL Scripts to transition a database from one version to another.

This is a node service replicating some of the functionality from the Windows project found here - https://github.com/chucknorris/roundhouse/wiki

## Installation

```
$ npm install -g roundhouse
```

## Usage
### Available commands: 
(More info here: https://github.com/chucknorris/roundhouse/wiki/ConfigurationOptions)

```
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
```

### Example usage:

`$ rh -c=mssql://sa:P@ssw0rd@localhost:3341/Roundhouse_Local -f=./sql --env=LOCAL --RunAllAnyTimeScripts --DryRun`

If you want to run RoundhousE directly from code, you can do something like this:

```javascript
#! /usr/bin/env node
const { migrate } = require('./node_modules/roundhouse/services/migrate');

const connString = `mssql://${sqlUser}:${sqlPassword}@${dbServer}/${dbName}`;
const args = [
  { key: '--connstring', value: connString },
  { key: '--files', value: './database-migration' },
  { key: '--env', value: 'LOCAL' }
];

migrate(args);

```

## Notes:
* Not all options from the Windows Roundhouse project are implemented - only those above.
* Migration will happen as soon as you run - there is no prompt to press a key.
* The utility will create a schema and 3 new tables in your database to track progress.
* This utility _should_ run happily alongside the Windows project, but this is untested.
* No log files are generated of the changes, however entries are made into the RoundhousE.ScriptRun table.

## Tests

```
$ npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

- 0.1.0 Registration of package.
- 1.0.0 Initial release.
- 1.0.1 Update dependencies.
- 1.0.2 Tidying Hash Generator.
- 1.0.3 Complete test coverage.
- 1.0.4 Fix problem with 'go' in comments.
- 1.0.6 Merged [Fix run anytime scripts if they have changed](https://github.com/alexc155/roundhouse/pull/2)