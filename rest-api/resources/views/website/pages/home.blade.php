@extends('website.layouts.app')

@section('title', 'SHAREIDE - Ride Together, Save Together | Pakistan\'s #1 Ride-Sharing App')
@section('meta_description', 'SHAREIDE is Pakistan\'s premier ride-sharing platform. Book affordable, safe rides in Karachi, Lahore, Islamabad. Download now and get 50% off your first ride!')

@section('content')
<!-- Hero Section -->
<section class="hero">
    <div class="hero-bg">
        <div class="hero-pattern"></div>
    </div>

    <div class="container">
        <div class="hero-content" data-aos="fade-right">
            <div class="hero-badge">
                <span class="badge-dot"></span>
                <span>Pakistan's #1 Ride-Sharing App</span>
            </div>

            <h1 class="hero-title">
                Ride Together,<br>
                <span class="text-gradient">Save Together</span>
            </h1>

            <p class="hero-subtitle">
                Experience affordable, safe, and comfortable rides across Pakistan.
                Join millions of riders who trust SHAREIDE for their daily commute.
            </p>

            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-number" data-count="500">0</span>
                    <span class="stat-suffix">K+</span>
                    <div class="stat-label">Happy Riders</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-number" data-count="50">0</span>
                    <span class="stat-suffix">K+</span>
                    <div class="stat-label">Verified Drivers</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-number" data-count="15">0</span>
                    <span class="stat-suffix">+</span>
                    <div class="stat-label">Cities</div>
                </div>
            </div>

            <div class="hero-cta">
                <a href="{{ route('download') }}" class="btn btn-primary btn-lg">
                    <i class="fas fa-download"></i>
                    Download Free
                </a>
                <a href="{{ route('features') }}" class="btn btn-outline btn-lg">
                    <i class="fas fa-play-circle"></i>
                    How It Works
                </a>
            </div>
        </div>

        <div class="hero-visual" data-aos="fade-left">
            <div class="phone-mockup">
                <div class="phone-frame">
                    <div class="phone-notch"></div>
                    <div class="phone-screen">
                        <div class="app-preview">
                            <div class="app-header">
                                <div class="app-logo">S</div>
                                <span>SHAREIDE</span>
                            </div>
                            <div class="app-map"></div>
                            <div class="app-card">
                                <div class="ride-info">
                                    <div class="location-dot start"></div>
                                    <div class="location-line"></div>
                                    <div class="location-dot end"></div>
                                </div>
                                <div class="ride-details">
                                    <div class="ride-from">Gulshan-e-Iqbal</div>
                                    <div class="ride-to">Clifton Beach</div>
                                </div>
                                <div class="ride-price">Rs. 350</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="floating-cards">
                <div class="float-card card-driver">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1a1a2e;">AK</div>
                    <div class="card-info">
                        <span class="card-name">Ahmed K.</span>
                        <span class="card-rating"><i class="fas fa-star"></i> 4.9</span>
                    </div>
                </div>
                <div class="float-card card-price">
                    <i class="fas fa-tag"></i>
                    <span>Save 40%</span>
                </div>
                <div class="float-card card-time">
                    <i class="fas fa-clock"></i>
                    <span>2 min away</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="features">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Why Choose Us</span>
            <h2 class="section-title">Features That Make Us <span class="text-gradient">Different</span></h2>
            <p class="section-subtitle">We've built the most advanced ride-sharing platform with features that put you first</p>
        </div>

        <div class="features-grid">
            <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                <div class="feature-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>Safe & Secure</h3>
                <p>All drivers are verified with CNIC, background checks, and live tracking for every ride</p>
                <a href="{{ route('safety') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                <div class="feature-icon">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <h3>Best Prices</h3>
                <p>Transparent pricing with no hidden charges. Save up to 40% compared to other apps</p>
                <a href="{{ route('features') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                <div class="feature-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Carpool & Share</h3>
                <p>Share rides with others heading the same way and split the cost automatically</p>
                <a href="{{ route('features') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                <div class="feature-icon">
                    <i class="fas fa-gavel"></i>
                </div>
                <h3>Bid Your Price</h3>
                <p>Don't like the fare? Bid your own price and drivers will accept if it works for them</p>
                <a href="{{ route('features') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                <div class="feature-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <h3>Rewards Program</h3>
                <p>Earn points on every ride and redeem them for free rides, discounts, and more</p>
                <a href="{{ route('features') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="600">
                <div class="feature-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>Schedule Rides</h3>
                <p>Plan ahead and schedule rides for later. Perfect for airport trips and meetings</p>
                <a href="{{ route('features') }}" class="feature-link">Learn more <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    </div>
</section>

