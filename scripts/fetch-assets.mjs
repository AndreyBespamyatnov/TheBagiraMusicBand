/**
 * Download live-site brand assets and emit web-sized sources.
 * Covers stay ~800px. Hero is the live homepage studio photo (`9.jpg`).
 * Do not use `10.jpg` — that file is the 2021 album banner at the same
 * pixel size, not a higher-quality copy of the band photo.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://bagiraofficial.ru';

const images = {
  hero: { url: `${ORIGIN}/assets/images/9.jpg`, dest: 'src/assets/hero.jpg', keep: true },
  about: { url: `${ORIGIN}/assets/images/5-2000x1023.jpg`, dest: 'src/assets/about.jpg', keep: true },
  logo: { url: `${ORIGIN}/assets/images/band_logo_3.png`, max: 1000, dest: 'src/assets/logo.png', png: true },
  faviconSrc: { url: `${ORIGIN}/assets/images/logo.png`, max: 512, dest: 'tmp/logo-src.png', png: true },
};

const covers = [
  ['metelitsa', '28.jpg', 1600],
  ['angels-and-demons', '27.jpg'],
  ['chaos-and-darkness', '26.jpg'],
  ['i-came-i-saw', '25.jpg'],
  ['ne-po-puti', '24.jpg'],
  ['maski', '23.jpg'],
  ['black-magic', '22.jpg'],
  ['just-dont-lie', '20.jpg'],
  ['taboo-acoustic', '21.jpeg'],
  ['and-thunder', '16.jpg'],
  ['covered-in-metal', '19.jpg'],
  ['novogodnyaya', '18.jpg'],
  ['amnesia-x', '17.jpg'],
  ['keep-face', '13.jpg'],
  ['nothing-sacred', '12.jpg'],
  ['rock-and-roll', '11.jpg'],
  ['taboo', '10.jpeg'],
  ['brother', '9.jpg'],
  ['guardian-angel', '8.jpg'],
  ['from-russia', '7.jpg'],
  ['zoo', '6.jpg'],
  ['basic-instinct', '5.jpg'],
  ['shadow', '4.jpg'],
  ['scars', '15.jpg'],
  ['by-the-blood', '14.jpg'],
  ['amnesia', '1.png'],
];

const fonts = [
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/oswald@5.2.8/cyrillic-700-normal.woff2',
    dest: 'public/fonts/oswald-cyrillic-700.woff2',
  },
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/oswald@5.2.8/latin-700-normal.woff2',
    dest: 'public/fonts/oswald-latin-700.woff2',
  },
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/manrope@5.2.8/cyrillic-400-normal.woff2',
    dest: 'public/fonts/manrope-cyrillic-400.woff2',
  },
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/manrope@5.2.8/latin-400-normal.woff2',
    dest: 'public/fonts/manrope-latin-400.woff2',
  },
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/manrope@5.2.8/cyrillic-600-normal.woff2',
    dest: 'public/fonts/manrope-cyrillic-600.woff2',
  },
  {
    url: 'https://cdn.jsdelivr.net/fontsource/fonts/manrope@5.2.8/latin-600-normal.woff2',
    dest: 'public/fonts/manrope-latin-600.woff2',
  },
];

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'BagiraOfficialRebuild/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function writeOptimized(buf, dest, { max, png, quality = 78, keep = false } = {}) {
  const abs = join(root, dest);
  await mkdir(dirname(abs), { recursive: true });
  if (keep) {
    await writeFile(abs, buf);
    const meta = await sharp(buf, { failOn: 'none' }).metadata();
    console.log('wrote original', dest, meta.width);
    return;
  }
  const img = sharp(buf, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  const width = meta.width && max && meta.width > max ? max : meta.width;
  let pipeline = img.resize({ width, withoutEnlargement: true });
  if (png) {
    pipeline = pipeline.png({ compressionLevel: 9 });
  } else {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' });
  }
  await pipeline.toFile(abs);
  console.log('wrote', dest, width);
}

async function main() {
  await mkdir(join(root, 'src/assets/covers'), { recursive: true });
  await mkdir(join(root, 'public/fonts'), { recursive: true });
  await mkdir(join(root, 'public/images'), { recursive: true });
  await mkdir(join(root, 'tmp'), { recursive: true });

  for (const font of fonts) {
    const buf = await download(font.url);
    const abs = join(root, font.dest);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, buf);
    console.log('font', font.dest, buf.length);
  }

  for (const item of Object.values(images)) {
    const buf = await download(item.url);
    await writeOptimized(buf, item.dest, item);
  }

  const favBuf = await download(images.faviconSrc.url);
  const fav = sharp(favBuf, { failOn: 'none' });
  await fav.clone().resize(32, 32).png().toFile(join(root, 'public/favicon.png'));
  await fav.clone().resize(180, 180).png().toFile(join(root, 'public/apple-touch-icon.png'));
  await fav.clone().resize(512, 512).png().toFile(join(root, 'public/images/icon-512.png'));

  const heroBuf = await download(images.hero.url);
  await sharp(heroBuf, { failOn: 'none' })
    .rotate()
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(join(root, 'public/images/og.jpg'));

  const logoBuf = await download(images.logo.url);
  await sharp(logoBuf, { failOn: 'none' })
    .resize({ width: 480, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(root, 'public/images/logo.png'));

  for (const [slug, file, max = 800] of covers) {
    const buf = await download(`${ORIGIN}/assets/images/albums/${file}`);
    await writeOptimized(buf, `src/assets/covers/${slug}.jpg`, { max });
  }

  console.log('assets ready');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
