@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--carpool">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-users"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Carpooling</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Carpooling & <span class="gradient-text">Shared Rides</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Share your ride, split the fare, and save up to 60% on every trip. Travel smarter, greener, and more affordably across Pakistan.</p>
        </div>
    </section>

    <!-- Carpool Image Banner -->
    <section class="content-section" style="padding-bottom: 0;">
        <div class="container">
            <div class="img-banner" data-animate="fade-up">
                <img src="{{ asset('website/images/shareide-images/B-2-scaled.jpg') }}" alt="SHAREIDE Carpool - Corporate commuters sharing rides">
                <div class="img-banner__overlay">
                    <h3>Share the Ride, Save the Cost</h3>
                    <p>Join thousands of professionals saving 60% on daily commutes</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How Carpooling Works -->
    <section class="content-section">
        <div class="container">
            <div class="two-col">
                <div data-animate="fade-right">
                    <span class="section__tag">Smart Carpooling</span>
                    <h2 class="section__title" style="text-align: left;">How Carpooling <span class="gradient-text">Works</span></h2>
                    <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        SHAREIDE carpooling connects you with fellow travelers heading in the same direction. Our smart algorithm finds the best matches based on your route, timing, and preferences - so you save money without going out of your way.
                    </p>
                    <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        Whether you are commuting daily from DHA to Blue Area or heading from Gulshan to Saddar, there are always people traveling your route. Share the ride, split the cost, and make your commute social.
                    </p>
                    <a href="{{ route('download') }}" class="btn btn--primary btn--lg" style="margin-top: 10px;">
                        <i class="fas fa-download"></i> Try Carpooling Now
                    </a>
                </div>
                <div data-animate="fade-left">
                    <div class="process-steps">
                        <div class="process-step">
                            <div class="process-step__number">1</div>
                            <div class="process-step__content">
                                <h3>Enter Your Route</h3>
                                <p>Set your pickup and drop-off location, then select "Carpool" as your ride type</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number">2</div>
                            <div class="process-step__content">
                                <h3>Get Matched</h3>
                                <p>Our algorithm finds riders heading the same way and pairs you together</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number">3</div>
                            <div class="process-step__content">
                                <h3>Share & Save</h3>
                                <p>Ride together, split the fare automatically, and save up to 60%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Eco Impact Visual -->
    <section class="content-section" style="padding-bottom: 0;">
        <div class="container">
            <div class="img-flex" data-animate="fade-up">
                <div class="img-flex__illustration">
                    <img src="{{ asset('website/images/shareide-images/Reducing-Carbon-Footprint-.png') }}" alt="Reducing Carbon Footprint with Carpooling">
                </div>
                <div class="img-flex__illustration" style="max-width: 400px;">
                    <img src="{{ asset('website/images/shareide-images/Corporate-Commuting-Solution.png') }}" alt="Corporate Commuting with SHAREIDE" style="border-radius: 16px;">
                </div>
            </div>
        </div>
    </section>

    <!-- Carpool Stats -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Impact</span>
                <h2 class="section__title">Carpooling by the <span class="gradient-text">Numbers</span></h2>
                <p class="section__desc">Making a real difference across Pakistan</p>
            </div>

            <div class="stat-grid" data-animate="fade-up">
                <div class="stat-card" data-animate="fade-up" data-delay="0">
                    <div class="stat-card__number" data-target="60" data-suffix="%">0</div>
                    <div class="stat-card__label">Average Savings</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="100">
                    <div class="stat-card__number" data-target="1" data-suffix="M+">0</div>
                    <div class="stat-card__label">Shared Rides Completed</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="200">
                    <div class="stat-card__number" data-target="50" data-suffix="K">0</div>
                    <div class="stat-card__label">Tons CO2 Saved</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="300">
                    <div class="stat-card__number" data-target="15" data-suffix="+">0</div>
                    <div class="stat-card__label">Cities Available</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Carpool Features -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Features</span>
                <h2 class="section__title">Why SHAREIDE <span class="gradient-text">Carpooling</span>?</h2>
                <p class="section__desc">Built for the Pakistani commuter</p>
            </div>

            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3 class="feature-card__title">Smart Matching</h3>
                    <p class="feature-card__desc">Our AI-powered algorithm matches you with riders heading the same direction, optimizing routes to minimize detours and maximize savings.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-route"></i>
                    </div>
                    <h3 class="feature-card__title">Flexible Routes</h3>
                    <p class="feature-card__desc">Carpool across any route in the city. From daily office commutes on Shahrah-e-Faisal to university runs on GT Road - we cover it all.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <h3 class="feature-card__title">Split Fare</h3>
                    <p class="feature-card__desc">Fares are automatically calculated and split fairly among all riders. No awkward money conversations - the app handles everything transparently.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3 class="feature-card__title">Safety Verified</h3>
                    <p class="feature-card__desc">All drivers and riders are CNIC verified. Live tracking, in-app chat, SOS button, and trip sharing keep everyone safe throughout the journey.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-satellite-dish"></i>
                    </div>
                    <h3 class="feature-card__title">Real-time Tracking</h3>
                    <p class="feature-card__desc">Track your carpool ride in real-time on the map. Know exactly when your driver will arrive and share your live location with family and friends.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--teal">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <h3 class="feature-card__title">Eco-Friendly</h3>
                    <p class="feature-card__desc">Reduce your carbon footprint by sharing rides. Fewer cars on the road means less traffic in Lahore, Karachi, and Islamabad - better for everyone.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Bidding System -->
    <section class="content-section--alt">
        <div class="container">
            <div class="two-col two-col--reverse">
                <div data-animate="fade-left">
                    <span class="section__tag">Unique Feature</span>
                    <h2 class="section__title" style="text-align: left;">Bid Your <span class="gradient-text">Own Fare</span></h2>
                    <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        Unlike other ride-sharing apps, SHAREIDE lets you set your own price for carpool rides. Our bidding system puts you in control of what you pay.
                    </p>
                    <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        Simply enter your desired fare when booking a carpool ride. Drivers who accept your bid will pick you up. No surge pricing surprises - you decide what is fair, and drivers choose whether to accept.
                    </p>
                    <p style="font-size: 17px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 25px;">
                        This transparent system works especially well for daily commuters who know their routes and can set competitive, fair prices that benefit both riders and drivers.
                    </p>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <a href="{{ route('download') }}" class="btn btn--primary btn--lg">
                            <i class="fas fa-download"></i> Download & Try
                        </a>
                        <a href="{{ route('how-it-works') }}" class="btn btn--glass btn--lg">
                            Learn More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                <div data-animate="fade-right">
                    <div class="process-steps">
                        <div class="process-step">
                            <div class="process-step__number">1</div>
                            <div class="process-step__content">
                                <h3>Set Your Budget</h3>
                                <p>Enter the fare you are willing to pay for your carpool ride</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number">2</div>
                            <div class="process-step__content">
                                <h3>Drivers See Your Bid</h3>
                                <p>Nearby drivers review your bid along with route details</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number">3</div>
                            <div class="process-step__content">
                                <h3>Get Accepted</h3>
                                <p>A driver accepts your fare and you are matched instantly</p>
                            </div>
                        </div>
                        <div class="process-step">
                            <div class="process-step__number">4</div>
                            <div class="process-step__content">
                                <h3>Ride & Save</h3>
                                <p>Enjoy your ride at the price you chose - no hidden charges</p>
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
                <h2 class="download-cta__title">Start <span class="gradient-text">Carpooling</span> Today</h2>
                <p class="download-cta__desc">Save up to <strong>60%</strong> on every ride. Download SHAREIDE and share your first trip.</p>

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
                        <i class="fas fa-users"></i>
                        <span>1M+ Shared Rides</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-leaf"></i>
                        <span>Eco-Friendly</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-piggy-bank"></i>
                        <span>Save 60%</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
