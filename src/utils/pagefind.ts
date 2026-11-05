interface PagefindSearch {
  triggerSearch: (term: string) => void;
}

interface SearchOptions {
  pageSize: number;
  showSubResults: boolean;
  excerptLength: number;
}

declare global {
  interface Window {
    PagefindUI: new (options: Record<string, unknown>) => PagefindSearch;
  }
}

export async function createPagefindSearch(
  container: HTMLElement,
  options: SearchOptions,
) {
  // Starlight writes these assets with the index; reuse its installed provider.
  const bundlePath = container.dataset.bundlePath ?? "/pagefind/";
  const pagefind = (await import(
    /* @vite-ignore */ `${bundlePath}pagefind.js`
  )) as {
    init: () => Promise<void>;
    filters: () => Promise<unknown>;
  };
  await pagefind.init();
  // init starts the worker; filters waits for its metadata and WASM to be ready.
  await pagefind.filters();
  await import(/* @vite-ignore */ `${bundlePath}pagefind-ui.js`);

  const stripTrailingSlash = container.hasAttribute(
    "data-strip-trailing-slash",
  );
  // Both Astro search components serialize these values from Starlight's configuration.
  const config = JSON.parse(container.dataset.config ?? "{}") as Record<
    string,
    unknown
  >;
  const translations = JSON.parse(
    container.dataset.translations ?? "{}",
  ) as Record<string, string>;
  const search = new window.PagefindUI({
    ...config,
    ...options,
    element: container,
    baseUrl: import.meta.env.BASE_URL,
    bundlePath,
    showImages: false,
    translations,
    processResult: (result: {
      url: string;
      sub_results: { url: string }[];
    }) => {
      if (stripTrailingSlash) {
        result.url = result.url.replace(/(.)\/(#.*)?$/, "$1$2");
        for (const subResult of result.sub_results) {
          subResult.url = subResult.url.replace(/(.)\/(#.*)?$/, "$1$2");
        }
      }
    },
  });

  const form = container.querySelector("form");
  if (form) {
    form.action = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/search/`;
    form.method = "get";
  }
  const input = container.querySelector("input");
  if (input) input.name = "q";
  const clearButton = container.querySelector<HTMLButtonElement>(
    ".pagefind-ui__search-clear",
  );
  if (clearButton) clearButton.type = "button";
  return search;
}
