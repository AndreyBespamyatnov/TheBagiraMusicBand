import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>(
  './covers/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

export const covers: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return [slug, mod.default];
  }),
);
