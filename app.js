/**
 * ROCKY MOUNTAINEER LANDING PAGE
 * Clean, Professional Interactive Script
 * - FAQ Accordion Expansion
 * - Smooth Anchor Link Navigation
 * - Header Scroll Elevation
 * - Mobile Haptic Feedback for Call Links
 */

document.addEventListener('DOMContentLoaded', () => {
  initFAQAccordion();
  initHeaderScroll();
  initSmoothScroll();
  initCallFeedback();
});

/* --------------------------------------------------------------------------
   1. FAQ ACCORDION LOGIC
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const toggleIcon = item.querySelector('.faq-toggle-icon');

    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items for a clean single-open accordion experience
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question');
            const otherIcon = otherItem.querySelector('.faq-toggle-icon');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            if (otherIcon) otherIcon.textContent = '+';
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
          if (toggleIcon) toggleIcon.textContent = '+';
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
          if (toggleIcon) toggleIcon.textContent = '−';
        }
      });
    }
  });
}

/* --------------------------------------------------------------------------
   2. HEADER SCROLL ELEVATION EFFECT
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   3. SMOOTH ANCHOR LINK NAVIGATION
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 110;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. CLICK-TO-CALL USER EXPERIENCE ENHANCEMENT
   -------------------------------------------------------------------------- */
function initCallFeedback() {
  const callButtons = document.querySelectorAll('a[href^="tel:"]');

  callButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Haptic vibration feedback on compatible mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 30, 80]);
      }
    });
  });
}
