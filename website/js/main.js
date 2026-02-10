// SHAREIDE Website JavaScript - Premium Animations

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8001/api';
// const API_BASE_URL = 'https://api.shareide.com/api';

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

  // ============ PRELOADER ============
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function() {
    setTimeout(function() {
      preloader.classList.add('hidden');
      // Start hero animations after preloader
      startHeroAnimations();
    }, 1800);
  });

  // Fallback - hide preloader after 3s max
  setTimeout(function() {
    if (preloader && !preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      startHeroAnimations();
    }
  }, 3000);

  // ============ CURSOR GLOW ============
  var cursorGlow = document.getElementById('cursorGlow');
  if (window.matchMedia('(hover: hover)').matches && cursorGlow) {
    document.addEventListener('mousemove', function(e) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorGlow.classList.add('active');
    });
    document.addEventListener('mouseleave', function() {
      cursorGlow.classList.remove('active');
    });
  }

  // ============ HEADER ============
  var header = document.getElementById('header');
  var navLogo = document.getElementById('navLogo');

  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ============ MOBILE MENU ============
  var navToggle = document.getElementById('nav-toggle');
  var navClose = document.getElementById('nav-close');
  var navMenu = document.getElementById('nav-menu');

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

  // ============ ACTIVE LINK ON SCROLL ============
  var sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function() {
    var scrollY = window.pageYOffset;
    sections.forEach(function(section) {
      var sectionHeight = section.offsetHeight;
      var sectionTop = section.offsetTop - 120;
      var sectionId = section.getAttribute('id');
      var navLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  });

  // ============ SMOOTH SCROLL ============
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  // ============ BACK TO TOP ============
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============ SCROLL ANIMATIONS ============
  var animateElements = document.querySelectorAll('[data-animate]');
  var animateObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.getAttribute('data-delay') || '0');
        setTimeout(function() {
          entry.target.classList.add('animated');
        }, delay);
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach(function(el) {
    animateObserver.observe(el);
  });

  // ============ COUNTER ANIMATION ============
  var counters = document.querySelectorAll('.hero__stat-number');
  var counterStarted = false;

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !counterStarted) {
        counterStarted = true;
        counters.forEach(function(counter) {
          animateCounter(counter);
        });
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 2000;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.floor(easedProgress * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // ============ TYPING ANIMATION ============
  var typingTexts = ['Your Way', 'Affordable', 'Safer', 'Smarter'];
  var typingIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typingElement = document.getElementById('typingText');

  function startHeroAnimations() {
    if (typingElement) {
      setTimeout(typeEffect, 2000);
    }
  }

  function typeEffect() {
    if (!typingElement) return;

    var currentText = typingTexts[typingIndex];

    if (isDeleting) {
      charIndex--;
      typingElement.textContent = currentText.substring(0, charIndex);
    } else {
      charIndex++;
      typingElement.textContent = currentText.substring(0, charIndex);
    }

    var typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      typingIndex = (typingIndex + 1) % typingTexts.length;
      typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
  }

  // ============ PARTICLE SYSTEM ============
  var canvas = document.getElementById('heroParticles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 50;

    function resizeCanvas() {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    Particle.prototype.update = function() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    };

    Particle.prototype.draw = function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(252, 192, 20, ' + this.opacity + ')';
      ctx.fill();
    };

    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            var opacity = (1 - distance / 120) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(252, 192, 20, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function(particle) {
        particle.update();
        particle.draw();
      });

      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // ============ TIMELINE PROGRESS ============
  var timelineProgress = document.getElementById('timelineProgress');
  if (timelineProgress) {
    var timelineObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            timelineProgress.style.width = '100%';
          }, 500);
          timelineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    timelineObserver.observe(timelineProgress.parentElement);
  }

  // ============ TILT EFFECT ON CARDS ============
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.feature-card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / 20;
        var rotateY = (centerX - x) / 20;

        card.style.transform = 'translateY(-8px) perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';

        // Move glow with cursor
        var glow = card.querySelector('.feature-card__glow');
        if (glow) {
          glow.style.top = (y - rect.height) + 'px';
          glow.style.left = (x - rect.width) + 'px';
        }
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ============ PARALLAX ON SCROLL ============
  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY;
    var orbs = document.querySelectorAll('.orb');
    orbs.forEach(function(orb, index) {
      var speed = (index + 1) * 0.03;
      orb.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
    });
  });

  // ============ CHAT WIDGET ============
  var chatToggle = document.getElementById('chatToggle');
  var chatPopup = document.getElementById('chatPopup');
  var chatClose = document.getElementById('chatClose');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');
  var chatMessages = document.getElementById('chatMessages');
  var quickBtns = document.querySelectorAll('.quick-btn');
  var chatBadge = document.querySelector('.chat-badge');
  var contactInfoForm = document.getElementById('contactInfoForm');
  var quickButtons = document.getElementById('quickButtons');
  var startChatBtn = document.getElementById('startChatBtn');
  var newTicketBtn = document.getElementById('newTicketBtn');

  var currentTicket = getStoredTicket();
  var refreshInterval = null;

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
      var response = await fetch(API_BASE_URL + '/support/ticket/' + currentTicket.token);
      var data = await response.json();

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
    var div = document.createElement('div');
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
      var name = document.getElementById('contactName').value.trim();
      var email = document.getElementById('contactEmail').value.trim();
      var phone = document.getElementById('contactPhone').value.trim();

      if (!name) { alert('Please enter your name'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email'); return;
      }

      currentTicket = { name: name, email: email, phone: phone, token: null, status: null };

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
      var msg = this.getAttribute('data-msg');
      sendSupportMessage(msg);
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var msg = chatInput.value.trim();
      if (msg) {
        sendSupportMessage(msg);
        chatInput.value = '';
      }
    });
  }

  async function sendSupportMessage(message) {
    addMessage(message, 'user');

    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message chat-message--bot';
    loadingDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Sending...</p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      var response, data;

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
          var token = data.reply_url ? data.reply_url.split('/').pop() : null;
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
    var div = document.createElement('div');
    div.className = 'chat-message chat-message--' + type;
    var html = '<p>' + text + '</p>';
    if (time) html += '<span class="chat-time">' + time + '</span>';
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ============ PHONE SCREEN ANIMATION ============
  var rideOptions = document.querySelectorAll('.phone-screen__ride-option');
  if (rideOptions.length > 0) {
    var currentOption = 0;
    setInterval(function() {
      rideOptions.forEach(function(opt) { opt.classList.remove('active'); });
      currentOption = (currentOption + 1) % rideOptions.length;
      rideOptions[currentOption].classList.add('active');
    }, 3000);
  }

});
