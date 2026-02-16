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
                <span class="breadcrumb__current">Blog & News</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Blog & <span class="gradient-text">News</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Stay up to date with the latest updates, feature releases, safety tips, and inspiring stories from the SHAREIDE community across Pakistan.</p>
        </div>
    </section>

    <!-- Blog Grid -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Latest Posts</span>
                <h2 class="section__title">From the <span class="gradient-text">SHAREIDE Blog</span></h2>
                <p class="section__desc">News, updates, and stories from Pakistan's fastest-growing ride-sharing platform</p>
            </div>

            <div class="blog-grid">
                <!-- Blog Card 1 -->
                <div class="blog-card" data-animate="fade-up" data-delay="0">
                    <div class="blog-card__image">
                        <i class="fas fa-city"></i>
                        <span class="blog-card__category">News</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Jan 15, 2026
                        </div>
                        <h3 class="blog-card__title">SHAREIDE Launches in 5 New Cities</h3>
                        <p class="blog-card__text">We are thrilled to announce our expansion into Sialkot, Gujranwala, Hyderabad, Bahawalpur, and Sukkur. With this launch, SHAREIDE is now available in over 20 cities across Pakistan, bringing affordable and safe rides to millions more commuters.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <!-- Blog Card 2 -->
                <div class="blog-card" data-animate="fade-up" data-delay="100">
                    <div class="blog-card__image">
                        <i class="fas fa-users"></i>
                        <span class="blog-card__category">Feature</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Jan 8, 2026
                        </div>
                        <h3 class="blog-card__title">How Carpooling is Changing Pakistan's Commute</h3>
                        <p class="blog-card__text">Carpooling is no longer just about saving money. Pakistani commuters are discovering how shared rides reduce traffic congestion, lower carbon emissions, and build community connections on their daily routes.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <!-- Blog Card 3 -->
                <div class="blog-card" data-animate="fade-up" data-delay="200">
                    <div class="blog-card__image">
                        <i class="fas fa-shield-alt"></i>
                        <span class="blog-card__category">Safety</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Dec 28, 2025
                        </div>
                        <h3 class="blog-card__title">Safety First: Our NADRA Verification Process</h3>
                        <p class="blog-card__text">Every SHAREIDE driver undergoes rigorous identity verification through NADRA's CNIC database. Learn how our multi-step screening process ensures that only trusted, verified drivers join the platform.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <!-- Blog Card 4 -->
                <div class="blog-card" data-animate="fade-up" data-delay="300">
                    <div class="blog-card__image">
                        <i class="fas fa-gift"></i>
                        <span class="blog-card__category">Update</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Dec 15, 2025
                        </div>
                        <h3 class="blog-card__title">Introducing the SHAREIDE Loyalty Program</h3>
                        <p class="blog-card__text">Earn points on every ride and unlock exclusive rewards. From free rides to priority booking and premium upgrades, our new loyalty program rewards the riders who make SHAREIDE their daily travel companion.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <!-- Blog Card 5 -->
                <div class="blog-card" data-animate="fade-up" data-delay="400">
                    <div class="blog-card__image">
                        <i class="fas fa-lightbulb"></i>
                        <span class="blog-card__category">Tips</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Dec 5, 2025
                        </div>
                        <h3 class="blog-card__title">Tips for a Safe and Comfortable Ride</h3>
                        <p class="blog-card__text">Whether you are a first-time rider or a daily commuter, these practical tips will help you make the most of every SHAREIDE trip. From verifying your driver to sharing your live location with family, stay safe on the go.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>

                <!-- Blog Card 6 -->
                <div class="blog-card" data-animate="fade-up" data-delay="500">
                    <div class="blog-card__image">
                        <i class="fas fa-user-tie"></i>
                        <span class="blog-card__category">Community</span>
                    </div>
                    <div class="blog-card__content">
                        <div class="blog-card__date">
                            <i class="fas fa-calendar"></i> Nov 25, 2025
                        </div>
                        <h3 class="blog-card__title">Driver Spotlight: Ahmed's Story from Lahore</h3>
                        <p class="blog-card__text">Ahmed joined SHAREIDE as a part-time driver to support his family. Within six months, he became one of Lahore's top-rated captains, earning a stable income while pursuing his university degree on the side.</p>
                        <a href="#" class="blog-card__link">Read More <i class="fas fa-arrow-right"></i></a>
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
                <h2 class="download-cta__title">Stay Connected with <span class="gradient-text">SHAREIDE</span></h2>
                <p class="download-cta__desc">Download the app to get real-time updates, exclusive offers, and the latest features delivered straight to your phone.</p>

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
