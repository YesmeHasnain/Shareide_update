<header class="header @if(!request()->routeIs('home')) header--inner @endif" id="header">
    <nav class="nav container">
        <!-- Logo -->
        <a href="{{ route('home') }}" class="nav__logo">
            <img src="{{ asset('website/images/logo-black.png') }}" alt="SHAREIDE" class="nav__logo-img nav__logo-dark">
            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="nav__logo-img nav__logo-light">
        </a>

        <!-- Navigation -->
        <div class="nav__menu" id="nav-menu">
            <ul class="nav__list">
                <!-- Home -->
                <li>
                    <a href="{{ route('home') }}" class="nav__link {{ request()->routeIs('home') ? 'active' : '' }}">Home</a>
                </li>

                <!-- Products Mega Menu -->
                <li class="nav__dropdown" data-dropdown="products">
                    <a href="#" class="nav__link nav__link--dropdown {{ request()->routeIs('shareide-app', 'shareide-fleet', 'carpool', 'how-it-works') ? 'active' : '' }}">
                        Products <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="mega-menu" data-mega="products">
                        <div class="mega-menu__inner">
                            <div class="mega-menu__section">
                                <h6 class="mega-menu__heading">Ride Services</h6>
                                <a href="{{ route('shareide-app') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--yellow">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Passenger App</span>
                                        <span class="mega-menu__desc">Book rides, bid fares, travel safe</span>
                                    </div>
                                </a>
                                <a href="{{ route('shareide-fleet') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--blue">
                                        <i class="fas fa-car"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Fleet App</span>
                                        <span class="mega-menu__desc">Drive and earn on your terms</span>
                                    </div>
                                </a>
                                <a href="{{ route('carpool') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--green">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Carpooling</span>
                                        <span class="mega-menu__desc">Share rides, save up to 60%</span>
                                    </div>
                                </a>
                            </div>
                            <div class="mega-menu__section">
                                <h6 class="mega-menu__heading">Learn More</h6>
                                <a href="{{ route('how-it-works') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--purple">
                                        <i class="fas fa-play-circle"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">How It Works</span>
                                        <span class="mega-menu__desc">Step-by-step guide for riders & drivers</span>
                                    </div>
                                </a>
                            </div>
                            <!-- Featured promo -->
                            <div class="mega-menu__featured">
                                <div class="mega-menu__featured-card">
                                    <span class="mega-menu__featured-tag">New</span>
                                    <h5>Bid Your Fare</h5>
                                    <p>Set your own price and let drivers compete for your ride.</p>
                                    <a href="{{ route('shareide-app') }}" class="mega-menu__featured-link">Learn more <i class="fas fa-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>

                <!-- Company Mega Menu -->
                <li class="nav__dropdown" data-dropdown="company">
                    <a href="#" class="nav__link nav__link--dropdown {{ request()->routeIs('about', 'safety', 'blog', 'cities', 'loyalty') ? 'active' : '' }}">
                        Company <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="mega-menu mega-menu--two-col" data-mega="company">
                        <div class="mega-menu__inner">
                            <div class="mega-menu__section">
                                <h6 class="mega-menu__heading">About Us</h6>
                                <a href="{{ route('about') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--yellow">
                                        <i class="fas fa-building"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Our Story</span>
                                        <span class="mega-menu__desc">Pakistan's trusted ride-sharing platform</span>
                                    </div>
                                </a>
                                <a href="{{ route('safety') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--red">
                                        <i class="fas fa-shield-alt"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Safety & Trust</span>
                                        <span class="mega-menu__desc">Your security is our foundation</span>
                                    </div>
                                </a>
                                <a href="{{ route('cities') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--teal">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Cities</span>
                                        <span class="mega-menu__desc">Available in 15+ cities across Pakistan</span>
                                    </div>
                                </a>
                            </div>
                            <div class="mega-menu__section">
                                <h6 class="mega-menu__heading">More</h6>
                                <a href="{{ route('loyalty') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--purple">
                                        <i class="fas fa-crown"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Loyalty & Rewards</span>
                                        <span class="mega-menu__desc">Earn points, unlock tiers, get cashback</span>
                                    </div>
                                </a>
                                <a href="{{ route('blog') }}" class="mega-menu__item">
                                    <div class="mega-menu__icon mega-menu__icon--orange">
                                        <i class="fas fa-newspaper"></i>
                                    </div>
                                    <div class="mega-menu__content">
                                        <span class="mega-menu__title">Blog & News</span>
                                        <span class="mega-menu__desc">Updates, tips, and community stories</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </li>

                <!-- Drive (direct link) -->
                <li>
                    <a href="{{ route('drive-with-us') }}" class="nav__link {{ request()->routeIs('drive-with-us') ? 'active' : '' }}">Drive</a>
                </li>

                <!-- Support Dropdown -->
                <li class="nav__dropdown" data-dropdown="support">
                    <a href="#" class="nav__link nav__link--dropdown {{ request()->routeIs('faq', 'support', 'download') ? 'active' : '' }}">
                        Support <i class="fas fa-chevron-down"></i>
                    </a>
                    <div class="nav__dropdown-panel">
                        <a href="{{ route('support') }}" class="nav__dropdown-item">
                            <i class="fas fa-headset"></i>
                            <div>
                                <span class="nav__dropdown-item-title">Help Center</span>
                                <span class="nav__dropdown-item-desc">Get help from our team</span>
                            </div>
                        </a>
                        <a href="{{ route('faq') }}" class="nav__dropdown-item">
                            <i class="fas fa-question-circle"></i>
                            <div>
                                <span class="nav__dropdown-item-title">FAQ</span>
                                <span class="nav__dropdown-item-desc">Quick answers to common questions</span>
                            </div>
                        </a>
                        <a href="{{ route('download') }}" class="nav__dropdown-item">
                            <i class="fas fa-download"></i>
                            <div>
                                <span class="nav__dropdown-item-title">Download Apps</span>
                                <span class="nav__dropdown-item-desc">Get SHAREIDE on your phone</span>
                            </div>
                        </a>
                    </div>
                </li>
            </ul>

            <!-- Mobile close -->
            <div class="nav__close" id="nav-close">
                <i class="fas fa-times"></i>
            </div>
        </div>

        <!-- CTA + Mobile Toggle -->
        <div class="nav__buttons">
            <a href="{{ route('download') }}" class="btn btn--primary btn--glow btn--sm">
                <i class="fas fa-download"></i>
                Get App
            </a>
            <div class="nav__toggle" id="nav-toggle">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>
</header>
