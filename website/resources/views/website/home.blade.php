@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/home.css') }}?v={{ time() }}">
@endpush

@section('content')
    <!-- Hero -->
    <section class="hero" id="home">
        <canvas class="hero__particles" id="heroParticles"></canvas>
        <div class="hero__gradient-orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>

        <div class="container hero__container">
            <div class="hero__content" data-animate="fade-right">
                <div class="hero__tag-wrapper">
                    <span class="hero__tag">
                        <i class="fas fa-shield-alt"></i>
                        Pakistan's Safest Ride-Sharing App
                    </span>
                </div>
                <h1 class="hero__title">
                    Safe Rides For<br>
                    <span class="gradient-text" id="typingText">Everyone</span>
                    <span class="typing-cursor">|</span>
                </h1>
                <p class="hero__description">
                    Book bikes, cars &amp; vans with verified drivers. Real-time tracking &amp; women-priority safety. Travel across Pakistan on Honda 70, 125 or car — affordable, smart &amp; secure.
                </p>

                <div class="hero__buttons">
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide" class="btn btn--primary btn--lg btn--glow">
                        <i class="fab fa-google-play"></i>
                        Download Now
                    </a>
                    <a href="{{ route('how-it-works') }}" class="btn btn--glass btn--lg">
                        <i class="fas fa-play-circle"></i>
                        See How It Works
                    </a>
                </div>

                <div class="hero__stats">
                    <div class="hero__stat">
                        <span class="hero__stat-number" data-target="500" data-suffix="K+">0</span>
                        <span class="hero__stat-label">Active Users</span>
                    </div>
                    <div class="hero__stat">
                        <span class="hero__stat-number" data-target="50" data-suffix="K+">0</span>
                        <span class="hero__stat-label">Drivers</span>
                    </div>
                    <div class="hero__stat">
                        <span class="hero__stat-number" data-target="15" data-suffix="+">0</span>
                        <span class="hero__stat-label">Cities</span>
                    </div>
                </div>
            </div>

            <div class="hero__image" data-animate="fade-left">
                <div class="hero__phone-wrapper">
                    <img src="{{ asset('website/images/Banner.png') }}" alt="SHAREIDE App" class="hero__banner-img">
                    <div class="phone-glow"></div>
                </div>

                <div class="floating-card floating-card--1">
                    <div class="floating-card__icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div>
                        <strong>Verified Drivers</strong>
                        <span>CNIC Verified</span>
                    </div>
                </div>
                <div class="floating-card floating-card--2">
                    <div class="floating-card__icon floating-card__icon--green">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div>
                        <strong>Save 60%</strong>
                        <span>With Carpool</span>
                    </div>
                </div>
                <div class="floating-card floating-card--3">
                    <div class="floating-card__icon floating-card__icon--blue">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                        <strong>Live Tracking</strong>
                        <span>Real-time GPS</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="hero__scroll-indicator">
            <div class="scroll-mouse">
                <div class="scroll-mouse__wheel"></div>
            </div>
            <span>Scroll Down</span>
        </div>
    </section>

    <!-- Cities Marquee -->
    <section class="cities-marquee">
        <div class="marquee-track">
            <div class="marquee-content">
                <span class="city-item"><i class="fas fa-map-pin"></i> Karachi</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Lahore</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Islamabad</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Rawalpindi</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Faisalabad</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Multan</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Peshawar</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Quetta</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Karachi</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Lahore</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Islamabad</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Rawalpindi</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Faisalabad</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Multan</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Peshawar</span>
                <span class="city-item"><i class="fas fa-map-pin"></i> Quetta</span>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Features</span>
                <h2 class="section__title">Why Choose <span class="gradient-text">SHAREIDE</span>?</h2>
                <p class="section__desc">Everything you need for a smarter, safer ride experience</p>
            </div>

            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="feature-card__title">Carpool & Save</h3>
                    <p class="feature-card__desc">Share rides with others heading your way. Split costs and save up to 60% on every trip.</p>
                    <div class="feature-card__tag">Most Popular</div>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <h3 class="feature-card__title">Bid Your Price</h3>
                    <p class="feature-card__desc">Set your own fare. Negotiate with drivers and get the best deal every time.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-card__title">100% Safe</h3>
                    <p class="feature-card__desc">All drivers are CNIC verified through NADRA. Live tracking and SOS button for safety.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-gift"></i>
                    </div>
                    <h3 class="feature-card__title">Earn Rewards</h3>
                    <p class="feature-card__desc">Get cashback on every ride. Unlock tiers and enjoy exclusive discounts.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="feature-card__title">Schedule Rides</h3>
                    <p class="feature-card__desc">Book in advance for airport trips, meetings, or daily commute. Never miss a ride.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--pink">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <h3 class="feature-card__title">Easy Payment</h3>
                    <p class="feature-card__desc">Pay with cash, JazzCash, Easypaisa, or cards. Your choice, your convenience.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="how" id="how">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Simple Process</span>
                <h2 class="section__title">Book a Ride in <span class="gradient-text">Seconds</span></h2>
                <p class="section__desc">4 easy steps to get moving</p>
            </div>

            <div class="how__timeline">
                <div class="how__timeline-line">
                    <div class="how__timeline-progress" id="timelineProgress"></div>
                </div>

                <div class="how__step" data-animate="fade-up" data-delay="0">
                    <div class="how__step-marker">
                        <div class="how__step-number">1</div>
                        <div class="how__step-pulse"></div>
                    </div>
                    <div class="how__step-card">
                        <div class="how__step-icon"><i class="fas fa-map-marker-alt"></i></div>
                        <h3>Set Your Location</h3>
                        <p>Enter pickup and drop-off points on the map</p>
                    </div>
                </div>

                <div class="how__step" data-animate="fade-up" data-delay="150">
                    <div class="how__step-marker">
                        <div class="how__step-number">2</div>
                        <div class="how__step-pulse"></div>
                    </div>
                    <div class="how__step-card">
                        <div class="how__step-icon"><i class="fas fa-car-side"></i></div>
                        <h3>Choose Ride Type</h3>
                        <p>Select solo, carpool, or premium ride</p>
                    </div>
                </div>

                <div class="how__step" data-animate="fade-up" data-delay="300">
                    <div class="how__step-marker">
                        <div class="how__step-number">3</div>
                        <div class="how__step-pulse"></div>
                    </div>
                    <div class="how__step-card">
                        <div class="how__step-icon"><i class="fas fa-handshake"></i></div>
                        <h3>Get Matched</h3>
                        <p>We find the best driver near you instantly</p>
                    </div>
                </div>

                <div class="how__step" data-animate="fade-up" data-delay="450">
                    <div class="how__step-marker">
                        <div class="how__step-number">4</div>
                        <div class="how__step-pulse"></div>
                    </div>
                    <div class="how__step-card">
                        <div class="how__step-icon"><i class="fas fa-smile-beam"></i></div>
                        <h3>Enjoy Your Ride</h3>
                        <p>Track, ride, and rate your experience</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Success Stories (AWS-inspired) -->
    <section class="stories" id="stories">
        <div class="container">
            <div class="stories__header" data-animate="fade-up">
                <span class="section__tag">Success Stories</span>
                <h2 class="section__title">
                    From students to professionals —<br>
                    <span class="gradient-text">SHAREIDE is how Pakistan moves smarter</span>
                </h2>
                <p class="section__desc">Join thousands of smart commuters choosing safer, affordable rides every day</p>
            </div>

            <div class="stories__carousel" data-animate="fade-up" data-delay="200">
                <div class="stories__stage" id="storiesStage">
                    <!-- Card 1 - Corporate Carpool -->
                    <div class="stories__card stories__card--active" data-index="0" style="background-image: url('{{ asset('website/images/shareide-images/B-2-scaled.jpg') }}');">
                        <div class="stories__card-overlay"></div>
                        <div class="stories__card-badge">
                            <i class="fas fa-graduation-cap"></i> Students
                        </div>
                        <div class="stories__card-content">
                            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="stories__card-logo">
                            <h3 class="stories__card-title">University students save up to 60% on daily commute with SHAREIDE Carpool across Lahore & Karachi</h3>
                            <a href="{{ route('carpool') }}" class="stories__card-link">
                                View the story <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Card 2 - Women Safety -->
                    <div class="stories__card" data-index="1" style="background-image: url('{{ asset('website/images/shareide-images/B-3-scaled.jpg') }}');">
                        <div class="stories__card-overlay"></div>
                        <div class="stories__card-badge stories__card-badge--pink">
                            <i class="fas fa-shield-alt"></i> Women Safety
                        </div>
                        <div class="stories__card-content">
                            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="stories__card-logo">
                            <h3 class="stories__card-title">Pakistani working women feel 100% safe with CNIC verified drivers, SOS alerts & live trip sharing</h3>
                            <a href="{{ route('safety') }}" class="stories__card-link">
                                View the story <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Card 3 - Verified Drivers -->
                    <div class="stories__card" data-index="2" style="background-image: url('{{ asset('website/images/shareide-images/B-1-1-scaled.jpg') }}');">
                        <div class="stories__card-overlay"></div>
                        <div class="stories__card-badge stories__card-badge--green">
                            <i class="fas fa-motorcycle"></i> Bike Riders
                        </div>
                        <div class="stories__card-content">
                            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="stories__card-logo">
                            <h3 class="stories__card-title">70cc & 125cc bike riders earn daily with SHAREIDE - set your own fare, no surge pricing</h3>
                            <a href="{{ route('how-it-works') }}" class="stories__card-link">
                                View the story <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Card 4 - Daily Commuters -->
                    <div class="stories__card" data-index="3" style="background-image: url('{{ asset('website/images/shareide-images/close-up-businesswoman-sitting-car-using-smartphone-scaled.jpg') }}');">
                        <div class="stories__card-overlay"></div>
                        <div class="stories__card-badge stories__card-badge--blue">
                            <i class="fas fa-car"></i> Daily Commuters
                        </div>
                        <div class="stories__card-content">
                            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="stories__card-logo">
                            <h3 class="stories__card-title">Professionals bid their own fare & skip surge pricing on everyday office rides in Pakistan</h3>
                            <a href="{{ route('shareide-app') }}" class="stories__card-link">
                                View the story <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Card 5 - Pakistani Families -->
                    <div class="stories__card" data-index="4" style="background-image: url('{{ asset('website/images/shareide-images/sdfsdfsdfsdfsdffsfsdfUntitled-1 (1).jpg') }}');">
                        <div class="stories__card-overlay"></div>
                        <div class="stories__card-badge stories__card-badge--orange">
                            <i class="fas fa-home"></i> Families
                        </div>
                        <div class="stories__card-content">
                            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="stories__card-logo">
                            <h3 class="stories__card-title">Pakistani families trust SHAREIDE for kids' school pickups with live GPS tracking & SOS alerts</h3>
                            <a href="{{ route('safety') }}" class="stories__card-link">
                                View the story <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Carousel Controls (Centered) -->
                <div class="stories__controls">
                    <button class="stories__nav stories__nav--prev" id="storiesPrev" aria-label="Previous">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="stories__pagination">
                        <span class="stories__page-current" id="storiesCurrent">1</span>
                        <span class="stories__page-sep">/</span>
                        <span class="stories__page-total">5</span>
                    </div>
                    <button class="stories__nav stories__nav--next" id="storiesNext" aria-label="Next">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="stories__footer" data-animate="fade-up" data-delay="300">
                <a href="{{ route('about') }}" class="btn btn--glass btn--sm">
                    View all stories <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Safety -->
    <section class="safety-v2" id="safety">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Safety First</span>
                <h2 class="section__title">Your Safety is Our <span class="gradient-text">Priority</span></h2>
                <p class="section__desc">Multiple layers of protection built into every ride</p>
            </div>

            <div class="safety-v2__bento" data-animate="fade-up" data-delay="200">
                <!-- Large hero card -->
                <div class="safety-v2__hero-card">
                    <img src="{{ asset('website/images/shareide-images/Verified-Drivers-1.png') }}" alt="SHAREIDE Verified Drivers" class="safety-v2__hero-img">
                    <div class="safety-v2__hero-overlay">
                        <div class="safety-v2__hero-badge">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h3>100% NADRA Verified</h3>
                        <p>Every driver passes CNIC verification through NADRA before their first ride</p>
                    </div>
                </div>

                <!-- Feature cards -->
                <div class="safety-v2__card">
                    <div class="safety-v2__card-icon safety-v2__card-icon--blue">
                        <i class="fas fa-satellite"></i>
                    </div>
                    <h4>Live GPS Tracking</h4>
                    <p>Real-time location sharing with family</p>
                </div>

                <div class="safety-v2__card">
                    <div class="safety-v2__card-icon safety-v2__card-icon--red">
                        <i class="fas fa-phone-volume"></i>
                    </div>
                    <h4>Emergency SOS</h4>
                    <p>One-tap emergency alert to authorities</p>
                </div>

                <div class="safety-v2__card">
                    <div class="safety-v2__card-icon safety-v2__card-icon--purple">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <h4>Trip Sharing</h4>
                    <p>Share live ride with loved ones</p>
                </div>

                <div class="safety-v2__card">
                    <div class="safety-v2__card-icon safety-v2__card-icon--teal">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h4>24/7 Support</h4>
                    <p>Always here when you need us</p>
                </div>

                <div class="safety-v2__card">
                    <div class="safety-v2__card-icon safety-v2__card-icon--orange">
                        <i class="fas fa-file-shield"></i>
                    </div>
                    <h4>Ride Insurance</h4>
                    <p>Every trip is fully covered</p>
                </div>

                <!-- Stats strip card -->
                <div class="safety-v2__stats-card">
                    <div class="safety-v2__stat">
                        <span class="safety-v2__stat-num">99.9%</span>
                        <span class="safety-v2__stat-label">Safe Rides</span>
                    </div>
                    <div class="safety-v2__stat-divider"></div>
                    <div class="safety-v2__stat">
                        <span class="safety-v2__stat-num">24/7</span>
                        <span class="safety-v2__stat-label">Live Support</span>
                    </div>
                    <div class="safety-v2__stat-divider"></div>
                    <div class="safety-v2__stat">
                        <span class="safety-v2__stat-num">Live</span>
                        <span class="safety-v2__stat-label">GPS Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Reviews</span>
                <h2 class="section__title">What Our <span class="gradient-text">Users Say</span></h2>
                <p class="section__desc">Trusted by thousands of riders across Pakistan</p>
            </div>

            <div class="testimonials__grid">
                <div class="testimonial-card" data-animate="fade-up" data-delay="0">
                    <div class="testimonial-card__quote"><i class="fas fa-quote-left"></i></div>
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"SHAREIDE saves me Rs. 5000 every month! The carpool feature is amazing. Best ride app in Pakistan."</p>
                    <div class="testimonial-card__author">
                        <div class="testimonial-card__avatar-wrapper">
                            <div class="testimonial-card__avatar testimonial-card__avatar--initial" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#1a1a2e;">A</div>
                        </div>
                        <div>
                            <strong>Ahmed Raza</strong>
                            <span><i class="fas fa-map-pin"></i> Karachi</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card testimonial-card--featured" data-animate="fade-up" data-delay="150">
                    <div class="testimonial-card__quote"><i class="fas fa-quote-left"></i></div>
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"As a woman, safety matters most. SHAREIDE's CNIC verified drivers and SOS feature give me complete peace of mind."</p>
                    <div class="testimonial-card__author">
                        <div class="testimonial-card__avatar-wrapper">
                            <div class="testimonial-card__avatar testimonial-card__avatar--initial" style="background: linear-gradient(135deg, #ec4899, #f472b6); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff;">A</div>
                        </div>
                        <div>
                            <strong>Ayesha Malik</strong>
                            <span><i class="fas fa-map-pin"></i> Lahore</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card" data-animate="fade-up" data-delay="300">
                    <div class="testimonial-card__quote"><i class="fas fa-quote-left"></i></div>
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"Love the bidding feature! I negotiate my own fare on my Honda 125. No more surge pricing surprises. Best app for Pakistani riders!"</p>
                    <div class="testimonial-card__author">
                        <div class="testimonial-card__avatar-wrapper">
                            <div class="testimonial-card__avatar testimonial-card__avatar--initial" style="background: linear-gradient(135deg, #3b82f6, #60a5fa); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:800; color:#fff;">U</div>
                        </div>
                        <div>
                            <strong>Usman Ali</strong>
                            <span><i class="fas fa-map-pin"></i> Islamabad</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Download CTA -->
    <section class="download-cta" id="download">
        <div class="download-cta__bg-shapes">
            <div class="download-cta__circle download-cta__circle--1"></div>
            <div class="download-cta__circle download-cta__circle--2"></div>
        </div>
        <div class="container">
            <div class="download-cta__content" data-animate="fade-up">
                <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="download-cta__logo">
                <h2 class="download-cta__title">Ready to <span class="gradient-text">Ride</span>?</h2>
                <p class="download-cta__desc">Download SHAREIDE now and get <strong>50% off</strong> your first ride!</p>

                <div class="download-cta__buttons">
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide" class="store-button">
                        <i class="fab fa-google-play"></i>
                        <div>
                            <span>Get it on</span>
                            <strong>Google Play</strong>
                        </div>
                    </a>
                    <a href="#" class="store-button">
                        <i class="fab fa-apple"></i>
                        <div>
                            <span>Coming soon on</span>
                            <strong>App Store</strong>
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
                        <i class="fas fa-heart"></i>
                        <span>Loved by Users</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Drive CTA -->
    <section class="drive-cta">
        <div class="container">
            <div class="drive-cta__card" data-animate="fade-up">
                <div class="drive-cta__content">
                    <span class="drive-cta__badge">
                        <i class="fas fa-car"></i> For Drivers
                    </span>
                    <h2>Want to <span class="gradient-text-dark">Earn Money</span>?</h2>
                    <p>Join 50,000+ drivers earning on their own schedule. Low commission, daily payouts, and full support.</p>
                    <div class="drive-cta__stats">
                        <div class="drive-cta__stat">
                            <strong>50K+</strong>
                            <span>Active Drivers</span>
                        </div>
                        <div class="drive-cta__stat">
                            <strong>Low</strong>
                            <span>Commission</span>
                        </div>
                        <div class="drive-cta__stat">
                            <strong>Daily</strong>
                            <span>Payouts</span>
                        </div>
                    </div>
                    <a href="{{ route('drive-with-us') }}" class="btn btn--dark btn--lg">
                        Become a Driver
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="drive-cta__visual">
                    <img src="{{ asset('website/images/shareide-images/Verified-Drivers.png') }}" alt="SHAREIDE Verified Driver" class="drive-cta__image">
                </div>
            </div>
        </div>
    </section>
@endsection

@push('scripts')
<script src="{{ asset('website/js/home.js') }}"></script>
@endpush
