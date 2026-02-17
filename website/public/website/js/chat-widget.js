// SHAREIDE - Smart AI Chat Widget
// Rule-based chatbot with live chat escalation

(function() {

  var API_BASE_URL = window.SHAREIDE_API_URL || 'https://api.shareide.com/api';
  var STORAGE_KEY = 'shareide_support';

  // ============================================
  // BOT KNOWLEDGE BASE
  // ============================================
  var BOT_KNOWLEDGE = {
    categories: {
      booking: {
        keywords: ['booking', 'book', 'ride', 'trip', 'schedule', 'reserve', 'pickup', 'drop', 'destination', 'cancel ride', 'cancel booking'],
        subCategories: {
          cancel_ride: { keywords: ['cancel', 'cancellation', 'cancel ride', 'cancel booking', 'cancel my ride', 'cancel trip'] },
          no_driver: { keywords: ['no driver', 'driver not found', 'no one accepted', 'waiting for driver', 'can\'t find driver', 'no drivers available'] },
          wrong_location: { keywords: ['wrong location', 'wrong pickup', 'wrong address', 'wrong drop', 'wrong destination', 'location wrong'] },
          schedule_ride: { keywords: ['schedule', 'advance booking', 'book later', 'pre-book', 'book for tomorrow', 'future ride'] },
          ride_status: { keywords: ['ride status', 'where is my ride', 'track', 'eta', 'arrival time', 'how long'] }
        }
      },
      payment: {
        keywords: ['payment', 'pay', 'money', 'charge', 'charged', 'bill', 'receipt', 'wallet', 'refund', 'price', 'fare', 'cost', 'expensive', 'overcharge'],
        subCategories: {
          overcharge: { keywords: ['overcharge', 'overcharged', 'too much', 'extra charge', 'wrong amount', 'charged more', 'expensive'] },
          refund: { keywords: ['refund', 'money back', 'return money', 'get refund', 'want refund', 'refund please'] },
          wallet: { keywords: ['wallet', 'balance', 'top up', 'topup', 'add money', 'wallet balance', 'deposit'] },
          payment_failed: { keywords: ['payment failed', 'payment error', 'can\'t pay', 'payment issue', 'transaction failed', 'declined'] },
          receipt: { keywords: ['receipt', 'invoice', 'bill', 'fare breakdown', 'trip cost'] }
        }
      },
      driver: {
        keywords: ['driver', 'captain', 'rude', 'behavior', 'behaviour', 'complaint', 'unprofessional', 'rating', 'rate'],
        subCategories: {
          behavior: { keywords: ['rude', 'behavior', 'behaviour', 'unprofessional', 'abusive', 'bad driver', 'complaint about driver', 'misbehave'] },
          rating: { keywords: ['rating', 'rate', 'review', 'stars', 'give rating', 'rate driver'] },
          wrong_route: { keywords: ['wrong route', 'long route', 'longer route', 'detour', 'not following map'] },
          vehicle_issue: { keywords: ['vehicle', 'car condition', 'dirty car', 'ac not working', 'different car', 'wrong vehicle'] }
        }
      },
      app_bug: {
        keywords: ['app', 'bug', 'crash', 'error', 'not working', 'broken', 'glitch', 'freeze', 'stuck', 'loading', 'update'],
        subCategories: {
          crash: { keywords: ['crash', 'crashes', 'crashing', 'force close', 'app closes', 'keeps closing'] },
          login: { keywords: ['login', 'log in', 'can\'t login', 'otp', 'verification', 'code not received', 'sms not coming'] },
          gps: { keywords: ['gps', 'location', 'map', 'not showing location', 'location wrong', 'gps not working'] },
          loading: { keywords: ['loading', 'stuck', 'freeze', 'not loading', 'slow', 'taking too long', 'spinning'] },
          update: { keywords: ['update', 'latest version', 'new version', 'update app', 'outdated'] }
        }
      },
      safety: {
        keywords: ['safety', 'safe', 'emergency', 'sos', 'accident', 'unsafe', 'danger', 'harass', 'threat'],
        subCategories: {
          emergency: { keywords: ['emergency', 'sos', 'accident', 'danger', 'help me', 'immediate', 'urgent help'] },
          harassment: { keywords: ['harass', 'harassment', 'threat', 'threaten', 'uncomfortable', 'inappropriate', 'unsafe'] },
          lost_item: { keywords: ['lost', 'left', 'forgot', 'forgotten', 'lost item', 'left phone', 'left bag', 'belongings'] }
        }
      },
      account: {
        keywords: ['account', 'profile', 'password', 'email', 'phone number', 'delete account', 'deactivate', 'settings'],
        subCategories: {
          update_info: { keywords: ['change phone', 'change email', 'update profile', 'change name', 'edit profile'] },
          delete_account: { keywords: ['delete account', 'deactivate', 'remove account', 'close account'] },
          verification: { keywords: ['verify', 'verification', 'cnic', 'identity', 'documents', 'kyc'] }
        }
      }
    },

    responses: {
      'booking.cancel_ride': 'To cancel a ride:\n\n1. Open the SHAREIDE app\n2. Go to your active ride\n3. Tap "Cancel Ride"\n4. Select a reason\n\nNote: Cancellation after driver acceptance may incur a small fee. Free cancellation is available within 2 minutes of booking.',

      'booking.no_driver': 'If no driver is accepting your ride:\n\n1. Check if your pickup location is accessible\n2. Try adjusting the pickup point slightly\n3. Wait a few more minutes - drivers are being notified\n4. Try booking again during peak hours more drivers are available\n\nIf the problem persists, try using the ride bidding feature for faster matching.',

      'booking.wrong_location': 'For wrong pickup/drop location:\n\n1. You can change the destination during the ride from the app\n2. If the ride hasn\'t started, cancel and rebook with the correct location\n3. Contact the driver directly through the in-app chat to coordinate\n\nFor location accuracy, make sure GPS is enabled and you\'re in an open area.',

      'booking.schedule_ride': 'To schedule a ride in advance:\n\n1. Open SHAREIDE app\n2. Set your pickup and drop location\n3. Tap "Schedule for Later"\n4. Select date and time\n5. Confirm your booking\n\nYou can schedule rides up to 7 days in advance. You\'ll receive a reminder 30 minutes before your ride.',

      'booking.ride_status': 'To check your ride status:\n\n1. Open the SHAREIDE app\n2. Your active ride appears on the home screen\n3. You can see the driver\'s live location and ETA\n\nYou\'ll also receive push notifications for ride updates.',

      'payment.overcharge': 'If you believe you were overcharged:\n\n1. Check your ride receipt in the app (Ride History > Trip Details)\n2. Verify the fare breakdown including distance, time, and surge pricing\n3. If the charge is incorrect, you can dispute it through the app\n\nWe take overcharging seriously. Let me create a support ticket for our team to review your case.',

      'payment.refund': 'For refund requests:\n\n1. Go to Ride History in the app\n2. Select the trip\n3. Tap "Report an Issue"\n4. Choose "Request Refund"\n\nRefunds are typically processed within 3-5 business days. The amount will be credited to your original payment method or SHAREIDE Wallet.',

      'payment.wallet': 'SHAREIDE Wallet information:\n\n1. To add money: Go to Wallet > Top Up > Select amount\n2. Payment methods: Bank transfer, credit/debit card, or mobile wallet\n3. Wallet balance can be used for all rides\n4. Promotional credits are automatically applied\n\nFor wallet issues, make sure your payment method is up to date.',

      'payment.payment_failed': 'If your payment failed:\n\n1. Check your internet connection\n2. Verify your card/account has sufficient balance\n3. Try a different payment method\n4. Clear app cache and try again\n\nIf the amount was deducted but the ride shows unpaid, it will be automatically reversed within 24-48 hours.',

      'payment.receipt': 'To get your ride receipt:\n\n1. Go to Ride History in the app\n2. Select the completed trip\n3. Tap "View Receipt"\n4. You can download or email the receipt\n\nReceipts are also sent to your registered email after each ride.',

      'driver.behavior': 'We\'re sorry about your experience. Driver behavior complaints are taken very seriously.\n\nI\'ll need to create a support ticket so our safety team can investigate and take appropriate action against the driver. This may include warnings, suspension, or permanent removal from the platform.',

      'driver.rating': 'To rate your driver:\n\n1. After the ride ends, a rating screen appears automatically\n2. Select stars (1-5) and add comments\n3. You can also rate later from Ride History\n\nYour feedback helps maintain service quality and is anonymous to drivers.',

      'driver.wrong_route': 'If your driver took a wrong/longer route:\n\n1. The fare is calculated based on estimated distance, not actual route taken\n2. If the fare seems too high, check the trip details in Ride History\n3. You can report the issue and request a fare adjustment\n\nWant me to create a support ticket for a fare review?',

      'driver.vehicle_issue': 'For vehicle condition complaints:\n\n1. Rate the ride and mention vehicle issues in your feedback\n2. For safety concerns (no seatbelts, broken lights), report immediately\n3. If the vehicle doesn\'t match the app info, you can cancel without a fee\n\nWould you like to report this for our quality team to investigate?',

      'app_bug.crash': 'If the app is crashing:\n\n1. Make sure you have the latest version installed\n2. Clear app cache: Settings > Apps > SHAREIDE > Clear Cache\n3. Restart your phone\n4. Uninstall and reinstall the app\n\nIf the issue persists, please note your phone model and Android/iOS version so we can investigate.',

      'app_bug.login': 'For login issues:\n\n1. Check that you\'re using the correct phone number\n2. Make sure you have network connectivity\n3. Wait 60 seconds before requesting a new OTP\n4. Check SMS filters/blocked messages\n5. Try the WhatsApp OTP option if available\n\nIf OTP is still not arriving, it may be a carrier issue. Try on WiFi calling.',

      'app_bug.gps': 'For GPS/location issues:\n\n1. Enable GPS/Location Services on your phone\n2. Set location permission to "Always" or "While Using"\n3. Go to an open area for better GPS signal\n4. Turn on WiFi for improved location accuracy\n5. Restart the app',

      'app_bug.loading': 'If the app is loading slowly:\n\n1. Check your internet connection (WiFi or mobile data)\n2. Close other apps running in the background\n3. Clear app cache\n4. Update to the latest version\n\nIf speeds are slow during peak hours, please try again in a few minutes.',

      'app_bug.update': 'To update the SHAREIDE app:\n\n1. Go to Google Play Store (Android) or App Store (iOS)\n2. Search for "SHAREIDE"\n3. Tap "Update" if available\n\nWe recommend enabling auto-updates for the best experience.',

      'safety.emergency': 'For emergencies:\n\n1. Use the SOS button in the app immediately\n2. Call local emergency services (1122 / 15)\n3. Share your live location with trusted contacts\n\nYour safety is our top priority. I\'m creating an urgent support ticket right now.',

      'safety.harassment': 'We take harassment complaints very seriously.\n\nPlease let me create a support ticket immediately. Our safety team will:\n1. Investigate the incident\n2. Take action against the reported person\n3. Follow up with you within 24 hours\n\nIf you feel unsafe right now, please call emergency services.',

      'safety.lost_item': 'For lost items:\n\n1. Go to Ride History > Select the trip\n2. Tap "I lost an item"\n3. We\'ll contact the driver on your behalf\n4. You can also call the driver directly (available for 24 hours after the ride)\n\nMost items are recovered within 24 hours. A small delivery fee may apply.',

      'account.update_info': 'To update your account info:\n\n1. Open the app > Profile\n2. Tap "Edit Profile"\n3. Update your name, email, or photo\n\nTo change your phone number, go to Settings > Change Phone Number. You\'ll need to verify the new number with an OTP.',

      'account.delete_account': 'To delete your account:\n\n1. Go to Settings > Account > Delete Account\n2. You\'ll need to confirm your identity\n3. All ride history and data will be permanently removed\n4. Wallet balance should be withdrawn first\n\nAccount deletion is permanent and cannot be reversed.',

      'account.verification': 'For account verification:\n\n1. Go to Profile > Verification\n2. Upload required documents (CNIC front/back)\n3. Take a selfie for identity verification\n4. Wait for review (usually 24-48 hours)\n\nVerified accounts get priority matching and higher trust scores.'
    },

    // Phrases that trigger immediate escalation
    escalationTriggers: [
      'talk to human', 'real person', 'talk to agent', 'live chat',
      'talk to someone', 'human please', 'agent please', 'real agent',
      'speak to someone', 'representative', 'customer service', 'support agent',
      'connect me', 'transfer me', 'escalate', 'not helpful', 'useless bot'
    ],

    // Categories that auto-escalate to ticket (always create ticket)
    autoEscalateCategories: [
      'payment.overcharge', 'driver.behavior', 'safety.emergency', 'safety.harassment'
    ],

    // Category mapping to DB values
    categoryToDb: {
      booking: 'ride_issue',
      payment: 'payment',
      driver: 'driver_behavior',
      app_bug: 'app_bug',
      safety: 'other',
      account: 'account',
      general: 'other'
    },

    // Priority mapping
    categoryPriority: {
      'safety.emergency': 'urgent',
      'safety.harassment': 'urgent',
      'payment.overcharge': 'high',
      'driver.behavior': 'high'
    }
  };

  // ============================================
  // CHAT STATE
  // ============================================
  var CHAT_STATE = {
    phase: 'bot', // bot | collecting_info | live_chat
    conversationHistory: [],
    detectedCategory: null,
    detectedSubCategory: null,
    awaitingInput: null, // null | collect_name | collect_email | collect_phone
    userInfo: { name: '', email: '', phone: '' },
    faqShown: false,
    ticketData: null, // stored ticket after creation
    lastMessageId: 0 // track last message ID for incremental polling
  };

  // ============================================
  // HELPERS
  // ============================================
  function getStoredTicket() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
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

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ============================================
  // CLASSIFIER
  // ============================================
  function classifyMessage(text) {
    var lower = text.toLowerCase().trim();
    var bestCategory = null;
    var bestSubCategory = null;
    var bestScore = 0;

    // Check escalation triggers first
    for (var i = 0; i < BOT_KNOWLEDGE.escalationTriggers.length; i++) {
      if (lower.indexOf(BOT_KNOWLEDGE.escalationTriggers[i]) !== -1) {
        return { category: 'escalate', subCategory: null, score: 100 };
      }
    }

    var categories = BOT_KNOWLEDGE.categories;
    for (var catKey in categories) {
      var cat = categories[catKey];
      var catScore = 0;

      // Score main category keywords
      for (var k = 0; k < cat.keywords.length; k++) {
        if (lower.indexOf(cat.keywords[k]) !== -1) {
          catScore += cat.keywords[k].split(' ').length * 2;
        }
      }

      if (catScore > 0) {
        // Score sub-categories
        var bestSub = null;
        var bestSubScore = 0;

        for (var subKey in cat.subCategories) {
          var sub = cat.subCategories[subKey];
          var subScore = 0;
          for (var s = 0; s < sub.keywords.length; s++) {
            if (lower.indexOf(sub.keywords[s]) !== -1) {
              subScore += sub.keywords[s].split(' ').length * 3;
            }
          }
          if (subScore > bestSubScore) {
            bestSubScore = subScore;
            bestSub = subKey;
          }
        }

        var totalScore = catScore + bestSubScore;
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestCategory = catKey;
          bestSubCategory = bestSub;
        }
      }
    }

    return {
      category: bestCategory,
      subCategory: bestSubCategory,
      score: bestScore
    };
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
    var contactInfoForm = document.getElementById('contactInfoForm');
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

    // ============================================
    // UI HELPERS
    // ============================================
    function scrollToBottom() {
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }

    function addMessage(text, type, time, senderName) {
      if (!chatMessages) return;
      var div = document.createElement('div');
      div.className = 'chat-message chat-message--' + type;
      var html = '';
      if (senderName && type === 'bot') {
        html += '<span class="chat-sender">' + escapeHtml(senderName) + '</span>';
      }
      html += '<p>' + escapeHtml(text) + '</p>';
      if (time) html += '<span class="chat-time">' + escapeHtml(time) + '</span>';
      div.innerHTML = html;
      chatMessages.appendChild(div);
      scrollToBottom();

      // Track conversation
      CHAT_STATE.conversationHistory.push({ role: type === 'user' ? 'user' : 'bot', text: text });
    }

    function addBotHtml(html) {
      if (!chatMessages) return;
      var div = document.createElement('div');
      div.className = 'chat-message chat-message--bot';
      div.innerHTML = '<p>' + html + '</p>';
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

    function addBotMessageWithDelay(text, callback) {
      showTypingIndicator();
      setTimeout(function() {
        hideTypingIndicator();
        addMessage(text, 'bot');
        if (callback) callback();
      }, 800 + Math.random() * 600);
    }

    function addBotHtmlWithDelay(html, callback) {
      showTypingIndicator();
      setTimeout(function() {
        hideTypingIndicator();
        addBotHtml(html);
        CHAT_STATE.conversationHistory.push({ role: 'bot', text: '(quick options shown)' });
        if (callback) callback();
      }, 800 + Math.random() * 600);
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

      // Show agent bar
      if (agentBar) {
        agentBar.style.display = 'flex';
        if (agentAvatar) agentAvatar.textContent = agent.initial || agent.name.charAt(0).toUpperCase();
        if (agentNameEl) agentNameEl.textContent = agent.name;
      }

      // Update header
      if (chatHeaderName) chatHeaderName.textContent = agent.name;
      if (chatHeaderStatus) {
        chatHeaderStatus.innerHTML = '<span class="online-dot"></span> Support Agent';
      }
    }

    function hideAgentProfile() {
      currentAgent = null;
      if (agentBar) agentBar.style.display = 'none';
      if (chatHeaderName) chatHeaderName.textContent = 'SHAREIDE Support';
      if (chatHeaderStatus) {
        chatHeaderStatus.innerHTML = '<span class="online-dot"></span> Online';
      }
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
    // BOT PHASE LOGIC
    // ============================================
    function showBotGreeting() {
      chatMessages.innerHTML = '';
      CHAT_STATE.conversationHistory = [];
      CHAT_STATE.phase = 'bot';
      CHAT_STATE.detectedCategory = null;
      CHAT_STATE.detectedSubCategory = null;
      CHAT_STATE.faqShown = false;
      CHAT_STATE.awaitingInput = null;

      if (contactInfoForm) contactInfoForm.style.display = 'none';
      if (chatMessages) chatMessages.style.display = 'block';
      if (chatForm) chatForm.style.display = 'flex';
      if (newTicketBtn) newTicketBtn.style.display = 'none';
      hideAgentProfile();
      enableInput();
      setInputPlaceholder('Type your question...');

      addBotMessageWithDelay('Hi there! I\'m SHAREIDE\'s virtual assistant. How can I help you today?', function() {
        showQuickReplies([
          { label: 'Booking Issue', value: 'I have a booking issue' },
          { label: 'Payment Help', value: 'I need help with payment' },
          { label: 'Driver Complaint', value: 'I have a driver complaint' },
          { label: 'App Problem', value: 'The app is not working' }
        ]);
      });
    }

    function handleBotPhase(text) {
      var result = classifyMessage(text);

      // Escalation requested
      if (result.category === 'escalate') {
        addBotMessageWithDelay('Of course! Let me connect you with our support team. I\'ll need a few details first.', function() {
          startInfoCollection();
        });
        return;
      }

      // No match found
      if (!result.category || result.score < 2) {
        hideQuickReplies();
        addBotMessageWithDelay('I\'m not sure I understood that. Could you tell me more about your issue? You can also choose from these topics:', function() {
          showQuickReplies([
            { label: 'Booking', value: 'I have a booking issue' },
            { label: 'Payment', value: 'I need help with payment' },
            { label: 'Driver', value: 'I have a driver complaint' },
            { label: 'App Bug', value: 'The app is not working' }
          ]);
        });
        return;
      }

      CHAT_STATE.detectedCategory = result.category;
      CHAT_STATE.detectedSubCategory = result.subCategory;

      var responseKey = result.category + '.' + result.subCategory;

      // Check if this is an auto-escalate category
      if (BOT_KNOWLEDGE.autoEscalateCategories.indexOf(responseKey) !== -1) {
        hideQuickReplies();
        var response = BOT_KNOWLEDGE.responses[responseKey];
        if (response) {
          addBotMessageWithDelay(response, function() {
            addBotMessageWithDelay('I\'m creating a support ticket for this right away. I\'ll need a few details.', function() {
              startInfoCollection();
            });
          });
        } else {
          addBotMessageWithDelay('This needs immediate attention from our team. Let me connect you with support.', function() {
            startInfoCollection();
          });
        }
        return;
      }

      // Have a sub-category match with FAQ
      if (result.subCategory && BOT_KNOWLEDGE.responses[responseKey]) {
        hideQuickReplies();
        CHAT_STATE.faqShown = true;
        addBotMessageWithDelay(BOT_KNOWLEDGE.responses[responseKey], function() {
          showQuickReplies([
            { label: 'Yes, this helped!', value: '_faq_resolved', variant: 'confirm' },
            { label: 'No, I need more help', value: '_faq_not_resolved', variant: 'danger' },
            { label: 'Talk to support', value: '_escalate', variant: 'escalate' }
          ]);
        });
        return;
      }

      // Category matched but no specific sub-category — show sub-options
      hideQuickReplies();
      var subOptions = getSubCategoryOptions(result.category);
      if (subOptions.length > 0) {
        addBotMessageWithDelay('I see you need help with ' + formatCategoryName(result.category) + '. Can you be more specific?', function() {
          showQuickReplies(subOptions);
        });
      } else {
        addBotMessageWithDelay('I understand you need help with ' + formatCategoryName(result.category) + '. Let me connect you with our team for detailed assistance.', function() {
          startInfoCollection();
        });
      }
    }

    function getSubCategoryOptions(category) {
      var cat = BOT_KNOWLEDGE.categories[category];
      if (!cat || !cat.subCategories) return [];

      var labels = {
        cancel_ride: 'Cancel a Ride',
        no_driver: 'No Driver Found',
        wrong_location: 'Wrong Location',
        schedule_ride: 'Schedule Ride',
        ride_status: 'Ride Status',
        overcharge: 'Overcharged',
        refund: 'Need Refund',
        wallet: 'Wallet Issue',
        payment_failed: 'Payment Failed',
        receipt: 'Get Receipt',
        behavior: 'Driver Behavior',
        rating: 'Rate Driver',
        wrong_route: 'Wrong Route',
        vehicle_issue: 'Vehicle Problem',
        crash: 'App Crashing',
        login: 'Can\'t Login',
        gps: 'GPS Issues',
        loading: 'App Slow/Stuck',
        update: 'App Update',
        emergency: 'Emergency',
        harassment: 'Harassment',
        lost_item: 'Lost Item',
        update_info: 'Update Info',
        delete_account: 'Delete Account',
        verification: 'Verification'
      };

      var options = [];
      for (var subKey in cat.subCategories) {
        options.push({
          label: labels[subKey] || subKey.replace(/_/g, ' '),
          value: 'I need help with ' + (labels[subKey] || subKey.replace(/_/g, ' ')).toLowerCase()
        });
      }

      // Max 4 quick buttons
      if (options.length > 4) {
        options = options.slice(0, 3);
        options.push({ label: 'Something else', value: '_escalate', variant: 'escalate' });
      }

      return options;
    }

    function formatCategoryName(cat) {
      var names = {
        booking: 'ride booking',
        payment: 'payments',
        driver: 'a driver issue',
        app_bug: 'app problems',
        safety: 'safety',
        account: 'your account'
      };
      return names[cat] || cat;
    }

    function handleFaqResponse(text) {
      if (text === '_faq_resolved') {
        hideQuickReplies();
        addBotMessageWithDelay('Great! Glad I could help. Is there anything else I can assist you with?', function() {
          showQuickReplies([
            { label: 'Yes, another question', value: '_new_question' },
            { label: 'No, I\'m good', value: '_done', variant: 'confirm' }
          ]);
        });
        return true;
      }

      if (text === '_faq_not_resolved' || text === '_escalate') {
        hideQuickReplies();
        addBotMessageWithDelay('No worries! Let me connect you with our support team for personalized help. I\'ll need a few details.', function() {
          startInfoCollection();
        });
        return true;
      }

      if (text === '_new_question') {
        hideQuickReplies();
        CHAT_STATE.faqShown = false;
        CHAT_STATE.detectedCategory = null;
        CHAT_STATE.detectedSubCategory = null;
        addBotMessageWithDelay('Sure! What else can I help you with?', function() {
          showQuickReplies([
            { label: 'Booking Issue', value: 'I have a booking issue' },
            { label: 'Payment Help', value: 'I need help with payment' },
            { label: 'Driver Complaint', value: 'I have a driver complaint' },
            { label: 'App Problem', value: 'The app is not working' }
          ]);
        });
        return true;
      }

      if (text === '_done') {
        hideQuickReplies();
        addBotMessageWithDelay('Thank you for using SHAREIDE! Have a great day. You can reopen this chat anytime.');
        disableInput();
        setInputPlaceholder('Chat ended. Click "New" to start over.');
        if (newTicketBtn) newTicketBtn.style.display = 'block';
        return true;
      }

      return false;
    }

    // ============================================
    // INFO COLLECTION PHASE
    // ============================================
    function startInfoCollection() {
      CHAT_STATE.phase = 'collecting_info';
      CHAT_STATE.awaitingInput = 'collect_name';
      hideQuickReplies();
      setInputPlaceholder('Enter your full name...');
      addBotMessageWithDelay('What\'s your name?');
    }

    function handleInfoCollection(text) {
      if (CHAT_STATE.awaitingInput === 'collect_name') {
        if (text.trim().length < 2) {
          addBotMessageWithDelay('Please enter a valid name (at least 2 characters).');
          return;
        }
        CHAT_STATE.userInfo.name = text.trim();
        CHAT_STATE.awaitingInput = 'collect_email';
        setInputPlaceholder('Enter your email address...');
        addBotMessageWithDelay('Thanks, ' + escapeHtml(CHAT_STATE.userInfo.name) + '! What\'s your email address?');
        return;
      }

      if (CHAT_STATE.awaitingInput === 'collect_email') {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text.trim())) {
          addBotMessageWithDelay('That doesn\'t look like a valid email. Please try again.');
          return;
        }
        CHAT_STATE.userInfo.email = text.trim();
        CHAT_STATE.awaitingInput = 'collect_phone';
        setInputPlaceholder('Enter phone (or type "skip")...');
        addBotMessageWithDelay('And your phone number? (You can type "skip" if you prefer not to share)');
        return;
      }

      if (CHAT_STATE.awaitingInput === 'collect_phone') {
        if (text.trim().toLowerCase() === 'skip' || text.trim() === '') {
          CHAT_STATE.userInfo.phone = '';
        } else {
          CHAT_STATE.userInfo.phone = text.trim();
        }
        CHAT_STATE.awaitingInput = null;

        // Create the ticket
        hideQuickReplies();
        addBotMessageWithDelay('Perfect! Creating your support ticket now...', function() {
          createTicket();
        });
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
      if (CHAT_STATE.detectedCategory && CHAT_STATE.detectedSubCategory) {
        var labels = {
          'booking.cancel_ride': 'Ride Cancellation Issue',
          'booking.no_driver': 'No Driver Available',
          'booking.wrong_location': 'Wrong Location Issue',
          'booking.schedule_ride': 'Scheduled Ride Issue',
          'booking.ride_status': 'Ride Status Inquiry',
          'payment.overcharge': 'Overcharge Complaint',
          'payment.refund': 'Refund Request',
          'payment.wallet': 'Wallet Issue',
          'payment.payment_failed': 'Payment Failed',
          'payment.receipt': 'Receipt Request',
          'driver.behavior': 'Driver Behavior Complaint',
          'driver.rating': 'Driver Rating Issue',
          'driver.wrong_route': 'Wrong Route Complaint',
          'driver.vehicle_issue': 'Vehicle Condition Issue',
          'app_bug.crash': 'App Crashing',
          'app_bug.login': 'Login Issue',
          'app_bug.gps': 'GPS Issue',
          'app_bug.loading': 'App Performance Issue',
          'app_bug.update': 'App Update Issue',
          'safety.emergency': 'Safety Emergency',
          'safety.harassment': 'Harassment Report',
          'safety.lost_item': 'Lost Item Report',
          'account.update_info': 'Account Update Request',
          'account.delete_account': 'Account Deletion Request',
          'account.verification': 'Verification Issue'
        };
        return labels[CHAT_STATE.detectedCategory + '.' + CHAT_STATE.detectedSubCategory] || 'Support Request (via Chatbot)';
      }
      return 'Support Request (via Chatbot)';
    }

    async function createTicket() {
      var transcript = buildConversationTranscript();
      var dbCategory = BOT_KNOWLEDGE.categoryToDb[CHAT_STATE.detectedCategory] || 'other';
      var priorityKey = CHAT_STATE.detectedCategory + '.' + CHAT_STATE.detectedSubCategory;
      var priority = BOT_KNOWLEDGE.categoryPriority[priorityKey] || 'medium';

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
            priority: priority,
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
        console.error('Ticket creation error:', error);
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

      addBotHtml(
        '<strong>Ticket #' + escapeHtml(String(ticketNumber)) + ' created!</strong>\n' +
        'Your conversation has been sent to our support team. ' +
        'An agent will respond here shortly.\n\n' +
        '<span class="live-badge"><span class="pulse-dot"></span> Live Chat Active</span>'
      );

      setInputPlaceholder('Type a message to support...');
      enableInput();
      if (newTicketBtn) newTicketBtn.style.display = 'block';

      startAutoRefresh();
      startActivityPing();
    }

    function resumeLiveChat() {
      if (!currentTicket || !currentTicket.token) return;

      CHAT_STATE.phase = 'live_chat';
      if (contactInfoForm) contactInfoForm.style.display = 'none';
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

          // Show agent profile if assigned
          if (data.ticket.agent) {
            showAgentProfile(data.ticket.agent);
          }

          data.ticket.messages.forEach(function(msg) {
            if (msg.is_admin) {
              addMessage(msg.message, 'bot', msg.created_at, msg.sender);
            } else {
              addMessage(msg.message, 'user', msg.created_at);
            }
            // Track last message ID for incremental polling
            if (msg.id) {
              CHAT_STATE.lastMessageId = msg.id;
            }
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
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }

    async function pollForNewMessages() {
      if (!currentTicket || !currentTicket.token) return;

      try {
        var url = API_BASE_URL + '/support/ticket/' + currentTicket.token + '/messages?after=' + CHAT_STATE.lastMessageId;
        var response = await fetch(url);
        var data = await response.json();

        if (!data.success) return;

        // Show/hide admin typing indicator
        showAdminTypingIndicator(data.admin_typing);

        // Check for ticket status changes
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

        // Append new messages
        if (data.messages && data.messages.length > 0) {
          hideAdminTypingIndicator();
          data.messages.forEach(function(msg) {
            if (msg.is_admin) {
              addMessage(msg.message, 'bot', msg.created_at, msg.sender);
            } else {
              addMessage(msg.message, 'user', msg.created_at);
            }
            if (msg.id) {
              CHAT_STATE.lastMessageId = msg.id;
            }
          });
        }
      } catch (error) {
        // Silently ignore poll errors
      }
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
        console.error('Send error:', error);
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
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }

    function startActivityPing() {
      if (activityInterval) clearInterval(activityInterval);
      pingActivity();
      activityInterval = setInterval(function() {
        pingActivity();
      }, 30000);
    }

    function stopActivityPing() {
      if (activityInterval) {
        clearInterval(activityInterval);
        activityInterval = null;
      }
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

      addMessage(text, 'user');
      hideQuickReplies();

      // Handle special internal commands
      if (text.charAt(0) === '_') {
        if (handleFaqResponse(text)) return;
      }

      switch (CHAT_STATE.phase) {
        case 'bot':
          // Check FAQ response buttons first
          if (CHAT_STATE.faqShown && handleFaqResponse(text)) return;
          handleBotPhase(text);
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
          guestTypingTimeout = setTimeout(function() {
            // Typing signal expires via cache TTL, no explicit stop needed
          }, 2000);
        }
      });
    }
  }

  // ============================================
  // BOOT
  // ============================================
  function initWhenReady() {
    setupChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initWhenReady, 100);
    });
  } else {
    setTimeout(initWhenReady, 100);
  }

})();
