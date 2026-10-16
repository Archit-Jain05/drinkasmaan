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
          lift = ease(clamp((-r.top / span - 0.027) / 0.578));
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
    var raf = 0;

    function aim(e) {
      var r = mirror.getBoundingClientRect();
      var nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 560));
      var ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 460));
      ty = nx * 24;      // swivel left / right
      tx = -ny * 16;     // tip up / down
      tgx = 50 + nx * 55;
      lastPointer = performance.now();
    }
    area.addEventListener('pointermove', aim);
    area.addEventListener('pointerleave', function() { tx = 0; ty = 0; tgx = 50; lastPointer = 0; });

    function tick(now) {
      raf = 0;
      if (!visible) return;
      // Nobody pointing at it: a slow sway so it reads as an object you can move.
      if (!lastPointer || now - lastPointer > 1800) {
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

  function boot() {
    document.querySelectorAll('[data-psb]').forEach(function(root) { init(root); initMirror(root); initFizz(root); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('shopify:section:load', boot);
})();
