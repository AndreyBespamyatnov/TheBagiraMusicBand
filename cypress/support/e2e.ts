import 'cypress-axe';
import compareSnapshotCommand from 'cypress-image-diff-js/command';

compareSnapshotCommand();

declare global {
  namespace Cypress {
    interface Chainable {
      checkPageA11y(): Chainable<void>;
      assertNoHorizontalScroll(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('checkPageA11y', () => {
  cy.injectAxe();
  cy.checkA11y(
    undefined,
    {
      includedImpacts: ['critical', 'serious'],
    },
    undefined,
    true,
  );
});

Cypress.Commands.add('assertNoHorizontalScroll', () => {
  cy.document().then((doc) => {
    expect(doc.documentElement.scrollWidth, 'no sideways scroll').to.be.lte(
      doc.documentElement.clientWidth + 1,
    );
  });
});
