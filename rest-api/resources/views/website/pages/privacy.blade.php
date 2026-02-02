@extends('website.layouts.app')

@section('title', 'Privacy Policy - SHAREIDE')
@section('meta_description', 'SHAREIDE Privacy Policy - Learn how we collect, use, and protect your personal information.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Privacy Policy</h1>
        <p data-aos="fade-up" data-aos-delay="100">Last updated: {{ date('F Y') }}</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="background: var(--white); padding: 48px; border-radius: 24px; box-shadow: var(--shadow);">

                <h2>1. Introduction</h2>
                <p>SHAREIDE ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.</p>

                <h2 style="margin-top: 32px;">2. Information We Collect</h2>
                <h4>Personal Information</h4>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Name, email address, phone number</li>
                    <li>CNIC number (for drivers)</li>
                    <li>Payment information</li>
                    <li>Profile photo</li>
                </ul>

                <h4 style="margin-top: 16px;">Location Information</h4>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Real-time location during rides</li>
                    <li>Pickup and drop-off locations</li>
                    <li>Ride history</li>
                </ul>

                <h4 style="margin-top: 16px;">Device Information</h4>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Device type and model</li>
                    <li>Operating system</li>
                    <li>Unique device identifiers</li>
                </ul>

                <h2 style="margin-top: 32px;">3. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Provide and maintain our services</li>
                    <li>Connect riders with drivers</li>
                    <li>Process payments</li>
                    <li>Ensure safety and security</li>
                    <li>Send important notifications</li>
                    <li>Improve our services</li>
                    <li>Comply with legal obligations</li>
                </ul>

                <h2 style="margin-top: 32px;">4. Information Sharing</h2>
                <p>We may share your information with:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li><strong>Drivers/Riders:</strong> Limited information needed to complete rides</li>
                    <li><strong>Payment Processors:</strong> To process transactions</li>
                    <li><strong>Service Providers:</strong> Who assist in our operations</li>
                    <li><strong>Law Enforcement:</strong> When required by law</li>
                </ul>

                <h2 style="margin-top: 32px;">5. Data Security</h2>
                <p>We implement industry-standard security measures including:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>SSL/TLS encryption</li>
                    <li>Secure data storage</li>
                    <li>Regular security audits</li>
                    <li>Access controls</li>
                </ul>

                <h2 style="margin-top: 32px;">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                </ul>

                <h2 style="margin-top: 32px;">7. Data Retention</h2>
                <p>We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your account at any time.</p>

                <h2 style="margin-top: 32px;">8. Children's Privacy</h2>
                <p>Our services are not intended for users under 18. We do not knowingly collect information from children.</p>

                <h2 style="margin-top: 32px;">9. Changes to This Policy</h2>
                <p>We may update this policy periodically. We will notify you of significant changes through the app or email.</p>

                <h2 style="margin-top: 32px;">10. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p style="color: var(--primary-dark);"><strong>Email:</strong> privacy@shareide.com</p>
                <p style="color: var(--primary-dark);"><strong>Address:</strong> Karachi, Pakistan</p>

            </div>
        </div>
    </div>
</section>
@endsection
