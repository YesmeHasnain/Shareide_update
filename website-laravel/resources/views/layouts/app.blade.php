<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SHAREIDE - Pakistan's #1 Ride Sharing App. Book rides, share trips, save money.">
    <title>@yield('title', 'SHAREIDE - Ride Sharing Pakistan')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
    <!-- Navbar -->
    <header class="header" id="header">
        <nav class="nav container">
            <a href="{{ url('/') }}" class="nav__logo">
                <span class="logo-text">SHARE<span class="accent">IDE</span></span>
            </a>

            <div class="nav__menu" id="nav-menu">
                <ul class="nav__list">
                    <li><a href="#home" class="nav__link active">Home</a></li>
                    <li><a href="#features" class="nav__link">Features</a></li>
                    <li><a href="#how" class="nav__link">How It Works</a></li>
                    <li><a href="#safety" class="nav__link">Safety</a></li>
                    <li><a href="#download" class="nav__link">Download</a></li>
                </ul>
                <div class="nav__close" id="nav-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>

            <div class="nav__buttons">
                <a href="#download" class="btn btn--primary">Get App</a>
                <div class="nav__toggle" id="nav-toggle">
                    <i class="fas fa-bars"></i>
                </div>
            </div>
        </nav>
    </header>

    @yield('content')

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer__grid">
                <div class="footer__brand">
                    <span class="logo-text">SHARE<span class="accent">IDE</span></span>
                    <p>Pakistan's most trusted ride-sharing platform. Ride together, save together.</p>
                    <div class="footer__social">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <div class="footer__links">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">Blog</a>
                    <a href="#">Press</a>
                </div>

                <div class="footer__links">
                    <h4>Support</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Safety</a>
                    <a href="#">Contact Us</a>
                    <a href="#">FAQ</a>
                </div>

                <div class="footer__links">
                    <h4>Legal</h4>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Refund Policy</a>
                </div>
            </div>

            <div class="footer__bottom">
                <p>&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Support Chat -->
    <div class="chat-widget" id="chatWidget">
        <div class="chat-popup" id="chatPopup">
            <div class="chat-popup__header">
                <div class="chat-popup__title">
                    <i class="fas fa-headset"></i>
                    <div>
                        <strong>SHAREIDE Support</strong>
                        <span class="online-status">Online</span>
                    </div>
                </div>
                <button class="chat-popup__close" id="chatClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="chat-popup__messages" id="chatMessages">
                <div class="chat-message chat-message--bot">
                    <p>Hi! How can we help you today?</p>
                </div>
            </div>
            <div class="chat-popup__quick">
                <button class="quick-btn" data-msg="I need help with a booking">Booking Issue</button>
                <button class="quick-btn" data-msg="Payment problem">Payment Help</button>
                <button class="quick-btn" data-msg="Driver complaint">Driver Issue</button>
            </div>
            <form class="chat-popup__form" id="chatForm">
                <input type="text" placeholder="Type a message..." id="chatInput">
                <button type="submit"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
        <button class="chat-toggle" id="chatToggle">
            <i class="fas fa-comments"></i>
            <span class="chat-badge">1</span>
        </button>
    </div>

    <script src="{{ asset('js/main.js') }}"></script>
</body>
</html>
