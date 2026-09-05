/**
 * Asmaan Interactive Experience Engine & 3D WebGL Multi-Can Carousel
 * 100% Exact Port of https://asmaan-one.vercel.app/ for Shopify
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
      labelAttr: 'data-label-jamun',
      tag: 'The original',
      cx: 22
    },
    {
      id: 'mango',
      line1: 'Alphonso',
      line2: 'Mango',
      primary: '#5A2A00',
      secondary: '#EFB36B',
      labelAttr: 'data-label-mango',
      tag: 'Gold into burnt amber',
      cx: 120
    },
    {
      id: 'print',
      line1: 'Wild',
      line2: 'Magenta',
      primary: '#4E0749',
      secondary: '#E6A0E8',
      labelAttr: 'data-label-print',
      tag: 'Rose and pink guava',
      cx: 218
    }
  ];

  var PROFILE = [
    [0.842, 0.0], [0.8804, 0.0547], [0.9265, 0.1094], [0.9608, 0.164], [0.9837, 0.2187],
    [0.9937, 0.2734], [0.9956, 0.3281], [0.9956, 0.3828], [0.9956, 0.4375], [0.9956, 0.4921],
    [0.9956, 0.5468], [0.9956, 0.6015], [0.9956, 0.6562], [0.9956, 0.7109], [0.9956, 0.7655],
    [0.9956, 0.8202], [0.9956, 0.8749], [0.9956, 0.9296], [0.9956, 0.9843], [0.9956, 1.0389],
    [0.9956, 1.0936], [0.9956, 1.1483], [0.9956, 1.203], [0.9956, 1.2577], [0.9956, 1.3124],
    [0.9956, 1.367], [0.9958, 1.4217], [0.9966, 1.4764], [0.9981, 1.5311], [0.9995, 1.5858],
    [1.0, 1.6404], [1.0, 1.6951], [1.0, 1.7498], [1.0, 1.8045], [1.0, 1.8592],
    [1.0, 1.9139], [1.0, 1.9685], [1.0, 2.0232], [1.0, 2.0779], [1.0, 2.1326],
    [1.0, 2.1873], [1.0, 2.2419], [1.0, 2.2966], [1.0, 2.3513], [1.0, 2.406],
    [1.0, 2.4607], [1.0, 2.5154], [1.0, 2.57], [1.0, 2.6247], [1.0, 2.6794],
    [1.0, 2.7341], [1.0, 2.7888], [1.0, 2.8434], [1.0, 2.8981], [1.0, 2.9528],
    [1.0, 3.0075], [1.0, 3.0622], [1.0, 3.1168], [1.0, 3.1715], [1.0, 3.2262],
    [1.0, 3.2809], [1.0, 3.3356], [1.0, 3.3903], [0.9997, 3.4449], [0.9986, 3.4996],
    [0.997, 3.5543], [0.9959, 3.609], [0.9956, 3.6637], [0.9956, 3.7183], [0.9956, 3.773],
    [0.9956, 3.8277], [0.9956, 3.8824], [0.9956, 3.9371], [0.9956, 3.9918], [0.9956, 4.0464],
    [0.9956, 4.1011], [0.9956, 4.1558], [0.9956, 4.2105], [0.9956, 4.2652], [0.9956, 4.3198],
    [0.9956, 4.3745], [0.9956, 4.4292], [0.9956, 4.4839], [0.9956, 4.5386], [0.9956, 4.5933],
    [0.9956, 4.6479], [0.9956, 4.7026], [0.9955, 4.7573], [0.9939, 4.812], [0.9865, 4.8667],
    [0.9711, 4.9213], [0.9551, 4.976], [0.9501, 5.0307], [0.9479, 5.0854], [0.9195, 5.1401],
    [0.8803, 5.1947]
  ];
  var HEIGHT = 5.1947;
  var LABEL = { bottom: 0.2057, top: 5.0022 };
  var SLEEVE_OFFSET = 0.004;

  var KEYFRAMES = [
    { at: 0, spin: -0.25, pitch: 0.16, roll: 0, x: 0, y: -0.05, scale: 0.86 },
    { at: 0.186, spin: 1.1, pitch: 0.1, roll: -0.05, x: 0.2, y: 0.01, scale: 0.94 },
    { at: 0.341, spin: 2.05, pitch: 0.04, roll: 0.05, x: 0.18, y: -0.02, scale: 0.92 },
    { at: 0.495, spin: 3.0, pitch: -0.02, roll: -0.06, x: 0.18, y: -0.02, scale: 0.94 },
    { at: 0.65, spin: 4.0, pitch: 0.02, roll: 0.08, x: 0.18, y: -0.02, scale: 0.92 },
    { at: 0.805, spin: 5.0, pitch: 0.06, roll: -0.04, x: 0.18, y: -0.02, scale: 0.94 },
    { at: 0.959, spin: 5.6, pitch: -0.2, roll: -0.36, x: 0, y: 0, scale: 1.02 },
    { at: 1, spin: 5.9, pitch: 0.12, roll: -0.1, x: 0.02, y: -0.34, scale: 0.8 }
  ];

  // Carousel & Lighting Constants
  var SLOT_OF_HALF_WIDTH = 0.78;
  var MIN_SLOT = 2.2;
  var DEPTH = 1.5;
  var WAVE_HEIGHT = 0.3;
  var WAVE_PER_SLOT = 2.27;
  var TURN_PER_SLOT = 0.7;
  var TILT_X = -0.05;
  var LEAN_Y = 0.28;
  var LEAN_Z = 0.06;
  var TRACK_FOLLOW = 7;
  var CLOSE_UP_DOLLY = 0.53;
  var CLOSE_UP_CAM_Y = -0.7;
  var CLOSE_UP_CAM_PITCH = 0.16;
  var STUDIO_DIM = 0.98;
  var SPOT_INTENSITY = 8.5;
  var CLOSE_UP_ENV = 0.06;
  var SPOT_HEIGHT = 3.2;
  var SPOT_DEPTH = 3.0;
  var SPOT_AIM = 0.9;
  var FRICTION = 2.4;
  var IDLE_DELAY_MS = 1800;

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

  function wrapRange(value, min, max) {
    var size = max - min;
    var folded = (value - min) % size;
    return (folded < 0 ? folded + size : folded) + min;
  }

  function wrapAngle(radians) {
    return radians - Math.PI * 2 * Math.round(radians / (Math.PI * 2));
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

  function shellProfile(THREE) {
    var v2 = function (x, y) { return new THREE.Vector2(x, y); };
    return [
      v2(0.0, 0.168),
      v2(0.26, 0.162),
      v2(0.46, 0.138),
      v2(0.61, 0.083),
      v2(0.72, 0.026),
      v2(0.842, 0.0), v2(0.8804, 0.0547), v2(0.9265, 0.1094), v2(0.9608, 0.164), v2(0.9837, 0.2187),
      v2(0.9937, 0.2734), v2(0.9956, 0.3281), v2(0.9956, 0.3828), v2(0.9956, 0.4375), v2(0.9956, 0.4921),
      v2(0.9956, 0.5468), v2(0.9956, 0.6015), v2(0.9956, 0.6562), v2(0.9956, 0.7109), v2(0.9956, 0.7655),
      v2(0.9956, 0.8202), v2(0.9956, 0.8749), v2(0.9956, 0.9296), v2(0.9956, 0.9843), v2(0.9956, 1.0389),
      v2(0.9956, 1.0936), v2(0.9956, 1.1483), v2(0.9956, 1.203), v2(0.9956, 1.2577), v2(0.9956, 1.3124),
      v2(0.9956, 1.367), v2(0.9958, 1.4217), v2(0.9966, 1.4764), v2(0.9981, 1.5311), v2(0.9995, 1.5858),
      v2(1.0, 1.6404), v2(1.0, 1.6951), v2(1.0, 1.7498), v2(1.0, 1.8045), v2(1.0, 1.8592),
      v2(1.0, 1.9139), v2(1.0, 1.9685), v2(1.0, 2.0232), v2(1.0, 2.0779), v2(1.0, 2.1326),
      v2(1.0, 2.1873), v2(1.0, 2.2419), v2(1.0, 2.2966), v2(1.0, 2.3513), v2(1.0, 2.406),
      v2(1.0, 2.4607), v2(1.0, 2.5154), v2(1.0, 2.57), v2(1.0, 2.6247), v2(1.0, 2.6794),
      v2(1.0, 2.7341), v2(1.0, 2.7888), v2(1.0, 2.8434), v2(1.0, 2.8981), v2(1.0, 2.9528),
      v2(1.0, 3.0075), v2(1.0, 3.0622), v2(1.0, 3.1168), v2(1.0, 3.1715), v2(1.0, 3.2262),
      v2(1.0, 3.2809), v2(1.0, 3.3356), v2(1.0, 3.3903), v2(0.9997, 3.4449), v2(0.9986, 3.4996),
      v2(0.997, 3.5543), v2(0.9959, 3.609), v2(0.9956, 3.6637), v2(0.9956, 3.7183), v2(0.9956, 3.773),
      v2(0.9956, 3.8277), v2(0.9956, 3.8824), v2(0.9956, 3.9371), v2(0.9956, 3.9918), v2(0.9956, 4.0464),
      v2(0.9956, 4.1011), v2(0.9956, 4.1558), v2(0.9956, 4.2105), v2(0.9956, 4.2652), v2(0.9956, 4.3198),
      v2(0.9956, 4.3745), v2(0.9956, 4.4292), v2(0.9956, 4.4839), v2(0.9956, 4.5386), v2(0.9956, 4.5933),
      v2(0.9956, 4.6479), v2(0.9956, 4.7026), v2(0.9955, 4.7573), v2(0.9939, 4.812), v2(0.9865, 4.8667),
      v2(0.9711, 4.9213), v2(0.9551, 4.976), v2(0.9501, 5.0307), v2(0.9479, 5.0854), v2(0.9195, 5.1401),
      v2(0.8803, 5.1947),
      v2(0.892, HEIGHT + 0.012),
      v2(0.901, HEIGHT + 0.03),
      v2(0.895, HEIGHT + 0.048),
      v2(0.871, HEIGHT + 0.056),
      v2(0.847, HEIGHT + 0.044),
      v2(0.83, HEIGHT + 0.018),
      v2(0.74, HEIGHT + 0.002),
      v2(0.45, HEIGHT - 0.006),
      v2(0.2, HEIGHT - 0.001),
      v2(0.0, HEIGHT + 0.004)
    ];
  }

  function radiusAt(y) {
    for (var i = 1; i < PROFILE.length; i++) {
      var r0 = PROFILE[i - 1][0];
      var y0 = PROFILE[i - 1][1];
      var r1 = PROFILE[i][0];
      var y1 = PROFILE[i][1];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return PROFILE[PROFILE.length - 1][0];
  }

  function sleeveGeometry(THREE, segments) {
    var rings = [[radiusAt(LABEL.bottom), LABEL.bottom]];
    for (var i = 0; i < PROFILE.length; i++) {
      var r = PROFILE[i][0];
      var y = PROFILE[i][1];
      if (y > LABEL.bottom && y < LABEL.top) rings.push([r, y]);
    }
    rings.push([radiusAt(LABEL.top), LABEL.top]);

    var positions = [];
    var uvs = [];
    var indices = [];
    var span = LABEL.top - LABEL.bottom;

    for (var ri = 0; ri < rings.length; ri++) {
      var rad = rings[ri][0];
      var yPos = rings[ri][1];
      for (var s = 0; s <= segments; s++) {
        var u = s / segments;
        var theta = (u - 0.5) * Math.PI * 2;
        var rTotal = rad + SLEEVE_OFFSET;
        positions.push(rTotal * Math.sin(theta), yPos, rTotal * Math.cos(theta));
        uvs.push(u, (yPos - LABEL.bottom) / span);
      }
    }

    var stride = segments + 1;
    for (var rIndex = 0; rIndex < rings.length - 1; rIndex++) {
      for (var seg = 0; seg < segments; seg++) {
        var a = rIndex * stride + seg;
        var b = a + 1;
        var c = a + stride;
        var d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function createTabGroup(THREE, tabMaterial) {
    var group = new THREE.Group();
    var ringGeo = new THREE.TorusGeometry(0.21, 0.029, 10, 40);
    var neckGeo = new THREE.BoxGeometry(0.17, 0.022, 0.21);
    var rivetGeo = new THREE.CylinderGeometry(0.057, 0.052, 0.03, 16);

    var ring = new THREE.Mesh(ringGeo, tabMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, HEIGHT + 0.022, 0.25);
    ring.scale.set(1, 0.62, 1);

    var neck = new THREE.Mesh(neckGeo, tabMaterial);
    neck.position.set(0, HEIGHT + 0.02, 0.05);

    var rivet = new THREE.Mesh(rivetGeo, tabMaterial);
    rivet.position.set(0, HEIGHT + 0.018, -0.02);

    group.add(ring, neck, rivet);
    return group;
  }

  function createEnvironmentTexture(THREE, tint, ground) {
    ground = ground || '#07070c';
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    var sky = ctx.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, '#f2f2f6');
    sky.addColorStop(0.36, '#aeb0c0');
    sky.addColorStop(0.54, tint);
    sky.addColorStop(1, ground);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 512, 256);

    ctx.filter = 'blur(9px)';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(44, 18, 92, 152);
    ctx.globalAlpha = 0.7;
    ctx.fillRect(322, 34, 52, 124);
    ctx.globalAlpha = 1;
    ctx.filter = 'none';

    var tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createSpotMaskTexture(THREE) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 256, 256);

    ctx.filter = 'blur(12px)';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(128, 116, 96, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(128, 76, 97, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';

    var tex = new THREE.CanvasTexture(canvas);
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  var stage3D = {
    renderer: null,
    scene: null,
    camera: null,
    spot: null,
    studioLights: null,
    cans: [],
    shellMat: null,
    slots: 6,
    slotWidth: 2.2,
    ringHalf: 6.6,
    track: { position: 0, target: 0, spread: 1 },
    drag: 0,
    velocity: 0,
    spinTarget: null,
    isDragging: false,
    scrubbing: false,
    lastInput: performance.now(),
    unit: 1,
    closeDistance: 1,
    applyTint: null,
    goTo: function (idx) {
      var count = TASTES.length;
      var diff = idx - this.track.target;
      var wrapped = count > 0 ? diff - count * Math.round(diff / count) : diff;
      this.track.target += wrapped;
    },
    setSpinTarget: function (rad) {
      this.spinTarget = rad;
      this.lastInput = performance.now();
    }
  };

  // Chilled Condensation Normal Map Generator for Three.js
  var cachedCondensationTexture = null;
  function getChilledCondensationTexture(THREE) {
    if (cachedCondensationTexture) return cachedCondensationTexture;
    try {
      var size = 512;
      var cvs = document.createElement('canvas');
      cvs.width = size;
      cvs.height = size;
      var ctx = cvs.getContext('2d');
      var imgData = ctx.createImageData(size, size);
      var data = imgData.data;

      // Base neutral normal facing viewer: (128, 128, 255, 255)
      for (var i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }

      var seed = 12345;
      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      function addDroplet(cx, cy, r, strength) {
        var r2 = r * r;
        var minX = Math.max(0, Math.floor(cx - r));
        var maxX = Math.min(size - 1, Math.ceil(cx + r));
        var minY = Math.max(0, Math.floor(cy - r));
        var maxY = Math.min(size - 1, Math.ceil(cy + r));

        for (var py = minY; py <= maxY; py++) {
          var dy = py - cy;
          var dy2 = dy * dy;
          for (var px = minX; px <= maxX; px++) {
            var dx = px - cx;
            var d2 = dx * dx + dy2;
            if (d2 < r2) {
              var nx = (dx / r) * strength;
              var ny = (dy / r) * strength;
              var nz = Math.sqrt(Math.max(0, 1 - (nx * nx + ny * ny)));
              var idx = (py * size + px) * 4;
              data[idx] = Math.min(255, Math.max(0, Math.round(128 + nx * 127)));
              data[idx + 1] = Math.min(255, Math.max(0, Math.round(128 + ny * 127)));
              data[idx + 2] = Math.min(255, Math.max(0, Math.round(nz * 255)));
            }
          }
        }
      }

      // Micro condensation droplets (fine frosty sheen)
      for (var m = 0; m < 2800; m++) {
        var mx = Math.floor(rnd() * size);
        var my = Math.floor(rnd() * size);
        var mr = 1.0 + rnd() * 2.0;
        addDroplet(mx, my, mr, 0.75);
      }

      // Medium chilled beads
      for (var b = 0; b < 380; b++) {
        var bx = Math.floor(rnd() * size);
        var by = Math.floor(rnd() * size);
        var br = 2.5 + rnd() * 4.5;
        addDroplet(bx, by, br, 1.0);
      }

      // Large dripping condensation droplets
      for (var d = 0; d < 50; d++) {
        var dx0 = Math.floor(rnd() * size);
        var dy0 = Math.floor(rnd() * size);
        var dr0 = 5.0 + rnd() * 6.5;
        addDroplet(dx0, dy0, dr0, 1.2);
        if (rnd() > 0.4) {
          addDroplet(dx0, Math.min(size - 1, dy0 + dr0 * 0.85), dr0 * 0.5, 0.9);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      var tex = new THREE.CanvasTexture(cvs);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2.5, 5);
      cachedCondensationTexture = tex;
      return tex;
    } catch (e) {
      console.warn('[Asmaan 3D] Failed to create condensation normal map:', e);
      return null;
    }
  }

  var stage3DInitialized = false;
  function initStage3D() {
    var canHost = document.querySelector('[data-asmaan-stage-can]');
    if (!canHost) return;
    if (stage3DInitialized) return;
    stage3DInitialized = true;
    var THREE = window.THREE;
    if (!THREE) return;

    var canvas = canHost.querySelector('canvas');
    var posterImg = canHost.querySelector('img');
    if (!canvas) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('[Asmaan 3D] WebGL not supported, keeping poster fallback');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);

    // Shared Geometry and Materials
    var segments = 144;
    var shellGeo = new THREE.LatheGeometry(shellProfile(THREE), segments);
    var labelGeo = sleeveGeometry(THREE, segments);

    // Chilled Condensation Normal Texture
    var condensationNormalMap = getChilledCondensationTexture(THREE);

    var shellMat = new THREE.MeshStandardMaterial({
      color: 0xcfd5dc,
      metalness: 0.95,
      roughness: 0.28,
      envMapIntensity: 1.0,
      normalMap: condensationNormalMap,
      normalScale: condensationNormalMap ? new THREE.Vector2(0.45, 0.45) : undefined
    });
    stage3D.shellMat = shellMat;

    var tabMat = new THREE.MeshStandardMaterial({
      color: 0xb9c0c8,
      metalness: 0.95,
      roughness: 0.33
    });

    // 3D Physical Liquid Water Droplets System for Chilled Cans
    var dropGeoShared = new THREE.SphereGeometry(1, 14, 10);
    var trailGeoShared = new THREE.PlaneGeometry(1, 1);

    var baseDropMat;
    try {
      baseDropMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.04,
        metalness: 0.05,
        transmission: 0.92,
        ior: 1.333,
        reflectivity: 0.9,
        transparent: true,
        opacity: 0.95,
        envMapIntensity: 2.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        depthWrite: false
      });
    } catch (e) {
      baseDropMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
        envMapIntensity: 2.0,
        depthWrite: false
      });
    }

    var baseTrailMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    function createCanDropletSystem(canInner, canIndex) {
      var DROP_COUNT = 14;
      var dropletGroup = new THREE.Group();
      canInner.add(dropletGroup);

      var dropMat = baseDropMat.clone();
      var trailMat = baseTrailMat.clone();

      var drops = [];
      var seed = (canIndex + 1) * 314159;
      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      for (var i = 0; i < DROP_COUNT; i++) {
        var mesh = new THREE.Mesh(dropGeoShared, dropMat);
        dropletGroup.add(mesh);

        var trailMesh = new THREE.Mesh(trailGeoShared, trailMat);
        dropletGroup.add(trailMesh);

        var isLarge = i < 4;
        var isMedium = i >= 4 && i < 10;
        var baseRadius = isLarge ? (0.042 + rnd() * 0.018) : (isMedium ? (0.030 + rnd() * 0.012) : (0.020 + rnd() * 0.008));
        var angle = rnd() * Math.PI * 2;
        var startY = 0.5 + rnd() * 3.8;
        var speed = (isLarge ? 0.32 : (isMedium ? 0.22 : 0.12)) + rnd() * 0.15;
        var hesitationFreq = 1.0 + rnd() * 2.5;
        var hesitationOffset = rnd() * Math.PI * 2;

        drops.push({
          mesh: mesh,
          trailMesh: trailMesh,
          baseRadius: baseRadius,
          angle: angle,
          y: startY,
          spawnY: 4.1 + rnd() * 0.4,
          speed: speed,
          hesitationFreq: hesitationFreq,
          hesitationOffset: hesitationOffset,
          state: 'sliding',
          hangTimer: 0,
          fallSpeed: 0,
          fallY: 0,
          stretch: 1.0,
          trailLength: 0
        });
      }

      return {
        group: dropletGroup,
        update: function (dt, focus, isMotionOff, now, alphaMult) {
          if (alphaMult === undefined) alphaMult = 1.0;
          if (focus < 0.02 || alphaMult < 0.01) {
            dropletGroup.visible = false;
            return;
          }
          dropletGroup.visible = true;

          var focusOpacity = Math.min(1, focus * 1.3) * alphaMult;
          dropMat.opacity = 0.95 * focusOpacity;
          trailMat.opacity = 0.16 * focusOpacity;

          for (var i = 0; i < drops.length; i++) {
            var d = drops[i];

            if (!isMotionOff) {
              if (d.state === 'sliding') {
                var hes = Math.sin((now / 1000) * d.hesitationFreq + d.hesitationOffset);
                var slideMult = hes > 0.15 ? Math.pow(hes, 1.8) * 1.5 : 0.06;
                d.y -= d.speed * slideMult * dt;
                d.stretch = 1.0 + slideMult * 1.25;
                d.trailLength = Math.min(0.7, d.trailLength + d.speed * slideMult * dt * 0.5);

                if (d.y <= 0.16) {
                  d.state = 'hanging';
                  d.hangTimer = 0;
                }
              } else if (d.state === 'hanging') {
                d.hangTimer += dt;
                d.stretch = 1.3 + d.hangTimer * 1.5;
                d.y = 0.16 - d.hangTimer * 0.035;
                d.trailLength = Math.max(0, d.trailLength - dt * 0.4);

                if (d.hangTimer > 0.65) {
                  d.state = 'falling';
                  d.fallSpeed = 0.3;
                  d.fallY = d.y;
                }
              } else if (d.state === 'falling') {
                d.fallSpeed += 9.2 * dt * 0.45;
                d.fallY -= d.fallSpeed * dt;
                d.y = d.fallY;
                d.stretch = 1.8;
                d.trailLength = 0;

                if (d.y < -1.4) {
                  d.state = 'sliding';
                  d.y = d.spawnY;
                  d.angle = (d.angle + 1.2 + Math.random() * 2.0) % (Math.PI * 2);
                  d.stretch = 1.0;
                  d.hangTimer = 0;
                  d.fallSpeed = 0;
                  d.trailLength = 0;
                }
              }
            }

            var currentY = d.y;
            var clampedY = Math.max(0.02, Math.min(4.85, currentY));
            var r = radiusAt(clampedY);
            var radialDist = r + d.baseRadius * 0.4;

            d.mesh.position.set(
              radialDist * Math.sin(d.angle),
              currentY,
              radialDist * Math.cos(d.angle)
            );
            d.mesh.rotation.y = d.angle;

            var sX = d.baseRadius;
            var sY = d.baseRadius * d.stretch;
            var sZ = d.baseRadius * 0.75;
            d.mesh.scale.set(sX, sY, sZ);

            if (d.trailMesh) {
              if (d.state === 'sliding' && d.trailLength > 0.04) {
                d.trailMesh.visible = true;
                var tHeight = d.trailLength;
                var tY = currentY + tHeight * 0.5;
                var tClampedY = Math.max(0.02, Math.min(4.85, tY));
                var tR = radiusAt(tClampedY) + 0.005;

                d.trailMesh.position.set(
                  tR * Math.sin(d.angle),
                  tY,
                  tR * Math.cos(d.angle)
                );
                d.trailMesh.rotation.y = d.angle;
                d.trailMesh.scale.set(d.baseRadius * 0.38, tHeight, 1);
              } else {
                d.trailMesh.visible = false;
              }
            }
          }
        }
      };
    }

    // Build 6 cans (2 sets of Jamun, Mango, Magenta)
    var copies = 2;
    var cans = [];
    for (var c = 0; c < copies; c++) {
      for (var t = 0; t < TASTES.length; t++) {
        var taste = TASTES[t];
        var canShellMat = shellMat.clone();
        canShellMat.transparent = true;

        var labelMat = new THREE.MeshStandardMaterial({
          metalness: 0.1,
          roughness: 0.38,
          envMapIntensity: 0.45,
          normalMap: condensationNormalMap,
          normalScale: condensationNormalMap ? new THREE.Vector2(0.7, 0.7) : undefined,
          transparent: true
        });

        var canTabMat = tabMat.clone();
        canTabMat.transparent = true;

        var shellMesh = new THREE.Mesh(shellGeo, canShellMat);
        var labelMesh = new THREE.Mesh(labelGeo, labelMat);
        var tabMesh = createTabGroup(THREE, canTabMat);

        var inner = new THREE.Group();
        inner.add(shellMesh, labelMesh, tabMesh);
        inner.position.y = -HEIGHT / 2;

        var grp = new THREE.Group();
        grp.add(inner);
        scene.add(grp);

        var dropletSys = createCanDropletSystem(inner, c * TASTES.length + t);

        cans.push({
          group: grp,
          inner: inner,
          shellMaterial: canShellMat,
          labelMaterial: labelMat,
          tabMaterial: canTabMat,
          dropletSystem: dropletSys,
          tasteId: taste.id,
          tasteIndex: t,
          setOpacity: function (alpha) {
            this.shellMaterial.opacity = alpha;
            this.labelMaterial.opacity = alpha;
            this.tabMaterial.opacity = alpha;
          }
        });
      }
    }

    // Studio Lighting
    var keyLight = new THREE.DirectionalLight(0xfffdf8, 1.25);
    keyLight.position.set(-3.5, 4, 5);
    var fillLight = new THREE.DirectionalLight(0xc8d2ff, 0.26);
    fillLight.position.set(4, -1, 3);
    var rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(2.5, 3, -5);
    var bounceLight = new THREE.DirectionalLight(0xb9b4d8, 0.34);
    bounceLight.position.set(0, -4, 2.5);
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(keyLight, fillLight, rimLight, bounceLight, ambientLight);

    var studioLights = [
      { light: keyLight, intensity: 1.25 },
      { light: fillLight, intensity: 0.26 },
      { light: rimLight, intensity: 0.7 },
      { light: bounceLight, intensity: 0.34 },
      { light: ambientLight, intensity: 0.3 }
    ];

    // Crescent close-up spot
    var spotMask = createSpotMaskTexture(THREE);
    var spot = new THREE.SpotLight(0xfff6ec, 0, 26, Math.PI / 8, 0.35, 0.2);
    spot.map = spotMask;
    scene.add(spot);
    scene.add(spot.target);

    // Environment map
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envSource = createEnvironmentTexture(THREE, TASTES[0].primary);
    var envTarget = pmrem.fromEquirectangular(envSource);
    envSource.dispose();
    scene.environment = envTarget.texture;

    stage3D.applyTint = function (color) {
      var nextSrc = createEnvironmentTexture(THREE, color);
      var nextEnv = pmrem.fromEquirectangular(nextSrc);
      nextSrc.dispose();
      var prev = envTarget;
      envTarget = nextEnv;
      scene.environment = nextEnv.texture;
      prev.dispose();
    };

    // Load textures with CORS support
    var textureLoader = new THREE.TextureLoader();
    if (typeof textureLoader.setCrossOrigin === 'function') {
      textureLoader.setCrossOrigin('anonymous');
    }

    var loadedTextures = {};
    function loadTexture(tasteObj) {
      var rawUrl = canHost.getAttribute(tasteObj.labelAttr);
      if (!rawUrl) return Promise.resolve(null);
      var url = rawUrl;
      if (url.indexOf('//') === 0) {
        url = window.location.protocol + url;
      }
      return new Promise(function (resolve) {
        textureLoader.load(
          url,
          function (tex) {
            tex.wrapS = THREE.RepeatWrapping;
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            else if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            loadedTextures[tasteObj.id] = tex;
            resolve(tex);
          },
          undefined,
          function (err) {
            console.warn('[Asmaan 3D] Failed to load label texture:', url, err);
            resolve(null);
          }
        );
      });
    }

    Promise.all(TASTES.map(loadTexture)).then(function () {
      for (var i = 0; i < cans.length; i++) {
        var cItem = cans[i];
        var tex = loadedTextures[cItem.tasteId];
        if (tex) {
          cItem.labelMaterial.map = tex;
          cItem.labelMaterial.needsUpdate = true;
        }
      }
      canvas.style.opacity = '1';
      if (posterImg) posterImg.style.opacity = '0';
    });

    canvas.style.opacity = '1';

    // Resize and Framing
    function resize() {
      var w = canHost.clientWidth;
      var h = canHost.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      var fitHeight = HEIGHT * 1.45;
      var half = Math.tan((camera.fov * Math.PI) / 360);
      var distance = fitHeight / 2 / half;
      var wide = camera.aspect >= 1 ? 4.6 : 2.9;
      var neededAspect = wide / fitHeight;
      if (camera.aspect < neededAspect) distance *= neededAspect / camera.aspect;

      camera.updateProjectionMatrix();
      stage3D.unit = fitHeight;
      stage3D.closeDistance = distance;

      var halfVisibleWidth = distance * Math.tan(((camera.fov * Math.PI) / 360) * camera.aspect);
      stage3D.slotWidth = Math.max(MIN_SLOT, halfVisibleWidth * SLOT_OF_HALF_WIDTH);
      stage3D.ringHalf = (cans.length * stage3D.slotWidth) / 2;
    }

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canHost);
    resize();

    // Pointer Drag Handling
    var pointerId = null;
    var lastX = 0;
    var lastTime = 0;

    canvas.addEventListener('pointerdown', function (e) {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      canvas.setPointerCapture(pointerId);
      stage3D.isDragging = true;
      lastX = e.clientX;
      lastTime = performance.now();
      stage3D.lastInput = lastTime;
      stage3D.velocity = 0;
      stage3D.spinTarget = null;
      stage3D.scrubbing = stage3D.slots > 1 && stage3D.track.spread > 0.4;
    });

    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pointerId) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      stage3D.lastInput = now;

      if (stage3D.scrubbing) {
        stage3D.track.target -= dx * 0.0042;
      } else {
        stage3D.drag += dx * 0.012;
        stage3D.velocity = (dx * 0.012) / (Math.max(now - lastTime, 8) / 1000);
      }
      lastTime = now;
    });

    function endDrag(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      stage3D.isDragging = false;
      stage3D.lastInput = performance.now();
      if (stage3D.scrubbing) {
        stage3D.scrubbing = false;
        var nearest = Math.round(stage3D.track.target);
        stage3D.track.target = nearest;
        var wrappedIdx = ((nearest % TASTES.length) + TASTES.length) % TASTES.length;
        setTaste(wrappedIdx);
        return;
      }
      if (performance.now() - lastTime > 120) stage3D.velocity = 0;
      stage3D.velocity = Math.max(-14, Math.min(14, stage3D.velocity));
    }

    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    stage3D.renderer = renderer;
    stage3D.scene = scene;
    stage3D.camera = camera;
    stage3D.cans = cans;
    stage3D.slots = cans.length;
    stage3D.spot = spot;
    stage3D.studioLights = studioLights;
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

    // 6. Update 3D Stage Can
    stage3D.goTo(index);
    if (stage3D.applyTint) {
      stage3D.applyTint(taste.primary);
    }

    // 7. Update Manifesto wash background
    var wash = document.querySelector('.manifesto_wash');
    if (wash) {
      wash.style.background = 'radial-gradient(115% 95% at 50% 54%, ' + taste.secondary + ' 0%, ' + taste.secondary + ' 10%, ' + taste.primary + ' 72%, #07050f 100%)';
    }
    var manifestoField = document.querySelector('.manifesto_field');
    if (manifestoField) {
      manifestoField.style.setProperty('--blob', taste.secondary);
      manifestoField.style.setProperty('--blob-dark', taste.primary);
    }

    document.dispatchEvent(new CustomEvent('asmaan:tastechange', { detail: { taste: taste, index: index } }));
  }

  function initTasteInteractions() {
    setTaste(0);

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
      paginationSvg.addEventListener('pointerup', function () {
        isDragging = false;
      });
      paginationSvg.addEventListener('pointercancel', function () {
        isDragging = false;
      });
    }

    document.querySelectorAll('[data-range-card]').forEach(function (card, i) {
      card.addEventListener('click', function () {
        var href = card.getAttribute('data-href');
        if (href && href !== '#' && href !== '') {
          window.location.href = href;
          return;
        }
        setTaste(i);
        var stage = document.getElementById('stage');
        if (stage) {
          stage.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  var scrollHubInitialized = false;
  function initScrollHub() {
    if (scrollHubInitialized) return;
    scrollHubInitialized = true;
    var stage = document.getElementById('stage');
    var scrollIndicator = document.querySelector('.scroll_indicator');
    var manifestoLayer = document.querySelector('.manifesto_layer');
    var canStageHost = document.querySelector('[data-asmaan-stage-can]') ? document.querySelector('[data-asmaan-stage-can]').closest('.fixed') : null;

    var pinnedSections = document.querySelectorAll('.section.is-pinned');
    var pinnedCache = [];
    pinnedSections.forEach(function (sec) {
      var fade = sec.querySelector('.pin_fade');
      if (fade) {
        pinnedCache.push({
          sec: sec,
          fade: fade,
          isManifesto: sec.classList.contains('is-manifesto'),
          lastAmount: -1,
          lastEnter: -1,
          lastExit: -1,
          enter: 0,
          exit: 0,
          amount: 0
        });
      }
    });

    var benefitIds = ['benefit-sugar', 'benefit-caffeine', 'benefit-crash', 'benefit-colour'];
    var benefitsNav = document.querySelector('.benefits_nav');
    var bIcons = benefitsNav ? benefitsNav.querySelectorAll('.benefits_icon-wrapper') : [];
    var profileSection = document.querySelector('.profile_container') ? document.querySelector('.profile_container').closest('.section') : null;

    var benefitCache = [];
    for (var bi = 0; bi < benefitIds.length; bi++) {
      var bEl = document.getElementById(benefitIds[bi]);
      if (bEl) {
        benefitCache.push({
          el: bEl,
          box: bEl.querySelector('.benefits_max-width'),
          lastLine: -1,
          amount: 0
        });
      }
    }

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
    var lastScrollProgress = -1;
    var lastHostLit = -1;
    var lastTasteActive = false;
    var lastTasteDim = false;
    var lastShowNav = null;
    var lastPeakBenefit = -1;
    var lastActiveBenefitIdx = -1;

    var windowH = window.innerHeight;
    var windowW = window.innerWidth;
    var docHeight = document.documentElement.scrollHeight - windowH;

    window.addEventListener('resize', function () {
      windowH = window.innerHeight;
      windowW = window.innerWidth;
      docHeight = document.documentElement.scrollHeight - windowH;
    }, { passive: true });

    function onFrame(now) {
      var dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      var scrollY = window.scrollY || document.documentElement.scrollTop;
      var scrollProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

      // 1. Hairline scroll indicator in navbar (dirty checked)
      if (scrollIndicator && Math.abs(scrollProgress - lastScrollProgress) > 0.001) {
        scrollIndicator.style.setProperty('--p', scrollProgress);
        lastScrollProgress = scrollProgress;
      }

      // 2. Stage scroll progress & 3D WebGL render
      if (stage) {
        var targetProgress = Math.min(Math.max(progressThrough(stage, scrollY, windowH), 0), 1);
        var isMotionOff = document.documentElement.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!seeded || isMotionOff) {
          eased = targetProgress;
          seeded = true;
        } else {
          eased += (targetProgress - eased) * (1 - Math.exp(-11.0 * dt));
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

        // Apply 3D WebGL Multi-Can Transform & Dramatic Lighting
        if (stage3D.renderer && stage3D.camera && stage3D.cans && stage3D.cans.length > 0) {
          stage3D.track.spread = spread;

          // Track Follow
          var followSpeed = stage3D.scrubbing ? TRACK_FOLLOW * 3 : TRACK_FOLLOW;
          stage3D.track.position += (stage3D.track.target - stage3D.track.position) * (isMotionOff ? 1 : 1 - Math.exp(-followSpeed * dt));

          // Drag / Ambient Idle Drift (Continuous Butter-Smooth Rotation)
          if (!stage3D.isDragging) {
            if (stage3D.spinTarget !== null && stage3D.spinTarget !== undefined) {
              var delta = wrapAngle(stage3D.spinTarget - stage3D.drag);
              stage3D.drag += delta * (isMotionOff ? 1 : 1 - Math.exp(-6 * dt));
              stage3D.velocity = 0;
            } else {
              stage3D.velocity *= Math.exp(-FRICTION * dt);
              if (!isMotionOff && (now - stage3D.lastInput > IDLE_DELAY_MS)) {
                stage3D.velocity += (0.15 - stage3D.velocity) * (1 - Math.exp(-1.6 * dt));
              }
              stage3D.drag += stage3D.velocity * dt;
            }
          }

          var u = stage3D.unit || 1;
          var cDist = stage3D.closeDistance || 1;

          // Camera Dolly for Close-up
          stage3D.camera.position.set(
            0,
            closeUp * CLOSE_UP_CAM_Y,
            cDist * (1 - closeUp * (1 - CLOSE_UP_DOLLY))
          );
          stage3D.camera.rotation.set(closeUp * CLOSE_UP_CAM_PITCH, 0, 0);

          // Dramatic Close-Up Lighting:
          // 1. Dims environment reflections by 94% so metal doesn't fill shadows back in
          var envMult = 1 - closeUp * (1 - CLOSE_UP_ENV);
          if (stage3D.shellMat) {
            stage3D.shellMat.envMapIntensity = 1.0 * envMult;
          }
          for (var ci = 0; ci < stage3D.cans.length; ci++) {
            var cObj = stage3D.cans[ci];
            if (cObj.labelMaterial) {
              cObj.labelMaterial.envMapIntensity = 0.4 * envMult;
            }
          }

          // 2. Dims studio lights by 98%
          if (stage3D.studioLights) {
            for (var si = 0; si < stage3D.studioLights.length; si++) {
              var sItem = stage3D.studioLights[si];
              sItem.light.intensity = sItem.intensity * (1 - closeUp * STUDIO_DIM);
            }
          }

          // 3. Raking crescent spotlight shines down front of the can
          if (stage3D.spot) {
            stage3D.spot.intensity = closeUp * SPOT_INTENSITY;
            stage3D.spot.visible = closeUp > 0.001;
            var canX = pose.x * u;
            var canY = pose.y * u;
            stage3D.spot.position.set(canX, canY + SPOT_HEIGHT, SPOT_DEPTH);
            stage3D.spot.target.position.set(canX, canY + SPOT_AIM, 0);
            stage3D.spot.target.updateMatrixWorld();
          }

          // Multi-can row positions
          var slots = stage3D.slots;
          var slotWidth = stage3D.slotWidth;
          var ringHalf = stage3D.ringHalf;

          for (var cj = 0; cj < slots; cj++) {
            var canObj = stage3D.cans[cj];
            var grp = canObj.group;

            var offset = (cj - stage3D.track.position) * slotWidth;
            var x = slots > 1 ? wrapRange(offset, -ringHalf, ringHalf) : 0;
            var slot = x / slotWidth;
            var focus = Math.max(0, 1 - Math.abs(slot));

            // Smooth Corner Overflow Fade:
            // When a can approaches the edge of the track, smoothly fade it out into the cosmic background
            // so it never abruptly pops or cuts off at the boundary.
            var edgeDist = ringHalf - Math.abs(x);
            var fadeWidth = slotWidth * 1.25;
            var edgeFade = 1.0;
            if (edgeDist <= 0) {
              edgeFade = 0;
            } else if (edgeDist < fadeWidth) {
              var fNorm = edgeDist / fadeWidth;
              edgeFade = fNorm * fNorm * (3 - 2 * fNorm); // Smooth cubic hermite curve
            }

            var presence = spread + (1 - spread) * focus * focus;
            var totalAlpha = presence * edgeFade;

            if (totalAlpha < 0.005) {
              grp.visible = false;
              if (canObj.dropletSystem) {
                canObj.dropletSystem.update(dt, 0, isMotionOff, now, 0);
              }
              continue;
            }
            grp.visible = true;

            // Apply smooth opacity fade to all materials of this can
            if (canObj.setOpacity) {
              canObj.setOpacity(totalAlpha);
            }

            var lift = Math.sin(slot * WAVE_PER_SLOT) * WAVE_HEIGHT;
            grp.position.set(
              pose.x * u + spread * x,
              pose.y * u + spread * lift,
              spread * -Math.abs(x) * DEPTH
            );

            // Homepage carousel rotation: ONLY the can focused in the centre rotates; side cans stay still.
            if (canObj.spinAngle === undefined) canObj.spinAngle = 0;

            if (!isMotionOff) {
              if (spread > 0.15) {
                // Multi-can carousel on homepage
                if (focus > 0.65) {
                  // Center focused can rotates with ambient drift
                  canObj.spinAngle += stage3D.velocity * dt;
                } else {
                  // Side cans stay completely still at their resting angle (front-facing)
                  var targetRest = Math.round(canObj.spinAngle / (Math.PI * 2)) * (Math.PI * 2);
                  canObj.spinAngle += (targetRest - canObj.spinAngle) * (1 - Math.exp(-6.0 * dt));
                }
              } else {
                // Scrolled into single-can narrative section
                canObj.spinAngle = stage3D.drag;
              }
            }

            var canRotationY = pose.spin + canObj.spinAngle + spread * (slot * TURN_PER_SLOT - LEAN_Y);

            grp.rotation.set(
              pose.pitch + spread * TILT_X,
              canRotationY,
              pose.roll + spread * LEAN_Z
            );
            grp.scale.setScalar(pose.scale * presence * (0.85 + 0.15 * edgeFade));

            if (canObj.dropletSystem) {
              canObj.dropletSystem.update(dt, focus, isMotionOff, now, edgeFade);
            }
          }

          stage3D.renderer.render(stage3D.scene, stage3D.camera);
        }

        // Fixed stage opacity & exit dive (dirty checked)
        if (canStageHost) {
          var lit = 1 - range(eased, 0.99, 1);
          if (Math.abs(lit - lastHostLit) > 0.002) {
            lastHostLit = lit;
            canStageHost.style.opacity = String(lit);
            canStageHost.style.transform = lit < 0.01 ? 'translateY(130%)' : 'none';
          }
        }
      }

      // 3. READ PASS: Batch all getBoundingClientRect measurements together (No layout thrashing)
      for (var pi = 0; pi < pinnedCache.length; pi++) {
        var pItem = pinnedCache[pi];
        var rect = pItem.sec.getBoundingClientRect();
        pItem.enter = range(rect.top, windowH * 0.4, 0);
        pItem.exit = range(rect.bottom - windowH, 0, windowH * 0.3);
        pItem.amount = pItem.enter * pItem.exit;
      }

      var pRect = profileSection ? profileSection.getBoundingClientRect() : null;

      for (var bi = 0; bi < benefitCache.length; bi++) {
        var bRect = benefitCache[bi].el.getBoundingClientRect();
        var bEnter = range(bRect.top, windowH * 0.4, 0);
        var bExit = range(bRect.bottom - windowH, 0, windowH * 0.3);
        benefitCache[bi].amount = bEnter * bExit;
      }

      // 4. WRITE PASS: Update styles/classes with zero forced synchronous layout
      for (var pi2 = 0; pi2 < pinnedCache.length; pi2++) {
        var pItem2 = pinnedCache[pi2];
        if (Math.abs(pItem2.amount - pItem2.lastAmount) > 0.002) {
          pItem2.lastAmount = pItem2.amount;
          pItem2.fade.style.setProperty('--pin-o', String(pItem2.amount));
          pItem2.fade.style.setProperty('--pin-y', ((1 - pItem2.enter) * 30 - (1 - pItem2.exit) * 30) + 'px');
          pItem2.fade.style.visibility = pItem2.amount < 0.01 ? 'hidden' : 'visible';

          if (pItem2.isManifesto && manifestoLayer) {
            var showM = pItem2.amount > 0.01;
            manifestoLayer.style.opacity = String(pItem2.amount);
            manifestoLayer.style.visibility = showM ? 'visible' : 'hidden';
            manifestoLayer.setAttribute('data-active', String(showM));
          }
        }
      }

      if (pRect) {
        var pEnter = range(pRect.top, windowH * 0.4, 0);
        var pExit = range(pRect.bottom - windowH, 0, windowH * 0.3);
        var pAmount = pEnter * pExit;
        var isTasteActive = pAmount > 0.25;
        if (isTasteActive !== lastTasteActive) {
          lastTasteActive = isTasteActive;
          document.body.classList.toggle('is-taste-active', isTasteActive);
        }
      }

      var peakBenefit = 0;
      var activeBenefitIdx = 0;
      for (var bi2 = 0; bi2 < benefitCache.length; bi2++) {
        if (benefitCache[bi2].amount > peakBenefit) {
          peakBenefit = benefitCache[bi2].amount;
          activeBenefitIdx = bi2;
        }
      }

      var isTasteDim = peakBenefit > 0.25;
      if (isTasteDim !== lastTasteDim) {
        lastTasteDim = isTasteDim;
        document.body.classList.toggle('is-taste-dim', isTasteDim);
      }

      if (benefitsNav) {
        var showNav = peakBenefit > 0.02;
        if (showNav !== lastShowNav || Math.abs(peakBenefit - lastPeakBenefit) > 0.01) {
          lastShowNav = showNav;
          lastPeakBenefit = peakBenefit;
          benefitsNav.style.opacity = String(peakBenefit);
          benefitsNav.style.visibility = showNav ? 'visible' : 'hidden';
          benefitsNav.setAttribute('aria-hidden', String(!showNav));
        }

        if (showNav && activeBenefitIdx !== lastActiveBenefitIdx) {
          lastActiveBenefitIdx = activeBenefitIdx;
          for (var bii = 0; bii < bIcons.length; bii++) {
            var isCurrent = bii === activeBenefitIdx;
            bIcons[bii].classList.toggle('is-active', isCurrent);
            bIcons[bii].setAttribute('aria-current', String(isCurrent));
          }
        }
      }

      for (var bi3 = 0; bi3 < benefitCache.length; bi3++) {
        var bItem = benefitCache[bi3];
        if (bItem.box) {
          var lineVal = (bi3 === activeBenefitIdx && peakBenefit > 0.02) ? 1 : 0;
          if (lineVal !== bItem.lastLine) {
            bItem.lastLine = lineVal;
            bItem.box.style.setProperty('--benefits-line', String(lineVal));
          }
        }
      }

      requestAnimationFrame(onFrame);
    }

    requestAnimationFrame(onFrame);
  }

  function initNavbarAndMenu() {
    var menuBtn = document.querySelector('.navbar_menu-button, [data-menu-toggle]');
    var menuOverlay = document.getElementById('site-menu');
    var motionToggle = document.querySelector('.navbar_toggle');

    if (!menuOverlay) return;

    function setMenuState(open) {
      menuOverlay.setAttribute('data-open', String(open));
      menuOverlay.setAttribute('aria-hidden', String(!open));
      if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.classList.toggle('is-active', open);
        var spanText = menuBtn.querySelector('.menu-button-text') || menuBtn.querySelector('span');
        if (spanText) spanText.textContent = open ? 'Close' : 'Menu';
        var centerDot = menuBtn.querySelector('.menu-button-center-dot') || menuBtn.querySelector('svg circle:nth-child(5)');
        if (centerDot) {
          centerDot.style.transform = open ? 'scale(2.1)' : 'scale(1)';
          centerDot.style.transformOrigin = '8px 8px';
          centerDot.style.transition = 'transform 0.35s ease';
        }
      }
      menuOverlay.querySelectorAll('.navbar_link, .navbar_bottom a').forEach(function (link) {
        if (open) {
          link.removeAttribute('tabindex');
        } else {
          link.setAttribute('tabindex', '-1');
        }
      });
    }

    window.__asmaanSetMenuState = setMenuState;
    window.__toggleAsmaanMenu = function (force) {
      var current = menuOverlay.getAttribute('data-open') === 'true';
      var next = force !== undefined ? force : !current;
      setMenuState(next);
    };

    if (menuBtn && !menuBtn.dataset.menuBound) {
      menuBtn.dataset.menuBound = 'true';
      menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.__toggleAsmaanMenu();
      });
    }

    var closeButtons = menuOverlay.querySelectorAll('[data-menu-close], .navbar_dropdown-close, .navbar_menu-close-btn');
    closeButtons.forEach(function (btn) {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          setMenuState(false);
        });
      }
    });

    if (!window.__asmaanEscBound) {
      window.__asmaanEscBound = true;
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuOverlay.getAttribute('data-open') === 'true') {
          setMenuState(false);
        }
      });
    }

    menuOverlay.querySelectorAll('a').forEach(function (link) {
      if (!link.dataset.bound) {
        link.dataset.bound = 'true';
        link.addEventListener('click', function () {
          setMenuState(false);
        });
      }
    });

    if (motionToggle && !motionToggle.dataset.bound) {
      motionToggle.dataset.bound = 'true';
      motionToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        motionMuted = !motionMuted;
        document.querySelectorAll('.navbar_toggle, [data-motion-toggle]').forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(!motionMuted));
        });
        document.documentElement.dataset.motion = motionMuted ? 'off' : 'on';
      });
    }

    var header = document.querySelector('.navbar');
    if (header && !header.dataset.hoverBound) {
      header.dataset.hoverBound = 'true';
      header.addEventListener('mouseenter', function () {
        header.classList.add('is-hovered');
      });
      header.addEventListener('mouseleave', function () {
        header.classList.remove('is-hovered');
      });
    }

    if (!window.__asmaanScrollBound) {
      window.__asmaanScrollBound = true;
      window.addEventListener('scroll', function () {
        var nav = document.querySelector('.navbar');
        if (nav) {
          if (window.scrollY > 30) {
            nav.classList.add('is-scrolled');
          } else {
            nav.classList.remove('is-scrolled');
          }
        }
      }, { passive: true });
    }
  }

  // Cosmic Space Starfield with Mouse Interactive Ambient Parallax
  function initCosmicStarfield() {
    var canvas = document.getElementById('asmaan-starfield');
    if (!canvas) return;
    if (canvas.dataset.starfieldBound) return;
    canvas.dataset.starfieldBound = 'true';

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var stars = [];
    var starCount = 240;

    var mouseX = 0;
    var mouseY = 0;
    var targetMouseX = 0;
    var targetMouseY = 0;

    function resize() {
      width = window.innerWidth || document.documentElement.clientWidth;
      height = window.innerHeight || document.documentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function initStars() {
      stars = [];
      var colors = [
        'rgba(255, 255, 255, ',
        'rgba(255, 255, 255, ',
        'rgba(215, 210, 255, ',
        'rgba(255, 240, 215, '
      ];
      for (var i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * (width || 1200),
          y: Math.random() * (height || 800),
          z: 0.15 + Math.random() * 0.85,
          r: 0.5 + Math.random() * 1.5,
          baseAlpha: 0.2 + Math.random() * 0.75,
          twinkleSpeed: 0.015 + Math.random() * 0.035,
          twinklePhase: Math.random() * Math.PI * 2,
          colorPrefix: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    resize();
    initStars();

    window.addEventListener('resize', function () {
      resize();
      initStars();
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      targetMouseX = (e.clientX / (width || 1) - 0.5) * 2;
      targetMouseY = (e.clientY / (height || 1) - 0.5) * 2;
    }, { passive: true });

    function animateStarfield() {
      requestAnimationFrame(animateStarfield);

      var isMotionOff = document.documentElement.dataset.motion === 'off';

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];

        if (!isMotionOff) {
          s.y -= (0.12 * s.z);
          if (s.y < -10) s.y = height + 10;
          s.twinklePhase += s.twinkleSpeed;
        }

        var px = s.x - (mouseX * 38 * s.z);
        var py = s.y - (mouseY * 38 * s.z);

        if (px < -10) px += width + 20;
        else if (px > width + 10) px -= width + 20;

        if (py < -10) py += height + 20;
        else if (py > height + 10) py -= height + 20;

        var currentAlpha = s.baseAlpha * (0.65 + 0.35 * Math.sin(s.twinklePhase));
        ctx.fillStyle = s.colorPrefix + currentAlpha + ')';

        ctx.beginPath();
        ctx.arc(px, py, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();

        if (s.r * s.z > 1.3 && currentAlpha > 0.6) {
          ctx.fillStyle = s.colorPrefix + (currentAlpha * 0.25) + ')';
          ctx.beginPath();
          ctx.arc(px, py, s.r * s.z * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    requestAnimationFrame(animateStarfield);
  }

  // Delegated event listener for menu toggle, motion toggle, top button, and smooth anchor scroll
  if (!window.__asmaanDelegatedBound) {
    window.__asmaanDelegatedBound = true;
    document.addEventListener('click', function (e) {
      var motionBtn = e.target.closest('.navbar_toggle, [data-motion-toggle]');
      if (motionBtn) {
        e.preventDefault();
        e.stopPropagation();
        motionMuted = !motionMuted;
        document.querySelectorAll('.navbar_toggle, [data-motion-toggle]').forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(!motionMuted));
        });
        document.documentElement.dataset.motion = motionMuted ? 'off' : 'on';
        return;
      }

      var toggleBtn = e.target.closest('.navbar_menu-button, [data-menu-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (window.__toggleAsmaanMenu) {
          window.__toggleAsmaanMenu();
        }
        return;
      }

      var closeBtn = e.target.closest('[data-menu-close], .navbar_dropdown-close, .navbar_menu-close-btn');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (window.__asmaanSetMenuState) {
          window.__asmaanSetMenuState(false);
        }
        return;
      }

      // Close menu if clicking menu links
      if (e.target.closest('#site-menu a')) {
        if (window.__asmaanSetMenuState) {
          window.__asmaanSetMenuState(false);
        }
      }

      var topBtn = e.target.closest('[data-back-to-top], a[href="#top"]');
      if (topBtn) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Smooth scroll for internal hashes on the same page
      var anchor = e.target.closest('a[href*="#"]');
      if (anchor) {
        var href = anchor.getAttribute('href');
        if (href && (href.startsWith('#') || href.startsWith('/#'))) {
          var hash = href.replace(/^\/#?/, '#');
          var target = document.querySelector(hash);
          if (target && (window.location.pathname === '/' || !href.startsWith('/#'))) {
            e.preventDefault();
            if (window.__asmaanSetMenuState) {
              window.__asmaanSetMenuState(false);
            }
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }

  function initFaqAccordion() {
    var buttons = document.querySelectorAll('.faq_question');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        var answerId = button.getAttribute('aria-controls');
        var answer = document.getElementById(answerId);

        buttons.forEach(function (otherBtn) {
          if (otherBtn !== button) {
            otherBtn.setAttribute('aria-expanded', 'false');
            var otherId = otherBtn.getAttribute('aria-controls');
            var otherAns = document.getElementById(otherId);
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

  function waitForThree(callback) {
    if (window.THREE) {
      callback();
      return;
    }
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (window.THREE) {
        clearInterval(interval);
        callback();
      } else if (attempts > 100) {
        clearInterval(interval);
        console.warn('[Asmaan] Three.js load timed out');
      }
    }, 50);
  }

  function init() {
    waitForThree(function () {
      initStage3D();
    });
    initCosmicStarfield();
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

  document.addEventListener('shopify:block:select', function (e) {
    var blockId = e.detail.blockId;
    var btn = document.querySelector('[aria-controls="faq-answer-' + blockId + '"]');
    var ans = document.getElementById('faq-answer-' + blockId);
    if (btn && ans) {
      btn.setAttribute('aria-expanded', 'true');
      ans.setAttribute('data-open', 'true');
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  document.addEventListener('click', function (e) {
    var topBtn = e.target.closest('[data-back-to-top], a[href="#top"]');
    if (topBtn) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();
