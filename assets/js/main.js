/* ============================================================
   EMNA SMAALI — retro editorial portfolio
   Vanilla JS, no dependencies.
   ============================================================ */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------ masthead state */
  const masthead = $('#masthead');
  const onScroll = () => {
    if (masthead) masthead.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------ local time */
  const clock = $('#clock');
  const setClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date());
  };
  setClock();
  window.setInterval(setClock, 30000);

  /* ------------------------------------------------ scrollspy */
  const links = $$('.nav a:not(.nav__cv)');
  const sections = $$('section[data-section]');

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(a => {
          const on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  /* ------------------------------------------------ reveal */
  const reveal = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('is-in'));
  }

  /* ------------------------------------------------ case files */
  const fileButtons = $$('.file-btn');
  fileButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      const open = btn.getAttribute('aria-expanded') === 'true';
      const label = btn.querySelector('span');

      fileButtons.forEach(other => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
        if (otherPanel) {
          otherPanel.classList.remove('is-open');
          otherPanel.setAttribute('aria-hidden', 'true');
        }
        const otherLabel = other.querySelector('span');
        if (otherLabel) otherLabel.textContent = 'Read the case file';
      });

      btn.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
      panel.setAttribute('aria-hidden', String(open));
      if (label) label.textContent = open ? 'Read the case file' : 'Close the case file';
    });
  });

  /* ------------------------------------------------ lightbox */
  const box = $('#lightbox');
  const boxImg = box ? $('img', box) : null;
  const openBox = (src, alt) => {
    if (!box || !boxImg) return;
    boxImg.src = src;
    boxImg.alt = alt || '';
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeBox = () => {
    if (!box) return;
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (boxImg) boxImg.src = '';
  };

  $$('[data-lightbox]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const img = link.querySelector('img');
      openBox(link.getAttribute('href'), img ? img.alt : '');
    });
  });
  if (box) {
    box.addEventListener('click', e => {
      if (e.target === box || e.target.closest('.lightbox__close')) closeBox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && box.classList.contains('is-open')) closeBox();
    });
  }

  /* ------------------------------------------------ copy email */
  const copyBtn = $('[data-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.copy;
      const label = copyBtn.querySelector('span');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        ta.remove();
      }
      copyBtn.classList.add('is-copied');
      label.textContent = 'Copied';
      window.setTimeout(() => {
        copyBtn.classList.remove('is-copied');
        label.textContent = 'Copy email';
      }, 1800);
    });
  }
})();
