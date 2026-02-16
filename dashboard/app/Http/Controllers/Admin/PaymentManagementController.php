<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Withdrawal;
use App\Models\Wallet;
use App\Models\RiderWallet;
use App\Models\RiderTransaction;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PaymentManagementController extends Controller
{
    /**
     * Payments overview
     */
    public function index(Request $request)
    {
        $query = Payment::with(['rideRequest', 'user', 'driver.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total_amount' => Payment::where('status', 'completed')->sum('amount'),
            'total_commission' => Payment::where('status', 'completed')->sum('commission_amount'),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'today_revenue' => Payment::where('status', 'completed')->whereDate('created_at', today())->sum('amount'),
        ];

        return view('admin.payments.index', compact('payments', 'stats'));
    }

    /**
     * Withdrawal requests
     */
    public function withdrawals(Request $request)
    {
        $query = Withdrawal::with(['driver.user', 'wallet']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'pending' => Withdrawal::where('status', 'pending')->count(),
            'pending_amount' => Withdrawal::where('status', 'pending')->sum('amount'),
            'approved_today' => Withdrawal::where('status', 'approved')->whereDate('processed_at', today())->count(),
            'total_withdrawn' => Withdrawal::where('status', 'approved')->sum('amount'),
        ];

        return view('admin.payments.withdrawals', compact('withdrawals', 'stats'));
    }

    /**
     * Approve withdrawal
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $withdrawal = Withdrawal::with('wallet')->findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Withdrawal is not pending.');
        }

        // Check wallet balance
        if ($withdrawal->wallet->balance < $withdrawal->amount) {
            return back()->with('error', 'Insufficient wallet balance.');
        }

        // Deduct from wallet
        $withdrawal->wallet->decrement('balance', $withdrawal->amount);
        $withdrawal->wallet->increment('total_withdrawn', $withdrawal->amount);

        // Update withdrawal status
        $withdrawal->update([
            'status' => 'approved',
            'processed_at' => now(),
            'admin_note' => $request->admin_note,
        ]);

        // Create transaction record
        Transaction::create([
            'wallet_id' => $withdrawal->wallet_id,
            'type' => 'withdrawal',
            'amount' => -$withdrawal->amount,
            'balance_after' => $withdrawal->wallet->balance,
            'description' => 'Withdrawal approved',
        ]);

        return back()->with('success', 'Withdrawal approved successfully.');
    }

    /**
     * Reject withdrawal
     */
    public function rejectWithdrawal(Request $request, $id)
    {
        $request->validate([
            'admin_note' => 'required|string|max:500',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Withdrawal is not pending.');
        }

        $withdrawal->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'admin_note' => $request->admin_note,
        ]);

        return back()->with('success', 'Withdrawal rejected.');
    }

    /**
     * Driver wallets overview
     */
    public function driverWallets(Request $request)
    {
        $query = Wallet::with(['driver.user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('driver.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%');
            });
        }

        $wallets = $query->orderByDesc('balance')->paginate(20)->withQueryString();

        $stats = [
            'total_balance' => Wallet::sum('balance'),
            'total_earned' => Wallet::sum('total_earned'),
            'total_withdrawn' => Wallet::sum('total_withdrawn'),
        ];

        return view('admin.payments.driver-wallets', compact('wallets', 'stats'));
    }

    /**
     * Rider wallets overview
     */
    public function riderWallets(Request $request)
    {
        $query = RiderWallet::with(['user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%');
            });
        }

        $wallets = $query->orderByDesc('balance')->paginate(20)->withQueryString();

        $stats = [
            'total_balance' => RiderWallet::sum('balance'),
            'total_topped_up' => RiderWallet::sum('total_topped_up'),
            'total_spent' => RiderWallet::sum('total_spent'),
        ];

        return view('admin.payments.rider-wallets', compact('wallets', 'stats'));
    }

    /**
     * Transactions log
     */
    public function transactions(Request $request)
    {
        // Driver transactions
        $driverTransactions = Transaction::with(['wallet.driver.user'])
            ->latest()
            ->take(50)
            ->get();

        // Rider transactions
        $riderTransactions = RiderTransaction::with(['user'])
            ->latest()
            ->take(50)
            ->get();

        return view('admin.payments.transactions', compact('driverTransactions', 'riderTransactions'));
    }

    /**
     * Refund a payment
     */
    public function refund(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'completed') {
            return back()->with('error', 'Only completed payments can be refunded.');
        }

        // Process refund logic here (depends on payment gateway)
        $payment->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'failure_reason' => 'Refund: ' . $request->reason,
        ]);

        // Add to rider wallet if applicable
        if ($payment->user_id) {
            $riderWallet = RiderWallet::where('user_id', $payment->user_id)->first();
            if ($riderWallet) {
                $riderWallet->increment('balance', $payment->amount);

                RiderTransaction::create([
                    'user_id' => $payment->user_id,
                    'type' => 'refund',
                    'amount' => $payment->amount,
                    'balance_after' => $riderWallet->balance,
                    'description' => 'Refund for ride #' . $payment->ride_request_id,
                    'reference_id' => $payment->id,
                    'status' => 'completed',
                ]);
            }
        }

        return back()->with('success', 'Payment refunded successfully.');
    }
}
