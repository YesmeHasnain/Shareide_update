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
                <span class="breadcrumb__current">Privacy Policy</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Privacy <span class="gradient-text">Policy</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information.</p>
        </div>
    </section>

    <!-- Privacy Policy Content -->
    <section class="content-section">
        <div class="container">
            <div class="legal-content">
                <p class="legal-updated">Last updated: January 1, 2026</p>

                <!-- Table of Contents -->
                <div class="legal-toc">
                    <h3>Table of Contents</h3>
                    <ol>
                        <li><a href="#info-collect">Information We Collect</a></li>
                        <li><a href="#how-use">How We Use Your Information</a></li>
                        <li><a href="#info-sharing">Information Sharing</a></li>
                        <li><a href="#data-storage">Data Storage & Security</a></li>
                        <li><a href="#your-rights">Your Rights</a></li>
                        <li><a href="#cookies">Cookies & Tracking</a></li>
                        <li><a href="#third-party">Third-Party Services</a></li>
                        <li><a href="#children">Children's Privacy</a></li>
                        <li><a href="#changes">Changes to This Policy</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ol>
                </div>

                <!-- Section 1 -->
                <div class="legal-section" id="info-collect">
                    <h2>1. Information We Collect</h2>
                    <p>When you create an account or use the SHAREIDE platform, we collect certain personal information necessary to provide our ride-sharing services. This includes your full name, email address, phone number, and profile photo. For driver partners, we additionally collect your CNIC (Computerized National Identity Card) number for verification through NADRA, your driving licence details, and vehicle registration information.</p>
                    <p>We automatically collect location data when you use the SHAREIDE app, including your pickup and drop-off points, real-time GPS coordinates during active rides, and frequently visited locations for route suggestions. This location data is essential for matching you with nearby drivers, calculating accurate fares, and providing navigation assistance.</p>
                    <p>We also collect ride history data (including routes taken, fare amounts, and ride ratings), payment information (such as JazzCash, Easypaisa, or card details used for transactions), and device information (including device model, operating system version, app version, and unique device identifiers) to ensure the security and optimal performance of our services.</p>
                </div>

                <!-- Section 2 -->
                <div class="legal-section" id="how-use">
                    <h2>2. How We Use Your Information</h2>
                    <p>The primary purpose of collecting your information is to provide, maintain, and improve our ride-sharing services. We use your personal data to create and manage your account, verify your identity, and facilitate communication between riders and drivers during trips. Your location data enables us to match you with the nearest available driver, calculate estimated fares, and provide real-time trip tracking.</p>
                    <p>We process your payment information to facilitate fare transactions between riders and drivers, issue refunds when applicable, and maintain accurate financial records. Ride history data helps us improve our route-matching algorithms, provide personalised ride suggestions, and resolve disputes between users.</p>
                    <p>Additionally, we may use your contact information to send important service-related notifications, such as ride confirmations, payment receipts, and safety alerts. With your consent, we may also send promotional communications about new features, discounts, and loyalty rewards. You can opt out of marketing communications at any time through your app settings.</p>
                </div>

                <!-- Section 3 -->
                <div class="legal-section" id="info-sharing">
                    <h2>3. Information Sharing</h2>
                    <p>SHAREIDE shares limited personal information between riders and drivers solely for the purpose of completing a trip. When a ride is booked, the driver receives the rider's first name, pickup location, and drop-off destination. Similarly, the rider receives the driver's name, photo, vehicle details, licence plate number, and real-time location. This information is only accessible during and immediately after the active trip.</p>
                    <p>We share payment transaction data with our authorised payment processing partners, including JazzCash, Easypaisa, and bank payment gateways, strictly to process fare payments and refunds. These partners are contractually bound to protect your financial information and may not use it for any purpose other than processing SHAREIDE transactions.</p>
                    <p>We may disclose your personal information to law enforcement agencies, regulatory authorities, or courts of law in Pakistan when required by applicable law, legal process, or government request. We may also share information when we believe in good faith that disclosure is necessary to protect the safety of our users, prevent fraud, or enforce our Terms of Service.</p>
                </div>

                <!-- Section 4 -->
                <div class="legal-section" id="data-storage">
                    <h2>4. Data Storage & Security</h2>
                    <p>All personal data collected by SHAREIDE is stored on secure servers located within Pakistan, in compliance with local data residency requirements. We employ industry-standard encryption protocols, including AES-256 encryption for data at rest and TLS 1.3 for data in transit, to protect your information from unauthorised access, alteration, or disclosure.</p>
                    <p>We implement strict access controls to ensure that only authorised SHAREIDE personnel can access user data, and only to the extent necessary to perform their job functions. Our systems are regularly audited for security vulnerabilities, and we conduct periodic penetration testing to identify and address potential threats.</p>
                    <p>While we take every reasonable precaution to protect your data, no method of electronic transmission or storage is completely secure. In the unlikely event of a data breach, we will promptly notify affected users and the relevant regulatory authorities in accordance with applicable Pakistan data protection laws.</p>
                </div>

                <!-- Section 5 -->
                <div class="legal-section" id="your-rights">
                    <h2>5. Your Rights</h2>
                    <p>As a SHAREIDE user, you have the right to access the personal information we hold about you. You can view and download your account data, ride history, and payment records at any time through the "My Data" section in the SHAREIDE app or by contacting our support team.</p>
                    <p>You have the right to request correction of any inaccurate or incomplete personal data. If your phone number, email address, or other personal details change, you can update them directly in the app. For changes to CNIC-verified information, please contact our support team for assisted verification.</p>
                    <p>You may request the deletion of your SHAREIDE account and associated personal data at any time. Upon receiving a deletion request, we will remove your personal data within 30 days, except where retention is required by law (such as financial transaction records which must be retained for tax and audit purposes). You also have the right to request a portable copy of your data in a commonly used machine-readable format, and the right to opt out of marketing communications while continuing to receive essential service notifications.</p>
                </div>

                <!-- Section 6 -->
                <div class="legal-section" id="cookies">
                    <h2>6. Cookies & Tracking</h2>
                    <p>The SHAREIDE website uses cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us remember your preferences, analyse website traffic, and understand how users interact with our site. We use essential cookies for website functionality, analytics cookies to measure site performance, and preference cookies to remember your settings.</p>
                    <p>Within the SHAREIDE mobile app, we use analytics tools to track app usage patterns, feature engagement, and crash reports. This data helps us identify performance issues, understand which features are most valuable to our users, and prioritise improvements. All analytics data is aggregated and anonymised wherever possible.</p>
                    <p>You can manage your cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, though doing so may affect the functionality of our website. For the mobile app, you can adjust tracking permissions through your device's privacy settings.</p>
                </div>

                <!-- Section 7 -->
                <div class="legal-section" id="third-party">
                    <h2>7. Third-Party Services</h2>
                    <p>SHAREIDE integrates with several third-party services to deliver a seamless ride-sharing experience. We use Google Maps and the Google Maps Platform for navigation, route calculation, estimated time of arrival, and address geocoding. When you use the SHAREIDE app, your location data is shared with Google in accordance with Google's privacy policy.</p>
                    <p>For digital payment processing, we partner with JazzCash (operated by Jazz/Mobilink Microfinance Bank) and Easypaisa (operated by Telenor Microfinance Bank), as well as bank card payment gateways. These payment partners process your financial transactions securely and are regulated by the State Bank of Pakistan. Your payment data is handled in compliance with PCI DSS (Payment Card Industry Data Security Standard) requirements.</p>
                    <p>We use analytics providers such as Google Analytics and Firebase to monitor app performance, track usage patterns, and improve our services. These providers may collect anonymised usage data in accordance with their respective privacy policies. We encourage you to review the privacy policies of these third-party services for a complete understanding of their data practices.</p>
                </div>

                <!-- Section 8 -->
                <div class="legal-section" id="children">
                    <h2>8. Children's Privacy</h2>
                    <p>SHAREIDE's services are not intended for individuals under the age of 18. We do not knowingly collect, store, or process personal information from children under 18 years of age. Our account registration process requires users to confirm that they are at least 18 years old, and driver partners must provide a valid CNIC, which is only issued to Pakistani citizens aged 18 and above.</p>
                    <p>If we become aware that we have inadvertently collected personal information from a child under 18, we will take immediate steps to delete such data from our servers. If you are a parent or guardian and believe that your child has provided personal information to SHAREIDE without your consent, please contact us at privacy@shareide.com so we can take appropriate action.</p>
                </div>

                <!-- Section 9 -->
                <div class="legal-section" id="changes">
                    <h2>9. Changes to This Policy</h2>
                    <p>SHAREIDE reserves the right to update or modify this Privacy Policy at any time to reflect changes in our data practices, legal requirements, or business operations. When we make material changes to this policy, we will notify you through in-app notifications, email, or a prominent notice on our website at least 14 days before the changes take effect.</p>
                    <p>Your continued use of the SHAREIDE platform after the effective date of any updated Privacy Policy constitutes your acceptance of the revised terms. We encourage you to review this policy periodically to stay informed about how we protect your information. The "Last updated" date at the top of this page indicates when the policy was most recently revised.</p>
                </div>

                <!-- Section 10 -->
                <div class="legal-section" id="contact">
                    <h2>10. Contact Us</h2>
                    <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please do not hesitate to contact our Privacy Team. We are committed to addressing your enquiries promptly and transparently.</p>
                    <p>You can reach us at:</p>
                    <ul>
                        <li><strong>Email:</strong> privacy@shareide.com</li>
                        <li><strong>Address:</strong> SHAREIDE Technologies, Blue Area, Jinnah Avenue, Islamabad, Pakistan</li>
                        <li><strong>In-App Support:</strong> Navigate to Settings > Help & Support > Privacy Enquiry</li>
                    </ul>
                    <p>We aim to respond to all privacy-related enquiries within 5 business days. For data access or deletion requests, please allow up to 30 days for processing.</p>
                </div>
            </div>
        </div>
    </section>
@endsection
