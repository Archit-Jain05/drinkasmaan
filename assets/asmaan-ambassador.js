/**
 * Asmaan — Ambassador Application Engine & Global Notification System
 * (assets/asmaan-ambassador.js)
 */

(function() {
  'use strict';

  // ==========================================================================
  // 1. GLOBAL FLOATING TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  window.asmaanNotify = function(options) {
    options = options || {};
    var type = options.type || 'info'; // 'success', 'error', 'info'
    var title = options.title || (type === 'success' ? 'Confirmed' : (type === 'error' ? 'Action Required' : 'Notice'));
    var message = options.message || '';
    var duration = options.duration || (type === 'error' ? 6500 : 5000);

    var portal = document.getElementById('asmaan-toast-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'asmaan-toast-portal';
      portal.className = 'asmaan-toast-portal';
      portal.setAttribute('aria-live', 'polite');
      document.body.appendChild(portal);
    }

    var toast = document.createElement('div');
    toast.className = 'asmaan-toast asmaan-toast--' + type;

    var iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>';
    }

    toast.innerHTML = [
      '<div class="asmaan-toast_icon">' + iconSvg + '</div>',
      '<div class="asmaan-toast_content">',
      '  <div class="asmaan-toast_title">' + title + '</div>',
      '  <p class="asmaan-toast_message">' + message + '</p>',
      '</div>',
      '<button type="button" class="asmaan-toast_close" aria-label="Dismiss">&times;</button>',
      '<div class="asmaan-toast_progress"></div>'
    ].join('');

    portal.appendChild(toast);

    // Progress countdown bar animation
    var progress = toast.querySelector('.asmaan-toast_progress');
    if (progress) {
      progress.style.transition = 'width ' + duration + 'ms linear';
      setTimeout(function() {
        progress.style.width = '0%';
      }, 50);
    }

    function dismiss() {
      toast.classList.add('is-leaving');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }

    var closeBtn = toast.querySelector('.asmaan-toast_close');
    if (closeBtn) {
      closeBtn.addEventListener('click', dismiss);
    }

    var timer = setTimeout(dismiss, duration);
    toast.addEventListener('mouseenter', function() {
      clearTimeout(timer);
    });
    toast.addEventListener('mouseleave', function() {
      timer = setTimeout(dismiss, 2500);
    });
  };

  // ==========================================================================
  // 2. AMBASSADOR PAGE CONTROLLER
  // ==========================================================================
  function initAmbassador() {
    var formSection = document.getElementById('ambassador-form-section');
    var form = document.getElementById('ambassador-form');
    var triggerButtons = document.querySelectorAll('[data-ambassador-open-form]');
    var celebrationCard = document.getElementById('ambassador-success');
    var submitBtn = document.getElementById('ambassador-submit-btn');

    if (form) {
      form.setAttribute('novalidate', 'true');
    }

    // Check URL parameters for native Shopify contact form posted state
    if (window.location.search.indexOf('contact_posted=true') !== -1 || window.location.hash === '#contact_form') {
      if (formSection) formSection.classList.add('is-open');
      if (celebrationCard) {
        celebrationCard.classList.add('is-active');
        var formGrid = form ? form.querySelector('.ambassador_form-grid') : null;
        if (formGrid) formGrid.style.display = 'none';
        var formHeader = formSection ? formSection.querySelector('.ambassador_form-header') : null;
        if (formHeader) formHeader.style.display = 'none';
      }
      setTimeout(function() {
        window.asmaanNotify({
          type: 'success',
          title: (window.ASMAAN_AMBASSADOR_LABELS || {}).confirmedTitle,
          message: (window.ASMAAN_AMBASSADOR_LABELS || {}).confirmedMessage
        });
      }, 600);
    }

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
        var firstInput = formSection.querySelector('input:not([type="hidden"]), select, textarea');
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

    // Clear validation styling when user starts typing
    if (form) {
      form.querySelectorAll('input, select, textarea').forEach(function(el) {
        el.addEventListener('input', function() {
          el.classList.remove('is-invalid');
        });
        el.addEventListener('change', function() {
          el.classList.remove('is-invalid');
        });
      });
    }

    // 3. Form Submission Handling & Google Sheets Integration
    if (form) {
      form.addEventListener('submit', function(e) {
        var sheetUrl = form.getAttribute('data-google-sheet-url') || '';
        
        // Validate required fields
        var nameInput = form.querySelector('[name="contact[name]"]') || form.querySelector('[name="name"]');
        var emailInput = form.querySelector('[name="contact[email]"]') || form.querySelector('[name="email"]');
        var instaInput = form.querySelector('[name="contact[instagram]"]') || form.querySelector('[name="instagram"]');
        var audienceSelect = form.querySelector('[name="contact[audience_size]"]') || form.querySelector('[name="audience_size"]');
        var nicheSelect = form.querySelector('[name="contact[niche]"]') || form.querySelector('[name="niche"]');

        var invalidFields = [];
        if (nameInput && !nameInput.value.trim()) invalidFields.push(nameInput);
        if (emailInput && (!emailInput.value.trim() || emailInput.value.indexOf('@') === -1)) invalidFields.push(emailInput);
        if (instaInput && !instaInput.value.trim()) invalidFields.push(instaInput);
        if (audienceSelect && !audienceSelect.value.trim()) invalidFields.push(audienceSelect);
        if (nicheSelect && !nicheSelect.value.trim()) invalidFields.push(nicheSelect);

        if (invalidFields.length > 0) {
          e.preventDefault();
          invalidFields.forEach(function(field) {
            field.classList.add('is-invalid');
          });
          invalidFields[0].focus();
          invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

          window.asmaanNotify({
            type: 'error',
            title: (window.ASMAAN_AMBASSADOR_LABELS || {}).requiredTitle,
            message: (window.ASMAAN_AMBASSADOR_LABELS || {}).requiredMessage
          });
          return;
        }

        // Handle async dispatch to Google Sheet & background Shopify sync
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

          var urlParams = new URLSearchParams();
          for (var key in payload) {
            urlParams.append(key, payload[key]);
          }

          // Trigger Shopify contact form background submission
          try {
            fetch(form.action || window.location.href, {
              method: 'POST',
              body: new FormData(form)
            }).catch(function() {});
          } catch(err) {}

          var isCompleted = false;
          function triggerSuccess() {
            if (isCompleted) return;
            isCompleted = true;

            if (submitBtn) {
              submitBtn.classList.remove('is-loading');
            }

            // Hide form grid and header, reveal celebration card
            var formGrid = form.querySelector('.ambassador_form-grid');
            if (formGrid) formGrid.style.display = 'none';

            var formHeader = formSection ? formSection.querySelector('.ambassador_form-header') : null;
            if (formHeader) formHeader.style.display = 'none';

            if (celebrationCard) {
              celebrationCard.classList.add('is-active');
              celebrationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Fire Global Toast Confirmation
            window.asmaanNotify({
              type: 'success',
              title: (window.ASMAAN_AMBASSADOR_LABELS || {}).confirmedTitle,
              message: (window.ASMAAN_AMBASSADOR_LABELS || {}).confirmedMessage
            });
          }

          // Fallback timer so UI never hangs waiting on external network response
          var fallbackTimer = setTimeout(function() {
            triggerSuccess();
          }, 1400);

          // Post to Google Apps Script Web App
          fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlParams.toString()
          }).then(function() {
            clearTimeout(fallbackTimer);
            triggerSuccess();
          }).catch(function(err) {
            console.warn('Google Sheet submission warning:', err);
            clearTimeout(fallbackTimer);
            triggerSuccess();
          });
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbassador);
  } else {
    initAmbassador();
  }
})();
