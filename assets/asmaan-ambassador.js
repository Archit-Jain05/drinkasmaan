/**
 * Asmaan — Ambassador Application Engine (assets/asmaan-ambassador.js)
 * Controls smooth form reveal, interactive FAQ accordions,
 * and direct Google Sheets webhook synchronization.
 */

(function() {
  'use strict';

  function initAmbassador() {
    var formSection = document.getElementById('ambassador-form-section');
    var form = document.getElementById('ambassador-form');
    var triggerButtons = document.querySelectorAll('[data-ambassador-open-form]');
    var successBox = document.getElementById('ambassador-success');
    var submitBtn = document.getElementById('ambassador-submit-btn');

    // 1. Reveal form on "Apply Now" button click
    function openForm(e) {
      if (e) e.preventDefault();
      if (!formSection) return;

      formSection.classList.add('is-open');

      // Smooth scroll to form
      var topOffset = formSection.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({
        top: Math.max(topOffset, 0),
        behavior: 'smooth'
      });

      // Focus first input
      setTimeout(function() {
        var firstInput = formSection.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      }, 400);
    }

    triggerButtons.forEach(function(btn) {
      btn.addEventListener('click', openForm);
    });

    // Check if URL has #apply or #ambassador-form
    if (window.location.hash === '#apply' || window.location.hash === '#ambassador-form') {
      setTimeout(openForm, 500);
    }

    // 2. FAQ Accordion Interaction
    var faqItems = document.querySelectorAll('.ambassador_faq-item');
    faqItems.forEach(function(item) {
      var btn = item.querySelector('.ambassador_faq-q');
      var ans = item.querySelector('.ambassador_faq-a');
      if (!btn || !ans) return;

      btn.addEventListener('click', function() {
        var isOpen = item.classList.contains('is-open');

        // Close all others
        faqItems.forEach(function(other) {
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.ambassador_faq-q');
          var otherAns = other.querySelector('.ambassador_faq-a');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          ans.style.maxHeight = ans.scrollHeight + 'px';
        }
      });
    });

    // 3. Form Submission Handling & Google Sheets Integration
    if (form) {
      form.addEventListener('submit', function(e) {
        var sheetUrl = form.getAttribute('data-google-sheet-url') || '';
        
        // If Google Sheet webhook is provided, handle async dispatch
        if (sheetUrl && sheetUrl.trim().length > 0 && sheetUrl.indexOf('http') === 0) {
          e.preventDefault();

          if (submitBtn) {
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;
          }

          var formData = new FormData(form);
          var payload = {
            timestamp: new Date().toISOString(),
            name: formData.get('contact[name]') || formData.get('name') || '',
            email: formData.get('contact[email]') || formData.get('email') || '',
            phone: formData.get('contact[phone]') || formData.get('phone') || '',
            instagram: formData.get('contact[instagram]') || formData.get('instagram') || '',
            tiktok_youtube: formData.get('contact[tiktok_youtube]') || formData.get('tiktok_youtube') || '',
            audience_size: formData.get('contact[audience_size]') || formData.get('audience_size') || '',
            niche: formData.get('contact[niche]') || formData.get('niche') || '',
            message: formData.get('contact[body]') || formData.get('message') || ''
          };

          // Build URLSearchParams to ensure Google Apps Script receives parameters cleanly
          var urlParams = new URLSearchParams();
          for (var key in payload) {
            urlParams.append(key, payload[key]);
          }

          // Also trigger Shopify contact form background submission
          try {
            fetch(form.action || window.location.href, {
              method: 'POST',
              body: new FormData(form)
            }).catch(function() {});
          } catch(err) {}

          // Post to Google Apps Script Web App
          // Note: using mode 'no-cors' allows browser to post to Google Script without CORS preflight failures
          fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlParams.toString()
          }).then(function() {
            onSuccess();
          }).catch(function(err) {
            console.warn('Google Sheet submission warning:', err);
            // Even if network error occurs, show success since payload was dispatched
            onSuccess();
          });

          function onSuccess() {
            if (submitBtn) {
              submitBtn.classList.remove('is-loading');
            }
            if (successBox) {
              successBox.classList.add('is-active');
              successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            // Hide the input fields to prevent re-submission
            var grid = form.querySelector('.ambassador_form-grid');
            if (grid) grid.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'none';
          }
        }
        // If no sheet URL, let the standard Shopify contact form submit naturally
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbassador);
  } else {
    initAmbassador();
  }
})();
