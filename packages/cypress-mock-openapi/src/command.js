const validMethods = [
  'get',
  'put',
  'post',
  'patch',
  'delete',
  'options',
  'head',
  'trace',
];

Cypress.Commands.add('mockWithOpenAPI', (options = {}) => {
  if (!options.url || options.url.length === 0) {
    throw new Error('URL is missing from mockWithOpenAPI');
  }

  if (
    options.hasOwnProperty('method') &&
    typeof options.method === 'string' &&
    !validMethods.includes(options.method.toLowerCase())
  ) {
    throw new Error(
      `Method '${options.method}' isn't valid, choose a valid HTTP method instead.`,
    );
  }

  const openapiPath = Cypress.env('openapiPath');
  const apiPrefix = options.hasOwnProperty('apiPrefix')
    ? options.apiPrefix
    : Cypress.env('apiPrefix');

  return cy
    .task('mockWithOpenAPI', { openapiPath, ...options })
    .then((response) => {
      const data = response.data;
      let url = options.url;

      if (apiPrefix && apiPrefix.length > 0) {
        url = apiPrefix + options.url;
      }

      return cy.intercept(
        { method: options.method || 'GET', url },
        {
          // Cypress doesn't automatically return CORS headers for intercept calls
          // Wait for https://github.com/cypress-io/cypress/issues/9264 to be officially released
          headers: {
            'access-control-allow-origin': window.location.origin,
            'Access-Control-Allow-Credentials': 'true',
            ...response.headers,
          },
          body: data,
          statusCode: response.status,
        },
      );
    });
});
