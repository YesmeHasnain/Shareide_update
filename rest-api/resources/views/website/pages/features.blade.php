@extends('website.layouts.app')

@section('title', 'Features - SHAREIDE')
@section('meta_description', 'Discover SHAREIDE features - Carpool, Bidding, Rewards, Scheduled Rides, and more. The most feature-rich ride-sharing app in Pakistan.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Powerful Features</h1>
        <p data-aos="fade-up" data-aos-delay="100">Everything you need for the perfect ride experience</p>
    </div>
</div>

<!-- Main Features -->
<section style="padding: 80px 0;">
    <div class="container">
        <div class="features-grid">
            <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                <div class="feature-icon"><i class="fas fa-users"></i></div>
                <h3>Carpool & Share</h3>
                <p>Share rides with others heading the same way. Split costs automatically and reduce your travel expenses by up to 60%.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                <div class="feature-icon"><i class="fas fa-gavel"></i></div>
                <h3>Bid Your Price</h3>
                <p>Don't like the estimated fare? Set your own price and let drivers accept. You're in control of what you pay.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                <div class="feature-icon"><i class="fas fa-gift"></i></div>
                <h3>Rewards Program</h3>
                <p>Earn points on every ride. Unlock tiers, get exclusive discounts, and redeem points for free rides.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                <div class="feature-icon"><i class="fas fa-calendar-alt"></i></div>
                <h3>Schedule Rides</h3>
                <p>Plan ahead! Schedule rides for later - perfect for airport pickups, meetings, and important events.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                <div class="feature-icon"><i class="fas fa-map-marked-alt"></i></div>
                <h3>Live Tracking</h3>
                <p>Track your ride in real-time on the map. Share your trip status with family and friends for added safety.</p>
            </div>

            <div class="feature-card" data-aos="fade-up" data-aos-delay="600">
                <div class="feature-icon"><i class="fas fa-wallet"></i></div>
                <h3>Multiple Payments</h3>
                <p>Pay your way - Cash, JazzCash, Easypaisa, Bank Cards, or SHAREIDE Wallet. Convenience is key.</p>
            </div>
        </div>
    </div>
</section>

<!-- Carpool Feature Detail -->
<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div data-aos="fade-right">
                <span class="section-tag">Save More</span>
                <h2>Carpool with <span class="text-gradient">SHAREIDE</span></h2>
                <p style="color: var(--text-light); font-size: 18px; margin-bottom: 24px;">
                    Why ride alone when you can share? Our smart carpool feature matches you with people going your way.
                </p>
                <ul style="list-style: none; padding: 0;">
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Save up to 60% on ride costs</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Meet new people on your route</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Reduce traffic and pollution</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Automatic cost splitting</span>
                    </li>
                </ul>
            </div>
            <div data-aos="fade-left" style="text-align: center;">
                <div style="width: 300px; height: 300px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-users" style="font-size: 120px; color: var(--dark);"></i>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Bidding Feature Detail -->
<section style="padding: 80px 0;">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div data-aos="fade-right" style="text-align: center; order: 1;">
                <div style="width: 300px; height: 300px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-hand-holding-usd" style="font-size: 120px; color: var(--dark);"></i>
                </div>
            </div>
            <div data-aos="fade-left" style="order: 2;">
                <span class="section-tag">Your Price</span>
                <h2>Bid & <span class="text-gradient">Save</span></h2>
                <p style="color: var(--text-light); font-size: 18px; margin-bottom: 24px;">
                    Our unique bidding system puts you in control. Don't like the fare? Make an offer!
                </p>
                <ul style="list-style: none; padding: 0;">
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Set your own price</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Drivers accept if it works for them</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>No pressure, no obligations</span>
                    </li>
                    <li style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-check-circle" style="color: var(--success); font-size: 20px;"></i>
                        <span>Fair for both riders and drivers</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</section>

<!-- Rewards Feature Detail -->
<section style="padding: 80px 0; background: linear-gradient(135deg, var(--dark), var(--secondary));">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag light">Loyalty Program</span>
            <h2 style="color: var(--white);">Earn Rewards on <span class="text-gradient">Every Ride</span></h2>
            <p style="color: rgba(255,255,255,0.7);">The more you ride, the more you earn. It's that simple!</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 40px;">
            <div style="background: rgba(255,255,255,0.1); padding: 32px; border-radius: 16px; text-align: center; backdrop-filter: blur(10px);" data-aos="fade-up" data-aos-delay="100">
                <div style="width: 60px; height: 60px; background: #CD7F32; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-medal" style="font-size: 28px; color: var(--white);"></i>
                </div>
                <h4 style="color: var(--white);">Bronze</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">0 - 499 points</p>
                <p style="color: var(--primary); font-weight: 600;">2% cashback</p>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 32px; border-radius: 16px; text-align: center; backdrop-filter: blur(10px);" data-aos="fade-up" data-aos-delay="200">
                <div style="width: 60px; height: 60px; background: #C0C0C0; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-medal" style="font-size: 28px; color: var(--dark);"></i>
                </div>
                <h4 style="color: var(--white);">Silver</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">500 - 999 points</p>
                <p style="color: var(--primary); font-weight: 600;">5% cashback</p>
            </div>

            <div style="background: rgba(255,255,255,0.1); padding: 32px; border-radius: 16px; text-align: center; backdrop-filter: blur(10px);" data-aos="fade-up" data-aos-delay="300">
                <div style="width: 60px; height: 60px; background: var(--primary); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-medal" style="font-size: 28px; color: var(--dark);"></i>
                </div>
                <h4 style="color: var(--white);">Gold</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">1000 - 2499 points</p>
                <p style="color: var(--primary); font-weight: 600;">10% cashback</p>
            </div>

            <div style="background: rgba(255,255,255,0.15); padding: 32px; border-radius: 16px; text-align: center; backdrop-filter: blur(10px); border: 2px solid var(--primary);" data-aos="fade-up" data-aos-delay="400">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-crown" style="font-size: 28px; color: var(--dark);"></i>
                </div>
                <h4 style="color: var(--white);">Platinum</h4>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">2500+ points</p>
                <p style="color: var(--primary); font-weight: 600;">15% cashback</p>
            </div>
        </div>
    </div>
</section>

<!-- CTA -->
<section style="padding: 80px 0;">
    <div class="container">
        <div style="text-align: center;" data-aos="fade-up">
            <h2>Ready to Experience These Features?</h2>
            <p style="color: var(--text-light); margin-bottom: 32px;">Download SHAREIDE now and start enjoying the ride!</p>
            <a href="{{ route('download') }}" class="btn btn-primary btn-lg">
                <i class="fas fa-download"></i> Download Now
            </a>
        </div>
    </div>
</section>
@endsection
