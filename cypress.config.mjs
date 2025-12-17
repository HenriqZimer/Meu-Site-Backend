import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 3000,
    requestTimeout: 3000,
    responseTimeout: 3000,
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
