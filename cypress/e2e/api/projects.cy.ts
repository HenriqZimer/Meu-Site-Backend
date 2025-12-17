describe('Projects API', () => {
  it('deve listar todos os projetos', () => {
    cy.request('GET', '/api/projects').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar estatísticas dos projetos', () => {
    cy.request('GET', '/api/projects/stats').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('total');
    });
  });

  it('deve retornar projetos com estrutura correta', () => {
    cy.request('GET', '/api/projects').then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('title');
        expect(response.body[0]).to.have.property('description');
        expect(response.body[0]).to.have.property('technologies');
      }
    });
  });
});
