@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Drive With Us</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Become a <span class="gradient-text">SHAREIDE</span> Driver</h1>
            <p class="page-hero__desc" data-animate="fade-up">Earn on your own schedule. Join thousands of drivers across Pakistan who are building a better future with SHAREIDE.</p>
        </div>
    </section>

    <!-- Section 1: Driver Stats -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Driver Network</span>
                <h2 class="section__title">Our Drivers in <span class="gradient-text">Numbers</span></h2>
                <p class="section__desc">Join a thriving community of drivers earning every day</p>
            </div>
            <div class="stat-grid" data-animate="fade-up" data-delay="200">
                <div class="stat-card">
                    <div class="stat-card__number" data-target="50" data-suffix="K+">0</div>
                    <div class="stat-card__label">Active Drivers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="80" data-suffix="K+">0</div>
                    <div class="stat-card__label">Monthly Earnings (Rs.)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="15" data-suffix="+">0</div>
                    <div class="stat-card__label">Cities</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="95" data-suffix="%">0</div>
                    <div class="stat-card__label">Driver Satisfaction</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 2: Why Drive With Us -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Benefits</span>
                <h2 class="section__title">Why Drive With <span class="gradient-text">SHAREIDE</span>?</h2>
                <p class="section__desc">We offer the best benefits for our driver partners</p>
            </div>
            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="feature-card__title">Flexible Hours</h3>
                    <p class="feature-card__desc">Drive whenever you want. Whether it's early morning or late night, you're in control of your schedule. No fixed shifts, no pressure.</p>
                </div>
                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <h3 class="feature-card__title">Low Commission</h3>
                    <p class="feature-card__desc">We only take 15% commission -- the lowest in Pakistan. Keep more of what you earn on every ride. Your hard work, your money.</p>
                    <div class="feature-card__tag">Only 15%</div>
                </div>
                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <h3 class="feature-card__title">Daily Payouts</h3>
                    <p class="feature-card__desc">No waiting for weeks. Get your earnings transferred to your bank or JazzCash/Easypaisa account every single day.</p>
                </div>
                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-card__title">Full Insurance</h3>
                    <p class="feature-card__desc">Every ride is fully insured. Drive with confidence knowing you and your passengers are protected at all times.</p>
                </div>
                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--teal">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3 class="feature-card__title">24/7 Support</h3>
                    <p class="feature-card__desc">Our dedicated driver support team is available around the clock. Get help with any issue, any time of the day or night.</p>
                </div>
                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--pink">
                        <i class="fas fa-gift"></i>
                    </div>
                    <h3 class="feature-card__title">Bonus Rewards</h3>
                    <p class="feature-card__desc">Earn extra through weekly bonuses, peak-hour incentives, and referral rewards. The more you drive, the more you earn.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 3: Requirements & Earnings -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Get Started</span>
                <h2 class="section__title">Requirements & <span class="gradient-text">Earnings</span></h2>
                <p class="section__desc">Here's what you need and what you can earn</p>
            </div>
            <div class="two-col">
                <div data-animate="fade-right">
                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 20px; color: var(--text);">What You Need</h3>
                    <div class="requirements-list">
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Valid CNIC (National Identity Card)</span>
                        </div>
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Valid Driver's License</span>
                        </div>
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Vehicle Registration Book</span>
                        </div>
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Vehicle not older than 10 years</span>
                        </div>
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Smartphone with internet connection</span>
                        </div>
                        <div class="requirement-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Clean criminal record</span>
                        </div>
                    </div>
                </div>
                <div data-animate="fade-left">
                    <div class="earnings-calc">
                        <h3>Estimated Earnings</h3>
                        <p>Drive 8 hours/day and earn big with SHAREIDE's low commission model</p>
                        <div class="earnings-calc__result">
                            <div class="earnings-calc__amount">Rs. 80,000+</div>
                            <div class="earnings-calc__period">per month</div>
                        </div>
                        <p style="margin-top: 20px; font-size: 13px; color: var(--text-secondary);">*Actual earnings may vary based on city, hours driven, and ride demand. Many drivers earn even more during peak hours.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 4: How to Get Started -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Simple Process</span>
                <h2 class="section__title">How to <span class="gradient-text">Get Started</span></h2>
                <p class="section__desc">Start earning in 4 simple steps</p>
            </div>
            <div class="process-steps" data-animate="fade-up" data-delay="200">
                <div class="process-step">
                    <div class="process-step__number">1</div>
                    <div class="process-step__content">
                        <h3>Download the Fleet App</h3>
                        <p>Download the SHAREIDE Fleet app from Google Play Store. It's free and designed specifically for our driver partners.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="process-step__number">2</div>
                    <div class="process-step__content">
                        <h3>Submit Your Documents</h3>
                        <p>Upload your CNIC, driver's license, vehicle registration, and a recent photo. Our team will review them quickly.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="process-step__number">3</div>
                    <div class="process-step__content">
                        <h3>Pass Verification</h3>
                        <p>Your documents are verified through NADRA and our security checks. This ensures safety for both drivers and riders.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="process-step__number">4</div>
                    <div class="process-step__content">
                        <h3>Start Driving & Earning</h3>
                        <p>Once approved, go online and start accepting ride requests. Earn money on your very first day with SHAREIDE.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 5: Driver FAQ -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">FAQ</span>
                <h2 class="section__title">Driver <span class="gradient-text">Questions</span></h2>
                <p class="section__desc">Common questions from our driver partners</p>
            </div>
            <div class="faq-list" data-animate="fade-up" data-delay="200">
                <div class="faq-item">
                    <button class="faq-question">
                        <span>How much can I earn as a SHAREIDE driver?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Your earnings depend on the city you drive in, the hours you work, and the demand. On average, full-time drivers (8 hours/day) earn Rs. 60,000 to Rs. 100,000+ per month. Peak hours, weekends, and incentive bonuses can significantly increase your earnings.
                        </div>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>What commission does SHAREIDE take?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE takes only 15% commission on each ride, which is one of the lowest in Pakistan's ride-sharing industry. This means you keep 85% of every fare. There are no hidden charges or additional fees.
                        </div>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>Do I need my own vehicle to drive?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Yes, you need your own vehicle to drive with SHAREIDE. The vehicle should be no older than 10 years, in good condition, and have a valid registration book. We accept cars, motorcycles, and rickshaws depending on the city.
                        </div>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>How do I get paid?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Earnings are transferred daily to your preferred payment method. You can receive payments via bank transfer, JazzCash, or Easypaisa. Cash rides are collected directly from passengers, and the commission is deducted from your digital ride earnings.
                        </div>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question">
                        <span>What if I have an accident during a ride?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Every SHAREIDE ride is fully insured. In case of an accident, contact our 24/7 support team immediately through the app's SOS button. We will assist with insurance claims, medical emergencies, and vehicle damage. Your safety and well-being are our top priority.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 6: Drive CTA -->
    <section class="drive-cta">
        <div class="container">
            <div class="drive-cta__card" data-animate="fade-up">
                <div class="drive-cta__content">
                    <span class="drive-cta__badge">
                        <i class="fas fa-car"></i> For Drivers
                    </span>
                    <h2>Ready to <span class="gradient-text-dark">Start Earning</span>?</h2>
                    <p>Download the SHAREIDE Fleet app today and start your journey as a driver partner. It only takes a few minutes to sign up.</p>
                    <div class="drive-cta__stats">
                        <div class="drive-cta__stat">
                            <strong>50K+</strong>
                            <span>Active Drivers</span>
                        </div>
                        <div class="drive-cta__stat">
                            <strong>15%</strong>
                            <span>Commission</span>
                        </div>
                        <div class="drive-cta__stat">
                            <strong>Daily</strong>
                            <span>Payouts</span>
                        </div>
                    </div>
                    <a href="https://play.google.com/store/apps/details?id=com.shareide_official.shareide_fleet" class="btn btn--dark btn--lg">
                        Download Fleet App
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                <div class="drive-cta__visual">
                    <div class="drive-cta__icon-grid">
                        <div class="drive-cta__icon-item"><i class="fas fa-car"></i></div>
                        <div class="drive-cta__icon-item"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="drive-cta__icon-item"><i class="fas fa-clock"></i></div>
                        <div class="drive-cta__icon-item"><i class="fas fa-map-marked-alt"></i></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
