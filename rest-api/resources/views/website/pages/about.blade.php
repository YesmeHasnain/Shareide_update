@extends('website.layouts.app')

@section('title', 'About Us - SHAREIDE')
@section('meta_description', 'Learn about SHAREIDE - Pakistan\'s leading ride-sharing platform. Our mission is to make transportation affordable, safe, and accessible for everyone.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">About SHAREIDE</h1>
        <p data-aos="fade-up" data-aos-delay="100">Transforming transportation in Pakistan, one ride at a time</p>
    </div>
</div>

<!-- Mission Section -->
<section style="padding: 80px 0;">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div data-aos="fade-right">
                <span class="section-tag">Our Mission</span>
                <h2>Making Transportation <span class="text-gradient">Affordable & Safe</span></h2>
                <p style="color: var(--text-light); font-size: 18px; margin-bottom: 24px;">
                    SHAREIDE was founded with a simple yet powerful vision: to revolutionize how Pakistanis travel. We believe that everyone deserves access to safe, affordable, and reliable transportation.
                </p>
                <p style="color: var(--text-light);">
                    Our platform connects riders with verified drivers, creating a community built on trust, safety, and mutual respect. Whether you're commuting to work, heading to the airport, or exploring the city, SHAREIDE is here to make your journey better.
                </p>
            </div>
            <div data-aos="fade-left">
                <div style="background: linear-gradient(135deg, var(--primary), #FFA500); padding: 60px; border-radius: 24px; text-align: center;">
                    <div style="font-size: 80px; font-weight: 800; color: var(--dark);">S</div>
                    <div style="font-size: 24px; font-weight: 700; color: var(--dark);">SHARE<span style="opacity: 0.7;">IDE</span></div>
                    <p style="color: var(--dark); opacity: 0.8; margin-top: 16px;">Ride Together, Save Together</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Values Section -->
<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Our Values</span>
            <h2 class="section-title">What We <span class="text-gradient">Stand For</span></h2>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px;">
            <div style="background: var(--white); padding: 32px; border-radius: 16px; text-align: center;" data-aos="fade-up" data-aos-delay="100">
                <div style="width: 80px; height: 80px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-shield-alt" style="font-size: 32px; color: var(--primary-dark);"></i>
                </div>
                <h4>Safety First</h4>
                <p style="color: var(--text-light); font-size: 14px;">Every ride is tracked and monitored for your complete peace of mind</p>
            </div>

            <div style="background: var(--white); padding: 32px; border-radius: 16px; text-align: center;" data-aos="fade-up" data-aos-delay="200">
                <div style="width: 80px; height: 80px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-hand-holding-heart" style="font-size: 32px; color: var(--primary-dark);"></i>
                </div>
                <h4>Trust</h4>
                <p style="color: var(--text-light); font-size: 14px;">Building lasting relationships through transparency and reliability</p>
            </div>

            <div style="background: var(--white); padding: 32px; border-radius: 16px; text-align: center;" data-aos="fade-up" data-aos-delay="300">
                <div style="width: 80px; height: 80px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-lightbulb" style="font-size: 32px; color: var(--primary-dark);"></i>
                </div>
                <h4>Innovation</h4>
                <p style="color: var(--text-light); font-size: 14px;">Constantly improving with cutting-edge technology and features</p>
            </div>

            <div style="background: var(--white); padding: 32px; border-radius: 16px; text-align: center;" data-aos="fade-up" data-aos-delay="400">
                <div style="width: 80px; height: 80px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i class="fas fa-users" style="font-size: 32px; color: var(--primary-dark);"></i>
                </div>
                <h4>Community</h4>
                <p style="color: var(--text-light); font-size: 14px;">Bringing people together and creating economic opportunities</p>
            </div>
        </div>
    </div>
</section>

<!-- Stats Section -->
<section style="padding: 80px 0; background: linear-gradient(135deg, var(--dark), var(--secondary));">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;">
            <div data-aos="fade-up" data-aos-delay="100">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">500K+</div>
                <div style="color: rgba(255,255,255,0.7);">Happy Riders</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">50K+</div>
                <div style="color: rgba(255,255,255,0.7);">Verified Drivers</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">2M+</div>
                <div style="color: rgba(255,255,255,0.7);">Rides Completed</div>
            </div>
            <div data-aos="fade-up" data-aos-delay="400">
                <div style="font-size: 48px; font-weight: 800; color: var(--primary);">15+</div>
                <div style="color: rgba(255,255,255,0.7);">Cities Covered</div>
            </div>
        </div>
    </div>
</section>

<!-- Team Section -->
<section style="padding: 80px 0;">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">Leadership</span>
            <h2 class="section-title">Meet Our <span class="text-gradient">Team</span></h2>
            <p class="section-subtitle">The passionate people behind SHAREIDE</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 900px; margin: 0 auto;">
            <div style="text-align: center;" data-aos="fade-up" data-aos-delay="100">
                <div style="width: 150px; height: 150px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 60px; color: var(--dark);"></i>
                </div>
                <h4>Founder & CEO</h4>
                <p style="color: var(--text-light);">Visionary leader driving SHAREIDE's mission</p>
            </div>

            <div style="text-align: center;" data-aos="fade-up" data-aos-delay="200">
                <div style="width: 150px; height: 150px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 60px; color: var(--dark);"></i>
                </div>
                <h4>CTO</h4>
                <p style="color: var(--text-light);">Tech expert building innovative solutions</p>
            </div>

            <div style="text-align: center;" data-aos="fade-up" data-aos-delay="300">
                <div style="width: 150px; height: 150px; background: linear-gradient(135deg, var(--primary), #FFA500); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-user" style="font-size: 60px; color: var(--dark);"></i>
                </div>
                <h4>COO</h4>
                <p style="color: var(--text-light);">Operations expert ensuring smooth rides</p>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div style="text-align: center; max-width: 600px; margin: 0 auto;" data-aos="fade-up">
            <h2>Join the SHAREIDE Family</h2>
            <p style="color: var(--text-light); margin-bottom: 32px;">Whether you're a rider looking for affordable rides or a driver wanting to earn, we welcome you!</p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                <a href="{{ route('download') }}" class="btn btn-primary btn-lg">
                    <i class="fas fa-download"></i> Download App
                </a>
                <a href="{{ route('drive') }}" class="btn btn-outline btn-lg">
                    <i class="fas fa-car"></i> Become a Driver
                </a>
            </div>
        </div>
    </div>
</section>
@endsection
