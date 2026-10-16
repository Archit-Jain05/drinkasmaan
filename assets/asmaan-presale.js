/**
 * Asmaan — presale box sales page (assets/asmaan-presale.js)
 * - Opens the box lid (a hinged 3D swing) as the hero scrolls (--lift 0 → 1 on the hero).
 * - Quantity steppers: keep every buy block on the same count and point the
 *   "Claim" links at the matching cart permalink (/cart/<variant>:<qty> → checkout).
 * - Shows the bottom bar between the hero and the closing buy block.
 * Without JavaScript the lid shows shut, and each Claim link checks out one box.
 */

(function() {
  'use strict';

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t * t * (3 - 2 * t); }

  function init(root) {
    if (root.dataset.psbReady) return;
    root.dataset.psbReady = 'true';

    var hero = root.querySelector('[data-psb-hero]');
    var frame = root.querySelector('[data-psb-frame]');
    var close = root.querySelector('[data-psb-close]');
    var bar = root.querySelector('[data-psb-bar]');
    var pinned = window.matchMedia('(min-width: 990px)');
    var still = window.matchMedia('(prefers-reduced-motion: reduce)');

    // --- Lid and bar ---------------------------------------------------------
    var queued = false;
    function frameTick() {
      queued = false;
      var vh = window.innerHeight;

      if (hero && frame) {
        var lift;
        if (still.matches) {
          lift = 1;
        } else if (pinned.matches) {
          // The hero is pinned for (its height − one screen); the lid opens over most of that and
          // the open box is held for the last stretch.
          var r = hero.getBoundingClientRect();
          var span = Math.max(r.height - vh, 1);
          lift = ease(clamp((-r.top / span - 0.03) / 0.64));
        } else {
          // Phones: no pin; the lid opens over the first stretch of scroll.
          lift = ease(clamp((-hero.getBoundingClientRect().top - 16) / (vh * 0.6)));
        }
        hero.style.setProperty('--lift', lift.toFixed(4));
      }

      if (bar) {
        var past = hero ? hero.getBoundingClientRect().bottom < vh * 0.4 : true;
        var before = close ? close.getBoundingClientRect().top > vh * 0.85 : true;
        bar.classList.toggle('is-on', past && before);
      }
    }
    function queue() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(frameTick);
    }
    if (bar) bar.hidden = false;
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    frameTick();

    // --- Quantity --------------------------------------------------------------
    var buys = Array.prototype.slice.call(root.querySelectorAll('[data-psb-buy]'));
    if (!buys.length) return;
    var variant = buys[0].getAttribute('data-variant');
    var cart = buys[0].getAttribute('data-cart') || '/cart';
    var max = parseInt(buys[0].getAttribute('data-max'), 10) || 1;
    var unit = parseInt(root.getAttribute('data-price'), 10) || 0;
    var totals = root.querySelectorAll('[data-psb-total]');
    var shown = totals.length ? totals[0].textContent.trim() : '';
    var qty = 1;

    function money(cents) {
      // Reuse the store's own rendering (symbol, spacing) and swap only the number in it.
      var amount = cents / 100;
      var text = amount % 1 === 0
        ? amount.toLocaleString('en-IN')
        : amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return shown.replace(/[\d][\d,.]*/, text);
    }

    function render() {
      root.querySelectorAll('[data-psb-qty]').forEach(function(el) { el.textContent = String(qty); });
      root.querySelectorAll('[data-psb-step]').forEach(function(btn) {
        var step = parseInt(btn.getAttribute('data-psb-step'), 10);
        btn.disabled = step < 0 ? qty <= 1 : qty >= max;
      });
      root.querySelectorAll('[data-psb-cta]').forEach(function(a) {
        a.href = cart + '/' + variant + ':' + qty;
      });
      if (unit && shown) totals.forEach(function(el) { el.textContent = money(unit * qty); });
    }

    root.addEventListener('click', function(event) {
      var btn = event.target.closest('[data-psb-step]');
      if (!btn || !root.contains(btn)) return;
      var next = qty + parseInt(btn.getAttribute('data-psb-step'), 10);
      if (next < 1 || next > max) return;
      qty = next;
      render();
    });
    render();
  }

  function boot() {
    document.querySelectorAll('[data-psb]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('shopify:section:load', boot);
})();
