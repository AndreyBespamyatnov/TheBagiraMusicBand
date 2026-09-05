import en from './en.json';
import ru from './ru.json';

export type Lang = 'ru' | 'en';
export type Dictionary = typeof ru;

const dictionaries: Record<Lang, Dictionary> = { ru, en };

export function isLang(value: string | undefined): value is Lang {
  return value === 'ru' || value === 'en';
}

export function getDict(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'ru') return clean === '/index/' ? '/' : clean;
  if (clean === '/') return '/en/';
  return `/en${clean}`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'ru' ? 'en' : 'ru';
}

export function htmlLang(lang: Lang): string {
  return lang;
}

export function localized<T extends { ru: string; en: string }>(value: T, lang: Lang): string {
  return value[lang];
}
