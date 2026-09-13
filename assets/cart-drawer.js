/**
 * Asmaan / Aura High-Performance AJAX Cart Drawer
 */
(function () {
  'use strict';

  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-drawer-overlay');
  var closeBtn = document.getElementById('cart-drawer-close');

  function openCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('translate-x-full');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.add('translate-x-full');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.getAttribute('aria-hidden') === 'false') {
      closeCart();
    }
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-cart-drawer-toggle]');
    if (trigger) {
      e.preventDefault();
      openCart();
    }
    var continueBtn = e.target.closest('[data-cart-continue-btn]');
    if (continueBtn) {
      e.preventDefault();
      closeCart();
    }
  });

  async function refreshCart() {
    try {
      var res = await fetch('/?sections=cart-drawer');
      var data = await res.json();
      if (data && data['cart-drawer']) {
        var temp = document.createElement('div');
        temp.innerHTML = data['cart-drawer'];
        var newDrawer = temp.querySelector('#cart-drawer');
        if (newDrawer && drawer) {
          drawer.innerHTML = newDrawer.innerHTML;
          var newClose = drawer.querySelector('#cart-drawer-close');
          if (newClose) newClose.addEventListener('click', closeCart);
        }
      }

      var cartData = await (await fetch('/cart.js')).json();
      document.querySelectorAll('[data-cart-count]').forEach(function (el) {
        el.textContent = cartData.item_count;
        el.style.display = cartData.item_count > 0 ? '' : 'none';
      });

      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cartData } }));
    } catch (err) {
      console.warn('[Cart Drawer] Refresh error:', err);
    }
  }

  document.addEventListener('submit', async function (e) {
    var form = e.target.closest('form[action*="/cart/add"]');
    if (!form) return;

    var config = window.ASMAAN_CONFIG || {};
    if (config.cartType === 'page') return;

    e.preventDefault();
    var submitBtn = form.querySelector('[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding...';
    }

    try {
      var formData = new FormData(form);
      var res = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (res.ok) {
        await refreshCart();
        openCart();
      } else {
        var errData = await res.json();
        alert(errData.description || 'Could not add item to cart.');
      }
    } catch (err) {
      console.error('[Cart Add] Error:', err);
      form.submit();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  document.addEventListener('click', async function (e) {
    var qtyBtn = e.target.closest('[data-cart-qty-btn]');
    var removeBtn = e.target.closest('[data-cart-remove-btn]');
    if (!qtyBtn && !removeBtn) return;

    var itemRow = e.target.closest('[data-line-key]');
    if (!itemRow) return;

    var key = itemRow.getAttribute('data-line-key');
    var currentQty = parseInt(itemRow.querySelector('[data-cart-qty]')?.textContent || '1', 10);
    var newQty = currentQty;

    if (qtyBtn) {
      var delta = parseInt(qtyBtn.getAttribute('data-cart-qty-btn'), 10);
      newQty = Math.max(0, currentQty + delta);
    } else if (removeBtn) {
      newQty = 0;
    }

    try {
      itemRow.style.opacity = '0.4';
      var res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id: key, quantity: newQty })
      });
      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error('[Cart Change] Error:', err);
    }
  });

  var noteTimer;
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'cart-drawer-note') {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(async function () {
        try {
          await fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: e.target.value })
          });
        } catch (err) {}
      }, 500);
    }
  });

  window.AsmaanCart = {
    open: openCart,
    close: closeCart,
    refresh: refreshCart
  };
})();