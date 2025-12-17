/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to make authenticated API requests
       * @example cy.apiRequest('GET', '/api/projects')
       */
      apiRequest(method: string, url: string, body?: any): Chainable<Cypress.Response<any>>;
    }
  }
}

Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any) => {
  return cy.request({
    method,
    url,
    body,
    failOnStatusCode: false,
  });
});

export {};
