@extends('website.layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('website/css/page.css') }}">
<style>
    .form-message { padding: 15px; border-radius: 12px; margin-top: 15px; font-size: 14px; }
    .form-message--success { background: rgba(16,185,129,0.1); color: #10B981; border: 1px solid rgba(16,185,129,0.2); }
    .form-message--error { background: rgba(239,68,68,0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.2); }
    .ticket-result { margin-top: 20px; text-align: left; }
    .ticket-result--error { color: #EF4444; text-align: center; }
    .ticket-info__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .ticket-status { padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .ticket-status--open, .ticket-status--waiting_response, .ticket-status--in_progress { background: rgba(16,185,129,0.1); color: #10B981; }
    .ticket-status--closed, .ticket-status--resolved { background: rgba(107,114,128,0.1); color: #6B7280; }
    .ticket-info__messages { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding: 10px 0; }
    .ticket-msg { padding: 12px 16px; border-radius: 12px; max-width: 85%; }
    .ticket-msg--user { background: rgba(252,192,20,0.08); align-self: flex-end; border-radius: 12px 12px 4px 12px; }
    .ticket-msg--admin { background: #F3F4F6; align-self: flex-start; border-radius: 12px 12px 12px 4px; }
    .ticket-msg p { font-size: 14px; margin-bottom: 4px; white-space: pre-line; }
    .ticket-msg small { font-size: 11px; color: #6B7280; }

    /* Live chat reply form */
    .ticket-reply-form { display: flex; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light, #E5E7EB); }
    .ticket-reply-form input {
        flex: 1; padding: 12px 16px; background: var(--surface, #F9FAFB); border: 1px solid var(--border-light, #E5E7EB);
        border-radius: 50px; font-size: 14px; font-family: 'Sora', sans-serif; outline: none; color: var(--text, #1F2937);
        transition: border-color 0.3s ease;
    }
    .ticket-reply-form input:focus { border-color: var(--primary, #FCC014); }
    .ticket-reply-form input:disabled { opacity: 0.5; cursor: not-allowed; }
    .ticket-reply-form button {
        width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, var(--primary, #FCC014), var(--secondary, #F59E0B)); border-radius: 50%;
        font-size: 15px; color: var(--black, #000); transition: all 0.3s ease; border: none; cursor: pointer; flex-shrink: 0;
    }
    .ticket-reply-form button:hover { transform: scale(1.05); }
    .ticket-reply-form button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Typing indicator dots */
    .ticket-typing { display: inline-flex; align-items: center; gap: 4px; padding: 10px 16px; background: #F3F4F6; border-radius: 12px 12px 12px 4px; align-self: flex-start; }
    .ticket-typing span {
        width: 7px; height: 7px; background: #9CA3AF; border-radius: 50%;
        animation: ticketTypingBounce 1.4s infinite ease-in-out;
    }
    .ticket-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ticket-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ticketTypingBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
    }

    /* Live badge */
    .ticket-live-badge {
        display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px;
        background: rgba(34,197,94,0.15); border-radius: 50px; font-size: 11px; font-weight: 600; color: #16a34a;
    }
    .ticket-live-badge .pulse-dot {
        width: 7px; height: 7px; background: #22c55e; border-radius: 50%;
        animation: ticketLivePulse 2s infinite;
    }
    @keyframes ticketLivePulse {
        0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
        70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
    .ticket-closed-notice {
        text-align: center; padding: 12px; color: #6B7280; font-size: 13px;
        margin-top: 10px; border-top: 1px solid var(--border-light, #E5E7EB);
    }
</style>
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
                <span class="breadcrumb__current">Support</span>
            </nav>
            <h1 class="page-hero__title" data-animate="fade-up">Help & <span class="gradient-text">Support</span></h1>
            <p class="page-hero__desc" data-animate="fade-up">We're here to help. Reach out to our support team or look up an existing ticket. Available 24/7 for your convenience.</p>
        </div>
    </section>

    <!-- Section 1: Contact Form + Info Cards -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Contact Us</span>
                <h2 class="section__title">Get in <span class="gradient-text">Touch</span></h2>
                <p class="section__desc">Send us a message and we'll respond as quickly as possible</p>
            </div>
            <div class="two-col">
                <div data-animate="fade-right">
                    <form class="contact-form" id="supportContactForm" style="max-width: 100%;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="supportName">Full Name *</label>
                                <input type="text" id="supportName" placeholder="Enter your full name" required>
                            </div>
                            <div class="form-group">
                                <label for="supportEmail">Email Address *</label>
                                <input type="email" id="supportEmail" placeholder="Enter your email" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="supportPhone">Phone Number</label>
                            <input type="tel" id="supportPhone" placeholder="e.g. +92 3XX XXXXXXX">
                        </div>
                        <div class="form-group">
                            <label for="supportSubject">Subject *</label>
                            <input type="text" id="supportSubject" placeholder="What is your issue about?" required>
                        </div>
                        <div class="form-group">
                            <label for="supportMessage">Message *</label>
                            <textarea id="supportMessage" placeholder="Describe your issue in detail..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn--primary btn--lg" style="width: 100%; justify-content: center;">
                            <i class="fas fa-paper-plane"></i>
                            Send Message
                        </button>
                        <div id="formMessage" style="display: none;"></div>
                    </form>
                </div>
                <div data-animate="fade-left">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="info-card">
                            <div class="info-card__icon"><i class="fas fa-envelope"></i></div>
                            <h3 class="info-card__title">Email Us</h3>
                            <p class="info-card__text">Send us an email and we'll get back to you within 24 hours. For urgent issues, please use the contact form or call us directly.<br><br><strong style="color: var(--primary-dark);">support@shareide.com</strong></p>
                        </div>
                        <div class="info-card">
                            <div class="info-card__icon"><i class="fas fa-phone"></i></div>
                            <h3 class="info-card__title">Call Us</h3>
                            <p class="info-card__text">Speak directly with our support team for immediate assistance with your issue.<br><br><strong style="color: var(--primary-dark);">+92 XXX XXXXXXX</strong></p>
                        </div>
                        <div class="info-card">
                            <div class="info-card__icon"><i class="fas fa-clock"></i></div>
                            <h3 class="info-card__title">Working Hours</h3>
                            <p class="info-card__text">Our support team is available around the clock to assist you with any questions or concerns.<br><br><strong style="color: var(--primary-dark);">24/7 Support</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Section 2: Ticket Lookup -->
    <section class="content-section--alt">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Track Ticket</span>
                <h2 class="section__title">Ticket <span class="gradient-text">Lookup</span></h2>
                <p class="section__desc">Already submitted a ticket? Check its status here</p>
            </div>
            <div class="ticket-lookup" data-animate="fade-up" data-delay="200">
                <h3>Check Ticket Status</h3>
                <p>Enter the ticket token you received via email to view your support ticket status and any replies from our team.</p>
                <form id="ticketLookupForm">
                    <div class="form-group">
                        <label for="ticketToken">Ticket Token</label>
                        <input type="text" id="ticketToken" placeholder="Enter your ticket token">
                    </div>
                    <button type="submit" class="btn btn--primary btn--lg" style="width: 100%; justify-content: center;">
                        <i class="fas fa-search"></i>
                        Look Up Ticket
                    </button>
                </form>
                <div id="ticketResult" style="display: none;"></div>
            </div>
        </div>
    </section>

    <!-- Section 3: Quick Help Topics -->
    <section class="content-section">
        <div class="container">
            <div class="section__header" data-animate="fade-up">
                <span class="section__tag">Quick Help</span>
                <h2 class="section__title">Common <span class="gradient-text">Topics</span></h2>
                <p class="section__desc">Browse our FAQ for instant answers</p>
            </div>
            <div class="three-col" data-animate="fade-up" data-delay="200">
                <a href="{{ route('faq') }}" class="info-card" style="display: block;">
                    <div class="info-card__icon"><i class="fas fa-car"></i></div>
                    <h3 class="info-card__title">Booking Issues</h3>
                    <p class="info-card__text">Having trouble booking a ride? Can't find a driver? Ride cancelled unexpectedly? Check our FAQ for solutions to common booking issues.</p>
                </a>
                <a href="{{ route('faq') }}" class="info-card" style="display: block;">
                    <div class="info-card__icon"><i class="fas fa-credit-card"></i></div>
                    <h3 class="info-card__title">Payment Problems</h3>
                    <p class="info-card__text">Charged incorrectly? Payment failed? Need a refund? Find answers to all payment-related questions in our comprehensive FAQ section.</p>
                </a>
                <a href="{{ route('faq') }}" class="info-card" style="display: block;">
                    <div class="info-card__icon"><i class="fas fa-shield-alt"></i></div>
                    <h3 class="info-card__title">Safety Concerns</h3>
                    <p class="info-card__text">Questions about driver verification, safety features, or need to report an incident? Our FAQ covers all safety-related topics in detail.</p>
                </a>
            </div>
        </div>
    </section>
@endsection

@push('scripts')
<script src="{{ asset('website/js/support.js') }}"></script>
@endpush
