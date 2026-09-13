/**
 * Asmaan / Aura AJAX Cart Drawer
 */
(function () {
  'use strict';

  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-drawer-overlay');
  var closeBtn = document.getElementById('cart-drawer-close');

  function openCart() {
    if (!drawer || !overlay) return;
    drawer.classList.add('is-active');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-active');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-active');
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
          bindCartEvents();
        }
      }
      var countRes = await fetch('/cart.js');
      var cartData = await countRes.json();
      var badges = document.querySelectorAll('.cart-count-badge, #cart-icon-bubble');
      badges.forEach(function (b) {
        b.textContent = cartData.item_count;
        b.classList.toggle('hidden', cartData.item_count === 0);
      });
    } catch (err) {
      console.error('Failed to refresh cart:', err);
    }
  }

  function bindCartEvents() {
    var newCloseBtn = document.getElementById('cart-drawer-close');
    if (newCloseBtn) newCloseBtn.addEventListener('click', closeCart);

    var noteEl = document.getElementById('cart-drawer-note');
    if (noteEl) {
      noteEl.addEventListener('change', function () {
        fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: noteEl.value })
        });
      });
    }

    drawer.querySelectorAll('[data-cart-qty-btn]').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        var itemEl = btn.closest('[data-line-key]');
        if (!itemEl) return;
        var key = itemEl.getAttribute('data-line-key');
        var qtyEl = itemEl.querySelector('[data-cart-qty]');
        var currentQty = parseInt(qtyEl.textContent, 10) || 0;
        var delta = parseInt(btn.getAttribute('data-cart-qty-btn'), 10) || 0;
        var newQty = Math.max(0, currentQty + delta);

        try {
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, quantity: newQty })
          });
          await refreshCart();
        } catch (err) {
          console.error('Error changing qty:', err);
        }
      });
    });

    drawer.querySelectorAll('[data-cart-remove-btn]').forEach(function (btn) {
      btn.addEventListener('click', async function (e) {
        e.preventDefault();
        var itemEl = btn.closest('[data-line-key]');
        if (!itemEl) return;
        var key = itemEl.getAttribute('data-line-key');
        try {
          await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, quantity: 0 })
          });
          await refreshCart();
        } catch (err) {
          console.error('Error removing item:', err);
        }
      });
    });
  }

  bindCartEvents();

  document.addEventListener('submit', async function (e) {
    var form = e.target;
    if (form.action && form.action.includes('/cart/add')) {
      if (window.ASMAAN_CONFIG && window.ASMAAN_CONFIG.cartType === 'page') {
        return; // standard submit to cart page
      }
      e.preventDefault();
      var formData = new FormData(form);
      try {
        await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        await refreshCart();
        openCart();
      } catch (err) {
        form.submit();
      }
    }
  });

  window.asmaanCart = {
    open: openCart,
    close: closeCart,
    refresh: refreshCart
  };
})();
