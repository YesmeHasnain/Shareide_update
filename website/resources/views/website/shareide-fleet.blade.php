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
        <div class="page-hero__icon"><i class="fas fa-car"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Fleet App</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">SHAREIDE <span class="gradient-text">Fleet App</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Drive with SHAREIDE and earn on your own terms. Low commission, daily payouts, and full support for driver partners across Pakistan.</p>
        </div>
    </section>

    <!-- Why Drive With Us -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Driver Benefits</span>
                <h2 class="section__title">Why Drive With <span class="gradient-text">SHAREIDE</span>?</h2>
                <p class="section__desc">We treat our drivers like family, not just partners</p>
            </div>

            <div class="features__grid">
                <div class="feature-card" data-animate="fade-up" data-delay="0">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="feature-card__title">Flexible Schedule</h3>
                    <p class="feature-card__desc">Drive when you want, where you want. Whether you drive full-time or part-time, you are in complete control of your hours. No minimum trips required.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="100">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--green">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <h3 class="feature-card__title">Low Commission</h3>
                    <p class="feature-card__desc">Keep more of what you earn with our industry-low commission rates. We believe drivers deserve fair compensation for every kilometre they drive.</p>
                    <div class="feature-card__tag">Best in Pakistan</div>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="200">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--orange">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <h3 class="feature-card__title">Daily Payouts</h3>
                    <p class="feature-card__desc">Get your earnings transferred daily to your JazzCash, Easypaisa, or bank account. No waiting around for weekly or monthly settlements.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="300">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--blue">
                        <i class="fas fa-file-shield"></i>
                    </div>
                    <h3 class="feature-card__title">Insurance Coverage</h3>
                    <p class="feature-card__desc">Every trip is covered by our comprehensive ride insurance policy. Drive with confidence knowing both you and your passengers are protected on every journey.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="400">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--purple">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3 class="feature-card__title">24/7 Support</h3>
                    <p class="feature-card__desc">Our dedicated driver support team is available round the clock. Whether it is a fare dispute, a technical issue, or an emergency, we are always just a tap away.</p>
                </div>

                <div class="feature-card" data-animate="fade-up" data-delay="500">
                    <div class="feature-card__glow"></div>
                    <div class="feature-card__icon feature-card__icon--pink">
                        <i class="fas fa-gift"></i>
                    </div>
                    <h3 class="feature-card__title">Bonus Rewards</h3>
                    <p class="feature-card__desc">Earn extra bonuses during peak hours, complete trip milestones for cash rewards, and refer other drivers to earn referral bonuses credited directly to your wallet.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Driver Requirements -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Requirements</span>
                <h2 class="section__title">What You <span class="gradient-text">Need</span></h2>
                <p class="section__desc">Simple requirements to get started as a SHAREIDE driver</p>
            </div>

            <div class="two-col">
                <div data-animate="fade-right">
                    <div class="requirements-list">
                        <div class="requirement-item" data-animate="fade-up" data-delay="0">
                            <i class="fas fa-check-circle"></i>
                            <span>Valid CNIC (National Identity Card) issued by NADRA</span>
                        </div>
                        <div class="requirement-item" data-animate="fade-up" data-delay="50">
                            <i class="fas fa-check-circle"></i>
                            <span>Valid Driving License (LTV or HTV as applicable)</span>
                        </div>
                        <div class="requirement-item" data-animate="fade-up" data-delay="100">
                            <i class="fas fa-check-circle"></i>
                            <span>Vehicle Registration Book in your name or authorised letter</span>
                        </div>
                        <div class="requirement-item" data-animate="fade-up" data-delay="150">
                            <i class="fas fa-check-circle"></i>
                            <span>Vehicle Inspection Certificate (fitness certificate)</span>
                        </div>
                        <div class="requirement-item" data-animate="fade-up" data-delay="200">
                            <i class="fas fa-check-circle"></i>
                            <span>Smartphone with active internet connection (3G/4G)</span>
                        </div>
                        <div class="requirement-item" data-animate="fade-up" data-delay="250">
                            <i class="fas fa-check-circle"></i>
                            <span>Clean background with no criminal record</span>
                        </div>
                    </div>
                </div>
                <div data-animate="fade-left">
                    <div style="background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 35px;">
                        <h3 style="font-size: 22px; font-weight: 700; margin-bottom: 12px; color: var(--text);">Quick & Easy Verification</h3>
                        <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                            Our verification process is fast and hassle-free. All documents are verified digitally through our secure system. CNIC verification is done through NADRA integration, ensuring 100% driver authenticity.
                        </p>
                        <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
                            Most drivers get approved within 24-48 hours of submitting their documents. Our team reviews every application carefully to ensure the safety and trust our riders expect.
                        </p>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(252,192,20,0.08); border-radius: 10px;">
                                <i class="fas fa-bolt" style="color: var(--primary);"></i>
                                <span style="font-size: 13px; font-weight: 600; color: var(--text);">24-48hr Approval</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(16,185,129,0.08); border-radius: 10px;">
                                <i class="fas fa-shield-alt" style="color: var(--green);"></i>
                                <span style="font-size: 13px; font-weight: 600; color: var(--text);">NADRA Verified</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(59,130,246,0.08); border-radius: 10px;">
                                <i class="fas fa-mobile-alt" style="color: var(--blue);"></i>
                                <span style="font-size: 13px; font-weight: 600; color: var(--text);">Digital Process</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How to Register -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Get Started</span>
                <h2 class="section__title">How to <span class="gradient-text">Register</span></h2>
                <p class="section__desc">Start earning with SHAREIDE in 4 simple steps</p>
            </div>

            <div class="process-steps" data-animate="fade-up">
                <div class="process-step" data-animate="fade-up" data-delay="0">
                    <div class="process-step__number">1</div>
                    <div class="process-step__content">
                        <h3>Download the Fleet App</h3>
                        <p>Download SHAREIDE Fleet from the Google Play Store. The dedicated driver app is separate from the passenger app and includes all the tools you need to manage your rides and earnings.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="100">
                    <div class="process-step__number">2</div>
                    <div class="process-step__content">
                        <h3>Submit Your Documents</h3>
                        <p>Upload clear photos of your CNIC, driving license, vehicle registration, and vehicle photos directly through the app. Our digital system makes document submission quick and paperless.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="200">
                    <div class="process-step__number">3</div>
                    <div class="process-step__content">
                        <h3>Verification & Approval</h3>
                        <p>Our team verifies your CNIC through NADRA, checks your driving license authenticity, and inspects your vehicle details. You will receive approval notification within 24-48 hours via SMS and in-app notification.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="300">
                    <div class="process-step__number">4</div>
                    <div class="process-step__content">
                        <h3>Start Earning</h3>
                        <p>Once approved, go online and start accepting ride requests. Set your preferred areas, manage your schedule, and watch your earnings grow. Daily payouts via JazzCash, Easypaisa, or bank transfer.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Earnings -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Your Earnings</span>
                <h2 class="section__title">Earn More With <span class="gradient-text">SHAREIDE</span></h2>
                <p class="section__desc">Competitive earnings that grow with your dedication</p>
            </div>

            <div class="stat-grid" data-animate="fade-up">
                <div class="stat-card" data-animate="fade-up" data-delay="0">
                    <div class="stat-card__number">Rs. 60K+</div>
                    <div class="stat-card__label">Avg. Monthly Earnings</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="100">
                    <div class="stat-card__number">Rs. 2,500+</div>
                    <div class="stat-card__label">Avg. Daily Earnings</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="200">
                    <div class="stat-card__number">15%</div>
                    <div class="stat-card__label">Low Commission Rate</div>
                </div>
                <div class="stat-card" data-animate="fade-up" data-delay="300">
                    <div class="stat-card__number">Rs. 5K+</div>
                    <div class="stat-card__label">Weekly Bonus Potential</div>
                </div>
            </div>

            <div style="max-width: 700px; margin: 50px auto 0; text-align: center;" data-animate="fade-up">
                <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.8;">
                    Earnings vary based on city, hours driven, and demand. Drivers in major cities like Karachi, Lahore, and Islamabad typically earn more due to higher demand. Peak hour bonuses, trip milestones, and referral rewards can significantly boost your monthly income.
                </p>
            </div>
        </div>
    </section>

    <!-- Drive CTA -->
    <section class="drive-cta">
        <div class="container">
            <div class="drive-cta__card" data-animate="fade-up">
                <div class="drive-cta__content">
                    <span class="drive-cta__badge">
                        <i class="fas fa-car"></i> For Drivers
                    </span>
                    <h2>Start <span class="gradient-text-dark">Earning Today</span></h2>
                    <p>Join 50,000+ drivers across Pakistan who are earning on their own schedule. Download the SHAREIDE Fleet app and get on the road in 24 hours.</p>
                    <div class="drive-cta__stats">
                        <div class="drive-cta__stat">
                            <strong>50K+</strong>
                            <span>Active Drivers</span>
                        </div>
                        <div class="drive-cta__stat">
                            <strong>15%</strong>
                            <span>Low Commission</span>
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
