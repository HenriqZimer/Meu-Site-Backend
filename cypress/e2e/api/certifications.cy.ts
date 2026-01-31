describe('Certifications API', () => {
  it('deve listar todas as certificações', () => {
    cy.request('GET', '/api/certifications').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar estatísticas das certificações', () => {
    cy.request('GET', '/api/certifications/stats').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('total');
    });
  });

  it('deve retornar certificações com estrutura correta', () => {
    cy.request('GET', '/api/certifications').then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('name');
        expect(response.body[0]).to.have.property('issuer');
      }
    });
  });
});
