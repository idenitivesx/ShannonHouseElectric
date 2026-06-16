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
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
  });

  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.site-nav a');

  if (navToggle && navLinksContainer) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('open');
      navLinksContainer.classList.toggle('open');
      document.body.classList.toggle('nav-open', navLinksContainer.classList.contains('open'));
    });

    document.addEventListener('click', (e) => {
      if (!navLinksContainer.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  const contactForm = document.getElementById('contact-form');
  const successOverlay = document.getElementById('form-success-message');
  const successUserName = document.getElementById('success-user-name');
  const successServiceName = document.getElementById('success-service-name');
  const successResetBtn = document.getElementById('success-reset-btn');
  const submitBtn = document.getElementById('form-submit-button');

  if (contactForm && successOverlay) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      const inputs = contactForm.querySelectorAll('.form-control[required]');

      inputs.forEach((input) => {
        input.classList.remove('invalid');

        if (
          !input.value.trim()
          || (input.type === 'email' && !validateEmail(input.value))
          || (input.type === 'tel' && !validatePhone(input.value))
        ) {
          input.classList.add('invalid');
          isValid = false;
        }
      });

      if (!isValid) {
        contactForm.classList.add('shake-form');
        setTimeout(() => contactForm.classList.remove('shake-form'), 500);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      const userName = document.getElementById('form-name').value.trim();
      const userPhone = document.getElementById('form-phone').value.trim();
      const userEmail = document.getElementById('form-email').value.trim();
      const selectedService = document.getElementById('form-service').value;
      const userMessage = document.getElementById('form-message').value.trim();

      const serviceLabels = {
        residential: 'Panel / circuits / lighting',
        emergency: 'Emergency repair',
        other: 'Other inquiry',
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
          submitBtn.textContent = 'Send to Duane';
        }
      }
    });
  }

  if (successResetBtn && successOverlay && contactForm) {
    successResetBtn.addEventListener('click', () => {
      successOverlay.classList.remove('active');
      contactForm.reset();
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^[\d\s()+-]{7,18}$/.test(phone);
  }
});
