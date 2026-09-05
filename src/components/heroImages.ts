import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import heroPhoto from '../assets/hero.jpg';

/**
 * Live homepage photo (`assets/images/9.jpg`, 2560×1309):
 * current four-member studio shot on black. Not 10.jpg (album banner)
 * and not the 2018 outdoor photo.
 */
const widths = [1280, 1920, 2560] as const;

type Format = 'webp' | 'jpeg';

async function srcset(src: ImageMetadata, format: Format, quality: number, sizes: readonly number[]) {
  const variants = await Promise.all(
    sizes.map((width) => getImage({ src, format, width, quality })),
  );
  return {
    srcset: variants.map((image, index) => `${image.src} ${sizes[index]}w`).join(', '),
    files: variants,
  };
}

export async function heroSources() {
  const webp = await srcset(heroPhoto, 'webp', 90, widths);
  const jpeg = await srcset(heroPhoto, 'jpeg', 86, [1280, 1920]);

  return {
    webp: webp.srcset,
    jpeg: `${jpeg.srcset}, ${heroPhoto.src} 2560w`,
    fallback: jpeg.files[1] ?? jpeg.files[0],
    width: heroPhoto.width,
    height: heroPhoto.height,
  };
}
