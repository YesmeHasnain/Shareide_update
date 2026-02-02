@extends('website.layouts.app')

@section('title', 'FAQ - SHAREIDE')
@section('meta_description', 'Frequently asked questions about SHAREIDE - Get answers to common questions about rides, payments, safety, and more.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Frequently Asked Questions</h1>
        <p data-aos="fade-up" data-aos-delay="100">Find answers to common questions</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto;">
            @foreach($faqs as $category)
                <div style="margin-bottom: 48px;" data-aos="fade-up">
                    <h3 style="margin-bottom: 24px; color: var(--primary-dark);">{{ $category['category'] }}</h3>

                    @foreach($category['questions'] as $faq)
                        <div class="faq-item" style="background: var(--white); padding: 24px; border-radius: 16px; margin-bottom: 16px; cursor: pointer; box-shadow: var(--shadow-sm); transition: var(--transition);">
                            <div class="faq-question" style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="margin: 0; font-size: 16px;">{{ $faq['q'] }}</h4>
                                <i class="fas fa-chevron-down" style="color: var(--primary); transition: var(--transition);"></i>
                            </div>
                            <div class="faq-answer" style="display: none; margin-top: 16px; color: var(--text-light); padding-top: 16px; border-top: 1px solid var(--gray-200);">
                                {{ $faq['a'] }}
                            </div>
                        </div>
                    @endforeach
                </div>
            @endforeach

            <div style="text-align: center; margin-top: 48px; padding: 40px; background: var(--gray-50); border-radius: 24px;">
                <h3>Still have questions?</h3>
                <p style="color: var(--text-light); margin-bottom: 24px;">Our support team is here to help</p>
                <a href="{{ route('contact') }}" class="btn btn-primary">
                    <i class="fas fa-envelope"></i> Contact Us
                </a>
            </div>
        </div>
    </div>
</section>

@push('scripts')
<script>
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.fa-chevron-down');
            const isOpen = answer.style.display === 'block';

            document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
            document.querySelectorAll('.faq-item .fa-chevron-down').forEach(i => i.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
</script>
@endpush
@endsection
