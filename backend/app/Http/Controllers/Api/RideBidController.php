<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RideBid;
use App\Models\RideRequest;
use App\Events\BidReceived;
use Illuminate\Http\Request;

class RideBidController extends Controller
{
    // Driver places a bid on a ride
    public function placeBid(Request $request, $rideRequestId)
    {
        $request->validate([
            'bid_amount' => 'required|numeric|min:1',
            'eta_minutes' => 'required|integer|min:1|max:120',
            'note' => 'nullable|string|max:500',
        ]);

        $rideRequest = RideRequest::where('is_bidding_enabled', true)
            ->where('status', 'pending')
            ->findOrFail($rideRequestId);

        // Check if driver already bid
        $existingBid = RideBid::where('ride_request_id', $rideRequestId)
            ->where('driver_id', auth()->id())
            ->where('status', 'pending')
            ->first();

        if ($existingBid) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending bid on this ride',
            ], 400);
        }

        // Minimum bid check - driver is free to set any reasonable price
        $minBid = 50;
        if ($request->bid_amount < $minBid) {
            return response()->json([
                'success' => false,
                'message' => "Bid must be at least Rs. {$minBid}",
            ], 400);
        }

        $bid = RideBid::create([
            'ride_request_id' => $rideRequestId,
            'driver_id' => auth()->id(),
            'bid_amount' => $request->bid_amount,
            'eta_minutes' => $request->eta_minutes,
            'note' => $request->note,
            'status' => 'pending',
            'expires_at' => now()->addMinutes(15),
        ]);

        $bid->load('driver');

        // Broadcast bid in real-time
        try {
            event(new BidReceived($bid));
        } catch (\Exception $e) {
            // Continue if broadcasting fails
        }

        // Notify passenger
        PushNotificationController::sendToUser(
            $rideRequest->user_id,
            'New Bid Received',
            "A driver has bid PKR {$request->bid_amount} for your ride",
            ['type' => 'new_bid', 'ride_request_id' => $rideRequestId, 'bid_id' => $bid->id],
            'ride_bid'
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid placed successfully',
            'data' => $bid,
        ]);
    }

    // Passenger views all bids for their ride
    public function getBidsForRide($rideRequestId)
    {
        $rideRequest = RideRequest::where('user_id', auth()->id())
            ->findOrFail($rideRequestId);

        $bids = RideBid::where('ride_request_id', $rideRequestId)
            ->where('status', 'pending')
            ->with(['driver' => function ($query) {
                $query->select('id', 'name', 'profile_photo', 'rating', 'total_rides');
            }])
            ->orderBy('bid_amount', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }

    // Passenger accepts a bid
    public function acceptBid($bidId)
    {
        $bid = RideBid::with('rideRequest')
            ->where('status', 'pending')
            ->findOrFail($bidId);

        // Verify ownership
        if ($bid->rideRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Accept this bid and reject others
        $bid->accept();

        // Update ride request
        $bid->rideRequest->update([
            'driver_id' => $bid->driver_id,
            'status' => 'accepted',
            'final_fare' => $bid->bid_amount,
        ]);

        // Notify driver
        PushNotificationController::sendToUser(
            $bid->driver_id,
            'Bid Accepted!',
            'Your bid has been accepted. Head to pickup location.',
            ['type' => 'bid_accepted', 'ride_request_id' => $bid->ride_request_id],
            'ride_bid'
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid accepted successfully',
            'data' => $bid->load('rideRequest'),
        ]);
    }

    // Passenger rejects a bid
    public function rejectBid($bidId)
    {
        $bid = RideBid::with('rideRequest')
            ->where('status', 'pending')
            ->findOrFail($bidId);

        if ($bid->rideRequest->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $bid->reject();

        // Notify driver
        PushNotificationController::sendToUser(
            $bid->driver_id,
            'Bid Rejected',
            'Your bid was not accepted for this ride.',
            ['type' => 'bid_rejected', 'ride_request_id' => $bid->ride_request_id],
            'ride_bid'
        );

        return response()->json([
            'success' => true,
            'message' => 'Bid rejected',
        ]);
    }

    // Driver withdraws their bid
    public function withdrawBid($bidId)
    {
        $bid = RideBid::where('driver_id', auth()->id())
            ->where('status', 'pending')
            ->findOrFail($bidId);

        $bid->withdraw();

        return response()->json([
            'success' => true,
            'message' => 'Bid withdrawn successfully',
        ]);
    }

    // Rider counter-offers back to a driver
    public function counterOffer(Request $request, $bidId)
    {
        $request->validate([
            'counter_amount' => 'required|numeric|min:1',
            'message' => 'nullable|string|max:500',
        ]);

        $bid = RideBid::with('rideRequest')
            ->where('status', 'pending')
            ->findOrFail($bidId);

        // Verify rider owns the ride
        if ($bid->rideRequest->rider_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Update the bid with counter-offer
        $bid->update([
            'status' => 'countered',
            'counter_amount' => $request->counter_amount,
            'counter_message' => $request->message,
        ]);

        // Notify driver
        PushNotificationController::sendToUser(
            $bid->driver_id,
            'Counter Offer Received',
            "Rider has counter-offered PKR {$request->counter_amount}",
            ['type' => 'bid_countered', 'ride_request_id' => $bid->ride_request_id, 'bid_id' => $bid->id],
            'ride_bid'
        );

        return response()->json([
            'success' => true,
            'message' => 'Counter offer sent',
            'data' => $bid,
        ]);
    }

    // Driver accepts a counter-offer from rider
    public function acceptCounter($bidId)
    {
        $bid = RideBid::with('rideRequest')
            ->where('driver_id', auth()->id())
            ->where('status', 'countered')
            ->findOrFail($bidId);

        $bid->update([
            'status' => 'accepted',
            'bid_amount' => $bid->counter_amount,
        ]);

        // Reject other pending bids
        RideBid::where('ride_request_id', $bid->ride_request_id)
            ->where('id', '!=', $bid->id)
            ->whereIn('status', ['pending', 'countered'])
            ->update(['status' => 'rejected']);

        // Update ride request
        $bid->rideRequest->update([
            'driver_id' => $bid->driver_id,
            'status' => 'accepted',
            'final_fare' => $bid->counter_amount,
            'negotiation_status' => 'completed',
        ]);

        // Notify rider
        PushNotificationController::sendToUser(
            $bid->rideRequest->rider_id,
            'Driver Accepted!',
            'Your counter offer was accepted. Ride confirmed!',
            ['type' => 'counter_accepted', 'ride_request_id' => $bid->ride_request_id],
            'ride_bid'
        );

        return response()->json([
            'success' => true,
            'message' => 'Counter offer accepted',
            'data' => $bid->load('rideRequest'),
        ]);
    }

    // Driver views their active bids
    public function getMyBids()
    {
        $bids = RideBid::where('driver_id', auth()->id())
            ->with(['rideRequest' => function ($query) {
                $query->select('id', 'pickup_address', 'dropoff_address', 'estimated_fare', 'status');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $bids,
        ]);
    }
}
