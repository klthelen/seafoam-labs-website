const HIDE_DISTANCE = 24;
const REVEAL_DISTANCE = 12;
const FOCUS_CLEARANCE = 8;

export interface WikiHeaderState {
  attached: boolean;
  hidden: boolean;
  referenceY: number;
  heldVisible: boolean;
}

interface ScrollInput {
  enabled: boolean;
  scrollY: number;
  maxScrollY: number;
  headerHeight: number;
  interactionActive: boolean;
  focusOverlaps: boolean;
}

interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function clampScrollY(scrollY: number, maxScrollY: number): number {
  return Math.min(Math.max(0, scrollY), Math.max(0, maxScrollY));
}

export function createWikiHeaderState(scrollY: number): WikiHeaderState {
  return {
    attached: scrollY === 0,
    hidden: false,
    referenceY: scrollY,
    heldVisible: false,
  };
}

export function wikiSidebarTop(
  headerHeight: number,
  safeAreaTop: number,
  scrollY: number,
): number {
  return Math.max(safeAreaTop, headerHeight - scrollY);
}

export function overlapsHeader(
  focused: Bounds,
  capsule: Bounds,
  attachedScrollOffset = 0,
): boolean {
  return (
    focused.right + FOCUS_CLEARANCE > capsule.left &&
    focused.left - FOCUS_CLEARANCE < capsule.right &&
    focused.bottom + FOCUS_CLEARANCE > capsule.top - attachedScrollOffset &&
    focused.top - FOCUS_CLEARANCE < capsule.bottom - attachedScrollOffset
  );
}

export function updateWikiHeaderState(
  state: WikiHeaderState,
  input: ScrollInput,
): WikiHeaderState {
  const scrollY = clampScrollY(input.scrollY, input.maxScrollY);
  if (!input.enabled) return createWikiHeaderState(scrollY);

  const referenceY = clampScrollY(state.referenceY, input.maxScrollY);

  // A newly focused page control wins over a popup's pending closing animation.
  if (scrollY > 0 && input.focusOverlaps) {
    return {
      attached: false,
      hidden: true,
      referenceY: scrollY,
      heldVisible: false,
    };
  }

  if (input.interactionActive) {
    return {
      attached: false,
      hidden: false,
      referenceY: scrollY,
      heldVisible: true,
    };
  }
  if (state.heldVisible) return createWikiHeaderState(scrollY);
  if (scrollY === 0) return createWikiHeaderState(0);

  if (state.attached) {
    const greatestY = Math.max(referenceY, scrollY);
    if (greatestY - scrollY >= REVEAL_DISTANCE) {
      return createWikiHeaderState(scrollY);
    }
    // The first departure follows the backdrop, without a hide threshold.
    return {
      attached: true,
      hidden: scrollY >= input.headerHeight,
      referenceY: greatestY,
      heldVisible: false,
    };
  }

  if (state.hidden) {
    const greatestY = Math.max(referenceY, scrollY);
    if (greatestY - scrollY >= REVEAL_DISTANCE) {
      return createWikiHeaderState(scrollY);
    }
    return {
      attached: false,
      hidden: true,
      referenceY: greatestY,
      heldVisible: false,
    };
  }

  const lowestY = Math.min(referenceY, scrollY);
  if (scrollY - lowestY >= HIDE_DISTANCE) {
    return {
      attached: false,
      hidden: true,
      referenceY: scrollY,
      heldVisible: false,
    };
  }
  return {
    attached: false,
    hidden: false,
    referenceY: lowestY,
    heldVisible: false,
  };
}
