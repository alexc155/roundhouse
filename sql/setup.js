'use strict';
const sql = require('mssql');
const { log } = require('../utils');
const { initRoundhouse } = require('../services/roundhouse');

const createDatabase = async connString => {
  await sql.connect(connString);
  const databaseExists = await sql.query("SELECT [name] FROM sys.Databases WHERE [name] = 'Roundhouse_Local'");
  if (databaseExists.recordset.length === 1) {
    return true;
  }
  const setupDb = `
    CREATE DATABASE [Roundhouse_Local]
    CONTAINMENT = NONE
    ON  PRIMARY 
    ( NAME = N'Roundhouse_Local', FILENAME = N'/var/opt/mssql/data/Roundhouse_Local.mdf' , SIZE = 100MB , MAXSIZE = UNLIMITED, FILEGROWTH = 10%)
    LOG ON 
    ( NAME = N'Roundhouse_Local_Log', FILENAME = N'/var/opt/mssql/data/Roundhouse_Local_log.ldf' , SIZE = 10MB , MAXSIZE = 1GB , FILEGROWTH = 10%)
    COLLATE Latin1_General_CI_AS

    IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
    BEGIN
        EXEC [Roundhouse_Local].[dbo].[sp_fulltext_database] @action = 'enable'
    END
    `;
  await sql.batch(setupDb);
  sql.close();
  return true;
};

(async function() {
  try {
    const connString = 'mssql://sa:P@ssw0rd@localhost:3341';
    const createDb = await createDatabase(connString);

    if (createDb === true) {
      const initResult = await initRoundhouse({ connString: `${connString}/Roundhouse_Local` });
      if (initResult === true) {
        process.exit(0);
      }
      log.error(initResult);
      process.exit(1);
    }
  } catch (err) {
    log.error('SQL error', err);
    process.exit(1);
  }
})();
