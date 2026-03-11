'use strict';

function openPanel(iso) {
  if (typeof COUNTRIES === 'undefined') return;
  const info = COUNTRIES[iso];
  if (!info) return;

  const flagEl = document.getElementById('panel-flag');
  if (info.flag_image) {
    flagEl.innerHTML = `<img src="${info.flag_image}" alt="${info.name}">`;
  } else {
    flagEl.textContent = info.flag || '';
  }

  document.getElementById('panel-title').textContent = info.name || iso;
  document.getElementById('panel-subtitle').textContent =
    (info.name_en || '') + (info.continent ? ' — ' + info.continent : '');

  const drivingLabel = info.driving === 'left' ? 'Linksverkehr' : 'Rechtsverkehr';
  const drivingClass = info.driving === 'left' ? 'left' : 'right';
  const drivingIcon  = info.driving === 'left'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l-7 7 7 7"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';

  let html = '<div class="info-grid">';
  html += `<div class="info-card"><div class="info-label">Webseitenendung</div><div class="info-value accent">${info.tld || '—'}</div></div>`;
  html += `<div class="info-card"><div class="info-label">Hauptstadt</div><div class="info-value">${info.capital || '—'}</div></div>`;
  html += `<div class="info-card"><div class="info-label">Verkehrsseite</div><div class="info-value"><span class="driving-badge ${drivingClass}">${drivingIcon} ${drivingLabel}</span></div></div>`;
  html += `<div class="info-card"><div class="info-label">ISO-Code</div><div class="info-value">${iso}</div></div>`;
  html += '</div>';

  if (info.plate_image) {
    html += '<div class="panel-section-title">Kennzeichen</div>';
    html += `<div class="panel-plate-wrap"><img src="${info.plate_image}" alt="Kennzeichen ${info.name}"></div>`;
  }
  if (info.road_sign_image) {
    html += '<div class="panel-section-title">Straßenschilder</div>';
    html += `<div class="panel-images"><div class="panel-img-wrap"><img src="${info.road_sign_image}" alt="Straßenschilder ${info.name}"><div class="panel-img-caption">Straßenschilder — ${info.name}</div></div></div>`;
  }
  if (info.custom_images && info.custom_images.length > 0) {
    html += '<div class="panel-section-title">Bilder</div><div class="panel-images">';
    for (const img of info.custom_images) {
      html += `<div class="panel-img-wrap"><img src="${img.src}" alt="${img.caption || ''}"><div class="panel-img-caption">${img.caption || ''}</div></div>`;
    }
    html += '</div>';
  }
  if (info.additional_info) {
    html += '<div class="panel-section-title">Weitere Informationen</div>';
    html += `<div class="panel-additional">${info.additional_info}</div>`;
  }

  document.getElementById('panel-body').innerHTML = html;
  overlay.classList.add('open');
  document.getElementById('info-panel').scrollTop = 0;
}

function closePanel(e, force) {
  if (force || e.target === overlay) overlay.classList.remove('open');
}
window.closePanel = closePanel;
