@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--passenger">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-mobile-alt"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Passenger App</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">SHAREIDE <span class="gradient-text">Passenger App</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Your ultimate ride companion in Pakistan. Book bikes (70cc, 125cc), cars & vans. Bid your own fare, share trips, and travel safely across 15+ Pakistani cities.</p>
        </div>
    </section>

    <!-- Ride Types -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Ride Options</span>
                <h2 class="section__title">Choose Your <span class="gradient-text">Ride Type</span></h2>
                <p class="section__desc">Multiple ride options designed for every need and budget</p>
            </div>

            <div class="three-col">
                <div class="info-card" data-animate="fade-up" data-delay="0">
                    <div class="info-card__icon">
                        <i class="fas fa-motorcycle"></i>
                    </div>
                    <h3 class="info-card__title">Bike Ride</h3>
                    <p class="info-card__text">Quick and affordable motorcycle rides on Honda 70cc & 125cc bikes. Perfect for short distances, beating traffic jams, and budget-friendly daily commutes across Pakistani cities.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="100">
                    <div class="info-card__icon">
                        <i class="fas fa-car"></i>
                    </div>
                    <h3 class="info-card__title">Car Ride</h3>
                    <p class="info-card__text">Get a private car ride just for you. Perfect for daily commutes, office trips, or when you want your own space. Fast pickup, comfortable journey, affordable fares across all cities.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="200">
                    <div class="info-card__icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="info-card__title">Carpool</h3>
                    <p class="info-card__text">Share your ride with others heading the same way and save up to 60% on every trip. Our smart matching algorithm pairs you with co-riders on similar routes for maximum savings.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="300">
                    <div class="info-card__icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3 class="info-card__title">Scheduled Ride</h3>
                    <p class="info-card__text">Plan ahead and never miss a ride. Schedule your trips up to 7 days in advance for airport pickups, early morning flights, important meetings, or your daily office commute.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="400">
                    <div class="info-card__icon">
                        <i class="fas fa-female"></i>
                    </div>
                    <h3 class="info-card__title">Ladies Only</h3>
                    <p class="info-card__text">Exclusively for women riders with verified female or specially vetted drivers. Additional safety features including live family alerts and dedicated support for a secure, comfortable experience.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="500">
                    <div class="info-card__icon">
                        <i class="fas fa-road"></i>
                    </div>
                    <h3 class="info-card__title">Intercity</h3>
                    <p class="info-card__text">Travel between cities with ease. Book intercity rides from Lahore to Islamabad, Karachi to Hyderabad, and more. Comfortable vehicles, fixed fares, and verified long-distance drivers.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Key Features -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Key Features</span>
                <h2 class="section__title">Everything You <span class="gradient-text">Need</span></h2>
                <p class="section__desc">Powerful features that make every ride better</p>
            </div>

            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon">
                        <i class="fas fa-satellite"></i>
                    </div>
                    <h3 class="feature-card__title">Real-time Tracking</h3>
                    <p class="feature-card__desc">Track your driver live on the map from the moment they accept your ride until you reach your destination. Share your live location with family for added peace of mind.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <h3 class="feature-card__title">Bid Your Fare</h3>
                    <p class="feature-card__desc">Set your own price and let drivers accept your bid. No more surge pricing surprises. You decide what you want to pay, and drivers compete for your ride.</p>
                    <div class="feature-card__tag">Most Popular</div>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <h3 class="feature-card__title">Multiple Payment</h3>
                    <p class="feature-card__desc">Pay the way you prefer -- cash, JazzCash, Easypaisa, debit card, or credit card. We support all major payment methods available in Pakistan for maximum convenience.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <h3 class="feature-card__title">Trip Sharing</h3>
                    <p class="feature-card__desc">Share your ride details and live location with trusted contacts via WhatsApp or SMS. Your family and friends can track your journey in real-time until you arrive safely.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-star-half-alt"></i>
                    </div>
                    <h3 class="feature-card__title">Rating System</h3>
                    <p class="feature-card__desc">Rate your driver after every ride and help us maintain quality. Drivers below 4.0 rating are reviewed and retrained. Your feedback directly improves the SHAREIDE experience.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--pink">
                        <i class="fas fa-history"></i>
                    </div>
                    <h3 class="feature-card__title">Ride History</h3>
                    <p class="feature-card__desc">Access complete history of all your rides with detailed receipts, routes, driver information, and fare breakdowns. Easily rebook favourite routes with just one tap.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How to Book -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Simple Process</span>
                <h2 class="section__title">How to <span class="gradient-text">Book a Ride</span></h2>
                <p class="section__desc">Get moving in 4 easy steps</p>
            </div>

            <div class="process-steps" data-animate="fade-up">
                <div class="process-step" data-animate="fade-up" data-delay="0">
                    <div class="process-step__number">1</div>
                    <div class="process-step__content">
                        <h3>Set Your Pickup & Destination</h3>
                        <p>Open the SHAREIDE app and enter your pickup location and where you want to go. Our smart search suggests popular locations, saved addresses, and nearby landmarks across your city.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="100">
                    <div class="process-step__number">2</div>
                    <div class="process-step__content">
                        <h3>Choose Ride Type & Set Your Fare</h3>
                        <p>Select from Solo, Carpool, Premium, Scheduled, Ladies Only, or Intercity. Then either accept the suggested fare or use our unique bid feature to set your own price in PKR.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="200">
                    <div class="process-step__number">3</div>
                    <div class="process-step__content">
                        <h3>Get Matched with a Driver</h3>
                        <p>Nearby CNIC-verified drivers will see your request and accept your ride. View driver details including name, photo, vehicle info, and rating before they arrive. Track them live on the map.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="300">
                    <div class="process-step__number">4</div>
                    <div class="process-step__content">
                        <h3>Ride, Pay & Rate</h3>
                        <p>Enjoy your ride with live GPS tracking and safety features. Pay using cash, JazzCash, Easypaisa, or card when you arrive. Rate your driver and earn reward points for your next trip.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- App Screenshots -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">App Preview</span>
                <h2 class="section__title">See the App in <span class="gradient-text">Action</span></h2>
                <p class="section__desc">A beautifully designed experience built for Pakistani riders</p>
            </div>

            <div class="img-grid-3" data-animate="fade-up">
                <div class="img-grid-3__item" data-animate="fade-up" data-delay="0">
                    <img src="{{ asset('website/images/shareide-images/businesswoman-leaning-car-window-texting-message-phone-smiling-happy-scaled.jpg') }}" alt="Booking a ride on SHAREIDE">
                    <div class="img-grid-3__overlay">
                        <p><i class="fas fa-map-marker-alt"></i> Book Your Ride</p>
                    </div>
                </div>
                <div class="img-grid-3__item" data-animate="fade-up" data-delay="150">
                    <img src="{{ asset('website/images/shareide-images/B-3-scaled.jpg') }}" alt="Riding safely with SHAREIDE">
                    <div class="img-grid-3__overlay">
                        <p><i class="fas fa-shield-alt"></i> Safe & Tracked</p>
                    </div>
                </div>
                <div class="img-grid-3__item" data-animate="fade-up" data-delay="300">
                    <img src="{{ asset('website/images/shareide-images/B-1-1-scaled.jpg') }}" alt="Verified SHAREIDE driver">
                    <div class="img-grid-3__overlay">
                        <p><i class="fas fa-user-check"></i> Verified Drivers</p>
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
@endsection
