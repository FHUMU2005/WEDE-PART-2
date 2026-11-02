/* Services page: loads services from pricing.json (AJAX) and adds search, filter and sort */
(async function () {
  const list = document.getElementById('service-list');
  const status = document.getElementById('service-status');
  const q = document.getElementById('search'), cat = document.getElementById('category'), sort = document.getElementById('sort');
  const dlg = document.getElementById('service-modal'), body = document.getElementById('modal-content');
  const money = n => 'R' + n.toLocaleString('en-ZA');
  let data = [];

  try {
    const res = await fetch('./data/pricing.json');
    if (!res.ok) throw new Error(res.status);
    data = (await res.json()).services;
  } catch (err) {
    status.textContent = 'Services could not be loaded. Refresh the page or try again later.';
    return;
  }

  [...new Set(data.map(s => s.category))].forEach(c => {
    const o = document.createElement('option'); o.value = c; o.textContent = c; cat.appendChild(o);
  });

  const el = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };

  function render() {
    const term = q.value.trim().toLowerCase();
    let rows = data.filter(s => (cat.value === 'all' || s.category === cat.value) &&
      (s.name + ' ' + s.description + ' ' + s.category).toLowerCase().includes(term));
    const sorters = {
      name: (a, b) => a.name.localeCompare(b.name),
      'price-asc': (a, b) => a.base - b.base,
      'price-desc': (a, b) => b.base - a.base,
      lead: (a, b) => a.weeks - b.weeks
    };
    rows.sort(sorters[sort.value]);
    list.replaceChildren();
    status.textContent = rows.length ? `Showing ${rows.length} of ${data.length} services.` : 'No services match your search. Clear the search or choose "All categories".';
    rows.forEach(s => {
      const card = el('article', '', 'service-card reveal visible');
      card.append(el('span', s.category, 'tag'), el('h2', s.name), el('p', s.description),
        el('p', `From ${money(s.base)}`, 'price'));
      const btn = el('button', 'View details'); btn.type = 'button';
      btn.addEventListener('click', () => openModal(s));
      card.append(btn); list.append(card);
    });
  }

  function openModal(s) {
    body.replaceChildren(el('h2', s.name), el('p', s.description));
    const ul = el('ul'); s.details.forEach(d => ul.append(el('li', d))); body.append(ul);
    body.append(el('p', `Starting at ${money(s.base)}` + (s.perHectare ? ` + ${money(s.perHectare)} per hectare` : ''), 'price'),
      el('p', `Typical lead time: ${s.weeks} week${s.weeks > 1 ? 's' : ''}`));
    const a = el('a', 'Get a quote', 'btn-link'); a.href = 'enquiry.html?service=' + encodeURIComponent(s.id);
    const c = el('button', 'Close'); c.type = 'button'; c.addEventListener('click', () => dlg.close());
    body.append(a, c); dlg.showModal();
  }

  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  [q, cat, sort].forEach(c => c.addEventListener('input', render));
  render();
})();
