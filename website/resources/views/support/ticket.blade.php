<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Support Ticket - SHAREIDE</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Poppins', sans-serif; }
    </style>
</head>
<body class="bg-gray-100 min-h-screen">
    <!-- Header -->
    <header class="bg-gradient-to-r from-yellow-400 to-orange-500 py-4 shadow-lg">
        <div class="max-w-4xl mx-auto px-4">
            <h1 class="text-2xl font-bold text-black">SHAREIDE Support</h1>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8" id="app">
        <!-- Loading State -->
        <div id="loading" class="text-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading ticket...</p>
        </div>

        <!-- Error State -->
        <div id="error" class="hidden text-center py-20">
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-800 mb-2">Ticket Not Found</h2>
            <p class="text-gray-600">The ticket you're looking for doesn't exist or the link has expired.</p>
        </div>

        <!-- Ticket Content -->
        <div id="ticket-content" class="hidden">
            <!-- Ticket Header -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <span class="text-sm text-gray-500">Ticket</span>
                        <h2 class="text-xl font-bold text-gray-800" id="ticket-number"></h2>
                    </div>
                    <span id="ticket-status" class="px-3 py-1 rounded-full text-sm font-medium"></span>
                </div>
                <h3 class="text-lg font-semibold text-gray-700" id="ticket-subject"></h3>
                <p class="text-sm text-gray-500 mt-1" id="ticket-date"></p>
            </div>

            <!-- Messages -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Conversation</h3>
                <div id="messages" class="space-y-4 max-h-96 overflow-y-auto">
                    <!-- Messages will be loaded here -->
                </div>
            </div>

            <!-- Reply Form -->
            <div id="reply-section" class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Send a Reply</h3>
                <form id="reply-form">
                    <textarea id="reply-message" rows="4" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none" placeholder="Type your message here..."></textarea>
                    <div class="flex justify-end mt-4">
                        <button type="submit" id="submit-btn" class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                            Send Reply
                        </button>
                    </div>
                </form>
                <div id="reply-success" class="hidden mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                    <p class="font-medium">Reply sent successfully!</p>
                </div>
            </div>

            <!-- Closed Ticket Message -->
            <div id="closed-message" class="hidden bg-gray-50 rounded-xl p-6 text-center">
                <p class="text-gray-600">This ticket is closed. Please create a new support request if you need further assistance.</p>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-400 py-6 mt-8">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <p>&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</p>
        </div>
    </footer>

    <script>
        const token = '{{ $token }}';
        const apiBase = '/api';

        async function loadTicket() {
            try {
                const response = await fetch(`${apiBase}/support/ticket/${token}`);
                const data = await response.json();

                if (!data.success) {
                    showError();
                    return;
                }

                displayTicket(data.ticket);
            } catch (error) {
                console.error('Error loading ticket:', error);
                showError();
            }
        }

        function showError() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('error').classList.remove('hidden');
        }

        function displayTicket(ticket) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('ticket-content').classList.remove('hidden');

            document.getElementById('ticket-number').textContent = '#' + ticket.ticket_number;
            document.getElementById('ticket-subject').textContent = ticket.subject;
            document.getElementById('ticket-date').textContent = 'Created: ' + ticket.created_at;

            // Status badge
            const statusEl = document.getElementById('ticket-status');
            const statusColors = {
                'open': 'bg-yellow-100 text-yellow-800',
                'in_progress': 'bg-blue-100 text-blue-800',
                'waiting_response': 'bg-purple-100 text-purple-800',
                'resolved': 'bg-green-100 text-green-800',
                'closed': 'bg-gray-100 text-gray-800',
            };
            statusEl.className = `px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`;
            statusEl.textContent = ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Messages
            const messagesEl = document.getElementById('messages');
            messagesEl.innerHTML = ticket.messages.map(msg => `
                <div class="flex gap-3 ${msg.is_admin ? '' : 'flex-row-reverse'}">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${msg.is_admin ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-200'}">
                        <span class="${msg.is_admin ? 'text-white' : 'text-gray-600'} font-medium">${msg.sender.charAt(0)}</span>
                    </div>
                    <div class="flex-1 ${msg.is_admin ? '' : 'text-right'}">
                        <div class="${msg.is_admin ? 'bg-yellow-50' : 'bg-gray-50'} rounded-lg p-4 inline-block max-w-md ${msg.is_admin ? 'text-left' : 'text-left'}">
                            <p class="font-medium text-sm text-gray-700 mb-1">${msg.sender}</p>
                            <p class="text-gray-600">${msg.message}</p>
                            <p class="text-xs text-gray-400 mt-2">${msg.created_at}</p>
                        </div>
                    </div>
                </div>
            `).join('');

            // Show/hide reply section based on status
            if (['closed', 'resolved'].includes(ticket.status)) {
                document.getElementById('reply-section').classList.add('hidden');
                document.getElementById('closed-message').classList.remove('hidden');
            }
        }

        // Reply form submission
        document.getElementById('reply-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const message = document.getElementById('reply-message').value.trim();
            if (!message) {
                alert('Please enter a message');
                return;
            }

            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch(`${apiBase}/support/ticket/${token}/reply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('reply-message').value = '';
                    document.getElementById('reply-success').classList.remove('hidden');
                    setTimeout(() => {
                        document.getElementById('reply-success').classList.add('hidden');
                        loadTicket(); // Reload to show new message
                    }, 2000);
                } else {
                    alert(data.message || 'Failed to send reply');
                }
            } catch (error) {
                console.error('Error sending reply:', error);
                alert('Failed to send reply. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Reply';
            }
        });

        // Load ticket on page load
        loadTicket();
    </script>
</body>
</html>
