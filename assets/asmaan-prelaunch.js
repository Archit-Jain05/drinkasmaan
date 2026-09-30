(function () {
  var root = document.querySelector('[data-prelaunch]');
  if (!root) return;
  var form = root.querySelector('#prelaunch-form');
  var err = root.querySelector('[data-pl-error]');
  var btn = root.querySelector('[data-pl-submit]');
  var done = root.querySelector('[data-pl-done]');
  var sheet = root.getAttribute('data-sheet-url') || '';
  var label = btn.textContent;

  // ---- Counter: a bank of reels that roll down and settle, like a lotto machine ----
  var stock = root.querySelector('[data-pl-stock]');
  var reelsBox = stock.querySelector('[data-pl-reels]');
  var bar = stock.querySelector('[data-pl-bar]');
  var sr = stock.querySelector('[data-pl-sr]');
  var total = +stock.getAttribute('data-total') || 1000;
  var per = +stock.getAttribute('data-per') || 6;
  var used = 0;
  var width = String(total).length;
  var CYCLES = 4; // full turns a reel makes before it settles
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var strips = [];
  var shown = null; // value the reels currently show

  // Each strip counts 9..0 over and over, so moving it up counts down. One spare cycle
  // at the end lets the settle overshoot slightly without running off the strip.
  var run = '';
  for (var c = 0; c <= CYCLES; c++) for (var d = 9; d >= 0; d--) run += '<i>' + d + '</i>';
  for (var i = 0; i < width; i++) {
    var reel = document.createElement('span');
    reel.className = 'prelaunch_reel';
    var strip = document.createElement('span');
    strip.className = 'prelaunch_strip';
    strip.innerHTML = run;
    reel.appendChild(strip);
    reelsBox.appendChild(reel);
    strips.push(strip);
  }

  function pad(v) { return ('0000000000' + v).slice(-width); }

  function roll(to, from) {
    var t = pad(to), f = pad(from);
    var lead = width - String(to).length;
    strips.forEach(function (strip, i) {
      var startIdx = 9 - (+f[i]);
      var endIdx = CYCLES * 10 + (9 - (+t[i]));
      strip.parentNode.classList.toggle('is-zero', i < lead);
      strip.style.transition = 'none';
      strip.style.setProperty('--i', startIdx);
      if (reduce) { strip.style.setProperty('--i', endIdx); return; }
      void strip.offsetHeight;
      strip.classList.add('is-rolling');
      // Left reel stops first, the rest follow, each with a small overshoot as it settles.
      strip.style.transition = 'transform ' + (1500 + i * 420) + 'ms cubic-bezier(.16,.9,.3,1.1) ' + (i * 90) + 'ms';
      strip.style.setProperty('--i', endIdx);
      var end = function (e) {
        if (e.propertyName === 'transform') {
          strip.classList.remove('is-rolling');
          strip.removeEventListener('transitionend', end);
        }
      };
      strip.addEventListener('transitionend', end);
    });
    sr.textContent = to + ' of ' + total + ' free sample cans left';
    shown = to;
  }

  function left() { return Math.max(0, total - used * per); }

  function paint() {
    var n = left();
    if (shown === null) {
      // First time: start from the full count, then run it down to the real number.
      stock.hidden = false;
      bar.style.width = '100%';
      roll(n, total);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.width = (n / total * 100) + '%'; });
      });
    } else if (n !== shown) {
      roll(n, shown);
      bar.style.width = (n / total * 100) + '%';
    }
  }

  function poll() {
    if (!sheet) return;
    fetch(sheet + (sheet.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (d) { if (typeof d.count === 'number') { used = d.count; paint(); } })
      .catch(function () {}); // counter stays hidden or keeps its last value
  }
  poll();
  setInterval(poll, 30000);

  // ---- Address suggestions (India): type to filter; city suggestions follow the chosen state ----
  var PLACES = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Anantapur', 'Kadapa'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
    'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Raigarh', 'Jagdalpur'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch', 'Morbi'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat', 'Yamunanagar'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Manali', 'Kullu'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Hazaribagh', 'Deoghar'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Udupi'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad', 'Kottayam'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Kolhapur', 'Amravati', 'Nanded', 'Sangli', 'Vasai-Virar'],
    'Manipur': ['Imphal', 'Thoubal', 'Churachandpur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
    'Mizoram': ['Aizawl', 'Lunglei'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar'],
    'Sikkim': ['Gangtok', 'Namchi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Tiruppur', 'Hosur'],
    'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'Tripura': ['Agartala', 'Udaipur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Noida', 'Greater Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Mathura'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur'],
    'Andaman and Nicobar Islands': ['Port Blair'],
    'Chandigarh': ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa', 'Diu'],
    'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
    'Ladakh': ['Leh', 'Kargil'],
    'Lakshadweep': ['Kavaratti'],
    'Puducherry': ['Puducherry', 'Karaikal']
  };
  var stateInput = form.elements['contact[state]'];
  var cityInput = form.elements['contact[city]'];
  var stateList = root.querySelector('#pl-states');
  var cityList = root.querySelector('#pl-cities');
  var allStates = Object.keys(PLACES).sort();

  function fillList(list, items) {
    list.innerHTML = '';
    items.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      list.appendChild(o);
    });
  }
  // Case-insensitive match against the real state names (browser autofill may change the case).
  function matchState(v) {
    v = v.trim().toLowerCase();
    return allStates.filter(function (s) { return s.toLowerCase() === v; })[0] || '';
  }
  function refreshCities() {
    var st = matchState(stateInput.value);
    var cities = st ? PLACES[st] : [].concat.apply([], allStates.map(function (s) { return PLACES[s]; }));
    fillList(cityList, cities.filter(function (c, i) { return cities.indexOf(c) === i; }).sort());
  }
  fillList(stateList, allStates);
  refreshCities();
  stateInput.addEventListener('input', refreshCities);
  stateInput.addEventListener('change', refreshCities);

  // ---- Form ----
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
    var line1 = form.elements['contact[address1]'];
    var line2 = form.elements['contact[address2]'];
    var pin = form.elements['contact[pincode]'];
    var state = matchState(stateInput.value);
    if (!name.value.trim()) return fail('Enter your name.', name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) return fail('Enter a valid email address.', email);
    if (line1.value.trim().length < 4) return fail('Enter your address line 1.', line1);
    if (!state) return fail('Pick your state from the list.', stateInput);
    stateInput.value = state;
    if (!cityInput.value.trim()) return fail('Enter your city.', cityInput);
    if (!/^[1-9][0-9]{5}$/.test(pin.value.trim())) return fail('Enter a 6-digit PIN code.', pin);

    // One readable address for the Shopify record and for any script that only knows "address".
    var address = [
      line1.value.trim(),
      line2.value.trim(),
      cityInput.value.trim() + ', ' + state + ' ' + pin.value.trim()
    ].filter(Boolean).join('\n');
    form.querySelector('[data-pl-body]').value = address;

    btn.disabled = true;
    btn.textContent = 'Sending…';

    var payload = new URLSearchParams({
      timestamp: new Date().toISOString(),
      name: name.value.trim(),
      email: email.value.trim(),
      address: address,
      address1: line1.value.trim(),
      address2: line2.value.trim(),
      city: cityInput.value.trim(),
      state: state,
      pincode: pin.value.trim(),
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
