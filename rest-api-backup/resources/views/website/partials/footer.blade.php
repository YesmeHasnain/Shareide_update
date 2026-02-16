<footer class="footer">
    <div class="container">
        <div class="footer__grid">
            <div class="footer__brand">
                <img src="{{ asset('website/images/logo-white.png') }}" alt="SHAREIDE" class="footer__logo">
                <p>Pakistan's most trusted ride-sharing platform. Ride together, save together.</p>
                <div class="footer__social">
                    <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                    <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                </div>
            </div>

            <div class="footer__links">
                <h4>Company</h4>
                <a href="{{ route('about') }}">About Us</a>
                <a href="{{ route('blog') }}">Blog</a>
                <a href="{{ route('cities') }}">Cities</a>
                <a href="{{ route('drive-with-us') }}">Become a Driver</a>
            </div>

            <div class="footer__links">
                <h4>Products</h4>
                <a href="{{ route('shareide-app') }}">Passenger App</a>
                <a href="{{ route('shareide-fleet') }}">Fleet App</a>
                <a href="{{ route('carpool') }}">Carpooling</a>
                <a href="{{ route('loyalty') }}">Rewards</a>
            </div>

            <div class="footer__links">
                <h4>Support</h4>
                <a href="{{ route('support') }}">Help Center</a>
                <a href="{{ route('faq') }}">FAQ</a>
                <a href="{{ route('safety') }}">Safety</a>
                <a href="{{ route('how-it-works') }}">How It Works</a>
            </div>
        </div>

        <div class="footer__bottom">
            <p>&copy; {{ date('Y') }} SHAREIDE. All rights reserved.</p>
            <div class="footer__bottom-links">
                <a href="{{ route('privacy') }}">Privacy</a>
                <a href="{{ route('terms') }}">Terms</a>
                <a href="{{ route('refund') }}">Refund Policy</a>
            </div>
        </div>
    </div>
</footer>
