@extends('admin.layouts.app')

@section('title', 'My Profile')
@section('subtitle', 'Manage your account settings')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <!-- Profile Header Card -->
    <div class="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-black">
        <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- Avatar with Upload -->
            <div class="relative group" x-data="{ showUpload: false }">
                @if($admin->profile_photo)
                    <div class="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/30">
                        <img src="{{ $admin->profile_photo_url }}" alt="{{ $admin->name }}"
                            class="w-full h-full object-cover">
                    </div>
                @else
                    <div class="w-32 h-32 bg-black/80 rounded-2xl flex items-center justify-center text-primary text-5xl font-bold shadow-2xl ring-4 ring-white/30">
                        {{ $admin->initials }}
                    </div>
                @endif

                <!-- Upload Overlay -->
                <div class="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                    onclick="document.getElementById('avatarInput').click()">
                    <div class="text-center">
                        <i class="ti ti-camera text-white text-2xl mb-1"></i>
                        <p class="text-white text-xs font-medium">Change</p>
                    </div>
                </div>
            </div>

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
                <h2 class="text-2xl font-bold">{{ $admin->name ?? 'Admin' }}</h2>
                <p class="text-black/70">{{ $admin->email }}</p>
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black/20">
                        <i class="ti ti-shield mr-2"></i>
                        {{ $admin->adminRole->display_name ?? ucwords(str_replace('_', ' ', $admin->adminRole->name ?? 'Admin')) }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black/20">
                        <i class="ti ti-calendar mr-2"></i>
                        Member since {{ $admin->created_at?->format('M Y') ?? 'N/A' }}
                    </span>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-black/10 rounded-xl p-4">
                    <p class="text-2xl font-bold">{{ $admin->last_login_at ? \Carbon\Carbon::parse($admin->last_login_at)->diffForHumans(null, true) : '--' }}</p>
                    <p class="text-sm text-black/70">Last Login</p>
                </div>
                <div class="bg-black/10 rounded-xl p-4">
                    <p class="text-2xl font-bold text-green-800">Active</p>
                    <p class="text-sm text-black/70">Status</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Profile Photo Upload Card -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ti ti-camera text-yellow-500"></i>
                Profile Photo
            </h3>
        </div>
        <div class="p-6">
            <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Current Photo Preview -->
                <div class="flex-shrink-0">
                    <div id="photoPreview" class="relative">
                        @if($admin->profile_photo)
                            <div class="w-36 h-36 rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-dark-300">
                                <img src="{{ $admin->profile_photo_url }}" alt="{{ $admin->name }}"
                                    id="currentPhoto"
                                    class="w-full h-full object-cover">
                            </div>
                        @else
                            <div id="currentPhoto" class="w-36 h-36 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                                {{ $admin->initials }}
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Upload Form -->
                <div class="flex-1 w-full">
                    <form action="{{ route('admin.settings.profile.update') }}" method="POST" enctype="multipart/form-data" id="photoForm">
                        @csrf
                        <input type="hidden" name="name" value="{{ $admin->name }}">
                        <input type="hidden" name="email" value="{{ $admin->email }}">
                        <input type="hidden" name="phone" value="{{ $admin->phone }}">

                        <div class="border-2 border-dashed border-gray-300 dark:border-dark-100 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer"
                            onclick="document.getElementById('avatarInput').click()">
                            <input type="file" name="profile_photo" id="avatarInput" accept="image/*" class="hidden" onchange="previewImage(this)">
                            <i class="ti ti-cloud-upload text-4xl text-gray-400 mb-3"></i>
                            <p class="text-gray-600 dark:text-gray-400 mb-1">Click to upload or drag and drop</p>
                            <p class="text-sm text-gray-500">PNG, JPG, GIF up to 2MB</p>
                        </div>

                        <div class="flex items-center gap-3 mt-4">
                            <button type="submit" id="uploadBtn" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50" disabled>
                                <i class="ti ti-upload mr-2"></i>
                                Upload Photo
                            </button>
                        </div>
                    </form>

                    @if($admin->profile_photo)
                    <form action="{{ route('admin.settings.profile.photo.remove') }}" method="POST" class="inline mt-3" onsubmit="return confirm('Remove profile photo?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="px-6 py-2 bg-red-100 text-red-600 font-semibold rounded-xl hover:bg-red-200 transition-all">
                            <i class="ti ti-trash mr-2"></i>
                            Remove Photo
                        </button>
                    </form>
                    @endif
                    @error('profile_photo')
                        <p class="mt-2 text-sm text-red-500">{{ $message }}</p>
                    @enderror
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Information -->
        <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="ti ti-user text-yellow-500"></i>
                    Profile Information
                </h3>
            </div>
            <form action="{{ route('admin.settings.profile.update') }}" method="POST" class="p-6">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-user"></i>
                            </span>
                            <input type="text" name="name" value="{{ old('name', $admin->name) }}" required
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        @error('name')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-mail"></i>
                            </span>
                            <input type="email" name="email" value="{{ old('email', $admin->email) }}" required
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        @error('email')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-phone"></i>
                            </span>
                            <input type="text" name="phone" value="{{ old('phone', $admin->phone) }}"
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <button type="submit" class="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                        <i class="ti ti-device-floppy mr-2"></i>
                        Update Profile
                    </button>
                </div>
            </form>
        </div>

        <!-- Change Password -->
        <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="ti ti-key text-yellow-500"></i>
                    Change Password
                </h3>
            </div>
            <form action="{{ route('admin.settings.password') }}" method="POST" class="p-6">
                @csrf
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-lock"></i>
                            </span>
                            <input type="password" name="current_password" required
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        @error('current_password')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-key"></i>
                            </span>
                            <input type="password" name="password" required minlength="8"
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                        @error('password')
                            <p class="mt-1 text-sm text-red-500">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <i class="ti ti-checks"></i>
                            </span>
                            <input type="password" name="password_confirmation" required
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <button type="submit" class="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl">
                        <i class="ti ti-key mr-2"></i>
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Account Info -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ti ti-info-circle text-yellow-500"></i>
                Account Information
            </h3>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-50 dark:bg-dark-300 rounded-xl p-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Account ID</p>
                    <p class="font-semibold text-gray-900 dark:text-white">#{{ $admin->id }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-dark-300 rounded-xl p-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Role</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ $admin->adminRole->display_name ?? ucwords(str_replace('_', ' ', $admin->adminRole->name ?? 'Admin')) }}</p>
                </div>
                <div class="bg-gray-50 dark:bg-dark-300 rounded-xl p-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ $admin->last_login_at ? \Carbon\Carbon::parse($admin->last_login_at)->format('M d, Y H:i') : 'Never' }}</p>
                </div>
            </div>

            @if($admin->adminRole && $admin->adminRole->permissions)
            <div class="mt-6">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Permissions</p>
                <div class="flex flex-wrap gap-2">
                    @foreach($admin->adminRole->permissions as $permission)
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <i class="ti ti-circle-check mr-2 text-green-500"></i>
                            {{ ucfirst(str_replace('_', ' ', $permission)) }}
                        </span>
                    @endforeach
                </div>
            </div>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
    function previewImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            const preview = document.getElementById('currentPhoto');
            const previewContainer = document.getElementById('photoPreview');
            const uploadBtn = document.getElementById('uploadBtn');

            reader.onload = function(e) {
                // Create new preview structure
                const wrapper = document.createElement('div');
                wrapper.className = 'w-36 h-36 rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-dark-300';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                img.id = 'currentPhoto';
                img.className = 'w-full h-full object-cover';

                wrapper.appendChild(img);

                // Replace existing preview
                if (preview.tagName === 'IMG') {
                    preview.src = e.target.result;
                } else {
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(wrapper);
                }

                // Enable upload button
                uploadBtn.disabled = false;
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    // Drag and drop support
    const dropZone = document.querySelector('.border-dashed');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-yellow-500', 'bg-yellow-50');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-yellow-500', 'bg-yellow-50');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            document.getElementById('avatarInput').files = files;
            previewImage(document.getElementById('avatarInput'));
        }
    }
</script>
@endpush
@endsection
