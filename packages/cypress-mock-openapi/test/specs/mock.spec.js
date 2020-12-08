/// <reference types="cypress" />

context('cypress-mock-openapi', () => {
  it('Mocks a fetch call with a url parameter', () => {
    cy.mockWithOpenAPI({ url: '/users' }).as('getUsers');
    cy.get('html').then(() => fetch('http://api-prefix/users'));

    cy.wait('@getUsers').then((interception) => {
      expect(interception.response.statusCode).to.eql(200);
      expect(interception.response.body).to.eql({
        users: [
          {
            name: 'Luke',
            age: 31,
          },
          {
            name: 'Han',
            age: 40,
          },
          {
            name: 'Chewy',
            age: 50,
          },
        ],
      });
    });
  });

  it('Mocks calls with all parameters', () => {
    cy.mockWithOpenAPI({
      apiPrefix: undefined,
      exampleKey: 'EMPTY',
      method: 'get',
      url: '/users',
    }).as('getUsersEmpty');

    cy.get('html').then(() => fetch('/users'));
    cy.wait('@getUsersEmpty').then((interception) => {
      expect(interception.response.statusCode).to.eql(200);
      expect(interception.response.body).to.eql({ users: [] });
    });
  });

  it('Throws an error when the url is missing', () => {
    cy.once('fail', (err) => {
      expect(err.message).to.be.equal('URL is missing from mockWithOpenAPI');
    });

    cy.mockWithOpenAPI();
  });

  it('Throws an error when the method is invalid', () => {
    cy.once('fail', (err) => {
      expect(err.message).to.be.equal(
        `Method 'what' isn't valid, choose a valid HTTP method instead.`,
      );
    });

    cy.mockWithOpenAPI({
      url: '/whatever',
      method: 'what',
    });
  });

  it('Bubbles up errors from Prism HTTP client responses', () => {
    cy.once('fail', (err) => {
      expect(err.message).to.contain(`Route not resolved, no path matched`);
    });

    cy.mockWithOpenAPI({
      url: '/no-route-exists',
    });
  });

  it('Bubbles up errors from Prism HTTP client for options', () => {
    cy.once('fail', (err) => {
      expect(err.message).to.contain(
        `The request path 'url-missing-prefix' must start with a slash`,
      );
    });

    cy.mockWithOpenAPI({
      url: 'url-missing-prefix',
    });
  });

  it('Provides a response to the browser', () => {
    cy.mockWithOpenAPI({
      url: '/users',
    }).as('getUsers');

    cy.visit('http://localhost:8080');

    cy.wait('@getUsers');
    cy.contains('Luke (31)').should('be.visible');
    cy.contains('Han (40)').should('be.visible');
    cy.contains('Chewy (50)').should('be.visible');
  });

  it('Makes an actual http request and validates the response with OpenAPI', () => {
    cy.validateWithOpenAPI({
      url: '/users',
      apiPrefix: 'http://localhost:8080',
    });
  });
});
