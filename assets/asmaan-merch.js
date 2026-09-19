/**
 * Asmaan — Merchandise Capsule Page Engine (assets/asmaan-merch.js)
 * High-performance vanilla JS scroll observer, 3D garment turnover physics,
 * dissolve engine, and drop modal controller.
 * 100% Exact match of Next.js /merch interactive architecture.
 */

(function() {
  'use strict';

  function initMerch() {
    var root = document.documentElement;
    var heroRail = document.querySelector('[data-merch-rail]');
    var heroPieces = heroRail ? Array.from(heroRail.children) : [];
    var marquee = document.querySelector('[data-merch-marquee]');
    var run = document.querySelector('.merch_run');
    var pieceScreens = run ? Array.from(run.querySelectorAll('.merch_piece')) : [];
    var navItems = run ? Array.from(run.querySelectorAll('.merch_nav-item')) : [];
    var dropModal = document.querySelector('.drop_modal');
    var dropClose = dropModal ? dropModal.querySelector('.drop_close') : null;
    var dropEmailInput = dropModal ? dropModal.querySelector('#drop-email') : null;

    if (!run && !heroRail && !marquee) return;

    var HANG = [
      { height: '34svh', tilt: '-7deg', lap: '-3%', drift: 0.16 },
      { height: '42svh', tilt: '0deg', lap: '-1%', drift: 0.06 },
      { height: '47svh', tilt: '6deg', lap: '-3%', drift: 0.2 }
    ];

    var LIT_FROM = -0.2;
    var LIT_TO = 0.05;
    var DIM_FROM = 0.95;
    var DIM_TO = 1.2;
    var TURN_FROM = 0.22;
    var TURN_TO = 0.52;
    var FOLLOW = 9;

    function smooth(t) {
      return t * t * (3 - 2 * t);
    }

    function range(value, from, to) {
      if (to === from) return value >= to ? 1 : 0;
      return Math.min(Math.max((value - from) / (to - from), 0), 1);
    }

    // Per-piece internal state
    var pieceStates = pieceScreens.map(function(screen, i) {
      var turnBtn = screen.querySelector('.merch_turn');
      var frontBtn = screen.querySelector('.merch_face-button[data-face="front"]');
      var backBtn = screen.querySelector('.merch_face-button[data-face="back"]');
      var sizeBtns = Array.from(screen.querySelectorAll('.merch_size'));

      var state = {
        index: i,
        screen: screen,
        turnBtn: turnBtn,
        frontBtn: frontBtn,
        backBtn: backBtn,
        sizeBtns: sizeBtns,
        primary: screen.getAttribute('data-primary') || '#2A1D4A',
        secondary: screen.getAttribute('data-secondary') || '#9089D3',
        angle: 0,
        turns: 0,
        facing: false,
        lit: -1
      };

      if (turnBtn) {
        turnBtn.addEventListener('click', function() {
          state.turns += 1;
        });
      }

      if (frontBtn) {
        frontBtn.addEventListener('click', function() {
          if (state.facing) state.turns += 1;
        });
      }

      if (backBtn) {
        backBtn.addEventListener('click', function() {
          if (!state.facing) state.turns += 1;
        });
      }

      sizeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          var isPressed = btn.getAttribute('aria-pressed') === 'true';
          sizeBtns.forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
          if (!isPressed) {
            btn.setAttribute('aria-pressed', 'true');
          }
        });
      });

      return state;
    });

    var activePieceIndex = -1;

    function setActivePiece(index) {
      if (index === activePieceIndex) return;
      activePieceIndex = index;
      var current = pieceStates[index];
      if (current) {
        root.style.setProperty('--taste-primary', current.primary);
        root.style.setProperty('--taste-secondary', current.secondary);
      }
      navItems.forEach(function(item, idx) {
        if (idx === index) {
          item.classList.add('is-active');
          item.setAttribute('aria-current', 'true');
        } else {
          item.classList.remove('is-active');
          item.removeAttribute('aria-current');
        }
      });
    }

    // Initialize root colors and display state with piece 0
    if (pieceStates[0]) {
      setActivePiece(0);
      pieceStates[0].lit = 1;
      pieceStates[0].screen.style.setProperty('--lit', '1');
      pieceStates[0].screen.style.visibility = 'visible';
      pieceStates[0].screen.style.pointerEvents = 'auto';
    }

    // Side nav smooth scroll
    navItems.forEach(function(btn, i) {
      btn.addEventListener('click', function() {
        if (!run) return;
        var rect = run.getBoundingClientRect();
        var scrollY = window.scrollY || window.pageYOffset;
        var runTop = rect.top + scrollY;
        var travel = run.offsetHeight - window.innerHeight;
        var targetY = runTop + (travel * (i + 0.5)) / pieceStates.length;
        window.scrollTo({
          top: targetY,
          behavior: root.dataset.motion === 'off' ? 'auto' : 'smooth'
        });
      });
    });

    // Drop Modal functionality
    function openModal() {
      if (!dropModal) return;
      dropModal.setAttribute('data-open', 'true');
      dropModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (dropEmailInput) {
        setTimeout(function() { dropEmailInput.focus(); }, 100);
      }
    }

    function closeModal() {
      if (!dropModal) return;
      dropModal.setAttribute('data-open', 'false');
      dropModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-open-drop]').forEach(function(btn) {
      btn.addEventListener('click', openModal);
    });

    if (dropClose) {
      dropClose.addEventListener('click', closeModal);
    }

    if (dropModal) {
      dropModal.addEventListener('click', function(e) {
        if (e.target === dropModal) closeModal();
      });
    }

    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dropModal && dropModal.getAttribute('data-open') === 'true') {
        closeModal();
      }
    });

    // After the customer form posts, the page reloads — reopen so the result is visible.
    if (dropModal && dropModal.querySelector('[role="status"], [role="alert"]')) {
      openModal();
    }

    // Continuous Animation & Scroll Loop
    var lastTime = performance.now();
    var lastHeroTravel = -1;
    var marqueeRunning = true;

    function tick(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      var scrollY = window.scrollY || window.pageYOffset;
      var windowH = window.innerHeight;

      // 1. Merch Hero Parallax Drift (dirty checked against scroll changes)
      if (heroRail && heroPieces.length > 0) {
        var heroTravel = Math.min(scrollY, windowH);
        if (Math.abs(heroTravel - lastHeroTravel) > 0.5) {
          lastHeroTravel = heroTravel;
          heroPieces.forEach(function(piece, idx) {
            var defaultDrift = (HANG[idx] && HANG[idx].drift) ? HANG[idx].drift : 0.1;
            var driftAttr = piece.getAttribute('data-drift');
            var drift = driftAttr !== null ? parseFloat(driftAttr) : defaultDrift;
            piece.style.setProperty('--drop', (-heroTravel * drift).toFixed(2) + 'px');
          });
        }
      }

      // 2. Marquee Off-Screen Pausing
      if (marquee) {
        var mRect = marquee.getBoundingClientRect();
        var seen = mRect.bottom > 0 && mRect.top < windowH;
        if (seen !== marqueeRunning) {
          marqueeRunning = seen;
          marquee.dataset.running = String(seen);
        }
      }

      // 3. Merch Stage Sticky Dissolve & 3D Garment Turn
      if (run && pieceStates.length > 0) {
        var runRect = run.getBoundingClientRect();
        var travel = runRect.height - windowH;
        var progress = travel <= 0 ? 0 : Math.min(Math.max(-runRect.top / travel, 0), 1);

        pieceStates.forEach(function(st, i) {
          var through = progress * pieceStates.length - i;
          var last = i === pieceStates.length - 1;

          // Compute lit opacity
          var dim = last ? 0 : range(through, DIM_FROM, DIM_TO);
          var lit = range(through, LIT_FROM, LIT_TO) * (1 - dim);
          if (i === 0 && progress < 0.08) {
            lit = Math.max(lit, 1 - range(through, DIM_FROM, DIM_TO));
          }

          if (Math.abs(lit - st.lit) > 0.002) {
            st.lit = lit;
            st.screen.style.setProperty('--lit', lit.toFixed(3));
            st.screen.style.visibility = lit < 0.02 ? 'hidden' : 'visible';
            st.screen.style.pointerEvents = lit > 0.6 ? 'auto' : 'none';
          }

          // 3D rotation chasing
          if (st.turnBtn) {
            var target = smooth(range(through, TURN_FROM, TURN_TO)) * 180 + st.turns * 180;
            var diff = target - st.angle;
            if (Math.abs(diff) > 0.05) {
              st.angle += diff * (1 - Math.exp(-FOLLOW * dt));
              st.turnBtn.style.setProperty('--turn', st.angle.toFixed(2) + 'deg');
            } else if (st.angle !== target) {
              st.angle = target;
              st.turnBtn.style.setProperty('--turn', target.toFixed(2) + 'deg');
            }

            var turned = ((st.angle % 360) + 360) % 360;
            var facing = turned > 90 && turned < 270;
            if (facing !== st.facing) {
              st.facing = facing;
              if (st.frontBtn) st.frontBtn.setAttribute('aria-pressed', String(!facing));
              if (st.backBtn) st.backBtn.setAttribute('aria-pressed', String(facing));
            }
          }
        });

        // Determine single active piece deterministically without oscillation
        var activeIdx = Math.min(Math.max(Math.round(progress * (pieceStates.length - 1)), 0), pieceStates.length - 1);
        if (activeIdx !== activePieceIndex) {
          setActivePiece(activeIdx);
        }
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMerch);
  } else {
    initMerch();
  }
})();
