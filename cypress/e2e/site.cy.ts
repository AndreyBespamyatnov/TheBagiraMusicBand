const viewports: Cypress.ViewportPreset[] | [number, number][] = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
];

describe('BAGIRA official site', () => {
  it('serves RU home with one h1 and booking links', () => {
    cy.visit('/');
    cy.get('html').should('have.attr', 'lang', 'ru');
    cy.get('h1').should('have.length', 1);
    cy.contains('О группе').should('exist');
    cy.contains('Метелица').should('exist');
    cy.get('.hero img')
      .should('be.visible')
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.gte(780);
      });
    cy.get('.hero source[type="image/webp"]')
      .should('have.attr', 'srcset')
      .and('include', '2560w');
    cy.get('.hero img').should('have.attr', 'srcset').and('include', '2560w');
    cy.contains('Алла Булгакова').should('exist');
    cy.get('a[href="mailto:bagira-metal@mail.ru"]').should('be.visible');
    cy.get('a[href="tel:+79047638356"]').should('be.visible');
    cy.get('a[href="https://band.link/bagiralive/"]').should('exist');
    cy.get('.tour-empty').should('contain', 'открытых дат нет');
    cy.get('iframe').should('not.exist');
    cy.get('[data-video]').first().click();
    cy.get('.video-facade iframe')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'youtube-nocookie.com');
    cy.checkPageA11y();
  });

  const homeNav = ['home', 'about', 'tour', 'contacts'] as const;

  const assertHomeNav = (id: (typeof homeNav)[number]) => {
    cy.get('.nav-desktop [data-nav]').should(($links) => {
      const current = [...$links]
        .filter((link) => link.getAttribute('aria-current') === 'page')
        .map((link) => link.dataset.nav);
      expect(current, 'desktop nav').to.deep.equal([id]);
    });
    cy.get('#site-menu [data-nav]').should(($links) => {
      const current = [...$links]
        .filter((link) => link.getAttribute('aria-current') === 'page')
        .map((link) => link.dataset.nav);
      expect(current, 'mobile nav').to.deep.equal([id]);
    });
  };

  it('highlights each home nav item from clicks and hashes', () => {
    cy.viewport(1440, 1200);
    cy.visit('/');
    assertHomeNav('home');

    cy.get('.nav-desktop [data-nav="about"]').click();
    cy.location('hash').should('eq', '#about');
    cy.window().its('scrollY').should('be.gt', 100);
    assertHomeNav('about');

    cy.get('.nav-desktop [data-nav="tour"]').click();
    cy.location('hash').should('eq', '#tour');
    cy.get('#tour').should(($el) => {
      expect($el[0].getBoundingClientRect().top).to.be.lessThan(160);
    });
    assertHomeNav('tour');

    cy.get('.nav-desktop [data-nav="contacts"]').click();
    cy.location('hash').should('eq', '#contacts');
    cy.get('#contacts').should('be.visible');
    assertHomeNav('contacts');

    cy.get('.nav-desktop [data-nav="home"]').click();
    cy.window().its('scrollY').should('eq', 0);
    assertHomeNav('home');

    cy.visit('/#about');
    assertHomeNav('about');
    cy.visit('/#tour');
    assertHomeNav('tour');
    cy.visit('/#contacts');
    assertHomeNav('contacts');
  });

  it('switches language via URL and keeps equal copy', () => {
    cy.visit('/');
    cy.get('.nav-desktop a[lang="en"]').click();
    cy.location('pathname').should('eq', '/en/');
    cy.get('html').should('have.attr', 'lang', 'en');
    cy.contains('About').should('exist');
    cy.contains('Metelitsa').should('exist');
    cy.contains('Alla Bulgakova').should('exist');
    cy.contains('Chaos and Darkness').should('exist');
    cy.get('.tour-empty').should('contain', 'No announced dates');
    cy.checkPageA11y();
  });

  it('opens discography, filters without JS state, and keeps BandLink', () => {
    cy.visit('/discography/');
    cy.get('html').should('have.attr', 'lang', 'ru');
    cy.get('h1').should('contain', 'Дискография');
    cy.get('.cover-card').should('have.length.greaterThan', 20);
    cy.get('#filter-albums').check({ force: true });
    cy.get('.cover-card:visible').each(($el) => {
      expect($el.attr('data-type')).to.eq('album');
    });
    cy.get('#filter-collabs').check({ force: true });
    cy.get('.cover-card:visible').should('have.length', 2);
    cy.get('.cover-card:visible .cover-link').first().should('have.attr', 'href').and('include', 'band.link');
    cy.get('.nav-desktop a[lang="en"]').click();
    cy.location('pathname').should('eq', '/en/discography/');
    cy.contains('Discography').should('exist');
    cy.contains('Chaos and Darkness').should('exist');
    cy.checkPageA11y();
  });

  it('opens and closes the mobile menu with a dialog', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.get('#site-menu').should('not.be.visible');
    cy.get('[data-menu-open]').click();
    cy.get('#site-menu').should('be.visible');
    cy.get('[data-menu-open]').should('have.attr', 'aria-expanded', 'true');
    cy.get('#site-menu a').contains('Дискография').should('be.visible');
    cy.checkPageA11y();
    cy.get('[data-menu-close]').click();
    cy.get('#site-menu').should('not.be.visible');
    cy.get('[data-menu-open]').should('have.attr', 'aria-expanded', 'false').and('be.focused');
  });

  it('skip link moves focus to content', () => {
    cy.visit('/');
    cy.get('.skip-link').focus().click();
    cy.url().should('include', '#content');
    cy.get('#content').should('exist');
  });
});

