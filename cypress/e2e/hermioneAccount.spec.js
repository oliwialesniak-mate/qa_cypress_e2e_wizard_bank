/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Bank app - Hermione Granger flow (stable)', () => {
  before(() => {
    cy.visit('/');
  });

  // ✅ Helper: wait until balance matches expected value
  function waitForBalance(expectedBalance) {
    cy.get('.center strong:nth-child(2)', { timeout: 10000 })
      .should(($el) => {
        const balance = Number($el.text());
        expect(balance).to.eq(expectedBalance);
      });
  }

  // ✅ Helper: enter an amount safely (lint-clean, no unsafe chaining)
  function enterAmount(value) {
    // Ensure input exists and is visible
    cy.get('input[ng-model="amount"]', { timeout: 10000 })
      .should('exist')
      .and('be.visible')
      .scrollIntoView();

    // Clear in its own command
    cy.get('input[ng-model="amount"]').clear();

    // Type in its own command
    cy.get('input[ng-model="amount"]').type(value.toString());
  }

  it('should allow working with Hermione bank account', () => {
    // ---- Customer Login ----
    cy.contains('Customer Login').click();
    cy.get('#userSelect', { timeout: 10000 }).select(1);
    cy.contains('Login').click();

    cy.get('.center strong:nth-child(1)').should('contain.text', '1001');
    cy.get('.center strong:nth-child(3)').should('contain.text', 'Dollar');

    // ---- Capture initial balance ----
    cy.get('.center strong:nth-child(2)').invoke('text')
      .then((text) => Number(text))
      .then((initialBalance) => {
        // ---- Deposit ----
        const depositValue = faker.number.int({ min: 100, max: 500 });
        cy.log(`Depositing: ${depositValue}`);

        cy.contains('Deposit').click();
        enterAmount(depositValue);
        cy.get('form button').contains('Deposit').click();

        waitForBalance(initialBalance + depositValue);

        // ---- Withdraw ----
        cy.get('.center strong:nth-child(2)').invoke('text')
          .then((text) => Number(text))
          .then((balanceAfterDeposit) => {
            const withdrawValue = faker.number.int({
              min: 10,
              max: balanceAfterDeposit
            });
            cy.log(`Withdrawing: ${withdrawValue}`);

            cy.contains('Withdrawl').click();
            enterAmount(withdrawValue);
            cy.get('form button').contains('Withdraw').click();

            waitForBalance(balanceAfterDeposit - withdrawValue);
          });

        // ---- Transactions check ----
        cy.contains('Transactions').click();
        cy.get('table tbody tr').should('have.length.at.least', 2);
        cy.get('table tbody tr').eq(0).should('contain.text', 'Credit');
        cy.get('table tbody tr').eq(1).should('contain.text', 'Debit');

        // ---- Back & switch account ----
        cy.contains('Back').click();
        cy.get('#accountSelect').should('be.visible').select(2);
        cy.contains('Transactions').click();
        cy.get('table tbody tr').should('have.length', 0);

        // ---- Logout ----
        cy.contains('Back').click();
        cy.contains('Logout').click();
        cy.get('#userSelect').should('be.visible');
      });
  });
});
