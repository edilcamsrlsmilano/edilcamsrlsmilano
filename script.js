/* =============================================
   EDIL CAM SRLS – script.js
   ============================================= */

(function () {
  'use strict';

  /* ---- NAVBAR: scroll behaviour & hamburger ---- */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  /* ---- SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar.offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  /* ---- SCROLL-IN ANIMATIONS ---- */
  const animateTargets = document.querySelectorAll(
    '.chi-grid, .stat-card, .gallery-item, .lavora-inner, .contatti-grid, .section-header'
  );

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  function addEnterStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-hidden {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.55s ease, transform 0.55s ease;
      }
      .animate-hidden.animate-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .stat-card.animate-hidden { transition-delay: calc(var(--card-index, 0) * 0.08s); }
      .gallery-item.animate-hidden { transition-delay: calc(var(--item-index, 0) * 0.07s); }
    `;
    document.head.appendChild(style);
  }

  if ('IntersectionObserver' in window) {
    addEnterStyles();

    // Assign stagger indices
    document.querySelectorAll('.stat-card').forEach(function (el, i) {
      el.style.setProperty('--card-index', i);
    });
    document.querySelectorAll('.gallery-item').forEach(function (el, i) {
      el.style.setProperty('--item-index', i);
    });

    animateTargets.forEach(function (el) {
      el.classList.add('animate-hidden');
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animateTargets.forEach(function (el) { observer.observe(el); });
  }

  /* ---- CONTACT FORM ---- */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  /* Simulated back-end validation */
  function backendValidate(data) {
    const errors = {};

    // Email: must contain @ and at least 6 chars before and 2 after the dot
    const emailClean = data.email.trim();
    if (emailClean.length < 6) {
      errors.email = 'Email troppo corta.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailClean)) {
      errors.email = 'Formato email non valido.';
    }

    // Phone: if provided, must be 8–15 digits (spaces/+/- allowed, stripped for count)
    const phoneRaw = (data.telefono || '').trim();
    if (phoneRaw) {
      const digits = phoneRaw.replace(/[\s\-\+\(\)]/g, '');
      if (digits.length < 8 || digits.length > 15) {
        errors.telefono = 'Il numero deve contenere tra 8 e 15 cifre.';
      }
    }

    return errors; // empty = OK
  }

  function showFieldError(field, message) {
    field.style.borderColor = '#C0392B';
    let hint = field.parentNode.querySelector('.field-error');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'field-error';
      hint.style.cssText = 'display:block;font-size:12px;color:#C0392B;margin-top:4px;';
      field.parentNode.appendChild(hint);
    }
    hint.textContent = message;
  }

  function clearFieldError(field) {
    field.style.borderColor = '';
    const hint = field.parentNode.querySelector('.field-error');
    if (hint) hint.remove();
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // --- Front-end: required fields ---
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        clearFieldError(field);
        if (!field.value.trim()) {
          showFieldError(field, 'Campo obbligatorio.');
          valid = false;
        }
      });

      if (!valid) return;

      // --- Simulated back-end validation ---
      const payload = {
        nome:      form.querySelector('#nome').value,
        email:     form.querySelector('#email').value,
        telefono:  form.querySelector('#telefono').value,
        messaggio: form.querySelector('#messaggio').value
      };

      const backendErrors = backendValidate(payload);

      if (Object.keys(backendErrors).length > 0) {
        Object.entries(backendErrors).forEach(function ([fieldId, message]) {
          const field = form.querySelector('#' + fieldId);
          if (field) showFieldError(field, message);
        });
        return;
      }

      // --- Simulate network request ---
      const submitBtn = form.querySelector('.btn-submit');
      submitBtn.textContent = 'Invio in corso...';
      submitBtn.disabled = true;

      setTimeout(function () {
        form.style.transition = 'opacity 0.3s ease';
        form.style.opacity = '0';
        setTimeout(function () {
          form.style.visibility = 'hidden';
          form.style.height = '0';
          form.style.overflow = 'hidden';
          form.style.margin = '0';
          formSuccess.classList.add('visible');
        }, 300);
      }, 900);
    });

    // Remove error highlight on input
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        clearFieldError(this);
      });
    });
  }

  /* ---- GALLERY ITEM: keyboard accessibility ---- */
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Placeholder: open lightbox or navigate
        const label = item.getAttribute('data-label');
        console.log('Gallery item selected:', label);
      }
    });
  });

})();
