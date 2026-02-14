<header class="header @if(!request()->routeIs('home')) header--inner @endif" id="header">
    <nav class="nav container">
        <a href="{{ route('home') }}" class="nav__logo">
            <img src="{{ asset('website/images/logo-black.png') }}" alt="SHAREIDE" class="nav__logo-img nav__logo-dark">
            <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="nav__logo-img nav__logo-light">
        </a>

        <div class="nav__menu" id="nav-menu">
            <ul class="nav__list">
                <li><a href="{{ route('home') }}" class="nav__link {{ request()->routeIs('home') ? 'active' : '' }}">Home</a></li>
                <li><a href="{{ route('about') }}" class="nav__link {{ request()->routeIs('about') ? 'active' : '' }}">About</a></li>
                <li><a href="{{ route('shareide-fleet') }}" class="nav__link {{ request()->routeIs('shareide-fleet') ? 'active' : '' }}">SHAREIDE Fleet</a></li>
                <li><a href="{{ route('how-it-works') }}" class="nav__link {{ request()->routeIs('how-it-works') ? 'active' : '' }}">How It Works</a></li>
                <li><a href="{{ route('safety') }}" class="nav__link {{ request()->routeIs('safety') ? 'active' : '' }}">Safety</a></li>
                <li><a href="{{ route('drive-with-us') }}" class="nav__link {{ request()->routeIs('drive-with-us') ? 'active' : '' }}">Drive</a></li>
                <li><a href="{{ route('support') }}" class="nav__link {{ request()->routeIs('support') ? 'active' : '' }}">Support</a></li>
            </ul>
            <div class="nav__close" id="nav-close">
                <i class="fas fa-times"></i>
            </div>
        </div>

        <div class="nav__buttons">
            <a href="{{ route('download') }}" class="btn btn--primary btn--glow">
                <i class="fas fa-download"></i>
                Get App
            </a>
            <div class="nav__toggle" id="nav-toggle">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>
</header>
