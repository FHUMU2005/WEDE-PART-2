/* Shared interactivity: scroll reveal, counters, tabs, accordion, lightbox */
document.addEventListener('DOMContentLoaded', () => {
  // Scroll-reveal animation
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    els.forEach(e => io.observe(e));
  } else { els.forEach(e => e.classList.add('visible')); }

  // Animated counters
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count; let n = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const id = setInterval(() => { n = Math.min(target, n + step); el.textContent = n; if (n >= target) clearInterval(id); }, 25);
  });

  // Tabs (keyboard accessible)
  document.querySelectorAll('.tabs').forEach(tabs => {
    const btns = [...tabs.querySelectorAll('[role="tab"]')];
    const show = b => {
      btns.forEach(x => {
        const on = x === b;
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      b.focus();
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => show(b));
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') show(btns[(i + 1) % btns.length]);
        if (e.key === 'ArrowLeft') show(btns[(i - 1 + btns.length) % btns.length]);
      });
    });
  });

  // Accordion
  document.querySelectorAll('.accordion-btn').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = open;
  }));

  // Gallery lightbox
  const items = [...document.querySelectorAll('.gallery-item')];
  const lb = document.getElementById('lightbox');
  if (lb && items.length) {
    let i = 0;
    const img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
    const open = n => {
      i = (n + items.length) % items.length;
      const s = items[i].querySelector('img');
      img.src = s.src; img.alt = s.alt; cap.textContent = s.alt;
      if (!lb.open) lb.showModal();
    };
    items.forEach((g, n) => g.addEventListener('click', () => open(n)));
    lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
    lb.querySelector('.lb-prev').addEventListener('click', () => open(i - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => open(i + 1));
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    document.addEventListener('keydown', e => {
      if (!lb.open) return;
      if (e.key === 'ArrowRight') open(i + 1);
      if (e.key === 'ArrowLeft') open(i - 1);
    });
  }
});
