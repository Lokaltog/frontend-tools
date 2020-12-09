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

const validateOptions = (options) => {
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
};

const validateWithOpenAPI = (options = {}) => {
  validateOptions(options);

  const openapiPath = Cypress.env('openapiPath');

  return cy
    .task('getOpenAPIResponse', {
      openapiPath,
      ...options,
      validateRequest: true,
    })
    .then((response) => {
      handleViolations('request', response.violations.input);
      handleViolations('response', response.violations.output);

      return response;
    });
};

/**
 * Cypress command that mocks network requests by providing responses from an OpenAPI file.
 *
 * Usage:
 * cy.mockWithOpenAPI({ url: '/users' });
 *
 * This command uses the cy.intercept command to hijack any network request that matches
 * the options and return a response defined in the OpenAPI file. If no exampleKey was
 * passed, it will take the first example.
 *
 * @param {Object} options Mocking options
 * @param {String} options.url The path of the request e.g. /users
 * @param {String} options.method A valid HTTP method (case-insensitive)
 * @param {String} options.apiPrefix A base url of your API, e.g http://my-api.com (no trailing slash)
 * @param {String} options.exampleKey The name of a response example in the OpenAPI file
 *
 */
const mockWithOpenAPI = (options = {}) => {
  validateOptions(options);

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
};

Cypress.Commands.add('mockWithOpenAPI', mockWithOpenAPI);
Cypress.Commands.add('validateWithOpenAPI', validateWithOpenAPI);
