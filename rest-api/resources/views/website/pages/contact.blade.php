@extends('website.layouts.app')

@section('title', 'Contact Us - SHAREIDE')
@section('meta_description', 'Get in touch with SHAREIDE support team. We\'re here to help 24/7. Contact us via phone, email, or submit a support ticket.')

@section('content')
<!-- Page Header -->
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Contact Us</h1>
        <p data-aos="fade-up" data-aos-delay="100">Have questions? We're here to help 24/7</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 60px; align-items: start;">

            <!-- Contact Info -->
            <div data-aos="fade-right">
                <h2 style="margin-bottom: 24px;">Get In Touch</h2>
                <p style="color: var(--text-light); margin-bottom: 40px;">
                    Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.
                </p>

                <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                        <div style="width: 56px; height: 56px; background: var(--primary-light); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-phone" style="font-size: 24px; color: var(--primary-dark);"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 4px;">Phone</h4>
                            <p style="margin: 0; color: var(--text-light);">+92 300 1234567</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                        <div style="width: 56px; height: 56px; background: var(--primary-light); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fab fa-whatsapp" style="font-size: 24px; color: var(--primary-dark);"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 4px;">WhatsApp</h4>
                            <p style="margin: 0; color: var(--text-light);">+92 300 1234567</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                        <div style="width: 56px; height: 56px; background: var(--primary-light); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-envelope" style="font-size: 24px; color: var(--primary-dark);"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 4px;">Email</h4>
                            <p style="margin: 0; color: var(--text-light);">support@shareide.com</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 56px; height: 56px; background: var(--primary-light); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-map-marker-alt" style="font-size: 24px; color: var(--primary-dark);"></i>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 4px;">Office</h4>
                            <p style="margin: 0; color: var(--text-light);">Karachi, Pakistan</p>
                        </div>
                    </div>
                </div>

                <div style="background: var(--gray-50); padding: 24px; border-radius: 16px;">
                    <h4 style="margin-bottom: 12px;"><i class="fas fa-clock" style="color: var(--primary);"></i> Support Hours</h4>
                    <p style="margin: 0; color: var(--text-light);">
                        We're available 24/7 for urgent issues.<br>
                        General inquiries: Mon-Sat, 9 AM - 6 PM
                    </p>
                </div>
            </div>

            <!-- Contact Form -->
            <div data-aos="fade-left">
                <div style="background: var(--white); padding: 40px; border-radius: 24px; box-shadow: var(--shadow-lg);">
                    <h3 style="margin-bottom: 8px;">Send us a Message</h3>
                    <p style="color: var(--text-light); margin-bottom: 32px;">Fill out the form below and we'll get back to you within 24 hours.</p>

                    @if(session('success'))
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            <div>{{ session('success') }}</div>
                        </div>
                    @endif

                    @if($errors->any())
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-circle"></i>
                            <div>
                                <strong>Please fix the following errors:</strong>
                                <ul style="margin: 8px 0 0 16px;">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    @endif

                    <form action="{{ route('contact.submit') }}" method="POST" id="contactForm">
                        @csrf

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" name="name" class="form-input" placeholder="Your name" value="{{ old('name') }}" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email Address *</label>
                                <input type="email" name="email" class="form-input" placeholder="your@email.com" value="{{ old('email') }}" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="form-group">
                                <label class="form-label">Phone Number</label>
                                <input type="tel" name="phone" class="form-input" placeholder="+92 XXX XXXXXXX" value="{{ old('phone') }}">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Inquiry Type *</label>
                                <select name="type" class="form-select" required>
                                    <option value="">Select type</option>
                                    <option value="general" {{ old('type') == 'general' ? 'selected' : '' }}>General Inquiry</option>
                                    <option value="support" {{ old('type') == 'support' ? 'selected' : '' }}>Technical Support</option>
                                    <option value="complaint" {{ old('type') == 'complaint' ? 'selected' : '' }}>Complaint</option>
                                    <option value="feedback" {{ old('type') == 'feedback' ? 'selected' : '' }}>Feedback</option>
                                    <option value="partnership" {{ old('type') == 'partnership' ? 'selected' : '' }}>Partnership</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Subject *</label>
                            <input type="text" name="subject" class="form-input" placeholder="What is this about?" value="{{ old('subject') }}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Message *</label>
                            <textarea name="message" class="form-textarea" placeholder="Tell us more about your inquiry..." required>{{ old('message') }}</textarea>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg btn-block">
                            <i class="fas fa-paper-plane"></i>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FAQ Preview -->
<section style="padding: 80px 0; background: var(--gray-50);">
    <div class="container">
        <div class="section-header" data-aos="fade-up">
            <span class="section-tag">FAQ</span>
            <h2 class="section-title">Frequently Asked <span class="text-gradient">Questions</span></h2>
            <p class="section-subtitle">Quick answers to common questions</p>
        </div>

        <div style="max-width: 800px; margin: 0 auto;" data-aos="fade-up">
            <div class="faq-item" style="background: var(--white); padding: 24px; border-radius: 16px; margin-bottom: 16px; cursor: pointer;">
                <div class="faq-question" style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0;">How do I create an account?</h4>
                    <i class="fas fa-chevron-down" style="color: var(--primary);"></i>
                </div>
                <div class="faq-answer" style="display: none; margin-top: 16px; color: var(--text-light);">
                    Download the SHAREIDE app, enter your phone number, verify via WhatsApp OTP, and complete your profile. It takes less than 2 minutes!
                </div>
            </div>

            <div class="faq-item" style="background: var(--white); padding: 24px; border-radius: 16px; margin-bottom: 16px; cursor: pointer;">
                <div class="faq-question" style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0;">What payment methods are accepted?</h4>
                    <i class="fas fa-chevron-down" style="color: var(--primary);"></i>
                </div>
                <div class="faq-answer" style="display: none; margin-top: 16px; color: var(--text-light);">
                    We accept Cash, JazzCash, Easypaisa, Bank Alfalah cards, and SHAREIDE Wallet balance.
                </div>
            </div>

            <div class="faq-item" style="background: var(--white); padding: 24px; border-radius: 16px; margin-bottom: 16px; cursor: pointer;">
                <div class="faq-question" style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0;">How can I cancel a ride?</h4>
                    <i class="fas fa-chevron-down" style="color: var(--primary);"></i>
                </div>
                <div class="faq-answer" style="display: none; margin-top: 16px; color: var(--text-light);">
                    You can cancel a ride from the app before the driver arrives. Free cancellation within 2 minutes of booking. After that, a small fee may apply.
                </div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{{ route('faq') }}" class="btn btn-outline">View All FAQs <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    </div>
</section>

@push('scripts')
<script>
    // FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.fa-chevron-down');
            const isOpen = answer.style.display === 'block';

            // Close all
            document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
            document.querySelectorAll('.faq-item .fa-chevron-down').forEach(i => i.style.transform = 'rotate(0deg)');

            // Toggle current
            if (!isOpen) {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
</script>
@endpush
@endsection
