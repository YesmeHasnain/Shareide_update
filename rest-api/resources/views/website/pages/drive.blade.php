@extends('website.layouts.app')

@section('title', 'Become a Driver - SHAREIDE')
@section('meta_description', 'Join SHAREIDE as a driver partner. Earn up to Rs. 80,000+ per month with flexible hours. Sign up today!')

@section('content')
<div class="page-header" style="background: linear-gradient(135deg, var(--primary) 0%, #FFA500 100%);">
    <div class="container">
        <h1 data-aos="fade-up" style="color: var(--dark);">Drive with SHAREIDE</h1>
        <p data-aos="fade-up" data-aos-delay="100" style="color: rgba(0,0,0,0.7);">Earn on your own schedule. Be your own boss.</p>
    </div>
</div>

<!-- Hero Stats -->
<section style="padding: 60px 0; background: var(--dark);">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;">
            <div data-aos="fade-up">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">80K+</div>
                <div style="color: rgba(255,255,255,0.7);">Monthly Earnings (Rs.)</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="100">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">50K+</div>
                <div style="color: rgba(255,255,255,0.7);">Driver Partners</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">15%</div>
                <div style="color: rgba(255,255,255,0.7);">Low Commission</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">Weekly</div>
                <div style="color: rgba(255,255,255,0.7);">Payouts</div>
            </div>
        </div>
    </div>
</section>

<!-- Benefits -->
<section style="padding: 80px 0;">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Why Drive With Us</span>
            <h2 class="section-title">Benefits of Being a <span class="text-gradient">SHAREIDE Driver</span></h2>
        </div>

        <div class="features-grid">
            <div class="feature-card" data-aos="fade-up">
                <div class="feature-icon"><i class="fas fa-clock"></i></div>
                <h3>Flexible Hours</h3>
                <p>Work when you want. Drive part-time or full-time - you're in control of your schedule.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-money-bill-wave"></i></div>
                <h3>Earn More</h3>
                <p>Keep more of what you earn with our low 15% commission. Weekly payouts guaranteed.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-award"></i></div>
                <h3>Driver Rewards</h3>
                <p>Earn bonuses for completing rides, maintaining high ratings, and reaching milestones.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-headset"></i></div>
                <h3>24/7 Support</h3>
                <p>Our dedicated driver support team is always here to help you with any issues.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                <h3>Insurance Coverage</h3>
                <p>Drive with peace of mind knowing you're covered while on the job.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
                <h3>Easy App</h3>
                <p>Our driver app is simple to use with navigation, earnings tracking, and more.</p>
            </div>
        </div>
    </div>
</section>

<!-- Requirements -->
<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Get Started</span>
            <h2 class="section-title">Requirements to <span class="text-gradient">Drive</span></h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 900px; margin: 0 auto;">
            <div style="text-align: center;" data-aos="fade-up">
                <div style="width: 100px; height: 100px; background: var(--white); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow);">
                    <i class="fas fa-id-card" style="font-size: 40px; color: var(--primary-dark);"></i>
                </div>
                <h4>Valid CNIC</h4>
                <p style="color: var(--text-light); font-size: 14px;">Pakistani national ID card for verification</p>
            </div>

            <div style="text-align: center;" data-aos="fade-up" data-aos-delay="100">
                <div style="width: 100px; height: 100px; background: var(--white); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow);">
                    <i class="fas fa-file-alt" style="font-size: 40px; color: var(--primary-dark);"></i>
                </div>
                <h4>Driving License</h4>
                <p style="color: var(--text-light); font-size: 14px;">Valid LTV/HTV license</p>
            </div>

            <div style="text-align: center;" data-aos="fade-up" data-aos-delay="200">
                <div style="width: 100px; height: 100px; background: var(--white); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow);">
                    <i class="fas fa-car" style="font-size: 40px; color: var(--primary-dark);"></i>
                </div>
                <h4>Vehicle</h4>
                <p style="color: var(--text-light); font-size: 14px;">Car, bike, or rickshaw (2015 or newer)</p>
            </div>
        </div>
    </div>
</section>

<!-- How to Join -->
<section style="padding: 80px 0;">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Simple Process</span>
            <h2 class="section-title">Start Driving in <span class="text-gradient">3 Steps</span></h2>
        </div>

        <div class="steps-container">
            <div class="steps-line"></div>

            <div class="step" data-aos="fade-up">
                <div class="step-number">1</div>
                <div class="step-content">
                    <div class="step-icon"><i class="fas fa-download"></i></div>
                    <h3>Download App</h3>
                    <p>Download the SHAREIDE Fleet app from Play Store or App Store.</p>
                </div>
            </div>

            <div class="step" data-aos="fade-up" data-aos-delay="100">
                <div class="step-number">2</div>
                <div class="step-content">
                    <div class="step-icon"><i class="fas fa-upload"></i></div>
                    <h3>Submit Documents</h3>
                    <p>Upload your CNIC, license, and vehicle documents for verification.</p>
                </div>
            </div>

            <div class="step" data-aos="fade-up" data-aos-delay="200">
                <div class="step-number">3</div>
                <div class="step-content">
                    <div class="step-icon"><i class="fas fa-road"></i></div>
                    <h3>Start Earning</h3>
                    <p>Once approved, go online and start accepting rides!</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA -->
<section style="padding: 80px 0; background: linear-gradient(135deg, var(--primary) 0%, #FFA500 100%);">
    <div class="container" style="text-align: center;">
        <h2 style="color: var(--dark);" data-aos="fade-up">Ready to Start Earning?</h2>
        <p style="color: rgba(0,0,0,0.7); margin-bottom: 32px;" data-aos="fade-up" data-aos-delay="100">Download the driver app and register today!</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;" data-aos="fade-up" data-aos-delay="200">
            <a href="{{ route('download.driver') }}" class="btn btn-white btn-lg">
                <i class="fab fa-google-play"></i> Download Driver App
            </a>
            <a href="{{ route('contact') }}" class="btn btn-outline btn-lg" style="border-color: var(--dark); color: var(--dark);">
                <i class="fas fa-question-circle"></i> Have Questions?
            </a>
        </div>
    </div>
</section>
@endsection
