import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const provider = readFileSync(
  new URL("../src/components/overrides/ThemeProvider.astro", import.meta.url),
  "utf8",
);
const inlineScript = /<script is:inline>([\s\S]*?)<\/script>/.exec(
  provider,
)?.[1];
assert.ok(
  inlineScript,
  "Theme initialization must run inline before first paint.",
);
const script = inlineScript;

function initializeTheme(matches: boolean, storedTheme: string) {
  const document = { documentElement: { dataset: { theme: "dark" } } };
  const listeners: (() => void)[] = [];
  const preference = {
    matches,
    addEventListener(event: string, listener: () => void) {
      assert.equal(event, "change");
      listeners.push(listener);
    },
  };
  const window = {
    matchMedia(query: string) {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return preference;
    },
    localStorage: {
      getItem() {
        return storedTheme;
      },
      setItem() {
        assert.fail("The system theme must not overwrite stored preferences.");
      },
    },
  };

  runInNewContext(script, {
    document,
    window,
    localStorage: window.localStorage,
  });
  return { document, preference, listeners };
}

await test("the system preference takes precedence over an old manual choice", () => {
  const light = initializeTheme(false, "dark");
  const dark = initializeTheme(true, "light");
  assert.equal(light.document.documentElement.dataset.theme, "light");
  assert.equal(dark.document.documentElement.dataset.theme, "dark");
});

await test("system changes update the existing document in both directions", () => {
  const { document, preference, listeners } = initializeTheme(false, "dark");
  assert.equal(listeners.length, 1);
  const onChange = listeners[0];
  assert.ok(onChange);
  preference.matches = true;
  onChange();
  assert.equal(document.documentElement.dataset.theme, "dark");
  preference.matches = false;
  onChange();
  assert.equal(document.documentElement.dataset.theme, "light");
});

await test("an unavailable preference API falls back to light", () => {
  const document = { documentElement: { dataset: { theme: "dark" } } };
  runInNewContext(script, { document, window: {} });
  assert.equal(document.documentElement.dataset.theme, "light");
});

await test("initialization works when browser storage is inaccessible", () => {
  const document = { documentElement: { dataset: { theme: "dark" } } };
  const context = {
    document,
    window: {
      matchMedia: () => ({
        matches: false,
        addEventListener() {
          // This case checks initialization; change events are tested above.
        },
      }),
    },
  };
  Object.defineProperty(context, "localStorage", {
    get() {
      return assert.fail(
        "System theme initialization must not require browser storage.",
      );
    },
  });
  Object.defineProperty(context.window, "localStorage", {
    get() {
      return assert.fail(
        "System theme initialization must not require browser storage.",
      );
    },
  });
  runInNewContext(script, context);
  assert.equal(document.documentElement.dataset.theme, "light");
});
