/**
 * Asmaan — merch shop cards and merch product page (assets/asmaan-merch-shop.js)
 * Takes over every `[data-merch-buy]` form: adds the picked size through cart/add.js and
 * opens the cart drawer. Without JavaScript the same forms post to /cart/add.
 * Also runs the merch product gallery's photo counter on phones.
 */

(function() {
  'use strict';

  var ROUTES_ROOT = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  function labels(form) {
    var scope = form.closest('[data-merch-labels]') || document.querySelector('[data-merch-labels]');
    var get = function(name, fallback) {
      return (scope && scope.getAttribute('data-label-' + name)) || fallback;
    };
    return {
      pick: get('pick', 'Pick a size first'),
      adding: get('adding', 'Adding…'),
      added: get('added', 'In your bag'),
      error: get('error', "That didn't go through. Try again?")
    };
  }

  function initForm(form) {
    if (form.dataset.merchReady) return;
    form.dataset.merchReady = 'true';
    // The size radios are `required` for the no-JS post; here the button says it instead.
    form.noValidate = true;

    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[role="status"]');
    var sizes = form.querySelector('.mshop_sizes, .mpdp_sizes');
    var idle = button ? button.textContent : '';
    var busy = false;
    var text = labels(form);

    function say(msg) {
      if (!status) return;
      status.textContent = msg || '';
      status.hidden = !msg;
    }

    function reset(delay) {
      clearTimeout(form._resetTimer);
      form._resetTimer = setTimeout(function() {
        if (!busy && button) button.textContent = idle;
      }, delay);
    }

    // Choosing a size clears a "pick a size" nudge straight away.
    form.addEventListener('change', function() {
      if (!busy && button) button.textContent = idle;
      say('');
    });

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      // cart-drawer.js posts every /cart/add form it sees bubble up; this one is handled here.
      event.stopPropagation();
      if (busy || !button) return;

      var data = new FormData(form);
      var id = data.get('id');
      if (!id) {
        button.textContent = text.pick;
        if (sizes) {
          sizes.classList.remove('is-nudged');
          void sizes.offsetWidth;
          sizes.classList.add('is-nudged');
        }
        reset(1600);
        return;
      }

      busy = true;
      say('');
      button.setAttribute('aria-busy', 'true');
      button.textContent = text.adding;

      fetch(ROUTES_ROOT + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id: Number(id), quantity: Number(data.get('quantity')) || 1 }] })
      })
        .then(function(res) {
          return res.json().then(function(body) { return { ok: res.ok, body: body }; });
        })
        .then(function(result) {
          if (!result.ok) throw new Error(result.body.description || result.body.message || text.error);
          button.textContent = text.added;
          if (!window.asmaanCart) {
            window.location.href = ROUTES_ROOT + 'cart';
            return;
          }
          return window.asmaanCart.refresh().then(function() { window.asmaanCart.open(); });
        })
        .catch(function(err) {
          button.textContent = idle;
          say(err && err.message ? err.message : text.error);
        })
        .then(function() {
          busy = false;
          button.removeAttribute('aria-busy');
          reset(2400);
        });
    });
  }

  // Phone gallery: the photos sit in a sideways scroller; keep "1 / 2" in step with it.
  function initGallery(gallery) {
    var track = gallery.querySelector('.mpdp_shots');
    var current = gallery.querySelector('[data-mpdp-current]');
    if (!track || !current) return;
    var shots = Array.from(track.children);
    var tick = false;
    track.addEventListener('scroll', function() {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function() {
        tick = false;
        var index = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
        current.textContent = String(Math.min(index, shots.length - 1) + 1);
      });
    }, { passive: true });
  }

  function init() {
    document.querySelectorAll('[data-merch-buy]').forEach(initForm);
    document.querySelectorAll('[data-mpdp-gallery]').forEach(initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
