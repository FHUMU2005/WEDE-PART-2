/* Form validation (client side) + AJAX handling for enquiry.html and contact.html */
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };

function setError(f, msg) {
  const e = $(f.id + '-error'); if (e) e.textContent = msg;
  f.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function check(f) {
  const v = f.value.trim(); let m = '';
  if (f.required && !v) m = f.tagName === 'SELECT' ? 'Choose an option from the list.' : 'This field is required.';
  else if (v) {
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = 'Enter a valid email address, e.g. name@example.com.';
    else if (f.id === 'name' && !/^[A-Za-z][A-Za-z\s'’-]{1,59}$/.test(v)) m = 'Enter 2 to 60 letters. Numbers are not allowed.';
    else if (f.type === 'tel' && !/^(\+27|0)[1-9]\d{8}$/.test(v.replace(/[\s-]/g, ''))) m = 'Enter a valid South African number, e.g. 012 345 6789 or +27 12 345 6789.';
    else if (f.type === 'number' && (isNaN(+v) || +v < +f.min || +v > +f.max)) m = `Enter a number between ${f.min} and ${f.max}.`;
    else if (f.type === 'date' && v < new Date().toISOString().slice(0, 10)) m = 'The date cannot be in the past.';
    else if (f.minLength > 0 && v.length < f.minLength) m = `Enter at least ${f.minLength} characters (you have ${v.length}).`;
  }
  setError(f, m); return !m;
}

function wire(form, onValid) {
  const fields = [...form.querySelectorAll('input,select,textarea')];
  fields.forEach(f => {
    f.addEventListener('blur', () => check(f));
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const bad = fields.filter(f => !check(f));
    if (bad.length) { bad[0].focus(); return; }
    await onValid();
  });
}

/* ---------- ENQUIRY: asynchronous quote ---------- */
const enquiry = $('enquiry-form');
if (enquiry) {
  const service = $('service'), size = $('farm-size'), out = $('enquiry-result');
  const community = () => ['volunteer', 'sponsor'].includes(service.value);
  const sync = () => { size.required = !community(); size.disabled = community(); if (community()) { size.value = ''; setError(size, ''); } };
  const pre = new URLSearchParams(location.search).get('service');
  if (pre && [...service.options].some(o => o.value === pre)) service.value = pre;
  service.addEventListener('change', sync); sync();

  wire(enquiry, async () => {
    const btn = enquiry.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Working out your quote...';
    out.hidden = false; out.replaceChildren(el('p', 'Please wait...'));
    try {
      const res = await fetch('./data/pricing.json'); if (!res.ok) throw new Error(res.status);
      const { services } = await res.json();
      const name = $('name').value.trim().split(' ')[0];
      out.replaceChildren(el('h2', `Thank you, ${name}`));
      if (community()) {
        const v = service.value === 'volunteer';
        out.append(el('p', v ? 'Volunteers are welcome year-round. We will email you our next field-day dates and what to bring.' : 'Sponsors help us fund irrigation for farmers who cannot afford it. We will email you our sponsorship options within 2 working days.'));
      } else {
        const s = services.find(x => x.id === service.value), ha = +size.value;
        const cost = s.base + s.perHectare * ha;
        const earliest = new Date(); earliest.setDate(earliest.getDate() + s.weeks * 7);
        const pref = $('start-date').value;
        out.append(el('p', `Service: ${s.name}`),
          el('p', `Estimated cost for ${ha} ha: R${cost.toLocaleString('en-ZA')} to R${Math.round(cost * 1.15).toLocaleString('en-ZA')} (excl. VAT, final price after a site visit).`, 'price'));
        const ok = pref && new Date(pref) >= earliest;
        out.append(el('p', ok ? `Availability: your preferred start date (${pref}) is available.` :
          `Availability: the earliest start is ${earliest.toISOString().slice(0, 10)} (${s.weeks} week lead time).` ));
      }
      out.append(el('p', `We will also send details to ${$('email').value.trim()}.`));
      enquiry.reset(); sync();
    } catch (err) {
      out.replaceChildren(el('h2', 'Something went wrong'), el('p', 'We could not calculate your quote. Check your connection and submit again.'));
    }
    btn.disabled = false; btn.textContent = 'Submit enquiry';
    out.tabIndex = -1; out.focus();
  });
}

/* ---------- CONTACT: compile an email ---------- */
const contact = $('contact-form');
if (contact) {
  const RECIPIENT = 'info@kunyarungoagritech.co.za';
  const msg = $('message'), count = $('msg-count');
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / ${msg.maxLength} characters`; });
  wire(contact, async () => {
    const f = id => $(id).value.trim();
    const subject = `[${$('type').value}] ${f('subject')}`;
    const body = `Name: ${f('name')}\nEmail: ${f('email')}\nPhone: ${f('phone') || 'not given'}\nMessage type: ${$('type').value}\n\n${f('message')}`;
    $('email-text').textContent = `To: ${RECIPIENT}\nSubject: ${subject}\n\n${body}`;
    $('send-email').href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const box = $('email-preview'); box.hidden = false; box.tabIndex = -1; box.focus();
  });
}
