(function () {
  'use strict';

  const grid = document.querySelector('#projects-grid');
  const count = document.querySelector('#project-count');
  const error = document.querySelector('#load-error');
  const year = document.querySelector('#year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function makeAction(label, url, variant) {
    const link = document.createElement('a');
    const arrow = document.createElement('span');

    link.className = `card-action ${variant}`;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.append(document.createTextNode(label));

    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(arrow);

    return link;
  }

  function makeCard(project, index) {
    const card = document.createElement('article');
    const topline = document.createElement('div');
    const number = document.createElement('p');
    const status = document.createElement('span');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const tags = document.createElement('ul');
    const actions = document.createElement('div');

    card.className = 'project-card';
    card.dataset.project = project.slug;
    topline.className = 'card-topline';
    number.className = 'card-number';
    number.textContent = String(index + 1).padStart(2, '0');
    status.className = 'status-dot';
    status.textContent = 'Live';
    topline.append(number, status);

    title.textContent = project.title;
    description.className = 'project-description';
    description.textContent = project.description;

    tags.className = 'tags';
    project.tags.forEach((tag) => {
      const item = document.createElement('li');
      item.textContent = tag;
      tags.append(item);
    });

    actions.className = 'card-actions';
    actions.append(
      makeAction('Website öffnen', project.siteUrl, 'primary'),
      makeAction('Repository', project.repoUrl, 'secondary'),
    );

    card.append(topline, title, description, tags, actions);
    return card;
  }

  try {
    const projects = window.SKYPAGES_PROJECTS;

    if (!grid || !count || !Array.isArray(projects) || projects.length === 0) {
      throw new Error('No projects configured.');
    }

    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => fragment.append(makeCard(project, index)));
    grid.replaceChildren(fragment);
    count.textContent = `${projects.length} ${projects.length === 1 ? 'Projekt' : 'Projekte'}`;
  } catch (renderError) {
    if (count) count.textContent = 'Nicht verfügbar';
    if (error) error.hidden = false;
    console.error('Project list could not be rendered.', renderError);
  }
})();
