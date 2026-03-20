

document.addEventListener('DOMContentLoaded', () => {


  const cursorDot  = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');

  if (cursorDot && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top  = my + 'px';
    });

    (function animRing() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();

 
    const hoverTargets = document.querySelectorAll(
      'a, button, .tool-tab, .feat-card, .pillar-card, .testi-card, ' +
      '.price-card, .pricing-card-full, .faq-question, .suggest-chip, ' +
      '.integration-card, .nav-hamburger'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
  }


  const navbar    = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');


  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }


  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) link.classList.add('active');
  });


  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {

          const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = (idx * 0.09) + 's';
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObs.observe(el));
  }


  function animateCount(el, target, suffix, decimals = 0) {
    let start = 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 4);
      const value = start + (target - start) * ease;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const nums = statsSection.querySelectorAll('.stat-num');
        nums.forEach(n => {
          const raw = n.textContent.trim();
          if      (raw.includes('K+'))  animateCount(n, 50,  'K+', 0);
          else if (raw.includes('M'))   animateCount(n, 3.2, 'M',  1);
          else if (raw.includes('x'))   animateCount(n, 10,  'x',  0);
        });
        statObs.unobserve(statsSection);
      }
    }, { threshold: 0.4 });
    statObs.observe(statsSection);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  const toolTabs = document.querySelectorAll('.tool-tab');
  if (toolTabs.length) {
    toolTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        toolTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('panel-' + i);
        if (panel) panel.classList.add('active');
      });
    });
  }


  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });


  const billingSwitch = document.getElementById('billingToggle');
  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      billingSwitch.classList.toggle('yearly');
      const isYearly = billingSwitch.classList.contains('yearly');
      document.querySelectorAll('.price-monthly').forEach(el => {
        el.classList.toggle('hidden', isYearly);
      });
      document.querySelectorAll('.price-yearly').forEach(el => {
        el.classList.toggle('hidden', !isYearly);
      });
      document.querySelectorAll('.billing-label').forEach(el => {
        el.classList.toggle('active', el.dataset.billing === (isYearly ? 'yearly' : 'monthly'));
      });
    });
  }

  console.log('%c⚡ Nexus AI loaded', 'color:#6c63ff;font-weight:bold;font-size:14px');
});