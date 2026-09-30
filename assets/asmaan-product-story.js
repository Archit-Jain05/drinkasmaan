/*
 * Product story (sections/product-story.liquid): the behaviour that used to live in
 * asmaan-drink.js for the parts below the buy box.
 *   1. FAQ drawers
 *   2. Pack tier buttons (update the spec rows)
 *   3. The scroll-driven 3D pack frames
 * Safe to run again after the section is swapped in place (flavour switcher): it stops the
 * previous run first.
 */
(function () {
  'use strict';
  if (window.__productStoryStop) window.__productStoryStop();

  var stops = [];
  window.__productStoryStop = function () {
    stops.forEach(function (fn) { fn(); });
    stops = [];
  };

  // ---- 1. FAQ drawers (same markup and classes as the FAQ on the rest of the site) ----
  var buttons = document.querySelectorAll('.product-story .faq_question');
  function answerFor(btn) {
    var id = btn.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }
  buttons.forEach(function (btn) {
    if (btn.dataset.faqBound) return; // the site-wide script already owns it
    btn.dataset.faqBound = 'true';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach(function (other) {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        var a = answerFor(other);
        if (a) a.setAttribute('data-open', 'false');
      });
      btn.setAttribute('aria-expanded', String(!open));
      var answer = answerFor(btn);
      if (answer) answer.setAttribute('data-open', String(!open));
    });
  });

  // ---- 2. Pack tiers ----
  var tiers = document.querySelectorAll('.product-story .pack_tier');
  tiers.forEach(function (tier) {
    tier.addEventListener('click', function () {
      tiers.forEach(function (t) { t.setAttribute('aria-pressed', String(t === tier)); });
      var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
      set('pack-spec-tier', tier.getAttribute('data-tag') || '');
      set('pack-spec-inside', tier.getAttribute('data-inside') || '');
      set('pack-spec-price', tier.getAttribute('data-price') || '');
    });
  });

  // ---- 3. Pack frames: scrolling through the section plays the pack being built ----
  var stage = document.getElementById('pack-canvas-stage');
  var canvas = document.getElementById('pack-scroll-canvas');
  var poster = document.getElementById('pack-scroll-poster');
  var run = document.querySelector('.product-story .pack_run');
  var hold = document.querySelector('.product-story .pack_hold');
  if (!stage || !canvas || !run) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  var total = parseInt(stage.getAttribute('data-total-frames') || '150', 10);
  var firstUrl = stage.getAttribute('data-first-frame') || (poster ? poster.src : '');
  var frames = [];
  var loaded = false;
  var target = 0;
  var current = 0;
  var lastDrawn = -1;
  var raf = 0;
  var near = false;

  canvas.width = 720;
  canvas.height = 405;

  function draw(i) {
    var img = frames[i];
    if (!ctx || !img || !img.complete || !img.naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    lastDrawn = i;
    if (poster && poster.getAttribute('data-hidden') !== 'true') poster.setAttribute('data-hidden', 'true');
  }

  // The 120+ frames are only fetched once the section is close to the screen.
  function load() {
    if (loaded || !firstUrl) return;
    loaded = true;
    for (var n = 1; n <= total; n++) {
      (function (index) {
        var img = new Image();
        img.src = firstUrl.replace(/pack-frame-\d+\.webp/, 'pack-frame-' + String(index).padStart(2, '0') + '.webp');
        img.onload = function () { if (index === 1 && lastDrawn === -1) draw(0); };
        frames.push(img);
      })(n);
    }
  }

  function onScroll() {
    var rect = run.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    var travel = run.offsetHeight - h;
    var through = travel > 0 ? (-rect.top) / travel : 0;
    target = Math.min(Math.max(through, 0), 1);
    if (hold) hold.style.setProperty('--build', target);
  }

  // Only animate while the section is on (or near) the screen.
  function loop() {
    if (!near) { raf = 0; return; }
    current += (target - current) * 0.22;
    var idx = Math.min(Math.max(Math.round(current * (total - 1)), 0), total - 1);
    if (frames.length && idx !== lastDrawn) draw(idx);
    raf = requestAnimationFrame(loop);
  }

  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      near = entries[0].isIntersecting;
      if (near) { load(); onScroll(); if (!raf) raf = requestAnimationFrame(loop); }
    }, { rootMargin: '600px 0px' });
    io.observe(run);
  } else {
    near = true; load(); raf = requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  stops.push(function () {
    if (io) io.disconnect();
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    near = false;
  });
})();
