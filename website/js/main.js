// SHAREIDE Website JavaScript

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

  // Close menu on link click
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
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Chat Widget
  const chatToggle = document.getElementById('chatToggle');
  const chatPopup = document.getElementById('chatPopup');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const chatBadge = document.querySelector('.chat-badge');

  if (chatToggle) {
    chatToggle.addEventListener('click', function() {
      chatPopup.classList.toggle('show');
      if (chatBadge) chatBadge.style.display = 'none';
    });
  }

  if (chatClose) {
    chatClose.addEventListener('click', function() {
      chatPopup.classList.remove('show');
    });
  }

  // Quick buttons
  quickBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const msg = this.getAttribute('data-msg');
      addMessage(msg, 'user');

      setTimeout(function() {
        addMessage("Thanks for reaching out! Our team will respond shortly. For urgent issues, call: +92-XXX-XXXXXXX", 'bot');
      }, 1000);
    });
  });

  // Chat form
  if (chatForm) {
    chatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (msg) {
        addMessage(msg, 'user');
        chatInput.value = '';

        setTimeout(function() {
          addMessage("Thank you for your message! A support agent will respond soon.", 'bot');
        }, 1000);
      }
    });
  }

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'chat-message chat-message--' + type;
    div.innerHTML = '<p>' + text + '</p>';
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
