import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { appearanceOptions, paletteOptions } from "../src/data/appearance.ts";

const provider = readFileSync(
  new URL("../src/components/overrides/ThemeProvider.astro", import.meta.url),
  "utf8",
);
const inlineScript =
  /<script\b[\s\S]*?\bis:inline\b[\s\S]*?>\s*(\(\(\) => \{[\s\S]*?)<\/script>/.exec(
    provider,
  )?.[1];
assert.ok(
  inlineScript,
  "Theme initialization must run inline before first paint.",
);
const script = inlineScript;

interface PreferenceControls {
  querySelector(selector: string): { textContent: string };
}

class PreferenceInput {
  name: string;
  value: string;
  checked = true;
  controls: PreferenceControls | null;

  constructor(
    name: string,
    value: string,
    controls: PreferenceControls | null,
  ) {
    this.name = name;
    this.value = value;
    this.controls = controls;
  }

  closest(selector: string) {
    assert.equal(selector, "site-preferences");
    return this.controls;
  }
}

interface EnvironmentOptions {
  dark?: boolean;
  preferenceAvailable?: boolean;
  stored?: Record<string, string>;
  readBlocked?: boolean;
  writeBlocked?: boolean;
}

function initializePreferences(options: EnvironmentOptions = {}) {
  const dataset: Record<string, string> = { theme: "dark" };
  const deviceListeners: (() => void)[] = [];
  const changeListeners: ((event: { target: unknown }) => void)[] = [];
  const status = { textContent: "" };
  const controls: PreferenceControls = {
    querySelector(selector) {
      assert.equal(selector, "[role='status']");
      return status;
    },
  };
  const storage = new Map(Object.entries(options.stored ?? {}));
  const storageReads: string[] = [];
  const storageWrites: [string, string][] = [];
  const storageAccess = {
    readBlocked: options.readBlocked ?? false,
    writeBlocked: options.writeBlocked ?? false,
  };
  const preference = {
    matches: options.dark ?? false,
    addEventListener(event: string, listener: () => void) {
      assert.equal(event, "change");
      deviceListeners.push(listener);
    },
  };
  const document = {
    documentElement: { dataset },
    addEventListener(
      event: string,
      listener: (event: { target: unknown }) => void,
    ) {
      assert.equal(event, "change");
      changeListeners.push(listener);
    },
  };
  const window =
    options.preferenceAvailable === false
      ? {}
      : {
          matchMedia(query: string) {
            assert.equal(query, "(prefers-color-scheme: dark)");
            return preference;
          },
        };
  const localStorage = {
    getItem(key: string) {
      storageReads.push(key);
      if (storageAccess.readBlocked) {
        throw new Error("Storage reads are blocked.");
      }
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (storageAccess.writeBlocked) {
        throw new Error("Storage writes are blocked.");
      }
      storage.set(key, value);
      storageWrites.push([key, value]);
    },
  };

  runInNewContext(script, {
    document,
    window,
    localStorage,
    HTMLInputElement: PreferenceInput,
    appearanceValues: appearanceOptions.map(({ value }) => value),
    paletteValues: paletteOptions.map(({ value }) => value),
  });

  function dispatchChange(target: unknown) {
    for (const listener of changeListeners) listener({ target });
  }

  function selectPreference(name: string, value: string) {
    dispatchChange(new PreferenceInput(name, value, controls));
  }

  function changeDeviceTheme(dark: boolean) {
    preference.matches = dark;
    for (const listener of deviceListeners) listener();
  }

  return {
    dataset,
    controls,
    status,
    storage,
    storageAccess,
    storageReads,
    storageWrites,
    deviceListeners,
    dispatchChange,
    selectPreference,
    changeDeviceTheme,
  };
}

await test("defaults follow the device with Classic and ignore legacy preferences", () => {
  for (const dark of [false, true]) {
    const environment = initializePreferences({
      dark,
      stored: { "starlight-theme": dark ? "light" : "dark" },
    });
    assert.deepEqual(environment.dataset, {
      appearance: "auto",
      palette: "classic",
      theme: dark ? "dark" : "light",
    });
    assert.deepEqual(environment.storageReads, [
      "seafoam-appearance",
      "seafoam-palette",
    ]);
    assert.deepEqual(environment.storageWrites, []);
  }
});

await test("saved appearance and palette choices apply during initialization", () => {
  for (const appearance of appearanceOptions) {
    for (const palette of paletteOptions) {
      const environment = initializePreferences({
        dark: true,
        stored: {
          "seafoam-appearance": appearance.value,
          "seafoam-palette": palette.value,
        },
      });
      assert.deepEqual(environment.dataset, {
        appearance: appearance.value,
        palette: palette.value,
        theme: appearance.value === "light" ? "light" : "dark",
      });
      assert.deepEqual(environment.storageWrites, []);
    }
  }
});

await test("invalid stored values fall back independently", () => {
  const invalidAppearance = initializePreferences({
    stored: {
      "seafoam-appearance": "invalid",
      "seafoam-palette": "sea-glass",
    },
  });
  assert.deepEqual(invalidAppearance.dataset, {
    appearance: "auto",
    palette: "sea-glass",
    theme: "light",
  });

  const invalidPalette = initializePreferences({
    stored: {
      "seafoam-appearance": "dark",
      "seafoam-palette": "invalid",
    },
  });
  assert.deepEqual(invalidPalette.dataset, {
    appearance: "dark",
    palette: "classic",
    theme: "dark",
  });
});

await test("an unavailable device preference falls back to light but permits explicit choices", () => {
  const environment = initializePreferences({ preferenceAvailable: false });
  assert.equal(environment.dataset.theme, "light");
  assert.equal(environment.deviceListeners.length, 0);
  environment.selectPreference("appearance", "dark");
  assert.equal(environment.dataset.theme, "dark");
  environment.selectPreference("appearance", "auto");
  assert.equal(environment.dataset.theme, "light");
});

await test("automatic appearance follows device changes without persisting the resolved theme", () => {
  const environment = initializePreferences();
  assert.equal(environment.deviceListeners.length, 1);
  environment.changeDeviceTheme(true);
  assert.equal(environment.dataset.theme, "dark");
  environment.changeDeviceTheme(false);
  assert.equal(environment.dataset.theme, "light");
  assert.equal(environment.dataset.appearance, "auto");
  assert.deepEqual(environment.storageWrites, []);
});

await test("explicit appearance resists device changes and returning to auto resumes them", () => {
  for (const appearance of ["light", "dark"]) {
    const environment = initializePreferences();
    environment.selectPreference("appearance", appearance);
    environment.changeDeviceTheme(true);
    assert.equal(environment.dataset.theme, appearance);
    environment.changeDeviceTheme(false);
    assert.equal(environment.dataset.theme, appearance);

    environment.selectPreference("appearance", "auto");
    assert.equal(environment.dataset.theme, "light");
    environment.changeDeviceTheme(true);
    assert.equal(environment.dataset.theme, "dark");
    assert.equal(environment.storage.get("seafoam-appearance"), "auto");
  }
});

await test("palette and appearance choices remain independent and persist across visits", () => {
  const environment = initializePreferences();
  environment.selectPreference("appearance", "dark");
  environment.selectPreference("palette", "sea-glass");
  assert.deepEqual(environment.dataset, {
    appearance: "dark",
    palette: "sea-glass",
    theme: "dark",
  });
  environment.selectPreference("appearance", "light");
  assert.equal(environment.dataset.palette, "sea-glass");
  assert.deepEqual(environment.storageWrites, [
    ["seafoam-appearance", "dark"],
    ["seafoam-palette", "sea-glass"],
    ["seafoam-appearance", "light"],
  ]);

  const nextVisit = initializePreferences({
    dark: true,
    stored: Object.fromEntries(environment.storage),
  });
  assert.deepEqual(nextVisit.dataset, environment.dataset);
  assert.equal(environment.status.textContent, "");
});

await test("blocked storage reads retain usable automatic appearance and Classic defaults", () => {
  const environment = initializePreferences({
    dark: true,
    readBlocked: true,
    stored: {
      "seafoam-appearance": "light",
      "seafoam-palette": "sea-glass",
    },
  });
  assert.deepEqual(environment.dataset, {
    appearance: "auto",
    palette: "classic",
    theme: "dark",
  });
  environment.changeDeviceTheme(false);
  assert.equal(environment.dataset.theme, "light");
  assert.deepEqual(environment.storageWrites, []);
});

await test("blocked storage writes apply choices for the page and announce persistence failure", () => {
  const environment = initializePreferences({ writeBlocked: true });
  environment.selectPreference("appearance", "dark");
  assert.equal(environment.dataset.theme, "dark");
  assert.equal(
    environment.status.textContent,
    "Your choice applies to this page, but your browser could not save it.",
  );
  environment.selectPreference("palette", "sea-glass");
  assert.equal(environment.dataset.palette, "sea-glass");
  assert.deepEqual(environment.storageWrites, []);
  assert.equal(environment.storage.size, 0);

  environment.storageAccess.writeBlocked = false;
  environment.selectPreference("palette", "classic");
  assert.equal(environment.storage.get("seafoam-palette"), "classic");
  assert.equal(environment.status.textContent, "");
});

await test("unrelated, unchecked, and invalid changes do not alter preferences or storage", () => {
  const environment = initializePreferences();
  const unchecked = new PreferenceInput(
    "appearance",
    "dark",
    environment.controls,
  );
  unchecked.checked = false;
  environment.dispatchChange(unchecked);
  environment.dispatchChange(new PreferenceInput("appearance", "dark", null));
  environment.dispatchChange({
    name: "appearance",
    value: "dark",
    checked: true,
  });
  environment.selectPreference("appearance", "invalid");
  environment.selectPreference("palette", "invalid");
  environment.selectPreference("unrelated", "dark");
  assert.deepEqual(environment.dataset, {
    appearance: "auto",
    palette: "classic",
    theme: "light",
  });
  assert.deepEqual(environment.storageWrites, []);
  assert.equal(environment.status.textContent, "");
});
