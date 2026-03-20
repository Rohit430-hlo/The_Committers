

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const GROQ_API_URL   = 'https://api.groq.com/openai/v1/chat/completions';
  const STORAGE_KEY    = 'nexus_groq_key';
  const MODEL_KEY      = 'nexus_groq_model';

  const MODELS = [
    { value: 'llama-3.3-70b-versatile',  label: 'Llama 3.3 70B' },
    { value: 'llama-3.1-8b-instant',     label: 'Llama 3.1 8B (Fast)' },
    { value: 'mixtral-8x7b-32768',       label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it',             label: 'Gemma 2 9B' },
  ];

  const SYSTEM_PROMPT = `You are Nexus, a helpful AI productivity assistant for the Nexus AI platform. 
You specialize in helping users with:
- AI-powered writing (blog posts, emails, reports, ad copy)
- Task planning and project management
- Smart document summarization
- Productivity tips and workflow optimization

Be concise, friendly, and actionable. Use bullet points for lists. 
If asked about pricing, mention Free ($0), Pro ($19/mo), and Enterprise plans.
Never reveal your underlying model. You are Nexus AI.`;

  const SUGGESTIONS = [
    'Help me write a blog post',
    'Plan my week',
    'Summarize this text',
    'Improve my productivity',
  ];

  /* ── STATE ─────── */
  let apiKey     = localStorage.getItem(STORAGE_KEY) || '';
  let selectedModel = localStorage.getItem(MODEL_KEY) || MODELS[0].value;
  let messages   = [];        // chat history for context
  let isLoading  = false;

  /* ── DOM REFERENCES ────────── */
  let toggleBtn, chatWindow, closeBtn;
  let setupScreen, setupInput, setupEye, setupBtn;
  let chatBody, chatSuggestions, inputBar, textarea, sendBtn;
  let modelBar, modelSelect, resetKeyBtn;

  /* ── INIT ─── */
  function init() {
    injectHTML();
    cacheRefs();
    buildModelOptions();
    bindEvents();
    renderState();
  }

  /* ── INJECT HTML ──────────── */
  function injectHTML() {
    const el = document.createElement('div');
    el.innerHTML = `
    <!-- Toggle Button -->
    <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open AI Assistant">
      <i class="ph ph-chat-dots"></i>
      <span class="chatbot-badge">1</span>
    </button>

    <!-- Chat Window -->
    <div class="chatbot-window" id="chatbotWindow" role="dialog" aria-label="Nexus AI Chat">

      <!-- Header -->
      <div class="chatbot-header">
        <div class="chatbot-avatar">
          <i class="ph ph-lightning"></i>
        </div>
        <div class="chatbot-header-info">
          <div class="chatbot-name">Nexus AI</div>
          <div class="chatbot-status">
            <span class="chatbot-status-dot"></span>
            Online · Powered by Groq
          </div>
        </div>
        <button class="chatbot-close" id="chatbotClose" aria-label="Close">
          <i class="ph ph-x"></i>
        </button>
      </div>

      <!-- Setup Screen (API key entry) -->
      <div class="chatbot-setup" id="chatbotSetup">
        <div class="setup-icon">
          <i class="ph ph-key"></i>
        </div>
        <div class="setup-title">Connect your Groq API key</div>
        <div class="setup-desc">
          Enter your Groq API key to unlock the full AI assistant. 
          Get a free key at <strong style="color:var(--accent2)">console.groq.com</strong>
        </div>
        <div class="setup-input-wrap">
          <input
            class="setup-input" id="setupInput"
            type="password"
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
            autocomplete="off"
            spellcheck="false"
          />
          <span class="setup-eye" id="setupEye" title="Show/hide key">
            <i class="ph ph-eye"></i>
          </span>
        </div>
        <button class="setup-btn" id="setupSave">
          <i class="ph ph-check"></i>
          Save & Start Chatting
        </button>
        <div class="setup-note">
          <i class="ph ph-lock"></i>
          Stored locally in your browser only
        </div>
      </div>

      <!-- Messages -->
      <div class="chatbot-body" id="chatbotBody"></div>

      <!-- Quick Suggestions -->
      <div class="chatbot-suggestions" id="chatbotSuggestions"></div>

      <!-- Model Selector -->
      <div class="chatbot-model-bar" id="chatbotModelBar">
        <span class="model-label"><i class="ph ph-cpu"></i> Model:</span>
        <select class="model-select" id="modelSelect"></select>
      </div>

      <!-- Input Bar -->
      <div class="chatbot-input-bar" id="chatbotInputBar">
        <textarea
          class="chatbot-textarea" id="chatbotTextarea"
          placeholder="Ask anything about productivity…"
          rows="1"
          aria-label="Type your message"
        ></textarea>
        <button class="chatbot-send" id="chatbotSend" aria-label="Send message">
          <i class="ph ph-paper-plane-tilt"></i>
        </button>
      </div>

      <!-- Reset Key -->
      <button class="chatbot-reset-key" id="chatbotResetKey">
        <i class="ph ph-arrows-clockwise"></i>
        Change API key
      </button>

    </div>`;
    document.body.appendChild(el);
  }


  function cacheRefs() {
    toggleBtn     = document.getElementById('chatbotToggle');
    chatWindow    = document.getElementById('chatbotWindow');
    closeBtn      = document.getElementById('chatbotClose');
    setupScreen   = document.getElementById('chatbotSetup');
    setupInput    = document.getElementById('setupInput');
    setupEye      = document.getElementById('setupEye');
    setupBtn      = document.getElementById('setupSave');
    chatBody      = document.getElementById('chatbotBody');
    chatSuggestions = document.getElementById('chatbotSuggestions');
    inputBar      = document.getElementById('chatbotInputBar');
    textarea      = document.getElementById('chatbotTextarea');
    sendBtn       = document.getElementById('chatbotSend');
    modelBar      = document.getElementById('chatbotModelBar');
    modelSelect   = document.getElementById('modelSelect');
    resetKeyBtn   = document.getElementById('chatbotResetKey');
  }


  function buildModelOptions() {
    MODELS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.value;
      opt.textContent = m.label;
      if (m.value === selectedModel) opt.selected = true;
      modelSelect.appendChild(opt);
    });
  }


  function bindEvents() {
    // Toggle open/close
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    // Close on outside click
    document.addEventListener('click', e => {
      if (chatWindow.classList.contains('open') &&
          !chatWindow.contains(e.target) &&
          e.target !== toggleBtn) {
        closeChat();
      }
    });

    // Setup
    setupBtn.addEventListener('click', saveApiKey);
    setupInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveApiKey(); });

    // Eye toggle (show/hide key)
    setupEye.addEventListener('click', () => {
      const isHidden = setupInput.type === 'password';
      setupInput.type = isHidden ? 'text' : 'password';
      setupEye.querySelector('i').className = isHidden ? 'ph ph-eye-slash' : 'ph ph-eye';
    });

    // Send message
    sendBtn.addEventListener('click', handleSend);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });


    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });


    modelSelect.addEventListener('change', () => {
      selectedModel = modelSelect.value;
      localStorage.setItem(MODEL_KEY, selectedModel);
    });


    resetKeyBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      apiKey = '';
      messages = [];
      chatBody.innerHTML = '';
      renderState();
    });


    [toggleBtn, closeBtn, setupBtn, sendBtn, resetKeyBtn, setupEye, modelSelect].forEach(el => {
      if (el) {
        el.style.cursor = 'none';
        el.addEventListener('mouseenter', () => {
          const ring = document.querySelector('.cursor-ring');
          if (ring) ring.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
          const ring = document.querySelector('.cursor-ring');
          if (ring) ring.classList.remove('hovered');
        });
      }
    });
  }

  /* ── TOGGLE / OPEN / CLOSE ── */
  function toggleChat() {
    if (chatWindow.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    chatWindow.classList.add('open');
    toggleBtn.classList.add('open');
    // Hide badge
    const badge = toggleBtn.querySelector('.chatbot-badge');
    if (badge) badge.style.display = 'none';
    // Change icon
    toggleBtn.querySelector('i').className = 'ph ph-x';
    // Focus
    setTimeout(() => {
      if (apiKey && textarea) textarea.focus();
      else if (setupInput) setupInput.focus();
    }, 300);
  }

  function closeChat() {
    chatWindow.classList.remove('open');
    toggleBtn.classList.remove('open');
    toggleBtn.querySelector('i').className = 'ph ph-chat-dots';
  }

  /* ── RENDER STATE ───── */
  function renderState() {
    const hasKey = !!apiKey;

    // Setup screen
    toggleClass(setupScreen, 'hidden', hasKey);

    // Chat UI
    toggleClass(chatBody, 'hidden', !hasKey);
    toggleClass(chatSuggestions, 'hidden', !hasKey || messages.length > 0);
    toggleClass(inputBar, 'hidden', !hasKey);
    toggleClass(modelBar, 'hidden', !hasKey);
    toggleClass(resetKeyBtn, 'hidden', !hasKey);

    if (hasKey && messages.length === 0) {
      renderWelcome();
      renderSuggestions();
    }
  }

  function toggleClass(el, cls, condition) {
    if (!el) return;
    el.classList.toggle(cls, condition);
  }

  /* ── WELCOME MESSAGE ── */
  function renderWelcome() {
    appendMessage('ai', `Hello! I'm **Nexus**, your AI productivity assistant. 🚀\n\nI can help you with:\n• Writing content & copy\n• Planning tasks & projects\n• Summarizing documents\n• Productivity strategies\n\nWhat can I help you with today?`);
  }

  function renderSuggestions() {
    chatSuggestions.innerHTML = '';
    SUGGESTIONS.forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'suggest-chip';
      chip.style.cursor = 'none';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        chatSuggestions.classList.add('hidden');
        textarea.value = text;
        handleSend();
      });
      chatSuggestions.appendChild(chip);
    });
  }

  async function saveApiKey() {
    const key = setupInput.value.trim();
    if (!key) {
      shakeElement(setupInput);
      return;
    }
    if (!key.startsWith('gsk_')) {
      showSetupError('Key should start with gsk_');
      return;
    }

    setupBtn.innerHTML = '<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> Validating…';
    setupBtn.disabled = true;

    const valid = await validateGroqKey(key);

    if (valid) {
      apiKey = key;
      localStorage.setItem(STORAGE_KEY, key);
      setupBtn.innerHTML = '<i class="ph ph-check"></i> Saved!';
      setTimeout(() => {
        setupBtn.disabled = false;
        setupBtn.innerHTML = '<i class="ph ph-check"></i> Save & Start Chatting';
        renderState();
      }, 600);
    } else {
      setupBtn.disabled = false;
      setupBtn.innerHTML = '<i class="ph ph-check"></i> Save & Start Chatting';
      showSetupError('Invalid API key. Check console.groq.com');
    }
  }

  async function validateGroqKey(key) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODELS[1].value,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  function showSetupError(msg) {
    let errEl = setupScreen.querySelector('.chatbot-error');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'chatbot-error';
      setupScreen.insertBefore(errEl, setupBtn.nextSibling);
    }
    errEl.innerHTML = `<i class="ph ph-warning-circle"></i> ${msg}`;
    setTimeout(() => errEl.remove(), 4000);
  }

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    el.style.borderColor = 'var(--accent3)';
    setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 800);
  }


  async function handleSend() {
    const text = textarea.value.trim();
    if (!text || isLoading) return;

    textarea.value = '';
    textarea.style.height = 'auto';
    chatSuggestions.classList.add('hidden');


    appendMessage('user', text);
    messages.push({ role: 'user', content: text });

   
    const typingId = showTyping();
    isLoading = true;
    sendBtn.disabled = true;

    try {
      const reply = await callGroq();
      removeTyping(typingId);

      if (reply) {
        messages.push({ role: 'assistant', content: reply });
        appendMessage('ai', reply);
      } else {
        appendMessage('ai', 'Sorry, I got an empty response. Please try again.');
      }
    } catch (err) {
      removeTyping(typingId);
      appendMessage('ai', `**Error:** ${err.message || 'Request failed. Check your API key and connection.'}`);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

  async function callGroq() {
    const payload = {
      model: selectedModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    };

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errMsg = errorData?.error?.message || `HTTP ${res.status}`;

     
      if (res.status === 401) throw new Error('Invalid API key. Please reset and re-enter your key.');
      if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
      throw new Error(errMsg);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

 
  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `msg ${role}`;

    const avatarIcon = role === 'ai'
      ? '<i class="ph ph-lightning"></i>'
      : '<i class="ph ph-user"></i>';

    msg.innerHTML = `
      <div class="msg-avatar">${avatarIcon}</div>
      <div class="msg-bubble">${formatText(text)}</div>
    `;

    chatBody.appendChild(msg);
    scrollToBottom();
    return msg;
  }


  function showTyping() {
    const id = 'typing-' + Date.now();
    const msg = document.createElement('div');
    msg.className = 'msg ai';
    msg.id = id;
    msg.innerHTML = `
      <div class="msg-avatar"><i class="ph ph-lightning"></i></div>
      <div class="msg-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>`;
    chatBody.appendChild(msg);
    scrollToBottom();
    return id;
  }

  function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  
  function formatText(text) {
    return text
  
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      .replace(/`([^`]+)`/g, '<code style="background:rgba(108,99,255,0.15);padding:1px 5px;border-radius:4px;font-size:0.82em">$1</code>')

      .replace(/^• (.+)$/gm, '<li style="margin-left:8px;list-style:disc inside">$1</li>')

      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:8px;list-style:decimal inside">$1</li>')

      .replace(/\n/g, '<br>');
  }

 
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }


  if (!document.getElementById('chatbot-shake-style')) {
    const style = document.createElement('style');
    style.id = 'chatbot-shake-style';
    style.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%,60%  { transform: translateX(-6px); }
        40%,80%  { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();