describe('layout guards', () => {
  viewports.forEach((vp) => {
    const [width, height] = vp;
    it(`does not overflow at ${width}x${height}`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      cy.assertNoHorizontalScroll();
      cy.get('h1').should('have.length', 1);
      cy.visit('/discography/');
      cy.assertNoHorizontalScroll();
      cy.get('h1').should('have.length', 1);
    });
  });

  it('keeps tap targets at least 44px on 390', () => {
    cy.viewport(390, 844);
    cy.visit('/');
    cy.get('[data-menu-open], .listen-row a, .btn, .hero-chip, .scroll-cue').each(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width, $el.text() || $el.attr('class')).to.be.gte(44);
      expect(rect.height, $el.text() || $el.attr('class')).to.be.gte(44);
    });
  });
});

describe('visual baselines', () => {
  const prepareShot = (visitPath: string, imageSelector: string) => {
    cy.visit(visitPath, {
      onBeforeLoad(win) {
        const native = win.matchMedia.bind(win);
        cy.stub(win, 'matchMedia').callsFake((query: string) => {
          if (query.includes('prefers-reduced-motion')) {
            return {
              matches: true,
              media: query,
              onchange: null,
              addListener() {},
              removeListener() {},
              addEventListener() {},
              removeEventListener() {},
              dispatchEvent() {
                return false;
              },
            };
          }
          return native(query);
        });
      },
    });
    cy.document().then((doc) => doc.fonts.ready);
    cy.get('.grain').invoke('attr', 'hidden', '');
    cy.get(`${imageSelector} img`).first().invoke('attr', 'loading', 'eager');
    cy.get(`${imageSelector} img`)
      .first()
      .scrollIntoView()
      .should(($img) => {
        expect($img[0].complete, `${imageSelector} decoded`).to.eq(true);
        expect($img[0].naturalWidth, `${imageSelector} width`).to.be.greaterThan(50);
      });
  };

  const shot = (name: string, selector: string) => {
    cy.get(selector).compareSnapshot({
      name,
      testThreshold: 0.12,
      retryOptions: { limit: 3 },
    });
  };

  const clamp = (selector: string, maxHeight: string) => {
    cy.get(selector).invoke('css', { maxHeight, overflow: 'hidden' });
  };

  it('home hero at 390', () => {
    cy.viewport(390, 844);
    prepareShot('/', '.hero');
    shot('hero-390', '.hero');
  });

  it('home hero at 1440', () => {
    cy.viewport(1440, 900);
    prepareShot('/', '.hero');
    shot('hero-1440', '.hero');
  });

  it('about and discography at 390', () => {
    cy.viewport(390, 844);
    prepareShot('/', '.about-face');
    clamp('#about', '36rem');
    shot('about-390', '#about');
    prepareShot('/discography/', '.cover-card');
    cy.get('.cover-card').invoke('css', 'content-visibility', 'visible');
    clamp('.covers', '28rem');
    shot('disco-390', '.covers');
  });

  it('about and discography at 1440', () => {
    cy.viewport(1440, 900);
    prepareShot('/', '.about-face');
    clamp('#about', '36rem');
    shot('about-1440', '#about');
    prepareShot('/discography/', '.cover-card');
    cy.get('.cover-card').invoke('css', 'content-visibility', 'visible');
    clamp('.covers', '28rem');
    shot('disco-1440', '.covers');
  });
});

describe('errors', () => {
  it('serves a bilingual 404', () => {
    cy.visit('/missing-page/', { failOnStatusCode: false });
    cy.contains('Страница не найдена');
    cy.contains('Page not found');
    cy.get('a[href="/"]').should('be.visible');
    cy.get('a[href="/en/"]').should('be.visible');
  });
});
