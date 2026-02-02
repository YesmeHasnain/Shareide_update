@extends('website.layouts.app')

@section('title', 'Safety - SHAREIDE')
@section('meta_description', 'Your safety is our priority. Learn about SHAREIDE\'s safety features - driver verification, live tracking, SOS button, and 24/7 support.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Your Safety Matters</h1>
        <p data-aos="fade-up" data-aos-delay="100">Comprehensive safety features for peace of mind</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Safety First</span>
            <h2 class="section-title">How We Keep You <span class="text-gradient">Safe</span></h2>
        </div>

        <div class="features-grid">
            <div class="feature-card" data-aos="fade-up">
                <div class="feature-icon"><i class="fas fa-id-card"></i></div>
                <h3>Driver Verification</h3>
                <p>All drivers undergo CNIC verification, background checks, and vehicle inspection before they can drive.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-map-marker-alt"></i></div>
                <h3>Live GPS Tracking</h3>
                <p>Track your ride in real-time. Share your trip status with family and friends so they know you're safe.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>SOS Emergency Button</h3>
                <p>One tap sends an alert to our safety team and your emergency contacts with your live location.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-phone-alt"></i></div>
                <h3>24/7 Support</h3>
                <p>Our support team is available around the clock to help you with any safety concerns.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-star"></i></div>
                <h3>Rating System</h3>
                <p>Rate every ride. Drivers with low ratings are reviewed and removed from the platform if needed.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-user-shield"></i></div>
                <h3>Masked Calling</h3>
                <p>Your phone number is never shared with drivers. All calls go through our secure system.</p>
            </div>
        </div>
    </div>
</section>

<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;" data-aos="fade-up">
            <h2>Safety Tips</h2>
            <p style="color: var(--text-light); margin-bottom: 40px;">Follow these simple tips for a safer ride</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: left;">
                <div style="background: var(--white); padding: 24px; border-radius: 16px; display: flex; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-check" style="color: var(--primary-dark);"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px;">Verify your driver</h4>
                        <p style="color: var(--text-light); font-size: 14px; margin: 0;">Match the car and driver photo with app details before getting in.</p>
                    </div>
                </div>

                <div style="background: var(--white); padding: 24px; border-radius: 16px; display: flex; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-share" style="color: var(--primary-dark);"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px;">Share your trip</h4>
                        <p style="color: var(--text-light); font-size: 14px; margin: 0;">Use the share trip feature to let loved ones track your journey.</p>
                    </div>
                </div>

                <div style="background: var(--white); padding: 24px; border-radius: 16px; display: flex; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-map-pin" style="color: var(--primary-dark);"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px;">Follow the route</h4>
                        <p style="color: var(--text-light); font-size: 14px; margin: 0;">Keep an eye on the map. Report if driver takes unexpected detours.</p>
                    </div>
                </div>

                <div style="background: var(--white); padding: 24px; border-radius: 16px; display: flex; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas fa-phone" style="color: var(--primary-dark);"></i>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 8px;">Use in-app calling</h4>
                        <p style="color: var(--text-light); font-size: 14px; margin: 0;">Never share your personal phone number. Use the app to communicate.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section style="padding: 80px 0;">
    <div class="container" style="text-align: center;">
        <h2>Need Help?</h2>
        <p style="color: var(--text-light); margin-bottom: 32px;">Our safety team is available 24/7</p>
        <a href="{{ route('contact') }}" class="btn btn-primary btn-lg">
            <i class="fas fa-headset"></i> Contact Support
        </a>
    </div>
</section>
@endsection
