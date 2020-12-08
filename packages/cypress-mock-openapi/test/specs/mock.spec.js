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
});
