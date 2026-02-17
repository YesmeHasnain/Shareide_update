@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--support">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-question-circle"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">FAQ</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Frequently Asked <span class="gradient-text">Questions</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Find quick answers to everything about SHAREIDE. Can't find what you're looking for? Contact our 24/7 support team.</p>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="content-section">
        <div class="container">
            <!-- FAQ Search -->
            <div class="faq-search" data-animate="fade-up">
                <i class="fas fa-search"></i>
                <input type="text" id="faqSearch" placeholder="Search your question...">
            </div>

            <!-- FAQ Categories -->
            <div class="faq-categories" data-animate="fade-up" data-delay="100">
                <button class="faq-cat-btn active" data-category="all">All</button>
                <button class="faq-cat-btn" data-category="account">Account</button>
                <button class="faq-cat-btn" data-category="rides">Rides</button>
                <button class="faq-cat-btn" data-category="payment">Payment</button>
                <button class="faq-cat-btn" data-category="safety">Safety</button>
                <button class="faq-cat-btn" data-category="driver">Driver</button>
            </div>

            <!-- FAQ List -->
            <div class="faq-list" data-animate="fade-up" data-delay="200">

                <!-- Account Questions -->
                <div class="faq-item" data-category="account">
                    <button class="faq-question">
                        <span>How do I create an account?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Creating a SHAREIDE account is simple. Download the app from Google Play Store, open it, and tap "Sign Up." Enter your mobile number, verify it with the OTP code sent via SMS, and fill in your basic details like name and email. Your account will be ready to use in under a minute.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="account">
                    <button class="faq-question">
                        <span>Can I use multiple phone numbers?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Each SHAREIDE account is linked to a single phone number for security purposes. If you need to change your phone number, you can update it in the app settings under "Profile." Your ride history, rewards, and settings will be transferred to the new number after OTP verification.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="account">
                    <button class="faq-question">
                        <span>How do I delete my account?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            To delete your account, go to Settings > Account > Delete Account in the SHAREIDE app. You will need to confirm your identity with an OTP. Please note that account deletion is permanent and all your ride history, rewards, and saved information will be removed. You can also contact our support team at support@shareide.com for assistance.
                        </div>
                    </div>
                </div>

                <!-- Rides Questions -->
                <div class="faq-item" data-category="rides">
                    <button class="faq-question">
                        <span>How do I book a ride?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Open the SHAREIDE app and enter your pickup and drop-off locations. Choose your ride type (Solo, Carpool, or Premium), review the estimated fare, and tap "Book Ride." A nearby verified driver will be matched with you within seconds. You can track your driver's arrival in real-time on the map.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="rides">
                    <button class="faq-question">
                        <span>What ride types are available?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE offers multiple ride types to suit your needs: <strong>Solo</strong> -- a private ride just for you; <strong>Carpool</strong> -- share with others heading in the same direction and save up to 60%; <strong>Premium</strong> -- luxury vehicles for a comfortable experience; and <strong>Bike</strong> -- quick motorcycle rides for short distances (available in select cities).
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="rides">
                    <button class="faq-question">
                        <span>Can I schedule a ride in advance?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Yes, SHAREIDE allows you to schedule rides up to 7 days in advance. This is perfect for airport trips, early morning commutes, or important meetings. Simply tap the clock icon when booking, select your preferred date and time, and we will find a driver for you at the scheduled time.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="rides">
                    <button class="faq-question">
                        <span>How does carpooling work?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Carpooling lets you share a ride with other passengers heading in a similar direction. When you select "Carpool," SHAREIDE's smart algorithm matches you with compatible riders. The fare is split among all passengers, saving everyone up to 60%. Each passenger's pickup and drop-off is optimized for the shortest route, so you reach your destination quickly while paying less.
                        </div>
                    </div>
                </div>

                <!-- Payment Questions -->
                <div class="faq-item" data-category="payment">
                    <button class="faq-question">
                        <span>What payment methods are accepted?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE supports multiple payment methods for your convenience: <strong>Cash</strong> -- pay the driver directly at the end of the ride; <strong>JazzCash</strong> -- pay via your JazzCash mobile wallet; <strong>Easypaisa</strong> -- use your Easypaisa account; <strong>Debit/Credit Card</strong> -- Visa and Mastercard accepted. You can set your preferred payment method in the app settings.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="payment">
                    <button class="faq-question">
                        <span>How does the bidding system work?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE's unique bidding system lets you set your own fare. After entering your destination, you can either accept the suggested fare or submit a bid with your preferred price. Nearby drivers can see your bid and accept it, counter-offer, or decline. This gives you the power to negotiate and get the best possible deal on every ride.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="payment">
                    <button class="faq-question">
                        <span>Can I get a refund?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Yes, refunds are available in certain situations such as driver cancellations, incorrect charges, or if there was a significant issue with your ride. To request a refund, go to your ride history, select the ride in question, and tap "Report Issue." Our support team reviews all refund requests and processes eligible refunds within 3-5 business days to your original payment method.
                        </div>
                    </div>
                </div>

                <!-- Safety Questions -->
                <div class="faq-item" data-category="safety">
                    <button class="faq-question">
                        <span>How are drivers verified?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            Every SHAREIDE driver goes through a rigorous verification process. We verify their CNIC through the NADRA database, check their driver's license and vehicle registration, perform criminal background checks, and conduct an in-person interview. Drivers must also maintain a minimum rating to stay on the platform. This multi-step process ensures that only trustworthy individuals drive on SHAREIDE.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="safety">
                    <button class="faq-question">
                        <span>What safety features are available?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE includes comprehensive safety features: <strong>Live GPS Tracking</strong> -- track your ride in real-time; <strong>SOS Emergency Button</strong> -- one-tap alert to emergency contacts and our safety team; <strong>Trip Sharing</strong> -- share your live trip with family and friends; <strong>Driver Rating System</strong> -- rate and review every ride; <strong>24/7 Safety Team</strong> -- our dedicated team monitors rides around the clock; <strong>Ride Insurance</strong> -- every ride is fully insured.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="safety">
                    <button class="faq-question">
                        <span>What should I do in an emergency?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            In case of an emergency during a ride, tap the SOS button in the SHAREIDE app. This immediately alerts our 24/7 safety team and sends your live location to your emergency contacts. You can also call 1122 (Rescue) directly from the app. Our safety team will contact you within seconds and coordinate with local authorities if needed. After the ride, you can file a detailed report in the app.
                        </div>
                    </div>
                </div>

                <!-- Driver Questions -->
                <div class="faq-item" data-category="driver">
                    <button class="faq-question">
                        <span>How do I become a driver?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            To become a SHAREIDE driver, download the SHAREIDE Fleet app from Google Play Store. Sign up with your phone number, upload the required documents (CNIC, driver's license, vehicle registration), and submit for verification. Our team will review your application within 24-48 hours. Once approved, you can start accepting rides and earning immediately. Visit our <a href="{{ route('drive-with-us') }}" style="color: var(--primary-dark); font-weight: 600;">Drive With Us</a> page for more details.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="driver">
                    <button class="faq-question">
                        <span>What documents do I need to drive?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            To register as a SHAREIDE driver, you need: a valid CNIC (National Identity Card), a valid driver's license, a vehicle registration book for a vehicle no older than 10 years, a recent passport-size photograph, and a smartphone with an active internet connection. All documents are verified through official channels to ensure the safety of our riders.
                        </div>
                    </div>
                </div>

                <div class="faq-item" data-category="driver">
                    <button class="faq-question">
                        <span>How do I receive my earnings?</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer__inner">
                            SHAREIDE drivers receive their earnings on a daily basis. You can choose to receive payments via bank transfer, JazzCash, or Easypaisa. For cash rides, you collect payment directly from the passenger. SHAREIDE's commission (15%) is deducted automatically from your digital ride earnings. You can view a detailed breakdown of your earnings, trips, and deductions in the Fleet app dashboard.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
@endsection

@push('scripts')
<script src="{{ asset('website/js/faq.js') }}"></script>
@endpush
