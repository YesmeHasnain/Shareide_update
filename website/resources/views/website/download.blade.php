@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--support">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-download"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Download</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Download <span class="gradient-text">SHAREIDE</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Get both apps - the Passenger app for booking rides and the Fleet app for driving and earning. Available now on Google Play.</p>
        </div>
    </section>

    <!-- Download Both Apps -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Get the Apps</span>
                <h2 class="section__title">Two Apps, One <span class="gradient-text">Platform</span></h2>
                <p class="section__desc">Choose the app that fits your journey</p>
            </div>

            <div class="download-apps" data-animate="fade-up">
                <!-- Passenger App -->
                <div class="download-app-card" data-animate="fade-up" data-delay="0">
                    <div class="download-app-card__icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3 class="download-app-card__title">Passenger App</h3>
                    <p class="download-app-card__desc">Book solo rides, share carpools, schedule trips, and bid your own fare. Track drivers in real-time and pay with cash, JazzCash, Easypaisa, or card.</p>
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide" class="store-button" style="justify-content: center;">
                        <i class="fab fa-google-play"></i>
                        <div>
                            <span>Get it on</span>
                            <strong>Google Play</strong>
                        </div>
                    </a>
                </div>

                <!-- Fleet / Driver App -->
                <div class="download-app-card" data-animate="fade-up" data-delay="150">
                    <div class="download-app-card__icon">
                        <i class="fas fa-car"></i>
                    </div>
                    <h3 class="download-app-card__title">Fleet / Driver App</h3>
                    <p class="download-app-card__desc">Accept rides, manage your earnings, and drive on your own schedule. Low commission rates, daily payouts, and full driver support across Pakistan.</p>
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide_fleet" class="store-button" style="justify-content: center;">
                        <i class="fab fa-google-play"></i>
                        <div>
                            <span>Get it on</span>
                            <strong>Google Play</strong>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Our Numbers</span>
                <h2 class="section__title">Trusted by <span class="gradient-text">Thousands</span></h2>
                <p class="section__desc">Growing every day across Pakistan</p>
            </div>

            <div class="stat-grid" data-animate="fade-up">
                <div class="stat-card" data-animate="fade-up" data-delay="0">
                    <div class="stat-card__number" data-target="500" data-suffix="K+">0</div>
                    <div class="stat-card__label">Downloads</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="100">
                    <div class="stat-card__number">4.8</div>
                    <div class="stat-card__label">App Rating</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="200">
                    <div class="stat-card__number" data-target="50" data-suffix="K+">0</div>
                    <div class="stat-card__label">Verified Drivers</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="300">
                    <div class="stat-card__number" data-target="15" data-suffix="+">0</div>
                    <div class="stat-card__label">Cities Covered</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose SHAREIDE -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Why SHAREIDE</span>
                <h2 class="section__title">Why Choose <span class="gradient-text">SHAREIDE</span>?</h2>
                <p class="section__desc">The smartest way to travel in Pakistan</p>
            </div>

            <div class="three-col">
                <div class="info-card" data-animate="fade-up" data-delay="0">
                    <div class="info-card__icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="info-card__title">Safe & Verified</h3>
                    <p class="info-card__text">Every driver is CNIC verified through NADRA. Live GPS tracking, SOS button, and trip sharing with family give you complete peace of mind on every ride.</p>
                </div>
                <div class="info-card" data-animate="fade-up" data-delay="100">
                    <div class="info-card__icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h3 class="info-card__title">Affordable Fares</h3>
                    <p class="info-card__text">Save up to 60% with carpooling or bid your own fare. No surge pricing surprises - you control what you pay. Multiple payment options available.</p>
                </div>
                <div class="info-card" data-animate="fade-up" data-delay="200">
                    <div class="info-card__icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3 class="info-card__title">24/7 Support</h3>
                    <p class="info-card__text">Our dedicated support team is available round the clock. In-app chat, phone support, and email - we are always here when you need us most.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- App Comparison -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Compare Apps</span>
                <h2 class="section__title">What Each App <span class="gradient-text">Offers</span></h2>
                <p class="section__desc">Feature breakdown for passengers and drivers</p>
            </div>

            <div class="two-col" data-animate="fade-up">
                <!-- Passenger App Features -->
                <div>
                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-mobile-alt" style="color: var(--primary-dark);"></i> Passenger App
                    </h3>
                    <div class="process-steps">
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Book Solo & Carpool Rides</h3>
                                <p>Choose between private rides or shared carpools to save money</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Bid Your Own Fare</h3>
                                <p>Set your budget and negotiate with drivers for the best deal</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Live Tracking & Safety</h3>
                                <p>Track your ride in real-time with SOS button and trip sharing</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Schedule & Intercity Rides</h3>
                                <p>Book in advance or travel between cities at great rates</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Loyalty Rewards</h3>
                                <p>Earn points and cashback on every ride you complete</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Driver App Features -->
                <div>
                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-car" style="color: var(--primary-dark);"></i> Fleet / Driver App
                    </h3>
                    <div class="process-steps">
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Flexible Schedule</h3>
                                <p>Drive when you want - go online or offline at any time</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Low Commission Rates</h3>
                                <p>Keep more of what you earn with our driver-friendly commission</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Daily Payouts</h3>
                                <p>Get paid daily to your bank account, JazzCash, or Easypaisa</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Earnings Dashboard</h3>
                                <p>Track your daily, weekly, and monthly earnings in real-time</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number"><i class="fas fa-check" style="font-size: 16px;"></i></div>
                            <div class="process-step__content">
                                <h3>Driver Support & Incentives</h3>
                                <p>Dedicated support line, bonuses, and performance rewards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Download CTA -->
    <section class="download-cta">
        <div class="download-cta__bg-shapes">
            <div class="download-cta__circle download-cta__circle--1"></div>
            <div class="download-cta__circle download-cta__circle--2"></div>
        </div>
        <div class="container">
            <div class="download-cta__content" data-animate="fade-up">
                <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="download-cta__logo">
                <h2 class="download-cta__title">Start Your <span class="gradient-text">Journey</span> Today</h2>
                <p class="download-cta__desc">Join <strong>500,000+</strong> users already riding smarter across Pakistan.</p>

                <div class="download-cta__buttons">
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide" class="store-button">
                        <i class="fab fa-google-play"></i>
                        <div>
                            <span>Passenger App</span>
                            <strong>Google Play</strong>
                        </div>
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide_fleet" class="store-button">
                        <i class="fab fa-google-play"></i>
                        <div>
                            <span>Driver / Fleet App</span>
                            <strong>Google Play</strong>
                        </div>
                    </a>
                </div>

                <div class="download-cta__trust">
                    <div class="download-cta__trust-item">
                        <i class="fas fa-star"></i>
                        <span>4.8 Rating</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-download"></i>
                        <span>500K+ Downloads</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>100% Safe & Verified</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
