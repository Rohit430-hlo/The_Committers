/* ============================================================
   ANIMATIONS.JS — GSAP Next-Level Animations
   Uses: GSAP 3 + ScrollTrigger + SplitText + CustomEase
   ============================================================ */

/* ── Wait for GSAP to load then initialize ───────────────── */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, CustomEase);

  /* ── Signal that GSAP is loaded — CSS .reveal override activates ─ */
  document.body.classList.add('gsap-loaded');

  /* ── CUSTOM EASES ─────────────────────────────────────── */
  CustomEase.create("nexusPop",   "M0,0 C0.08,0.82 0.165,1.5 0.25,1.5 0.35,1.5 0.52,0.9 1,1");
  CustomEase.create("nexusSlide", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("nexusHeavy", "M0,0 C0.4,0 0.1,1 1,1");

  /* ── GLOBAL DEFAULTS ──────────────────────────────────── */
  gsap.defaults({ ease: "nexusSlide", duration: 0.9 });

  /* ── UTILITY: Split text into chars/words ────────────── */
  function splitText(el, type = 'chars') {
    if (!el) return [];
    const text = el.textContent;
    el.innerHTML = '';
    const parts = type === 'chars' ? [...text] : text.split(' ');
    return parts.map(p => {
      const span = document.createElement('span');
      span.textContent = type === 'chars' ? p : p + ' ';
      span.style.cssText = 'display:inline-block;overflow:hidden;';
      if (type === 'words') span.style.marginRight = '0.25em';
      const inner = document.createElement('span');
      inner.textContent = span.textContent;
      inner.style.display = 'inline-block';
      span.textContent = '';
      span.appendChild(inner);
      el.appendChild(span);
      return inner;
    });
  }

  /* ── PARTICLE BURST helper ────────────────────────────── */
  function burstParticles(origin, count = 12, color = '#6c63ff') {
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2 + window.scrollY;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      const angle = (i / count) * Math.PI * 2;
      const dist  = 60 + Math.random() * 80;
      dot.style.cssText = `
        position:absolute;width:5px;height:5px;border-radius:50%;
        background:${color};pointer-events:none;z-index:999;
        left:${cx}px;top:${cy}px;transform:translate(-50%,-50%)
      `;
      document.body.appendChild(dot);
      gsap.to(dot, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0, scale: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => dot.remove()
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     ① NAVBAR  ——  Slide-down + stagger links
  ══════════════════════════════════════════════════════ */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    gsap.from(navbar, {
      y: -80, opacity: 0, duration: 1,
      ease: 'nexusPop', delay: 0.1
    });
    gsap.from('.nav-logo', { opacity: 0, x: -30, delay: 0.35, duration: 0.7 });
    gsap.from('.nav-links li', {
      opacity: 0, y: -20, stagger: 0.07,
      delay: 0.45, duration: 0.6
    });
    gsap.from('.nav-cta .btn', {
      opacity: 0, x: 20, stagger: 0.1,
      delay: 0.6, duration: 0.6
    });
  }

  /* ══════════════════════════════════════════════════════
     ② HERO SECTION  ——  Cinematic entrance
  ══════════════════════════════════════════════════════ */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroTl = gsap.timeline({ delay: 0.6 });

    // Eyebrow badge
    heroTl.from('.hero-eyebrow', {
      opacity: 0, y: 30, scale: 0.85,
      ease: 'nexusPop', duration: 0.7
    });

    // H1 — word by word
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      // Find gradient text span and preserve it
      const words = h1.querySelectorAll('.gradient-text');
      const plainText = h1.childNodes;
      heroTl.from(h1, {
        opacity: 0, y: 60, skewY: 4,
        duration: 0.8, ease: 'nexusHeavy'
      }, '-=0.3');
    }

    heroTl
      .from('.hero-sub', {
        opacity: 0, y: 30, duration: 0.7
      }, '-=0.4')
      .from('.hero-actions .btn', {
        opacity: 0, y: 25, scale: 0.92,
        stagger: 0.12, ease: 'nexusPop', duration: 0.6
      }, '-=0.3')
      .from('.hero-stats .stat', {
        opacity: 0, y: 20, stagger: 0.1, duration: 0.6
      }, '-=0.2')
      .from('.hero-visual', {
        opacity: 0, y: 80, scale: 0.93,
        duration: 1.1, ease: 'nexusPop'
      }, '-=0.3');

    // Continuous floating
    gsap.to('.mockup-shell', {
      y: -14, duration: 3.5, yoyo: true,
      repeat: -1, ease: 'sine.inOut'
    });

    // Orb drift
    gsap.to('.orb-1', {
      x: 40, y: 30, duration: 7, yoyo: true,
      repeat: -1, ease: 'sine.inOut'
    });
    gsap.to('.orb-2', {
      x: -30, y: 20, duration: 9, yoyo: true,
      repeat: -1, ease: 'sine.inOut', delay: 2
    });
    gsap.to('.orb-3', {
      x: 20, y: -25, duration: 8, yoyo: true,
      repeat: -1, ease: 'sine.inOut', delay: 4
    });

    // Stat counter animation
    document.querySelectorAll('.stat-num').forEach(el => {
      const raw = el.textContent.trim();
      let target, suffix, decimals = 0;
      if (raw.includes('K+'))  { target = 50;  suffix = 'K+'; }
      else if (raw.includes('M')) { target = 3.2; suffix = 'M'; decimals = 1; }
      else if (raw.includes('x')) { target = 10;  suffix = 'x'; }
      else return;
      el.textContent = '0' + suffix;
      ScrollTrigger.create({
        trigger: '.hero-stats',
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function() {
              el.textContent = this.targets()[0].val.toFixed(decimals) + suffix;
            }
          });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ③ SECTION HEADERS  ——  Magnetic reveal on scroll
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.section-label').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0, x: -30, duration: 0.6
    });
  });

  document.querySelectorAll('.section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      opacity: 0, y: 50, skewY: 2, duration: 0.9, ease: 'nexusHeavy'
    });
  });

  document.querySelectorAll('.section-sub').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      opacity: 0, y: 25, duration: 0.7, delay: 0.15
    });
  });

  /* ══════════════════════════════════════════════════════
     ④ FEATURE CARDS  ——  3D flip-in with stagger
  ══════════════════════════════════════════════════════ */
  const featCards = document.querySelectorAll('.feat-card');
  if (featCards.length) {
    gsap.set(featCards, { transformPerspective: 1000 });
    gsap.from(featCards, {
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%',
        once: true
      },
      opacity: 0, y: 70, rotateX: 12, scale: 0.92,
      stagger: { each: 0.13, from: 'start' },
      duration: 0.85, ease: 'nexusPop'
    });

    // Hover tilt 3D
    featCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width  - 0.5;
        const cy = (e.clientY - rect.top)  / rect.height - 0.5;
        gsap.to(card, {
          rotateY: cx * 12, rotateX: -cy * 8,
          duration: 0.4, ease: 'power2.out',
          transformPerspective: 800
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑤ STEPS  ——  Staggered bounce + connector draw
  ══════════════════════════════════════════════════════ */
  const steps = document.querySelectorAll('.step');
  if (steps.length) {
    gsap.from(steps, {
      scrollTrigger: {
        trigger: '.steps-wrap',
        start: 'top 78%',
        once: true
      },
      opacity: 0, y: 60, scale: 0.88,
      stagger: 0.2, duration: 0.8, ease: 'nexusPop'
    });

    const stepsLine = document.querySelector('.steps-line');
    if (stepsLine) {
      gsap.from(stepsLine, {
        scrollTrigger: {
          trigger: '.steps-wrap',
          start: 'top 80%',
          once: true
        },
        scaleX: 0, transformOrigin: 'left center',
        duration: 1.2, ease: 'power3.out', delay: 0.4
      });
    }

    // Step number count-up
    document.querySelectorAll('.step-num').forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.from(el, {
            scale: 0, rotate: -180, opacity: 0,
            duration: 0.7, ease: 'nexusPop', delay: i * 0.2
          });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑥ TOOL TABS  ——  Slide reveal + panel morph
  ══════════════════════════════════════════════════════ */
  const toolTabs = document.querySelectorAll('.tool-tab');
  if (toolTabs.length) {
    gsap.from('.tool-tabs', {
      scrollTrigger: { trigger: '.tools-layout', start: 'top 80%', once: true },
      opacity: 0, x: -60, duration: 0.9, ease: 'nexusHeavy'
    });
    gsap.from('.tool-screen', {
      scrollTrigger: { trigger: '.tools-layout', start: 'top 80%', once: true },
      opacity: 0, x: 60, scale: 0.94, duration: 0.9, ease: 'nexusHeavy', delay: 0.15
    });

    toolTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const screen = document.querySelector('.tool-screen');
        if (screen) {
          gsap.fromTo(screen,
            { opacity: 0, x: 20, scale: 0.97 },
            { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'nexusPop' }
          );
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑦ TESTIMONIAL CARDS  ——  Cascade + shimmer
  ══════════════════════════════════════════════════════ */
  const testiCards = document.querySelectorAll('.testi-card');
  if (testiCards.length) {
    gsap.from(testiCards, {
      scrollTrigger: {
        trigger: '.testi-grid',
        start: 'top 80%',
        once: true
      },
      opacity: 0, y: 60, rotate: -2,
      stagger: { each: 0.15, from: 'start' },
      duration: 0.85, ease: 'nexusPop'
    });

    // Hover shimmer
    testiCards.forEach(card => {
      const shimmer = document.createElement('div');
      shimmer.style.cssText = `
        position:absolute;inset:0;border-radius:inherit;
        background:linear-gradient(135deg,transparent 40%,rgba(108,99,255,0.08) 50%,transparent 60%);
        pointer-events:none;opacity:0;
      `;
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.appendChild(shimmer);
      card.addEventListener('mouseenter', () => {
        gsap.fromTo(shimmer, { opacity: 0, x: '-100%' }, { opacity: 1, x: '100%', duration: 0.6, ease: 'power2.inOut' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑧ PRICING CARDS  ——  Zoom-rise with glow pulse
  ══════════════════════════════════════════════════════ */
  const priceCards = document.querySelectorAll('.price-card, .pricing-card-full');
  if (priceCards.length) {
    gsap.from(priceCards, {
      scrollTrigger: {
        trigger: priceCards[0].closest('.pricing-grid, .pricing-full-grid') || priceCards[0],
        start: 'top 78%',
        once: true
      },
      opacity: 0, y: 80, scale: 0.9,
      stagger: { each: 0.15, from: 'center' },
      duration: 0.9, ease: 'nexusPop'
    });

    // Popular card glow pulse
    const popular = document.querySelector('.price-card.popular, .pricing-card-full.popular');
    if (popular) {
      gsap.to(popular, {
        boxShadow: '0 0 60px rgba(108,99,255,0.4), 0 0 0 1px rgba(108,99,255,0.3)',
        duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut'
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     ⑨ CTA BANNER  ——  Magnetic scale + gradient sweep
  ══════════════════════════════════════════════════════ */
  const ctaBanner = document.querySelector('.cta-banner');
  if (ctaBanner) {
    gsap.from(ctaBanner, {
      scrollTrigger: {
        trigger: ctaBanner,
        start: 'top 80%',
        once: true
      },
      opacity: 0, y: 60, scale: 0.94,
      duration: 1, ease: 'nexusPop'
    });
    gsap.from('.cta-banner h2', {
      scrollTrigger: { trigger: ctaBanner, start: 'top 78%', once: true },
      opacity: 0, y: 40, delay: 0.2, duration: 0.8
    });
    gsap.from('.cta-actions .btn', {
      scrollTrigger: { trigger: ctaBanner, start: 'top 78%', once: true },
      opacity: 0, y: 25, scale: 0.9,
      stagger: 0.12, delay: 0.45, duration: 0.6, ease: 'nexusPop'
    });

    // Animated gradient border
    gsap.to(ctaBanner, {
      backgroundPosition: '200% center',
      duration: 6, repeat: -1, ease: 'none'
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑩ FOOTER  ——  Elegant stagger reveal
  ══════════════════════════════════════════════════════ */
  const footer = document.querySelector('.footer, footer');
  if (footer) {
    gsap.from('.footer-grid > div', {
      scrollTrigger: { trigger: footer, start: 'top 88%', once: true },
      opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: 'nexusSlide'
    });
    gsap.from('.footer-bottom', {
      scrollTrigger: { trigger: footer, start: 'top 85%', once: true },
      opacity: 0, y: 20, delay: 0.5, duration: 0.6
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑪ SCROLL PARALLAX  ——  Layered depth
  ══════════════════════════════════════════════════════ */
  gsap.to('.orb-1', {
    scrollTrigger: { scrub: 1.5 },
    y: -200
  });
  gsap.to('.orb-2', {
    scrollTrigger: { scrub: 2 },
    y: -150, x: 40
  });
  gsap.to('.orb-3', {
    scrollTrigger: { scrub: 1 },
    y: -100
  });
  gsap.to('.grid-bg', {
    scrollTrigger: { scrub: 1 },
    y: 60, opacity: 0.3
  });

  /* ══════════════════════════════════════════════════════
     ⑫ MOCK UI  ——  Sequential stagger build
  ══════════════════════════════════════════════════════ */
  const mockup = document.querySelector('.hero-visual');
  if (mockup) {
    gsap.from('.mock-nav-item', {
      opacity: 0, x: -20,
      stagger: 0.08, delay: 2.2, duration: 0.5
    });
    gsap.from('.mock-card', {
      opacity: 0, y: 20, scale: 0.95,
      stagger: 0.15, delay: 2.5, duration: 0.6, ease: 'nexusPop'
    });
    gsap.from('.write-bar', {
      scaleX: 0, transformOrigin: 'left',
      stagger: 0.12, delay: 2.8, duration: 0.6
    });
    gsap.from('.progress-fill', {
      width: 0, delay: 3.0, duration: 1.2, ease: 'power2.out'
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑬ PILLAR CARDS (features page)
  ══════════════════════════════════════════════════════ */
  const pillars = document.querySelectorAll('.pillar-card');
  if (pillars.length) {
    gsap.set(pillars, { transformPerspective: 1000 });
    gsap.from(pillars, {
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 78%', once: true },
      opacity: 0, y: 70, rotateX: 10, scale: 0.93,
      stagger: 0.18, duration: 0.9, ease: 'nexusPop'
    });

    pillars.forEach(card => {
      const icon = card.querySelector('.pillar-icon');
      card.addEventListener('mouseenter', () => {
        gsap.to(icon, { rotate: 10, scale: 1.15, duration: 0.4, ease: 'nexusPop' });
        gsap.to(card, {
          boxShadow: '0 20px 60px rgba(108,99,255,0.25)',
          duration: 0.4
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, { rotate: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1,0.6)' });
        gsap.to(card, { boxShadow: '0 4px 24px rgba(0,0,0,0.4)', duration: 0.4 });
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑭ DEEP FEATURES (features page)
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.deep-feature').forEach((section, i) => {
    const content = section.querySelector('.deep-content');
    const visual  = section.querySelector('.deep-visual');
    const isReverse = section.classList.contains('reverse');

    if (content) {
      gsap.from(content, {
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        opacity: 0, x: isReverse ? 60 : -60, duration: 1, ease: 'nexusHeavy'
      });
    }
    if (visual) {
      gsap.from(visual, {
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        opacity: 0, x: isReverse ? -60 : 60, scale: 0.94,
        duration: 1, ease: 'nexusHeavy', delay: 0.15
      });
    }
    // Stagger bullets
    const bullets = section.querySelectorAll('.deep-bullet');
    if (bullets.length) {
      gsap.from(bullets, {
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        opacity: 0, x: -20, stagger: 0.1, duration: 0.5, delay: 0.4
      });
    }
  });

  /* ══════════════════════════════════════════════════════
     ⑮ COMPARE TABLE (features page)
  ══════════════════════════════════════════════════════ */
  const compareWrap = document.querySelector('.compare-wrap');
  if (compareWrap) {
    gsap.from(compareWrap, {
      scrollTrigger: { trigger: compareWrap, start: 'top 80%', once: true },
      opacity: 0, y: 50, scale: 0.97, duration: 0.9, ease: 'nexusPop'
    });
    gsap.from('.compare-table tr', {
      scrollTrigger: { trigger: compareWrap, start: 'top 78%', once: true },
      opacity: 0, x: -20, stagger: 0.07, duration: 0.5, delay: 0.3
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑯ INTEGRATION CARDS  ——  Cascade orbit-in
  ══════════════════════════════════════════════════════ */
  const integrations = document.querySelectorAll('.integration-card');
  if (integrations.length) {
    gsap.from(integrations, {
      scrollTrigger: { trigger: '.integrations-grid', start: 'top 80%', once: true },
      opacity: 0, scale: 0.5, rotate: -15,
      stagger: { each: 0.06, from: 'random' },
      duration: 0.6, ease: 'nexusPop'
    });

    integrations.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.integration-icon'), {
          rotate: 10, scale: 1.2, duration: 0.35, ease: 'nexusPop'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.integration-icon'), {
          rotate: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)'
        });
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑰ FAQ ACCORDION (pricing page)  ——  Smooth expand
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.faq-item').forEach(item => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 90%', once: true },
      opacity: 0, y: 20, duration: 0.5
    });
  });

  /* ══════════════════════════════════════════════════════
     ⑱ ENTERPRISE BANNER (pricing page)
  ══════════════════════════════════════════════════════ */
  const entBanner = document.querySelector('.enterprise-banner');
  if (entBanner) {
    gsap.from(entBanner, {
      scrollTrigger: { trigger: entBanner, start: 'top 80%', once: true },
      opacity: 0, y: 60, scale: 0.95, duration: 1, ease: 'nexusPop'
    });
    gsap.from('.enterprise-title, .enterprise-desc', {
      scrollTrigger: { trigger: entBanner, start: 'top 78%', once: true },
      opacity: 0, x: -40, stagger: 0.15, duration: 0.8, delay: 0.2
    });
    gsap.from('.enterprise-btns .btn', {
      scrollTrigger: { trigger: entBanner, start: 'top 78%', once: true },
      opacity: 0, x: 40, stagger: 0.12, duration: 0.7, delay: 0.35
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑲ PAGE HERO (inner pages)  ——  Cinematic title
  ══════════════════════════════════════════════════════ */
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    const tl = gsap.timeline({ delay: 0.5 });
    tl.from('.page-hero .section-label', { opacity: 0, y: 30, duration: 0.6 })
      .from('.page-hero h1', {
        opacity: 0, y: 60, skewY: 3, duration: 0.9, ease: 'nexusHeavy'
      }, '-=0.3')
      .from('.page-hero p', { opacity: 0, y: 25, duration: 0.7 }, '-=0.4');
  }

  /* ══════════════════════════════════════════════════════
     ⑳ MAGNETIC BUTTONS  ——  Cursor attraction
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn-primary, .btn.btn-primary').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width  / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      gsap.to(btn, {
        x: dx * 0.25, y: dy * 0.25,
        duration: 0.3, ease: 'power2.out'
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    });
    btn.addEventListener('click', e => {
      burstParticles(btn, 10, '#6c63ff');
    });
  });

  /* ══════════════════════════════════════════════════════
     ㉑ SOCIAL BUTTONS  ——  Hover bounce
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { y: -4, scale: 1.15, duration: 0.3, ease: 'nexusPop' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { y: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
    });
  });

  /* ══════════════════════════════════════════════════════
     ㉒ SCROLL PROGRESS BAR
  ══════════════════════════════════════════════════════ */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position:fixed;top:70px;left:0;right:0;height:2px;z-index:600;
    background:linear-gradient(90deg,#6c63ff,#00e5ff,#ff6b9d);
    transform-origin:left center;transform:scaleX(0);
    box-shadow:0 0 8px rgba(108,99,255,0.6);
  `;
  document.body.appendChild(progressBar);
  gsap.to(progressBar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { scrub: 0.3, start: 'top top', end: 'bottom bottom' }
  });

  /* ══════════════════════════════════════════════════════
     ㉓ BADGE / CHIP  ——  Pop-in on scroll
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.badge, .mock-chip').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      opacity: 0, scale: 0.6, duration: 0.4, ease: 'nexusPop'
    });
  });

  /* ══════════════════════════════════════════════════════
     ㉔ DIVIDER  ——  Expand from center
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.divider').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      scaleX: 0, transformOrigin: 'center', duration: 1, ease: 'power3.out'
    });
  });

  /* ══════════════════════════════════════════════════════
     ㉕ FOOTER LOGO  ——  Glow pulse
  ══════════════════════════════════════════════════════ */
  gsap.to('.nav-logo-icon', {
    boxShadow: '0 0 20px rgba(108,99,255,0.7), 0 0 40px rgba(0,229,255,0.3)',
    duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut'
  });

  /* ── Refresh ScrollTrigger after everything loads ──── */
  ScrollTrigger.refresh();

  console.log('%c⚡ GSAP Animations initialized', 'color:#00e5ff;font-weight:bold');
});