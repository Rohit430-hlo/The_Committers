/* ============================================================
   MAIN.JS — Shared utilities across all pages
   Cursor, Navbar, Scroll Reveal, Stat Counter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CUSTOM CURSOR ──────────────────────────────────────── */
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

    // Hover state
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

  /* ── NAVBAR ─────────────────────────────────────────────── */
  const navbar    = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  // Scroll shadow
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Mobile menu toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // Active link highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) link.classList.add('active');
  });

  /* ── SCROLL REVEAL ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings
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

  /* ── STAT COUNTER ────────────────────────────────────────── */
  function animateCount(el, target, suffix, decimals = 0) {
    let start = 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
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
          // Stars keep as-is
        });
        statObs.unobserve(statsSection);
      }
    }, { threshold: 0.4 });
    statObs.observe(statsSection);
  }

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── HERO TOOL TABS (index page only) ───────────────────── */
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

  /* ── FAQ ACCORDION (pricing page only) ──────────────────── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── BILLING TOGGLE (pricing page only) ─────────────────── */
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

  /* ── PREMIUM GSAP PAGE TRANSITIONS ────────────────────────── */
  if (typeof gsap !== 'undefined') {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#0a0a0a',
      zIndex: 999999,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    
    // Animated glowing logo
    overlay.innerHTML = `
      <div style="animation: pulse 1.5s infinite alternate; filter: drop-shadow(0 0 16px rgba(108,99,255,0.4));">
        <div class="nav-logo" style="cursor: default; font-size: 2.5rem;">
          <div class="nav-logo-icon" style="width: 56px; height: 56px; font-size: 1.8rem; border-radius: 14px;">
            <i class="ph ph-lightning-slash"></i>
          </div>
          Nexus<span style="color: var(--accent2)">AI</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Reveal page on load (curtain slides up)
    gsap.set(overlay, { yPercent: 0 });
    gsap.to(overlay, { 
      yPercent: -100, 
      duration: 0.8, 
      ease: "power4.inOut",
      delay: 0.15
    });

    // Subtly animate main elements in
    gsap.from(".hero, section, footer", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out",
      delay: 0.3,
      clearProps: "all"
    });

    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        const target = link.getAttribute('target');
        
        if (
          href &&
          !href.startsWith('#') &&
          !href.startsWith('http') &&
          !href.startsWith('mailto') &&
          target !== '_blank'
        ) {
          if (href !== currentPath) {
            e.preventDefault();
            
            // Curtain drops down
            gsap.set(overlay, { yPercent: 100 });
            gsap.to(overlay, {
              yPercent: 0,
              duration: 0.7,
              ease: "power4.inOut",
              onComplete: () => {
                window.location.href = href;
              }
            });
            
            // Push current page elements slightly down and fade
            gsap.to(".hero, section, footer", {
              y: 40,
              opacity: 0,
              duration: 0.6,
              ease: "power3.in"
            });
          } else {
            e.preventDefault(); // Don't reload exact same page
          }
        }
      });
    });

    window.addEventListener('pageshow', e => {
      if (e.persisted) {
        gsap.to(overlay, { scaleY: 0, duration: 0.4, ease: "power2.out" });
        gsap.set(".hero, section, footer", { clearProps: "all" });
      }
    });
  }

  console.log('%c⚡ Nexus AI loaded', 'color:#6c63ff;font-weight:bold;font-size:14px');
});