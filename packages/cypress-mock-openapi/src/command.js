Cypress.Commands.add('mockWithOpenAPI', (options = {}) => {
  const openapi_path = Cypress.env('openapi_path');

  // Make api_prefix optional
  const api_prefix = Cypress.env('api_prefix');

  return cy
    .task('mockWithOpenAPI', { openapi_path, api_prefix, ...options })
    .then(({ data }) => {
      return cy.intercept(
        { method: options.method || 'GET', url: api_prefix + options.route },
        {
          // Wait for https://github.com/cypress-io/cypress/issues/9264 to be officially released
          headers: {
            'access-control-allow-origin': window.location.origin,
            'Access-Control-Allow-Credentials': 'true',
          },
          body: data,
        },
      );
    });
});
