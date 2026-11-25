import assert from "node:assert/strict";
import test from "node:test";
import {
  clampScrollY,
  createWikiHeaderState,
  overlapsHeader,
  updateWikiHeaderState,
  wikiSidebarTop,
  type WikiHeaderState,
} from "../src/utils/wiki-header-scroll.ts";

function step(
  state: WikiHeaderState,
  scrollY: number,
  overrides: Partial<Parameters<typeof updateWikiHeaderState>[1]> = {},
) {
  return updateWikiHeaderState(state, {
    enabled: true,
    scrollY,
    maxScrollY: 2000,
    headerHeight: 72,
    interactionActive: false,
    focusOverlaps: false,
    ...overrides,
  });
}

void test("hides after 24px downward and reveals after 12px upward", () => {
  let state = createWikiHeaderState(200);
  state = step(state, 223);
  assert.equal(state.hidden, false);
  state = step(state, 224);
  assert.equal(state.hidden, true);
  state = step(state, 213);
  assert.equal(state.hidden, true);
  state = step(state, 212);
  assert.equal(state.hidden, false);
  assert.equal(step(state, 235).hidden, false);
  assert.equal(step(state, 236).hidden, true);
});

void test("small reversals do not oscillate or discard deliberate travel", () => {
  let state = createWikiHeaderState(200);
  for (const scrollY of [205, 202, 208, 203, 218, 215, 223]) {
    state = step(state, scrollY);
    assert.equal(state.hidden, false);
  }
  state = step(state, 224);
  for (const scrollY of [230, 228, 233, 231, 238, 227]) {
    state = step(state, scrollY);
    assert.equal(state.hidden, true);
  }
  assert.equal(step(state, 226).hidden, false);
});

void test("slow initial departure stays attached to the backdrop from the first pixel", () => {
  let state = createWikiHeaderState(0);
  assert.equal(state.attached, true);
  for (let scrollY = 1; scrollY <= 72; scrollY++) {
    state = step(state, scrollY);
    assert.equal(state.attached, true);
    assert.equal(state.hidden, scrollY >= 72);
    assert.equal(state.referenceY, scrollY);
  }
});

void test("a large first scroll hides with the backdrop without a second departure", () => {
  const state = step(createWikiHeaderState(0), 500);
  assert.equal(state.attached, true);
  assert.equal(state.hidden, true);
  assert.equal(state.referenceY, 500);
  assert.deepEqual(step(state, 500), state);
});

void test("deliberate upward travel reveals a floating capsule during initial departure", () => {
  let state = step(createWikiHeaderState(0), 48);
  state = step(state, 37);
  assert.equal(state.attached, true);
  state = step(state, 36);
  assert.equal(state.attached, false);
  assert.equal(state.hidden, false);
});

void test("a floating capsule stays available while returning through the top segment", () => {
  let state = step(createWikiHeaderState(0), 500);
  state = step(state, 488);
  assert.equal(state.attached, false);
  assert.equal(state.hidden, false);
  for (const scrollY of [300, 100, 72, 48, 12, 1]) {
    state = step(state, scrollY);
    assert.equal(state.attached, false);
    assert.equal(state.hidden, false);
  }
});

void test("actual top reattaches the header and restarts synchronous departure", () => {
  let state = step(createWikiHeaderState(0), 500);
  state = step(state, 488);
  state = step(state, 0);
  assert.equal(state.attached, true);
  assert.equal(state.hidden, false);
  assert.equal(state.referenceY, 0);
  state = step(state, 1);
  assert.equal(state.attached, true);
  state = step(state, 500);
  assert.equal(state.attached, true);
  assert.equal(state.hidden, true);
});

void test("interaction recovery floats an attached capsule and resets later hide travel", () => {
  for (const scrollY of [1, 48, 500]) {
    let state = step(createWikiHeaderState(0), scrollY);
    state = step(state, scrollY, { interactionActive: true });
    assert.equal(state.attached, false);
    assert.equal(state.hidden, false);
    state = step(state, scrollY + 100, { interactionActive: true });
    state = step(state, scrollY + 100);
    assert.equal(state.attached, false);
    assert.equal(step(state, scrollY + 123).hidden, false);
    assert.equal(step(state, scrollY + 124).hidden, true);
  }
});

void test("an active interaction resets downward travel until after release", () => {
  let state = step(createWikiHeaderState(200), 224);
  state = step(state, 300, { interactionActive: true });
  assert.equal(state.hidden, false);
  state = step(state, 500, { interactionActive: true });
  state = step(state, 500);
  assert.equal(state.hidden, false);
  assert.equal(step(state, 523).hidden, false);
  assert.equal(step(state, 524).hidden, true);
});

