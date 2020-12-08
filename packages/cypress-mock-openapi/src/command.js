Cypress.Commands.add('mockWithOpenAPI', (options = {}) => {
  const openapiPath = Cypress.env('openapiPath');
  const apiPrefix = options.hasOwnProperty('apiPrefix')
    ? options.apiPrefix
    : Cypress.env('apiPrefix');

  return cy
    .task('mockWithOpenAPI', { openapiPath, ...options })
    .then(({ data }) => {
      let url = options.url;

      if (apiPrefix && apiPrefix?.length > 0) {
        url = apiPrefix + options.url;
      }

      return cy.intercept(
        { method: options.method || 'GET', url },
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
