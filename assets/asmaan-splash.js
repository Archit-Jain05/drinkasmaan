/**
 * Asmaan splash screen — behaviour for sections/asmaan-splash.liquid.
 *
 * Dependency-free on purpose. Registering a bare specifier would mean editing
 * snippets/scripts.liquid, so the section loads this file by URL instead and
 * this module imports nothing.
 *
 * The section's inline boot script has already decided whether this visit gets
 * a splash and locked the page; by the time this module runs the curtain is
 * on screen. All that is left is to count up and get out of the way.
 */

const DONE_EVENT = 'asmaan:splash:done';
const STATE_ATTRIBUTE = 'data-asmaan-splash';

/** Tells the boot script's failsafe that this module is driving the splash. */
const LIVE_ATTRIBUTE = 'data-asmaan-splash-live';

/** Progress stalls here until the page is genuinely ready, like a real loader. */
const STALL_AT = 92;

/**
 * @param {string | undefined} value
 * @param {number} fallback
 * @returns {number}
 */
function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** @returns {boolean} */
function motionAllowed() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Resolves once the browser has finished the initial page load, or straight
 * away if that already happened while this module was being fetched.
 *
 * @returns {Promise<void>}
 */
function pageLoaded() {
  if (document.readyState === 'complete') return Promise.resolve();

  /** @type {Promise<void>} */
  const loaded = new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });

  return loaded;
}

/**
 * Resolves when the splash's own artwork is on screen, so the curtain never
 * pulls away from a half-painted can.
 *
 * @param {HTMLElement} root
 * @returns {Promise<void>}
 */
function mediaLoaded(root) {
  const media = root.querySelector('[data-asmaan-splash-media]');

  if (media instanceof HTMLImageElement) {
    if (media.complete) return Promise.resolve();

    /** @type {Promise<void>} */
    const settled = new Promise((resolve) => {
      media.addEventListener('load', () => resolve(), { once: true });
      media.addEventListener('error', () => resolve(), { once: true });
    });

    return settled;
  }

  if (media instanceof HTMLVideoElement) {
    if (media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();

    /** @type {Promise<void>} */
    const settled = new Promise((resolve) => {
      media.addEventListener('canplay', () => resolve(), { once: true });
      media.addEventListener('error', () => resolve(), { once: true });
    });

    return settled;
  }

  return Promise.resolve();
}

/**
 * Runs the counter. Ramps toward {@link STALL_AT} on a curve while the page is
 * still working, then releases to 100 once everything has reported in.
 *
 * @param {HTMLElement} root
 * @param {{ min: number, max: number }} timing
 * @returns {Promise<void>} resolves when the readout reaches 100
 */
function countUp(root, timing) {
  const percentElement = root.querySelector('[data-asmaan-splash-percent]');
  const barElement = root.querySelector('[data-asmaan-splash-bar]');

  let ready = false;
  Promise.all([pageLoaded(), mediaLoaded(root)]).then(() => {
    ready = true;
  });

  /** @type {Promise<void>} */
  const counted = new Promise((resolve) => {
    const start = performance.now();
    let value = 0;
    let previous = start;

    /** @param {number} now */
    const frame = (now) => {
      const elapsed = now - start;
      const delta = now - previous;
      previous = now;

      // A visit that never fires load (a stalled third-party script, say) still
      // has to end. Past the ceiling we stop waiting and let it through.
      const released = (ready && elapsed >= timing.min) || elapsed >= timing.max;

      const ramp = 1 - Math.pow(1 - Math.min(elapsed / timing.min, 1), 3);
      const target = released ? 100 : ramp * STALL_AT;

      // Chase the target rather than snapping to it, so a late-arriving load
      // event reads as the counter accelerating instead of jumping.
      value += (target - value) * Math.min(1, delta / 160);
      if (released && 100 - value < 0.4) value = 100;

      const rounded = Math.round(value);
      if (percentElement) percentElement.textContent = `${rounded}%`;
      if (barElement instanceof HTMLElement) barElement.style.transform = `scaleX(${value / 100})`;
      root.setAttribute('aria-valuenow', String(rounded));

      if (value >= 100) {
        resolve();
        return;
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  });

  return counted;
}

/**
 * Wipes the curtain off the top of the screen and hands the page back.
 *
 * @param {HTMLElement} root
 * @param {{ reveal: number }} timing
 * @returns {Promise<void>}
 */
function reveal(root, timing) {
  const curtain = root.querySelector('[data-asmaan-splash-curtain]');
  const accent = root.querySelector('[data-asmaan-splash-accent]');
  const stage = root.querySelector('[data-asmaan-splash-stage]');
  const foot = root.querySelector('[data-asmaan-splash-foot]');

  const finish = () => {
    root.hidden = true;
    document.documentElement.removeAttribute(STATE_ATTRIBUTE);
    document.documentElement.removeAttribute(LIVE_ATTRIBUTE);
    document.dispatchEvent(new CustomEvent(DONE_EVENT));
  };

  if (!(curtain instanceof HTMLElement) || typeof curtain.animate !== 'function' || !motionAllowed()) {
    finish();
    return Promise.resolve();
  }

  /** @type {KeyframeAnimationOptions} */
  const fade = { duration: 380, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' };

  // Contents clear out first, then the panels follow one after the other.
  for (const element of [stage, foot]) {
    if (element instanceof HTMLElement) {
      element.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-1.5rem)' }], fade);
    }
  }

  const wipe = [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }];

  /** @type {KeyframeAnimationOptions} */
  const options = { duration: timing.reveal, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', fill: 'forwards' };

  const front = curtain.animate(wipe, { ...options, delay: 220 });
  const trailing = accent instanceof HTMLElement ? accent.animate(wipe, { ...options, delay: 340 }) : front;

  return trailing.finished.catch(() => undefined).then(finish);
}

/**
 * @param {HTMLElement} root
 * @returns {Promise<void>}
 */
async function run(root) {
  if (root.dataset.running === 'true') return;
  root.dataset.running = 'true';

  const timing = {
    min: number(root.dataset.minDuration, 1400),
    max: number(root.dataset.maxDuration, 7000),
    reveal: number(root.dataset.revealDuration, 900),
  };

  // Nothing to count for somebody who asked for less motion — show the brand
  // for a beat so the visit still has a front door, then get out.
  if (!motionAllowed()) {
    /** @type {Promise<void>} */
    const beat = new Promise((resolve) => setTimeout(resolve, Math.min(timing.min, 800)));
    await beat;
    await reveal(root, timing);
    return;
  }

  await countUp(root, timing);
  await reveal(root, timing);
}

/** @param {ParentNode} [scope] */
function init(scope = document) {
  const root = scope.querySelector('[data-asmaan-splash-root]');
  if (!(root instanceof HTMLElement)) return;
  if (!document.documentElement.hasAttribute(STATE_ATTRIBUTE)) return;

  document.documentElement.setAttribute(LIVE_ATTRIBUTE, '');
  run(root);
}

init();

// Theme editor: let the merchant replay the splash by selecting the section,
// and re-run it when the section is re-rendered after a setting change.
if (window.Shopify?.designMode) {
  /** @param {Event} event */
  const replay = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const root = target.querySelector('[data-asmaan-splash-root]');
    if (!(root instanceof HTMLElement)) return;

    root.hidden = false;
    root.dataset.running = 'false';
    document.documentElement.setAttribute(STATE_ATTRIBUTE, 'preview');
    init(target);
  };

  document.addEventListener('shopify:section:load', replay);
  document.addEventListener('shopify:section:select', replay);
}
