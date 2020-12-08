/// <reference types="cypress" />

const mockWithOpenAPI = require('../../src/plugin');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = on => {
  on('task', {
    mockWithOpenAPI,
  });
};
