// Common utility helper functions

/**
 * Format phone number to Pakistani format
 * @param {string} phone - Phone number (11 digits)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return cleaned;
};

/**
 * Format CNIC to standard format
 * @param {string} cnic - CNIC number
 * @returns {string} Formatted CNIC (XXXXX-XXXXXXX-X)
 */
export const formatCNIC = (text) => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length <= 5) {
    return cleaned;
  } else if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  } else {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  }
};

/**
 * Format currency in PKR
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount) return 'Rs. 0';
  return `Rs. ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time to readable format
 * @param {string} time - Time to format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  const d = new Date(time);
  return d.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate distance between two coordinates
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /\S+@\S+\.\S+/;
  return emailRegex.test(email);
};

/**
 * Validate Pakistani phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^0?3[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate CNIC format
 * @param {string} cnic - CNIC number
 * @returns {boolean} Is valid CNIC
 */
export const validateCNIC = (cnic) => {
  const cleaned = cnic.replace(/\D/g, '');
  return cleaned.length === 13;
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Delay execution (for async operations)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
