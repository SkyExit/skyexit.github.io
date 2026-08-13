# SkyExit Pages

Central landing page for the websites published from the repositories owned by
[`SkyExit`](https://github.com/SkyExit).

The hub itself is available at <https://skyexit.github.io/>. Every linked site
is built and deployed independently from its own repository; this repository
only contains the directory page.

## Add a project

Add one object to `projects.js`:

```js
{
  slug: 'Example',
  title: 'Example project',
  description: 'A short explanation of the website.',
  siteUrl: 'https://skyexit.github.io/Example/',
  repoUrl: 'https://github.com/SkyExit/Example',
  tags: ['TypeScript', 'Tool'],
}
```

The project repository remains responsible for its own GitHub Pages build and
must work below `/<repository-name>/`.

## Deployment

Pushes to `main` publish the static files through GitHub Actions. The workflow
contains no application builds and does not copy source code from linked
projects.
