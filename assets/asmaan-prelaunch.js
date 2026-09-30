(function () {
  var root = document.querySelector('[data-prelaunch]');
  if (!root) return;
  var form = root.querySelector('#prelaunch-form');
  var err = root.querySelector('[data-pl-error]');
  var btn = root.querySelector('[data-pl-submit]');
  var done = root.querySelector('[data-pl-done]');
  var sheet = root.getAttribute('data-sheet-url') || '';
  var label = btn.textContent;

  // Live counter: the script returns the sheet's registration count; each one uses up `per` cans.
  var stock = root.querySelector('[data-pl-stock]');
  var left = stock.querySelector('[data-pl-left]');
  var bar = stock.querySelector('[data-pl-bar]');
  var total = +stock.getAttribute('data-total') || 1000;
  var per = +stock.getAttribute('data-per') || 6;
  var used = 0;

  function paint() {
    var n = Math.max(0, total - used * per);
    left.textContent = n;
    bar.style.width = (n / total * 100) + '%';
    stock.hidden = false;
  }

  function poll() {
    if (!sheet) return;
    fetch(sheet + (sheet.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) { if (typeof d.count === 'number') { used = d.count; paint(); } })
      .catch(function () {}); // counter stays hidden or at its last value
  }
  poll();
  setInterval(poll, 30000);

  function fail(msg, field) {
    err.textContent = msg;
    err.hidden = false;
    if (field) field.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var name = form.elements['contact[name]'];
    var email = form.elements['contact[email]'];
    var addr = form.elements['contact[body]'];
    if (!name.value.trim()) return fail('Enter your name.', name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) return fail('Enter a valid email address.', email);
    if (addr.value.trim().length < 8) return fail('Enter your full delivery address.', addr);

    btn.disabled = true;
    btn.textContent = 'Sending…';

    var payload = new URLSearchParams({
      timestamp: new Date().toISOString(),
      name: name.value.trim(),
      email: email.value.trim(),
      address: addr.value.trim(),
      source: 'prelaunch-free-sample'
    });

    // Shopify customer record as a backup. Fire and forget.
    fetch(form.action, { method: 'POST', body: new FormData(form) }).catch(function () {});

    var sent = sheet
      ? fetch(sheet, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload.toString() })
      : Promise.reject(new Error('no sheet url'));

    // no-cors hides the status, so only a network failure is detectable here.
    sent.then(function () {
      used += 1; paint();
      form.hidden = true;
      done.hidden = false;
      done.focus();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = label;
      fail('Could not send. Check your connection and try again.');
    });
  });
})();
