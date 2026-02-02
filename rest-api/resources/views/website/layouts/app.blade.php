<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="@yield('meta_description', 'SHAREIDE - Pakistan\'s Premier Ride-Sharing Platform. Ride Together, Save Together.')">
    <meta name="keywords" content="ride sharing, carpool, taxi, Pakistan, Karachi, Lahore, affordable rides, SHAREIDE">
    <meta name="author" content="SHAREIDE">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Open Graph -->
    <meta property="og:title" content="@yield('title', 'SHAREIDE - Ride Together, Save Together')">
    <meta property="og:description" content="@yield('meta_description', 'Pakistan\'s most affordable ride-sharing platform')">
    <meta property="og:image" content="{{ asset('website/images/og-image.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:type" content="website">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="@yield('title', 'SHAREIDE')">
    <meta name="twitter:description" content="@yield('meta_description')">

    <meta name="theme-color" content="#FFD700">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <title>@yield('title', 'SHAREIDE - Ride Together, Save Together')</title>

    <link rel="icon" type="image/png" href="{{ asset('website/images/favicon.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('website/images/apple-touch-icon.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- AOS Animation Library -->
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css">

    <!-- Styles -->
    <link rel="stylesheet" href="{{ asset('website/css/style.css') }}">

    @stack('styles')
</head>
<body>
    <!-- Preloader -->
    <div id="preloader">
        <div class="loader">
            <div class="loader-logo">S</div>
            <div class="loader-text">SHARE<span>IDE</span></div>
            <div class="loader-bar"><div class="loader-progress"></div></div>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="{{ route('home') }}" class="nav-logo">
                <div class="logo-icon">S</div>
                <span class="logo-text">SHARE<span class="highlight">IDE</span></span>
            </a>

            <div class="nav-menu" id="navMenu">
                <a href="{{ route('home') }}" class="nav-link {{ request()->routeIs('home') ? 'active' : '' }}">Home</a>
                <a href="{{ route('features') }}" class="nav-link {{ request()->routeIs('features') ? 'active' : '' }}">Features</a>
                <a href="{{ route('safety') }}" class="nav-link {{ request()->routeIs('safety') ? 'active' : '' }}">Safety</a>
                <a href="{{ route('about') }}" class="nav-link {{ request()->routeIs('about') ? 'active' : '' }}">About</a>
                <a href="{{ route('contact') }}" class="nav-link {{ request()->routeIs('contact') ? 'active' : '' }}">Contact</a>
            </div>

            <div class="nav-actions">
                <a href="{{ route('download') }}" class="btn btn-primary">
                    <i class="fas fa-download"></i>
                    <span>Download App</span>
                </a>
                <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <a href="{{ route('home') }}" class="mobile-link">Home</a>
            <a href="{{ route('features') }}" class="mobile-link">Features</a>
            <a href="{{ route('safety') }}" class="mobile-link">Safety</a>
            <a href="{{ route('about') }}" class="mobile-link">About</a>
            <a href="{{ route('contact') }}" class="mobile-link">Contact</a>
            <a href="{{ route('drive') }}" class="mobile-link">Become a Driver</a>
            <hr>
            <a href="{{ route('download') }}" class="btn btn-primary btn-block">
                <i class="fas fa-download"></i> Download App
            </a>
        </div>
    </div>

    <!-- Main Content -->
    <main>
        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-top">
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <a href="{{ route('home') }}" class="footer-logo">
                            <div class="logo-icon">S</div>
                            <span class="logo-text">SHARE<span class="highlight">IDE</span></span>
                        </a>
                        <p>Pakistan's most trusted ride-sharing platform. Safe, affordable, and comfortable rides for everyone.</p>
                        <div class="social-links">
                            <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                        </div>
                    </div>

                    <div class="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="{{ route('about') }}">About Us</a></li>
                            <li><a href="{{ route('features') }}">Features</a></li>
                            <li><a href="{{ route('safety') }}">Safety</a></li>
                            <li><a href="#">Careers</a></li>
                        </ul>
                    </div>

                    <div class="footer-links">
                        <h4>Products</h4>
                        <ul>
                            <li><a href="{{ route('download') }}">Ride</a></li>
                            <li><a href="{{ route('features') }}">Carpool</a></li>
                            <li><a href="{{ route('drive') }}">Drive</a></li>
                            <li><a href="#">Business</a></li>
                        </ul>
                    </div>

                    <div class="footer-links">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="{{ route('contact') }}">Contact Us</a></li>
                            <li><a href="{{ route('faq') }}">FAQ</a></li>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Community</a></li>
                        </ul>
                    </div>

                    <div class="footer-links">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="{{ route('privacy') }}">Privacy Policy</a></li>
                            <li><a href="{{ route('terms') }}">Terms of Service</a></li>
                            <li><a href="{{ route('refund') }}">Refund Policy</a></li>
                            <li><a href="#">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-download">
                    <h4>Get the App</h4>
                    <div class="download-buttons">
                        <a href="{{ route('download') }}" class="store-btn">
                            <i class="fab fa-google-play"></i>
                            <div>
                                <span>Get it on</span>
                                <strong>Google Play</strong>
                            </div>
                        </a>
                        <a href="{{ route('download') }}" class="store-btn">
                            <i class="fab fa-apple"></i>
                            <div>
                                <span>Download on</span>
                                <strong>App Store</strong>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="container">
                <p>&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</p>
                <p>Made with <i class="fas fa-heart" style="color: #ef4444;"></i> in Pakistan</p>
            </div>
        </div>
    </footer>

    <!-- Back to Top -->
    <button class="back-to-top" id="backToTop" aria-label="Back to top">
        <i class="fas fa-chevron-up"></i>
    </button>

    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="{{ asset('website/js/main.js') }}"></script>

    @stack('scripts')
</body>
</html>
