'use strict';

function showTooltip(iso, e) {
  if (typeof COUNTRIES === 'undefined') return;
  const info = COUNTRIES[iso];
  if (!info) return;
  GeoApp.currentCountry = iso;

  const flagEl = document.getElementById('tooltip-flag');
  if (info.flag_image) {
    flagEl.innerHTML = `<img src="${info.flag_image}" alt="${info.name}">`;
  } else {
    flagEl.textContent = info.flag || '';
  }

  document.getElementById('tooltip-name').textContent = info.name || iso;
  document.getElementById('tooltip-tld').textContent = info.tld || '';

  const drivingText = info.driving === 'left' ? 'Linksverkehr' : 'Rechtsverkehr';
  const sideClass = info.driving === 'left' ? 'left' : 'right';
  document.getElementById('tooltip-driving').innerHTML =
    `<span class="side-icon ${sideClass}"></span>${drivingText}`;

  moveTooltip(e);
  tooltip.classList.add('show');
}

function moveTooltip(e) {
  const x = e.clientX + 16;
  const y = e.clientY - 10;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  const finalX = (x + tw > window.innerWidth - 10) ? e.clientX - tw - 16 : x;
  const finalY = (y + th > window.innerHeight - 10) ? e.clientY - th - 10 : y;
  tooltip.style.left = finalX + 'px';
  tooltip.style.top  = finalY + 'px';
}

function hideTooltip() {
  tooltip.classList.remove('show');
  GeoApp.currentCountry = null;
}
