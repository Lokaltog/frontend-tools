const Prism = require('@stoplight/prism-http/dist/client');
const {
  getHttpOperationsFromSpec,
} = require('@stoplight/prism-cli/dist/operations');

function mockWithOpenAPI(options = {}) {
  // Check if any are missing
  const { route, exampleKey } = options;

  return getHttpOperationsFromSpec(process.env.openapi_path).then(
    (operations) => {
      const prism = Prism.createClientFromOperations(operations, {
        mock: { dynamic: false, exampleKey },
      });
      // Match the same route (GET for now)
      return prism.get(route);
    },
  );
}

module.exports = mockWithOpenAPI();
