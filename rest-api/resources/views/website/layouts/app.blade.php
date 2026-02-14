<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="@yield('meta_description', 'SHAREIDE - Pakistan\'s #1 Ride Sharing App. Book rides, share trips, save money. Safe, affordable, and smart.')">
    <title>@yield('title', 'SHAREIDE - Ride Sharing Pakistan')</title>
    <link rel="icon" type="image/png" href="{{ asset('website/images/favicon.png') }}">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('website/css/base.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('website/css/header.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('website/css/footer.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('website/css/chat-widget.css') }}?v={{ time() }}">
    <link rel="stylesheet" href="{{ asset('website/css/components.css') }}?v={{ time() }}">
    @stack('styles')
</head>
<body>
    <!-- Preloader -->
    <div class="preloader" id="preloader">
        <div class="preloader__inner">
            <img src="{{ asset('website/images/logo-black.png') }}" alt="SHAREIDE" class="preloader__logo">
            <div class="preloader__bar"><div class="preloader__progress"></div></div>
        </div>
    </div>

    <!-- Cursor Glow -->
    <div class="cursor-glow" id="cursorGlow"></div>

    @include('website.partials.header')

    @yield('content')

    @include('website.partials.footer')

    @include('website.partials.chat-widget')

    <!-- Back to Top -->
    <button class="back-to-top" id="backToTop">
        <i class="fas fa-chevron-up"></i>
    </button>

    <script src="{{ asset('website/js/shared.js') }}"></script>
    <script src="{{ asset('website/js/chat-widget.js') }}"></script>
    @stack('scripts')
</body>
</html>
