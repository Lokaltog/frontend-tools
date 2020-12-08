const Prism = require('@stoplight/prism-http/dist/client');
const {
  getHttpOperationsFromSpec,
} = require('@stoplight/prism-cli/dist/operations');

function mockWithOpenAPI(options = {}) {
  const { url, exampleKey, method, openapiPath } = options;

  return getHttpOperationsFromSpec(openapiPath).then(operations => {
    const prism = Prism.createClientFromOperations(operations, {
      mock: { dynamic: false, exampleKey },
    });

    return prism.request(url, { method: method || 'get' });
  });
}

module.exports = mockWithOpenAPI;
