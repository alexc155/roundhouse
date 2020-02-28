'use strict';
const filterScriptsToEnvironment = (environment, scripts) => {
  const filteredScripts = scripts.filter(
    script =>
      (!(script.filename.toUpperCase().indexOf('.ENV.') > 0) ||
        script.filename.toUpperCase().indexOf(`${environment.toUpperCase()}.`) >= 0) &&
      script.filename.toUpperCase().endsWith('.SQL')
  );
  return filteredScripts;
};

module.exports = {
  filterScriptsToEnvironment
};
