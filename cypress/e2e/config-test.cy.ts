describe('Configuração do Cypress', () => {
  it('deve carregar a configuração corretamente', () => {
    expect(Cypress.config('baseUrl')).to.equal('http://localhost:5000');
  });

  it('deve ter os timeouts configurados corretamente', () => {
    expect(Cypress.config('defaultCommandTimeout')).to.equal(3000);
    expect(Cypress.config('requestTimeout')).to.equal(3000);
    expect(Cypress.config('responseTimeout')).to.equal(3000);
  });
});
