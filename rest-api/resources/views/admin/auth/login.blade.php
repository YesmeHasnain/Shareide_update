<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SHAREIDE Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#FFD700',
                        dark: '#1A1A2E',
                        darker: '#16162a',
                    },
                    fontFamily: {
                        poppins: ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Poppins', sans-serif; }
        .gradient-gold {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        }
        .gradient-gold-text {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .btn-gradient {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            transition: all 0.3s ease;
        }
        .btn-gradient:hover {
            background: linear-gradient(135deg, #E6C200 0%, #E69500 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 165, 0, 0.4);
        }
        .input-focus:focus {
            border-color: #FFD700;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
            <!-- Header with Gradient -->
            <div class="bg-dark p-8 text-center relative overflow-hidden">
                <!-- Gradient Accent -->
                <div class="absolute top-0 left-0 w-full h-1 gradient-gold"></div>

                <img src="{{ asset('images/logo/icon.png') }}" alt="SHAREIDE" class="w-20 h-20 mx-auto mb-4">
                <h1 class="text-2xl font-bold gradient-gold-text">SHAREIDE</h1>
                <p class="text-gray-400 mt-1">Admin Panel</p>
            </div>

            <!-- Form -->
            <div class="p-8">
                <h2 class="text-xl font-semibold text-gray-800 mb-6">Welcome Back!</h2>

                @if(session('error'))
                    <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        <i class="fas fa-exclamation-circle mr-2"></i>{{ session('error') }}
                    </div>
                @endif

                <form action="{{ route('admin.login.post') }}" method="POST">
                    @csrf

                    <div class="mb-5">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i class="fas fa-envelope"></i>
                            </span>
                            <input type="email" name="email" value="{{ old('email') }}" required
                                class="input-focus w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none transition-all @error('email') border-red-500 @enderror"
                                placeholder="admin@shareide.com">
                        </div>
                        @error('email')
                            <p class="mt-2 text-xs text-red-500"><i class="fas fa-exclamation-circle mr-1"></i>{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="mb-5">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <i class="fas fa-lock"></i>
                            </span>
                            <input type="password" name="password" required
                                class="input-focus w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none transition-all"
                                placeholder="Enter your password">
                        </div>
                    </div>

                    <div class="flex items-center justify-between mb-6">
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" name="remember" id="remember" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
                            <span class="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-gradient w-full text-black font-semibold py-3 rounded-xl text-sm">
                        <i class="fas fa-sign-in-alt mr-2"></i>Log In
                    </button>
                </form>
            </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-500 mt-6">
            &copy; {{ date('Y') }} SHAREIDE. All rights reserved.
        </p>
    </div>
</body>
</html>
