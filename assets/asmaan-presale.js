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

  // The loose lid. lift runs 0 → 1 with the scroll; the lid is a rectangle 90% x 73% of the picture
  // (the stylesheet's units are cqw: 1% of the picture's width). It lifts straight off the box, slides
  // back past the far edge, and is set down flat behind the box, a little smaller and turned a few degrees,
  // with a small hop as it lands.
  var REST_UP = 43;         // where it ends up: this far up the screen, still overlapping the top of the box
  var REST_LEFT = -2;       // ...and this far to the left, so it rests just above the box, clear of what is inside
  var REST_SCALE = 1;       // same size throughout
  var REST_TURN = -5;       // ...turned a little, like it was put down, not placed
  var PEAK = 30;            // how high it is lifted off the box
  function lidPose(lift) {
    var rise = ease(clamp(lift / 0.3));                  // 1: straight up off the box
    var b = clamp((lift - 0.24) / 0.76);                 // 2: slide back and come down
    var slide = ease(Math.min(b / 0.82, 1));             // the move takes most of this part
    var down = Math.pow(clamp((b - 0.35) / 0.47), 2);    // it drops towards the table late, speeding up
    var z = PEAK * rise * (1 - down);
    if (b > 0.82) {                                      // lands, hops a little, settles
      var u = (b - 0.82) / 0.18;
      z = 3.2 * Math.sin(u * Math.PI) * (1 - u);
    }
    return {
      x: REST_LEFT * slide,
      y: REST_UP * slide,
      z: z,
      rx: 5 * Math.sin(Math.min(b / 0.82, 1) * Math.PI), // tilts a touch while it travels
      rz: -2.4 * Math.sin(Math.min(lift / 0.4, 1) * Math.PI) + REST_TURN * slide, // a slight roll as it comes off, then the turn
      s: 1 + (REST_SCALE - 1) * slide
    };
  }

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
          // Scrolling, in screens: the lid comes off over about two screens after a short lead-in, then the
          // open box is held.
          var done = -r.top / vh;
          lift = ease(clamp((done - 0.1) / 2.11));
        } else {
          // Phones: the box is pinned (sticky, inside the wrapper); the lid opens over the first part of
          // that, and the open box is held for the rest.
          var pin = root.querySelector('[data-psb-pin]');
          var stage = pin && pin.querySelector('.psb_stage');
          if (pin && stage) {
            var pr = pin.getBoundingClientRect();
            var stuckAt = parseFloat(getComputedStyle(stage).top) || 0;
            // scrolled distance over which the stage stays stuck (it is stuck from the very top)
            var travel = Math.max(pr.top + window.scrollY + pr.height - stage.offsetHeight - stuckAt, 1);
            lift = ease(clamp((window.scrollY / travel - 0.04) / 0.7));
          } else {
            lift = ease(clamp((-hero.getBoundingClientRect().top - 16) / (vh * 0.6)));
          }
        }
        hero.style.setProperty('--lift', lift.toFixed(4));
        // While the box animation is on screen the navbar stays see-through (see the stylesheet).
        document.body.classList.toggle('psb-hero-live', hero.getBoundingClientRect().bottom > vh * 0.35);
        var pose = lidPose(lift);
        hero.style.setProperty('--lx', pose.x.toFixed(3));
        hero.style.setProperty('--ly', pose.y.toFixed(3));
        hero.style.setProperty('--lz', pose.z.toFixed(3));
        hero.style.setProperty('--lrx', pose.rx.toFixed(2));
        hero.style.setProperty('--lrz', pose.rz.toFixed(2));
        hero.style.setProperty('--ls', pose.s.toFixed(4));
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

  // --- The mirror: tilts and swivels towards the cursor ------------------------
  function initMirror(root) {
    var mirror = root.querySelector('[data-psb-mirror]');
    if (!mirror || mirror.dataset.psbReady) return;
    mirror.dataset.psbReady = 'true';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var body = mirror.querySelector('.psb_m3d-body');
    var area = mirror.closest('.psb_ch') || mirror;
    var rx = 0, ry = 0, tx = 0, ty = 0, gx = 50, tgx = 50;
    var lastPointer = 0;
    var visible = false;
    var touchOnly = window.matchMedia('(pointer: coarse)').matches;
    var raf = 0;

    function aim(e) {
      var r = mirror.getBoundingClientRect();
      var nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 560));
      var ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 460));
      ty = nx * 24;      // swivel left / right
      tx = -ny * 16;     // tip up / down
      tgx = 50 + nx * 55;
      lastPointer = performance.now();
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }
    area.addEventListener('pointermove', aim);
    area.addEventListener('pointerleave', function() { tx = 0; ty = 0; tgx = 50; lastPointer = 0; });

    function tick(now) {
      raf = 0;
      if (!visible) return;
      // Nobody pointing at it: a slow sway so it reads as an object you can move. (Not on touch screens:
      // there it stays still until it is touched, which keeps it perfectly steady.)
      if (touchOnly) { if (!lastPointer || now - lastPointer > 1800) { tx = 0; ty = 0; tgx = 50; } }
      else if (!lastPointer || now - lastPointer > 1800) {
        ty = Math.sin(now / 1700) * 7;
        tx = Math.sin(now / 2300) * 3;
        tgx = 50 + Math.sin(now / 1700) * 25;
      }
      rx += (tx - rx) * 0.1;
      ry += (ty - ry) * 0.1;
      gx += (tgx - gx) * 0.1;
      body.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      body.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      body.style.setProperty('--gx', gx.toFixed(1) + '%');
      // On touch screens, stop updating once it has settled (it starts again on the next touch).
      if (touchOnly && Math.abs(tx - rx) < 0.02 && Math.abs(ty - ry) < 0.02 && now - lastPointer > 1800) return;
      raf = requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      }).observe(mirror);
    } else {
      visible = true;
      raf = requestAnimationFrame(tick);
    }
  }

  // --- Fizz: a moving wave of soda with bubbles, at the top and bottom of the cans ------
  function hexToRgb(hex) {
    var h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) n = 0x9089d3;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function tint(rgb, t) { // t of the way to white
    return [Math.round(rgb[0] + (255 - rgb[0]) * t), Math.round(rgb[1] + (255 - rgb[1]) * t), Math.round(rgb[2] + (255 - rgb[2]) * t)];
  }
  function css(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  function initFizz(root) {
    var wrap = root.querySelector('.psb_cans-wrap');
    if (!wrap || wrap.dataset.psbFizz) return;
    wrap.dataset.psbFizz = 'true';

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lis = wrap.querySelectorAll('.psb_cans li');
    var colours = Array.prototype.map.call(lis, function(li) {
      return hexToRgb(getComputedStyle(li).getPropertyValue('--c'));
    });
    if (!colours.length) return;

    // One wave per edge. y is measured in the canvas, base = where the wave sits on average.
    // (The drawing code handles several layers, back to front, if more are ever wanted.)
    var LAYERS = {
      top: [{ base: 212, amp: 27, k: 0.0068, s: 0.95, p: 3.1, a: 1, lighten: 0 }],
      bottom: [{ base: 182, amp: 27, k: 0.0068, s: -0.95, p: 4.0, a: 1, lighten: 0 }]
    };

    function waveY(L, x, t) {
      return L.base + L.amp * (0.62 * Math.sin(x * L.k + t * L.s + L.p) + 0.38 * Math.sin(x * L.k * 2.1 - t * L.s * 1.35 + L.p * 2));
    }

    var views = Array.prototype.map.call(wrap.querySelectorAll('[data-psb-fizz]'), function(canvas) {
      return { canvas: canvas, ctx: canvas.getContext('2d'), mode: canvas.getAttribute('data-psb-fizz'), w: 0, h: 0, dpr: 1, bubbles: [], drops: [], carry: 0, visible: false };
    });

    function resize(v) {
      var r = v.canvas.getBoundingClientRect();
      v.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      v.w = Math.max(1, Math.round(r.width));
      v.h = Math.max(1, Math.round(r.height));
      v.canvas.width = Math.round(v.w * v.dpr);
      v.canvas.height = Math.round(v.h * v.dpr);
      v.ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    }

    // Where bubbles start and where they pop, per mode (canvas y).
    function spawnBubble(v, t) {
      var L = LAYERS[v.mode][LAYERS[v.mode].length - 1];
      var x = Math.random() * v.w;
      var surf = waveY(L, x, t);
      var r = 1.4 + Math.pow(Math.random(), 2.3) * 6.2;
      var y, popY;
      if (v.mode === 'top') {
        y = surf + 8 + Math.random() * Math.max(4, v.h - surf - 14);
        popY = surf - (10 + Math.random() * 90);
      } else {
        y = surf - 6 - Math.random() * Math.max(4, surf - 134);
        popY = 128 - Math.random() * 46;
      }
      v.bubbles.push({ x: x, y: y, r: r, vy: 22 + r * 8 + Math.random() * 26, wob: 3 + Math.random() * 6, wf: 1.5 + Math.random() * 2.5, ph: Math.random() * 6.28, popY: popY, pop: -1 });
    }

    function drawView(v, t, dt) {
      var ctx = v.ctx, w = v.w, h = v.h;
      ctx.clearRect(0, 0, w, h);
      var layers = LAYERS[v.mode];
      var third = w / colours.length;

      for (var li = 0; li < layers.length; li++) {
        var L = layers[li];
        var ys = [];
        for (var x = 0; x <= w + 8; x += 8) ys.push(waveY(L, x, t));
        for (var c = 0; c < colours.length; c++) {
          var x0 = c * third, x1 = (c + 1) * third;
          ctx.save();
          ctx.beginPath();
          ctx.rect(x0, 0, x1 - x0 + 1, h);
          ctx.clip();
          ctx.beginPath();
          if (v.mode === 'top') {
            ctx.moveTo(x0 - 8, h + 2);
            for (var i = 0; i < ys.length; i++) ctx.lineTo(i * 8, ys[i]);
            ctx.lineTo(w + 8, h + 2);
          } else {
            ctx.moveTo(x0 - 8, 122);
            for (var j = 0; j < ys.length; j++) ctx.lineTo(j * 8, ys[j]);
            ctx.lineTo(w + 8, 122);
          }
          ctx.closePath();
          var base = tint(colours[c], L.lighten);
          if (L.a < 1) {
            // the paler back layers melt away towards the flat column colour, so there is no step where they meet
            var fade = v.mode === 'top' ? ctx.createLinearGradient(0, L.base - L.amp, 0, h - 8) : ctx.createLinearGradient(0, 126, 0, 176);
            fade.addColorStop(v.mode === 'top' ? 0 : 1, css(base, L.a));
            fade.addColorStop(v.mode === 'top' ? 1 : 0, css(base, 0));
            ctx.fillStyle = fade;
          } else {
            ctx.fillStyle = css(base, L.a);
          }
          ctx.fill();
          // depth: a lighter cap near the surface, fading into the body of the wave
          var g = v.mode === 'top'
            ? ctx.createLinearGradient(0, L.base - L.amp, 0, L.base + 70)
            : ctx.createLinearGradient(0, L.base + L.amp, 0, 126);
          g.addColorStop(0, 'rgba(255,255,255,' + (0.3 * L.a) + ')');
          g.addColorStop(1, 'rgba(255,255,255,0)'); // ends at the column edge: no step where they join
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        }
      }

      // Foam line along the front crest, with a soft shadow under it
      var F = layers[layers.length - 1];
      ctx.beginPath();
      for (var k = 0; k <= w + 8; k += 8) {
        var yy = waveY(F, k, t);
        if (k === 0) ctx.moveTo(k, yy); else ctx.lineTo(k, yy);
      }
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 9;
      ctx.save(); ctx.translate(0, v.mode === 'top' ? 6 : -6); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bubbles
      var want = Math.min(110, (w / 1000) * 30);
      if (dt > 0 && !still) {
        v.carry += want * dt * 0.9;
        while (v.carry >= 1) { v.carry -= 1; if (v.bubbles.length < want * 3) spawnBubble(v, t); }
      }
      for (var b = v.bubbles.length - 1; b >= 0; b--) {
        var o = v.bubbles[b];
        if (o.pop < 0) {
          o.y -= o.vy * dt;
          o.x += Math.sin(t * o.wf + o.ph) * o.wob * dt;
          if (o.y <= o.popY) {
            o.pop = 0;
            var n = o.r > 3 ? 4 : 2;
            for (var d = 0; d < n; d++) v.drops.push({ x: o.x, y: o.y, vx: (Math.random() - 0.5) * 70, vy: -(30 + Math.random() * 60), life: 0.35 + Math.random() * 0.2, age: 0 });
          }
        } else {
          o.pop += dt;
          if (o.pop > 0.22) { v.bubbles.splice(b, 1); continue; }
        }
        var alpha = 0.9;
        if (v.mode === 'bottom') alpha = Math.max(0, Math.min(1, (o.y - (o.popY - 4)) / 50)) * 0.9;
        if (o.pop < 0) {
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.14 * alpha) + ')'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * alpha) + ')'; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(o.x - o.r * 0.34, o.y - o.r * 0.36, Math.max(0.6, o.r * 0.26), 0, 6.2832);
          ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')'; ctx.fill();
        } else {
          var q = o.pop / 0.22;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (1 + q * 1.1), 0, 6.2832);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.65 * (1 - q) * alpha) + ')'; ctx.lineWidth = 1; ctx.stroke();
        }
      }
      // droplets thrown off by popping bubbles
      for (var m = v.drops.length - 1; m >= 0; m--) {
        var p = v.drops[m];
        p.age += dt;
        if (p.age > p.life) { v.drops.splice(m, 1); continue; }
        p.vy += 220 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1, 0, 6.2832);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * (1 - p.age / p.life)) + ')'; ctx.fill();
      }
    }

    var raf = 0, last = 0;
    function frame(now) {
      raf = 0;
      var any = false;
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      var t = now / 1000;
      views.forEach(function(v) { if (v.visible) { any = true; drawView(v, t, dt); } });
      if (any) raf = requestAnimationFrame(frame); else last = 0;
    }

    views.forEach(function(v) {
      resize(v);
      if (still) { drawView(v, 2.4, 0); return; }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function(entries) {
          v.visible = entries[0].isIntersecting;
          if (v.visible && !raf) raf = requestAnimationFrame(frame);
        }, { rootMargin: '120px 0px' }).observe(v.canvas);
      } else {
        v.visible = true;
      }
    });
    if (!still && !('IntersectionObserver' in window)) raf = requestAnimationFrame(frame);
    if ('ResizeObserver' in window) {
      new ResizeObserver(function() { views.forEach(function(v) { resize(v); if (still) drawView(v, 2.4, 0); }); }).observe(wrap);
    } else {
      window.addEventListener('resize', function() { views.forEach(resize); });
    }
  }

  // --- Phone splash: the wordmark is handwritten on a white screen, then the screen crops down to the box ---
  // The handwriting is only the way the letters appear; the letters themselves are always the clean, solid
  // wordmark. Two small files made from the wordmark drive it:
  //  - presale-logo-write.png: the wordmark's own shape (its alpha channel), drawn solid in the brand navy;
  //  - presale-logo-nib.json: the path a pen would take along the centre of every stroke (letter by letter, left
  //    to right, lifting between strokes), with the width of the stroke at each point.
  // As the pen advances, a thick round brush follows that path and the solid wordmark shows only where the
  // brush has been, so every stroke grows along its length and always has the finished, crisp edges.
  var WRITE_MS = 2700, HOLD_MS = 320, CROP_MS = 1050, HAND_OFF_MS = 240;
  // where the wordmark printed on the lid sits in the lid photo (fractions of the photo), and how much of
  // its own width the logo drawing uses
  var LID_LOGO = { cx: 0.4996, cy: 0.4583, w: 0.3517 / 0.98 };
  // the lid's face inside the photo (matches the stylesheet's clip)
  var LID_FACE = { l: 0.05, r: 0.05, t: 0.1193, b: 0.1494 };

  function initSplash() {
    var splash = document.querySelector('[data-psb-splash]');
    if (!splash || splash.dataset.psbDone) return;
    splash.dataset.psbDone = 'true';
    var logo = splash.querySelector('[data-psb-splash-logo]');
    var lidImg = document.querySelector('.psb_lid');
    var phone = window.matchMedia('(max-width: 989px)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function finish() {
      splash.style.display = 'none';
      document.documentElement.style.overflow = '';
    }
    if (!phone || calm || !logo || !lidImg || !splash.animate) { finish(); return; }

    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    splash.style.animation = 'none'; // the script is in charge now; the 6 second safety net is not needed

    var canvas = document.createElement('canvas');
    canvas.className = 'psb_splash-pen';
    logo.appendChild(canvas);

    var pen = null;       // { w, h, logo: canvas with the solid wordmark, ink: canvas that records where the pen has been, ctx }
    var nibTrack = null;  // [[x, y, t, r], ...]; a negative t means the pen is lifted and travelling
    var nibIdx = 0, nibPrev = null;
    var mapImg = new Image();
    mapImg.onload = function() {
      try {
        var w = mapImg.naturalWidth, h = mapImg.naturalHeight;
        var logoCanvas = document.createElement('canvas'); logoCanvas.width = w; logoCanvas.height = h;
        var lctx = logoCanvas.getContext('2d', { willReadFrequently: true });
        lctx.drawImage(mapImg, 0, 0);
        var im = lctx.getImageData(0, 0, w, h), d = im.data;
        for (var i = 0; i < w * h; i++) { d[i * 4] = 20; d[i * 4 + 1] = 32; d[i * 4 + 2] = 46; } // solid navy; keep the wordmark's own alpha
        lctx.putImageData(im, 0, 0);
        var ink = document.createElement('canvas'); ink.width = w; ink.height = h;
        var ictx = ink.getContext('2d');
        ictx.lineCap = 'round'; ictx.lineJoin = 'round'; ictx.strokeStyle = '#000'; ictx.fillStyle = '#000';
        canvas.width = w; canvas.height = h;
        pen = { w: w, h: h, logo: logoCanvas, ink: ink, ictx: ictx, ctx: canvas.getContext('2d') };
      } catch (e) { pen = null; }
    };
    mapImg.src = splash.getAttribute('data-write');
    var nibUrl = splash.getAttribute('data-nib');
    if (nibUrl && window.fetch) {
      fetch(nibUrl).then(function(r) { return r.json(); }).then(function(j) { nibTrack = j.nib; }).catch(function() {});
    }

    function drawPen(progress) {
      // lay down the ink for every point the pen has passed since the last frame
      var ic = pen.ictx;
      while (nibIdx < nibTrack.length && Math.abs(nibTrack[nibIdx][2]) <= progress) {
        var p = nibTrack[nibIdx], lifted = p[2] < 0;
        if (!lifted) {
          ic.lineWidth = p[3] * 2;
          if (nibPrev && !nibPrev.lifted) { ic.beginPath(); ic.moveTo(nibPrev.x, nibPrev.y); ic.lineTo(p[0], p[1]); ic.stroke(); }
          ic.beginPath(); ic.arc(p[0], p[1], p[3], 0, 6.2832); ic.fill();
        }
        nibPrev = { x: p[0], y: p[1], lifted: lifted };
        nibIdx++;
      }
      // the solid wordmark, shown only where the pen has been
      var c = pen.ctx;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, pen.w, pen.h);
      c.drawImage(pen.logo, 0, 0);
      c.globalCompositeOperation = 'destination-in';
      c.drawImage(pen.ink, 0, 0);
      c.globalCompositeOperation = 'source-over';
    }
    function setWipe(v) { logo.style.setProperty('--wipe', v.toFixed(1) + '%'); }
    setWipe(0);

    // 1. Write. A pen is not a machine: it picks up speed after the first touch and eases off at the end.
    var t0 = null;
    function smooth(p) { return p * p * (3 - 2 * p); }
    function write(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / WRITE_MS, 1);
      var e = 0.55 * p + 0.45 * smooth(p); // mostly steady, gently eased at both ends
      if (pen && nibTrack) drawPen(e); else setWipe(e * 100);
      if (p < 1) requestAnimationFrame(write);
      else setTimeout(waitForLid, HOLD_MS);
    }
    // start once the map has had a moment to load (never wait long: fall back to the wipe)
    var armedAt = performance.now();
    (function arm() {
      if (pen && nibTrack) { logo.classList.add('is-pen'); requestAnimationFrame(write); }
      else if (performance.now() - armedAt > 900) { pen = null; requestAnimationFrame(write); }
      else requestAnimationFrame(arm);
    })();

    // 2. When the box is ready, crop the white screen down to the shut lid.
    function waitForLid() {
      var started = performance.now();
      (function check() {
        if (lidImg.complete || performance.now() - started > 2500) crop();
        else requestAnimationFrame(check);
      })();
    }

    function crop() {
      var vw = window.innerWidth, vh = window.innerHeight;
      // The lid photo's projected rectangle (it is a 3D element, so this already includes the slight
      // perspective growth); the lid's face and its printed wordmark are fixed fractions of it.
      var ir = lidImg.getBoundingClientRect();
      var left = ir.left + ir.width * LID_FACE.l, right = ir.right - ir.width * LID_FACE.r;
      var top = ir.top + ir.height * LID_FACE.t, bottom = ir.bottom - ir.height * LID_FACE.b;
      var insetFrom = 'inset(0px 0px 0px 0px)';
      var insetTo = 'inset(' + Math.max(0, top) + 'px ' + Math.max(0, vw - right) + 'px ' + Math.max(0, vh - bottom) + 'px ' + Math.max(0, left) + 'px)';
      // the wordmark lands exactly on the one printed on the lid
      var lr = logo.getBoundingClientRect();
      var tx = ir.left + ir.width * LID_LOGO.cx, ty = ir.top + ir.height * LID_LOGO.cy;
      var scale = (ir.width * LID_LOGO.w) / lr.width;
      var dx = tx - (lr.left + lr.width / 2), dy = ty - (lr.top + lr.height / 2);
      var ease = 'cubic-bezier(0.65, 0, 0.2, 1)';
      var clip = splash.animate([{ clipPath: insetFrom }, { clipPath: insetTo }], { duration: CROP_MS, easing: ease, fill: 'forwards' });
      logo.animate(
        [{ transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)' }, { transform: 'translate(-50%, -50%) translate(' + dx.toFixed(2) + 'px, ' + dy.toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')' }],
        { duration: CROP_MS, easing: ease, fill: 'forwards' }
      );
      // the white screen takes on the lid's own soft light as it closes in: the photo of the lid runs from
      // #f6f6f4 (top left) to #efefed (bottom right), so the same gradient fades in under the wordmark
      var sheen = document.createElement('div');
      sheen.style.cssText = 'position:absolute;inset:0;opacity:0;background:linear-gradient(135deg,#f6f6f4,#efefed);';
      splash.insertBefore(sheen, logo);
      sheen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: CROP_MS, easing: ease, fill: 'forwards' });
      clip.onfinish = function() {
        // Hand over with a short cross-fade. The box underneath is the same white lid with the same
        // wordmark, so anything left over (a pixel of anti-aliasing, the photo's soft light) just melts.
        var out = splash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: HAND_OFF_MS, easing: 'ease-out', fill: 'forwards' });
        out.onfinish = finish;
      };
    }
  }

  function boot() {
    document.querySelectorAll('[data-psb]').forEach(function(root) { init(root); initMirror(root); initFizz(root); });
    initSplash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('shopify:section:load', boot);
})();
