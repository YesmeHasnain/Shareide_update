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
                <span class="breadcrumb__current">Terms of Service</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Terms of <span class="gradient-text">Service</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">Please read these terms carefully before using the SHAREIDE platform. By accessing or using our services, you agree to be bound by these terms.</p>
        </div>
    </section>

    <!-- Terms Content -->
    <section class="content-section">
        <div class="container">
            <div class="legal-content">
                <p class="legal-updated">Last updated: January 1, 2026</p>

                <!-- Table of Contents -->
                <div class="legal-toc">
                    <h3>Table of Contents</h3>
                    <ol>
                        <li><a href="#acceptance">Acceptance of Terms</a></li>
                        <li><a href="#service-desc">Service Description</a></li>
                        <li><a href="#user-accounts">User Accounts</a></li>
                        <li><a href="#booking-rides">Booking & Rides</a></li>
                        <li><a href="#payment-terms">Payment Terms</a></li>
                        <li><a href="#user-conduct">User Conduct</a></li>
                        <li><a href="#cancellation">Cancellation Policy</a></li>
                        <li><a href="#liability">Limitation of Liability</a></li>
                        <li><a href="#disputes">Dispute Resolution</a></li>
                        <li><a href="#contact-info">Contact Information</a></li>
                    </ol>
                </div>

                <!-- Section 1 -->
                <div class="legal-section" id="acceptance">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By downloading, installing, accessing, or using the SHAREIDE mobile application or website (collectively, the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and SHAREIDE Technologies (Private) Limited, a company registered under the laws of Pakistan.</p>
                    <p>If you do not agree with any part of these Terms, you must immediately discontinue your use of the Platform. Your continued access to or use of the SHAREIDE Platform following the posting of any changes to these Terms shall constitute your acceptance of such modifications.</p>
                    <p>These Terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, including but not limited to the Pakistan Electronic Crimes Act 2016, the Prevention of Electronic Crimes Act 2016, and the Pakistan Telecommunication (Re-Organization) Act 1996. Any legal proceedings arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Pakistan.</p>
                </div>

                <!-- Section 2 -->
                <div class="legal-section" id="service-desc">
                    <h2>2. Service Description</h2>
                    <p>SHAREIDE operates a technology platform that connects riders (passengers seeking transportation) with drivers (independent transportation providers) through its mobile application and website. SHAREIDE acts as an intermediary facilitating the connection between riders and drivers and does not itself provide transportation services, employ drivers, or own vehicles used for rides.</p>
                    <p>The Platform offers multiple ride categories to suit different needs, including Solo Rides (private individual trips), Carpool (shared rides with multiple passengers travelling in the same direction), Premium (luxury vehicle experiences), Scheduled Rides (advance booking for future trips), Ladies Only (rides exclusively for female passengers with verified female drivers), and Intercity (long-distance travel between Pakistani cities).</p>
                    <p>SHAREIDE's unique bid-your-fare feature allows riders to propose their own fare for a trip, which drivers may accept, decline, or counter-offer. The Platform also provides fare estimation, real-time GPS tracking, in-app communication, multiple payment methods, and a rating system to ensure service quality and accountability.</p>
                </div>

                <!-- Section 3 -->
                <div class="legal-section" id="user-accounts">
                    <h2>3. User Accounts</h2>
                    <p>To use the SHAREIDE Platform, you must create a user account by providing accurate, complete, and current information, including a valid Pakistani mobile phone number. You must be at least 18 years of age to create an account. By registering, you represent and warrant that all information you provide is truthful and that you are legally authorised to enter into this agreement.</p>
                    <p>Each individual is permitted to maintain only one active SHAREIDE account. Creating multiple accounts, using fraudulent information, or allowing others to use your account is strictly prohibited and may result in immediate account termination. You are solely responsible for maintaining the confidentiality of your account credentials, including your password and OTP codes, and for all activities that occur under your account.</p>
                    <p>Driver partners must additionally submit valid documentation for verification, including a CNIC (Computerized National Identity Card), a valid driving licence issued by a Pakistani authority, vehicle registration documents, and a clear profile photograph. All driver documents are verified through NADRA and relevant provincial authorities. SHAREIDE reserves the right to reject or revoke driver registration at any time if documents are found to be invalid, expired, or fraudulent.</p>
                </div>

                <!-- Section 4 -->
                <div class="legal-section" id="booking-rides">
                    <h2>4. Booking & Rides</h2>
                    <p>When you request a ride through the SHAREIDE app, you provide your pickup location, drop-off destination, and preferred ride type. Our system calculates an estimated fare based on distance, time, traffic conditions, and ride category. You may choose to accept the estimated fare or use the bid-your-fare feature to propose a different amount. Drivers in your area will receive your ride request and may accept or decline based on the offered fare and route.</p>
                    <p>Once a driver accepts your ride request, you will receive the driver's details, including their name, photo, vehicle type, colour, and licence plate number. The driver will proceed to your pickup location, and you can track their arrival in real time through the app. You are expected to be at the designated pickup point when the driver arrives. If you are not present within 5 minutes of the driver's arrival, the ride may be cancelled and a no-show fee may apply.</p>
                    <p>Fare estimates provided at the time of booking are approximations and may differ from the final fare due to route changes, traffic conditions, toll charges, or waiting time. The final fare is calculated based on the actual distance travelled and time taken. By confirming a ride request, you agree to pay the final fare amount as calculated by the Platform, unless there is a demonstrable error in the fare calculation.</p>
                </div>

                <!-- Section 5 -->
                <div class="legal-section" id="payment-terms">
                    <h2>5. Payment Terms</h2>
                    <p>SHAREIDE supports multiple payment methods for rider convenience, including cash payment to the driver, JazzCash mobile wallet, Easypaisa mobile wallet, and debit or credit card payments processed through secure payment gateways. You may select your preferred payment method before confirming each ride. For digital payment methods, you must ensure that your linked wallet or card has sufficient funds to cover the fare.</p>
                    <p>Fares are calculated based on a combination of base fare, per-kilometre charge, per-minute charge, and applicable surcharges (such as peak-hour adjustments or toll charges). The fare structure varies by ride type and city. SHAREIDE charges a service commission on each completed ride, which is deducted from the driver's earnings. The commission percentage is communicated to drivers at the time of registration and may be updated with prior notice.</p>
                    <p>Refunds for overcharges, service failures, or billing errors will be processed in accordance with our Refund Policy. For digital payments, refunds are credited back to the original payment method. For cash payments, eligible refund amounts are credited to your SHAREIDE in-app wallet. SHAREIDE reserves the right to withhold or deduct amounts from a user's account in cases of payment fraud, chargebacks, or violation of these Terms.</p>
                </div>

                <!-- Section 6 -->
                <div class="legal-section" id="user-conduct">
                    <h2>6. User Conduct</h2>
                    <p>All users of the SHAREIDE Platform are expected to conduct themselves with respect, courtesy, and regard for the safety and comfort of others. Prohibited conduct includes, but is not limited to: physical or verbal abuse towards drivers, riders, or SHAREIDE staff; harassment, threats, or intimidation; discrimination based on gender, ethnicity, religion, or any other protected characteristic; damaging a driver's vehicle; travelling under the influence of drugs or alcohol to an extent that endangers safety; and carrying illegal substances, weapons, or hazardous materials during rides.</p>
                    <p>After each ride, both riders and drivers are encouraged to rate each other on a scale of 1 to 5 stars and provide optional feedback. Ratings are used to maintain service quality standards across the platform. Users who consistently receive low ratings (below 4.0) may receive warnings, temporary suspensions, or permanent account deactivation, depending on the severity and frequency of complaints.</p>
                    <p>SHAREIDE reserves the right to suspend or permanently terminate any user account that violates these conduct standards, engages in fraudulent activity, manipulates the rating system, creates fake accounts, or otherwise misuses the Platform. Decisions regarding account suspension or termination are made at SHAREIDE's sole discretion, and users will be notified via email and in-app notification of any actions taken against their account.</p>
                </div>

                <!-- Section 7 -->
                <div class="legal-section" id="cancellation">
                    <h2>7. Cancellation Policy</h2>
                    <p>Riders may cancel a ride request free of charge within 2 minutes of booking, provided a driver has not yet been assigned. Once a driver has been assigned and is en route to the pickup location, a cancellation fee may apply. The cancellation fee varies by ride type: Rs. 50 for Solo and Carpool rides, Rs. 100 for Premium rides, and Rs. 150 for Scheduled and Intercity rides. These fees compensate drivers for their time and fuel costs incurred while travelling to the pickup location.</p>
                    <p>Drivers who frequently cancel accepted rides without valid reason may face penalties, including reduced ride allocation priority, temporary suspension from the platform, or deduction of cancellation penalties from their earnings. Valid reasons for driver cancellations include rider no-show, safety concerns, or vehicle breakdown, and must be reported through the app with supporting details.</p>
                    <p>If a rider does not appear at the designated pickup point within 5 minutes of the driver's arrival, the driver may cancel the ride. In this case, the rider will be charged a no-show fee equivalent to the minimum fare for the selected ride type. Frequent no-shows may result in account warnings or restrictions. For complete details on refunds related to cancellations, please refer to our Refund & Cancellation Policy.</p>
                </div>

                <!-- Section 8 -->
                <div class="legal-section" id="liability">
                    <h2>8. Limitation of Liability</h2>
                    <p>SHAREIDE operates solely as a technology platform connecting riders with independent driver partners. SHAREIDE is not a transportation company, taxi service, or common carrier. The actual transportation service is provided by independent driver partners who are not employees, agents, or representatives of SHAREIDE. As such, SHAREIDE does not assume liability for the actions, conduct, or negligence of any driver or rider using the Platform.</p>
                    <p>To the maximum extent permitted by the laws of Pakistan, SHAREIDE, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of income, loss of data, personal injury, or property damage arising out of or in connection with the use of the Platform or any transportation services facilitated through the Platform.</p>
                    <p>SHAREIDE's total aggregate liability for any claims arising from your use of the Platform shall not exceed the amount paid by you to SHAREIDE in the twelve (12) months immediately preceding the event giving rise to the claim. This limitation of liability applies regardless of the theory of liability, whether in contract, tort, strict liability, or otherwise, and even if SHAREIDE has been advised of the possibility of such damages.</p>
                </div>

                <!-- Section 9 -->
                <div class="legal-section" id="disputes">
                    <h2>9. Dispute Resolution</h2>
                    <p>These Terms of Service and any disputes arising out of or relating to your use of the SHAREIDE Platform shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Both parties agree to attempt to resolve any disputes amicably through direct negotiation before resorting to formal dispute resolution mechanisms.</p>
                    <p>If a dispute cannot be resolved through direct negotiation within 30 days, either party may submit the dispute to binding arbitration in accordance with the Arbitration Act, 1940, as applicable in Pakistan. The arbitration shall be conducted by a sole arbitrator mutually agreed upon by both parties, and the proceedings shall take place in Islamabad, Pakistan. The language of arbitration shall be English or Urdu, as agreed by both parties. The arbitrator's decision shall be final and binding on both parties.</p>
                    <p>Notwithstanding the foregoing, either party may seek injunctive or equitable relief from the competent courts of Islamabad, Pakistan, to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights or confidential information. The courts of Islamabad shall have exclusive jurisdiction over any legal proceedings that are not subject to arbitration under this section.</p>
                </div>

                <!-- Section 10 -->
                <div class="legal-section" id="contact-info">
                    <h2>10. Contact Information</h2>
                    <p>If you have any questions, concerns, or feedback regarding these Terms of Service, please contact our legal team. We are committed to addressing your enquiries and resolving any issues in a timely and professional manner.</p>
                    <p>You can reach us at:</p>
                    <ul>
                        <li><strong>Email:</strong> legal@shareide.com</li>
                        <li><strong>Address:</strong> SHAREIDE Technologies (Pvt) Ltd, Blue Area, Jinnah Avenue, Islamabad, Pakistan</li>
                        <li><strong>In-App Support:</strong> Navigate to Settings > Help & Support > Legal Enquiry</li>
                        <li><strong>Phone:</strong> +92-51-SHAREIDE (during business hours, Mon-Fri 9:00 AM - 6:00 PM PKT)</li>
                    </ul>
                    <p>For ride-related disputes or fare issues, we recommend using the in-app support feature for the fastest resolution. Our support team typically responds to in-app queries within 2 hours during business hours.</p>
                </div>
            </div>
        </div>
    </section>
@endsection
