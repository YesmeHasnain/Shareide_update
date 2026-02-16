@extends('admin.layouts.app')

@section('title', 'Settings')
@section('subtitle', 'Configure platform settings')

@section('content')
<div class="max-w-4xl space-y-6">
    <!-- General Settings -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-cog text-yellow-500"></i>
                General Settings
            </h3>
        </div>
        <form action="{{ route('admin.settings.general') }}" method="POST" class="p-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Name</label>
                    <input type="text" name="app_name" value="{{ $settings['app_name'] }}"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                    <input type="text" name="currency" value="{{ $settings['currency'] }}"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Email</label>
                    <input type="email" name="support_email" value="{{ $settings['support_email'] }}"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Phone</label>
                    <input type="text" name="support_phone" value="{{ $settings['support_phone'] }}"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <select name="timezone"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                        <option value="Asia/Karachi" {{ $settings['timezone'] == 'Asia/Karachi' ? 'selected' : '' }}>Asia/Karachi (PKT)</option>
                        <option value="UTC" {{ $settings['timezone'] == 'UTC' ? 'selected' : '' }}>UTC</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                <i class="fas fa-save mr-2"></i>Save Changes
            </button>
        </form>
    </div>

    <!-- Commission Settings -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-percentage text-green-500"></i>
                Commission Settings
            </h3>
        </div>
        <form action="{{ route('admin.settings.commission') }}" method="POST" class="p-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Rate (%)</label>
                    <input type="number" name="commission_rate" value="{{ $settings['commission_rate'] }}" min="0" max="50" step="0.1"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Commission (PKR)</label>
                    <input type="number" name="min_commission" value="{{ $settings['min_commission'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Commission (PKR)</label>
                    <input type="number" name="max_commission" value="{{ $settings['max_commission'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
            </div>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                <i class="fas fa-save mr-2"></i>Save Changes
            </button>
        </form>
    </div>

    <!-- Pricing Settings -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-tag text-purple-500"></i>
                Pricing Settings
            </h3>
        </div>
        <form action="{{ route('admin.settings.pricing') }}" method="POST" class="p-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Fare - Car (PKR)</label>
                    <input type="number" name="base_fare_car" value="{{ $settings['base_fare_car'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Per KM - Car (PKR)</label>
                    <input type="number" name="per_km_car" value="{{ $settings['per_km_car'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Fare - Bike (PKR)</label>
                    <input type="number" name="base_fare_bike" value="{{ $settings['base_fare_bike'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Per KM - Bike (PKR)</label>
                    <input type="number" name="per_km_bike" value="{{ $settings['per_km_bike'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Fare (PKR)</label>
                    <input type="number" name="min_fare" value="{{ $settings['min_fare'] }}" min="0"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Surge Multiplier</label>
                    <input type="number" name="surge_multiplier" value="{{ $settings['surge_multiplier'] }}" min="1" max="5" step="0.1"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-dark-100 rounded-xl bg-white dark:bg-dark-300 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                </div>
            </div>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                <i class="fas fa-save mr-2"></i>Save Changes
            </button>
        </form>
    </div>

    <!-- Notification Settings -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-bell text-blue-500"></i>
                Notification Settings
            </h3>
        </div>
        <form action="{{ route('admin.settings.notifications') }}" method="POST" class="p-6">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <label class="flex items-center p-4 bg-gray-50 dark:bg-dark-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
                    <input type="checkbox" name="sms_notifications_enabled" value="1" {{ $settings['sms_notifications_enabled'] ? 'checked' : '' }}
                        class="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300 dark:border-dark-100">
                    <div class="ml-3">
                        <span class="font-medium text-gray-800 dark:text-white">SMS Notifications</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Send SMS alerts to users</p>
                    </div>
                </label>
                <label class="flex items-center p-4 bg-gray-50 dark:bg-dark-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
                    <input type="checkbox" name="push_notifications_enabled" value="1" {{ $settings['push_notifications_enabled'] ? 'checked' : '' }}
                        class="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300 dark:border-dark-100">
                    <div class="ml-3">
                        <span class="font-medium text-gray-800 dark:text-white">Push Notifications</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Send push alerts to app</p>
                    </div>
                </label>
                <label class="flex items-center p-4 bg-gray-50 dark:bg-dark-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
                    <input type="checkbox" name="email_notifications_enabled" value="1" {{ $settings['email_notifications_enabled'] ? 'checked' : '' }}
                        class="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300 dark:border-dark-100">
                    <div class="ml-3">
                        <span class="font-medium text-gray-800 dark:text-white">Email Notifications</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Send email updates</p>
                    </div>
                </label>
                <label class="flex items-center p-4 bg-gray-50 dark:bg-dark-300 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors">
                    <input type="checkbox" name="whatsapp_notifications_enabled" value="1" {{ $settings['whatsapp_notifications_enabled'] ? 'checked' : '' }}
                        class="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300 dark:border-dark-100">
                    <div class="ml-3">
                        <span class="font-medium text-gray-800 dark:text-white">WhatsApp Notifications</span>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Send WhatsApp messages</p>
                    </div>
                </label>
            </div>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl">
                <i class="fas fa-save mr-2"></i>Save Changes
            </button>
        </form>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white dark:bg-dark-200 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-dark-100 bg-gray-50 dark:bg-dark-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-bolt text-yellow-500"></i>
                Quick Actions
            </h3>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="{{ route('admin.settings.profile') }}"
                    class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <span class="font-semibold">My Profile</span>
                        <p class="text-sm text-blue-500 dark:text-blue-400/70">Edit your account</p>
                    </div>
                </a>
                <a href="{{ route('admin.settings.admin-users') }}"
                    class="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <i class="fas fa-users"></i>
                    </div>
                    <div>
                        <span class="font-semibold">Admin Users</span>
                        <p class="text-sm text-purple-500 dark:text-purple-400/70">Manage admins</p>
                    </div>
                </a>
                <form action="{{ route('admin.settings.clear-cache') }}" method="POST" class="inline">
                    @csrf
                    <button type="submit"
                        class="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                            <i class="fas fa-trash"></i>
                        </div>
                        <div class="text-left">
                            <span class="font-semibold">Clear Cache</span>
                            <p class="text-sm text-red-500 dark:text-red-400/70">Reset system cache</p>
                        </div>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