void test("external focus overlap wins even while a popup is closing", () => {
  let state = createWikiHeaderState(300);
  state = step(state, 300, { interactionActive: true, focusOverlaps: true });
  assert.equal(state.hidden, true);
  state = step(state, 250, { focusOverlaps: true });
  assert.equal(state.hidden, true);
  state = step(state, 250);
  assert.equal(state.hidden, true);
  assert.equal(step(state, 239).hidden, true);
  assert.equal(step(state, 238).hidden, false);
});

void test("focus overlap does not hide the full top bar", () => {
  assert.equal(
    step(createWikiHeaderState(0), 0, { focusOverlaps: true }).hidden,
    false,
  );
});

void test("focus wins over a floating capsule within the original top segment", () => {
  const state = step(createWikiHeaderState(48), 48, { focusOverlaps: true });
  assert.equal(wikiSidebarTop(72, 0, 48), 24);
  assert.equal(state.hidden, true);
  assert.equal(step(state, 48, { focusOverlaps: true }).hidden, true);
  assert.equal(step(state, 48).hidden, true);
  assert.equal(step(state, 36).hidden, false);
  assert.equal(step(state, 36).attached, false);
});

void test("overscroll and a shortened document do not produce rebound toggles", () => {
  assert.equal(clampScrollY(-50, 2000), 0);
  assert.equal(clampScrollY(2050, 2000), 2000);
  assert.equal(clampScrollY(20, -10), 0);
  let state = step(createWikiHeaderState(1900), 2000);
  state = step(state, 2050);
  assert.equal(state.referenceY, 2000);
  assert.equal(step(state, 2000).hidden, true);
  state = step(state, 1800, { maxScrollY: 1800 });
  assert.equal(state.hidden, true);
  assert.equal(state.referenceY, 1800);
});

void test("a stationary document never accumulates another direction change", () => {
  let state = step(createWikiHeaderState(200), 224);
  for (let index = 0; index < 10; index++) {
    state = step(state, 224);
    assert.equal(state.hidden, true);
  }
});

void test("disable, re-enable, and restoration reset to shown at the current position", () => {
  let state = step(createWikiHeaderState(200), 224);
  state = step(state, 500, { enabled: false });
  assert.equal(state.hidden, false);
  assert.equal(state.referenceY, 500);
  assert.equal(step(state, 500).hidden, false);
  assert.equal(step(state, 523).hidden, false);
  assert.equal(step(state, 524).hidden, true);
  assert.deepEqual(createWikiHeaderState(800), {
    attached: false,
    hidden: false,
    referenceY: 800,
    heldVisible: false,
  });
});

void test("column offset depends on document position, never capsule visibility", () => {
  assert.equal(wikiSidebarTop(72, 0, 0), 72);
  assert.equal(wikiSidebarTop(72, 0, 24), 48);
  assert.equal(wikiSidebarTop(72, 0, 72), 0);
  assert.equal(wikiSidebarTop(72, 0, 800), 0);
  assert.equal(wikiSidebarTop(92, 20, 24), 68);
  assert.equal(wikiSidebarTop(92, 20, 72), 20);
  assert.equal(wikiSidebarTop(92, 20, 800), 20);
  assert.equal(wikiSidebarTop(120, 0, 48), 72);
});

void test("overlap includes the focus outline clearance and both axes", () => {
  const capsule = { top: 4, right: 1300, bottom: 68, left: 100 };
  assert.equal(
    overlapsHeader({ top: 20, right: 200, bottom: 50, left: 120 }, capsule),
    true,
  );
  assert.equal(
    overlapsHeader({ top: 75, right: 200, bottom: 100, left: 120 }, capsule),
    true,
  );
  assert.equal(
    overlapsHeader({ top: 76, right: 200, bottom: 100, left: 120 }, capsule),
    false,
  );
  assert.equal(
    overlapsHeader({ top: 20, right: 90, bottom: 50, left: 10 }, capsule),
    false,
  );
  assert.equal(
    overlapsHeader({ top: 20, right: 1400, bottom: 50, left: 1308 }, capsule),
    false,
  );
});

void test("focus overlap follows the proposed attached or floating position", () => {
  const capsule = { top: 4, right: 1300, bottom: 68, left: 100 };
  const firstSidebarLink = { top: 40, right: 200, bottom: 72, left: 120 };
  assert.equal(overlapsHeader(firstSidebarLink, capsule, 48), false);
  assert.equal(overlapsHeader(firstSidebarLink, capsule), true);

  let state = step(createWikiHeaderState(0), 48, {
    focusOverlaps: overlapsHeader(firstSidebarLink, capsule, 48),
  });
  assert.equal(state.attached, true);

  // Twelve pixels upward would float the capsule over the link's new position.
  const movedSidebarLink = { ...firstSidebarLink, top: 52, bottom: 84 };
  const proposed = step(state, 36);
  assert.equal(proposed.attached, false);
  state = step(state, 36, {
    focusOverlaps: overlapsHeader(movedSidebarLink, capsule),
  });
  assert.equal(state.hidden, true);
});