<!-- How It Works Section -->
<section class="how-it-works">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Simple Process</span>
            <h2 class="section-title">Book a Ride in <span class="text-gradient">3 Easy Steps</span></h2>
            <p class="section-subtitle">Getting around has never been easier. Here's how it works</p>
        </div>

        <div class="steps-container">
            <div class="steps-line"></div>

            <div class="step" data-aos="fade-up" data-aos-delay="100">
                <div class="step-number">1</div>
                <div class="step-content">
                    <div class="step-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <h3>Set Your Location</h3>
                    <p>Enter your pickup and drop-off locations. Our smart system finds the best route.</p>
                </div>
            </div>

            <div class="step" data-aos="fade-up" data-aos-delay="200">
                <div class="step-number">2</div>
                <div class="step-content">
                    <div class="step-icon">
                        <i class="fas fa-car-side"></i>
                    </div>
                    <h3>Choose Your Ride</h3>
                    <p>Select from Economy, Comfort, Carpool, or Premium. You decide!</p>
                </div>
            </div>

            <div class="step" data-aos="fade-up" data-aos-delay="300">
                <div class="step-number">3</div>
                <div class="step-content">
                    <div class="step-icon">
                        <i class="fas fa-smile"></i>
                    </div>
                    <h3>Enjoy Your Trip</h3>
                    <p>Your driver arrives in minutes. Sit back and enjoy a safe ride.</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Testimonials Section -->
<section class="testimonials">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Testimonials</span>
            <h2 class="section-title">What Our <span class="text-gradient">Riders Say</span></h2>
            <p class="section-subtitle">Don't just take our word for it. Here's what our community has to say</p>
        </div>

        <div class="testimonial-grid" data-aos="fade-up">
            <div class="testimonial-card">
                <div class="testimonial-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <p class="testimonial-text">"SHAREIDE has completely changed my daily commute. I save almost Rs. 5000 every month. The drivers are professional and the app is super easy to use!"</p>
                <div class="testimonial-author">
                    <div style="width:48px;height:48px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1a1a2e;">SA</div>
                    <div>
                        <span class="author-name">Sarah Ahmed</span>
                        <span class="author-title">Marketing Manager, Karachi</span>
                    </div>
                </div>
            </div>

            <div class="testimonial-card">
                <div class="testimonial-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <p class="testimonial-text">"As a female rider, safety was my biggest concern. SHAREIDE's live tracking and SOS feature give me peace of mind. I recommend it to all my friends!"</p>
                <div class="testimonial-author">
                    <div style="width:48px;height:48px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1a1a2e;">FK</div>
                    <div>
                        <span class="author-name">Fatima Khan</span>
                        <span class="author-title">Software Engineer, Lahore</span>
                    </div>
                </div>
            </div>

            <div class="testimonial-card">
                <div class="testimonial-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <p class="testimonial-text">"The bidding feature is amazing! I can negotiate the fare and drivers actually accept. Plus the carpool option helps me meet new people!"</p>
                <div class="testimonial-author">
                    <div style="width:48px;height:48px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1a1a2e;">AH</div>
                    <div>
                        <span class="author-name">Ali Hassan</span>
                        <span class="author-title">University Student, Islamabad</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Download Section -->
<section class="download-section">
    <div class="container">
        <div class="download-content" data-aos="fade-right">
            <span class="section-tag light">Download Now</span>
            <h2>Ready to Ride?</h2>
            <p>Download the SHAREIDE app now and get your first ride at 50% off! Available on Android and iOS.</p>

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
                <a href="{{ route('download.apk') }}" class="store-btn apk-btn">
                    <i class="fab fa-android"></i>
                    <div>
                        <span>Direct Download</span>
                        <strong>APK File</strong>
                    </div>
                </a>
            </div>

            <p style="margin-top: 24px; font-size: 14px; opacity: 0.7;">
                <i class="fas fa-shield-alt"></i> Secure download. No malware, no ads.
            </p>
        </div>

        <div class="download-visual" data-aos="fade-left">
            <div style="width:280px;height:560px;background:linear-gradient(180deg,#1a1a2e 0%,#0f0f1a 100%);border-radius:40px;padding:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="background:#0f0f1a;border-radius:32px;height:100%;display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;">
                        <div style="width:80px;height:80px;background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:20px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:800;color:#1a1a2e;">S</div>
                        <div style="color:#fff;font-size:24px;font-weight:700;">SHARE<span style="color:#FFD700;">IDE</span></div>
                        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin-top:8px;">Ride Together, Save Together</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Driver CTA Section -->
<section class="driver-cta">
    <div class="container">
        <div class="driver-cta-card" data-aos="fade-up">
            <div class="driver-content">
                <span class="section-tag" style="background:rgba(0,0,0,0.1);color:#1a1a2e;">For Drivers</span>
                <h2>Want to Earn With Your Car?</h2>
                <p>Join thousands of drivers earning on their own schedule. Be your own boss and earn up to Rs. 80,000+ per month.</p>
                <div class="driver-benefits">
                    <div class="benefit"><i class="fas fa-check-circle"></i> Flexible hours</div>
                    <div class="benefit"><i class="fas fa-check-circle"></i> Weekly payouts</div>
                    <div class="benefit"><i class="fas fa-check-circle"></i> Low commission</div>
                    <div class="benefit"><i class="fas fa-check-circle"></i> Driver rewards</div>
                </div>
                <a href="{{ route('drive') }}" class="btn btn-white btn-lg">
                    <i class="fas fa-car"></i>
                    Become a Driver
                </a>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;">
                <div style="width:200px;height:200px;background:rgba(0,0,0,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-car-side" style="font-size:80px;color:#1a1a2e;"></i>
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
