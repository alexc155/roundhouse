'use strict';
const os = require('os');
const path = require('path');
const { readFileSync } = require('fs');
const sql = require('mssql');
const { log } = require('../utils');

const testConnection = async config => {
  try {
    await sql.connect(config.connString);
    const serverExists = await sql.query('SELECT 1+1 AS test');
    if (serverExists.recordset.length === 1) {
      await sql.close();
      return true;
    }
    await sql.close();
    return false;
  } catch (error) {
    return error.message;
  }
};

const createSchema = async config => {
  try {
    await sql.connect(config.connString);
    log.info(`Creating RoundhousE schema if it doesn't exist.`);
    await sql.batch(
      `IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'RoundhousE') EXEC('CREATE SCHEMA RoundhousE');`
    );
    await sql.close();
    return true;
  } catch (error) {
    return error.message;
  }
};

const createRHTables = async config => {
  try {
    await sql.connect(config.connString);
    log.info(`Creating [Version], [ScriptsRun], and [ScriptsRunErrors] tables if they don't exist.`);

    const initScript = readFileSync(path.join(__dirname, '../sql/init.sql'), { encoding: 'utf8' });
    const rhOK = await sql.query(initScript);
    if (rhOK.recordset.length === 1) {
      await sql.close();
      return true;
    }

    await sql.close();
    return 'Creating RH tables failed for an unknown reason';
  } catch (error) {
    return error.message;
  }
};

const checkScriptHash = async (config, scriptName, hash) => {
  try {
    await sql.connect(config.connString);
    log.info(`Checking One-Time Script ${scriptName} for hash ${hash}...`);
    const script = `SELECT TOP 1 text_hash FROM [RoundhousE].[ScriptsRun] WHERE script_name = '${scriptName}' ORDER BY entry_date DESC`;
    const db = await sql.query(script);
    if (db.recordset.length === 1) {
      await sql.close();
      return { result: db.recordset[0].text_hash === hash ? 'Match' : 'Changed' };
    }
    await sql.close();
    return { result: 'Not Run' };
  } catch (error) {
    return error.message;
  }
};

const updateVersion = async config => {
  try {
    if (!config.dryRun) {
      await sql.connect(config.connString);
    }
    log.info('==================================================');
    log.info('Versioning');
    if (!config.dryRun) {
      const db = await sql.query(
        `INSERT INTO [RoundhousE].[Version] (repository_path, version, entry_date, modified_date, entered_by) 
        VALUES ('', 0, GETDATE(), GETDATE(), '${os.hostname}'); SELECT @@Identity AS id;`
      );
      await sql.close();
      return db.recordset[0].id;
    }
    return 1;
  } catch (error) {
    return error.message;
  }
};

const executeScript = async (scriptParams, contents) => {
  log.info('--------------------------------------------------');
  log.info(` Running ${scriptParams.filename}`);
  if (!scriptParams.dryRun) {
    await sql.connect(scriptParams.connString);
    try {
      let prepContents = contents;
      while (prepContents.search(/--.*?go/gi) > 0) {
        prepContents = prepContents.replace(/(--.*?)go/gi, '$1roundhouse_replace_token');
      }
      while (prepContents.search(/\/\*.*?go.*?\*\//gis) > 0) {
        prepContents = prepContents.replace(/(\/\*.*?)go(.*?\*\/)/gis, '$1roundhouse_replace_token$2');
      }

      const scriptParts = prepContents.split(/\sGO;?\s|\sGO;?$/gi);
      for (const scriptPart of scriptParts) {
        if (scriptPart.trim().length > 0) {
          await sql.batch(scriptPart.replace(/roundhouse_replace_token/g, 'go'));
        }
      }
      const oneTimeFlag = scriptParams.type === 'OneTime' ? 1 : 0;
      await sql.batch(`INSERT INTO [RoundhousE].[ScriptsRun] (
        version_id, script_name, text_of_script, text_hash, one_time_script, entry_date, modified_date, entered_by
      )
      VALUES (
        ${scriptParams.version},
        '${scriptParams.filename}',
        '${contents.replace(/'/g, "''")}',
        '${scriptParams.hash}',
        ${oneTimeFlag},
        GETDATE(),
        GETDATE(),
        '${os.hostname}'
      )`);
      return true;
    } catch (error) {
      await sql.batch(`INSERT INTO [RoundhousE].[ScriptsRunErrors] (
        repository_path, version, script_name, text_of_script, error_message, entry_date, modified_date, entered_by
      )
      VALUES (
        '',
        '${scriptParams.version}',
        '${scriptParams.filename}',
        '${contents.replace(/'/g, "''")}',
        '${error.message}',
        GETDATE(),
        GETDATE(),
        '${os.hostname}'
      )`);
      return error.message;
    }
  }
  return true;
};

module.exports = { checkScriptHash, createRHTables, createSchema, executeScript, testConnection, updateVersion };
