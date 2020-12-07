/// <reference types="cypress" />

context('cypress-mock-openapi', () => {
  it('successfully mocks an api call', () => {
    cy.mockWithOpenAPI({
      route: '/users',
    });

    cy.visit('http://localhost:8080/');

    cy.contains('Fetch mock tests').should('be.visible');
    cy.contains('Luke (31)').should('be.visible');
    cy.contains('Han (40)').should('be.visible');
    cy.contains('Chewy (50)').should('be.visible');
  });
});
