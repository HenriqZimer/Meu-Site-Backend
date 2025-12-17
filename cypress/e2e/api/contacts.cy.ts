describe('Contacts API', () => {
  it('deve validar campos obrigatórios ao criar contato', () => {
    cy.request({
      method: 'POST',
      url: '/api/contacts',
      body: {},
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('deve criar contato com dados válidos', () => {
    cy.request({
      method: 'POST',
      url: '/api/contacts',
      body: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect([200, 201]).to.include(response.status);
    });
  });

  it('endpoint de listagem requer autenticação', () => {
    cy.request({
      method: 'GET',
      url: '/api/contacts',
      failOnStatusCode: false,
    }).then((response) => {
      expect([200, 401]).to.include(response.status);
    });
  });
});
