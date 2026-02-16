// SHAREIDE - Support Page JavaScript (Contact Form + Live Ticket Chat via API)

document.addEventListener('DOMContentLoaded', function() {

  var API_BASE_URL = '/api';

  // ============ CONTACT FORM ============
  var contactForm = document.getElementById('supportContactForm');
  var formMessage = document.getElementById('formMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      var formData = {
        name: document.getElementById('supportName').value.trim(),
        email: document.getElementById('supportEmail').value.trim(),
        phone: document.getElementById('supportPhone').value.trim(),
        subject: document.getElementById('supportSubject').value.trim(),
        message: document.getElementById('supportMessage').value.trim()
      };

      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showFormMessage('Please fill in all required fields.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        return;
      }

      try {
        var response = await fetch(API_BASE_URL + '/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        var data = await response.json();

        if (data.success) {
          showFormMessage(
            'Your message has been sent successfully! Ticket #' + data.ticket_number + ' created. We will respond to ' + formData.email + '.',
            'success'
          );
          contactForm.reset();
        } else {
          showFormMessage('Error: ' + (data.message || 'Failed to send. Please try again.'), 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showFormMessage('Connection error. Please try again later.', 'error');
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  }

  function showFormMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message form-message--' + type;
    formMessage.style.display = 'block';

    setTimeout(function() {
      formMessage.style.display = 'none';
    }, 8000);
  }

  // ============ LIVE TICKET CHAT ============
  var ticketForm = document.getElementById('ticketLookupForm');
  var ticketResult = document.getElementById('ticketResult');
  var activeToken = null;
  var lastMessageId = 0;
  var pollInterval = null;
  var activityInterval = null;
  var ticketStatus = null;

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  if (ticketForm) {
    ticketForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      var tokenInput = document.getElementById('ticketToken');
      var token = tokenInput.value.trim();

      if (!token) {
        showTicketResult('Please enter your ticket token.', 'error');
        return;
      }

      var submitBtn = ticketForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...';
      submitBtn.disabled = true;

      try {
        var response = await fetch(API_BASE_URL + '/support/ticket/' + token);
        var data = await response.json();

        if (data.success) {
          activeToken = token;
          ticketStatus = data.ticket.status;
          renderLiveChat(data.ticket);
          startPolling();
          startActivityPing();
        } else {
          showTicketResult('Ticket not found. Please check your token.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showTicketResult('Connection error. Please try again.', 'error');
      }

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  }

  function renderLiveChat(ticket) {
    var isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

    var html = '<div class="ticket-info">';
    html += '<div class="ticket-info__header">';
    html += '<h4>Ticket #' + escapeHtml(ticket.ticket_number) + '</h4>';
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    if (!isClosed) {
      html += '<span class="ticket-live-badge"><span class="pulse-dot"></span> Live Chat</span>';
    }
    html += '<span class="ticket-status ticket-status--' + ticket.status + '">' + ticket.status.replace(/_/g, ' ') + '</span>';
    html += '</div></div>';
    html += '<p class="ticket-info__subject"><strong>Subject:</strong> ' + escapeHtml(ticket.subject) + '</p>';

    // Messages area
    html += '<div class="ticket-info__messages" id="ticketMessages">';

    ticket.messages.forEach(function(msg) {
      html += '<div class="ticket-msg ticket-msg--' + (msg.is_admin ? 'admin' : 'user') + '" data-msg-id="' + (msg.id || '') + '">';
      html += '<p>' + escapeHtml(msg.message) + '</p>';
      html += '<small>' + (msg.is_admin ? escapeHtml(msg.sender || 'Support Team') : 'You') + ' - ' + escapeHtml(msg.created_at) + '</small>';
      html += '</div>';
      if (msg.id) lastMessageId = msg.id;
    });

    // Admin typing indicator (hidden)
    html += '<div id="ticketAdminTyping" class="ticket-typing" style="display:none;"><span></span><span></span><span></span></div>';

    html += '</div>';

    // Reply form or closed notice
    if (!isClosed) {
      html += '<form class="ticket-reply-form" id="ticketReplyForm">';
      html += '<input type="text" id="ticketReplyInput" placeholder="Type a message..." maxlength="2000" autocomplete="off">';
      html += '<button type="submit" id="ticketReplyBtn"><i class="fas fa-paper-plane"></i></button>';
      html += '</form>';
    } else {
      html += '<div class="ticket-closed-notice"><i class="fas fa-lock"></i> This ticket is closed. Please create a new ticket if you need further help.</div>';
    }

    html += '</div>';
    showTicketResult(html, 'success', true);

    // Scroll messages to bottom
    var messagesEl = document.getElementById('ticketMessages');
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // Attach reply form handler
    var replyForm = document.getElementById('ticketReplyForm');
    var replyInput = document.getElementById('ticketReplyInput');

    if (replyForm && replyInput) {
      replyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        sendTicketReply();
      });

      // Typing detection
      replyInput.addEventListener('input', function() {
        sendTypingSignal();
      });
    }
  }

  var typingThrottle = null;

  function sendTypingSignal() {
    if (!activeToken) return;
    if (typingThrottle) return; // throttle to max once per second

    typingThrottle = setTimeout(function() {
      typingThrottle = null;
    }, 1000);

    fetch(API_BASE_URL + '/support/ticket/' + activeToken + '/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }).catch(function() {});
  }

  async function sendTicketReply() {
    if (!activeToken) return;

    var input = document.getElementById('ticketReplyInput');
    var btn = document.getElementById('ticketReplyBtn');
    if (!input || !btn) return;

    var message = input.value.trim();
    if (!message) return;

    // Optimistic UI: append message immediately
    var messagesEl = document.getElementById('ticketMessages');
    if (messagesEl) {
      var typingEl = document.getElementById('ticketAdminTyping');
      var div = document.createElement('div');
      div.className = 'ticket-msg ticket-msg--user';
      div.innerHTML = '<p>' + escapeHtml(message) + '</p><small>You - just now</small>';
      if (typingEl) {
        messagesEl.insertBefore(div, typingEl);
      } else {
        messagesEl.appendChild(div);
      }
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    input.value = '';
    btn.disabled = true;

    try {
      var response = await fetch(API_BASE_URL + '/support/ticket/' + activeToken + '/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message: message })
      });
      var data = await response.json();

      if (data.success && data.message_id) {
        lastMessageId = data.message_id;
      } else if (!data.success) {
        appendSystemNotice('Error: ' + (data.message || 'Failed to send.'));
      }
    } catch (error) {
      appendSystemNotice('Connection error. Please try again.');
    }

    btn.disabled = false;
    if (input) input.focus();
  }

  function appendSystemNotice(text) {
    var messagesEl = document.getElementById('ticketMessages');
    if (!messagesEl) return;
    var div = document.createElement('div');
    div.style.cssText = 'text-align:center;font-size:12px;color:#EF4444;padding:8px;';
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ============ INCREMENTAL POLLING (3s) ============
  async function pollMessages() {
    if (!activeToken) return;

    try {
      var url = API_BASE_URL + '/support/ticket/' + activeToken + '/messages?after=' + lastMessageId;
      var response = await fetch(url);
      var data = await response.json();

      if (!data.success) return;

      // Show/hide admin typing
      var typingEl = document.getElementById('ticketAdminTyping');
      if (typingEl) {
        typingEl.style.display = data.admin_typing ? 'inline-flex' : 'none';
      }

      // Check status change
      if (data.ticket_status && data.ticket_status !== ticketStatus) {
        ticketStatus = data.ticket_status;
        // Update status badge
        var statusBadge = ticketResult ? ticketResult.querySelector('.ticket-status') : null;
        if (statusBadge) {
          statusBadge.className = 'ticket-status ticket-status--' + data.ticket_status;
          statusBadge.textContent = data.ticket_status.replace(/_/g, ' ');
        }
        if (data.ticket_status === 'closed' || data.ticket_status === 'resolved') {
          // Disable input, stop polling
          var replyForm = document.getElementById('ticketReplyForm');
          if (replyForm) {
            replyForm.outerHTML = '<div class="ticket-closed-notice"><i class="fas fa-lock"></i> This ticket has been closed.</div>';
          }
          // Remove live badge
          var liveBadge = ticketResult ? ticketResult.querySelector('.ticket-live-badge') : null;
          if (liveBadge) liveBadge.remove();
          stopPolling();
          stopActivityPing();
          return;
        }
      }

      // Append new messages
      if (data.messages && data.messages.length > 0) {
        var messagesEl = document.getElementById('ticketMessages');
        if (!messagesEl) return;

        // Hide admin typing while appending
        if (typingEl) typingEl.style.display = 'none';

        data.messages.forEach(function(msg) {
          var div = document.createElement('div');
          div.className = 'ticket-msg ticket-msg--' + (msg.is_admin ? 'admin' : 'user');
          div.setAttribute('data-msg-id', msg.id);
          div.innerHTML = '<p>' + escapeHtml(msg.message) + '</p><small>' +
            (msg.is_admin ? escapeHtml(msg.sender || 'Support Team') : 'You') + ' - ' +
            escapeHtml(msg.created_at) + '</small>';

          // Insert before typing indicator
          if (typingEl) {
            messagesEl.insertBefore(div, typingEl);
          } else {
            messagesEl.appendChild(div);
          }

          if (msg.id) lastMessageId = msg.id;
        });

        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    } catch (error) {
      // Silently ignore
    }
  }

  function startPolling() {
    stopPolling();
    pollInterval = setInterval(pollMessages, 3000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function startActivityPing() {
    stopActivityPing();
    pingActivity();
    activityInterval = setInterval(pingActivity, 30000);
  }

  function stopActivityPing() {
    if (activityInterval) {
      clearInterval(activityInterval);
      activityInterval = null;
    }
  }

  function pingActivity() {
    if (!activeToken) return;
    fetch(API_BASE_URL + '/support/ticket/' + activeToken + '/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }).catch(function() {});
  }

  function showTicketResult(content, type, isHtml) {
    if (!ticketResult) return;
    if (isHtml) {
      ticketResult.innerHTML = content;
    } else {
      ticketResult.textContent = content;
    }
    ticketResult.className = 'ticket-result ticket-result--' + type;
    ticketResult.style.display = 'block';
  }
});
