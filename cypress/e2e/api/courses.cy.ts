describe('Courses API', () => {
  it('deve listar todos os cursos', () => {
    cy.request('GET', '/api/courses').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar anos dos cursos', () => {
    cy.request('GET', '/api/courses/years').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('deve retornar cursos com estrutura correta', () => {
    cy.request('GET', '/api/courses').then((response) => {
      expect(response.status).to.eq(200);
      if (response.body.length > 0) {
        expect(response.body[0]).to.have.property('name');
        expect(response.body[0]).to.have.property('platform');
        expect(response.body[0]).to.have.property('duration');
      }
    });
  });
});
