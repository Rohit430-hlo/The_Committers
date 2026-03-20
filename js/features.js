/* ============================================================
   FEATURES.JS — Competition-Winning Frontend Features
   ============================================================ */

/* ══════════════════════════════════════════════════════════
   1. CINEMATIC PAGE LOADER
   ══════════════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const bar = loader.querySelector('.loader-bar');
  const pct = loader.querySelector('.loader-pct');
  const logo = loader.querySelector('.loader-logo');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    if (bar) bar.style.width = progress + '%';
    if (pct) pct.textContent = Math.floor(progress) + '%';
  }, 90);
  window.addEventListener('load', () => {
    progress = 100;
    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';
    setTimeout(() => {
      if (logo) { logo.style.transform = 'scale(1.15)'; logo.style.opacity = '0'; }
      loader.style.transform = 'translateY(-100%)';
      loader.style.transition = 'transform 0.8s cubic-bezier(0.76,0,0.24,1)';
      setTimeout(() => { loader.style.display = 'none'; }, 800);
    }, 300);
  });
})();

/* ══════════════════════════════════════════════════════════
   2. THEME SWITCHER (Dark ↔ Light)
   ══════════════════════════════════════════════════════════ */
(function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  const root = document.documentElement;
  const stored = localStorage.getItem('nexus-theme') || 'dark';
  applyTheme(stored);
  toggleBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('nexus-theme', next);
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    const rect = toggleBtn.getBoundingClientRect();
    ripple.style.cssText = `
      position:fixed;left:${rect.left + rect.width/2}px;top:${rect.top + rect.height/2}px;
      width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:9998;
      background:${next === 'light' ? '#fff' : '#05050a'};
      transform:translate(-50%,-50%) scale(0);
      transition:transform 0.7s cubic-bezier(0.22,1,0.36,1),opacity 0.7s;
    `;
    document.body.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%,-50%) scale(300)';
      ripple.style.opacity = '0';
    });
    setTimeout(() => ripple.remove(), 700);
  });
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const icon = toggleBtn.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
})();

/* ══════════════════════════════════════════════════════════
   3. TOAST NOTIFICATION SYSTEM
   ══════════════════════════════════════════════════════════ */
window.NexusToast = (function () {
  let container;
  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
        z-index:9000;display:flex;flex-direction:column;gap:10px;
        align-items:center;pointer-events:none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }
  function show(message, type = 'info', duration = 3200) {
    const icons = { info: 'ph-info', success: 'ph-check-circle', error: 'ph-warning-circle', warning: 'ph-warning' };
    const colors = {
      info: { bg: 'rgba(108,99,255,0.18)', border: 'rgba(108,99,255,0.4)', color: '#c4c0ff' },
      success: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)', color: '#6ee7b7' },
      error: { bg: 'rgba(255,107,157,0.15)', border: 'rgba(255,107,157,0.4)', color: '#fda4af' },
      warning: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', color: '#fde68a' },
    };
    const c = colors[type] || colors.info;
    const toast = document.createElement('div');
    toast.style.cssText = `
      display:flex;align-items:center;gap:10px;pointer-events:all;
      padding:13px 20px;border-radius:14px;font-family:'DM Sans',sans-serif;
      font-size:0.88rem;font-weight:500;
      background:${c.bg};border:1px solid ${c.border};color:${c.color};
      backdrop-filter:blur(16px);box-shadow:0 8px 32px rgba(0,0,0,0.4);
      transform:translateY(20px) scale(0.92);opacity:0;
      transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s;
      white-space:nowrap;
    `;
    toast.innerHTML = `<i class="ph ${icons[type] || icons.info}" style="font-size:1.1rem"></i>${message}`;
    getContainer().appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateY(0) scale(1)'; toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.transform = 'translateY(-10px) scale(0.95)'; toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  return { show };
})();

/* ══════════════════════════════════════════════════════════
   4. COMMAND PALETTE (Cmd+K / Ctrl+K)
   ══════════════════════════════════════════════════════════ */
