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
                <span class="breadcrumb__current">About Us</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">About <span class="gradient-text">SHAREIDE</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Building Pakistan's most trusted ride-sharing platform. We are on a mission to make transportation affordable, safe, and accessible for everyone.</p>
        </div>
    </section>

    <!-- Our Story -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Our Story</span>
                <h2 class="section__title">How It All <span class="gradient-text">Started</span></h2>
                <p class="section__desc">From a simple idea to Pakistan's fastest-growing ride-sharing platform</p>
            </div>

            <div class="two-col">
                <div data-animate="fade-right">
                    <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 15px; color: var(--text);">Born in Pakistan, Built for Pakistan</h3>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        SHAREIDE was founded with a simple yet powerful vision: to transform the way Pakistanis travel. In a country where millions commute daily through congested cities like Karachi, Lahore, and Islamabad, we saw an opportunity to create something truly impactful.
                    </p>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                        Our founders understood the challenges faced by everyday commuters -- rising fuel costs, unreliable public transport, and safety concerns, especially for women. SHAREIDE was born to address these pain points with technology that puts riders and drivers first.
                    </p>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8;">
                        What started as a small operation in Islamabad has now grown into a nationwide platform operating across 15+ cities, connecting hundreds of thousands of riders with verified drivers every single day. Our unique bid-your-fare model and carpool feature have made us the go-to choice for budget-conscious and safety-aware commuters across Pakistan.
                    </p>
                </div>
                <div data-animate="fade-left">
                    <div class="stat-grid" style="grid-template-columns: repeat(2, 1fr);">
                        <div class="stat-card" data-animate="fade-up" data-delay="0">
                            <div class="stat-card__number" data-target="500" data-suffix="K+">0</div>
                            <div class="stat-card__label">Active Users</div>
                        </div>
                        <div class="stat-card" data-animate="fade-up" data-delay="100">
                            <div class="stat-card__number" data-target="50" data-suffix="K+">0</div>
                            <div class="stat-card__label">Verified Drivers</div>
                        </div>
                        <div class="stat-card" data-animate="fade-up" data-delay="200">
                            <div class="stat-card__number" data-target="15" data-suffix="+">0</div>
                            <div class="stat-card__label">Cities Covered</div>
                        </div>
                        <div class="stat-card" data-animate="fade-up" data-delay="300">
                            <div class="stat-card__number">4.8</div>
                            <div class="stat-card__label">App Rating</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Our Values -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Our Values</span>
                <h2 class="section__title">What We <span class="gradient-text">Stand For</span></h2>
                <p class="section__desc">The core principles that guide everything we do at SHAREIDE</p>
            </div>

            <div class="values-grid">
                <div class="value-card" data-animate="fade-up" data-delay="0">
                    <div class="value-card__icon">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <h3 class="value-card__title">Innovation</h3>
                    <p class="value-card__text">We constantly push boundaries with features like bid-your-fare, smart carpooling, and AI-powered route matching that set us apart from the rest.</p>
                </div>

                <div class="value-card" data-animate="fade-up" data-delay="100">
                    <div class="value-card__icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="value-card__title">Safety</h3>
                    <p class="value-card__text">Every driver is CNIC verified through NADRA. With live GPS tracking, SOS buttons, and ride insurance, your safety is always our top priority.</p>
                </div>

                <div class="value-card" data-animate="fade-up" data-delay="200">
                    <div class="value-card__icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <h3 class="value-card__title">Affordability</h3>
                    <p class="value-card__text">From our unique fare bidding to cost-splitting carpool, we ensure every Pakistani can afford a safe and comfortable ride without breaking the bank.</p>
                </div>

                <div class="value-card" data-animate="fade-up" data-delay="300">
                    <div class="value-card__icon">
                        <i class="fas fa-people-carry"></i>
                    </div>
                    <h3 class="value-card__title">Community</h3>
                    <p class="value-card__text">We are building more than an app -- we are building a community. From driver welfare programmes to rider rewards, everyone in the SHAREIDE family matters.</p>
                </div>

                <div class="value-card" data-animate="fade-up" data-delay="400">
                    <div class="value-card__icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <h3 class="value-card__title">Transparency</h3>
                    <p class="value-card__text">No hidden charges, no surge surprises. You see the fare before you ride. Our upfront pricing and driver commission structure are clear and honest.</p>
                </div>

                <div class="value-card" data-animate="fade-up" data-delay="500">
                    <div class="value-card__icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3 class="value-card__title">Excellence</h3>
                    <p class="value-card__text">We strive for the best in everything -- app performance, customer support, driver training, and user experience. Good enough is never enough for us.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Our Mission -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Our Mission</span>
                <h2 class="section__title">Driving Pakistan <span class="gradient-text">Forward</span></h2>
                <p class="section__desc">A vision for the future of transportation in Pakistan</p>
            </div>

            <div class="two-col two-col--reverse">
                <div data-animate="fade-left">
                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 15px; color: var(--text);">Our Mission</h3>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 25px;">
                        To make safe, affordable, and reliable transportation accessible to every Pakistani. We believe that no one should have to choose between safety and affordability when it comes to getting from point A to point B.
                    </p>

                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 15px; color: var(--text);">Our Vision</h3>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 25px;">
                        To become Pakistan's most trusted mobility platform by 2030, operating in every major city and town, reducing traffic congestion, lowering carbon emissions through carpooling, and creating sustainable livelihoods for hundreds of thousands of driver partners across the nation.
                    </p>

                    <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 15px; color: var(--text);">Our Promise</h3>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8;">
                        We promise to keep innovating, keep listening to our community, and keep putting Pakistan first. Whether you are a student in Lahore, a professional in Karachi, or a family in Peshawar, SHAREIDE is here to serve you.
                    </p>
                </div>
                <div data-animate="fade-right">
                    <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 40px; position: relative;">
                        <div style="font-size: 60px; color: rgba(252,192,20,0.2); margin-bottom: 15px;"><i class="fas fa-quote-left"></i></div>
                        <p style="font-size: 20px; font-weight: 600; color: var(--text); line-height: 1.8; margin-bottom: 20px;">
                            "We did not just build a ride-sharing app. We built a platform that understands Pakistan -- its people, its culture, and its unique transportation challenges. SHAREIDE is by Pakistanis, for Pakistanis."
                        </p>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: var(--black);">S</div>
                            <div>
                                <strong style="display: block; font-size: 16px; color: var(--text);">SHAREIDE Team</strong>
                                <span style="font-size: 13px; color: var(--text-secondary);">Founding Team</span>
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
                <h2 class="download-cta__title">Join the <span class="gradient-text">SHAREIDE</span> Family</h2>
                <p class="download-cta__desc">Download the app today and experience the future of ride-sharing in Pakistan.</p>

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
