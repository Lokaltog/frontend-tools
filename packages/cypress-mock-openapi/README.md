## @heetch/cypress-mock-openapi

[![CI status](https://github.com/heetch/frontend-tools/workflows/push/badge.svg)]

This package contains a Cypress plugin and command to mock and validate responses in tests using an OpenAPI (Swagger) contract.

## Installation

`npm install --dev @heetch/cypress-mock-openapi`
OR
`yarn add --dev @heetch/cypress-mock-openapi`

## Configuration

After installing the package, configure Cypress with the following [environment variables](https://docs.cypress.io/guides/guides/environment-variables.html):

```js
{
  "openapiPath": "test/openapi.yaml",
  "apiPrefix": "http://api-prefix" // Optional
}
```

> The `apiPrefix` can be set globally but also overriden in both commands

In your Cypress plugin file:

```js
import getOpenAPIResponse from '@heetch/cypress-mock-openapi/dist/plugin';

module.exports = (on) => {
  on('task', {
    getOpenAPIResponse,
  });
};
```

Either in your support/index.js file or commands.js (for a standard configuration):

```js
import '@heetch/cypress-mock-openapi';
```

### Basic usage

#### `cy.mockWithOpenAPI`

This command will:

- Intercept a network request based on the passed options
- Search for the matching operation in the configured OpenAPI file
- Return the response of the operation and method based on the exampleKey

> Note: The first example defined in the OpenAPI contract will be used if none are specified

```yaml
# OpenAPI operation for GET http://my-api.com/users
examples:
  ACTIVE:
    value:
      users:
        - name: Paco
          active: true
```

```js
it('Displays a list of users', () => {
  // Set up the mock for GET http://my-api.com/users
  cy.mockWithOpenAPI({
    apiPrefix: 'http://my-api.com',
    url: '/users',
  }).as('getActiveUsers');

  // When the page loads, fetch /users
  cy.get('html').then(() => fetch('http://my-api.com/users'));

  // Await the results of the mock and make assertions
  cy.wait('@getActiveUsers').then((interception) => {
    expect(interception.response.statusCode).to.eql(200);
    expect(interception.response.body).to.eql({
      users: [{ name: 'Paco', active: true }],
    });
  });
});
```

#### `cy.validateWithOpenAPI`

This command can be used to validate that your API returns a response that conforms to the OpenAPI contract (both the request and the response). It will perform the request with the provided options and return the actual response if the validation passes.

If the validation fails, an error will be thrown that contains a list of contract violations. For example:

```js
it('Throws an error if the validation fails', () => {
  cy.validateWithOpenAPI({
    url: '/users',
    headers: {
      Authorization: 'Password',
    }
  });

  // Throws an error with the following information returned:
  {
    message: "The response doesn't match the OpenAPI contract",
    violations: {
      "body.users[0]": "required: should have required property 'age'",
    }
  }
});
```

### Options
