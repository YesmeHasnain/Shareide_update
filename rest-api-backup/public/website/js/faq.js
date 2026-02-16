// SHAREIDE - FAQ Page JavaScript (Accordion + Search + Category Filter)

document.addEventListener('DOMContentLoaded', function() {

  // ============ FAQ ACCORDION ============
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = this.closest('.faq-item');
      var isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item').forEach(function(faq) {
        faq.classList.remove('active');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ============ FAQ SEARCH ============
  var searchInput = document.getElementById('faqSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var query = this.value.toLowerCase().trim();
      var items = document.querySelectorAll('.faq-item');

      items.forEach(function(item) {
        var question = item.querySelector('.faq-question').textContent.toLowerCase();
        var answer = item.querySelector('.faq-answer').textContent.toLowerCase();

        if (query === '' || question.includes(query) || answer.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      // Reset category filter to "All"
      document.querySelectorAll('.faq-cat-btn').forEach(function(btn) {
        btn.classList.remove('active');
      });
      var allBtn = document.querySelector('.faq-cat-btn[data-category="all"]');
      if (allBtn) allBtn.classList.add('active');
    });
  }

  // ============ FAQ CATEGORY FILTER ============
  document.querySelectorAll('.faq-cat-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var category = this.getAttribute('data-category');

      // Update active button
      document.querySelectorAll('.faq-cat-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      this.classList.add('active');

      // Clear search
      if (searchInput) searchInput.value = '';

      // Filter items
      document.querySelectorAll('.faq-item').forEach(function(item) {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
