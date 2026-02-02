<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') - SHAREIDE Admin</title>

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#FFD700',
                        'primary-dark': '#E6C200',
                        dark: {
                            100: '#252540',
                            200: '#1A1A2E',
                            300: '#16213E',
                            400: '#0F0F1A',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Google Fonts - Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Poppins', sans-serif; }

        /* Yellow Gradient Styles */
        .gradient-gold {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        }
        .gradient-gold-hover:hover {
            background: linear-gradient(135deg, #E6C200 0%, #E69500 100%);
        }
        .gradient-gold-light {
            background: linear-gradient(135deg, #FFE44D 0%, #FFD700 100%);
        }
        .gradient-gold-dark {
            background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
        }

        .sidebar-link.active {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            font-weight: 600;
        }
        .sidebar-link.active i {
            color: #000;
        }

        .btn-primary {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #E6C200 0%, #E69500 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }

        /* Custom Scrollbar - Dark Mode */
        .dark ::-webkit-scrollbar { width: 6px; }
        .dark ::-webkit-scrollbar-track { background: #1A1A2E; }
        .dark ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
            border-radius: 3px;
        }

        /* Custom Scrollbar - Light Mode */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
            border-radius: 3px;
        }

        /* Badge Gradient */
        .badge-gold {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        }

        /* ============================================
           SMOOTH ANIMATIONS & TRANSITIONS
           ============================================ */

        /* Global Smooth Transitions */
        * {
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Smooth Page Load Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
        }

        @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }

        /* Main Content Animation */
        main {
            animation: fadeIn 0.5s ease-out;
        }

        /* Card Animations */
        .animate-card {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
        }

        .animate-card:nth-child(1) { animation-delay: 0.1s; }
        .animate-card:nth-child(2) { animation-delay: 0.2s; }
        .animate-card:nth-child(3) { animation-delay: 0.3s; }
        .animate-card:nth-child(4) { animation-delay: 0.4s; }
        .animate-card:nth-child(5) { animation-delay: 0.5s; }
        .animate-card:nth-child(6) { animation-delay: 0.6s; }

        /* Sidebar Link Hover Effects */
        .sidebar-link {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .sidebar-link::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 3px;
            height: 100%;
            background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }

        .sidebar-link:hover::before,
        .sidebar-link.active::before {
            transform: scaleY(1);
        }

        .sidebar-link:hover {
            transform: translateX(5px);
        }

        .dark .sidebar-link:hover {
            background: rgba(255, 215, 0, 0.1) !important;
        }

        .sidebar-link:hover i {
            transform: scale(1.2);
            color: #FFD700;
        }

        /* Light mode sidebar link hover */
        :not(.dark) .sidebar-link:hover {
            background: #f3f4f6 !important;
        }

        .sidebar-link i {
            transition: all 0.3s ease;
        }

        /* Button Hover Effects */
        button, .btn, a.btn {
            transition: all 0.3s ease;
        }

        button:hover, .btn:hover {
            transform: translateY(-2px);
        }

        button:active, .btn:active {
            transform: translateY(0) scale(0.98);
        }

        /* Card Hover Effects */
        .hover-card {
            transition: all 0.3s ease;
        }

        .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        /* Stat Card Effects */
        .stat-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
        }

        .stat-card:hover::after {
            left: 100%;
        }

        .stat-card:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }

        /* Table Row Hover */
        tr {
            transition: all 0.2s ease;
        }

        tbody tr:hover {
            background: rgba(255, 215, 0, 0.05) !important;
            transform: scale(1.01);
        }

        /* Input Focus Effects */
        input, select, textarea {
            transition: all 0.3s ease;
        }

        input:focus, select:focus, textarea:focus {
            transform: scale(1.01);
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }

        /* Badge Pulse Animation */
        .badge-pulse {
            animation: pulse-glow 2s infinite;
        }

        /* Loading Skeleton */
        .skeleton {
            background: linear-gradient(90deg, #252540 25%, #2d2d4a 50%, #252540 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
        }

        /* Floating Animation for Icons */
        .float-icon {
            animation: bounce-subtle 2s ease-in-out infinite;
        }

        /* Dropdown Animation */
        [x-show] {
            transition: all 0.2s ease;
        }

        /* Smooth Scroll */
        html {
            scroll-behavior: smooth;
        }

        /* Header Gradient Animation */
        header.gradient-gold {
            background-size: 200% 200%;
            animation: gradientShift 5s ease infinite;
        }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        /* Notification Badge Bounce */
        .notification-badge {
            animation: bounce-subtle 1s ease-in-out infinite;
        }

        /* Profile Image Hover */
        .profile-hover {
            transition: all 0.3s ease;
        }

        .profile-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
        }

        /* Modal Backdrop */
        .modal-backdrop {
            backdrop-filter: blur(5px);
            animation: fadeIn 0.2s ease;
        }

        /* Success/Error Messages */
        .alert-message {
            animation: slideInRight 0.5s ease-out;
        }

        /* Ripple Effect for Buttons */
        .ripple {
            position: relative;
            overflow: hidden;
        }

        .ripple::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10%);
            background-repeat: no-repeat;
            background-position: 50%;
            transform: scale(10);
            opacity: 0;
            transition: transform 0.5s, opacity 0.5s;
        }

        .ripple:active::after {
            transform: scale(0);
            opacity: 1;
            transition: 0s;
        }

        /* Chart Container Animation */
        .chart-container {
            animation: scaleIn 0.6s ease-out;
        }

        /* Counter Animation */
        .counter {
            display: inline-block;
            transition: all 0.3s ease;
        }

        .counter:hover {
            transform: scale(1.1);
            color: #FFD700;
        }

        /* Tooltip Styling */
        [title] {
            position: relative;
        }

        /* Glass Morphism Effect */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Glow Effect on Hover */
        .glow-hover:hover {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }

        /* Stagger Animation for Lists */
        .stagger-item {
            animation: fadeInUp 0.4s ease-out forwards;
            opacity: 0;
        }

        .stagger-item:nth-child(1) { animation-delay: 0.05s; }
        .stagger-item:nth-child(2) { animation-delay: 0.1s; }
        .stagger-item:nth-child(3) { animation-delay: 0.15s; }
        .stagger-item:nth-child(4) { animation-delay: 0.2s; }
        .stagger-item:nth-child(5) { animation-delay: 0.25s; }
        .stagger-item:nth-child(6) { animation-delay: 0.3s; }
        .stagger-item:nth-child(7) { animation-delay: 0.35s; }
        .stagger-item:nth-child(8) { animation-delay: 0.4s; }
        .stagger-item:nth-child(9) { animation-delay: 0.45s; }
        .stagger-item:nth-child(10) { animation-delay: 0.5s; }

        /* Page Transition */
        .page-transition {
            animation: fadeIn 0.3s ease-out;
        }

        /* Icon Rotation on Hover */
        .icon-spin:hover i {
            animation: spin 0.5s ease;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Number Counter Animation */
        @keyframes countUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .count-up {
            animation: countUp 0.5s ease-out;
        }
    </style>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    @stack('styles')
</head>
<body class="bg-gray-100 dark:bg-dark-400" x-data="{
    sidebarOpen: true,
    darkMode: localStorage.getItem('darkMode') === 'true',
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
    }
}" x-init="$watch('darkMode', val => document.documentElement.classList.toggle('dark', val)); if(darkMode) document.documentElement.classList.add('dark')" :class="{ 'dark': darkMode }">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <aside :class="[sidebarOpen ? 'w-64' : 'w-20', darkMode ? 'bg-dark-200' : 'bg-white border-r border-gray-200']" class="shadow-xl transition-all duration-300 fixed h-full z-30 flex flex-col">
            <!-- Logo Section -->
            <div class="p-4 border-b" :class="darkMode ? 'border-dark-100' : 'border-gray-200'">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3" x-show="sidebarOpen">
                        <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-10 h-10 object-contain">
                        <div>
                            <h1 class="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">SHAREIDE</h1>
                            <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Admin Panel</p>
                        </div>
                    </div>
                    <img x-show="!sidebarOpen" src="{{ asset('images/logo/icon.png') }}" alt="S" class="w-10 h-10 object-contain mx-auto">
                    <button @click="sidebarOpen = !sidebarOpen"
                        class="p-2 rounded-lg transition-colors"
                        :class="darkMode ? 'hover:bg-dark-100 text-gray-400 hover:text-primary' : 'hover:bg-gray-100 text-gray-500 hover:text-primary'"
                        x-show="sidebarOpen">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="mt-4 px-3 flex-1 overflow-y-auto">
                <!-- Dashboard -->
                <a href="{{ route('admin.dashboard') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-th-large w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Dashboard</span>
                </a>

                <!-- Drivers -->
                <a href="{{ route('admin.drivers.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.drivers.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center">
                        <i class="fas fa-car w-6 text-lg"></i>
                        <span x-show="sidebarOpen" class="ml-3">Drivers</span>
                    </div>
                    @php $pendingCount = \App\Models\Driver::where('status', 'pending')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="pending-drivers" class="badge-gold text-black text-xs font-bold px-2 py-1 rounded-full {{ $pendingCount > 0 ? '' : 'hidden' }}">{{ $pendingCount }}</span>
                </a>

                <!-- Users -->
                <a href="{{ route('admin.users.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.users.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-users w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Users</span>
                </a>

                <!-- Rides -->
                <a href="{{ route('admin.rides.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.rides.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-route w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Rides</span>
                </a>

                <!-- Shared Rides / Carpooling -->
                <a href="{{ route('admin.shared-rides.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.shared-rides.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-user-friends w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Carpooling</span>
                </a>

                <!-- Chats -->
                <a href="{{ route('admin.chats.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.chats.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-comments w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Chats</span>
                </a>

                <!-- Payments -->
                <a href="{{ route('admin.payments.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.payments.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-wallet w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Payments</span>
                </a>

                <!-- Promo Codes -->
                <a href="{{ route('admin.promo-codes.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.promo-codes.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-ticket-alt w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Promo Codes</span>
                </a>

                <!-- SOS Alerts -->
                <a href="{{ route('admin.sos.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.sos.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle w-6 text-lg"></i>
                        <span x-show="sidebarOpen" class="ml-3">SOS Alerts</span>
                    </div>
                    @php $activeAlerts = \App\Models\SosAlert::where('status', 'active')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="sos-alerts" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse {{ $activeAlerts > 0 ? '' : 'hidden' }}">{{ $activeAlerts }}</span>
                </a>

                <!-- Reports -->
                <a href="{{ route('admin.reports.revenue') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.reports.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-chart-pie w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Reports</span>
                </a>

                <!-- Divider -->
                <div class="my-3 border-t" :class="darkMode ? 'border-dark-100' : 'border-gray-200'" x-show="sidebarOpen"></div>
                <p class="px-4 text-xs font-semibold uppercase mb-2" :class="darkMode ? 'text-gray-500' : 'text-gray-400'" x-show="sidebarOpen">Advanced</p>

                <!-- Analytics -->
                <a href="{{ route('admin.analytics.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.analytics.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-chart-line w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Analytics</span>
                </a>

                <!-- Live Map -->
                <a href="{{ route('admin.map.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.map.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-map-marked-alt w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Live Map</span>
                </a>

                <!-- Fare Management -->
                <a href="{{ route('admin.fare.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.fare.*') || request()->routeIs('admin.surge.*') || request()->routeIs('admin.commission.*') || request()->routeIs('admin.zone.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-calculator w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Fare Management</span>
                </a>

                <!-- Support Tickets -->
                <a href="{{ route('admin.support.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.support.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center">
                        <i class="fas fa-headset w-6 text-lg"></i>
                        <span x-show="sidebarOpen" class="ml-3">Support</span>
                    </div>
                    @php $openTickets = \App\Models\SupportTicket::where('status', 'open')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="open-tickets" class="badge-gold text-black text-xs font-bold px-2 py-1 rounded-full {{ $openTickets > 0 ? '' : 'hidden' }}">{{ $openTickets }}</span>
                </a>

                <!-- System Alerts -->
                <a href="{{ route('admin.alerts.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.alerts.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <div class="flex items-center">
                        <i class="fas fa-bell w-6 text-lg"></i>
                        <span x-show="sidebarOpen" class="ml-3">Alerts</span>
                    </div>
                    @php $unresolvedAlerts = \App\Models\SystemAlert::where('is_resolved', false)->where('severity', 'critical')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="critical-alerts" class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse {{ $unresolvedAlerts > 0 ? '' : 'hidden' }}">{{ $unresolvedAlerts }}</span>
                </a>

                <!-- Audit Logs -->
                <a href="{{ route('admin.audit.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.audit.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-history w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Audit Logs</span>
                </a>

                <!-- Loyalty & Rewards -->
                <a href="{{ route('admin.loyalty.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.loyalty.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-crown w-6 text-lg text-yellow-500"></i>
                    <span x-show="sidebarOpen" class="ml-3">Loyalty Program</span>
                </a>

                <!-- Admin Roles -->
                <a href="{{ route('admin.roles.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.roles.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-user-shield w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Admin Roles</span>
                </a>

                <!-- Divider -->
                <div class="my-3 border-t" :class="darkMode ? 'border-dark-100' : 'border-gray-200'" x-show="sidebarOpen"></div>

                <!-- Settings -->
                <a href="{{ route('admin.settings.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 rounded-xl mb-2 transition-all {{ request()->routeIs('admin.settings.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-300 hover:bg-dark-100' : 'text-gray-600 hover:bg-gray-100'">
                    <i class="fas fa-cog w-6 text-lg"></i>
                    <span x-show="sidebarOpen" class="ml-3">Settings</span>
                </a>
            </nav>

            <!-- Sidebar Footer -->
            <div class="p-4 border-t" :class="darkMode ? 'border-dark-100' : 'border-gray-200'" x-show="sidebarOpen">
                <a href="{{ route('admin.settings.profile') }}"
                    class="flex items-center space-x-3 rounded-xl p-2 -m-2 transition-colors"
                    :class="darkMode ? 'hover:bg-dark-100' : 'hover:bg-gray-100'">
                    @if(auth()->user()->profile_photo)
                        <div class="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-primary/50 shadow-lg flex-shrink-0">
                            <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                class="w-full h-full object-cover">
                        </div>
                    @else
                        <div class="w-11 h-11 gradient-gold rounded-xl flex items-center justify-center text-black font-bold shadow-lg flex-shrink-0">
                            {{ auth()->user()->initials }}
                        </div>
                    @endif
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ auth()->user()->name ?? 'Admin' }}</p>
                        <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ auth()->user()->email ?? '' }}</p>
                    </div>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <div :class="sidebarOpen ? 'ml-64' : 'ml-20'" class="flex-1 transition-all duration-300">
            <!-- Top Navbar -->
            <header class="shadow-lg sticky top-0 z-20 transition-all duration-300"
                :class="darkMode ? 'bg-dark-200 border-b border-dark-100' : 'bg-white border-b border-gray-200'">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <button @click="sidebarOpen = !sidebarOpen"
                            class="lg:hidden p-2 rounded-lg transition-colors"
                            :class="darkMode ? 'hover:bg-dark-100 text-gray-300' : 'hover:bg-gray-100 text-gray-700'">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                        <div>
                            <h2 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-gray-800'">@yield('title', 'Dashboard')</h2>
                            <p class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">@yield('subtitle', '')</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3">
                        <!-- Live Stats -->
                        <div class="hidden md:flex items-center space-x-4 mr-2">
                            <div class="flex items-center space-x-2 px-3 py-2 rounded-lg"
                                :class="darkMode ? 'bg-dark-100' : 'bg-gray-100'">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span data-count="online-drivers" class="text-sm font-medium"
                                    :class="darkMode ? 'text-gray-300' : 'text-gray-700'">{{ \App\Models\Driver::where('is_online', true)->count() }} Online</span>
                            </div>
                        </div>

                        <!-- Test Notification Button -->
                        <button onclick="ShareideRealtime.testNotification()"
                            class="p-2 rounded-lg transition-colors"
                            :class="darkMode ? 'bg-dark-100 hover:bg-dark-300 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'"
                            title="Test Notification">
                            <i class="fas fa-volume-up"></i>
                        </button>

                        <!-- Dark Mode Toggle Switch -->
                        <div class="flex items-center gap-2">
                            <i class="fas fa-sun text-sm" :class="darkMode ? 'text-gray-400' : 'text-yellow-500'"></i>
                            <button @click="toggleDarkMode()"
                                class="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
                                :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'">
                                <span class="absolute top-1 left-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs"
                                    :class="darkMode ? 'translate-x-7 bg-primary text-black' : 'translate-x-0 bg-white text-gray-600'">
                                    <i class="fas" :class="darkMode ? 'fa-moon' : 'fa-sun'" style="font-size: 10px;"></i>
                                </span>
                            </button>
                            <i class="fas fa-moon text-sm" :class="darkMode ? 'text-primary' : 'text-gray-400'"></i>
                        </div>

                        <!-- Notifications -->
                        <div x-data="{ open: false }" class="relative">
                            <button @click="open = !open"
                                class="p-2 rounded-lg transition-colors relative"
                                :class="darkMode ? 'bg-dark-100 hover:bg-dark-300 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'">
                                <i class="fas fa-bell"></i>
                                @php $totalNotifs = \App\Models\Driver::where('status', 'pending')->count() + (\App\Models\SosAlert::where('status', 'active')->count() ?? 0); @endphp
                                <span data-badge="header-notifications" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center {{ $totalNotifs > 0 ? '' : 'hidden' }}">{{ $totalNotifs }}</span>
                            </button>
                            <div x-show="open" @click.away="open = false" x-cloak
                                class="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-200 rounded-xl shadow-xl py-2 z-50 border border-gray-200 dark:border-dark-100">
                                <div class="px-4 py-3 border-b border-gray-100 dark:border-dark-100">
                                    <h3 class="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                                </div>
                                @if($pendingCount > 0)
                                    <a href="{{ route('admin.drivers.pending') }}" class="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                                        <p class="text-sm font-medium text-gray-800 dark:text-white">{{ $pendingCount }} Pending Driver(s)</p>
                                        <p class="text-xs text-gray-500">Waiting for approval</p>
                                    </a>
                                @else
                                    <div class="px-4 py-6 text-center">
                                        <i class="fas fa-check-circle text-3xl text-green-500 mb-2"></i>
                                        <p class="text-sm text-gray-500">All caught up!</p>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <!-- Profile Dropdown -->
                        <div x-data="{ open: false }" class="relative">
                            <button @click="open = !open"
                                class="flex items-center space-x-2 p-1.5 rounded-xl transition-colors"
                                :class="darkMode ? 'bg-dark-100 hover:bg-dark-300' : 'bg-gray-100 hover:bg-gray-200'">
                                @if(auth()->user()->profile_photo)
                                    <div class="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
                                        <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                            class="w-full h-full object-cover">
                                    </div>
                                @else
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm gradient-gold text-black">
                                        {{ auth()->user()->initials }}
                                    </div>
                                @endif
                                <span class="hidden md:block text-sm font-semibold pr-1"
                                    :class="darkMode ? 'text-gray-200' : 'text-gray-700'">{{ auth()->user()->name ?? 'Admin' }}</span>
                                <i class="fas fa-chevron-down text-xs pr-1"
                                    :class="darkMode ? 'text-gray-400' : 'text-gray-500'"></i>
                            </button>

                            <div x-show="open" @click.away="open = false" x-cloak
                                class="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-200 rounded-2xl shadow-2xl py-3 z-50 border border-gray-200 dark:border-dark-100">
                                <!-- Profile Header -->
                                <div class="px-4 pb-3 border-b border-gray-100 dark:border-dark-100">
                                    <div class="flex items-center gap-3">
                                        @if(auth()->user()->profile_photo)
                                            <div class="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                                                <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                                    class="w-full h-full object-cover">
                                            </div>
                                        @else
                                            <div class="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center text-black font-bold text-lg shadow-md flex-shrink-0">
                                                {{ auth()->user()->initials }}
                                            </div>
                                        @endif
                                        <div class="min-w-0">
                                            <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ auth()->user()->name ?? 'Admin' }}</p>
                                            <p class="text-xs text-gray-500 truncate">{{ auth()->user()->email ?? '' }}</p>
                                            <span class="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                {{ auth()->user()->adminRole->display_name ?? ucwords(str_replace('_', ' ', auth()->user()->adminRole->name ?? 'Admin')) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Menu Items -->
                                <div class="py-2">
                                    <a href="{{ route('admin.settings.profile') }}" class="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                                        <i class="fas fa-user w-5 text-gray-400"></i>
                                        <span class="ml-3">My Profile</span>
                                    </a>
                                    <a href="{{ route('admin.settings.index') }}" class="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors">
                                        <i class="fas fa-cog w-5 text-gray-400"></i>
                                        <span class="ml-3">Settings</span>
                                    </a>
                                </div>
                                <hr class="border-gray-100 dark:border-dark-100">
                                <div class="pt-2">
                                    <form action="{{ route('admin.logout') }}" method="POST">
                                        @csrf
                                        <button type="submit" class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <i class="fas fa-sign-out-alt w-5"></i>
                                            <span class="ml-3">Logout</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="p-6 dark:bg-dark-400 min-h-screen">
                @if(session('success'))
                    <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-between" x-data="{ show: true }" x-show="show">
                        <div class="flex items-center">
                            <i class="fas fa-check-circle mr-3 text-green-500"></i>
                            <span>{{ session('success') }}</span>
                        </div>
                        <button @click="show = false" class="text-green-700 dark:text-green-400">&times;</button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl flex items-center justify-between" x-data="{ show: true }" x-show="show">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle mr-3 text-red-500"></i>
                            <span>{{ session('error') }}</span>
                        </div>
                        <button @click="show = false" class="text-red-700 dark:text-red-400">&times;</button>
                    </div>
                @endif

                @if($errors->any())
                    <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                        <ul class="list-disc list-inside">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @yield('content')
            </main>

            <!-- Footer -->
            <footer class="bg-white dark:bg-dark-300 border-t border-gray-200 dark:border-dark-100 px-6 py-4">
                <div class="flex flex-col md:flex-row items-center justify-between">
                    <div class="flex items-center space-x-2 mb-2 md:mb-0">
                        <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-6 h-6 object-contain">
                        <span class="text-sm text-gray-500">&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</span>
                    </div>
                    <span class="text-sm text-gray-400">Version 1.0.0</span>
                </div>
            </footer>
        </div>
    </div>

    <!-- Notification Sound - Louder Alert Tone -->
    <audio id="notificationSound" preload="auto">
        <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg">
        <source src="https://www.soundjay.com/buttons/sounds/button-09a.mp3" type="audio/mpeg">
    </audio>

    <!-- Real-time Updates Script -->
    <script>
        // Real-time Dashboard Updates
        const ShareideRealtime = {
            lastCounts: {
                pendingDrivers: {{ \App\Models\Driver::where('status', 'pending')->count() }},
                activeAlerts: {{ \App\Models\SosAlert::where('status', 'active')->count() ?? 0 }},
                criticalAlerts: {{ \App\Models\SystemAlert::where('is_resolved', false)->where('severity', 'critical')->count() ?? 0 }},
                openTickets: {{ \App\Models\SupportTicket::where('status', 'open')->count() ?? 0 }},
                onlineDrivers: {{ \App\Models\Driver::where('is_online', true)->count() }}
            },
            pollingInterval: 10000, // 10 seconds
            notificationPermission: false,
            originalTitle: document.title,
            titleFlashInterval: null,

            init() {
                this.requestNotificationPermission();
                this.startPolling();
                this.setupVisibilityHandler();
                console.log('🚀 Shareide Real-time Dashboard initialized');
            },

            setupVisibilityHandler() {
                // Stop title flashing when user comes back to tab
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        this.stopTitleFlash();
                    }
                });
                window.addEventListener('focus', () => this.stopTitleFlash());
            },

            flashTitle(message) {
                if (this.titleFlashInterval) return; // Already flashing

                let isOriginal = true;
                this.titleFlashInterval = setInterval(() => {
                    document.title = isOriginal ? `🔔 ${message}` : this.originalTitle;
                    isOriginal = !isOriginal;
                }, 1000);
            },

            stopTitleFlash() {
                if (this.titleFlashInterval) {
                    clearInterval(this.titleFlashInterval);
                    this.titleFlashInterval = null;
                    document.title = this.originalTitle;
                }
            },

            async requestNotificationPermission() {
                if ('Notification' in window) {
                    const permission = await Notification.requestPermission();
                    this.notificationPermission = permission === 'granted';
                }
            },

            playNotificationSound() {
                const audio = document.getElementById('notificationSound');
                if (audio) {
                    audio.volume = 1.0; // Max volume
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.log('Audio play failed, using beep:', e);
                        this.beepMultiple(3); // Play beep 3 times
                    });
                } else {
                    this.beepMultiple(3);
                }
            },

            beepMultiple(times) {
                let count = 0;
                const playBeep = () => {
                    if (count < times) {
                        this.beep();
                        count++;
                        setTimeout(playBeep, 300);
                    }
                };
                playBeep();
            },

            beep() {
                try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    oscillator.frequency.value = 880; // Higher pitch
                    oscillator.type = 'square'; // Louder waveform
                    gainNode.gain.value = 0.5; // Louder volume

                    oscillator.start();
                    setTimeout(() => {
                        oscillator.stop();
                        audioCtx.close();
                    }, 250);
                } catch (e) {
                    console.log('Beep failed:', e);
                }
            },

            showBrowserNotification(title, body, icon = '🔔') {
                if (this.notificationPermission) {
                    const notification = new Notification(title, {
                        body: body,
                        icon: '/images/logo/icon.png',
                        badge: '/images/logo/icon.png',
                        tag: 'shareide-admin-' + Date.now(), // Unique tag for each notification
                        requireInteraction: true, // Don't auto-dismiss
                        silent: false, // Allow sound
                        vibrate: [200, 100, 200], // Vibration pattern
                    });

                    // Click to focus the admin tab
                    notification.onclick = function() {
                        window.focus();
                        notification.close();
                    };

                    // Auto close after 30 seconds if not interacted
                    setTimeout(() => notification.close(), 30000);
                }
            },

            async fetchUpdates() {
                try {
                    const response = await fetch('/admin/api/realtime-stats', {
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) return;

                    const data = await response.json();
                    this.processUpdates(data);
                } catch (error) {
                    console.log('Realtime fetch error:', error);
                }
            },

            processUpdates(data) {
                let hasNewData = false;
                let notifications = [];

                // Check pending drivers
                if (data.pendingDrivers > this.lastCounts.pendingDrivers) {
                    const newCount = data.pendingDrivers - this.lastCounts.pendingDrivers;
                    notifications.push(`${newCount} new driver application(s) pending!`);
                    hasNewData = true;
                }

                // Check active SOS alerts
                if (data.activeAlerts > this.lastCounts.activeAlerts) {
                    const newCount = data.activeAlerts - this.lastCounts.activeAlerts;
                    notifications.push(`🚨 ${newCount} new SOS alert(s)!`);
                    hasNewData = true;
                }

                // Check critical system alerts
                if (data.criticalAlerts > this.lastCounts.criticalAlerts) {
                    const newCount = data.criticalAlerts - this.lastCounts.criticalAlerts;
                    notifications.push(`⚠️ ${newCount} new critical alert(s)!`);
                    hasNewData = true;
                }

                // Check support tickets
                if (data.openTickets > this.lastCounts.openTickets) {
                    const newCount = data.openTickets - this.lastCounts.openTickets;
                    notifications.push(`📩 ${newCount} new support ticket(s)!`);
                    hasNewData = true;
                }

                // Update UI
                this.updateBadges(data);
                this.updateOnlineCount(data.onlineDrivers);

                // Play sound and show notification
                if (hasNewData) {
                    this.playNotificationSound();
                    this.showBrowserNotification(
                        '🚨 SHAREIDE Admin Alert',
                        notifications.join('\n')
                    );
                    this.showToast(notifications.join('<br>'));

                    // Flash title if tab is not focused
                    if (document.hidden) {
                        this.flashTitle('New Alert!');
                    }
                }

                // Update last counts
                this.lastCounts = { ...data };
            },

            updateBadges(data) {
                // Update pending drivers badge
                const driverBadges = document.querySelectorAll('[data-badge="pending-drivers"]');
                driverBadges.forEach(badge => {
                    if (data.pendingDrivers > 0) {
                        badge.textContent = data.pendingDrivers;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                });

                // Update SOS alerts badge
                const sosBadges = document.querySelectorAll('[data-badge="sos-alerts"]');
                sosBadges.forEach(badge => {
                    if (data.activeAlerts > 0) {
                        badge.textContent = data.activeAlerts;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                });

                // Update system alerts badge
                const alertBadges = document.querySelectorAll('[data-badge="critical-alerts"]');
                alertBadges.forEach(badge => {
                    if (data.criticalAlerts > 0) {
                        badge.textContent = data.criticalAlerts;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                });

                // Update support tickets badge
                const ticketBadges = document.querySelectorAll('[data-badge="open-tickets"]');
                ticketBadges.forEach(badge => {
                    if (data.openTickets > 0) {
                        badge.textContent = data.openTickets;
                        badge.classList.remove('hidden');
                    } else {
                        badge.classList.add('hidden');
                    }
                });

                // Update header notification badge
                const headerBadge = document.querySelector('[data-badge="header-notifications"]');
                if (headerBadge) {
                    const total = data.pendingDrivers + data.activeAlerts + data.criticalAlerts;
                    if (total > 0) {
                        headerBadge.textContent = total;
                        headerBadge.classList.remove('hidden');
                    } else {
                        headerBadge.classList.add('hidden');
                    }
                }
            },

            updateOnlineCount(count) {
                const onlineCountEl = document.querySelector('[data-count="online-drivers"]');
                if (onlineCountEl) {
                    onlineCountEl.textContent = count + ' Online';
                }
            },

            showToast(message, type = 'info') {
                // Create toast container if not exists
                let container = document.getElementById('toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'toast-container';
                    container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
                    container.style.cssText = 'pointer-events: none;';
                    document.body.appendChild(container);
                }

                const icons = {
                    info: 'fa-bell',
                    success: 'fa-check-circle',
                    warning: 'fa-exclamation-triangle',
                    error: 'fa-times-circle'
                };

                const colors = {
                    info: 'from-yellow-500 to-orange-500',
                    success: 'from-green-500 to-emerald-500',
                    warning: 'from-yellow-500 to-amber-500',
                    error: 'from-red-500 to-rose-500'
                };

                // Create toast
                const toast = document.createElement('div');
                toast.style.cssText = 'pointer-events: auto;';
                toast.className = `
                    bg-gradient-to-br from-gray-900 to-gray-800
                    text-white px-5 py-4 rounded-2xl
                    shadow-2xl border border-gray-700/50
                    transform translate-x-[120%]
                    transition-all duration-500 ease-out
                    max-w-sm backdrop-blur-xl
                    hover:scale-[1.02] hover:shadow-yellow-500/20
                `;
                toast.innerHTML = `
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-gradient-to-br ${colors[type]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                            <i class="fas ${icons[type]} text-white text-lg"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                                <p class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Live Update</p>
                            </div>
                            <p class="text-sm text-gray-300 leading-relaxed">${message}</p>
                            <p class="text-xs text-gray-500 mt-2">${new Date().toLocaleTimeString()}</p>
                        </div>
                        <button onclick="this.closest('[id^=toast]') ? this.closest('[id^=toast]').remove() : this.parentElement.parentElement.remove()"
                                class="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-shrink"></div>
                    </div>
                `;

                // Add shrink animation style
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .animate-shrink {
                        animation: shrink 8s linear forwards;
                    }
                `;
                if (!document.getElementById('toast-styles')) {
                    style.id = 'toast-styles';
                    document.head.appendChild(style);
                }

                container.appendChild(toast);

                // Animate in with spring effect
                requestAnimationFrame(() => {
                    toast.style.transform = 'translateX(0) scale(1)';
                    toast.style.opacity = '1';
                });

                // Auto remove after 8 seconds with fade out
                setTimeout(() => {
                    toast.style.transform = 'translateX(120%) scale(0.9)';
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 500);
                }, 8000);
            },

            startPolling() {
                setInterval(() => this.fetchUpdates(), this.pollingInterval);
            },

            // Test notification function
            testNotification() {
                this.playNotificationSound();
                this.showBrowserNotification(
                    '🔔 SHAREIDE Test Alert',
                    'Notifications are working! You will receive alerts for new drivers, SOS, tickets, etc.'
                );
                this.showToast('✅ Test notification sent! Check your desktop.');
                this.flashTitle('TEST ALERT!');
            }
        };

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => ShareideRealtime.init());

        // Auto trigger test notification after 3 seconds (one time only)
        setTimeout(() => {
            if (!sessionStorage.getItem('testNotifSent')) {
                ShareideRealtime.testNotification();
                sessionStorage.setItem('testNotifSent', 'true');
            }
        }, 3000);
    </script>

    @stack('scripts')
</body>
</html>
