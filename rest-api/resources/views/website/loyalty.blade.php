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
                <span class="breadcrumb__current">Rewards & Loyalty</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Rewards & <span class="gradient-text">Loyalty</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Every ride earns you points. Unlock exclusive tiers, get cashback, and enjoy premium perks the more you ride with SHAREIDE.</p>
        </div>
    </section>

    <!-- How Loyalty Works -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Earn & Redeem</span>
                <h2 class="section__title">How It <span class="gradient-text">Works</span></h2>
                <p class="section__desc">Three simple steps to start earning rewards</p>
            </div>

            <div class="process-steps" data-animate="fade-up">
                <div class="process-step" data-animate="fade-up" data-delay="0">
                    <div class="process-step__number">1</div>
                    <div class="process-step__content">
                        <h3>Ride & Earn Points</h3>
                        <p>Every ride you complete with SHAREIDE earns you loyalty points automatically. The more you ride, the more points you collect. Carpool rides earn bonus points for helping the environment.</p>
                    </div>
                </div>
                <div class="process-step" data-animate="fade-up" data-delay="100">
                    <div class="process-step__number">2</div>
                    <div class="process-step__content">
                        <h3>Unlock Tiers</h3>
                        <p>As your points accumulate, you progress through four tiers - Bronze, Silver, Gold, and Platinum. Each tier unlocks better perks, higher cashback rates, and exclusive benefits.</p>
                    </div>
                </div>
                <div class="process-step" data-animate="fade-up" data-delay="200">
                    <div class="process-step__number">3</div>
                    <div class="process-step__content">
                        <h3>Redeem Rewards</h3>
                        <p>Use your points for ride discounts, free upgrades to premium, cashback to your wallet, and partner vouchers from popular Pakistani brands and restaurants.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Loyalty Tiers -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Tier System</span>
                <h2 class="section__title">Loyalty <span class="gradient-text">Tiers</span></h2>
                <p class="section__desc">Climb the ranks and unlock premium benefits</p>
            </div>

            <div class="tier-grid" data-animate="fade-up">
                <!-- Bronze -->
                <div class="tier-card" data-animate="fade-up" data-delay="0">
                    <div class="tier-card__icon" style="background: rgba(205,127,50,0.12); color: #CD7F32;">
                        <i class="fas fa-medal"></i>
                    </div>
                    <h3 class="tier-card__name">Bronze</h3>
                    <p class="tier-card__range">0 - 500 Points</p>
                    <div class="tier-card__perks">
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>2% cashback on every ride</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Priority customer support</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Birthday bonus points</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Access to carpool savings</span>
                        </div>
                    </div>
                </div>

                <!-- Silver -->
                <div class="tier-card" data-animate="fade-up" data-delay="100">
                    <div class="tier-card__icon" style="background: rgba(192,192,192,0.15); color: #A0A0A0;">
                        <i class="fas fa-award"></i>
                    </div>
                    <h3 class="tier-card__name">Silver</h3>
                    <p class="tier-card__range">500 - 2,000 Points</p>
                    <div class="tier-card__perks">
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>5% cashback on every ride</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Priority driver matching</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>1 free cancellation per week</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Exclusive promo codes</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Double points on weekends</span>
                        </div>
                    </div>
                </div>

                <!-- Gold (Featured) -->
                <div class="tier-card tier-card--featured" data-animate="fade-up" data-delay="200">
                    <div class="tier-card__badge">Most Popular</div>
                    <div class="tier-card__icon" style="background: rgba(252,192,20,0.15); color: #FCC014;">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3 class="tier-card__name">Gold</h3>
                    <p class="tier-card__range">2,000 - 5,000 Points</p>
                    <div class="tier-card__perks">
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>10% cashback on every ride</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>VIP customer support line</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Free ride upgrades to Premium</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Exclusive partner deals</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>3 free cancellations per week</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Triple points on promotions</span>
                        </div>
                    </div>
                </div>

                <!-- Platinum -->
                <div class="tier-card" data-animate="fade-up" data-delay="300">
                    <div class="tier-card__icon" style="background: rgba(139,92,246,0.12); color: #8B5CF6;">
                        <i class="fas fa-gem"></i>
                    </div>
                    <h3 class="tier-card__name">Platinum</h3>
                    <p class="tier-card__range">5,000+ Points</p>
                    <div class="tier-card__perks">
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>15% cashback on every ride</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Dedicated account manager</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Free premium rides monthly</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Invite to special events</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Unlimited free cancellations</span>
                        </div>
                        <div class="tier-card__perk">
                            <i class="fas fa-check-circle"></i>
                            <span>Airport lounge access</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Ways to Earn -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Earn Points</span>
                <h2 class="section__title">Ways to <span class="gradient-text">Earn More</span></h2>
                <p class="section__desc">Multiple ways to rack up loyalty points faster</p>
            </div>

            <div class="three-col">
                <div class="info-card" data-animate="fade-up" data-delay="0">
                    <div class="info-card__icon">
                        <i class="fas fa-car-side"></i>
                    </div>
                    <h3 class="info-card__title">Complete Rides</h3>
                    <p class="info-card__text">Earn points on every completed ride. Solo rides earn 1 point per Rs. 10 spent. Carpool rides earn 1.5x bonus points because you are helping reduce traffic and emissions.</p>
                </div>
                <div class="info-card" data-animate="fade-up" data-delay="100">
                    <div class="info-card__icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h3 class="info-card__title">Refer Friends</h3>
                    <p class="info-card__text">Share your referral code and earn 200 bonus points for every friend who signs up and completes their first ride. Your friend also gets 100 welcome points.</p>
                </div>
                <div class="info-card" data-animate="fade-up" data-delay="200">
                    <div class="info-card__icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3 class="info-card__title">Write Reviews</h3>
                    <p class="info-card__text">Rate and review your rides to earn 10 bonus points per review. Detailed reviews with feedback help us improve the experience and earn you extra rewards.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Loyalty Stats -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Program Stats</span>
                <h2 class="section__title">Rewards in <span class="gradient-text">Action</span></h2>
                <p class="section__desc">Our loyalty program is growing every day</p>
            </div>

            <div class="stat-grid" data-animate="fade-up">
                <div class="stat-card" data-animate="fade-up" data-delay="0">
                    <div class="stat-card__number" data-target="200" data-suffix="K+">0</div>
                    <div class="stat-card__label">Members Enrolled</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="100">
                    <div class="stat-card__number" data-target="50" data-suffix="M+">0</div>
                    <div class="stat-card__label">Points Redeemed</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="200">
                    <div class="stat-card__number" data-target="10" data-suffix="M+">0</div>
                    <div class="stat-card__label">Rs. Cashback Given</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="300">
                    <div class="stat-card__number" data-target="25" data-suffix="K+">0</div>
                    <div class="stat-card__label">Gold & Platinum Members</div>
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
                <h2 class="download-cta__title">Start Earning <span class="gradient-text">Rewards</span></h2>
                <p class="download-cta__desc">Download SHAREIDE and get <strong>100 bonus points</strong> just for signing up!</p>

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
                        <i class="fas fa-gift"></i>
                        <span>100 Signup Points</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-percentage"></i>
                        <span>Up to 15% Cashback</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-crown"></i>
                        <span>4 Reward Tiers</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
