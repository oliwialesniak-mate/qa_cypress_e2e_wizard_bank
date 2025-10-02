/// <reference types='cypress' />
import { faker } from '@faker-js/faker';

describe('Bank app', () => {
  const depositValue = faker.finance.amount(100, 500, 0); // random deposit
  const withdrawValue = faker.finance.amount(10, 99, 0); // random withdrawal

  before(() => {
  // eslint-disable-next-line max-len
    cy.visit('https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login');
  });

  it('should provide the ability to work with Hermione\'s bank account', () => {
    // Step 1: Customer Login
    cy.contains('Customer Login').click();
    cy.get('#userSelect').select('Hermione Granger');
    cy.contains('Login').click();

    // Step 2: Assert account details
    cy.get('.center strong:nth-child(1)').should('contain.text', '1001'); // Account Number
    cy.get('.center strong:nth-child(3)').should('contain.text', 'Dollar'); // Currency
    cy.get('.center strong:nth-child(2)').invoke('text').then((balance) => {
      cy.log('Initial balance: ' + balance);
    });

    // Step 3: Deposit money
    cy.contains('Deposit').click();
    cy.get('input[ng-model="amount"]').type(depositValue);
    cy.get('form button').contains('Deposit').click();
    cy.get('.error').should('contain.text', 'Deposit Successful');

    // Step 4: Assert balance after deposit
    cy.get('.center strong:nth-child(2)').invoke('text').then((balance) => {
      expect(Number(balance)).to.be.gte(Number(depositValue));
    });

    // Step 5: Withdraw money
    cy.contains('Withdrawl').click();
    cy.get('input[ng-model="amount"]').type(withdrawValue);
    cy.get('form button').contains('Withdraw').click();
    cy.get('.error').should('contain.text', 'Transaction successful');

    // Step 6: Assert balance after withdrawal
    cy.get('.center strong:nth-child(2)').invoke('text').then((balance) => {
      expect(Number(balance)).to.be.gte(0);
    });

    // Step 7: Transactions
    cy.contains('Transactions').click();
    cy.get('table tbody tr').should('have.length.at.least', 2); // both deposit & withdraw

    // Step 8: Back & switch account
    cy.contains('Back').click();
    cy.get('#accountSelect').select(2); // select another account
    cy.contains('Transactions').click();
    cy.get('table tbody tr').should('have.length', 0); // no transactions

    // Step 9: Logout
    cy.contains('Back').click();
    cy.contains('Logout').click();
    cy.get('#userSelect').should('be.visible');
  });
});
