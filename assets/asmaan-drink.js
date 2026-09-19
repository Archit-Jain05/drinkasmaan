/**
 * Asmaan — Drink / Product Page Interactive Engine (assets/asmaan-drink.js)
 * Fully synchronizes Taste, Pack Tier, Subscription, 3D Carton assembly,
 * Gallery angle rotator, Sticky DrinkBar, and Cart integration.
 */

(function() {
  'use strict';

  function initDrinkPage() {
    var root = document.documentElement;
    var productSection = document.getElementById('buy') || document.querySelector('.drink_product');
    if (!productSection) return;

    var TASTES = [
      {
        id: 'jamun',
        line1: 'Kala',
        line2: 'Jamun',
        tag: 'The original',
        blurb: 'The one the brand started on. Deep Indian blackberry — tart at the front, dark and round underneath, and dry enough to drink for four hours straight.',
        primary: '#2A1D4A',
        secondary: '#9089D3'
      },
      {
        id: 'mango',
        line1: 'Alphonso',
        line2: 'Mango',
        tag: 'Gold into burnt amber',
        blurb: 'A ripe Alphonso pressed against something bitter. Heavy fruit up top, burnt amber at the finish, and none of the syrup that usually comes with it.',
        primary: '#5A2A00',
        secondary: '#EFB36B'
      },
      {
        id: 'print',
        line1: 'Wild',
        line2: 'Magenta',
        tag: 'Rose and pink guava',
        blurb: 'The loudest can in the range. Rose over pink guava, with a citrus edge that keeps the whole thing sharp instead of sweet.',
        primary: '#4E0749',
        secondary: '#E6A0E8'
      }
    ];

    var PACKS = [
      { id: '12', cans: 12, price: 2400, tag: 'Starter', note: 'Two weeks of mornings.' },
      { id: '24', cans: 24, price: 4320, tag: 'Most taken', note: 'The one people come back for.', featured: true },
      { id: '36', cans: 36, price: 5760, tag: 'Deep work', note: 'A quarter, priced like it.' }
    ];

    var FREQUENCIES = [
      { id: '2w', label: 'Every 2 weeks' },
      { id: '1m', label: 'Monthly' },
      { id: '2m', label: 'Every 2 months' }
    ];

    var PANEL_LABELS = {
      front: 'Front panel · Wordmark & claim',
      right: 'Right panel · Ingredients & recipe',
      back: 'Back panel · Nutritional values & volume',
      left: 'Left panel · Brand story & mission'
    };

    var state = {
      taste: 0,
      pack: 1, // default to 24 cans (Most taken)
      mode: 'once', // 'once' or 'subscribe'
      frequency: 1, // 'Monthly'
      quantity: 1,
      view: 'front'
    };

    function formatMoney(amount) {
      return '₹' + Math.round(amount).toLocaleString('en-IN');
    }

    function calculateOrder() {
      var packObj = PACKS[state.pack];
      var basePackPrice = packObj.price;
      var isSub = state.mode === 'subscribe';
      var discountRate = isSub ? 0.10 : 0;
      var unitPrice = basePackPrice * (1 - discountRate);
      var total = unitPrice * state.quantity;
      var totalCans = packObj.cans * state.quantity;
      var perCan = total / totalCans;
      var rawTotal = basePackPrice * state.quantity;
      var saving = isSub ? (rawTotal - total) : 0;

      return {
        pack: packObj,
        basePackPrice: basePackPrice,
        unitPrice: unitPrice,
        total: total,
        totalCans: totalCans,
        perCan: perCan,
        saving: saving
      };
    }

    function updateDOM() {
      var tasteObj = TASTES[state.taste];
      var order = calculateOrder();

      // 1. Root color theme update
      root.style.setProperty('--taste-primary', tasteObj.primary);
      root.style.setProperty('--taste-secondary', tasteObj.secondary);

      // 2. Taste selection buttons & titles
      var titleElem = document.querySelector('[data-drink-title]');
      if (titleElem) titleElem.innerHTML = tasteObj.line1 + '<br>' + tasteObj.line2;

      var blurbElem = document.querySelector('[data-drink-blurb]');
      if (blurbElem) blurbElem.textContent = tasteObj.blurb;

      var tasteBtns = document.querySelectorAll('.drink_taste');
      tasteBtns.forEach(function(btn, i) {
        btn.setAttribute('aria-pressed', i === state.taste ? 'true' : 'false');
      });

      // 3. Can Gallery Images
      var mainCanImg = document.getElementById('drink-main-can-img');
      if (mainCanImg) {
        var assetUrl = mainCanImg.getAttribute('data-img-' + tasteObj.id + '-' + state.view);
        if (assetUrl) mainCanImg.src = assetUrl;
      }

      var viewBtns = document.querySelectorAll('.drink_view');
      viewBtns.forEach(function(btn) {
        var v = btn.getAttribute('data-view');
        btn.setAttribute('aria-pressed', v === state.view ? 'true' : 'false');
        var vImg = btn.querySelector('img');
        if (vImg) {
          var vSrc = vImg.getAttribute('data-img-' + tasteObj.id + '-' + v);
          if (vSrc) vImg.src = vSrc;
        }
      });

      var panelNote = document.querySelector('.drink_panel-note');
      if (panelNote) {
        panelNote.innerHTML = (PANEL_LABELS[state.view] || PANEL_LABELS.front) + ' <span aria-hidden="true">·</span> drag the can to turn it';
      }

      // 4. Pack Buttons & Delivery Mode
      var packBtns = document.querySelectorAll('.drink_pack');
      packBtns.forEach(function(btn, i) {
        btn.setAttribute('aria-pressed', i === state.pack ? 'true' : 'false');
      });

      var modeBtns = document.querySelectorAll('.drink_mode');
      modeBtns.forEach(function(btn) {
        var m = btn.getAttribute('data-mode');
        btn.setAttribute('aria-pressed', m === state.mode ? 'true' : 'false');
        var priceSpan = btn.querySelector('.drink_mode-price');
        if (priceSpan) {
          var packPrice = order.basePackPrice;
          if (m === 'subscribe') {
            priceSpan.textContent = formatMoney(packPrice * 0.9);
          } else {
            priceSpan.textContent = formatMoney(packPrice);
          }
        }
      });

      var freqContainer = document.querySelector('.drink_frequency');
      if (freqContainer) {
        freqContainer.setAttribute('data-open', state.mode === 'subscribe' ? 'true' : 'false');
        freqContainer.setAttribute('aria-hidden', state.mode === 'subscribe' ? 'false' : 'true');
      }

      var freqChips = document.querySelectorAll('.drink_chip');
      freqChips.forEach(function(chip, i) {
        chip.setAttribute('aria-pressed', i === state.frequency ? 'true' : 'false');
      });

      // 5. Total & Stepper
      var stepperCount = document.querySelector('.drink_stepper span');
      if (stepperCount) stepperCount.textContent = state.quantity;

      var minusBtn = document.querySelector('.drink_stepper button:first-child');
      if (minusBtn) minusBtn.disabled = state.quantity <= 1;

      var sumPrice = document.querySelector('.drink_sum .merch_price');
      if (sumPrice) sumPrice.textContent = formatMoney(order.total);

      var sumNote = document.querySelector('.drink_sum-note');
      if (sumNote) {
        var noteHTML = order.totalCans + ' cans <span aria-hidden="true">·</span> ' + formatMoney(order.perCan) + ' each';
        if (order.saving > 0) {
          noteHTML += ' <span aria-hidden="true">·</span> saves ' + formatMoney(order.saving);
        }
        sumNote.innerHTML = noteHTML;
      }

      var mainCtaBtn = document.querySelector('.drink_buy .wear_cta');
      if (mainCtaBtn) {
        var ctaText = state.mode === 'subscribe' ? 'Start subscription' : 'Add to bag';
        var starIcon = mainCtaBtn.querySelector('.wear_cta-star');
        mainCtaBtn.innerHTML = ctaText + ' ' + (starIcon ? starIcon.outerHTML : '');
      }

      // 6. 3D Pack Box Carton
      var packBox = document.querySelector('.pack_box');
      if (packBox) {
        var layers = Math.max(Math.round(order.pack.cans / 12), 1);
        packBox.style.setProperty('--layers', layers);
        packBox.style.setProperty('--print', tasteObj.secondary);
        packBox.style.setProperty('--print-deep', tasteObj.primary);

        var packCountText = packBox.querySelector('.pack_count b');
        if (packCountText) packCountText.textContent = order.pack.cans;

        var boxCanImgs = packBox.querySelectorAll('.pack_can img');
        boxCanImgs.forEach(function(img) {
          var cSrc = img.getAttribute('data-img-' + tasteObj.id);
          if (cSrc) img.src = cSrc;
        });

        var stageGlow = document.querySelector('.pack_stage .merch_glow');
        if (stageGlow) {
          stageGlow.style.setProperty('--glow', tasteObj.secondary);
        }
      }

      var packTierBtns = document.querySelectorAll('.pack_tier');
      packTierBtns.forEach(function(btn, i) {
        btn.setAttribute('aria-pressed', i === state.pack ? 'true' : 'false');
      });

      var packSpecTier = document.getElementById('pack-spec-tier');
      if (packSpecTier) packSpecTier.textContent = order.pack.tag;

      var packSpecInside = document.getElementById('pack-spec-inside');
      if (packSpecInside) packSpecInside.textContent = order.pack.cans + ' × ' + tasteObj.line1 + ' ' + tasteObj.line2;

      var packSpecPrice = document.getElementById('pack-spec-price');
      if (packSpecPrice) packSpecPrice.textContent = formatMoney(order.pack.price);

      // 7. Flavours Range Cards
      var flavourCards = document.querySelectorAll('.drink_flavour');
      flavourCards.forEach(function(card, i) {
        card.setAttribute('data-chosen', i === state.taste ? 'true' : 'false');
        var ctaA = card.querySelector('.drink_flavour-cta');
        if (ctaA) ctaA.textContent = i === state.taste ? 'In your pack' : 'Take this one';
      });

      // 8. Sticky DrinkBar
      var barTasteName = document.querySelector('.drink_bar-copy b');
      if (barTasteName) barTasteName.textContent = tasteObj.line1 + ' ' + tasteObj.line2;

      var barMetaCount = document.querySelector('.drink_bar-copy .merch_meta span:first-child');
      if (barMetaCount) barMetaCount.textContent = order.totalCans + ' cans';

      var barMetaFreq = document.querySelector('.drink_bar-copy .merch_meta span:last-child');
      if (barMetaFreq) {
        barMetaFreq.textContent = state.mode === 'subscribe' ? FREQUENCIES[state.frequency].label : 'One time';
      }

      var barSwatch = document.querySelector('.drink_bar-swatch');
      if (barSwatch) {
        barSwatch.style.setProperty('--swatch', tasteObj.secondary);
      }

      var barPrice = document.querySelector('.drink_bar-price');
      if (barPrice) barPrice.textContent = formatMoney(order.total);

      var barBtn = document.querySelector('.drink_bar button');
      if (barBtn) {
        barBtn.textContent = state.mode === 'subscribe' ? 'Start subscription' : 'Add to bag';
      }
    }

    // Bind Taste Buttons
    var tasteBtns = document.querySelectorAll('.drink_taste');
    tasteBtns.forEach(function(btn, i) {
      btn.addEventListener('click', function() {
        state.taste = i;
        updateDOM();
      });
    });

    // Bind Gallery View Buttons
    var viewBtns = document.querySelectorAll('.drink_view');
    viewBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.view = btn.getAttribute('data-view') || 'front';
        updateDOM();
      });
    });

    // Bind Pack Buttons
    var packBtns = document.querySelectorAll('.drink_pack, .pack_tier');
    packBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-pack-index'), 10);
        if (!isNaN(idx)) {
          state.pack = idx;
          updateDOM();
        }
      });
    });

    // Bind Mode Buttons
    var modeBtns = document.querySelectorAll('.drink_mode');
    modeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.mode = btn.getAttribute('data-mode') || 'once';
        updateDOM();
      });
    });

    // Bind Frequency Chips
    var freqChips = document.querySelectorAll('.drink_chip');
    freqChips.forEach(function(chip, i) {
      chip.addEventListener('click', function() {
        state.frequency = i;
        updateDOM();
      });
    });

    // Bind Stepper
    var minusBtn = document.querySelector('.drink_stepper button:first-child');
    if (minusBtn) {
      minusBtn.addEventListener('click', function() {
        if (state.quantity > 1) {
          state.quantity -= 1;
          updateDOM();
        }
      });
    }

    var plusBtn = document.querySelector('.drink_stepper button:last-child');
    if (plusBtn) {
      plusBtn.addEventListener('click', function() {
        state.quantity += 1;
        updateDOM();
      });
    }

    // Bind Flavours Range CTA
    var flavourCtas = document.querySelectorAll('.drink_flavour-cta');
    flavourCtas.forEach(function(cta, i) {
      cta.addEventListener('click', function(e) {
        e.preventDefault();
        state.taste = i;
        updateDOM();
        var buySection = document.getElementById('buy');
        if (buySection) {
          buySection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Bind Pack Section "Take it to the bag" CTA
    var packCta = document.querySelector('.pack_copy .drink_flavour-cta');
    if (packCta) {
      packCta.addEventListener('click', function(e) {
        e.preventDefault();
        var buySection = document.getElementById('buy');
        if (buySection) {
          buySection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Scroll-driven 3D PackScene Carton Physics
    var packRun = document.querySelector('.pack_run');
    var packHold = document.querySelector('.pack_hold');
    var ticking = false;

    function smooth(t) {
      return t * t * (3 - 2 * t);
    }

    function clampRange(val, from, to) {
      if (to === from) return val >= to ? 1 : 0;
      return Math.min(Math.max((val - from) / (to - from), 0), 1);
    }

    function onScrollPack() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          if (packRun && packHold) {
            var rect = packRun.getBoundingClientRect();
            var h = window.innerHeight || document.documentElement.clientHeight;
            var travel = packRun.offsetHeight - h;
            var scrollThrough = travel > 0 ? (-rect.top) / travel : 0;

            var build = smooth(clampRange(scrollThrough, 0.02, 0.82));
            var turn = -26 + (14 * Math.min(Math.max(scrollThrough, 0), 1));

            packHold.style.setProperty('--build', build);
            packHold.style.setProperty('--turn', turn + 'deg');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScrollPack, { passive: true });
    onScrollPack();

    // Sticky DrinkBar Observer
    var drinkBar = document.querySelector('.drink_bar');
    if (drinkBar && productSection && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var isOffScreen = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          drinkBar.setAttribute('data-shown', isOffScreen ? 'true' : 'false');
          drinkBar.setAttribute('aria-hidden', isOffScreen ? 'false' : 'true');
        });
      }, { threshold: 0 });
      observer.observe(productSection);
    }

    // Add to Cart / Drop Modal Handler
    var dropModal = document.getElementById('drop-modal');
    var ctaButtons = document.querySelectorAll('.drink_buy .wear_cta, .drink_bar button');
    ctaButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        // If drop waitlist modal exists, open it, or trigger cart drawer
        if (dropModal) {
          dropModal.setAttribute('data-open', 'true');
          dropModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          var input = dropModal.querySelector('#drop-email');
          if (input) setTimeout(function() { input.focus(); }, 100);
        } else if (window.CartDrawer && typeof window.CartDrawer.open === 'function') {
          window.CartDrawer.open();
        }
      });
    });

    // Initial render
    updateDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrinkPage);
  } else {
    initDrinkPage();
  }
})();
