/**
 * Asmaan Interactive Experience Controller (Shopify Theme Drop-In)
 * Manages 3D Can Scene, Flavour Switching, Pinned Scroll Stages, and UI Interactions
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
      cx: 218
    }
  ];

  var currentTasteIndex = 0;
  var motionMuted = false;

  function setTaste(index) {
    if (index < 0 || index >= TASTES.length) return;
    currentTasteIndex = index;
    var taste = TASTES[index];

    // 1. Update CSS Variables
    document.documentElement.style.setProperty('--taste-primary', taste.primary);
    document.documentElement.style.setProperty('--taste-secondary', taste.secondary);

    // 2. Update Hero and Profile Carousel Stacks
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

    // 6. Update 3D Can if available
    var canEl = document.querySelector('[data-asmaan-stage-can]');
    if (canEl) {
      var posterImg = canEl.querySelector('img');
      if (posterImg) {
        var imgSrc = canEl.getAttribute('data-img-' + taste.id);
        if (imgSrc) {
          posterImg.src = imgSrc;
        }
      }
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

    // Dot pagination clicks
    document.querySelectorAll('[data-taste-dot]').forEach(function (dot, i) {
      dot.addEventListener('click', function () { setTaste(i); });
    });

    // Range section card clicks
    document.querySelectorAll('[data-range-card]').forEach(function (card, i) {
      card.addEventListener('click', function () { setTaste(i); });
    });
  }

  function initScrollHub() {
    var scrollIndicator = document.querySelector('.scroll_indicator');
    var stage = document.getElementById('stage');
    var benefitsNav = document.querySelector('.benefits_nav');
    var manifestoLayer = document.querySelector('.manifesto_layer');

    function onScroll() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      // Navbar hairline progress
      if (scrollIndicator) {
        scrollIndicator.style.setProperty('--p', progress);
      }

      // Benefits side-nav highlighting
      var benefitSections = [
        document.getElementById('benefit-sugar'),
        document.getElementById('benefit-caffeine'),
        document.getElementById('benefit-crash'),
        document.getElementById('benefit-colour')
      ];

      var anyBenefitActive = false;
      benefitSections.forEach(function (sec, idx) {
        if (!sec) return;
        var rect = sec.getBoundingClientRect();
        var iconWrapper = document.querySelectorAll('.benefits_icon-wrapper')[idx];
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4) {
          anyBenefitActive = true;
          if (iconWrapper) {
            iconWrapper.classList.add('is-active');
            iconWrapper.setAttribute('aria-current', 'true');
          }
        } else {
          if (iconWrapper) {
            iconWrapper.classList.remove('is-active');
            iconWrapper.setAttribute('aria-current', 'false');
          }
        }
      });

      if (benefitsNav) {
        if (anyBenefitActive) {
          benefitsNav.style.opacity = '1';
          benefitsNav.style.visibility = 'visible';
          document.body.classList.add('is-taste-dim');
        } else {
          benefitsNav.style.opacity = '0';
          benefitsNav.style.visibility = 'hidden';
          document.body.classList.remove('is-taste-dim');
        }
      }

      // Manifesto layer
      var manifestoSec = document.querySelector('.is-manifesto');
      if (manifestoSec && manifestoLayer) {
        var mRect = manifestoSec.getBoundingClientRect();
        if (mRect.top <= window.innerHeight * 0.7 && mRect.bottom >= window.innerHeight * 0.3) {
          manifestoLayer.setAttribute('data-active', 'true');
        } else {
          manifestoLayer.setAttribute('data-active', 'false');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
        var dotIcon = menuBtn.querySelector('svg circle:nth-child(5)');
        if (dotIcon) {
          dotIcon.style.transform = isOpen ? 'scale(1)' : 'scale(2.1)';
        }
      });

      // Close menu on link click
      menuOverlay.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          menuOverlay.setAttribute('data-open', 'false');
          menuOverlay.setAttribute('aria-hidden', 'true');
          menuBtn.setAttribute('aria-expanded', 'false');
          var dotIcon = menuBtn.querySelector('svg circle:nth-child(5)');
          if (dotIcon) dotIcon.style.transform = 'scale(1)';
        });
      });
    }

    if (motionToggle) {
      motionToggle.addEventListener('click', function () {
        motionMuted = !motionMuted;
        motionToggle.setAttribute('aria-pressed', String(!motionMuted));
        document.documentElement.classList.toggle('reduce-motion', motionMuted);
      });
    }
  }

  function initFaqAccordion() {
    document.querySelectorAll('.faq_question').forEach(function (button) {
      button.addEventListener('click', function () {
        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        var answer = document.getElementById(button.getAttribute('aria-controls'));

        // Close all others
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
