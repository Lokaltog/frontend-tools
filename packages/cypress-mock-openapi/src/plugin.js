const Prism = require('@stoplight/prism-http/dist/client');
const {
  getHttpOperationsFromSpec,
} = require('@stoplight/prism-cli/dist/operations');

function mockWithOpenAPI(options = {}) {
  const { route, exampleKey, openapi_path } = options;

  return getHttpOperationsFromSpec(openapi_path).then((operations) => {
    const prism = Prism.createClientFromOperations(operations, {
      mock: { dynamic: false, exampleKey },
    });
    // Match the same route (GET for now)
    return prism.get(route);
  });
}

module.exports = mockWithOpenAPI;
