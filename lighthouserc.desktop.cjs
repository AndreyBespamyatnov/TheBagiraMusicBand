module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4321/', 'http://127.0.0.1:4321/discography/'],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        skipAudits: ['uses-http2', 'bf-cache', 'third-party-cookies'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci-desktop',
    },
  },
};
