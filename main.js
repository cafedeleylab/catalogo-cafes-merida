(() => {
  const { brands, products, currency } = window.COFFEE_CATALOG;
  const container = document.querySelector('#catalog-groups');
  const filters = [...document.querySelectorAll('[data-family]')];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fact = (label, value) => `<div><dt>${label}</dt><dd>${escape(value || 'Por confirmar')}</dd></div>`;
  const price = p => p.price == null ? '<strong class="price-pending">Por confirmar</strong>' : `<strong>$ ${escape(new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(p.price))} <small>${escape(currency)}</small></strong>`;
  function card(p) {
    const photo = p.image
      ? `<button type="button" class="photo-button" data-photo="${escape(p.id)}" aria-label="Ampliar fotografía de ${escape(p.name)} de ${escape(p.brand)}"><img src="./${escape(p.image)}" alt="Bolsa de café ${escape(p.name)} de ${escape(p.brand)}" loading="lazy" decoding="async"><span class="zoom-hint" aria-hidden="true">Ampliar ↗</span></button>`
      : `<div class="photo-pending"><span class="pending-brand">${escape(p.brand === 'Wilton' ? 'WILTON BENÍTEZ' : p.brand)}</span><span class="pending-name">${escape(p.name)}</span><span class="pending-label">Fotografía próximamente</span></div>`;
    const detailFields = [['Acidez', p.acidity], ['Perfil táctil', p.texture], ['Residual', p.finish], ['Productor/a', p.producer], ['Finca', p.farm], ['Origen', p.origin], ['Altitud', p.altitude], ['Procesado en', p.processingFarm], ['Recomendado para', p.recommended]];
    const details = p.notes ? `<details class="coffee-details"><summary>Perfil completo y origen <span aria-hidden="true">+</span></summary><dl>${detailFields.filter(([, value]) => value).map(([label, value]) => fact(label, value)).join('')}</dl></details>` : '';
    return `<article class="product-card coffee-card ${p.featured ? 'featured-card' : ''}" aria-labelledby="title-${escape(p.id)}">
      <div class="product-visual ${p.image ? 'has-photo' : 'awaiting-photo'}">${photo}<span class="product-family">${escape(p.brand)}</span>${p.featured ? '<span class="featured-label">Selección destacada</span>' : ''}</div>
      <div class="availability-row"><span class="availability-pill">${p.stock} ${p.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}</span></div>
      <div class="product-info"><div class="coffee-title"><div><span class="product-type">${escape(p.subtitle || p.brand)}</span><h4 id="title-${escape(p.id)}">${escape(p.name)}</h4></div>${p.weight ? `<span class="weight">${escape(p.weight)}</span>` : ''}</div>
        <dl class="coffee-facts">${fact('Varietal', p.variety)}${fact('Proceso', p.process)}</dl>
        <div class="sensory"><p class="field-label">Notas sensoriales</p>${p.notes ? `<ul class="notes">${p.notes.map(n => `<li>${escape(n)}</li>`).join('')}</ul>` : '<p class="pending-copy">Perfil sensorial por confirmar.</p>'}</div>
        ${details}<div class="product-prices"><div class="price-row"><span>Precio${p.weight ? ' · ' + escape(p.weight) : ''}</span>${price(p)}</div></div>
      </div></article>`;
  }
  function render(family = 'Todos') {
    const visibleBrands = brands.filter(b => family === 'Todos' || b.family === family);
    container.innerHTML = visibleBrands.map(b => {
      const items = products.filter(p => p.brand === b.family);
      const featured = items.filter(p => p.featured);
      const regular = items.filter(p => !p.featured);
      return `<section class="catalog-group group-coffee group-${b.id}" id="${b.id}" aria-labelledby="heading-${b.id}"><div class="brand-heading"><div><p class="section-kicker">${escape(b.label)}</p><h3 id="heading-${b.id}">${escape(b.title)}<span>.</span></h3><p class="brand-subtitle">${escape(b.subtitle)}</p></div><span class="brand-count">${items.length} cafés <span> / </span> ${items.reduce((sum, p) => sum + p.stock, 0)} unidades</span></div>${featured.length ? `<div class="featured-grid">${featured.map(card).join('')}</div>` : ''}<div class="product-grid">${regular.map(card).join('')}</div></section>`;
    }).join('');
    const count = products.filter(p => family === 'Todos' || p.brand === family).length;
    document.querySelector('#catalog-status').textContent = `${count} cafés · ${family === 'Todos' ? '3 marcas' : visibleBrands[0].title}`;
    updateProgress();
  }
  function choose(family) {
    filters.forEach(b => {
      const active = b.dataset.family === family;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    render(family);
  }
  filters.forEach(b => b.addEventListener('click', () => choose(b.dataset.family)));
  document.querySelector('.hero-cta').addEventListener('click', () => choose('Todos'));
  const dialog = document.querySelector('#photo-dialog');
  container.addEventListener('click', e => {
    const button = e.target.closest('[data-photo]');
    if (!button) return;
    const p = products.find(item => item.id === button.dataset.photo);
    document.querySelector('#photo-title').textContent = `${p.name} · ${p.brand}`;
    const img = document.querySelector('#expanded-photo');
    img.src = './' + p.image;
    img.alt = `Bolsa de ${p.name} de ${p.brand}`;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  function updateProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll-progress', `${total > 0 ? Math.min(100, scrollY / total * 100) : 0}%`);
  }
  let frame;
  addEventListener('scroll', () => { if (frame) return; frame = requestAnimationFrame(() => { updateProgress(); frame = null; }); }, { passive: true });
  addEventListener('resize', updateProgress);
  render();
})();
