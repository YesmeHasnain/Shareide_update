// SHAREIDE - Shared JavaScript (All pages)

document.addEventListener('DOMContentLoaded', function() {

  // ============ PRELOADER ============
  var preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('hidden');
        if (typeof window.onPreloaderHidden === 'function') {
          window.onPreloaderHidden();
        }
      }, 1200);
    });

    // Fallback
    setTimeout(function() {
      if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        if (typeof window.onPreloaderHidden === 'function') {
          window.onPreloaderHidden();
        }
      }
    }, 3000);
  }

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

  // ============ HEADER SCROLL ============
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
    // Check on load
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    }
  }

  // ============ MOBILE MENU ============
  var navToggle = document.getElementById('nav-toggle');
  var navClose = document.getElementById('nav-close');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.add('show');
    });
  }

  if (navClose && navMenu) {
    navClose.addEventListener('click', function() {
      navMenu.classList.remove('show');
    });
  }

  // Close menu on link click (direct links only, not dropdowns)
  document.querySelectorAll('.nav__link:not(.nav__link--dropdown)').forEach(function(link) {
    link.addEventListener('click', function() {
      if (navMenu) navMenu.classList.remove('show');
    });
  });

  // Close menu when clicking mega menu items
  document.querySelectorAll('.mega-menu__item, .nav__dropdown-item').forEach(function(link) {
    link.addEventListener('click', function() {
      if (navMenu) navMenu.classList.remove('show');
    });
  });

  // ============ MEGA MENU - MOBILE ACCORDION ============
  document.querySelectorAll('.nav__link--dropdown').forEach(function(link) {
    link.addEventListener('click', function(e) {
      // Only accordion behavior on mobile
      if (window.innerWidth <= 992) {
        e.preventDefault();
        var parent = this.closest('.nav__dropdown');
        var isOpen = parent.classList.contains('mobile-open');

        // Close all dropdowns
        document.querySelectorAll('.nav__dropdown').forEach(function(d) {
          d.classList.remove('mobile-open');
        });

        // Toggle clicked
        if (!isOpen) {
          parent.classList.add('mobile-open');
        }
      }
    });
  });

  // ============ SMOOTH SCROLL (for anchor links) ============
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;
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
  if (animateElements.length > 0) {
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
  }

  // ============ COUNTER ANIMATION ============
  var counters = document.querySelectorAll('[data-target]');
  if (counters.length > 0) {
    var counterStarted = new Set();

    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !counterStarted.has(entry.target)) {
          counterStarted.add(entry.target);
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

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

  // ============ PAGE HERO PARTICLES ============
  var pageParticlesCanvas = document.getElementById('pageParticles');
  if (pageParticlesCanvas) {
    var ctx = pageParticlesCanvas.getContext('2d');
    var particles = [];
    var particleCount = 30;
    var mouse = { x: -1000, y: -1000 };

    function resizePageCanvas() {
      var hero = pageParticlesCanvas.parentElement;
      pageParticlesCanvas.width = hero.offsetWidth;
      pageParticlesCanvas.height = hero.offsetHeight;
    }
    resizePageCanvas();
    window.addEventListener('resize', resizePageCanvas);

    for (var p = 0; p < particleCount; p++) {
      particles.push({
        x: Math.random() * pageParticlesCanvas.width,
        y: Math.random() * pageParticlesCanvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    pageParticlesCanvas.parentElement.addEventListener('mousemove', function(e) {
      var rect = pageParticlesCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    pageParticlesCanvas.parentElement.addEventListener('mouseleave', function() {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    function animatePageParticles() {
      ctx.clearRect(0, 0, pageParticlesCanvas.width, pageParticlesCanvas.height);

      for (var i = 0; i < particles.length; i++) {
        var pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;

        if (pt.x < 0 || pt.x > pageParticlesCanvas.width) pt.vx *= -1;
        if (pt.y < 0 || pt.y > pageParticlesCanvas.height) pt.vy *= -1;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(252,192,20,' + pt.opacity + ')';
        ctx.fill();

        // Draw connections
        for (var j = i + 1; j < particles.length; j++) {
          var pt2 = particles[j];
          var dx = pt.x - pt2.x;
          var dy = pt.y - pt2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = 'rgba(252,192,20,' + (0.06 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse interaction
        var mdx = pt.x - mouse.x;
        var mdy = pt.y - mouse.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 150) {
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = 'rgba(252,192,20,' + (0.12 * (1 - mDist / 150)) + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animatePageParticles);
    }
    animatePageParticles();
  }

  // ============ TILT EFFECT ON FEATURE CARDS ============
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
});
