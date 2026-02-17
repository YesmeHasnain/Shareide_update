// SHAREIDE - AI Chat Widget (Powered by Gemini)
// Intelligent chatbot with live chat escalation

(function() {

  var API_BASE_URL = window.SHAREIDE_API_URL || 'https://api.shareide.com/api';
  var STORAGE_KEY = 'shareide_support';

  // ============================================
  // CHAT STATE
  // ============================================
  var CHAT_STATE = {
    phase: 'bot', // bot | collecting_info | live_chat
    conversationHistory: [], // {role: 'user'|'bot', text: '...'}
    awaitingInput: null, // null | collect_name | collect_email | collect_phone
    userInfo: { name: '', email: '', phone: '' },
    ticketData: null,
    lastMessageId: 0,
    detectedCategory: 'other',
    isBotThinking: false
  };

  // ============================================
  // HELPERS
  // ============================================
  function getStoredTicket() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }

  function saveTicketData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearTicketData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ============================================
  // MAIN SETUP
  // ============================================
  function setupChat() {
    var chatToggle = document.getElementById('chatToggle');
    var chatPopup = document.getElementById('chatPopup');
    var chatClose = document.getElementById('chatClose');
    var chatForm = document.getElementById('chatForm');
    var chatInput = document.getElementById('chatInput');
    var chatMessages = document.getElementById('chatMessages');
    var chatBadge = document.querySelector('.chat-badge');
    var quickButtons = document.getElementById('quickButtons');
    var newTicketBtn = document.getElementById('newTicketBtn');

    var refreshInterval = null;
    var activityInterval = null;
    var currentTicket = getStoredTicket();
    var agentBar = document.getElementById('agentBar');
    var agentAvatar = document.getElementById('agentAvatar');
    var agentNameEl = document.getElementById('agentName');
    var chatHeaderName = document.getElementById('chatHeaderName');
    var chatHeaderStatus = document.getElementById('chatHeaderStatus');
    var currentAgent = null;

    // File attachment elements
    var chatFileInput = document.getElementById('chatFileInput');
    var chatAttachBtn = document.getElementById('chatAttachBtn');
    var chatFilePreview = document.getElementById('chatFilePreview');
    var chatFileThumb = document.getElementById('chatFileThumb');
    var chatFileName = document.getElementById('chatFileName');
    var chatFileSize = document.getElementById('chatFileSize');
    var chatFileRemove = document.getElementById('chatFileRemove');
    var chatPendingFile = null;

    // ============================================
    // UI HELPERS
    // ============================================
    function scrollToBottom() {
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessage(text, type, time, senderName, attachUrl, attachName) {
      if (!chatMessages) return;
      var div = document.createElement('div');
      div.className = 'chat-message chat-message--' + type;
      var html = '';
      if (senderName && type === 'bot') {
        html += '<span class="chat-sender">' + escapeHtml(senderName) + '</span>';
      }
      if (attachUrl) {
        var ext = (attachName || attachUrl).split('.').pop().toLowerCase().split('?')[0];
        var isImage = ['jpg','jpeg','png','gif','webp'].indexOf(ext) !== -1;
        if (isImage) {
          html += '<a href="' + escapeHtml(attachUrl) + '" target="_blank" class="chat-attachment-img"><img src="' + escapeHtml(attachUrl) + '" alt="Image"></a>';
        } else {
          html += '<a href="' + escapeHtml(attachUrl) + '" target="_blank" class="chat-attachment-file"><i class="fas fa-file"></i> <span>' + escapeHtml(attachName || 'File') + '</span> <i class="fas fa-download"></i></a>';
        }
      }
      if (text) {
        html += '<p>' + escapeHtml(text) + '</p>';
      }
      if (time) html += '<span class="chat-time">' + escapeHtml(time) + '</span>';
      div.innerHTML = html;
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function addSystemMessage(text) {
      if (!chatMessages) return;
      var div = document.createElement('div');
      div.className = 'chat-message chat-message--system';
      div.innerHTML = '<p>' + escapeHtml(text) + '</p>';
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function addTransition(text) {
      if (!chatMessages) return;
      var div = document.createElement('div');
      div.className = 'chat-transition';
      div.textContent = text;
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function showTypingIndicator() {
      var existing = document.getElementById('typingIndicator');
      if (existing) existing.remove();
      var div = document.createElement('div');
      div.className = 'chat-message chat-message--bot';
      div.id = 'typingIndicator';
      div.innerHTML = '<div class="chat-typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
      chatMessages.appendChild(div);
      scrollToBottom();
    }

    function hideTypingIndicator() {
      var el = document.getElementById('typingIndicator');
      if (el) el.remove();
    }

    function showQuickReplies(options) {
      if (!quickButtons) return;
      quickButtons.innerHTML = '';
      options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.className = 'quick-btn' + (opt.variant ? ' quick-btn--' + opt.variant : '');
        btn.textContent = opt.label;
        btn.addEventListener('click', function() {
          processUserMessage(opt.value || opt.label);
        });
        quickButtons.appendChild(btn);
      });
      quickButtons.style.display = 'flex';
    }

    function hideQuickReplies() {
      if (quickButtons) {
        quickButtons.innerHTML = '';
        quickButtons.style.display = 'none';
      }
    }

    function showAgentProfile(agent) {
      if (!agent || !agent.name) return;
      if (currentAgent && currentAgent.name === agent.name) return;
      currentAgent = agent;
      if (agentBar) {
        agentBar.style.display = 'flex';
        if (agentAvatar) agentAvatar.textContent = agent.initial || agent.name.charAt(0).toUpperCase();
        if (agentNameEl) agentNameEl.textContent = agent.name;
      }
      if (chatHeaderName) chatHeaderName.textContent = agent.name;
      if (chatHeaderStatus) chatHeaderStatus.innerHTML = '<span class="online-dot"></span> Support Agent';
    }

    function hideAgentProfile() {
      currentAgent = null;
      if (agentBar) agentBar.style.display = 'none';
      if (chatHeaderName) chatHeaderName.textContent = 'SHAREIDE Support';
      if (chatHeaderStatus) chatHeaderStatus.innerHTML = '<span class="online-dot"></span> Online';
    }

    function setInputPlaceholder(text) {
      if (chatInput) chatInput.placeholder = text;
    }

    function enableInput() {
      if (chatInput) chatInput.disabled = false;
      if (chatForm) chatForm.style.display = 'flex';
    }

    function disableInput() {
      if (chatInput) chatInput.disabled = true;
    }

    // ============================================
    // FILE ATTACHMENT HANDLING
    // ============================================
    if (chatAttachBtn) {
      chatAttachBtn.addEventListener('click', function() {
        if (CHAT_STATE.phase !== 'live_chat') return;
        if (chatFileInput) chatFileInput.click();
      });
    }

    if (chatFileInput) {
      chatFileInput.addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
          addMessage('File too large. Max 10MB.', 'bot');
          this.value = '';
          return;
        }
        chatPendingFile = file;
        showChatFilePreview(file);
      });
    }

    if (chatFileRemove) {
      chatFileRemove.addEventListener('click', function() {
        clearChatFilePreview();
      });
    }

    function showChatFilePreview(file) {
      if (!chatFilePreview) return;
      chatFilePreview.style.display = 'block';
      if (chatFileName) chatFileName.textContent = file.name;
      if (chatFileSize) chatFileSize.textContent = formatFileSize(file.size);
      if (file.type.startsWith('image/') && chatFileThumb) {
        var reader = new FileReader();
        reader.onload = function(e) { chatFileThumb.innerHTML = '<img src="' + e.target.result + '" alt="Preview">'; };
        reader.readAsDataURL(file);
      } else if (chatFileThumb) {
        chatFileThumb.innerHTML = '<i class="fas fa-file"></i>';
      }
    }

    function clearChatFilePreview() {
      chatPendingFile = null;
      if (chatFileInput) chatFileInput.value = '';
      if (chatFilePreview) chatFilePreview.style.display = 'none';
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async function sendFileMessage(file, caption) {
      if (!currentTicket || !currentTicket.token) return;
      var formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('message', caption);
      var tempUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      addMessage(caption || '', 'user', null, null, tempUrl, file.name);
      clearChatFilePreview();
      try {
        var response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token + '/upload', { method: 'POST', body: formData });
        var data = await response.json();
        if (data.success && data.message_id) CHAT_STATE.lastMessageId = data.message_id;
      } catch (error) {
        addMessage('Connection error. Please try again.', 'bot');
      }
    }

    // ============================================
    // AI CHATBOT (Gemini-powered)
    // ============================================
    async function sendToAI(userText) {
      if (CHAT_STATE.isBotThinking) return;
      CHAT_STATE.isBotThinking = true;

      showTypingIndicator();
      disableInput();

      try {
        var response = await fetch(API_BASE_URL + '/chatbot/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: CHAT_STATE.conversationHistory.slice(-16) // last 16 messages for context
          })
        });

        var data = await response.json();

        hideTypingIndicator();
        enableInput();
        CHAT_STATE.isBotThinking = false;

        if (data.success) {
          addMessage(data.reply, 'bot');
          CHAT_STATE.conversationHistory.push({ role: 'bot', text: data.reply });

          if (data.category && data.category !== 'other') {
            CHAT_STATE.detectedCategory = data.category;
          }

          // If AI says escalate, offer to connect with support
          if (data.escalate) {
            setTimeout(function() {
              showQuickReplies([
                { label: 'Connect me to support', value: '_connect_support', variant: 'escalate' },
                { label: 'No thanks, this helped', value: '_ai_resolved', variant: 'confirm' }
              ]);
            }, 500);
          }
        } else {
          addMessage('Sorry, I had trouble processing that. Please try again.', 'bot');
        }

      } catch (error) {
        hideTypingIndicator();
        enableInput();
        CHAT_STATE.isBotThinking = false;
        addMessage('Connection error. Please check your internet and try again.', 'bot');
      }
    }

    // ============================================
    // BOT GREETING
    // ============================================
    function showBotGreeting() {
      if (chatMessages) chatMessages.innerHTML = '';
      CHAT_STATE.conversationHistory = [];
      CHAT_STATE.phase = 'bot';
      CHAT_STATE.awaitingInput = null;
      CHAT_STATE.detectedCategory = 'other';
      CHAT_STATE.isBotThinking = false;

      if (chatFilePreview) chatFilePreview.style.display = 'none';
      if (chatMessages) chatMessages.style.display = 'block';
      if (chatForm) chatForm.style.display = 'flex';
      if (newTicketBtn) newTicketBtn.style.display = 'none';
      hideAgentProfile();
      enableInput();
      setInputPlaceholder('Type your question...');

      // Show greeting after small delay
      showTypingIndicator();
      setTimeout(function() {
        hideTypingIndicator();
        addMessage('Hi! I\'m SHAREIDE\'s AI assistant. How can I help you today? You can ask me anything about rides, payments, or your account - in any language! 🚗', 'bot');
        CHAT_STATE.conversationHistory.push({ role: 'bot', text: 'Hi! I\'m SHAREIDE\'s AI assistant. How can I help you today?' });
      }, 600);
    }

    // ============================================
    // INFO COLLECTION (for ticket creation)
    // ============================================
    function startInfoCollection() {
      CHAT_STATE.phase = 'collecting_info';
      CHAT_STATE.awaitingInput = 'collect_name';
      hideQuickReplies();
      setInputPlaceholder('Enter your full name...');

      showTypingIndicator();
      setTimeout(function() {
        hideTypingIndicator();
        addMessage('I\'ll connect you with our support team. First, what\'s your name?', 'bot');
      }, 400);
    }

    function handleInfoCollection(text) {
      if (CHAT_STATE.awaitingInput === 'collect_name') {
        if (text.trim().length < 2) {
          addMessage('Please enter a valid name (at least 2 characters).', 'bot');
          return;
        }
        CHAT_STATE.userInfo.name = text.trim();
        CHAT_STATE.awaitingInput = 'collect_email';
        setInputPlaceholder('Enter your email address...');

        showTypingIndicator();
        setTimeout(function() {
          hideTypingIndicator();
          addMessage('Thanks, ' + escapeHtml(CHAT_STATE.userInfo.name) + '! What\'s your email address?', 'bot');
        }, 300);
        return;
      }

      if (CHAT_STATE.awaitingInput === 'collect_email') {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text.trim())) {
          addMessage('That doesn\'t look like a valid email. Please try again.', 'bot');
          return;
        }
        CHAT_STATE.userInfo.email = text.trim();
        CHAT_STATE.awaitingInput = 'collect_phone';
        setInputPlaceholder('Enter phone (or type "skip")...');

        showTypingIndicator();
        setTimeout(function() {
          hideTypingIndicator();
          addMessage('And your phone number? (Type "skip" if you prefer not to share)', 'bot');
        }, 300);
        return;
      }

      if (CHAT_STATE.awaitingInput === 'collect_phone') {
        if (text.trim().toLowerCase() === 'skip' || text.trim() === '') {
          CHAT_STATE.userInfo.phone = '';
        } else {
          CHAT_STATE.userInfo.phone = text.trim();
        }
        CHAT_STATE.awaitingInput = null;
        hideQuickReplies();

        showTypingIndicator();
        setTimeout(function() {
          hideTypingIndicator();
          addMessage('Creating your support ticket now...', 'bot');
          createTicket();
        }, 400);
        return;
      }
    }

    // ============================================
    // TICKET CREATION
    // ============================================
    function buildConversationTranscript() {
      var transcript = '--- Bot Conversation Transcript ---\n';
      CHAT_STATE.conversationHistory.forEach(function(msg) {
        var prefix = msg.role === 'user' ? 'User' : 'Bot';
        transcript += prefix + ': ' + msg.text + '\n';
      });
      transcript += '--- End of Bot Transcript ---';
      return transcript;
    }

    function getTicketSubject() {
      // Try to use first user message as subject
      for (var i = 0; i < CHAT_STATE.conversationHistory.length; i++) {
        if (CHAT_STATE.conversationHistory[i].role === 'user') {
          var msg = CHAT_STATE.conversationHistory[i].text;
          if (msg.length > 5 && msg.length <= 100) return msg;
          if (msg.length > 100) return msg.substring(0, 97) + '...';
        }
      }
      return 'Support Request (via AI Chatbot)';
    }

    async function createTicket() {
      var transcript = buildConversationTranscript();
      var categoryMap = {
        payment: 'payment',
        ride_issue: 'ride_issue',
        driver_behavior: 'driver_behavior',
        app_bug: 'app_bug',
        account: 'account',
        other: 'other'
      };
      var dbCategory = categoryMap[CHAT_STATE.detectedCategory] || 'other';

      try {
        var response = await fetch(API_BASE_URL + '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: CHAT_STATE.userInfo.name,
            email: CHAT_STATE.userInfo.email,
            phone: CHAT_STATE.userInfo.phone || null,
            subject: getTicketSubject(),
            message: transcript,
            category: dbCategory,
            priority: 'medium',
            source: 'chatbot'
          })
        });

        var data = await response.json();

        if (data.success) {
          var token = data.reply_url ? data.reply_url.split('/').pop() : null;
          currentTicket = {
            name: CHAT_STATE.userInfo.name,
            email: CHAT_STATE.userInfo.email,
            phone: CHAT_STATE.userInfo.phone,
            token: token,
            ticket_number: data.ticket_number,
            status: 'open',
            source: 'chatbot'
          };
          saveTicketData(currentTicket);
          CHAT_STATE.ticketData = currentTicket;
          switchToLiveChat(data.ticket_number);
        } else {
          addMessage('Sorry, there was an error creating your ticket. Please try again.', 'bot');
          enableInput();
        }
      } catch (error) {
        addMessage('Connection error. Please check your internet and try again.', 'bot');
        enableInput();
      }
    }

    // ============================================
    // LIVE CHAT PHASE
    // ============================================
    function switchToLiveChat(ticketNumber) {
      CHAT_STATE.phase = 'live_chat';
      hideQuickReplies();

      addTransition('Connected to Support');

      var div = document.createElement('div');
      div.className = 'chat-message chat-message--bot';
      div.innerHTML = '<p><strong>Ticket #' + escapeHtml(String(ticketNumber)) + ' created!</strong>\n' +
        'Your conversation has been sent to our support team. An agent will respond here shortly.\n\n' +
        '<span class="live-badge"><span class="pulse-dot"></span> Live Chat Active</span></p>';
      chatMessages.appendChild(div);
      scrollToBottom();

      setInputPlaceholder('Type a message to support...');
      enableInput();
      if (newTicketBtn) newTicketBtn.style.display = 'block';

      startAutoRefresh();
      startActivityPing();
    }

    function resumeLiveChat() {
      if (!currentTicket || !currentTicket.token) return;
      CHAT_STATE.phase = 'live_chat';
      if (chatFilePreview) chatFilePreview.style.display = 'none';
      if (chatMessages) chatMessages.style.display = 'block';
      if (chatForm) chatForm.style.display = 'flex';
      if (newTicketBtn) newTicketBtn.style.display = 'block';
      enableInput();
      setInputPlaceholder('Type a message to support...');
      loadTicketMessages();
      startAutoRefresh();
      startActivityPing();
    }

    async function loadTicketMessages() {
      if (!currentTicket || !currentTicket.token) return;
      try {
        var response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token);
        var data = await response.json();
        if (data.success) {
          chatMessages.innerHTML = '';
          currentTicket.status = data.ticket.status;
          saveTicketData(currentTicket);
          addSystemMessage('Ticket #' + data.ticket.ticket_number);
          if (data.ticket.agent) showAgentProfile(data.ticket.agent);
          data.ticket.messages.forEach(function(msg) {
            if (msg.is_admin) {
              addMessage(msg.message, 'bot', msg.created_at, msg.sender, msg.attachment, msg.attachment_name);
            } else {
              addMessage(msg.message, 'user', msg.created_at, null, msg.attachment, msg.attachment_name);
            }
            if (msg.id) CHAT_STATE.lastMessageId = msg.id;
          });
          if (currentTicket.status === 'closed' || currentTicket.status === 'resolved') {
            disableInput();
            setInputPlaceholder('Ticket closed. Click "New Conversation" to start over.');
            stopAutoRefresh();
            stopActivityPing();
            addSystemMessage('This conversation has been closed.');
          }
        } else {
          clearTicketData();
          currentTicket = null;
          showBotGreeting();
        }
      } catch (error) { /* silently ignore */ }
    }

    async function pollForNewMessages() {
      if (!currentTicket || !currentTicket.token) return;
      try {
        var url = API_BASE_URL + '/support/ticket/' + currentTicket.token + '/messages?after=' + CHAT_STATE.lastMessageId;
        var response = await fetch(url);
        var data = await response.json();
        if (!data.success) return;

        showAdminTypingIndicator(data.admin_typing);

        if (data.ticket_status && data.ticket_status !== currentTicket.status) {
          currentTicket.status = data.ticket_status;
          saveTicketData(currentTicket);
          if (data.ticket_status === 'closed' || data.ticket_status === 'resolved') {
            disableInput();
            setInputPlaceholder('Ticket closed. Click "New Conversation" to start over.');
            stopAutoRefresh();
            stopActivityPing();
            addSystemMessage('This conversation has been closed.');
            return;
          }
        }

        if (data.messages && data.messages.length > 0) {
          hideAdminTypingIndicator();
          data.messages.forEach(function(msg) {
            if (msg.is_admin) {
              addMessage(msg.message, 'bot', msg.created_at, msg.sender, msg.attachment, msg.attachment_name);
            } else {
              addMessage(msg.message, 'user', msg.created_at, null, msg.attachment, msg.attachment_name);
            }
            if (msg.id) CHAT_STATE.lastMessageId = msg.id;
          });
        }
      } catch (error) { /* silently ignore */ }
    }

    function showAdminTypingIndicator(show) {
      var existing = document.getElementById('adminTypingIndicator');
      if (show && !existing) {
        var div = document.createElement('div');
        div.className = 'chat-message chat-message--bot';
        div.id = 'adminTypingIndicator';
        div.innerHTML = '<div class="chat-typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
        chatMessages.appendChild(div);
        scrollToBottom();
      } else if (!show && existing) {
        existing.remove();
      }
    }

    function hideAdminTypingIndicator() {
      var el = document.getElementById('adminTypingIndicator');
      if (el) el.remove();
    }

    var guestTypingTimeout = null;

    function sendGuestTypingSignal() {
      if (!currentTicket || !currentTicket.token) return;
      fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token + '/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      }).catch(function() {});
    }

    async function sendLiveChatMessage(message) {
      if (!currentTicket || !currentTicket.token) return;
      try {
        var response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token + '/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ message: message })
        });
        var data = await response.json();
        if (data.success && data.message_id) {
          CHAT_STATE.lastMessageId = data.message_id;
        } else if (!data.success) {
          addMessage('Error: ' + (data.message || 'Could not send message.'), 'bot');
        }
      } catch (error) {
        addMessage('Connection error. Please try again.', 'bot');
      }
    }

    function startAutoRefresh() {
      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(function() {
        if (currentTicket && currentTicket.token && chatPopup && chatPopup.classList.contains('show')) {
          pollForNewMessages();
        }
      }, 3000);
    }

    function stopAutoRefresh() {
      if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
    }

    function startActivityPing() {
      if (activityInterval) clearInterval(activityInterval);
      pingActivity();
      activityInterval = setInterval(pingActivity, 30000);
    }

    function stopActivityPing() {
      if (activityInterval) { clearInterval(activityInterval); activityInterval = null; }
    }

    function pingActivity() {
      if (!currentTicket || !currentTicket.token) return;
      fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token + '/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      }).catch(function() {});
    }

    // ============================================
    // MAIN MESSAGE ROUTER
    // ============================================
    function processUserMessage(text) {
      if (!text || !text.trim()) return;

      hideQuickReplies();

      // Handle special commands
      if (text === '_connect_support') {
        addMessage('Connect me to support', 'user');
        CHAT_STATE.conversationHistory.push({ role: 'user', text: 'Connect me to support' });
        startInfoCollection();
        return;
      }

      if (text === '_ai_resolved') {
        addMessage('No thanks, this helped', 'user');
        CHAT_STATE.conversationHistory.push({ role: 'user', text: 'No thanks, this helped' });

        showTypingIndicator();
        setTimeout(function() {
          hideTypingIndicator();
          addMessage('Glad I could help! Is there anything else I can assist you with?', 'bot');
          CHAT_STATE.conversationHistory.push({ role: 'bot', text: 'Glad I could help! Is there anything else?' });
        }, 400);
        return;
      }

      addMessage(text, 'user');
      CHAT_STATE.conversationHistory.push({ role: 'user', text: text });

      switch (CHAT_STATE.phase) {
        case 'bot':
          sendToAI(text);
          break;

        case 'collecting_info':
          handleInfoCollection(text);
          break;

        case 'live_chat':
          sendLiveChatMessage(text);
          break;
      }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initializeChat() {
      if (currentTicket && currentTicket.token) {
        resumeLiveChat();
      } else {
        showBotGreeting();
      }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    if (chatToggle) {
      chatToggle.addEventListener('click', function() {
        chatPopup.classList.toggle('show');
        if (chatBadge) chatBadge.style.display = 'none';
        if (chatPopup.classList.contains('show')) {
          initializeChat();
        } else {
          stopAutoRefresh();
          stopActivityPing();
        }
      });
    }

    if (chatClose) {
      chatClose.addEventListener('click', function() {
        chatPopup.classList.remove('show');
        stopAutoRefresh();
        stopActivityPing();
      });
    }

    if (newTicketBtn) {
      newTicketBtn.addEventListener('click', function() {
        clearTicketData();
        currentTicket = null;
        CHAT_STATE.phase = 'bot';
        CHAT_STATE.ticketData = null;
        stopAutoRefresh();
        stopActivityPing();
        hideAgentProfile();
        showBotGreeting();
      });
    }

    if (chatForm) {
      chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var msg = chatInput.value.trim();
        if (chatPendingFile && CHAT_STATE.phase === 'live_chat') {
          sendFileMessage(chatPendingFile, msg);
          chatInput.value = '';
          return;
        }
        if (msg) {
          processUserMessage(msg);
          chatInput.value = '';
        }
      });
    }

    // Typing detection for live chat
    if (chatInput) {
      chatInput.addEventListener('input', function() {
        if (CHAT_STATE.phase === 'live_chat' && currentTicket && currentTicket.token) {
          clearTimeout(guestTypingTimeout);
          sendGuestTypingSignal();
          guestTypingTimeout = setTimeout(function() {}, 2000);
        }
      });
    }

    // ============================================
    // TAB CLOSE: go offline + clear all chat data
    // ============================================
    function sendOfflineAndClear() {
      // Send offline signal via sendBeacon (works even when tab is closing)
      if (currentTicket && currentTicket.token) {
        var url = API_BASE_URL + '/support/ticket/' + currentTicket.token + '/offline';
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, '');
        } else {
          // Fallback: sync XHR (last resort for old browsers)
          try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, false); // synchronous
            xhr.send();
          } catch (e) {}
        }
      }

      // Clear all stored chat data
      clearTicketData();
      currentTicket = null;
      CHAT_STATE.phase = 'bot';
      CHAT_STATE.conversationHistory = [];
      CHAT_STATE.ticketData = null;
      CHAT_STATE.lastMessageId = 0;
      stopAutoRefresh();
      stopActivityPing();
    }

    // When user closes or navigates away from the tab
    window.addEventListener('beforeunload', sendOfflineAndClear);

    // Also handle page hide (mobile browsers, tab switching in some cases)
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        // Send offline signal when tab becomes hidden
        if (currentTicket && currentTicket.token) {
          var url = API_BASE_URL + '/support/ticket/' + currentTicket.token + '/offline';
          if (navigator.sendBeacon) {
            navigator.sendBeacon(url, '');
          }
        }
      } else if (document.visibilityState === 'visible') {
        // Re-ping activity when coming back to tab (if still in live chat)
        if (currentTicket && currentTicket.token && CHAT_STATE.phase === 'live_chat' && chatPopup && chatPopup.classList.contains('show')) {
          pingActivity();
        }
      }
    });
  }

  // ============================================
  // BOOT
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(setupChat, 100); });
  } else {
    setTimeout(setupChat, 100);
  }

})();
