const Prism = require('@stoplight/prism-http/dist/client');
const {
  getHttpOperationsFromSpec,
} = require('@stoplight/prism-cli/dist/operations');

export const mockWithOpenAPI = (options = {}) => {
  const { url, exampleKey, method, validate } = options;

  return getHttpOperationsFromSpec(process.env.openapi_path).then(
    (operations) => {
      const prism = Prism.createClientFromOperations(operations, {
        mock: { dynamic: false, exampleKey },
      });

      return prism.request(
        url,
        { method: method || 'get', headers: headers || {} },
        requestOptions,
      );
    },
  );
};
