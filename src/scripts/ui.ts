const dialog = document.querySelector<HTMLDialogElement>('#site-menu');
const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');

function setExpanded(open: boolean) {
  openBtn?.setAttribute('aria-expanded', String(open));
}

openBtn?.addEventListener('click', () => {
  dialog?.showModal();
  setExpanded(true);
  closeBtn?.focus();
});

closeBtn?.addEventListener('click', () => {
  dialog?.close();
});

dialog?.addEventListener('close', () => {
  setExpanded(false);
  openBtn?.focus();
});

dialog?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => dialog.close());
});

const sectionIds = ['about', 'tour', 'contacts'] as const;
type HomeNav = 'home' | (typeof sectionIds)[number];

function headerOffset() {
  return document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 68;
}

function setNavCurrent(id: HomeNav) {
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => {
    const key = link.dataset.nav;
    if (key !== 'home' && key !== 'about' && key !== 'tour' && key !== 'contacts') return;
    if (key === id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function headingPinned(top: number, line: number) {
  return top > -24 && top <= line + 48;
}

function updateNavFromScroll() {
  const about = document.getElementById('about');
  const tour = document.getElementById('tour');
  const contacts = document.getElementById('contacts');
  if (!about || !tour || !contacts) return;

  const line = headerOffset() + 8;
  const aboutTop = about.getBoundingClientRect().top;
  const tourTop = tour.getBoundingClientRect().top;
  const contactsTop = contacts.getBoundingClientRect().top;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const atBottom = maxScroll > 0 && window.scrollY >= maxScroll - 2;
  const hash = location.hash.slice(1);

  if (hash === 'about' && headingPinned(aboutTop, line)) {
    setNavCurrent('about');
    return;
  }
  if (hash === 'tour' && headingPinned(tourTop, line)) {
    setNavCurrent('tour');
    return;
  }
  if (hash === 'contacts' && (headingPinned(contactsTop, line) || (atBottom && contactsTop < window.innerHeight))) {
    setNavCurrent('contacts');
    return;
  }

  if (aboutTop > line) {
    setNavCurrent('home');
    return;
  }
  if (tourTop > line) {
    setNavCurrent('about');
    return;
  }
  if (contactsTop <= line || (atBottom && tourTop < 0)) {
    setNavCurrent('contacts');
    return;
  }
  setNavCurrent('tour');
}

if (document.getElementById('about')) {
  const sync = () => updateNavFromScroll();
  sync();
  requestAnimationFrame(sync);
  window.addEventListener('load', () => {
    sync();
    requestAnimationFrame(sync);
    window.setTimeout(sync, 80);
  });
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  window.addEventListener('hashchange', () => requestAnimationFrame(sync));
  new ResizeObserver(sync).observe(document.documentElement);
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((link) => {
    link.addEventListener('click', () => {
      const key = link.dataset.nav;
      if (key === 'home' || key === 'about' || key === 'tour' || key === 'contacts') {
        setNavCurrent(key);
      }
    });
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-video]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.video;
    const title = button.dataset.title ?? 'YouTube';
    if (!id || button.dataset.playing === 'true') return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = title;
    frame.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    button.replaceChildren(frame);
    button.dataset.playing = 'true';
    button.disabled = true;
  });
});
