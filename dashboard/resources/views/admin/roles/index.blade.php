@extends('admin.layouts.app')

@section('title', 'Admin Roles & Users')

@section('content')
<div class="space-y-6">
    <!-- Header -->
    <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin Roles & Users</h1>
        <p class="text-gray-600">Manage admin roles and team members</p>
    </div>

    <!-- Tabs -->
    <div x-data="{ activeTab: 'admins' }">
        <div class="border-b border-gray-200">
            <nav class="flex -mb-px space-x-8">
                <button @click="activeTab = 'admins'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'admins', 'border-transparent text-gray-500 hover:text-gray-700': activeTab !== 'admins' }" class="py-4 px-1 border-b-2 font-medium text-sm">
                    Admin Users
                </button>
                <button @click="activeTab = 'roles'" :class="{ 'border-yellow-500 text-yellow-600': activeTab === 'roles', 'border-transparent text-gray-500 hover:text-gray-700': activeTab !== 'roles' }" class="py-4 px-1 border-b-2 font-medium text-sm">
                    Roles & Permissions
                </button>
            </nav>
        </div>

        <!-- Admin Users Tab -->
        <div x-show="activeTab === 'admins'" class="mt-6 space-y-6">
            <!-- Add Admin Form -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Admin</h3>
                <form action="{{ route('admin.roles.admin.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" name="name" required class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" required class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="text" name="phone" required class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" required minlength="8" class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select name="admin_role_id" required class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500">
                                @foreach($roles as $role)
                                    <option value="{{ $role->id }}">{{ $role->name }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700">
                            Add Admin
                        </button>
                    </div>
                </form>
            </div>

            <!-- Admins List -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-900">Admin Users</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @forelse($admins as $admin)
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <span class="text-yellow-700 font-medium">{{ substr($admin->name, 0, 1) }}</span>
                                            </div>
                                            <div>
                                                <p class="font-medium text-gray-900">{{ $admin->name }}</p>
                                                @if($admin->id === auth()->id())
                                                    <span class="text-xs text-yellow-600">(You)</span>
                                                @endif
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-600">{{ $admin->email }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-600">{{ $admin->phone }}</td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {{ $admin->adminRole->display_name ?? ucwords(str_replace('_', ' ', $admin->adminRole->name ?? '')) ?: 'No Role' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {{ $admin->is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                            {{ $admin->is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">
                                        {{ $admin->last_login_at ? \Carbon\Carbon::parse($admin->last_login_at)->diffForHumans() : 'Never' }}
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            @if($admin->id !== auth()->id())
                                                <form action="{{ route('admin.roles.admin.toggle', $admin->id) }}" method="POST" class="inline">
                                                    @csrf
                                                    <button type="submit" class="text-sm {{ $admin->is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800' }}">
                                                        {{ $admin->is_active ? 'Deactivate' : 'Activate' }}
                                                    </button>
                                                </form>
                                                <form action="{{ route('admin.roles.admin.delete', $admin->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure?')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="text-sm text-red-600 hover:text-red-800">Delete</button>
                                                </form>
                                            @else
                                                <span class="text-gray-400 text-sm">-</span>
                                            @endif
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">No admin users found.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Roles Tab -->
        <div x-show="activeTab === 'roles'" class="mt-6 space-y-6">
            <!-- Add Role Form -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Role</h3>
                <form action="{{ route('admin.roles.store') }}" method="POST">
                    @csrf
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                            <input type="text" name="name" required class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500" placeholder="e.g. Support Manager">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input type="text" name="description" class="w-full rounded-lg border-gray-300 focus:border-yellow-500 focus:ring-yellow-500" placeholder="Brief description of this role">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            @php
                                $allPermissions = \App\Models\AdminRole::allPermissions();
                            @endphp
                            @foreach($allPermissions as $permission)
                                <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                    <input type="checkbox" name="permissions[]" value="{{ $permission }}" class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                    <span class="text-sm text-gray-700">{{ ucfirst(str_replace('_', ' ', $permission)) }}</span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button type="submit" class="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700">
                            Create Role
                        </button>
                    </div>
                </form>
            </div>

            <!-- Roles List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @forelse($roles as $role)
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900">{{ $role->display_name ?? ucwords(str_replace('_', ' ', $role->name)) }}</h4>
                                <p class="text-sm text-gray-500">{{ $role->description ?? 'No description' }}</p>
                            </div>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {{ $role->users_count }} users
                            </span>
                        </div>
                        <div class="mb-4">
                            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</p>
                            <div class="flex flex-wrap gap-1">
                                @forelse($role->permissions ?? [] as $permission)
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {{ ucfirst(str_replace('_', ' ', $permission)) }}
                                    </span>
                                @empty
                                    <span class="text-sm text-gray-400">No permissions</span>
                                @endforelse
                            </div>
                        </div>
                        <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                            @if($role->users_count == 0)
                                <form action="{{ route('admin.roles.delete', $role->id) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-sm text-red-600 hover:text-red-800">Delete</button>
                                </form>
                            @endif
                        </div>
                    </div>
                @empty
                    <div class="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                        No roles created yet.
                    </div>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
