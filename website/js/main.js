// SHAREIDE Website JavaScript

// API Base URL - Change this for production
const API_BASE_URL = 'http://127.0.0.1:8001/api';
// const API_BASE_URL = 'https://api.shareide.com/api';

// Storage keys
const STORAGE_KEY = 'shareide_support';

function getStoredTicket() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function saveTicketData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearTicketData() {
  localStorage.removeItem(STORAGE_KEY);
}

document.addEventListener('DOMContentLoaded', function() {

  // Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu
  const navToggle = document.getElementById('nav-toggle');
  const navClose = document.getElementById('nav-close');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.add('show');
    });
  }

  if (navClose) {
    navClose.addEventListener('click', function() {
      navMenu.classList.remove('show');
    });
  }

  document.querySelectorAll('.nav__link').forEach(function(link) {
    link.addEventListener('click', function() {
      navMenu.classList.remove('show');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function() {
    const scrollY = window.pageYOffset;
    sections.forEach(function(section) {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // ============ CHAT WIDGET ============
  const chatToggle = document.getElementById('chatToggle');
  const chatPopup = document.getElementById('chatPopup');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const chatBadge = document.querySelector('.chat-badge');
  const contactInfoForm = document.getElementById('contactInfoForm');
  const quickButtons = document.getElementById('quickButtons');
  const startChatBtn = document.getElementById('startChatBtn');
  const newTicketBtn = document.getElementById('newTicketBtn');

  let currentTicket = getStoredTicket();
  let refreshInterval = null;

  function initializeChat() {
    if (currentTicket && currentTicket.token) {
      showChatInterface();
      loadTicketMessages();
      startAutoRefresh();
    } else {
      showContactForm();
    }
  }

  function showContactForm() {
    if (contactInfoForm) contactInfoForm.style.display = 'block';
    if (chatMessages) chatMessages.style.display = 'none';
    if (quickButtons) quickButtons.style.display = 'none';
    if (chatForm) chatForm.style.display = 'none';
    if (newTicketBtn) newTicketBtn.style.display = 'none';
  }

  function showChatInterface() {
    if (contactInfoForm) contactInfoForm.style.display = 'none';
    if (chatMessages) chatMessages.style.display = 'block';
    if (chatForm) chatForm.style.display = 'flex';
    if (newTicketBtn) newTicketBtn.style.display = 'block';

    if (currentTicket && (currentTicket.status === 'closed' || currentTicket.status === 'resolved')) {
      if (chatInput) {
        chatInput.disabled = true;
        chatInput.placeholder = 'Ticket closed. Click "New" for new issue.';
      }
      if (quickButtons) quickButtons.style.display = 'none';
    } else {
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.placeholder = 'Type your message...';
      }
      if (quickButtons) quickButtons.style.display = 'flex';
    }
  }

  async function loadTicketMessages() {
    if (!currentTicket || !currentTicket.token) return;

    try {
      const response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token);
      const data = await response.json();

      if (data.success) {
        chatMessages.innerHTML = '';
        currentTicket.status = data.ticket.status;
        saveTicketData(currentTicket);

        addSystemMessage('Ticket #' + data.ticket.ticket_number + ' - ' + data.ticket.status.replace(/_/g, ' '));

        data.ticket.messages.forEach(function(msg) {
          if (msg.is_admin) {
            addMessage(msg.message, 'bot', msg.created_at);
          } else {
            addMessage(msg.message, 'user', msg.created_at);
          }
        });

        showChatInterface();
      } else {
        clearTicketData();
        currentTicket = null;
        showContactForm();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-message chat-message--system';
    div.innerHTML = '<p>' + text + '</p>';
    chatMessages.appendChild(div);
  }

  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(function() {
      if (currentTicket && currentTicket.token && chatPopup.classList.contains('show')) {
        loadTicketMessages();
      }
    }, 10000);
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  if (chatToggle) {
    chatToggle.addEventListener('click', function() {
      chatPopup.classList.toggle('show');
      if (chatBadge) chatBadge.style.display = 'none';
      if (chatPopup.classList.contains('show')) {
        initializeChat();
      } else {
        stopAutoRefresh();
      }
    });
  }

  if (chatClose) {
    chatClose.addEventListener('click', function() {
      chatPopup.classList.remove('show');
      stopAutoRefresh();
    });
  }

  if (newTicketBtn) {
    newTicketBtn.addEventListener('click', function() {
      clearTicketData();
      currentTicket = null;
      chatMessages.innerHTML = '';
      showContactForm();
    });
  }

  if (startChatBtn) {
    startChatBtn.addEventListener('click', function() {
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();

      if (!name) { alert('Please enter your name'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email'); return;
      }

      currentTicket = { name, email, phone, token: null, status: null };

      contactInfoForm.style.display = 'none';
      chatMessages.style.display = 'block';
      chatMessages.innerHTML = '';
      quickButtons.style.display = 'flex';
      chatForm.style.display = 'flex';
      chatInput.disabled = false;

      addMessage('Hi ' + name + '! How can we help you today?', 'bot');
    });
  }

  quickBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const msg = this.getAttribute('data-msg');
      sendSupportMessage(msg);
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (msg) {
        sendSupportMessage(msg);
        chatInput.value = '';
      }
    });
  }

  async function sendSupportMessage(message) {
    addMessage(message, 'user');

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message chat-message--bot';
    loadingDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Sending...</p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      let response, data;

      if (currentTicket && currentTicket.token) {
        response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token + '/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ message: message })
        });
        data = await response.json();
        loadingDiv.remove();

        if (data.success) {
          addMessage('Message sent! We will reply soon.', 'bot');
        } else {
          addMessage('Error: ' + (data.message || 'Could not send.'), 'bot');
        }
      } else {
        response = await fetch(API_BASE_URL + '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            name: currentTicket.name,
            email: currentTicket.email,
            phone: currentTicket.phone,
            subject: message.substring(0, 50),
            message: message
          })
        });

        data = await response.json();
        loadingDiv.remove();

        if (data.success) {
          const token = data.reply_url ? data.reply_url.split('/').pop() : null;
          currentTicket.token = token;
          currentTicket.ticket_number = data.ticket_number;
          currentTicket.status = 'open';
          saveTicketData(currentTicket);

          addMessage('Ticket #' + data.ticket_number + ' created! We will respond to ' + currentTicket.email + '. You can also check replies here.', 'bot');
          quickButtons.style.display = 'none';
          startAutoRefresh();
        } else {
          addMessage('Error: ' + (data.message || 'Please try again.'), 'bot');
        }
      }
    } catch (error) {
      loadingDiv.remove();
      console.error('Error:', error);
      addMessage('Connection error. Please try again.', 'bot');
    }
  }

  function addMessage(text, type, time) {
    const div = document.createElement('div');
    div.className = 'chat-message chat-message--' + type;
    let html = '<p>' + text + '</p>';
    if (time) html += '<span class="chat-time">' + time + '</span>';
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Animate on scroll
  const animateElements = document.querySelectorAll('.feature-card, .how__step, .testimonial-card, .safety__list li');
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animateElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Counter animation
  const counters = document.querySelectorAll('.hero__stat-number');
  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (match) {
      const target = parseInt(match[1]);
      const suffix = text.replace(match[1], '');
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(function() {
        current += increment;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + suffix;
        }
      }, 30);
    }
  }

});
