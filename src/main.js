import './index.css';

async function getPortalApiConfig() {
  const fallback = {
    base: 'https://idenworks.com',
    clientSlug: 'shannonhouse-electric',
    siteSlug: 'main',
  };

  try {
    const response = await fetch('/content/published.json');
    if (!response.ok) return fallback;
    const data = await response.json();
    return data.portalApi || fallback;
  } catch {
    return fallback;
  }
}

async function submitPortalLead(payload) {
  const config = await getPortalApiConfig();
  const base = String(config.base || 'https://idenworks.com').replace(/\/$/, '');
  const clientSlug = config.clientSlug || 'shannonhouse-electric';
  const siteSlug = config.siteSlug || 'main';

  const response = await fetch(
    `${base}/api/public/sites/${clientSlug}/${siteSlug}/leads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || 'Unable to send your request. Please call us instead.';
    throw new Error(message);
  }

  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Footer Copyright Year
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 2. Header Scroll Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Scroll Progress Indicator
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const percentage = (window.scrollY / totalHeight) * 100;
      if (scrollProgress) {
        scrollProgress.style.width = `${percentage}%`;
      }
    }
  });

  // 4. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('open');
      navLinksContainer.classList.toggle('open');
      document.body.classList.toggle('nav-open', navLinksContainer.classList.contains('open'));
    });

    // Close menu when clicking outside of navigation links
    document.addEventListener('click', (e) => {
      if (!navLinksContainer.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
    });

    // Close mobile nav drawer when clicking on links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // 5. Floating SOS Button Visibility
  const floatingSos = document.getElementById('floating-sos');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      if (floatingSos) floatingSos.classList.add('visible');
    } else {
      if (floatingSos) floatingSos.classList.remove('visible');
    }
  });

  // 6. Interactive Service Cards Action (redirects & pre-fills request form)
  const serviceCards = document.querySelectorAll('.bento-card:not(.estimator-card)');
  const serviceSelect = document.getElementById('form-service');
  const contactNameInput = document.getElementById('form-name');

  serviceCards.forEach(card => {
    const reqLink = card.querySelector('.service-link');
    const serviceVal = card.getAttribute('data-service-value');

    const handleRedirect = (e) => {
      e.preventDefault();
      
      // Auto-select the corresponding option in the form dropdown
      if (serviceSelect && serviceVal) {
        serviceSelect.value = serviceVal;
      }
      
      // Scroll smoothly to form section
      const targetSection = document.getElementById('contact');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus name input after a short delay for smooth scroll transition
        setTimeout(() => {
          if (contactNameInput) {
            contactNameInput.focus();
          }
        }, 800);
      }
    };

    if (reqLink) {
      reqLink.addEventListener('click', handleRedirect);
    }
    card.addEventListener('click', (e) => {
      if (e.target !== reqLink && !reqLink.contains(e.target)) {
        handleRedirect(e);
      }
    });
  });

  // 7. Cost Estimator Calculator Widget
  const estProject = document.getElementById('est-project');
  const estQty = document.getElementById('est-qty');
  const estQtyVal = document.getElementById('est-qty-val');
  const estPriceDisplay = document.getElementById('est-price-display');
  const estApplyBtn = document.getElementById('est-apply-btn');

  const calculateEstimate = () => {
    if (!estProject || !estQty || !estPriceDisplay) return;

    const project = estProject.value;
    const qty = parseInt(estQty.value, 10);
    
    // Update quantity indicator
    if (estQtyVal) estQtyVal.textContent = qty;

    let minPrice = 0;
    let maxPrice = 0;

    switch (project) {
      case 'panel':
        minPrice = 1600 + (qty - 1) * 70;
        maxPrice = 2100 + (qty - 1) * 100;
        break;
      case 'ev':
        minPrice = 525 + (qty - 1) * 130;
        maxPrice = 700 + (qty - 1) * 175;
        break;
      case 'outlets':
        minPrice = 105 + (qty - 1) * 40;
        maxPrice = 160 + (qty - 1) * 55;
        break;
      case 'lighting':
        minPrice = 130 + (qty - 1) * 48;
        maxPrice = 195 + (qty - 1) * 75;
        break;
      case 'diagnostics':
        minPrice = 80 + (qty - 1) * 45;
        maxPrice = 130 + (qty - 1) * 70;
        break;
    }

    // Format output
    estPriceDisplay.textContent = `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
  };

  if (estProject && estQty) {
    estProject.addEventListener('change', calculateEstimate);
    estQty.addEventListener('input', calculateEstimate);
    // Initial run
    calculateEstimate();
  }

  if (estApplyBtn) {
    estApplyBtn.addEventListener('click', () => {
      const projectSelect = document.getElementById('est-project');
      const qtySlider = document.getElementById('est-qty');
      const priceVal = document.getElementById('est-price-display').textContent;
      const formServiceSelect = document.getElementById('form-service');
      const formMessageArea = document.getElementById('form-message');

      if (!projectSelect || !formServiceSelect || !formMessageArea) return;

      const projectText = projectSelect.options[projectSelect.selectedIndex].text;
      const qty = qtySlider.value;

      // Select residential service
      formServiceSelect.value = 'residential';

      // Insert calculator summary into text area
      formMessageArea.value = `Hi, I would like to request an inspection and exact quote. I used your Instant Cost Estimator and calculated the following range:\n\n- Service Type: ${projectText}\n- Quantity/Scale: ${qty}\n- Estimated Range: ${priceVal}\n\nPlease contact me to verify this project.`;

      // Smooth scroll to form section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus name input after a short delay
        setTimeout(() => {
          if (contactNameInput) contactNameInput.focus();
        }, 800);
      }
    });
  }

  // 9. FAQ Accordion Expanding panels
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isAlreadyOpen = faqItem.classList.contains('active');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const ans = item.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
      });

      // Toggle current FAQ
      if (!isAlreadyOpen) {
        faqItem.classList.add('active');
        if (answer) {
          // Set dynamic max-height based on scrollHeight for transition ease
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      }
    });
  });

  // 10. Contact Form Handler & Submission Logic
  const contactForm = document.getElementById('contact-form');
  const successOverlay = document.getElementById('form-success-message');
  const successUserName = document.getElementById('success-user-name');
  const successServiceName = document.getElementById('success-service-name');
  const successResetBtn = document.getElementById('success-reset-btn');
  const submitBtn = document.getElementById('form-submit-button');

  if (contactForm && successOverlay) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Client-side validation check
      let isValid = true;
      const inputs = contactForm.querySelectorAll('.form-control[required]');
      
      inputs.forEach(input => {
        input.style.borderColor = '';
        
        if (!input.value.trim() || 
            (input.type === 'email' && !validateEmail(input.value)) || 
            (input.type === 'tel' && !validatePhone(input.value))) {
          input.style.borderColor = '#ef4444'; // Red alert border
          isValid = false;
        }
      });

      if (!isValid) {
        // Trigger short subtle bounce to alert user
        contactForm.classList.add('shake-form');
        setTimeout(() => contactForm.classList.remove('shake-form'), 500);
        return;
      }

      // Pre-submission Animation (Loading State)
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          Sending Request... 
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        `;
      }

      const userName = document.getElementById('form-name').value.trim();
      const userPhone = document.getElementById('form-phone').value.trim();
      const userEmail = document.getElementById('form-email').value.trim();
      const selectedService = document.getElementById('form-service').value;
      const userMessage = document.getElementById('form-message').value.trim();

      const serviceLabels = {
        residential: 'Residential Service',
        emergency: 'Emergency Repair',
        other: 'Other Inquiry',
      };

      try {
        await submitPortalLead({
          name: userName,
          phone: userPhone,
          email: userEmail,
          serviceRequested: serviceLabels[selectedService] || selectedService,
          message: userMessage,
        });

        if (successUserName) successUserName.textContent = userName;
        if (successServiceName) {
          successServiceName.textContent = serviceLabels[selectedService] || selectedService;
        }

        successOverlay.classList.add('active');
        contactForm.reset();
      } catch (error) {
        window.alert(error.message || 'Unable to send your request. Please call us instead.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            Submit Request 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          `;
        }
      }
    });
  }

  // 11. Success Overlay Reset Handler
  if (successResetBtn && successOverlay && contactForm) {
    successResetBtn.addEventListener('click', () => {
      // Hide success overlay
      successOverlay.classList.remove('active');
      
      // Clear all form inputs
      contactForm.reset();
    });
  }

  // 12. Cookie Consent Banner Logic
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookiesBtn = document.getElementById('accept-cookies');
  const declineCookiesBtn = document.getElementById('decline-cookies');

  if (cookieBanner && acceptCookiesBtn && declineCookiesBtn) {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => {
        cookieBanner.classList.add('visible');
      }, 1500);
    }

    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      cookieBanner.classList.remove('visible');
    });

    declineCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      cookieBanner.classList.remove('visible');
    });
  }

  // Helper validation functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePhone(phone) {
    const re = /^[\d\s()+-]{7,18}$/;
    return re.test(phone);
  }
});

// Inline custom dynamic spinner/shake keyframes injection
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
  .shake-form {
    animation: shake 0.2s ease-in-out 2;
  }
  .spinner {
    display: inline-block;
    vertical-align: middle;
    margin-left: 6px;
  }
`;
document.head.appendChild(styleSheet);