(function initCommandPalette() {
  const palette = document.getElementById('cmd-palette');
  if (!palette) return;
  const input = palette.querySelector('.cmd-input');
  const results = palette.querySelector('.cmd-results');
  const overlay = palette.querySelector('.cmd-overlay');
  const COMMANDS = [
    { label: 'Home', icon: 'ph-house', action: () => location.href = 'index.html' },
    { label: 'Features', icon: 'ph-star-four', action: () => location.href = 'features.html' },
    { label: 'Pricing', icon: 'ph-currency-dollar', action: () => location.href = 'pricing.html' },
    { label: 'Start for Free', icon: 'ph-rocket-launch', action: () => NexusToast.show('Redirecting to signup…', 'success') },
    { label: 'Toggle Theme', icon: 'ph-sun', action: () => document.getElementById('theme-toggle')?.click() },
    { label: 'Open AI Chat', icon: 'ph-chat-dots', action: () => document.getElementById('chatbotToggle')?.click() },
    { label: 'View on GitHub', icon: 'ph-github-logo', action: () => NexusToast.show('GitHub link coming soon!', 'info') },
    { label: 'Contact Sales', icon: 'ph-phone', action: () => NexusToast.show('Sales team will reach out!', 'success') },
    { label: 'Read the Docs', icon: 'ph-book-open', action: () => NexusToast.show('Docs coming soon!', 'info') },
    { label: 'Scroll to Top', icon: 'ph-arrow-up', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];
  let open = false, activeIdx = -1, filtered = [...COMMANDS];
  function openPalette() {
    open = true; palette.classList.add('open');
    input.value = ''; activeIdx = -1;
    renderResults(COMMANDS);
    requestAnimationFrame(() => input.focus());
  }
  function closePalette() { open = false; palette.classList.remove('open'); }
  function renderResults(list) {
    filtered = list;
    results.innerHTML = list.length ? list.map((cmd, i) => `
      <div class="cmd-item ${i === activeIdx ? 'active' : ''}" data-idx="${i}">
        <i class="ph ${cmd.icon}"></i><span>${cmd.label}</span><span class="cmd-hint">↵</span>
      </div>`).join('') : '<div class="cmd-empty"><i class="ph ph-magnifying-glass"></i> No results found</div>';
    results.querySelectorAll('.cmd-item').forEach(item => {
      item.addEventListener('click', () => { const idx = +item.dataset.idx; filtered[idx]?.action(); closePalette(); });
    });
  }
  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    activeIdx = -1;
    renderResults(q ? COMMANDS.filter(c => c.label.toLowerCase().includes(q)) : COMMANDS);
  });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? closePalette() : openPalette(); return; }
    if (!open) return;
    if (e.key === 'Escape') { closePalette(); return; }
    if (e.key === 'ArrowDown') { activeIdx = Math.min(activeIdx + 1, filtered.length - 1); renderResults(filtered); }
    if (e.key === 'ArrowUp') { activeIdx = Math.max(activeIdx - 1, 0); renderResults(filtered); }
    if (e.key === 'Enter' && activeIdx >= 0) { filtered[activeIdx]?.action(); closePalette(); }
  });
  overlay?.addEventListener('click', closePalette);
  document.getElementById('cmd-trigger')?.addEventListener('click', openPalette);
})();

/* ══════════════════════════════════════════════════════════
   5. TYPEWRITER EFFECT — Hero headline cycling
   ══════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const target = document.getElementById('typewriter-text');
  if (!target) return;
  const phrases = ['Work Smarter.', 'Write Faster.', 'Plan Better.', 'Think Clearer.', 'Ship Quicker.'];
  let phraseIdx = 0, charIdx = 0, deleting = false;
  function tick() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      target.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 70 + Math.random() * 40);
    } else {
      charIdx--;
      target.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 38);
    }
  }
  setTimeout(tick, 1000);
})();

/* ══════════════════════════════════════════════════════════
   6. LIVE AI WRITING DEMO (Groq Integration)
   ══════════════════════════════════════════════════════════ */
