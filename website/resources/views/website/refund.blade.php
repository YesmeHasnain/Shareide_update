@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
@endpush

@section('content')
    <!-- Page Hero -->
    <section class="page-hero page-hero--legal">
        <canvas class="page-hero__particles" id="pageParticles"></canvas>
        <div class="page-hero__grid"></div>
        <div class="page-hero__orbs">
            <div class="orb orb--1"></div>
            <div class="orb orb--2"></div>
            <div class="orb orb--3"></div>
        </div>
        <div class="page-hero__glow"></div>
        <div class="page-hero__icon"><i class="fas fa-receipt"></i></div>
        <div class="container">
            <nav class="breadcrumb" data-animate="fade-down">
                <a href="{{ route('home') }}">Home</a>
                <span>/</span>
                <span class="breadcrumb__current">Refund & Cancellation Policy</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Refund & <span class="gradient-text">Cancellation</span> Policy</h1>
            <p class="page-hero__desc" data-animate="fade-up">We believe in fairness and transparency. Learn about our cancellation rules, refund eligibility criteria, and the process to request a refund.</p>
        </div>
    </section>

    <!-- Refund Policy Content -->
    <section class="content-section">
        <div class="container">
            <div class="legal-content">
                <p class="legal-updated">Last updated: January 1, 2026</p>

                <!-- Table of Contents -->
                <div class="legal-toc">
                    <h3>Table of Contents</h3>
                    <ol>
                        <li><a href="#cancel-passenger">Cancellation by Passenger</a></li>
                        <li><a href="#cancel-driver">Cancellation by Driver</a></li>
                        <li><a href="#no-show">No-Show Policy</a></li>
                        <li><a href="#refund-eligibility">Refund Eligibility</a></li>
                        <li><a href="#refund-process">Refund Process</a></li>
                        <li><a href="#refund-timeline">Refund Timeline</a></li>
                        <li><a href="#disputes">Disputes</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ol>
                </div>

                <!-- Section 1 -->
                <div class="legal-section" id="cancel-passenger">
                    <h2>1. Cancellation by Passenger</h2>
                    <p>Passengers may cancel a ride request free of charge within 2 minutes of placing the booking, provided that no driver has yet been assigned to the trip. During this grace period, no cancellation fee will be applied, and the ride will be removed from the system without any impact on the passenger's account standing.</p>
                    <p>Once a driver has been assigned and is travelling to the pickup location, a cancellation fee will be charged to compensate the driver for their time, fuel, and opportunity cost. The cancellation fee varies by ride type: Rs. 50 for Solo and Carpool rides, Rs. 100 for Premium rides, and Rs. 150 for Scheduled and Intercity rides. For rides booked with the bid-your-fare feature, the cancellation fee is calculated as 10% of the agreed bid amount, subject to the minimum and maximum fee thresholds for the respective ride type.</p>
                    <p>Passengers who cancel more than 3 rides within a 24-hour period or maintain a cancellation rate above 30% over a rolling 7-day period may face temporary restrictions on their account, including a mandatory waiting period before placing new ride requests. Persistent excessive cancellations may result in account warnings or, in severe cases, temporary suspension. These measures are in place to ensure a fair and reliable experience for all drivers and passengers on the platform.</p>
                </div>

                <!-- Section 2 -->
                <div class="legal-section" id="cancel-driver">
                    <h2>2. Cancellation by Driver</h2>
                    <p>Drivers are expected to honour all accepted ride requests. However, we understand that certain circumstances may require a driver to cancel a trip. Valid reasons for driver-initiated cancellations include passenger no-show at the pickup location (after the mandatory waiting period), legitimate safety concerns, vehicle breakdown or mechanical failure, and emergency situations. Drivers must select a cancellation reason within the app and may be asked to provide additional details for verification.</p>
                    <p>Drivers who cancel rides without a valid reason will be subject to escalating penalties. For the first two unjustified cancellations in a week, a warning notification will be issued. For the third cancellation, a penalty of Rs. 100 will be deducted from the driver's earnings. Continued unjustified cancellations may result in temporary suspension from the platform for 24 to 72 hours, reduced ride allocation priority, or permanent account deactivation for repeated offenders.</p>
                    <p>When a driver cancels a ride, the passenger is automatically offered a re-match with the next available driver at no additional cost. If no replacement driver is found within a reasonable time, the passenger will not be charged any amount for the cancelled trip. In cases where a driver cancels after the passenger has already been waiting for an unreasonable period, the passenger may be eligible for a complimentary ride credit as compensation for the inconvenience.</p>
                </div>

                <!-- Section 3 -->
                <div class="legal-section" id="no-show">
                    <h2>3. No-Show Policy</h2>
                    <p><strong>Passenger No-Show:</strong> When a driver arrives at the designated pickup location, the passenger receives a notification and has a 5-minute window to reach the driver. If the passenger does not appear within 5 minutes and does not respond to the driver's call or in-app messages, the driver may cancel the ride and mark it as a "passenger no-show." In this case, the passenger will be charged a no-show fee equivalent to the minimum fare for the selected ride type (typically Rs. 150 for Solo, Rs. 100 for Carpool, Rs. 250 for Premium).</p>
                    <p><strong>Driver No-Show:</strong> If a driver accepts a ride but fails to arrive at the pickup location within a reasonable time frame without communication, or cancels after an extended waiting period on the passenger's part, the ride is classified as a "driver no-show." In this case, the passenger will receive a full refund of any charges applied, plus a Rs. 50 ride credit as compensation for the inconvenience. The driver will receive a penalty on their account and may face reduced ride allocation for a specified period.</p>
                    <p>Both passenger and driver no-show incidents are tracked and monitored. Users with a high frequency of no-show incidents may be subject to account reviews, warnings, or temporary restrictions. We encourage all users to communicate through the in-app chat or call feature if they are running late or unable to make it to the pickup point, as timely communication can often prevent no-show situations.</p>
                </div>

                <!-- Section 4 -->
                <div class="legal-section" id="refund-eligibility">
                    <h2>4. Refund Eligibility</h2>
                    <p><strong>Eligible for Refund:</strong> Passengers may request a refund in the following situations: they were charged more than the fare displayed at the time of booking due to a system error; the ride was completed but the service was not provided as described (for example, a different vehicle type was sent for a Premium booking); the ride was affected by a verified safety incident; a technical error in the app caused a duplicate charge or incorrect fare calculation; or the driver took a significantly longer route without the passenger's consent, resulting in an inflated fare.</p>
                    <p><strong>Not Eligible for Refund:</strong> Refunds will not be issued in the following circumstances: the passenger had a change of mind after the ride was completed; the ride took longer than expected due to traffic congestion, road construction, or weather conditions (as these are outside the driver's and SHAREIDE's control); the passenger preferred a different route than the one taken by the driver, provided the driver followed the app's navigation; the passenger was charged a legitimate cancellation fee or no-show fee in accordance with this policy; or the passenger's dissatisfaction is related to subjective preferences rather than a service failure.</p>
                    <p>In cases where the refund eligibility is not clear-cut, SHAREIDE's support team will review the ride details, GPS data, fare breakdown, and any available evidence (such as in-app chat logs or photos) before making a determination. SHAREIDE's decision on refund eligibility is made in good faith and aims to be fair to both the rider and the driver partner.</p>
                </div>

                <!-- Section 5 -->
                <div class="legal-section" id="refund-process">
                    <h2>5. Refund Process</h2>
                    <p><strong>How to Request a Refund:</strong> The easiest way to request a refund is through the SHAREIDE app. Navigate to "My Rides," select the ride in question, tap "Report an Issue," and choose the appropriate refund reason. You can also contact our support team via the in-app chat or by emailing refunds@shareide.com with your refund request. When contacting support directly, please include your ride ID, the date and time of the ride, and a brief description of the issue.</p>
                    <p><strong>Required Information:</strong> To process your refund request efficiently, please provide the following details: your SHAREIDE Ride ID (found in your ride history), the specific reason for the refund request, any supporting evidence (such as screenshots of fare discrepancies, photos of vehicle condition issues, or descriptions of the incident), and your preferred refund method if different from the original payment method.</p>
                    <p><strong>Review Process:</strong> Once your refund request is submitted, our support team will review the claim within 24 to 48 hours. During the review, we may examine GPS and route data, fare calculation details, driver and rider ratings for the trip, in-app communication logs, and any supporting evidence provided. You will be notified of the outcome via in-app notification and email. If additional information is needed to process your request, our team will reach out to you directly.</p>
                </div>

                <!-- Section 6 -->
                <div class="legal-section" id="refund-timeline">
                    <h2>6. Refund Timeline</h2>
                    <p><strong>JazzCash and Easypaisa:</strong> Approved refunds to JazzCash or Easypaisa mobile wallets are typically processed within 3 to 5 business days from the date of approval. The refund will appear as a credit in your linked mobile wallet account. Please note that processing times may vary slightly depending on the mobile wallet provider's internal processing schedule.</p>
                    <p><strong>Debit and Credit Cards:</strong> Refunds to debit or credit cards take 5 to 10 business days from the date of approval. The refund is processed through the original payment gateway and credited back to the card used for the transaction. The actual time for the refund to appear on your card statement may vary depending on your bank's processing policies. If you do not see the refund reflected within 10 business days, please contact your bank first, then reach out to SHAREIDE support if the issue persists.</p>
                    <p><strong>Cash Rides:</strong> For rides that were paid in cash, approved refund amounts cannot be returned as cash. Instead, the refund will be credited to your SHAREIDE in-app wallet as ride credit. This credit can be used to pay for future rides on the platform and does not expire. If you prefer a direct refund to a JazzCash or Easypaisa wallet, you may request this through our support team, though processing may take an additional 2 to 3 business days.</p>
                </div>

                <!-- Section 7 -->
                <div class="legal-section" id="disputes">
                    <h2>7. Disputes</h2>
                    <p>If you disagree with the outcome of a refund request, you have the right to escalate the matter for further review. To escalate a dispute, reply to the refund decision notification in the app or email refunds@shareide.com with the subject line "Refund Dispute - [Your Ride ID]." Please include any additional information or evidence that was not part of your original request that you believe supports your claim.</p>
                    <p>Escalated disputes are reviewed by a senior member of our support team who was not involved in the original decision. The escalation review typically takes 3 to 5 business days. During this time, the reviewer will re-examine all available evidence, including ride data, payment records, communication logs, and any new information provided by the user. You will receive a detailed response explaining the final decision.</p>
                    <p>The decision made during the escalation review is considered final for the purposes of SHAREIDE's internal dispute resolution process. If you remain dissatisfied after the escalation process, you may pursue the matter through the formal dispute resolution mechanisms outlined in our Terms of Service, including arbitration under the laws of Pakistan. We strongly encourage users to exhaust the in-app dispute resolution process before seeking external remedies, as most issues can be resolved quickly and fairly through our support team.</p>
                </div>

                <!-- Section 8 -->
                <div class="legal-section" id="contact">
                    <h2>8. Contact Us</h2>
                    <p>Our dedicated support team is here to help you with any questions or concerns about cancellations and refunds. We strive to make the process as smooth and transparent as possible for every SHAREIDE user.</p>
                    <p>You can reach us through the following channels:</p>
                    <ul>
                        <li><strong>Email:</strong> refunds@shareide.com</li>
                        <li><strong>In-App Support Chat:</strong> Navigate to Settings > Help & Support > Refund Request (available 24/7)</li>
                        <li><strong>Phone Support:</strong> +92-51-SHAREIDE (Monday to Saturday, 9:00 AM - 9:00 PM PKT)</li>
                        <li><strong>Address:</strong> SHAREIDE Technologies (Pvt) Ltd, Blue Area, Jinnah Avenue, Islamabad, Pakistan</li>
                    </ul>
                    <p>For the fastest resolution, we recommend using the in-app support chat, as it allows our team to instantly access your ride details and process your request without requiring you to provide additional information. Most refund requests submitted through the app are reviewed within 24 hours.</p>
                </div>
            </div>
        </div>
    </section>
@endsection
