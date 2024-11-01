/// <reference types="cypress" />

context('Тест coin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500')
  })

  function transaction(to, amount) {
    cy.wait(3000)
    cy.get('.account-input').type(to)
    cy.get('.amount-input').type(amount)
    cy.wait(3000)
    cy.get('.send-trans-btn').click()
    cy.wait(3000)
    cy.get('#btn-back-id').click()
  }

  describe('Базовый функционал', () => {
    it('Добавление нового счета и перевод на него с него', () => {
      cy.get('.login-dlg-name').type('developer')
      cy.get('.login-dlg-pass').type('skillbox')
      cy.get('.login-dlg-btn').click()

      cy.wait(3000)
      cy.get('.page-header > button').click()

      const mainAccount = '74213041477477406320783754'
      let mainAccountBtn = null
      let accountTo = ''

      cy.wait(3000)

      cy.get('.balance').each((value, index, collection) => {
        let curAccount = value['0'].parentElement.childNodes[0].innerText

        if (value['0'].innerText.startsWith('0'))
          // переводим на нулевой счет
          accountTo = curAccount

        if (curAccount === mainAccount)
          mainAccountBtn = value['0'].parentElement.parentElement.childNodes[1].childNodes[1]

        if (mainAccountBtn && accountTo) {
          cy.wrap(mainAccountBtn).click()

          transaction(accountTo, '1000')

          cy.wait(3000)

          cy.get('.balance').each((value, index, collection) => {
            if (value['0'].parentElement.childNodes[0].innerText === accountTo) {
              const openBtn = value['0'].parentElement.parentElement.childNodes[1].childNodes[1]
              cy.wrap(openBtn).click()

              transaction(mainAccount, '500')
            }
          })

          return false
        }
      })
    })
  })
})
