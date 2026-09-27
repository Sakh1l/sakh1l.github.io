# Personal Blog

Sakhil's Astro blog, published at [blog.sakhil.in](https://blog.sakhil.in/) through [GitHub Pages](https://github.com/Sakh1l/sakh1l.github.io/actions). The existing Bubblegum theme and layout are preserved.

## Local development

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## Publishing a blog post

1. Add a Markdown file to **this repository's** `content/blog/` directory. Files in other repositories (including `myblog` and `personalblog`) are not read by this site's build.
2. Include the required frontmatter. The date must be an **unquoted** `YYYY-MM-DD` value; `external: false` publishes a local article. Use `draft: true` to keep an unfinished article off the index, RSS feed, and generated pages.

   ```md
   ---
   external: false
   draft: false
   title: My post title
   description: A short description of the article.
   date: 2026-09-27
   ---

   The article text goes here.
   ```

3. Run `npm run build` and check that the route appears under `dist/blog/<filename>/index.html`. The filename becomes the URL slug, including its capitalization.
4. Push the change to `main` (or merge a reviewed PR). The [Deploy to GitHub Pages workflow](https://github.com/Sakh1l/sakh1l.github.io/actions/workflows/deploy.yml) builds and publishes the site. Check that the workflow succeeds, then visit `https://blog.sakhil.in/blog/` and the article URL.

The homepage's **Latest posts** section, Blog index, and RSS feed all derive from the same published-post list. The existing `hello-world.md` is a draft placeholder and is intentionally not published. The older `myblog` repository contains the incomplete original Docker article plus template examples; the reviewed revision is published here as `content/blog/Docker-Build-Ship-Run.md`.

## Other content

- Projects: Markdown files in `content/projects/`
- Talks: Markdown files in `content/talks/`
- Static assets: `public/`
- Routes and components: `src/pages/` and `src/components/`
