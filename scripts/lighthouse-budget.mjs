/**
 * Lighthouse budgets without LHCI's Windows temp-profile EPERM cleanup.
 * Uses a persistent --user-data-dir so chrome-launcher never rimrafs TEMP.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'desktop' ? 'desktop' : 'mobile';

const mobile = {
  urls: [
    'http://127.0.0.1:4321/',
    'http://127.0.0.1:4321/en/',
    'http://127.0.0.1:4321/discography/',
    'http://127.0.0.1:4321/en/discography/',
  ],
  flags: {
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
  },
  budgets: {
    perf: 0.9,
    a11y: 0.95,
    lcp: 3200,
    cls: 0.1,
    script: 15360,
    css: 10240,
  },
};

const desktop = {
  urls: ['http://127.0.0.1:4321/', 'http://127.0.0.1:4321/discography/'],
  flags: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 10240,
      uploadThroughputKbps: 10240,
    },
    skipAudits: ['uses-http2', 'bf-cache', 'third-party-cookies'],
  },
  budgets: {
    perf: 0.9,
    a11y: 0.95,
    lcp: 3200,
    cls: 0.1,
  },
};

const profile = mode === 'desktop' ? desktop : mobile;
const outDir = join(root, mode === 'desktop' ? '.lighthouseci-desktop' : '.lighthouseci');
const userDataDir = join(outDir, 'chrome-profile');

function resourceSize(lhr, type) {
  const items = lhr.audits['resource-summary']?.details?.items ?? [];
  return items.find((item) => item.resourceType === type)?.transferSize ?? 0;
}

function assertReport(url, lhr, budgets) {
  const failures = [];
  const perf = lhr.categories.performance.score;
  const a11y = lhr.categories.accessibility.score;
  const lcp = lhr.audits['largest-contentful-paint'].numericValue;
  const cls = lhr.audits['cumulative-layout-shift'].numericValue;
  console.log(
    `${url}\n  perf ${(perf * 100).toFixed(0)}  a11y ${(a11y * 100).toFixed(0)}  LCP ${Math.round(lcp)}ms  CLS ${cls}`,
  );
  if (perf < budgets.perf) failures.push(`performance ${perf} < ${budgets.perf}`);
  if (a11y < budgets.a11y) failures.push(`accessibility ${a11y} < ${budgets.a11y}`);
  if (lcp > budgets.lcp) failures.push(`LCP ${Math.round(lcp)}ms > ${budgets.lcp}ms`);
  if (cls > budgets.cls) failures.push(`CLS ${cls} > ${budgets.cls}`);
  if (budgets.script != null) {
    const size = resourceSize(lhr, 'script');
    console.log(`  script ${size}B`);
    if (size > budgets.script) failures.push(`script ${size}B > ${budgets.script}B`);
  }
  if (budgets.css != null) {
    const size = resourceSize(lhr, 'stylesheet');
    console.log(`  css ${size}B`);
    if (size > budgets.css) failures.push(`css ${size}B > ${budgets.css}B`);
  }
  return failures;
}

await mkdir(userDataDir, { recursive: true });

const chrome = await launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  userDataDir,
  logLevel: 'error',
});
const allFailures = [];

try {
  for (const [index, url] of profile.urls.entries()) {
    const result = await lighthouse(url, {
      ...profile.flags,
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
    });
    if (!result?.lhr) throw new Error(`No Lighthouse result for ${url}`);
    const slug = url.replace(/https?:\/\/127\.0\.0\.1:4321/, '').replaceAll('/', '_') || 'home';
    await writeFile(join(outDir, `${mode}${slug || 'home'}-${index}.json`), JSON.stringify(result.lhr));
    allFailures.push(...assertReport(url, result.lhr, profile.budgets).map((item) => `${url}: ${item}`));
  }
} finally {
  await chrome.kill();
}

if (allFailures.length) {
  console.error('\nBudget failures:');
  for (const item of allFailures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`\n${mode} Lighthouse budgets passed`);
