@extends('website.layouts.app')

@section('title', 'Terms of Service - SHAREIDE')
@section('meta_description', 'SHAREIDE Terms of Service - Read the terms and conditions for using our ride-sharing platform.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Terms of Service</h1>
        <p data-aos="fade-up" data-aos-delay="100">Last updated: {{ date('F Y') }}</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="background: var(--white); padding: 48px; border-radius: 24px; box-shadow: var(--shadow);">

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing or using SHAREIDE, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

                <h2 style="margin-top: 32px;">2. Description of Service</h2>
                <p>SHAREIDE provides a technology platform that connects passengers with independent transportation providers ("Drivers"). We do not provide transportation services directly.</p>

                <h2 style="margin-top: 32px;">3. User Accounts</h2>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>You must be at least 18 years old to use our services</li>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One account per person is allowed</li>
                </ul>

                <h2 style="margin-top: 32px;">4. User Conduct</h2>
                <p>You agree NOT to:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Violate any laws or regulations</li>
                    <li>Harass, threaten, or harm others</li>
                    <li>Provide false information</li>
                    <li>Use the service for illegal purposes</li>
                    <li>Interfere with the platform's operation</li>
                </ul>

                <h2 style="margin-top: 32px;">5. Payments</h2>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Fares are calculated based on distance, time, and demand</li>
                    <li>Payment is due at the end of each ride</li>
                    <li>We accept various payment methods</li>
                    <li>Promotional discounts may have specific terms</li>
                </ul>

                <h2 style="margin-top: 32px;">6. Cancellation Policy</h2>
                <p>Free cancellation is available within 2 minutes of booking. After that, a cancellation fee may apply. Repeated cancellations may result in account restrictions.</p>

                <h2 style="margin-top: 32px;">7. Disclaimers</h2>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Services are provided "as is"</li>
                    <li>We do not guarantee uninterrupted service</li>
                    <li>We are not liable for driver actions</li>
                    <li>Use the service at your own risk</li>
                </ul>

                <h2 style="margin-top: 32px;">8. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law, SHAREIDE shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>

                <h2 style="margin-top: 32px;">9. Intellectual Property</h2>
                <p>All content, trademarks, and materials on SHAREIDE are owned by us and protected by intellectual property laws. You may not use our content without permission.</p>

                <h2 style="margin-top: 32px;">10. Termination</h2>
                <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion.</p>

                <h2 style="margin-top: 32px;">11. Governing Law</h2>
                <p>These terms shall be governed by the laws of Pakistan. Any disputes shall be resolved in the courts of Karachi, Pakistan.</p>

                <h2 style="margin-top: 32px;">12. Changes to Terms</h2>
                <p>We may modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>

                <h2 style="margin-top: 32px;">13. Contact</h2>
                <p>For questions about these Terms, contact us at: <strong>legal@shareide.com</strong></p>

            </div>
        </div>
    </div>
</section>
@endsection
