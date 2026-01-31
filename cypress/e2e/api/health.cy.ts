describe('API Health Check', () => {
  it('deve retornar status 200 ao acessar skills', () => {
    cy.request('GET', '/api/skills').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar Content-Type JSON', () => {
    cy.request('GET', '/api/skills').then((response) => {
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
});
