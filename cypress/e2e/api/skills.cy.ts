describe('Skills API', () => {
  it('deve listar todas as skills', () => {
    cy.request('GET', '/api/skills').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar skills por categoria', () => {
    cy.request('GET', '/api/skills?category=frontend').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar skills com estrutura correta', () => {
    cy.request('GET', '/api/skills').then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('name');
        expect(response.body[0]).to.have.property('category');
        expect(response.body[0]).to.have.property('icon');
      }
    });
  });
});
