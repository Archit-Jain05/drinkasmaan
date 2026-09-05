/**
 * Asmaan Interactive Experience Engine (Shopify Online Store 2.0)
 * Exact port of https://asmaan-one.vercel.app/
 */

(function () {
  'use strict';

  var TASTES = [
    {
      id: 'jamun',
      line1: 'Kala',
      line2: 'Jamun',
      primary: '#2A1D4A',
      secondary: '#9089D3',
      label: 'jamun-label.jpg',
      poster: 'jamun-front.webp',
      tag: 'The original',
      blurb: 'The one the brand started on. Deep Indian blackberry — tart at the front, dark and round underneath, and dry enough to drink for four hours straight.',
      cx: 22
    },
    {
      id: 'mango',
      line1: 'Alphonso',
      line2: 'Mango',
      primary: '#5A2A00',
      secondary: '#EFB36B',
      label: 'mango-label.jpg',
      poster: 'mango-front.webp',
      tag: 'Gold into burnt amber',
      blurb: 'A ripe Alphonso pressed against something bitter. Heavy fruit up top, burnt amber at the finish, and none of the syrup that usually comes with it.',
      cx: 120
    },
    {
      id: 'print',
      line1: 'Wild',
      line2: 'Magenta',
      primary: '#4E0749',
      secondary: '#E6A0E8',
      label: 'print-label.jpg',
      poster: 'print-front.webp',
      tag: 'Rose and pink guava',
      blurb: 'The loudest can in the range. Rose over pink guava, with a citrus edge that keeps the whole thing sharp instead of sweet.',
      cx: 218
    }
  ];

  var KEYFRAMES = [
    { at: 0, spin: -0.25, pitch: 0.16, roll: 0, x: 0, y: 0.07, scale: 0.86 },
    { at: 0.186, spin: 1.1, pitch: 0.1, roll: -0.05, x: 0.2, y: 0.01, scale: 0.94 },
    { at: 0.341, spin: 2.05, pitch: 0.04, roll: 0.05, x: 0.18, y: -0.02, scale: 0.92 },
    { at: 0.495, spin: 3.0, pitch: -0.02, roll: -0.06, x: 0.18, y: -0.02, scale: 0.94 },
    { at: 0.65, spin: 4.0, pitch: 0.02, roll: 0.08, x: 0.18, y: -0.02, scale: 0.92 },
    { at: 0.805, spin: 5.0, pitch: 0.06, roll: -0.04, x: 0.18, y: -0.02, scale: 0.94 },
    { at: 0.959, spin: 5.6, pitch: -0.2, roll: -0.36, x: 0, y: 0, scale: 1.02 },
    { at: 1, spin: 5.9, pitch: 0.12, roll: -0.1, x: 0.02, y: -0.34, scale: 0.8 }
  ];

  var currentTasteIndex = 0;
  var motionMuted = false;

  function ease(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function range(value, from, to) {
    if (to === from) return value >= to ? 1 : 0;
    return Math.min(Math.max((value - from) / (to - from), 0), 1);
  }

  function poseAt(progress) {
    var clamped = Math.min(Math.max(progress, 0), 1);
    var index = 0;
    while (index < KEYFRAMES.length - 2 && clamped > KEYFRAMES[index + 1].at) {
      index += 1;
    }
    var a = KEYFRAMES[index];
    var b = KEYFRAMES[index + 1];
    var t = ease(Math.min(Math.max((clamped - a.at) / (b.at - a.at), 0), 1));

    return {
      spin: lerp(a.spin, b.spin, t),
      pitch: lerp(a.pitch, b.pitch, t),
      roll: lerp(a.roll, b.roll, t),
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      scale: lerp(a.scale, b.scale, t)
    };
  }

  function progressThrough(element, scrollY, windowH) {
    var rect = element.getBoundingClientRect();
    var travel = rect.height - windowH;
    if (travel <= 0) return -rect.top / Math.max(rect.height, 1);
    return -rect.top / travel;
  }

  function setTaste(index) {
    if (index < 0 || index >= TASTES.length) return;
    currentTasteIndex = index;
    var taste = TASTES[index];

    // 1. Update CSS Variables on document root
    document.documentElement.style.setProperty('--taste-primary', taste.primary);
    document.documentElement.style.setProperty('--taste-secondary', taste.secondary);

    // 2. Update Hero & Profile stacks
    document.querySelectorAll('[data-taste-stack]').forEach(function (stack) {
      var slides = stack.children;
      for (var i = 0; i < slides.length; i++) {
        slides[i].setAttribute('data-active', String(i === index));
      }
    });

    // 3. Update Ghost Titles
    document.querySelectorAll('.carousel_title-b').forEach(function (el, i) {
      el.setAttribute('data-active', String(i === index));
    });

    // 4. Update Liquid Pagination Slider
    var liquidCircle = document.querySelector('[data-liquid-circle]');
    if (liquidCircle) {
      liquidCircle.setAttribute('cx', String(taste.cx));
    }
    document.querySelectorAll('[data-taste-dot]').forEach(function (dot, i) {
      dot.setAttribute('aria-current', String(i === index));
    });

    // 5. Update Range Grid active cards
    document.querySelectorAll('[data-range-card]').forEach(function (card, i) {
      card.setAttribute('aria-current', String(i === index));
    });

    // 6. Update 3D Stage Can Poster
    var canEl = document.querySelector('[data-asmaan-stage-can]');
    if (canEl) {
      var posterImg = canEl.querySelector('img');
      if (posterImg) {
        var imgSrc = canEl.getAttribute('data-img-' + taste.id);
        if (imgSrc) posterImg.src = imgSrc;
      }
    }

    // 7. Update Manifesto wash background
    var wash = document.querySelector('.manifesto_wash');
    if (wash) {
      wash.style.background = 'radial-gradient(115% 95% at 50% 54%, ' + taste.secondary + ' 0%, ' + taste.secondary + ' 10%, ' + taste.primary + ' 72%, #07050f 100%)';
    }
    var manifestoField = document.querySelector('.manifesto_field');
    if (manifestofield) {
      manifestoField.style.setProperty('--blob', taste.secondary);
      manifestoField.style.setProperty('--blob-dark', taste.primary);
    }

    document.dispatchEvent(new CustomEvent('asmaan:tastechange', { detail: { taste: taste, index: index } }));
  }

  function initTasteInteractions() {
    setTaste(0);

    // Prev / Next Arrows
    var prevBtn = document.querySelector('[data-carousel-prev]');
    var nextBtn = document.querySelector('[data-carousel-next]');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        var nextIdx = (currentTasteIndex - 1 + TASTES.length) % TASTES.length;
        setTaste(nextIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        var nextIdx = (currentTasteIndex + 1) % TASTES.length;
        setTaste(nextIdx);
      });
    }

    // Liquid Pagination drag / click
    var paginationSvg = document.querySelector('.carousel_pagination svg');
    if (paginationSvg) {
      var isDragging = false;
      var pick = function (clientX) {
        var rect = paginationSvg.getBoundingClientRect();
        var x = ((clientX - rect.left) / rect.width) * 240;
        var step = (240 - 44) / (TASTES.length - 1);
        var nearest = Math.round((x - 22) / step);
        nearest = Math.min(Math.max(nearest, 0), TASTES.length - 1);
        setTaste(nearest);
      };

      paginationSvg.addEventListener('pointerdown', function (e) {
        isDragging = true;
        paginationSvg.setPointerCapture(e.pointerId);
        pick(e.clientX);
      });
      paginationSvg.addEventListener('pointermove', function (e) {
        if (isDragging) pick(e.clientX);
      });
      paginationSvg.addEventListener('pointerup', function (e) {
        isDragging = false;
      });
      paginationSvg.addEventListener('pointercancel', function () {
        isDragging = false;
      });
    }

    // Range section card clicks
    document.querySelectorAll('[data-range-card]').forEach(function (card, i) {
      card.addEventListener('click', function () {
        setTaste(i);
        var stage = document.getElementById('stage');
        if (stage) {
          stage.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function initScrollHub() {
    var stage = document.getElementById('stage');
    var scrollIndicator = document.querySelector('.scroll_indicator');
    var benefitsNav = document.querySelector('.benefits_nav');
    var manifestoLayer = document.querySelector('.manifesto_layer');
    var canStageHost = document.querySelector('[data-asmaan-stage-can]') ? document.querySelector('[data-asmaan-stage-can]').closest('.fixed') : null;
    var canContainer = document.querySelector('[data-asmaan-stage-can]');
    var canImg = canContainer ? canContainer.querySelector('img') : null;

    var benefitSections = [
      document.getElementById('benefit-sugar'),
      document.getElementById('benefit-caffeine'),
      document.getElementById('benefit-crash'),
      document.getElementById('benefit-colour')
    ];

    var pinnedSections = document.querySelectorAll('.section.is-pinned');

    var SPREAD_FROM = 0.02;
    var SPREAD_TO = 0.14;
    var CLOSE_UP_IN_FROM = 0.23;
    var CLOSE_UP_IN_TO = 0.3;
    var CLOSE_UP_OUT_FROM = 0.84;
    var CLOSE_UP_OUT_TO = 0.9;
    var CLAIM_FROM = 0.9;
    var CLAIM_TO = 0.945;
    var CLAIM_END_FROM = 0.975;
    var CLAIM_END_TO = 1;

    var eased = 0;
    var seeded = false;
    var lastTime = performance.now();

    function onFrame(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      var windowH = window.innerHeight;
      var windowW = window.innerWidth;
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - windowH;
      var scrollProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

      // 1. Hairline scroll indicator in navbar
      if (scrollIndicator) {
        scrollIndicator.style.setProperty('--p', scrollProgress);
      }

      // 2. Stage scroll progress
      if (stage) {
        var targetProgress = Math.min(Math.max(progressThrough(stage, scrollY, windowH), 0), 1);
        var isMotionOff = document.documentElement.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!seeded || isMotionOff) {
          eased = targetProgress;
          seeded = true;
        } else {
          eased += (targetProgress - eased) * (1 - Math.exp(-7.5 * dt));
        }

        var spread = 1 - range(eased, SPREAD_FROM, SPREAD_TO);
        var closeUp = range(eased, CLOSE_UP_IN_FROM, CLOSE_UP_IN_TO) * (1 - range(eased, CLOSE_UP_OUT_FROM, CLOSE_UP_OUT_TO));
        var claim = range(eased, CLAIM_FROM, CLAIM_TO) * (1 - range(eased, CLAIM_END_FROM, CLAIM_END_TO));

        var pose = poseAt(eased);
        pose.x *= (1 - closeUp * 0.85);

        if (windowW < 992) {
          pose.scale *= 0.72 * (1 - (1 - 0.68) * claim);
          pose.x = 0;
          pose.y += 0.06 * (1 - spread);
        }

        // Apply pose to 2D / 3D Can container
        if (canImg) {
          var transformStr = 'translate3d(' + (pose.x * 100) + '%, ' + (pose.y * 100) + '%, 0) scale(' + pose.scale + ') rotate(' + (pose.roll * 57.2958) + 'deg)';
          canImg.style.transform = transformStr;
        }

        // Fixed stage opacity & exit dive
        if (canStageHost) {
          var lit = 1 - range(eased, 0.99, 1);
          canStageHost.style.opacity = String(lit);
          canStageHost.style.transform = lit < 0.01 ? 'translateY(130%)' : 'none';
        }
      }

      // 3. Pinned sections cross-fade calculation
      var profileAmount = 0;
      var benefitAmounts = [0, 0, 0, 0];
      var manifestoAmount = 0;

      pinnedSections.forEach(function (sec) {
        var fade = sec.querySelector('.pin_fade');
        if (!fade) return;

        var rect = sec.getBoundingClientRect();
        var enter = range(rect.top, windowH * 0.4, 0);
        var exit = range(rect.bottom - windowH, 0, windowH * 0.3);
        var amount = enter * exit;

        fade.style.setProperty('--pin-o', String(amount));
        fade.style.setProperty('--pin-y', ((1 - enter) * 30 - (1 - exit) * 30) + 'px');
        fade.style.visibility = amount < 0.01 ? 'hidden' : 'visible';

        if (sec.getAttribute('aria-label') === 'Tasting notes') {
          profileAmount = amount;
        } else if (sec.classList.contains('is-manifesto')) {
          manifestoAmount = amount;
        }
      });

      // 4. Tasting notes background activation
      document.body.classList.toggle('is-taste-active', profileAmount > 0.25);

      // 5. Benefits side-nav & active lines
      benefitSections.forEach(function (sec, idx) {
        if (!sec) return;
        var rect = sec.getBoundingClientRect();
        var enter = range(rect.top, windowH * 0.4, 0);
        var exit = range(rect.bottom - windowH, 0, windowH * 0.3);
        var amt = enter * exit;
        benefitAmounts[idx] = amt;

        var maxWidthEl = sec.querySelector('.benefits_max-width');
        if (maxWidthEl) {
          maxWidthEl.style.setProperty('--benefits-line', amt > 0.3 ? '1' : '0');
        }
      });

      var peakBenefit = Math.max.apply(null, benefitAmounts);
      var activeBenefitIndex = benefitAmounts.indexOf(peakBenefit);

      document.body.classList.toggle('is-taste-dim', peakBenefit > 0.25);

      if (benefitsNav) {
        benefitsNav.style.opacity = String(Math.round(peakBenefit * 20) / 20);
        benefitsNav.style.visibility = peakBenefit < 0.02 ? 'hidden' : 'visible';

        var iconWrappers = benefitsNav.querySelectorAll('.benefits_icon-wrapper');
        iconWrappers.forEach(function (iw, i) {
          var isActive = (i === activeBenefitIndex && peakBenefit > 0.02);
          iw.classList.toggle('is-active', isActive);
          iw.setAttribute('aria-current', String(isActive));
        });
      }

      // 6. Manifesto layer
      if (manifestoLayer) {
        var showManifesto = manifestoAmount > 0.01;
        manifestoLayer.style.opacity = String(manifestoAmount);
        manifestoLayer.style.visibility = showManifesto ? 'visible' : 'hidden';
        manifestoLayer.setAttribute('data-active', String(showManifesto));
      }

      requestAnimationFrame(onFrame);
    }

    requestAnimationFrame(onFrame);
  }

  function initNavbarAndMenu() {
    var menuBtn = document.querySelector('.navbar_menu-button');
    var menuOverlay = document.getElementById('site-menu');
    var motionToggle = document.querySelector('.navbar_toggle');

    if (menuBtn && menuOverlay) {
      menuBtn.addEventListener('click', function () {
        var isOpen = menuOverlay.getAttribute('data-open') === 'true';
        menuOverlay.setAttribute('data-open', String(!isOpen));
        menuOverlay.setAttribute('aria-hidden', String(isOpen));
        menuBtn.setAttribute('aria-expanded', String(!isOpen));
        var spanText = menuBtn.querySelector('span');
        if (spanText) spanText.textContent = isOpen ? 'Menu' : 'Close';
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });

      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          menuOverlay.setAttribute('data-open', 'false');
          menuOverlay.setAttribute('aria-hidden', 'true');
          menuBtn.setAttribute('aria-expanded', 'false');
          var spanText = menuBtn.querySelector('span');
          if (spanText) spanText.textContent = 'Menu';
          document.body.style.overflow = '';
        }
      });

      menuOverlay.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menuOverlay.setAttribute('data-open', 'false');
          menuOverlay.setAttribute('aria-hidden', 'true');
          menuBtn.setAttribute('aria-expanded', 'false');
          var spanText = menuBtn.querySelector('span');
          if (spanText) spanText.textContent = 'Menu';
          document.body.style.overflow = '';
        });
      });
    }

    if (motionToggle) {
      motionToggle.addEventListener('click', function () {
        motionMuted = !motionMuted;
        motionToggle.setAttribute('aria-pressed', String(!motionMuted));
        document.documentElement.dataset.motion = motionMuted ? 'off' : 'on';
        var barsIcon = motionToggle.querySelector('svg');
        if (barsIcon) {
          barsIcon.style.opacity = motionMuted ? '0.4' : '1';
        }
      });
    }
  }

  function initFaqAccordion() {
    document.querySelectorAll('.faq_question').forEach(function (button) {
      button.addEventListener('click', function () {
        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        var answer = document.getElementById(button.getAttribute('aria-controls'));

        // Close all other accordions
        document.querySelectorAll('.faq_question').forEach(function (otherBtn) {
          if (otherBtn !== button) {
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherAns = document.getElementById(otherBtn.getAttribute('aria-controls'));
            if (otherAns) otherAns.setAttribute('data-open', 'false');
          }
        });

        button.setAttribute('aria-expanded', String(!isExpanded));
        if (answer) {
          answer.setAttribute('data-open', String(!isExpanded));
        }
      });
    });
  }

  function init() {
    initTasteInteractions();
    initScrollHub();
    initNavbarAndMenu();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
