@extends('website.layouts.app')

@section('content')
    <!-- Hero -->
    <section class="hero" id="home">
        <div class="hero__shapes">
            <div class="shape shape--1"></div>
            <div class="shape shape--2"></div>
            <div class="shape shape--3"></div>
        </div>

        <div class="container hero__container">
            <div class="hero__content">
                <span class="hero__tag">
                    <i class="fas fa-bolt"></i> #1 Ride Sharing in Pakistan
                </span>
                <h1 class="hero__title">
                    Your Ride,<br>
                    <span class="gradient-text">Your Way</span>
                </h1>
                <p class="hero__description">
                    Book affordable rides, share trips with others, and travel smarter across Pakistan. Save up to 60% on every journey.
                </p>

                <div class="hero__buttons">
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide" class="btn btn--primary btn--lg">
                        <i class="fab fa-google-play"></i>
                        Download Now
                    </a>
                    <a href="#how" class="btn btn--outline btn--lg">
                        <i class="fas fa-play-circle"></i>
                        See How It Works
                    </a>
                </div>

                <div class="hero__stats">
                    <div class="hero__stat">
                        <span class="hero__stat-number">500K+</span>
                        <span class="hero__stat-label">Active Users</span>
                    </div>
                    <div class="hero__stat">
                        <span class="hero__stat-number">50K+</span>
                        <span class="hero__stat-label">Drivers</span>
                    </div>
                    <div class="hero__stat">
                        <span class="hero__stat-number">15+</span>
                        <span class="hero__stat-label">Cities</span>
                    </div>
                </div>
            </div>

            <div class="hero__image">
                <div class="phone-mockup">
                    <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=800&fit=crop&q=80" alt="SHAREIDE App">
                </div>
                <div class="floating-card floating-card--1">
                    <i class="fas fa-shield-alt"></i>
                    <span>Verified Drivers</span>
                </div>
                <div class="floating-card floating-card--2">
                    <i class="fas fa-wallet"></i>
                    <span>Save 60%</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Brands/Trust -->
    <section class="brands">
        <div class="container">
            <p class="brands__text">Trusted by thousands across Pakistan</p>
            <div class="brands__logos">
                <span>Karachi</span>
                <span>Lahore</span>
                <span>Islamabad</span>
                <span>Rawalpindi</span>
                <span>Faisalabad</span>
                <span>Multan</span>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
        <div class="container">
            <div class="section__header">
                <span class="section__tag">Features</span>
                <h2 class="section__title">Why Choose SHAREIDE?</h2>
                <p class="section__desc">Everything you need for a better ride experience</p>
            </div>

            <div class="features__grid">
                <div class="feature-card">
                    <div class="feature-card__icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="feature-card__title">Carpool & Save</h3>
                    <p class="feature-card__desc">Share rides with others heading your way. Split costs and save up to 60% on every trip.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-card__icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <h3 class="feature-card__title">Bid Your Price</h3>
                    <p class="feature-card__desc">Set your own fare. Negotiate with drivers and get the best deal every time.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-card__icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-card__title">100% Safe</h3>
                    <p class="feature-card__desc">All drivers are CNIC verified through NADRA. Live tracking and SOS button for safety.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-card__icon">
                        <i class="fas fa-gift"></i>
                    </div>
                    <h3 class="feature-card__title">Earn Rewards</h3>
                    <p class="feature-card__desc">Get cashback on every ride. Unlock tiers and enjoy exclusive discounts.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-card__icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="feature-card__title">Schedule Rides</h3>
                    <p class="feature-card__desc">Book in advance for airport trips, meetings, or daily commute. Never miss a ride.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-card__icon">
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
            <div class="section__header">
                <span class="section__tag">Simple Process</span>
                <h2 class="section__title">Book a Ride in Seconds</h2>
                <p class="section__desc">4 easy steps to get moving</p>
            </div>

            <div class="how__steps">
                <div class="how__step">
                    <div class="how__step-number">1</div>
                    <div class="how__step-content">
                        <h3>Set Your Location</h3>
                        <p>Enter pickup and drop-off points</p>
                    </div>
                </div>

                <div class="how__step">
                    <div class="how__step-number">2</div>
                    <div class="how__step-content">
                        <h3>Choose Ride Type</h3>
                        <p>Select solo, carpool, or premium</p>
                    </div>
                </div>

                <div class="how__step">
                    <div class="how__step-number">3</div>
                    <div class="how__step-content">
                        <h3>Get Matched</h3>
                        <p>We find the best driver for you</p>
                    </div>
                </div>

                <div class="how__step">
                    <div class="how__step-number">4</div>
                    <div class="how__step-content">
                        <h3>Enjoy Your Ride</h3>
                        <p>Track, ride, and rate your driver</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Safety -->
    <section class="safety" id="safety">
        <div class="container">
            <div class="safety__grid">
                <div class="safety__content">
                    <span class="section__tag">Safety First</span>
                    <h2 class="section__title">Your Safety is Our Priority</h2>
                    <p class="safety__desc">We've built multiple layers of protection to ensure every ride is safe and secure.</p>

                    <ul class="safety__list">
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>CNIC Verified Drivers (NADRA)</span>
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>Live GPS Tracking</span>
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>Emergency SOS Button</span>
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>Share Trip with Family</span>
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>24/7 Support Team</span>
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            <span>Ride Insurance</span>
                        </li>
                    </ul>
                </div>

                <div class="safety__image">
                    <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=500&fit=crop&q=80" alt="Safety Features">
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
        <div class="container">
            <div class="section__header">
                <span class="section__tag">Reviews</span>
                <h2 class="section__title">What Our Users Say</h2>
            </div>

            <div class="testimonials__grid">
                <div class="testimonial-card">
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"SHAREIDE saves me Rs. 5000 every month! The carpool feature is amazing. Best ride app in Pakistan."</p>
                    <div class="testimonial-card__author">
                        <img class="testimonial-card__avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" alt="Sarah">
                        <div>
                            <strong>Sarah Ahmed</strong>
                            <span>Karachi</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"As a woman, safety matters most. SHAREIDE's verified drivers and SOS feature give me peace of mind."</p>
                    <div class="testimonial-card__author">
                        <img class="testimonial-card__avatar" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80" alt="Ayesha">
                        <div>
                            <strong>Ayesha Malik</strong>
                            <span>Lahore</span>
                        </div>
                    </div>
                </div>

                <div class="testimonial-card">
                    <div class="testimonial-card__stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="testimonial-card__text">"Love the bidding feature! I negotiate my own fare. No more surge pricing surprises."</p>
                    <div class="testimonial-card__author">
                        <img class="testimonial-card__avatar" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" alt="Fatima">
                        <div>
                            <strong>Fatima Khan</strong>
                            <span>Islamabad</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Download CTA -->
    <section class="download" id="download">
        <div class="container">
            <div class="download__content">
                <h2 class="download__title">Ready to Ride?</h2>
                <p class="download__desc">Download SHAREIDE now and get 50% off your first ride!</p>

                <div class="download__buttons">
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
                            <span>Download on</span>
                            <strong>App Store</strong>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Drive CTA -->
    <section class="drive-cta">
        <div class="container">
            <div class="drive-cta__card">
                <div class="drive-cta__content">
                    <h2>Want to Earn Money?</h2>
                    <p>Join 50,000+ drivers earning on their own schedule. Low commission, daily payouts.</p>
                    <a href="#" class="btn btn--dark btn--lg">Become a Driver</a>
                </div>
                <div class="drive-cta__image">
                    <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&q=80" alt="Driver">
                </div>
            </div>
        </div>
    </section>
@endsection
