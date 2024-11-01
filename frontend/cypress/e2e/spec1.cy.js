/// <reference types="cypress" />

context('Тест coin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500')
  })

  describe('Вход в систему', () => {
    it('Плохой логин:', () => {
      cy.get('.login-dlg-name').type('bad_login')
      cy.get('.login-dlg-btn').click()
      cy.wait(3000)
    })

    it('Плохой пароль:', () => {
      cy.get('.login-dlg-name').type('developer')
      cy.get('.login-dlg-pass').type('12345')
      cy.get('.login-dlg-btn').click()
      cy.wait(3000)
    })

    it('Вход в систему и работа меню', () => {
      cy.get('.login-dlg-name').type('developer')
      cy.get('.login-dlg-pass').type('skillbox')
      cy.get('.login-dlg-btn').click()

      cy.wait(3000)

      cy.get('#navBtn1').click()
      cy.wait(3000)

      cy.get('#navBtn2').click()
      cy.wait(3000)

      cy.get('#navBtn3').click()
      cy.wait(3000)

      cy.get('#navBtn4').click()
      cy.wait(3000)
    })
  })
})
