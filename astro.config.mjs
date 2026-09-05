import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://bagiraofficial.ru',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  image: {
    remotePatterns: [{ protocol: 'https' }],
    quality: 88,
  },
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ru',
        locales: {
          ru: 'ru',
          en: 'en',
        },
      },
      filter: (page) => !page.includes('404'),
    }),
  ],
  vite: {
    build: {
      cssMinify: true,
      modulePreload: { polyfill: false },
    },
  },
});
