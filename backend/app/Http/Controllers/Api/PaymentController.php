<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\RideRequest;
use App\Models\Transaction;
use App\Services\BankAlfalahService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    private $bankAlfalahService;

    public function __construct(BankAlfalahService $bankAlfalahService)
    {
        $this->bankAlfalahService = $bankAlfalahService;
    }

    public function processCashPayment(Request $request, $rideId)
    {
        $ride = RideRequest::findOrFail($rideId);

        if ($ride->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Ride must be completed first'
            ], 400);
        }

        DB::transaction(function () use ($ride) {
            $payment = Payment::create([
                'ride_request_id' => $ride->id,
                'user_id' => auth()->id(),
                'driver_id' => $ride->driver_id,
                'amount' => $ride->fare,
                'payment_method' => 'cash',
                'payment_type' => 'ride_fare',
                'status' => 'completed',
                'transaction_id' => 'CASH-' . time() . '-' . $ride->id,
                'gateway' => 'cash',
                'commission_amount' => $ride->commission_amount,
                'driver_earning' => $ride->driver_earning,
                'paid_at' => now()
            ]);

            $ride->update(['payment_status' => 'paid']);

            $wallet = $ride->driver->wallet;
            $wallet->balance += $payment->driver_earning;
            $wallet->total_earned += $payment->driver_earning;
            $wallet->save();

            Transaction::create([
                'driver_id' => $ride->driver_id,
                'type' => 'earning',
                'amount' => $payment->driver_earning,
                'description' => 'Ride #' . $ride->id,
                'balance_after' => $wallet->balance
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cash payment recorded'
        ]);
    }

    public function processCardPayment(Request $request, $rideId)
    {
        $ride = RideRequest::findOrFail($rideId);

        if ($ride->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Ride must be completed first'
            ], 400);
        }

        $payment = Payment::create([
            'ride_request_id' => $ride->id,
            'user_id' => auth()->id(),
            'driver_id' => $ride->driver_id,
            'amount' => $ride->fare,
            'payment_method' => 'card',
            'payment_type' => 'ride_fare',
            'status' => 'pending',
            'transaction_id' => 'SHARE-' . time() . '-' . $ride->id,
            'gateway' => 'bankalfalah',
            'commission_amount' => $ride->commission_amount,
            'driver_earning' => $ride->driver_earning,
        ]);

        $paymentRequest = $this->bankAlfalahService->createPayment(
            $payment->transaction_id,
            $ride->fare,
            "Shareide Ride #" . $ride->id
        );

        return response()->json([
            'success' => true,
            'data' => [
                'payment_id' => $payment->id,
                'payment_url' => $paymentRequest['payment_url'],
                'form_data' => $paymentRequest['form_data'],
            ]
        ]);
    }

    public function paymentCallback(Request $request)
    {
        $verification = $this->bankAlfalahService->verifyPayment($request->all());

        if ($verification['success']) {
            $payment = Payment::where('transaction_id', $verification['transaction_id'])->first();

            if ($payment && $payment->status === 'pending') {
                DB::transaction(function () use ($payment, $verification) {
                    $payment->update([
                        'status' => 'completed',
                        'gateway_response' => json_encode($verification),
                        'paid_at' => now()
                    ]);

                    $ride = $payment->rideRequest;
                    $ride->update(['payment_status' => 'paid']);

                    $wallet = $ride->driver->wallet;
                    $wallet->balance += $payment->driver_earning;
                    $wallet->total_earned += $payment->driver_earning;
                    $wallet->save();

                    Transaction::create([
                        'driver_id' => $ride->driver_id,
                        'type' => 'earning',
                        'amount' => $payment->driver_earning,
                        'description' => 'Ride #' . $ride->id,
                        'balance_after' => $wallet->balance
                    ]);
                });

                return redirect()->to(env('APP_URL') . '/payment/success');
            }
        }

        return redirect()->to(env('APP_URL') . '/payment/failed');
    }

    public function getPaymentHistory(Request $request)
    {
        $payments = Payment::with(['rideRequest'])
            ->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhere('driver_id', auth()->id());
            })
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => ['payments' => $payments]
        ]);
    }

    public function getPaymentDetails($id)
    {
        $payment = Payment::with(['rideRequest', 'user', 'driver'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => ['payment' => $payment]
        ]);
    }
}