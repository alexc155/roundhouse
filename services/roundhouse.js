'use strict';
const { log } = require('../utils');
const database = require('./database');

const initRoundhouse = async config => {
  try {
    log.info('==================================================');
    log.info('RoundhousE Structure');
    log.info('==================================================');
    log.info('Running database type specific tasks.');

    await database.createSchema(config);

    await database.createRHTables(config);

    return true;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  initRoundhouse
};
