/**
 * Asmaan — Drink / Product Page Interactive Engine (assets/asmaan-drink.js)
 * All product data (flavours, packs, prices, variants, selling plans, labels) is read from
 * the #drink-data JSON rendered by sections/main-drink.liquid.
 */

(function() {
  'use strict';

  var VIEWS = ['front', 'right', 'back', 'left'];

  function initDrinkPage() {
    var dataEl = document.getElementById('drink-data');
    var productSection = document.getElementById('buy');
    if (!dataEl || !productSection) return;

    var data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (err) {
      console.error('Asmaan drink: invalid #drink-data JSON', err);
      return;
    }

    var FLAVOURS = data.flavours || [];
    var PACKS = data.packs || [];
    var LABELS = data.labels || {};
    var SUB = data.subscription || {};
    if (!FLAVOURS.length || !PACKS.length) return;

    var root = document.documentElement;

    var state = {
      taste: 0,
      pack: Math.min(data.defaultPack || 0, PACKS.length - 1),
      mode: 'once',
      frequency: Math.max(SUB.defaultFrequency || 0, 0),
      quantity: 1,
      view: 'front',
      adding: false
    };

    // Allow deep links such as /pages/drink?flavour=alphonso-mango
    var wanted = new URLSearchParams(window.location.search).get('flavour');
    if (wanted) {
      FLAVOURS.forEach(function(f, i) { if (f.handle === wanted) state.taste = i; });
    }

    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function escapeHtml(str) {
      return String(str == null ? '' : str).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    // Mirrors Shopify's money / money_without_trailing_zeros filters using the shop's money format.
    function formatMoney(cents) {
      cents = Math.round(cents);
      var format = data.moneyFormat || '{{amount}}';

      function withDelimiters(amount, precision, thousands, decimal) {
        var parts = (amount / 100).toFixed(precision).split('.');
        parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        return parts.join(decimal);
      }

      var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
      var value;
      switch (match ? match[1] : 'amount') {
        case 'amount_no_decimals': value = withDelimiters(cents, 0, ',', '.'); break;
        case 'amount_with_comma_separator': value = withDelimiters(cents, 2, '.', ','); break;
        case 'amount_no_decimals_with_comma_separator': value = withDelimiters(cents, 0, '.', ','); break;
        case 'amount_with_apostrophe_separator': value = withDelimiters(cents, 2, "'", '.'); break;
        default: value = withDelimiters(cents, 2, ',', '.');
      }
      if (cents % 100 === 0) value = value.replace(/[.,]00$/, '');

      var tmp = document.createElement('div');
      tmp.innerHTML = format.replace(/\{\{\s*\w+\s*\}\}/, value);
      return tmp.textContent;
    }

    function currentFlavour() { return FLAVOURS[state.taste]; }

    function packData(flavour, i) {
      return (flavour.packs && flavour.packs[i]) || { variantId: null, price: 0, available: false };
    }

    function plans() { return currentFlavour().plans || []; }

    function subscriptionAvailable() {
      if (!SUB.enabled) return false;
      return data.prelaunch || plans().length > 0;
    }

    function frequencyOptions() {
      var p = plans();
      if (p.length) return p.map(function(plan) { return plan.name; });
      return SUB.frequencies || [];
    }

    function discountPercent() {
      var p = plans();
      if (p.length) return (p[state.frequency] || p[0]).pct || 0;
      return SUB.discount || 0;
    }

    function calculateOrder() {
      var pack = PACKS[state.pack];
      var pd = packData(currentFlavour(), state.pack);
      var isSub = state.mode === 'subscribe';
      var rate = isSub ? discountPercent() / 100 : 0;
      var unitPrice = pd.price * (1 - rate);
      var total = unitPrice * state.quantity;
      var totalCans = pack.cans * state.quantity;
      return {
        pack: pack,
        packData: pd,
        basePackPrice: pd.price,
        total: total,
        totalCans: totalCans,
        perCan: totalCans ? total / totalCans : 0,
        saving: isSub ? pd.price * state.quantity - total : 0
      };
    }

    function splitTitle(title) {
      var words = String(title).split(' ');
      if (words.length < 2) return escapeHtml(title);
      return escapeHtml(words[0]) + '<br>' + escapeHtml(words.slice(1).join(' '));
    }

    function imageFor(flavour, view, size) {
      var img = (flavour.images && (flavour.images[view] || flavour.images.front)) || null;
      return img ? img[size] : null;
    }

    function ctaLabel(order) {
      if (data.prelaunch) {
        if (LABELS.waitlist) return LABELS.waitlist;
      } else if (!order.packData.variantId || !order.packData.available) {
        return LABELS.soldOut;
      }
      if (state.adding) return LABELS.adding;
      return state.mode === 'subscribe' ? LABELS.subscribe : LABELS.add;
    }

    function renderChips() {
      var wrap = $('[data-drink-chips]');
      if (!wrap) return;
      var opts = frequencyOptions();
      if (state.frequency >= opts.length) state.frequency = 0;
      wrap.innerHTML = opts.map(function(label, i) {
        return '<button type="button" class="drink_chip" data-frequency-index="' + i + '" aria-pressed="' + (i === state.frequency) + '">' + escapeHtml(label) + '</button>';
      }).join('');
    }

    function updateDOM() {
      var flavour = currentFlavour();
      var order = calculateOrder();
      var fullName = flavour.title;

      root.style.setProperty('--taste-primary', flavour.deep);
      root.style.setProperty('--taste-secondary', flavour.accent);

      var titleElem = $('[data-drink-title]');
      if (titleElem) titleElem.innerHTML = splitTitle(fullName);

      var blurbElem = $('[data-drink-blurb]');
      if (blurbElem) blurbElem.textContent = flavour.blurb || '';

      $$('.drink_taste').forEach(function(btn, i) {
        btn.setAttribute('aria-pressed', i === state.taste ? 'true' : 'false');
      });

      // Gallery
      $$('.drink_view').forEach(function(btn) {
        var v = btn.getAttribute('data-view');
        btn.setAttribute('aria-pressed', v === state.view ? 'true' : 'false');
        var vImg = btn.querySelector('img');
        var vSrc = imageFor(flavour, v, 'thumb');
        if (vImg && vSrc) vImg.src = vSrc;
      });
      var panelNote = $('.drink_panel-note');
      if (panelNote) {
        var panels = LABELS.panels || {};
        panelNote.innerHTML = escapeHtml(panels[state.view] || panels.front || '') +
          (LABELS.dragHint ? ' <span aria-hidden="true">·</span> ' + escapeHtml(LABELS.dragHint) : '');
      }

      // Packs (prices can differ per flavour)
      $$('.drink_pack').forEach(function(btn) {
        var i = parseInt(btn.getAttribute('data-pack-index'), 10);
        var pd = packData(flavour, i);
        btn.setAttribute('aria-pressed', i === state.pack ? 'true' : 'false');
        btn.setAttribute('data-available', data.prelaunch || (pd.variantId && pd.available) ? 'true' : 'false');
        var priceEl = btn.querySelector('.drink_pack-price');
        if (priceEl) priceEl.textContent = formatMoney(pd.price);
        var eachEl = btn.querySelector('.drink_pack-each');
        if (eachEl && PACKS[i]) eachEl.textContent = formatMoney(pd.price / PACKS[i].cans) + ' / ' + (LABELS.can || '');
      });
      $$('.pack_tier').forEach(function(btn) {
        var i = parseInt(btn.getAttribute('data-pack-index'), 10);
        var pd = packData(flavour, i);
        btn.setAttribute('aria-pressed', i === state.pack ? 'true' : 'false');
        var eachEl = btn.querySelector('span');
        if (eachEl && PACKS[i]) eachEl.textContent = formatMoney(pd.price / PACKS[i].cans) + ' / ' + (LABELS.can || '');
      });

      // Delivery mode
      var modes = $('[data-drink-modes]');
      var subOk = subscriptionAvailable();
      if (modes) modes.hidden = !subOk;
      if (!subOk) state.mode = 'once';

      var pct = discountPercent();
      var saveEl = $('[data-drink-save]');
      if (saveEl) {
        saveEl.textContent = (LABELS.save || '') + ' ' + pct + '%';
        saveEl.hidden = !pct;
      }

      $$('.drink_mode').forEach(function(btn) {
        var m = btn.getAttribute('data-mode');
        btn.setAttribute('aria-pressed', m === state.mode ? 'true' : 'false');
        var priceSpan = btn.querySelector('.drink_mode-price');
        if (priceSpan) {
          priceSpan.textContent = formatMoney(m === 'subscribe' ? order.basePackPrice * (1 - pct / 100) : order.basePackPrice);
        }
      });

      var freqContainer = $('.drink_frequency');
      if (freqContainer) {
        var open = state.mode === 'subscribe' && frequencyOptions().length > 0;
        freqContainer.setAttribute('data-open', open ? 'true' : 'false');
        freqContainer.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      $$('.drink_chip').forEach(function(chip, i) {
        chip.setAttribute('aria-pressed', i === state.frequency ? 'true' : 'false');
      });

      // Totals
      var stepperCount = $('.drink_stepper span');
      if (stepperCount) stepperCount.textContent = state.quantity;
      var minusBtn = $('.drink_stepper button:first-child');
      if (minusBtn) minusBtn.disabled = state.quantity <= 1;

      var sumPrice = $('.drink_sum .merch_price');
      if (sumPrice) sumPrice.textContent = formatMoney(order.total);

      var sumNote = $('.drink_sum-note');
      if (sumNote) {
        var noteHTML = order.totalCans + ' ' + escapeHtml(LABELS.cans) + ' <span aria-hidden="true">·</span> ' +
          formatMoney(order.perCan) + ' ' + escapeHtml(LABELS.each);
        if (order.saving > 0) {
          noteHTML += ' <span aria-hidden="true">·</span> ' + escapeHtml(LABELS.saves) + ' ' + formatMoney(order.saving);
        }
        sumNote.innerHTML = noteHTML;
      }

      // Buy buttons
      var label = ctaLabel(order);
      var blocked = !data.prelaunch && (!order.packData.variantId || !order.packData.available);
      $$('[data-drink-cta]').forEach(function(btn) {
        var labelEl = btn.querySelector('[data-drink-cta-label]');
        if (labelEl) labelEl.textContent = label;
        btn.disabled = blocked || state.adding;
        btn.setAttribute('aria-disabled', btn.disabled ? 'true' : 'false');
      });

      // Pack scene
      var stageGlow = $('.pack_stage .merch_glow');
      if (stageGlow) stageGlow.style.setProperty('--glow', flavour.accent);
      var canGlow = $('.drink_can .merch_glow');
      if (canGlow) canGlow.style.setProperty('--glow', flavour.accent);

      var packSpecTier = document.getElementById('pack-spec-tier');
      if (packSpecTier) packSpecTier.textContent = order.pack.tag || '';
      var packSpecInside = document.getElementById('pack-spec-inside');
      if (packSpecInside) packSpecInside.textContent = order.pack.cans + ' × ' + fullName;
      var packSpecPrice = document.getElementById('pack-spec-price');
      if (packSpecPrice) packSpecPrice.textContent = formatMoney(order.basePackPrice);

      // Range cards
      $$('.drink_flavour').forEach(function(card, i) {
        card.setAttribute('data-chosen', i === state.taste ? 'true' : 'false');
        var ctaA = card.querySelector('.drink_flavour-cta');
        if (ctaA) ctaA.textContent = i === state.taste ? LABELS.inPack : LABELS.takeThis;
      });

      // Sticky bar
      var barTasteName = $('.drink_bar-copy b');
      if (barTasteName) barTasteName.textContent = fullName;
      var barMetaCount = $('.drink_bar-copy .merch_meta span:first-child');
      if (barMetaCount) barMetaCount.textContent = order.totalCans + ' ' + LABELS.cans;
      var barMetaFreq = $('.drink_bar-copy .merch_meta span:last-child');
      if (barMetaFreq) {
        barMetaFreq.textContent = state.mode === 'subscribe' ? (frequencyOptions()[state.frequency] || '') : LABELS.once;
      }
      var barSwatch = $('.drink_bar-swatch');
      if (barSwatch) barSwatch.style.setProperty('--swatch', flavour.accent);
      var barPrice = $('.drink_bar-price');
      if (barPrice) barPrice.textContent = formatMoney(order.total);
    }

    function selectFlavour(i) {
      state.taste = i;
      renderChips();
      updateDOM();
      remountCan();
    }

    function scrollToBuy() {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Event bindings
    $$('.drink_taste').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectFlavour(parseInt(btn.getAttribute('data-flavour-index'), 10) || 0);
      });
    });

    $$('.drink_view').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.view = btn.getAttribute('data-view') || 'front';
        updateDOM();
      });
    });

    $$('.drink_pack, .pack_tier').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-pack-index'), 10);
        if (!isNaN(idx)) {
          state.pack = idx;
          updateDOM();
        }
      });
    });

    $$('.drink_mode').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.mode = btn.getAttribute('data-mode') || 'once';
        updateDOM();
      });
    });

    var chipsWrap = $('[data-drink-chips]');
    if (chipsWrap) {
      chipsWrap.addEventListener('click', function(e) {
        var chip = e.target.closest('[data-frequency-index]');
        if (!chip) return;
        state.frequency = parseInt(chip.getAttribute('data-frequency-index'), 10) || 0;
        updateDOM();
      });
    }

    var minusBtn = $('.drink_stepper button:first-child');
    if (minusBtn) {
      minusBtn.addEventListener('click', function() {
        if (state.quantity > 1) {
          state.quantity -= 1;
          updateDOM();
        }
      });
    }
    var plusBtn = $('.drink_stepper button:last-child');
    if (plusBtn) {
      plusBtn.addEventListener('click', function() {
        state.quantity += 1;
        updateDOM();
      });
    }

    $$('.drink_flavour-cta[data-flavour-index]').forEach(function(cta) {
      cta.addEventListener('click', function(e) {
        e.preventDefault();
        selectFlavour(parseInt(cta.getAttribute('data-flavour-index'), 10) || 0);
        scrollToBuy();
      });
    });

    var packCta = $('[data-drink-to-buy]');
    if (packCta) {
      packCta.addEventListener('click', function(e) {
        e.preventDefault();
        scrollToBuy();
      });
    }

    // 3D can: the engine has no label swap, so a flavour change remounts the can with the new
    // label. Mounting and teardown go through the loader's section load/unload events.
    var VIEW_SPIN = { front: 0, right: -1.5707963, back: 3.1415927, left: 1.5707963 };
    var canMount = $('[data-drink-can-mount]');
    var canTemplate = canMount ? canMount.querySelector('[data-asmaan-can]') : null;
    canTemplate = canTemplate ? canTemplate.cloneNode(true) : null;
    var mountedFlavour = 0;

    function remountCan() {
      if (!canMount || !canTemplate || mountedFlavour === state.taste) return;
      var flavour = currentFlavour();
      if (!flavour.label) return;
      mountedFlavour = state.taste;

      var fresh = canTemplate.cloneNode(true);
      fresh.setAttribute('data-label', flavour.label);
      fresh.setAttribute('data-tint', flavour.accent);
      fresh.setAttribute('data-spin', String(VIEW_SPIN[state.view] || 0));
      fresh.setAttribute('aria-label', flavour.title);
      var poster = fresh.querySelector('[data-asmaan-can-poster]');
      var posterSrc = imageFor(flavour, state.view, 'full');
      if (poster && posterSrc) poster.src = posterSrc;

      canMount.dispatchEvent(new CustomEvent('shopify:section:unload', { bubbles: true }));
      canMount.innerHTML = '';
      canMount.appendChild(fresh);
      canMount.dispatchEvent(new CustomEvent('shopify:section:load', { bubbles: true }));
    }

    // Zero-Flicker Preloaded Canvas Frame Engine
    var packStage = document.getElementById('pack-canvas-stage');
    var packCanvas = document.getElementById('pack-scroll-canvas');
    var packPoster = document.getElementById('pack-scroll-poster');
    var packRun = $('.pack_run');
    var packHold = $('.pack_hold');

    if (packStage && packCanvas && packRun) {
      var ctx = packCanvas.getContext('2d', { alpha: true });
      var totalFrames = parseInt(packStage.getAttribute('data-total-frames') || '150', 10);
      var firstFrameUrl = packStage.getAttribute('data-first-frame') || (packPoster ? packPoster.src : '');
      var frameImages = [];
      var targetProgress = 0;
      var currentProgress = 0;
      var lastDrawnIndex = -1;

      packCanvas.width = 720;
      packCanvas.height = 405;

      var drawFrame = function(idx) {
        if (!ctx) return;
        var img = frameImages[idx];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.clearRect(0, 0, packCanvas.width, packCanvas.height);
          ctx.drawImage(img, 0, 0, packCanvas.width, packCanvas.height);
          lastDrawnIndex = idx;
          if (packPoster && packPoster.getAttribute('data-hidden') !== 'true') {
            packPoster.setAttribute('data-hidden', 'true');
          }
        }
      };

      if (firstFrameUrl) {
        for (var f = 1; f <= totalFrames; f++) {
          (function(index) {
            var frameNum = String(index).padStart(2, '0');
            var img = new Image();
            img.src = firstFrameUrl.replace(/pack-frame-\d+\.webp/, 'pack-frame-' + frameNum + '.webp');
            img.onload = function() {
              if (index === 1 && lastDrawnIndex === -1) drawFrame(0);
            };
            frameImages.push(img);
          })(f);
        }
      }

      var onScrollPack = function() {
        var rect = packRun.getBoundingClientRect();
        var h = window.innerHeight || document.documentElement.clientHeight;
        var travel = packRun.offsetHeight - h;
        var scrollThrough = travel > 0 ? (-rect.top) / travel : 0;
        targetProgress = Math.min(Math.max(scrollThrough, 0), 1);
        if (packHold) packHold.style.setProperty('--build', targetProgress);
      };

      var animLoop = function() {
        if (frameImages.length > 0) {
          currentProgress += (targetProgress - currentProgress) * 0.22;
          var destIndex = Math.min(Math.max(Math.round(currentProgress * (totalFrames - 1)), 0), totalFrames - 1);
          if (destIndex !== lastDrawnIndex) drawFrame(destIndex);
        }
        requestAnimationFrame(animLoop);
      };

      window.addEventListener('scroll', onScrollPack, { passive: true });
      onScrollPack();
      requestAnimationFrame(animLoop);
    }

    // Sticky DrinkBar
    var drinkBar = $('.drink_bar');
    if (drinkBar && 'IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var isOffScreen = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          drinkBar.setAttribute('data-shown', isOffScreen ? 'true' : 'false');
          drinkBar.setAttribute('aria-hidden', isOffScreen ? 'false' : 'true');
          var barBtn = drinkBar.querySelector('button');
          if (barBtn) barBtn.tabIndex = isOffScreen ? 0 : -1;
        });
      }, { threshold: 0 }).observe(productSection);
    }

    // Waitlist modal (pre-launch mode)
    var dropModal = document.getElementById('drop-modal');

    function setModal(open) {
      if (!dropModal) return;
      dropModal.setAttribute('data-open', open ? 'true' : 'false');
      dropModal.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        var input = dropModal.querySelector('#drop-email');
        if (input) setTimeout(function() { input.focus(); }, 100);
      }
    }

    if (dropModal) {
      var closeBtn = dropModal.querySelector('[data-drop-modal-close]');
      if (closeBtn) closeBtn.addEventListener('click', function() { setModal(false); });
      dropModal.addEventListener('click', function(e) { if (e.target === dropModal) setModal(false); });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropModal.getAttribute('data-open') === 'true') setModal(false);
      });
      // After the customer form posts, the page reloads — reopen so the result is visible.
      if (/[?&]customer_posted=true/.test(window.location.search) || dropModal.querySelector('[role="alert"]')) {
        setModal(true);
      }
    }

    // Add to cart
    var errorEl = $('[data-drink-error]');

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg || '';
      errorEl.hidden = !msg;
    }

    function addToCart() {
      var order = calculateOrder();
      var pd = order.packData;
      if (!pd.variantId || !pd.available || state.adding) return;

      var item = { id: pd.variantId, quantity: state.quantity };
      if (state.mode === 'subscribe') {
        var plan = plans()[state.frequency];
        if (plan) item.selling_plan = plan.id;
      }

      state.adding = true;
      showError('');
      updateDOM();

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: [item] })
      })
        .then(function(res) {
          return res.json().then(function(body) { return { ok: res.ok, body: body }; });
        })
        .then(function(result) {
          if (!result.ok) throw new Error(result.body.description || result.body.message || LABELS.addError);
          if (data.cartType === 'page' || !window.asmaanCart) {
            window.location.href = ((window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/') + 'cart';
            return;
          }
          return window.asmaanCart.refresh().then(function() { window.asmaanCart.open(); });
        })
        .catch(function(err) {
          showError(err && err.message ? err.message : LABELS.addError);
        })
        .then(function() {
          state.adding = false;
          updateDOM();
        });
    }

    $$('[data-drink-cta]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (data.prelaunch) {
          setModal(true);
        } else {
          addToCart();
        }
      });
    });

    renderChips();
    updateDOM();
    remountCan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrinkPage);
  } else {
    initDrinkPage();
  }
})();
