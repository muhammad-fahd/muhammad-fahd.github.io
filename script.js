(() => {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navAnchors.forEach((anchor) => {
          anchor.classList.toggle('active', anchor.getAttribute('href') === `#${id}`);
        });
      });
    }, { threshold: 0.35 });

    sections.forEach((section) => activeObserver.observe(section));
  }

  const copyEmailBtn = document.getElementById('copyEmail');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'malikfahdnadeem@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        const original = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Email Copied';
        setTimeout(() => { copyEmailBtn.textContent = original; }, 1600);
      } catch {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  const visitCountEl = document.getElementById('visitCount');
  if (visitCountEl) {
    const VISIT_COUNTER_ENDPOINT = 'https://visit-counter.profile-visits.workers.dev';
    const mode = sessionStorage.getItem('visitCounted') ? 'read' : 'write';

    fetch(`${VISIT_COUNTER_ENDPOINT}?mode=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        visitCountEl.textContent = Number(data.count).toLocaleString();
        sessionStorage.setItem('visitCounted', '1');
      })
      .catch(() => {
        visitCountEl.closest('.visit-counter')?.remove();
      });
  }

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canHover && !prefersReducedMotion) {
    const root = document.documentElement;
    let rafId = null;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight * 0.2;

    const applyGlowPosition = () => {
      root.style.setProperty('--spot-x', `${lastX}px`);
      root.style.setProperty('--spot-y', `${lastY}px`);
      rafId = null;
    };

    window.addEventListener('mousemove', (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(applyGlowPosition);
      }
    });

    document.querySelectorAll(
      '.hero-card, .skill-card, .work-card, .recognition-card, .recommendation-card, .contact-card, .education-grid article'
    ).forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--y', `${event.clientY - rect.top}px`);
      });
    });
  }
})();
