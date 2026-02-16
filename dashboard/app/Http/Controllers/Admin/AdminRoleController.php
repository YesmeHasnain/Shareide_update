<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminRole;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminRoleController extends Controller
{
    public function index()
    {
        $roles = AdminRole::withCount('users')->get();
        $admins = User::where('role', 'admin')->with('adminRole')->get();

        return view('admin.roles.index', compact('roles', 'admins'));
    }

    public function createRole(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100|unique:admin_roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:' . implode(',', AdminRole::allPermissions()),
        ]);

        $role = AdminRole::create([
            'name' => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions,
            'is_active' => true,
        ]);

        AuditLog::log('role_created', "Admin role created: {$request->name}", $role);

        return back()->with('success', 'Role created successfully.');
    }

    public function updateRole(Request $request, $id)
    {
        $role = AdminRole::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100|unique:admin_roles,name,' . $id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array',
            'permissions.*' => 'string|in:' . implode(',', AdminRole::allPermissions()),
        ]);

        $role->update([
            'name' => $request->name,
            'description' => $request->description,
            'permissions' => $request->permissions,
        ]);

        AuditLog::log('role_updated', "Admin role updated: {$request->name}", $role);

        return back()->with('success', 'Role updated successfully.');
    }

    public function deleteRole($id)
    {
        $role = AdminRole::findOrFail($id);

        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role with assigned users.');
        }

        $roleName = $role->name;
        $role->delete();

        AuditLog::log('role_deleted', "Admin role deleted: {$roleName}");

        return back()->with('success', 'Role deleted successfully.');
    }

    public function createAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|string|min:8',
            'admin_role_id' => 'required|exists:admin_roles,id',
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'admin_role_id' => $request->admin_role_id,
            'is_active' => true,
        ]);

        AuditLog::log('admin_created', "New admin created: {$request->name}", $admin);

        return back()->with('success', 'Admin user created successfully.');
    }

    public function updateAdmin(Request $request, $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $id,
            'admin_role_id' => 'required|exists:admin_roles,id',
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'admin_role_id' => $request->admin_role_id,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $admin->update($updateData);

        AuditLog::log('admin_updated', "Admin updated: {$request->name}", $admin);

        return back()->with('success', 'Admin updated successfully.');
    }

    public function toggleAdminStatus($id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        // Prevent self-deactivation
        if ($admin->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $admin->update(['is_active' => !$admin->is_active]);

        $status = $admin->is_active ? 'activated' : 'deactivated';
        AuditLog::log('admin_status_changed', "Admin {$status}: {$admin->name}", $admin);

        return back()->with('success', "Admin {$status} successfully.");
    }

    public function deleteAdmin($id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        if ($admin->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $adminName = $admin->name;
        $admin->delete();

        AuditLog::log('admin_deleted', "Admin deleted: {$adminName}");

        return back()->with('success', 'Admin deleted successfully.');
    }
}
