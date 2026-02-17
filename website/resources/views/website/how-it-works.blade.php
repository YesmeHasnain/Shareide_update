@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--services">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-play-circle"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">How It Works</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">How It <span class="gradient-text">Works</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Whether you are a passenger looking for an affordable ride or a driver ready to earn, getting started with SHAREIDE is quick and easy.</p>
        </div>
    </section>

    <!-- Tab Switcher: Passenger & Driver Flow -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Step by Step</span>
                <h2 class="section__title">Getting Started is <span class="gradient-text">Simple</span></h2>
                <p class="section__desc">Choose your journey - ride or drive</p>
            </div>

            <div class="tabs" data-animate="fade-up">
                <button class="tab-btn active" data-tab="passengers">
                    <i class="fas fa-user"></i> For Passengers
                </button>
                <button class="tab-btn" data-tab="drivers">
                    <i class="fas fa-car"></i> For Drivers
                </button>
            </div>

            <!-- Passenger Tab -->
            <div class="tab-content active" id="tab-passengers">
                <div class="process-steps" data-animate="fade-up">
                    <div class="process-step" data-animate="fade-up" data-delay="0">
                        <div class="process-step__number">1</div>
                        <div class="process-step__content">
                            <h3>Download the App</h3>
                            <p>Get the SHAREIDE passenger app from Google Play Store. It takes less than a minute to install and set up your account with your phone number.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="100">
                        <div class="process-step__number">2</div>
                        <div class="process-step__content">
                            <h3>Set Your Location</h3>
                            <p>Enter your pickup and drop-off points on the map. Our smart location system auto-detects your current position for faster booking across all major Pakistani cities.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="200">
                        <div class="process-step__number">3</div>
                        <div class="process-step__content">
                            <h3>Choose Your Ride Type</h3>
                            <p>Select from Solo, Carpool, Premium, Scheduled, or Ladies Only rides. Set your budget or bid your own fare to get the best deal every time.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="300">
                        <div class="process-step__number">4</div>
                        <div class="process-step__content">
                            <h3>Get Matched Instantly</h3>
                            <p>Our algorithm finds the nearest CNIC-verified driver for you in seconds. Track their arrival in real-time on the map and share your trip with family.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="400">
                        <div class="process-step__number">5</div>
                        <div class="process-step__content">
                            <h3>Enjoy Your Ride</h3>
                            <p>Sit back, relax, and enjoy the journey. Pay with cash, JazzCash, Easypaisa, or card. Rate your driver and earn loyalty points on every trip.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Driver Tab -->
            <div class="tab-content" id="tab-drivers">
                <div class="process-steps" data-animate="fade-up">
                    <div class="process-step" data-animate="fade-up" data-delay="0">
                        <div class="process-step__number">1</div>
                        <div class="process-step__content">
                            <h3>Download the Fleet App</h3>
                            <p>Get the SHAREIDE Fleet app from Google Play Store. This is the dedicated driver app built to help you manage rides and earnings efficiently.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="100">
                        <div class="process-step__number">2</div>
                        <div class="process-step__content">
                            <h3>Submit Your Documents</h3>
                            <p>Upload your CNIC, driving license, vehicle registration, and a clear profile photo. Our streamlined process makes document submission quick and hassle-free.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="200">
                        <div class="process-step__number">3</div>
                        <div class="process-step__content">
                            <h3>Get Verified</h3>
                            <p>Our team verifies your documents through NADRA and reviews your profile. Verification is typically completed within 24-48 hours so you can start driving fast.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="300">
                        <div class="process-step__number">4</div>
                        <div class="process-step__content">
                            <h3>Accept Rides</h3>
                            <p>Go online whenever you want. Receive ride requests from nearby passengers, review the fare and destination, then accept rides that work for your schedule.</p>
                        </div>
                    </div>
                    <div class="process-step" data-animate="fade-up" data-delay="400">
                        <div class="process-step__number">5</div>
                        <div class="process-step__content">
                            <h3>Earn Money</h3>
                            <p>Complete rides and earn competitive fares with low commission rates. Get daily payouts to your bank account or JazzCash/Easypaisa wallet. The more you drive, the more you earn.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Ride Types -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Ride Options</span>
                <h2 class="section__title">Choose Your <span class="gradient-text">Ride Type</span></h2>
                <p class="section__desc">Multiple options for every need and budget</p>
            </div>

            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon">
                        <i class="fas fa-car"></i>
                    </div>
                    <h3 class="feature-card__title">Solo Ride</h3>
                    <p class="feature-card__desc">A private ride just for you. Get picked up and dropped off at your exact location with no other stops along the way.</p>
                    <div class="feature-card__tag">Most Popular</div>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="feature-card__title">Carpool</h3>
                    <p class="feature-card__desc">Share your ride with others heading the same way. Save up to 60% on fares while helping reduce traffic and emissions.</p>
                    <div class="feature-card__tag">Save 60%</div>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3 class="feature-card__title">Premium</h3>
                    <p class="feature-card__desc">Travel in style with top-rated drivers and premium vehicles. Enjoy extra comfort with leather seats, AC, and water bottles.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <h3 class="feature-card__title">Scheduled</h3>
                    <p class="feature-card__desc">Book rides in advance for airport trips, meetings, or your daily commute. Set it and forget it - your driver arrives on time.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--pink">
                        <i class="fas fa-female"></i>
                    </div>
                    <h3 class="feature-card__title">Ladies Only</h3>
                    <p class="feature-card__desc">Exclusive rides for women passengers with verified female drivers. Extra safety features and a comfortable travel experience.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-road"></i>
                    </div>
                    <h3 class="feature-card__title">Intercity</h3>
                    <p class="feature-card__desc">Travel between cities at affordable rates. Book solo or share rides from Lahore to Islamabad, Karachi to Hyderabad, and more.</p>
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
                <h2 class="download-cta__title">Ready to <span class="gradient-text">Get Started</span>?</h2>
                <p class="download-cta__desc">Download SHAREIDE now and experience the smartest way to travel across Pakistan.</p>

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

@push('scripts')
<script>
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
            btn.classList.add('active');
            var tabId = 'tab-' + btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
</script>
@endpush
