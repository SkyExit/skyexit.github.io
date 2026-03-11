'use strict';

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 1) { searchResults.classList.remove('open'); return; }
  if (typeof COUNTRIES === 'undefined') return;

  const matches = [];
  for (const [iso, info] of Object.entries(COUNTRIES)) {
    const searchStr = `${info.name} ${info.name_en} ${info.tld} ${iso}`.toLowerCase();
    if (searchStr.includes(q)) matches.push({ iso, info });
  }
  if (matches.length === 0) { searchResults.classList.remove('open'); return; }

  let html = '';
  for (const m of matches.slice(0, 8)) {
    html += `<div class="search-result-item" onclick="searchSelect('${m.iso}')">
      <span class="sr-flag">${m.info.flag || ''}</span>
      <span class="sr-name">${m.info.name}</span>
      <span class="sr-tld">${m.info.tld}</span>
    </div>`;
  }
  searchResults.innerHTML = html;
  searchResults.classList.add('open');
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => searchResults.classList.remove('open'), 200);
});

window.searchSelect = function(iso) {
  searchInput.value = '';
  searchResults.classList.remove('open');
  openPanel(iso);
  const el = document.getElementById(iso);
  if (el) {
    el.style.fill = 'var(--accent)';
    setTimeout(() => { el.style.fill = ''; }, 800);
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') overlay.classList.remove('open');
});
