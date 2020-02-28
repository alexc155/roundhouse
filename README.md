[![Build Status](https://travis-ci.org/alexc155/roundhouse.svg?branch=master)](https://travis-ci.org/alexc155/roundhouse)
[![Coverage Status](https://coveralls.io/repos/github/alexc155/roundhouse/badge.svg?branch=master)](https://coveralls.io/github/alexc155/roundhouse?branch=master)
[![dependencies Status](https://david-dm.org/alexc155/roundhouse/status.svg)](https://david-dm.org/alexc155/roundhouse)
[![devDependencies Status](https://david-dm.org/alexc155/roundhouse/dev-status.svg)](https://david-dm.org/alexc155/roundhouse?type=dev)

# roundhouse
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

## Notes:
* Not all options from the Windows Roundhouse project are implemented - only those above.
* Migration will happen as soon as you run - there is no prompt to press a key.
* The utility will create a schema and 3 new tables in your database to track progress.
* This utility _should_ run happily alongside the Windows project, but this is untested.
* No log files are generated of the changes, however entries are made into the RoundhousE.ScriptRun table.
* It's not great at handling the word 'go' in a comment... Sorry

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