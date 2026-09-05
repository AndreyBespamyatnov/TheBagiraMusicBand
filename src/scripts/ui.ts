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

document.querySelectorAll<HTMLButtonElement>('[data-video]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.video;
    const title = button.dataset.title ?? 'YouTube';
    if (!id) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  });
});
