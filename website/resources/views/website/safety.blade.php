@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--safety">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-shield-alt"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Safety & Trust</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Safety & <span class="gradient-text">Trust</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Your safety is not just a feature -- it is the foundation of everything we build. Multiple layers of protection for every ride across Pakistan.</p>
        </div>
    </section>

    <!-- Safety Overview - Shield Grid -->
    <section class="content-section">
        <div class="container">
            <div class="safety__grid">
                <div class="safety__content" data-animate="fade-right">
                    <span class="section__tag">Safety First</span>
                    <h2 class="section__title">Your Safety is Our <span class="gradient-text">Priority</span></h2>
                    <p class="safety__desc">We have built multiple layers of protection to ensure every ride on SHAREIDE is safe and secure. From NADRA-verified drivers to real-time monitoring, we leave nothing to chance.</p>

                    <div class="safety__features">
                        <div class="safety__feature">
                            <div class="safety__feature-icon">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>CNIC Verified Drivers</strong>
                                <span>Every driver verified through NADRA database</span>
                            </div>
                        </div>
                        <div class="safety__feature">
                            <div class="safety__feature-icon safety__feature-icon--blue">
                                <i class="fas fa-satellite"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>Live GPS Tracking</strong>
                                <span>Real-time location sharing with family</span>
                            </div>
                        </div>
                        <div class="safety__feature">
                            <div class="safety__feature-icon safety__feature-icon--red">
                                <i class="fas fa-phone-volume"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>Emergency SOS Button</strong>
                                <span>One-tap emergency alert to authorities</span>
                            </div>
                        </div>
                        <div class="safety__feature">
                            <div class="safety__feature-icon safety__feature-icon--purple">
                                <i class="fas fa-share-alt"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>Share Trip with Family</strong>
                                <span>Live trip sharing via WhatsApp & SMS</span>
                            </div>
                        </div>
                        <div class="safety__feature">
                            <div class="safety__feature-icon safety__feature-icon--teal">
                                <i class="fas fa-headset"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>24/7 Support Team</strong>
                                <span>Always here when you need us</span>
                            </div>
                        </div>
                        <div class="safety__feature">
                            <div class="safety__feature-icon safety__feature-icon--orange">
                                <i class="fas fa-file-shield"></i>
                            </div>
                            <div class="safety__feature-content">
                                <strong>Ride Insurance</strong>
                                <span>Every ride is fully insured</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="safety__visual" data-animate="fade-left">
                    <div class="safety__shield">
                        <div class="safety__shield-ring safety__shield-ring--1"></div>
                        <div class="safety__shield-ring safety__shield-ring--2"></div>
                        <div class="safety__shield-ring safety__shield-ring--3"></div>
                        <div class="safety__shield-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <div class="safety__stat-cards">
                        <div class="safety__stat-card">
                            <span class="safety__stat-value">99.9%</span>
                            <span class="safety__stat-text">Safe Rides</span>
                        </div>
                        <div class="safety__stat-card">
                            <span class="safety__stat-value">24/7</span>
                            <span class="safety__stat-text">Monitoring</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- For Riders -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Rider Safety</span>
                <h2 class="section__title">Safety for <span class="gradient-text">Riders</span></h2>
                <p class="section__desc">Comprehensive safety features designed to protect every passenger</p>
            </div>

            <div class="three-col">
                <div class="info-card" data-animate="fade-up" data-delay="0">
                    <div class="info-card__icon">
                        <i class="fas fa-id-badge"></i>
                    </div>
                    <h3 class="info-card__title">Driver Verification</h3>
                    <p class="info-card__text">Every driver's CNIC is verified through the NADRA database before they can accept rides. We verify identity, driving license, and criminal background to ensure only trustworthy drivers join our platform.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="100">
                    <div class="info-card__icon">
                        <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <h3 class="info-card__title">Live Trip Tracking</h3>
                    <p class="info-card__text">Track your ride in real-time from pickup to destination. Share your live trip with up to 5 trusted contacts who can follow your journey on a map, ensuring someone always knows where you are.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="200">
                    <div class="info-card__icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="info-card__title">Emergency SOS</h3>
                    <p class="info-card__text">One tap on the SOS button sends an emergency alert with your live location to the SHAREIDE safety team and your emergency contacts. Our team responds within seconds and coordinates with local authorities.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="300">
                    <div class="info-card__icon">
                        <i class="fas fa-female"></i>
                    </div>
                    <h3 class="info-card__title">Ladies Safety Mode</h3>
                    <p class="info-card__text">Women riders can activate Ladies Only mode to be matched exclusively with verified female or specially vetted drivers. Additional safety alerts are sent to emergency contacts automatically when this mode is active.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="400">
                    <div class="info-card__icon">
                        <i class="fas fa-comment-slash"></i>
                    </div>
                    <h3 class="info-card__title">In-App Chat Safety</h3>
                    <p class="info-card__text">All communication between riders and drivers happens through the SHAREIDE app using masked phone numbers. Personal numbers are never shared, and our AI monitors chat for inappropriate content.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="500">
                    <div class="info-card__icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="info-card__title">Ride Insurance</h3>
                    <p class="info-card__text">Every SHAREIDE ride is covered by comprehensive insurance. In the unlikely event of an accident or incident, our insurance policy covers medical expenses and damages for all passengers on board.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- For Drivers -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Driver Safety</span>
                <h2 class="section__title">Safety for <span class="gradient-text">Drivers</span></h2>
                <p class="section__desc">We protect our drivers just as much as our riders</p>
            </div>

            <div class="three-col">
                <div class="info-card" data-animate="fade-up" data-delay="0">
                    <div class="info-card__icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3 class="info-card__title">Rider Verification</h3>
                    <p class="info-card__text">All riders must verify their phone number and provide a valid CNIC during registration. This ensures driver partners know who they are picking up, creating a two-way trust system.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="100">
                    <div class="info-card__icon">
                        <i class="fas fa-route"></i>
                    </div>
                    <h3 class="info-card__title">Trip Details Upfront</h3>
                    <p class="info-card__text">Drivers see the full trip details including destination, estimated fare, and rider rating before accepting any ride. No blind trips -- you always know where you are going and how much you will earn.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="200">
                    <div class="info-card__icon">
                        <i class="fas fa-phone-alt"></i>
                    </div>
                    <h3 class="info-card__title">Driver SOS Button</h3>
                    <p class="info-card__text">Drivers have access to the same SOS emergency button as riders. One tap alerts the SHAREIDE safety team and local emergency contacts. Our support team provides immediate assistance.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="300">
                    <div class="info-card__icon">
                        <i class="fas fa-ban"></i>
                    </div>
                    <h3 class="info-card__title">Rider Blacklisting</h3>
                    <p class="info-card__text">Drivers can report and block problematic riders. Repeated complaints result in rider account suspension. We take driver feedback seriously and act swiftly to maintain a respectful community.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="400">
                    <div class="info-card__icon">
                        <i class="fas fa-car-crash"></i>
                    </div>
                    <h3 class="info-card__title">Accident Support</h3>
                    <p class="info-card__text">In the event of an accident, our dedicated incident response team assists immediately. We coordinate with hospitals, police, and insurance providers to ensure drivers receive the support they need.</p>
                </div>

                <div class="info-card" data-animate="fade-up" data-delay="500">
                    <div class="info-card__icon">
                        <i class="fas fa-gavel"></i>
                    </div>
                    <h3 class="info-card__title">Fare Protection</h3>
                    <p class="info-card__text">Our system protects drivers from fare disputes and payment fraud. Agreed fares are locked in before the trip starts. In case of disputes, our support team reviews trip data and resolves issues fairly.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Verification Process -->
    <section class="content-section content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Verification</span>
                <h2 class="section__title">Our Verification <span class="gradient-text">Process</span></h2>
                <p class="section__desc">A rigorous multi-step process to ensure trust and safety</p>
            </div>

            <div class="process-steps" data-animate="fade-up">
                <div class="process-step" data-animate="fade-up" data-delay="0">
                    <div class="process-step__number">1</div>
                    <div class="process-step__content">
                        <h3>Identity Verification via NADRA</h3>
                        <p>Every driver and rider submits their CNIC (Computerized National Identity Card). We cross-verify this through the NADRA database to confirm identity, age, and citizenship status. Only Pakistani nationals with valid CNICs are approved.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="100">
                    <div class="process-step__number">2</div>
                    <div class="process-step__content">
                        <h3>Document Authentication</h3>
                        <p>For drivers, we verify the authenticity of driving licenses, vehicle registration books, and vehicle fitness certificates. Our system checks document validity, expiry dates, and cross-references them with government records.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="200">
                    <div class="process-step__number">3</div>
                    <div class="process-step__content">
                        <h3>Background Screening</h3>
                        <p>All driver applicants undergo comprehensive background checks. We screen for criminal records, traffic violations, and other red flags. Drivers with serious offences are rejected to maintain the highest safety standards for our riders.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="300">
                    <div class="process-step__number">4</div>
                    <div class="process-step__content">
                        <h3>Vehicle Inspection</h3>
                        <p>Every vehicle is inspected for safety compliance including brakes, tyres, lights, seatbelts, and overall condition. Vehicles must meet our minimum safety standards and possess a valid fitness certificate from the relevant authority.</p>
                    </div>
                </div>

                <div class="process-step" data-animate="fade-up" data-delay="400">
                    <div class="process-step__number">5</div>
                    <div class="process-step__content">
                        <h3>Ongoing Monitoring</h3>
                        <p>Verification does not stop at onboarding. We continuously monitor driver ratings, rider feedback, and trip behaviour. Drivers falling below our safety thresholds receive warnings, retraining, or permanent removal from the platform.</p>
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
                <h2 class="download-cta__title">Ride <span class="gradient-text">Safely</span> with SHAREIDE</h2>
                <p class="download-cta__desc">Download the app and experience the <strong>safest rides</strong> in Pakistan.</p>

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
                        <i class="fas fa-shield-alt"></i>
                        <span>NADRA Verified</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-check-circle"></i>
                        <span>99.9% Safe Rides</span>
                    </div>
                    <div class="download-cta__trust-item">
                        <i class="fas fa-headset"></i>
                        <span>24/7 Support</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
