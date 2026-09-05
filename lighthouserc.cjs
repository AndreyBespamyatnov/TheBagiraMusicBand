module.exports = {
  ci: {
    collect: {
      url: [
        'http://127.0.0.1:4321/',
        'http://127.0.0.1:4321/en/',
        'http://127.0.0.1:4321/discography/',
        'http://127.0.0.1:4321/en/discography/',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false,
        },
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
        skipAudits: ['uses-http2', 'bf-cache', 'third-party-cookies'],
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu --headless=new',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 15360 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 10240 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