(function initLiveDemo() {
  const demoArea = document.getElementById('demo-output');
  const demoBtn = document.getElementById('demo-run');
  const demoWpm = document.getElementById('demo-wpm');
  const demoWords = document.getElementById('demo-words');
  const demoType = document.getElementById('demo-type');
  const demoTone = document.getElementById('demo-tone');
  const demoPrompt = document.getElementById('demo-prompt');
  const demoApiKey = document.getElementById('demo-api-key');
  const demoToolbar = document.getElementById('demo-toolbar');
  
  if (!demoArea || !demoBtn || !demoPrompt || !demoApiKey) return;
  
  // Load saved API key
  const savedKey = localStorage.getItem('nexus_groq_api_key');
  if (savedKey) demoApiKey.value = savedKey;

  let streaming = false;
  let abortController = null;

  const SYSTEM_PROMPTS = {
    writer: "You are an expert AI Writing Engine. Write high-quality, engaging content based on the user's prompt. Do not include introductory text like 'Here is the content', just output the final content directly. Format your output using clean markdown.",
    planner: "You are an expert Task Planning Engine. Break down the user's project into actionable steps, include timelines and priority levels. Use clean markdown formatting with lists.",
    summarizer: "You are a Smart Summarizer. Extract the key insights, action items, and main points from the provided text into a concise, structured markdown summary."
  };

  async function runGroqGeneration(targetPrompt, systemRoleOverride = null) {
    if (streaming) {
      if (abortController) abortController.abort();
      resetBtn();
      return;
    }

    const apiKey = demoApiKey.value.trim();
    if (!apiKey) {
      if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Please enter a Groq API Key.', 'warning');
      demoApiKey.focus();
      return;
    }

    // Save key
    localStorage.setItem('nexus_groq_api_key', apiKey);

    // Hide toolbar during generation
    if (demoToolbar) {
      demoToolbar.style.opacity = '0';
      demoToolbar.style.pointerEvents = 'none';
    }

    demoArea.textContent = '';
    demoBtn.innerHTML = '<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> Processing...';
    streaming = true;
    abortController = new AbortController();

    let tokenCount = 0;
    const startTime = Date.now();
    
    // Determine tone and system prompt
    let baseSystemPrompt = systemRoleOverride || SYSTEM_PROMPTS[demoType.value] || SYSTEM_PROMPTS.writer;
    if (demoTone && demoTone.value && !systemRoleOverride) {
      baseSystemPrompt += ` Adopt a ${demoTone.value} tone and brand voice.`;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: baseSystemPrompt },
            { role: 'user', content: targetPrompt }
          ],
          temperature: 0.7,
          stream: true
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status} Error`);
      }

      demoBtn.innerHTML = '<i class="ph ph-stop-circle"></i> Stop Generation';

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.includes('[DONE]')) break;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              const text = data.choices[0]?.delta?.content || '';
              if (text) {
                demoArea.textContent += text;
                demoArea.scrollTop = demoArea.scrollHeight;
                tokenCount++;
                if (demoWords) demoWords.textContent = tokenCount;
                if (demoWpm && tokenCount > 0) {
                  const elapsedSec = (Date.now() - startTime) / 1000;
                  demoWpm.textContent = Math.round(tokenCount / Math.max(elapsedSec, 0.1));
                }
              }
            } catch (e) {
              // Ignore parse errors on incomplete chunks
            }
          }
        }
      }
      
      if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Generation complete!', 'success');
      
      // Show Toolbar for rewrite actions after successful generation
      if (demoToolbar && demoArea.textContent.trim().length > 0) {
        demoToolbar.style.opacity = '1';
        demoToolbar.style.pointerEvents = 'auto';
      }
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        demoArea.textContent = `Error: ${error.message}`;
        if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Error generating content.', 'error');
      } else {
        if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Generation stopped.', 'info');
      }
    } finally {
      resetBtn();
    }
  }

  function resetBtn() {
    streaming = false;
    demoBtn.innerHTML = '<i class="ph ph-sparkle"></i> Generate';
  }

  // Event Listeners
  demoBtn.addEventListener('click', () => {
    const promptText = demoPrompt.value.trim();
    if (!promptText && !streaming) {
      if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Please enter a prompt.', 'warning');
      demoPrompt.focus();
      return;
    }
    runGroqGeneration(promptText);
  });

  demoType.addEventListener('change', () => {
    // Hide all specific toolbars initially
    const toolbars = ['toolbar-writer', 'toolbar-planner', 'toolbar-summarizer'];
    toolbars.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    
    // Show the active one
    const activeToolbar = document.getElementById(`toolbar-${demoType.value}`);
    if (activeToolbar) activeToolbar.style.display = 'flex';

    // Show/hide Tone selector (only for writer)
    if (demoTone) {
      if (demoType.value === 'writer') {
        demoTone.style.display = 'block';
      } else {
        demoTone.style.display = 'none';
      }
    }
  });

  // Init initial state on load
  demoType.dispatchEvent(new Event('change'));

  // Writer Actions
  document.getElementById('btn-shorter')?.addEventListener('click', () => {
    runGroqGeneration(`Rewrite the following text to be much shorter, punchier, and more concise:\n\n${demoArea.textContent}`);
  });
  document.getElementById('btn-expand')?.addEventListener('click', () => {
    runGroqGeneration(`Expand on the following text by adding more detail, examples, and depth. Make it comprehensive:\n\n${demoArea.textContent}`);
  });
  document.getElementById('btn-seo')?.addEventListener('click', () => {
    runGroqGeneration(`Rewrite the following text to be highly optimized for SEO. Add relevant keywords naturally, use a compelling meta-description style intro, and ensure readability with headings:\n\n${demoArea.textContent}`, "You are an expert SEO Content Strategist.");
  });
  document.getElementById('btn-quality')?.addEventListener('click', () => {
    runGroqGeneration(`Act as an expert copywriter and editor. Review the following text and provide a Quality Check report. Give it a Readability Score (out of 100), an SEO Score (out of 100), and 3 bullet points on how to improve it. Output ONLY the review scorecard:\n\n${demoArea.textContent}`, "You are a Content Quality Assurance AI.");
  });

  // Planner Actions
  document.getElementById('btn-dependencies')?.addEventListener('click', () => {
    runGroqGeneration(`Analyze the following project plan and map out all task dependencies. Identify blockers, critical paths, and prerequisites. Output a clear Dependency Map:\n\n${demoArea.textContent}`, "You are an expert Project Manager.");
  });
  document.getElementById('btn-kanban')?.addEventListener('click', () => {
    runGroqGeneration(`Convert the following project plan into a visual Markdown Kanban Board (Sprint Board format). Use columns for To Do, In Progress, and Done. Assign realistic priority labels and estimated times to each item:\n\n${demoArea.textContent}`, "You are an Agile Scrum Master.");
  });
  document.getElementById('btn-sync-jira')?.addEventListener('click', () => {
    if (typeof window.NexusToast !== 'undefined') {
      window.NexusToast.show('Successfully synced 12 tasks to Jira!', 'success');
      demoBtn.innerHTML = '<i class="ph ph-check-circle"></i> Synced to Jira';
      setTimeout(resetBtn, 3000);
    }
  });

  // Summarizer Actions
  document.getElementById('btn-action-items')?.addEventListener('click', () => {
    runGroqGeneration(`Extract all actionable steps, to-dos, and commitments from the following text. Output a clean checklist of Action Items:\n\n${demoArea.textContent}`, "You are a sharp Executive Assistant.");
  });
  document.getElementById('btn-sentiment')?.addEventListener('click', () => {
    runGroqGeneration(`Analyze the sentiment, tone, and underlying mood of the following text. Give a clear Sentiment Score (e.g., highly positive, neutral, negative) and explain why in 2 concise bullet points:\n\n${demoArea.textContent}`, "You are a linguistic sentiment analyzer.");
  });
  document.getElementById('btn-upload')?.addEventListener('click', () => {
    if (typeof window.NexusToast !== 'undefined') {
      window.NexusToast.show('Simulated PDF upload complete. Text extracted!', 'success');
      demoPrompt.value = "Imagine a 10-page final report discussing Q3 financials, a massive 15% increase in marketing spend over budget, and the delay of entirely new product launches slated for November. Team morale seems cautious but stable.";
      demoPrompt.focus();
    }
  });

  // Global Actions
  document.getElementById('btn-export')?.addEventListener('click', () => {
    if (!demoArea.textContent.trim()) return;
    const blob = new Blob([demoArea.textContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexus-AI-${demoType.value}-export.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof window.NexusToast !== 'undefined') window.NexusToast.show('Export downloaded!', 'success');
  });

})();

/* ══════════════════════════════════════════════════════════
   7. BEFORE/AFTER COMPARISON SLIDER
   ══════════════════════════════════════════════════════════ */
(function initBeforeAfter() {
  const sliders = document.querySelectorAll('.ba-slider');
  sliders.forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    const after = slider.querySelector('.ba-after');
    if (!handle || !after) return;
    let dragging = false;
    function move(x) {
      const rect = slider.getBoundingClientRect();
      const pct = Math.min(Math.max((x - rect.left) / rect.width, 0.05), 0.95);
      // after is visible on the right side of the handle
      after.style.clipPath = `polygon(${pct * 100}% 0, 100% 0, 100% 100%, ${pct * 100}% 100%)`;
      handle.style.left = (pct * 100) + '%';
    }
    handle.addEventListener('mousedown', () => dragging = true);
    handle.addEventListener('touchstart', () => dragging = true, { passive: true });
    window.addEventListener('mouseup', () => dragging = false);
    window.addEventListener('touchend', () => dragging = false);
    window.addEventListener('mousemove', e => { if (dragging) move(e.clientX); });
    window.addEventListener('touchmove', e => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
    // Init state
    move(slider.getBoundingClientRect().left + slider.offsetWidth * 0.5);
  });
})();

/* ══════════════════════════════════════════════════════════
   8. KEYBOARD SHORTCUTS DISPLAY
   ══════════════════════════════════════════════════════════ */
(function initKeyboardHints() {
  document.addEventListener('keydown', e => {
    if (e.key === '?' && !e.target.matches('input,textarea')) {
      const modal = document.getElementById('shortcuts-modal');
      if (modal) modal.classList.toggle('open');
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open, #shortcuts-modal.open').forEach(m => m.classList.remove('open'));
    }
    if (e.key === 't' && !e.target.matches('input,textarea')) {
      document.getElementById('theme-toggle')?.click();
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   9. SCROLL SPY — Active nav highlighting
   ══════════════════════════════════════════════════════════ */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id); });
      }
    });
  }, { threshold: 0.4, rootMargin: '-60px 0px -60px 0px' });
  sections.forEach(s => obs.observe(s));
})();

/* ══════════════════════════════════════════════════════════
   10. LENIS SMOOTH SCROLL
   ══════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({ 
    duration: 1.2, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
})();

/* ══════════════════════════════════════════════════════════
   11. CONFETTI ON CTA CLICK
   ══════════════════════════════════════════════════════════ */
window.fireConfetti = function(origin) {
  if (typeof confetti === 'undefined') return;
  const rect = origin.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  confetti({ particleCount: 90, spread: 80, origin: { x, y }, colors: ['#6c63ff','#00e5ff','#ff6b9d','#fbbf24','#34d399'], startVelocity: 35, gravity: 0.8 });
  setTimeout(() => confetti({ particleCount: 40, spread: 120, origin: { x, y }, colors: ['#6c63ff','#00e5ff','#ff6b9d'] }), 200);
};
document.querySelectorAll('.btn-primary, .btn.btn-primary').forEach(btn => {
  btn.addEventListener('click', () => fireConfetti(btn));
});

/* ══════════════════════════════════════════════════════════
   12. READING PROGRESS RING
   ══════════════════════════════════════════════════════════ */
(function initProgressRing() {
  const ring = document.getElementById('reading-ring');
  if (!ring) return;
  const circle = ring.querySelector('.ring-fill');
  if (!circle) return;
  const r = circle.r.baseVal.value;
  const circ = 2 * Math.PI * r;
  circle.style.strokeDasharray = circ;
  circle.style.strokeDashoffset = circ;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrolled / maxScroll;
    circle.style.strokeDashoffset = circ - pct * circ;
  });
})();

/* ══════════════════════════════════════════════════════════
   13. BACK TO TOP BUTTON
   ══════════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => { btn.classList.toggle('visible', window.scrollY > 400); });
  btn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();

/* ══════════════════════════════════════════════════════════
   14. COOKIE CONSENT BANNER
   ══════════════════════════════════════════════════════════ */
(function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('nexus-cookies')) { banner.remove(); return; }
  setTimeout(() => banner.classList.add('visible'), 1500);
  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('nexus-cookies', 'accepted');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
    if (typeof NexusToast !== 'undefined') NexusToast.show('Preferences saved!', 'success');
  });
  document.getElementById('cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem('nexus-cookies', 'declined');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  });
})();

/* ══════════════════════════════════════════════════════════
   15. MARQUEE / TICKER — Logo strip
   ══════════════════════════════════════════════════════════ */
(function initMarquee() {
  const tracks = document.querySelectorAll('.marquee-track');
  tracks.forEach(track => {
    const clone = track.cloneNode(true);
    track.parentElement.appendChild(clone);
  });
})();

/* ══════════════════════════════════════════════════════════
   16. ANIMATED GRADIENT BUTTON TEXT CYCLE
   ══════════════════════════════════════════════════════════ */
(function initGradientCycle() {
  const el = document.getElementById('gradient-cycle');
  if (!el) return;
  const words = ['Write', 'Plan', 'Summarize', 'Automate', 'Create'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
    setTimeout(() => { el.textContent = words[i]; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 220);
  }, 2200);
})();

/* ══════════════════════════════════════════════════════════
   17. VIDEO / DEMO MODAL
   ══════════════════════════════════════════════════════════ */
(function initVideoModal() {
  const modal = document.getElementById('video-modal');
  const overlay = document.getElementById('video-overlay');
  const closeBtns = document.querySelectorAll('[data-close-modal]');
  document.querySelectorAll('[data-open-modal="video"]').forEach(btn => {
    btn.addEventListener('click', () => { if (modal) modal.classList.add('open'); });
  });
  [overlay, ...closeBtns].forEach(el => { el?.addEventListener('click', () => modal?.classList.remove('open')); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal?.classList.remove('open'); });
})();

/* ══════════════════════════════════════════════════════════
   18. INPUT FOCUS EFFECTS
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('focus', () => {
    el.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.2), 0 0 20px rgba(108,99,255,0.1)';
    el.style.borderColor = 'var(--accent)';
  });
  el.addEventListener('blur', () => { el.style.boxShadow = ''; el.style.borderColor = ''; });
});

/* ══════════════════════════════════════════════════════════
   19. HOVER PREVIEW TOOLTIPS
   ══════════════════════════════════════════════════════════ */
(function initTooltips() {
  const tooltip = document.createElement('div');
  tooltip.id = 'nexus-tooltip';
  tooltip.style.cssText = `
    position:fixed;z-index:8000;pointer-events:none;
    background:rgba(13,13,24,0.95);border:1px solid rgba(108,99,255,0.3);
    color:#f0eff8;font-family:'DM Sans',sans-serif;font-size:0.78rem;
    padding:7px 12px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.4);
    opacity:0;transition:opacity 0.2s;white-space:nowrap;backdrop-filter:blur(12px);
  `;
  document.body.appendChild(tooltip);
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => { tooltip.textContent = el.getAttribute('data-tooltip'); tooltip.style.opacity = '1'; });
    el.addEventListener('mousemove', e => { tooltip.style.left = (e.clientX + 14) + 'px'; tooltip.style.top = (e.clientY - 32) + 'px'; });
    el.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  });
})();

/* ══════════════════════════════════════════════════════════
   20. ANNOUNCEMENT BANNER
   ══════════════════════════════════════════════════════════ */
(function initAnnouncementBanner() {
  const banner = document.getElementById('announcement-bar');
  if (!banner || sessionStorage.getItem('nexus-announce-closed')) { banner?.remove(); return; }
  document.getElementById('announce-close')?.addEventListener('click', () => {
    banner.style.maxHeight = '0'; banner.style.padding = '0'; banner.style.opacity = '0';
    sessionStorage.setItem('nexus-announce-closed', '1');
    setTimeout(() => banner.remove(), 400);
  });
})();

/* ══════════════════════════════════════════════════════════
   21. AUTO-SELECT TOOL FROM URL PARAMS
   ══════════════════════════════════════════════════════════ */
(function handleUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const tool = urlParams.get('tool');
  if (tool) {
    const demoType = document.getElementById('demo-type');
    if (demoType) {
      demoType.value = tool;
      demoType.dispatchEvent(new Event('change'));
    }
    if (window.location.hash === '#demo') {
      setTimeout(() => {
        const demoEl = document.getElementById('demo');
        if (demoEl) {
          const yOffset = -80; // account for navbar
          const y = demoEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 600);
    }
  }
})();

console.log('%c⚡ Nexus UI Features loaded', 'color:#ff6b9d;font-weight:bold');
