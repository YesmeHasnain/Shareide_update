// SHAREIDE - Home Page JavaScript (Typing, Particles, Parallax, Phone Animation)

(function() {

  // ============ TYPING ANIMATION ============
  var typingTexts = ['Everyone', 'Women', 'Families', 'Students', 'Pakistan'];
  var typingIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typingElement = document.getElementById('typingText');

  window.onPreloaderHidden = function() {
    if (typingElement) {
      setTimeout(typeEffect, 2000);
    }
  };

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
      ctx.fillStyle = 'rgba(200, 160, 20, ' + (this.opacity * 0.6) + ')';
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
            ctx.strokeStyle = 'rgba(200, 160, 20, ' + (opacity * 0.5) + ')';
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

  // ============ PARALLAX ON SCROLL ============
  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY;
    var orbs = document.querySelectorAll('.hero__gradient-orbs .orb');
    orbs.forEach(function(orb, index) {
      var speed = (index + 1) * 0.03;
      orb.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
    });
  });

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

  // ============ STORIES CAROUSEL (Center Focus) ============
  var storiesStage = document.getElementById('storiesStage');
  var storiesPrev = document.getElementById('storiesPrev');
  var storiesNext = document.getElementById('storiesNext');
  var storiesCurrent = document.getElementById('storiesCurrent');

  if (storiesStage && storiesPrev && storiesNext) {
    var storyCards = storiesStage.querySelectorAll('.stories__card');
    var totalStories = storyCards.length;
    var activeIndex = 0;
    var storiesAutoplay = null;
    var isTransitioning = false;

    function wrapIndex(i) {
      return ((i % totalStories) + totalStories) % totalStories;
    }

    function updateCarousel() {
      // Remove all position classes (CSS handles the rest, no inline overrides)
      storyCards.forEach(function(card) {
        card.classList.remove(
          'stories__card--active',
          'stories__card--prev',
          'stories__card--next',
          'stories__card--far-prev',
          'stories__card--far-next'
        );
      });

      // Assign positions relative to active
      var prevIdx = wrapIndex(activeIndex - 1);
      var nextIdx = wrapIndex(activeIndex + 1);
      var farPrevIdx = wrapIndex(activeIndex - 2);
      var farNextIdx = wrapIndex(activeIndex + 2);

      storyCards[activeIndex].classList.add('stories__card--active');
      storyCards[prevIdx].classList.add('stories__card--prev');
      storyCards[nextIdx].classList.add('stories__card--next');
      if (totalStories > 3) {
        storyCards[farPrevIdx].classList.add('stories__card--far-prev');
      }
      if (totalStories > 4) {
        storyCards[farNextIdx].classList.add('stories__card--far-next');
      }

      // Update pagination
      if (storiesCurrent) storiesCurrent.textContent = activeIndex + 1;
    }

    function goToStory(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      activeIndex = wrapIndex(index);
      updateCarousel();
      setTimeout(function() { isTransitioning = false; }, 600);
    }

    // Initialize
    updateCarousel();

    // Arrow navigation
    storiesNext.addEventListener('click', function() {
      goToStory(activeIndex + 1);
      resetAutoplay();
    });

    storiesPrev.addEventListener('click', function() {
      goToStory(activeIndex - 1);
      resetAutoplay();
    });

    // Click on side cards to navigate
    storyCards.forEach(function(card) {
      card.addEventListener('click', function() {
        var idx = parseInt(card.getAttribute('data-index'), 10);
        if (idx !== activeIndex) {
          goToStory(idx);
          resetAutoplay();
        }
      });
    });

    // Auto-play
    function startAutoplay() {
      storiesAutoplay = setInterval(function() {
        goToStory(activeIndex + 1);
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(storiesAutoplay);
      startAutoplay();
    }

    startAutoplay();

    // Pause on hover
    storiesStage.addEventListener('mouseenter', function() {
      clearInterval(storiesAutoplay);
    });
    storiesStage.addEventListener('mouseleave', function() {
      startAutoplay();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      var rect = storiesStage.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') { goToStory(activeIndex + 1); resetAutoplay(); }
      if (e.key === 'ArrowLeft') { goToStory(activeIndex - 1); resetAutoplay(); }
    });

    // Touch swipe support
    var touchStartX = 0;
    var touchEndX = 0;
    storiesStage.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    storiesStage.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { goToStory(activeIndex + 1); }
        else { goToStory(activeIndex - 1); }
        resetAutoplay();
      }
    }, { passive: true });
  }

  // ============ ACTIVE SECTION ON SCROLL (Home only) ============
  var sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
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
  }

})();
