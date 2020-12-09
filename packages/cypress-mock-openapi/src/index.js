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

const handleViolations = (type, violations) => {
  if (violations && violations.length > 0) {
    const formattedViolations = violations.reduce((map, v) => {
      map[v.path.join('.')] = `${v.code}: ${v.message}`;
      return map;
    }, {});

    const error = new Error(
      `The ${type} doesn't match the OpenAPI contract \n ${JSON.stringify(
        formattedViolations,
        null,
        2,
      )}`,
    );

    error.violations = formattedViolations;

    throw error;
  }
};

Cypress.Commands.add('validateWithOpenAPI', (options = {}) => {
  const openapiPath = Cypress.env('openapiPath');

  return cy
    .task('getOpenAPIResponse', {
      openapiPath,
      ...options,
      validateRequest: true,
    })
    .then(({ violations }) => {
      handleViolations('request', violations.input);
      handleViolations('response', violations.output);
    });
});

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
    .task('getOpenAPIResponse', { openapiPath, ...options })
    .then((response) => {
      const { data } = response;
      let { url } = options;

      if (apiPrefix && apiPrefix.length > 0) {
        url = apiPrefix + options.url;
      }

      return cy.intercept(
        { method: options.method || 'GET', url, apiPrefix },
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
