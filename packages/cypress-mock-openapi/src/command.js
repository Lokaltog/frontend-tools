Cypress.Commands.add('mockWithOpenAPI', (options) => {
  cy.task('mockWithOpenAPI', options).then(({ data }) => {
    // pass in API url prefix as an env variable if necessary
    cy.intercept({ method: options.method, url: options.route }, data);
  });
});
