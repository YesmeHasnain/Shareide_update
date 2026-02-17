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
                        primary: {
                            DEFAULT: '#FCC014',
                            dark: '#E3AD12',
                            light: '#FDCE43',
                        },
                        secondary: {
                            DEFAULT: '#F5A623',
                            dark: '#E8930C',
                            light: '#FFB84D',
                        },
                        dark: {
                            100: '#252540',
                            200: '#1A1A2E',
                            300: '#16213E',
                            400: '#0F0F1A',
                        },
                        surface: '#F3F4F6',
                    },
                    fontFamily: {
                        sora: ['Sora', 'sans-serif'],
                    },
                    borderRadius: {
                        'xl': '12px',
                        '2xl': '20px',
                        '3xl': '28px',
                        'pill': '50px',
                    },
                    boxShadow: {
                        'soft': '0 4px 24px rgba(0,0,0,0.06)',
                        'medium': '0 12px 40px rgba(0,0,0,0.08)',
                        'heavy': '0 20px 60px rgba(0,0,0,0.1)',
                        'glow': '0 0 40px rgba(252,192,20,0.2)',
                        'glow-lg': '0 0 60px rgba(252,192,20,0.3)',
                        'card': '0 8px 30px rgba(0,0,0,0.04)',
                        'card-hover': '0 20px 40px rgba(0,0,0,0.08)',
                    }
                }
            }
        }
    </script>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Google Fonts - Sora (matching website) -->
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        [x-cloak] { display: none !important; }
        body { font-family: 'Sora', sans-serif; }

        /* ============================================
           WEBSITE-MATCHING DESIGN SYSTEM
           ============================================ */

        /* Primary Gradients */
        .gradient-gold {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
        }
        .gradient-gold-hover:hover {
            background: linear-gradient(135deg, #E3AD12 0%, #E8930C 100%);
        }
        .gradient-gold-light {
            background: linear-gradient(135deg, #FDCE43 0%, #FCC014 100%);
        }
        .gradient-gold-dark {
            background: linear-gradient(135deg, #F5A623 0%, #E8930C 100%);
        }
        .gradient-gold-text {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Sidebar */
        .sidebar-link.active {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
            color: #000;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(252, 192, 20, 0.35);
        }
        .sidebar-link.active i {
            color: #000;
        }

        /* Primary Button (Website-matching pill style) */
        .btn-primary {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
            color: #000;
            font-weight: 600;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: linear-gradient(135deg, #E3AD12 0%, #E8930C 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(252, 192, 20, 0.4);
        }

        /* Glass Button (Website-matching) */
        .btn-glass {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid #E5E7EB;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        .btn-glass:hover {
            background: #fff;
            border-color: #FCC014;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F8F9FC; }
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #FCC014 0%, #F5A623 100%);
            border-radius: 3px;
        }
        .dark ::-webkit-scrollbar-track { background: #0F0F1A; }

        /* Badge */
        .badge-gold {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
        }

        /* ============================================
           ANIMATIONS (Website-matching)
           ============================================ */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(252, 192, 20, 0.4); }
            50% { box-shadow: 0 0 25px rgba(252, 192, 20, 0.7); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Main Content Animation */
        main { animation: fadeIn 0.4s ease-out; }

        /* Card Animations */
        .animate-card {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
        }
        .animate-card:nth-child(1) { animation-delay: 0.05s; }
        .animate-card:nth-child(2) { animation-delay: 0.1s; }
        .animate-card:nth-child(3) { animation-delay: 0.15s; }
        .animate-card:nth-child(4) { animation-delay: 0.2s; }
        .animate-card:nth-child(5) { animation-delay: 0.25s; }
        .animate-card:nth-child(6) { animation-delay: 0.3s; }

        /* Sidebar Link Effects */
        .sidebar-link {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            border-radius: 12px;
        }
        .sidebar-link::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 3px;
            height: 100%;
            background: linear-gradient(180deg, #FCC014 0%, #F5A623 100%);
            transform: scaleY(0);
            transition: transform 0.3s ease;
            border-radius: 0 4px 4px 0;
        }
        .sidebar-link:hover::before,
        .sidebar-link.active::before {
            transform: scaleY(1);
        }
        .sidebar-link:hover {
            transform: translateX(4px);
        }
        .dark .sidebar-link:hover {
            background: rgba(252, 192, 20, 0.08) !important;
        }
        :not(.dark) .sidebar-link:hover {
            background: #F8F9FC !important;
        }
        .sidebar-link:hover i {
            transform: scale(1.15);
            color: #FCC014;
        }
        .sidebar-link i {
            transition: all 0.3s ease;
        }

        /* Card Hover Effects (Website-matching) */
        .hover-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #F0F0F3;
        }
        .hover-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 0 40px rgba(252, 192, 20, 0.1);
            border-color: rgba(252, 192, 20, 0.3);
        }
        .dark .hover-card {
            border-color: rgba(255, 255, 255, 0.06);
        }
        .dark .hover-card:hover {
            border-color: rgba(252, 192, 20, 0.3);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(252, 192, 20, 0.15);
        }

        /* Stat Card Effects */
        .stat-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
            transition: left 0.6s ease;
        }
        .stat-card:hover::after {
            left: 100%;
        }
        .stat-card:hover {
            transform: translateY(-4px) scale(1.01);
            box-shadow: 0 12px 35px rgba(252, 192, 20, 0.2);
        }

        /* Table Row Hover */
        tbody tr {
            transition: all 0.2s ease;
        }
        tbody tr:hover {
            background: rgba(252, 192, 20, 0.04) !important;
        }

        /* Input Focus Effects */
        input, select, textarea {
            transition: all 0.3s ease;
        }
        input:focus, select:focus, textarea:focus {
            box-shadow: 0 0 0 3px rgba(252, 192, 20, 0.15);
            border-color: #FCC014 !important;
        }

        /* Badge Pulse */
        .badge-pulse {
            animation: pulse-glow 2s infinite;
        }

        /* Loading Skeleton */
        .skeleton {
            background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
        }
        .dark .skeleton {
            background: linear-gradient(90deg, #252540 25%, #2d2d4a 50%, #252540 75%);
            background-size: 200% 100%;
        }

        /* Float Animation */
        .float-icon {
            animation: float 3s ease-in-out infinite;
        }

        /* Glass Morphism (Website-matching) */
        .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .dark .glass {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Glow Effect */
        .glow-hover:hover {
            box-shadow: 0 0 40px rgba(252, 192, 20, 0.3);
        }

        /* Stagger Animation */
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
        .page-transition { animation: fadeIn 0.3s ease-out; }

        /* Ripple Effect */
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
            background-image: radial-gradient(circle, rgba(252, 192, 20, 0.2) 10%, transparent 10%);
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

        /* Chart Container */
        .chart-container { animation: scaleIn 0.6s ease-out; }

        /* Counter */
        .counter {
            display: inline-block;
            transition: all 0.3s ease;
        }
        .counter:hover {
            transform: scale(1.05);
            color: #FCC014;
        }

        /* Notification Badge */
        .notification-badge {
            animation: float 2s ease-in-out infinite;
        }

        /* Profile Hover */
        .profile-hover { transition: all 0.3s ease; }
        .profile-hover:hover {
            transform: scale(1.03);
            box-shadow: 0 5px 20px rgba(252, 192, 20, 0.25);
        }

        /* Modal Backdrop */
        .modal-backdrop {
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease;
        }

        /* Alert Messages */
        .alert-message { animation: slideInRight 0.5s ease-out; }

        /* Smooth Scroll */
        html { scroll-behavior: smooth; }

        /* Button base */
        button, .btn, a.btn {
            transition: all 0.3s ease;
        }
        button:active, .btn:active {
            transform: translateY(0) scale(0.98);
        }

        /* Header glass effect on scroll */
        .header-glass {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .dark .header-glass {
            background: rgba(26, 26, 46, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
    </style>

    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    @stack('styles')
</head>
<body class="bg-[#F8F9FC] dark:bg-dark-400 font-sora" x-data="{
    sidebarOpen: true,
    darkMode: localStorage.getItem('darkMode') === 'true',
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
    }
}" x-init="$watch('darkMode', val => document.documentElement.classList.toggle('dark', val)); if(darkMode) document.documentElement.classList.add('dark')" :class="{ 'dark': darkMode }">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <aside :class="[sidebarOpen ? 'w-[270px]' : 'w-20']"
            class="fixed h-full z-30 flex flex-col transition-all duration-300"
            :style="darkMode ? 'background: #1A1A2E; border-right: 1px solid rgba(255,255,255,0.06);' : 'background: #fff; border-right: 1px solid #F0F0F3;'">

            <!-- Logo Section -->
            <div class="px-5 py-5 border-b" :class="darkMode ? 'border-white/5' : 'border-[#F0F0F3]'">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3" x-show="sidebarOpen">
                        <div class="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-md">
                            <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-8 h-8 object-contain">
                        </div>
                        <div>
                            <h1 class="text-lg font-bold gradient-gold-text tracking-tight">SHAREIDE</h1>
                            <p class="text-[11px] font-medium" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Admin Panel</p>
                        </div>
                    </div>
                    <div x-show="!sidebarOpen" class="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-secondary shadow-md mx-auto">
                        <img src="{{ asset('images/logo/icon.png') }}" alt="S" class="w-8 h-8 object-contain">
                    </div>
                    <button @click="sidebarOpen = !sidebarOpen"
                        class="p-2 rounded-xl transition-all duration-200"
                        :class="darkMode ? 'hover:bg-white/5 text-gray-500 hover:text-primary' : 'hover:bg-[#F8F9FC] text-gray-400 hover:text-primary'"
                        x-show="sidebarOpen">
                        <i class="fas fa-bars text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="mt-3 px-3 flex-1 overflow-y-auto">
                <!-- Dashboard -->
                <a href="{{ route('admin.dashboard') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-th-large w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Dashboard</span>
                </a>

                <!-- Drivers -->
                <a href="{{ route('admin.drivers.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.drivers.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <div class="flex items-center">
                        <i class="fas fa-car w-5 text-[15px]"></i>
                        <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Drivers</span>
                    </div>
                    @php $pendingCount = \App\Models\Driver::where('status', 'pending')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="pending-drivers" class="badge-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm {{ $pendingCount > 0 ? '' : 'hidden' }}">{{ $pendingCount }}</span>
                </a>

                <!-- Users -->
                <a href="{{ route('admin.users.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.users.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-users w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Users</span>
                </a>

                <!-- Rides -->
                <a href="{{ route('admin.rides.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.rides.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-route w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Rides</span>
                </a>

                <!-- Shared Rides / Carpooling -->
                <a href="{{ route('admin.shared-rides.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.shared-rides.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-user-friends w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Carpooling</span>
                </a>

                <!-- Chats -->
                <a href="{{ route('admin.chats.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.chats.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-comments w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Chats</span>
                </a>

                <!-- Payments -->
                <a href="{{ route('admin.payments.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.payments.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-wallet w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Payments</span>
                </a>

                <!-- Promo Codes -->
                <a href="{{ route('admin.promo-codes.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.promo-codes.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-ticket-alt w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Promo Codes</span>
                </a>

                <!-- SOS Alerts -->
                <a href="{{ route('admin.sos.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.sos.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle w-5 text-[15px]"></i>
                        <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">SOS Alerts</span>
                    </div>
                    @php $activeAlerts = \App\Models\SosAlert::where('status', 'active')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="sos-alerts" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse {{ $activeAlerts > 0 ? '' : 'hidden' }}">{{ $activeAlerts }}</span>
                </a>

                <!-- Reports -->
                <a href="{{ route('admin.reports.revenue') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.reports.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-chart-pie w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Reports</span>
                </a>

                <!-- Divider -->
                <div class="my-3 mx-2" x-show="sidebarOpen">
                    <div class="h-px" :class="darkMode ? 'bg-white/5' : 'bg-[#F0F0F3]'"></div>
                    <p class="px-2 pt-3 text-[10px] font-semibold uppercase tracking-wider" :class="darkMode ? 'text-gray-600' : 'text-gray-300'">Advanced</p>
                </div>

                <!-- Analytics -->
                <a href="{{ route('admin.analytics.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.analytics.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-chart-line w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Analytics</span>
                </a>

                <!-- Live Map -->
                <a href="{{ route('admin.map.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.map.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-map-marked-alt w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Live Map</span>
                </a>

                <!-- Fare Management -->
                <a href="{{ route('admin.fare.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.fare.*') || request()->routeIs('admin.surge.*') || request()->routeIs('admin.commission.*') || request()->routeIs('admin.zone.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-calculator w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Fare Management</span>
                </a>

                <!-- Support Tickets -->
                <a href="{{ route('admin.support.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.support.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <div class="flex items-center">
                        <i class="fas fa-headset w-5 text-[15px]"></i>
                        <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Support</span>
                    </div>
                    @php $openTickets = \App\Models\SupportTicket::where('status', 'open')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="open-tickets" class="badge-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm {{ $openTickets > 0 ? '' : 'hidden' }}">{{ $openTickets }}</span>
                </a>

                <!-- System Alerts -->
                <a href="{{ route('admin.alerts.index') }}"
                    class="sidebar-link flex items-center justify-between px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.alerts.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <div class="flex items-center">
                        <i class="fas fa-bell w-5 text-[15px]"></i>
                        <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Alerts</span>
                    </div>
                    @php $unresolvedAlerts = \App\Models\SystemAlert::where('is_resolved', false)->where('severity', 'critical')->count(); @endphp
                    <span x-show="sidebarOpen" data-badge="critical-alerts" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse {{ $unresolvedAlerts > 0 ? '' : 'hidden' }}">{{ $unresolvedAlerts }}</span>
                </a>

                <!-- Audit Logs -->
                <a href="{{ route('admin.audit.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.audit.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-history w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Audit Logs</span>
                </a>

                <!-- Loyalty & Rewards -->
                <a href="{{ route('admin.loyalty.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.loyalty.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-crown w-5 text-[15px] text-primary"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Loyalty Program</span>
                </a>

                <!-- Admin Roles -->
                <a href="{{ route('admin.roles.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.roles.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-user-shield w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Admin Roles</span>
                </a>

                <!-- Divider -->
                <div class="my-3 mx-2" x-show="sidebarOpen">
                    <div class="h-px" :class="darkMode ? 'bg-white/5' : 'bg-[#F0F0F3]'"></div>
                </div>

                <!-- Settings -->
                <a href="{{ route('admin.settings.index') }}"
                    class="sidebar-link flex items-center px-4 py-3 mb-1 transition-all {{ request()->routeIs('admin.settings.*') ? 'active' : '' }}"
                    :class="darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'">
                    <i class="fas fa-cog w-5 text-[15px]"></i>
                    <span x-show="sidebarOpen" class="ml-3 text-[13px] font-medium">Settings</span>
                </a>
            </nav>

            <!-- Sidebar Footer - Profile Card -->
            <div class="p-4 border-t" :class="darkMode ? 'border-white/5' : 'border-[#F0F0F3]'" x-show="sidebarOpen">
                <a href="{{ route('admin.settings.profile') }}"
                    class="flex items-center space-x-3 rounded-2xl p-3 -m-1 transition-all duration-300"
                    :class="darkMode ? 'hover:bg-white/5' : 'hover:bg-[#F8F9FC]'">
                    @if(auth()->user()->profile_photo)
                        <div class="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/30 shadow-sm flex-shrink-0">
                            <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                class="w-full h-full object-cover">
                        </div>
                    @else
                        <div class="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center text-black font-bold text-sm shadow-sm flex-shrink-0">
                            {{ auth()->user()->initials }}
                        </div>
                    @endif
                    <div class="flex-1 min-w-0">
                        <p class="text-[13px] font-semibold truncate" :class="darkMode ? 'text-white' : 'text-gray-800'">{{ auth()->user()->name ?? 'Admin' }}</p>
                        <p class="text-[11px] truncate" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">{{ auth()->user()->email ?? '' }}</p>
                    </div>
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <div :class="sidebarOpen ? 'ml-[270px]' : 'ml-20'" class="flex-1 transition-all duration-300">
            <!-- Top Navbar (Glass effect like website header) -->
            <header class="header-glass sticky top-0 z-20 transition-all duration-300 border-b"
                :class="darkMode ? 'border-white/5' : 'border-[#F0F0F3]'">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <button @click="sidebarOpen = !sidebarOpen"
                            class="lg:hidden p-2.5 rounded-xl transition-all"
                            :class="darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-[#F8F9FC] text-gray-500'">
                            <i class="fas fa-bars"></i>
                        </button>
                        <div>
                            <h2 class="text-lg font-bold tracking-tight" :class="darkMode ? 'text-white' : 'text-[#1A1A2E]'">@yield('title', 'Dashboard')</h2>
                            <p class="text-[12px] mt-0.5" :class="darkMode ? 'text-gray-500' : 'text-[#6B7280]'">@yield('subtitle', '')</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2">
                        <!-- Live Stats Pill -->
                        <div class="hidden md:flex items-center space-x-2 mr-1">
                            <div class="flex items-center space-x-2 px-3.5 py-2 rounded-pill border transition-all"
                                :class="darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-[#F0F0F3]'"
                                style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span data-count="online-drivers" class="text-[12px] font-medium"
                                    :class="darkMode ? 'text-gray-300' : 'text-[#1A1A2E]'">{{ \App\Models\Driver::where('is_online', true)->count() }} Online</span>
                            </div>
                        </div>


                        <!-- Dark Mode Toggle -->
                        <div class="flex items-center gap-1.5 px-2 py-1.5 rounded-pill border transition-all"
                            :class="darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-[#F0F0F3]'"
                            style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                            <i class="fas fa-sun text-xs" :class="darkMode ? 'text-gray-500' : 'text-primary'"></i>
                            <button @click="toggleDarkMode()"
                                class="relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
                                :class="darkMode ? 'bg-dark-100' : 'bg-[#F0F0F3]'">
                                <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center"
                                    :class="darkMode ? 'translate-x-5 bg-primary text-black' : 'translate-x-0 bg-white text-gray-400'"
                                    style="font-size: 9px;">
                                    <i class="fas" :class="darkMode ? 'fa-moon' : 'fa-sun'"></i>
                                </span>
                            </button>
                            <i class="fas fa-moon text-xs" :class="darkMode ? 'text-primary' : 'text-gray-300'"></i>
                        </div>

                        <!-- Notifications -->
                        <div x-data="{ open: false }" class="relative">
                            @php
                                $pendingDrivers = \App\Models\Driver::where('status', 'pending')->count();
                                $activeSOS = \App\Models\SosAlert::where('status', 'active')->count() ?? 0;
                                $openTickets = \App\Models\SupportTicket::where('status', 'open')->count();
                                $totalNotifs = $pendingDrivers + $activeSOS + $openTickets;
                            @endphp
                            <button @click="open = !open"
                                class="p-2.5 rounded-xl transition-all relative border"
                                :class="darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400' : 'bg-white border-[#F0F0F3] hover:border-primary/30 text-gray-500 hover:text-primary'"
                                style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                <i class="fas fa-bell text-sm"></i>
                                <span data-badge="header-notifications" class="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center {{ $totalNotifs > 0 ? '' : 'hidden' }}" style="min-width: 18px; height: 18px;">{{ $totalNotifs }}</span>
                            </button>
                            <div x-show="open" @click.away="open = false" x-cloak
                                x-transition:enter="transition ease-out duration-200"
                                x-transition:enter-start="opacity-0 translate-y-1"
                                x-transition:enter-end="opacity-100 translate-y-0"
                                x-transition:leave="transition ease-in duration-150"
                                x-transition:leave-start="opacity-100 translate-y-0"
                                x-transition:leave-end="opacity-0 translate-y-1"
                                class="absolute right-0 mt-2 w-80 rounded-2xl shadow-heavy py-2 z-50 border"
                                :class="darkMode ? 'bg-dark-200 border-white/5' : 'bg-white border-[#F0F0F3]'">
                                <div class="px-4 py-3 border-b" :class="darkMode ? 'border-white/5' : 'border-[#F0F0F3]'">
                                    <h3 class="font-semibold text-sm" :class="darkMode ? 'text-white' : 'text-[#1A1A2E]'">Notifications</h3>
                                </div>
                                <div class="max-h-80 overflow-y-auto">
                                    @if($activeSOS > 0)
                                        <a href="{{ route('admin.sos.active') }}" class="block px-4 py-3 transition-colors border-l-4 border-red-500" :class="darkMode ? 'hover:bg-red-900/10' : 'hover:bg-red-50'">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="darkMode ? 'bg-red-900/20' : 'bg-red-100'">
                                                    <i class="fas fa-exclamation-triangle text-red-500 text-sm"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[13px] font-semibold" :class="darkMode ? 'text-red-400' : 'text-red-700'">{{ $activeSOS }} Active SOS Alert(s)!</p>
                                                    <p class="text-[11px] text-red-500">Requires immediate attention</p>
                                                </div>
                                            </div>
                                        </a>
                                    @endif
                                    @if($openTickets > 0)
                                        <a href="{{ route('admin.support.index', ['status' => 'open']) }}" class="block px-4 py-3 transition-colors border-l-4 border-purple-500" :class="darkMode ? 'hover:bg-purple-900/10' : 'hover:bg-purple-50'">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="darkMode ? 'bg-purple-900/20' : 'bg-purple-100'">
                                                    <i class="fas fa-envelope text-purple-500 text-sm"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[13px] font-semibold" :class="darkMode ? 'text-purple-400' : 'text-purple-700'">{{ $openTickets }} Open Support Ticket(s)</p>
                                                    <p class="text-[11px] text-purple-500">Waiting for response</p>
                                                </div>
                                            </div>
                                        </a>
                                    @endif
                                    @if($pendingDrivers > 0)
                                        <a href="{{ route('admin.drivers.pending') }}" class="block px-4 py-3 transition-colors border-l-4 border-primary" :class="darkMode ? 'hover:bg-yellow-900/10' : 'hover:bg-yellow-50'">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'">
                                                    <i class="fas fa-user-clock text-primary text-sm"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[13px] font-semibold" :class="darkMode ? 'text-yellow-400' : 'text-yellow-700'">{{ $pendingDrivers }} Pending Driver(s)</p>
                                                    <p class="text-[11px] text-primary-dark">Waiting for approval</p>
                                                </div>
                                            </div>
                                        </a>
                                    @endif
                                    @if($totalNotifs == 0)
                                        <div class="px-4 py-8 text-center">
                                            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" :class="darkMode ? 'bg-green-900/20' : 'bg-green-50'">
                                                <i class="fas fa-check-circle text-green-500 text-xl"></i>
                                            </div>
                                            <p class="text-[13px] font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">All caught up!</p>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Profile Dropdown -->
                        <div x-data="{ open: false }" class="relative">
                            <button @click="open = !open"
                                class="flex items-center space-x-2 p-1.5 rounded-xl transition-all border"
                                :class="darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-[#F0F0F3] hover:border-primary/30'"
                                style="box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                @if(auth()->user()->profile_photo)
                                    <div class="w-8 h-8 rounded-lg overflow-hidden">
                                        <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                            class="w-full h-full object-cover">
                                    </div>
                                @else
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs gradient-gold text-black">
                                        {{ auth()->user()->initials }}
                                    </div>
                                @endif
                                <span class="hidden md:block text-[13px] font-semibold pr-1"
                                    :class="darkMode ? 'text-gray-200' : 'text-[#1A1A2E]'">{{ auth()->user()->name ?? 'Admin' }}</span>
                                <i class="fas fa-chevron-down text-[10px] pr-1"
                                    :class="darkMode ? 'text-gray-500' : 'text-gray-400'"></i>
                            </button>

                            <div x-show="open" @click.away="open = false" x-cloak
                                x-transition:enter="transition ease-out duration-200"
                                x-transition:enter-start="opacity-0 translate-y-1"
                                x-transition:enter-end="opacity-100 translate-y-0"
                                x-transition:leave="transition ease-in duration-150"
                                x-transition:leave-start="opacity-100 translate-y-0"
                                x-transition:leave-end="opacity-0 translate-y-1"
                                class="absolute right-0 mt-2 w-64 rounded-2xl shadow-heavy py-3 z-50 border"
                                :class="darkMode ? 'bg-dark-200 border-white/5' : 'bg-white border-[#F0F0F3]'">
                                <!-- Profile Header -->
                                <div class="px-4 pb-3 border-b" :class="darkMode ? 'border-white/5' : 'border-[#F0F0F3]'">
                                    <div class="flex items-center gap-3">
                                        @if(auth()->user()->profile_photo)
                                            <div class="w-11 h-11 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img src="{{ auth()->user()->profile_photo_url }}" alt="{{ auth()->user()->name }}"
                                                    class="w-full h-full object-cover">
                                            </div>
                                        @else
                                            <div class="w-11 h-11 gradient-gold rounded-xl flex items-center justify-center text-black font-bold shadow-sm flex-shrink-0">
                                                {{ auth()->user()->initials }}
                                            </div>
                                        @endif
                                        <div class="min-w-0">
                                            <p class="text-[13px] font-semibold truncate" :class="darkMode ? 'text-white' : 'text-[#1A1A2E]'">{{ auth()->user()->name ?? 'Admin' }}</p>
                                            <p class="text-[11px] truncate" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">{{ auth()->user()->email ?? '' }}</p>
                                            <span class="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                :class="darkMode ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary-dark'">
                                                {{ auth()->user()->adminRole->display_name ?? ucwords(str_replace('_', ' ', auth()->user()->adminRole->name ?? 'Admin')) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Menu Items -->
                                <div class="py-1">
                                    <a href="{{ route('admin.settings.profile') }}" class="flex items-center px-4 py-2.5 text-[13px] transition-colors rounded-lg mx-2"
                                        :class="darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-[#F8F9FC]'">
                                        <i class="fas fa-user w-5 text-gray-400 text-xs"></i>
                                        <span class="ml-3">My Profile</span>
                                    </a>
                                    <a href="{{ route('admin.settings.index') }}" class="flex items-center px-4 py-2.5 text-[13px] transition-colors rounded-lg mx-2"
                                        :class="darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-[#F8F9FC]'">
                                        <i class="fas fa-cog w-5 text-gray-400 text-xs"></i>
                                        <span class="ml-3">Settings</span>
                                    </a>
                                </div>
                                <div class="mx-4 my-1 h-px" :class="darkMode ? 'bg-white/5' : 'bg-[#F0F0F3]'"></div>
                                <div class="pt-1">
                                    <form action="{{ route('admin.logout') }}" method="POST">
                                        @csrf
                                        <button type="submit" class="w-full flex items-center px-4 py-2.5 text-[13px] text-red-500 transition-colors rounded-lg mx-2 hover:bg-red-50 dark:hover:bg-red-900/10" style="width: calc(100% - 16px);">
                                            <i class="fas fa-sign-out-alt w-5 text-xs"></i>
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
                    <div class="mb-6 p-4 rounded-2xl flex items-center justify-between border alert-message"
                        :class="darkMode ? 'bg-green-900/10 border-green-800/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'"
                        x-data="{ show: true }" x-show="show"
                        x-transition:leave="transition ease-in duration-200"
                        x-transition:leave-start="opacity-100"
                        x-transition:leave-end="opacity-0">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-xl flex items-center justify-center mr-3" :class="darkMode ? 'bg-green-900/20' : 'bg-green-100'">
                                <i class="fas fa-check-circle text-green-500 text-sm"></i>
                            </div>
                            <span class="text-[13px] font-medium">{{ session('success') }}</span>
                        </div>
                        <button @click="show = false" class="text-green-400 hover:text-green-600 transition-colors p-1">&times;</button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="mb-6 p-4 rounded-2xl flex items-center justify-between border alert-message"
                        :class="darkMode ? 'bg-red-900/10 border-red-800/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'"
                        x-data="{ show: true }" x-show="show"
                        x-transition:leave="transition ease-in duration-200"
                        x-transition:leave-start="opacity-100"
                        x-transition:leave-end="opacity-0">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-xl flex items-center justify-center mr-3" :class="darkMode ? 'bg-red-900/20' : 'bg-red-100'">
                                <i class="fas fa-exclamation-circle text-red-500 text-sm"></i>
                            </div>
                            <span class="text-[13px] font-medium">{{ session('error') }}</span>
                        </div>
                        <button @click="show = false" class="text-red-400 hover:text-red-600 transition-colors p-1">&times;</button>
                    </div>
                @endif

                @if($errors->any())
                    <div class="mb-6 p-4 rounded-2xl border"
                        :class="darkMode ? 'bg-red-900/10 border-red-800/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'">
                        <ul class="list-disc list-inside text-[13px]">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @yield('content')
            </main>

            <!-- Footer -->
            <footer class="border-t px-6 py-4" :class="darkMode ? 'bg-dark-200 border-white/5' : 'bg-white border-[#F0F0F3]'">
                <div class="flex flex-col md:flex-row items-center justify-between">
                    <div class="flex items-center space-x-2 mb-2 md:mb-0">
                        <div class="w-5 h-5 rounded-md overflow-hidden">
                            <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-full h-full object-contain">
                        </div>
                        <span class="text-[12px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</span>
                    </div>
                    <span class="text-[11px] font-medium" :class="darkMode ? 'text-gray-600' : 'text-gray-300'">Version 1.0.0</span>
                </div>
            </footer>
        </div>
    </div>

    <!-- Notification Sound -->
    <audio id="notificationSound" preload="auto">
        <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg">
        <source src="https://www.soundjay.com/buttons/sounds/button-09a.mp3" type="audio/mpeg">
    </audio>

    <!-- Real-time Updates Script -->
    <script>
        const ShareideRealtime = {
            lastCounts: {
                pendingDrivers: {{ \App\Models\Driver::where('status', 'pending')->count() }},
                activeAlerts: {{ \App\Models\SosAlert::where('status', 'active')->count() ?? 0 }},
                criticalAlerts: {{ \App\Models\SystemAlert::where('is_resolved', false)->where('severity', 'critical')->count() ?? 0 }},
                openTickets: {{ \App\Models\SupportTicket::where('status', 'open')->count() ?? 0 }},
                onlineDrivers: {{ \App\Models\Driver::where('is_online', true)->count() }}
            },
            pollingInterval: 10000,
            notificationPermission: false,
            originalTitle: document.title,
            titleFlashInterval: null,

            init() {
                this.requestNotificationPermission();
                this.startPolling();
                this.setupVisibilityHandler();
            },

            setupVisibilityHandler() {
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) this.stopTitleFlash();
                });
                window.addEventListener('focus', () => this.stopTitleFlash());
            },

            flashTitle(message) {
                if (this.titleFlashInterval) return;
                let isOriginal = true;
                this.titleFlashInterval = setInterval(() => {
                    document.title = isOriginal ? message : this.originalTitle;
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
                    audio.volume = 1.0;
                    audio.currentTime = 0;
                    audio.play().catch(e => this.beepMultiple(3));
                } else {
                    this.beepMultiple(3);
                }
            },

            beepMultiple(times) {
                let count = 0;
                const playBeep = () => {
                    if (count < times) { this.beep(); count++; setTimeout(playBeep, 300); }
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
                    oscillator.frequency.value = 880;
                    oscillator.type = 'square';
                    gainNode.gain.value = 0.5;
                    oscillator.start();
                    setTimeout(() => { oscillator.stop(); audioCtx.close(); }, 250);
                } catch (e) {}
            },

            showBrowserNotification(title, body) {
                if (this.notificationPermission) {
                    const notification = new Notification(title, {
                        body: body,
                        icon: '/images/logo/icon.png',
                        badge: '/images/logo/icon.png',
                        tag: 'shareide-admin-' + Date.now(),
                        requireInteraction: true,
                        silent: false,
                        vibrate: [200, 100, 200],
                    });
                    notification.onclick = function() { window.focus(); notification.close(); };
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
                } catch (error) {}
            },

            processUpdates(data) {
                let hasNewData = false;
                let notifications = [];

                if (data.pendingDrivers > this.lastCounts.pendingDrivers) {
                    notifications.push(`${data.pendingDrivers - this.lastCounts.pendingDrivers} new driver application(s) pending!`);
                    hasNewData = true;
                }
                if (data.activeAlerts > this.lastCounts.activeAlerts) {
                    notifications.push(`${data.activeAlerts - this.lastCounts.activeAlerts} new SOS alert(s)!`);
                    hasNewData = true;
                }
                if (data.criticalAlerts > this.lastCounts.criticalAlerts) {
                    notifications.push(`${data.criticalAlerts - this.lastCounts.criticalAlerts} new critical alert(s)!`);
                    hasNewData = true;
                }
                if (data.openTickets > this.lastCounts.openTickets) {
                    notifications.push(`${data.openTickets - this.lastCounts.openTickets} new support ticket(s)!`);
                    hasNewData = true;
                }

                this.updateBadges(data);
                this.updateOnlineCount(data.onlineDrivers);

                if (hasNewData) {
                    this.playNotificationSound();
                    this.showBrowserNotification('SHAREIDE Admin Alert', notifications.join('\n'));
                    this.showToast(notifications.join('<br>'));
                    if (document.hidden) this.flashTitle('New Alert!');
                }

                this.lastCounts = { ...data };
            },

            updateBadges(data) {
                const updateBadge = (selector, count, hideOnZero = true) => {
                    document.querySelectorAll(`[data-badge="${selector}"]`).forEach(badge => {
                        if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
                        else if (hideOnZero) { badge.classList.add('hidden'); }
                    });
                };

                updateBadge('pending-drivers', data.pendingDrivers);
                updateBadge('sos-alerts', data.activeAlerts);
                updateBadge('critical-alerts', data.criticalAlerts);
                updateBadge('open-tickets', data.openTickets);

                const headerBadge = document.querySelector('[data-badge="header-notifications"]');
                if (headerBadge) {
                    const total = data.pendingDrivers + data.activeAlerts + data.criticalAlerts;
                    if (total > 0) { headerBadge.textContent = total; headerBadge.classList.remove('hidden'); }
                    else { headerBadge.classList.add('hidden'); }
                }
            },

            updateOnlineCount(count) {
                const el = document.querySelector('[data-count="online-drivers"]');
                if (el) el.textContent = count + ' Online';
            },

            showToast(message, type = 'info') {
                let container = document.getElementById('toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'toast-container';
                    container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
                    container.style.cssText = 'pointer-events: none;';
                    document.body.appendChild(container);
                }

                const colors = {
                    info: 'from-primary to-secondary',
                    success: 'from-green-500 to-emerald-500',
                    warning: 'from-yellow-500 to-amber-500',
                    error: 'from-red-500 to-rose-500'
                };

                const toast = document.createElement('div');
                toast.style.cssText = 'pointer-events: auto;';
                toast.className = `bg-white dark:bg-dark-200 text-gray-800 dark:text-white px-5 py-4 rounded-2xl shadow-heavy border border-[#F0F0F3] dark:border-white/5 transform translate-x-[120%] transition-all duration-500 ease-out max-w-sm`;
                toast.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br ${colors[type]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <i class="fas fa-bell text-white text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                                <p class="font-bold text-[13px] gradient-gold-text">Live Update</p>
                            </div>
                            <p class="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">${message}</p>
                            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">${new Date().toLocaleTimeString()}</p>
                        </div>
                        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-300 hover:text-gray-500 transition-colors p-1">
                            <i class="fas fa-times text-xs"></i>
                        </button>
                    </div>
                    <div class="mt-3 h-0.5 bg-gray-100 dark:bg-dark-100 rounded-full overflow-hidden">
                        <div class="h-full gradient-gold rounded-full" style="animation: shrink 8s linear forwards;"></div>
                    </div>
                `;

                if (!document.getElementById('toast-styles')) {
                    const style = document.createElement('style');
                    style.id = 'toast-styles';
                    style.textContent = `@keyframes shrink { from { width: 100%; } to { width: 0%; } }`;
                    document.head.appendChild(style);
                }

                container.appendChild(toast);
                requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; });
                setTimeout(() => {
                    toast.style.transform = 'translateX(120%)';
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 500);
                }, 8000);
            },

            startPolling() {
                setInterval(() => this.fetchUpdates(), this.pollingInterval);
            },

        };

        document.addEventListener('DOMContentLoaded', () => ShareideRealtime.init());
    </script>

    @stack('scripts')
</body>
</html>
