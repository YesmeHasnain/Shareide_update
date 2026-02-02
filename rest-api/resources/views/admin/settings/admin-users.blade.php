@extends('admin.layouts.app')

@section('title', 'Admin Users')
@section('subtitle', 'Manage administrator accounts')

@section('content')
<div class="max-w-4xl space-y-6">
    <!-- Add New Admin -->
    <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Add New Admin</h3>
        <form action="{{ route('admin.settings.admin-users.create') }}" method="POST">
            @csrf
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" required minlength="8" class="w-full px-4 py-2 border rounded-lg">
                </div>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" name="password_confirmation" required class="w-full md:w-1/3 px-4 py-2 border rounded-lg">
            </div>
            <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg"><i class="fas fa-plus mr-2"></i>Add Admin</button>
        </form>
    </div>

    <!-- Existing Admins -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b">
            <h3 class="font-semibold text-gray-800">Existing Admins</h3>
        </div>
        <div class="divide-y">
            @foreach($admins as $admin)
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-blue-600 font-medium">{{ strtoupper(substr($admin->name, 0, 1)) }}</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-800">{{ $admin->name }}</p>
                            <p class="text-sm text-gray-500">{{ $admin->email }}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        @if($admin->id == auth()->id())
                            <span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">You</span>
                        @else
                            <form action="{{ route('admin.settings.admin-users.delete', $admin->id) }}" method="POST" onsubmit="return confirm('Delete this admin?')">
                                @csrf @method('DELETE')
                                <button class="p-2 text-red-600 hover:bg-red-50 rounded"><i class="fas fa-trash"></i></button>
                            </form>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
