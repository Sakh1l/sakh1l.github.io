// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Sakhil's Blog";
export const SITE_DESCRIPTION = "Notes on learning, technology, and life by Sakhil.";
export const TWITTER_HANDLE: string | undefined = undefined;
export const MY_NAME = "Sakhil";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
