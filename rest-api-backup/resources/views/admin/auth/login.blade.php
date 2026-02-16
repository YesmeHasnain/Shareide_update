<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SHAREIDE Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#FCC014',
                        'primary-dark': '#E3AD12',
                        secondary: '#F5A623',
                        dark: '#1A1A2E',
                        darker: '#0F0F1A',
                    },
                    fontFamily: {
                        sora: ['Sora', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Sora', sans-serif; }

        .gradient-gold {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
        }
        .gradient-gold-text {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .btn-gradient {
            background: linear-gradient(135deg, #FCC014 0%, #F5A623 100%);
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        .btn-gradient:hover {
            background: linear-gradient(135deg, #E3AD12 0%, #E8930C 100%);
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(252, 192, 20, 0.4);
        }
        .btn-gradient:active {
            transform: translateY(0) scale(0.98);
        }
        .input-focus:focus {
            border-color: #FCC014;
            box-shadow: 0 0 0 3px rgba(252, 192, 20, 0.15);
        }

        /* Animated background orbs (matching website hero) */
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.15;
            animation: float 6s ease-in-out infinite;
        }
        .orb-1 {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, #FCC014, #F5A623);
            top: -100px;
            right: -80px;
            animation-delay: 0s;
        }
        .orb-2 {
            width: 200px;
            height: 200px;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            bottom: -60px;
            left: -60px;
            animation-delay: -3s;
        }
        .orb-3 {
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #10B981, #14B8A6);
            top: 50%;
            left: -40px;
            animation-delay: -1.5s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-scaleIn {
            animation: scaleIn 0.5s ease-out forwards;
        }
    </style>
</head>
<body class="bg-[#F8F9FC] min-h-screen flex items-center justify-center p-4 font-sora relative overflow-hidden">
    <!-- Background Orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="w-full max-w-[420px] relative z-10">
        <!-- Card -->
        <div class="bg-white rounded-[28px] overflow-hidden animate-fadeInUp" style="box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 0 40px rgba(252,192,20,0.08); border: 1px solid #F0F0F3;">
            <!-- Header -->
            <div class="bg-[#0F0F1A] p-8 text-center relative overflow-hidden">
                <!-- Gradient accent line -->
                <div class="absolute top-0 left-0 w-full h-[3px] gradient-gold"></div>

                <!-- Floating particles -->
                <div class="absolute inset-0 overflow-hidden">
                    <div class="absolute w-1 h-1 rounded-full bg-primary/30 top-6 left-10" style="animation: float 4s ease-in-out infinite;"></div>
                    <div class="absolute w-1.5 h-1.5 rounded-full bg-secondary/20 top-12 right-16" style="animation: float 5s ease-in-out infinite; animation-delay: -1s;"></div>
                    <div class="absolute w-1 h-1 rounded-full bg-primary/20 bottom-8 left-1/4" style="animation: float 3.5s ease-in-out infinite; animation-delay: -2s;"></div>
                    <div class="absolute w-2 h-2 rounded-full bg-secondary/10 bottom-4 right-10" style="animation: float 4.5s ease-in-out infinite; animation-delay: -0.5s;"></div>
                </div>

                <div class="relative z-10">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden flex items-center justify-center gradient-gold animate-scaleIn" style="animation-delay: 0.2s; box-shadow: 0 8px 30px rgba(252,192,20,0.3);">
                        <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-14 h-14 object-contain">
                    </div>
                    <h1 class="text-2xl font-bold gradient-gold-text tracking-tight">SHAREIDE</h1>
                    <p class="text-gray-500 text-[13px] mt-1 font-medium">Admin Panel</p>
                </div>
            </div>

            <!-- Form -->
            <div class="p-8">
                <h2 class="text-lg font-bold text-[#1A1A2E] mb-1">Welcome Back!</h2>
                <p class="text-[13px] text-[#6B7280] mb-6">Sign in to access your dashboard</p>

                @if(session('error'))
                    <div class="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-[13px] flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500 text-sm"></i>
                        </div>
                        <span>{{ session('error') }}</span>
                    </div>
                @endif

                <form action="{{ route('admin.login.post') }}" method="POST">
                    @csrf

                    <div class="mb-5">
                        <label class="block text-[13px] font-semibold text-[#1A1A2E] mb-2">Email Address</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i class="fas fa-envelope text-sm"></i>
                            </span>
                            <input type="email" name="email" value="{{ old('email') }}" required
                                class="input-focus w-full pl-11 pr-4 py-3.5 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none transition-all bg-[#F8F9FC] hover:border-[#FCC014]/30 @error('email') border-red-400 @enderror"
                                placeholder="admin@shareide.com">
                        </div>
                        @error('email')
                            <p class="mt-2 text-[11px] text-red-500 flex items-center gap-1"><i class="fas fa-exclamation-circle"></i>{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="mb-5">
                        <label class="block text-[13px] font-semibold text-[#1A1A2E] mb-2">Password</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i class="fas fa-lock text-sm"></i>
                            </span>
                            <input type="password" name="password" required
                                class="input-focus w-full pl-11 pr-4 py-3.5 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none transition-all bg-[#F8F9FC] hover:border-[#FCC014]/30"
                                placeholder="Enter your password">
                        </div>
                    </div>

                    <div class="flex items-center justify-between mb-7">
                        <label class="flex items-center cursor-pointer group">
                            <input type="checkbox" name="remember" id="remember" class="w-4 h-4 rounded border-[#E5E7EB] text-primary focus:ring-primary/30 transition-all">
                            <span class="ml-2 text-[13px] text-[#6B7280] group-hover:text-[#1A1A2E] transition-colors">Remember me</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-gradient w-full text-black font-semibold py-3.5 text-[14px] flex items-center justify-center gap-2">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Log In</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-[12px] text-[#9CA3AF] mt-6 font-medium">
            &copy; {{ date('Y') }} SHAREIDE. All rights reserved.
        </p>
    </div>
</body>
</html>
