@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--cities">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-map-marker-alt"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Cities</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Cities We <span class="gradient-text">Serve</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">SHAREIDE is available across Pakistan. Ride with us in major cities and intercity routes from Karachi to Peshawar.</p>
        </div>
    </section>

    <!-- Section 1: Coverage Stats -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Coverage</span>
                <h2 class="section__title">Our Reach Across <span class="gradient-text">Pakistan</span></h2>
                <p class="section__desc">Growing every day to serve you better</p>
            </div>
            <div class="stat-grid" data-animate="fade-up" data-delay="200">
                <div class="stat-card">
                    <div class="stat-card__number" data-target="15" data-suffix="+">0</div>
                    <div class="stat-card__label">Cities</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="8" data-suffix="">0</div>
                    <div class="stat-card__label">Provinces</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="500" data-suffix="K+">0</div>
                    <div class="stat-card__label">Rides / Month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__number" data-target="100" data-suffix="%">0</div>
                    <div class="stat-card__label">Growing Daily</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 2: City Grid -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">All Cities</span>
                <h2 class="section__title">Where You Can <span class="gradient-text">Ride</span></h2>
                <p class="section__desc">Available in major cities with more coming soon</p>
            </div>
            <div class="city-grid" data-animate="fade-up" data-delay="200">
                <div class="city-card city-card--featured">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Karachi</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card city-card--featured">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Lahore</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card city-card--featured">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Islamabad</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Rawalpindi</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Faisalabad</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Multan</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Peshawar</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Quetta</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Sialkot</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Gujranwala</div>
                    <div class="city-card__info">Coming soon</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Hyderabad</div>
                    <div class="city-card__info">Available now</div>
                </div>
                <div class="city-card">
                    <div class="city-card__icon"><i class="fas fa-city"></i></div>
                    <div class="city-card__name">Bahawalpur</div>
                    <div class="city-card__info">Coming soon</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 3: Popular Routes -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Popular Routes</span>
                <h2 class="section__title">Most Travelled <span class="gradient-text">Routes</span></h2>
                <p class="section__desc">Book intercity rides on Pakistan's busiest routes</p>
            </div>
            <div class="three-col" data-animate="fade-up" data-delay="200">
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Islamabad to Lahore</h3>
                    <p class="info-card__text">One of Pakistan's most popular intercity routes. Travel comfortably between the capital and the cultural hub in under 4 hours with SHAREIDE.</p>
                </div>
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Karachi to Hyderabad</h3>
                    <p class="info-card__text">Quick and affordable rides between Sindh's two largest cities. A smooth 2-hour journey via the M-9 Motorway with verified drivers.</p>
                </div>
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Lahore to Faisalabad</h3>
                    <p class="info-card__text">Connect Punjab's industrial city with its cultural capital. Frequent rides available daily for business and personal travel.</p>
                </div>
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Rawalpindi to Islamabad</h3>
                    <p class="info-card__text">The twin cities' most frequent ride. Quick, affordable commutes between Rawalpindi and Islamabad available around the clock.</p>
                </div>
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Multan to Lahore</h3>
                    <p class="info-card__text">Travel between the City of Saints and Lahore with ease. Comfortable rides on the M-4 and M-2 motorways at competitive fares.</p>
                </div>
                <div class="info-card">
                    <div class="info-card__icon"><i class="fas fa-route"></i></div>
                    <h3 class="info-card__title">Peshawar to Islamabad</h3>
                    <p class="info-card__text">Connect KPK's capital to the federal capital. Safe and reliable rides via the M-1 Motorway with CNIC-verified drivers.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 4: Map Visual -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Coverage Map</span>
                <h2 class="section__title">Pakistan <span class="gradient-text">Coverage Map</span></h2>
                <p class="section__desc">Our network spans the entire country</p>
            </div>
            <div class="map-visual" data-animate="fade-up" data-delay="200">
                <i class="fas fa-map"></i>
                <p>Pakistan Coverage Map</p>
                <p style="font-size: 14px; color: var(--text-secondary);">SHAREIDE is actively expanding across all provinces and territories of Pakistan. New cities are added regularly.</p>
            </div>
        </div>
    </section>

    <!-- Section 5: Download CTA -->
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
@endsection
