<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class WebsiteController extends Controller
{
    public function home()
    {
        $stats = [
            'riders' => '500K+',
            'drivers' => '50K+',
            'cities' => '15+',
            'rides' => '2M+'
        ];

        return view('website.pages.home', compact('stats'));
    }

    public function about()
    {
        return view('website.pages.about');
    }

    public function features()
    {
        return view('website.pages.features');
    }

    public function safety()
    {
        return view('website.pages.safety');
    }

    public function contact()
    {
        return view('website.pages.contact');
    }

    public function submitContact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:2000',
            'type' => 'required|in:general,support,complaint,feedback,partnership'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Create support ticket
        $ticket = SupportTicket::create([
            'ticket_number' => 'WEB-' . strtoupper(uniqid()),
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'category' => $request->type,
            'status' => 'open',
            'priority' => 'normal',
            'source' => 'website'
        ]);

        // Add first message
        TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'message' => $request->message,
            'is_admin' => false,
            'sender_name' => $request->name,
            'sender_email' => $request->email
        ]);

        return back()->with('success', 'Thank you for contacting us! We will get back to you within 24 hours. Your ticket number is: ' . $ticket->ticket_number);
    }

    public function privacy()
    {
        return view('website.pages.privacy');
    }

    public function terms()
    {
        return view('website.pages.terms');
    }

    public function refund()
    {
        return view('website.pages.refund');
    }

    public function faq()
    {
        $faqs = [
            [
                'category' => 'General',
                'questions' => [
                    ['q' => 'What is SHAREIDE?', 'a' => 'SHAREIDE is Pakistan\'s premier ride-sharing platform that connects riders with verified drivers for safe, affordable, and comfortable journeys.'],
                    ['q' => 'How do I create an account?', 'a' => 'Download the SHAREIDE app, enter your phone number, verify via WhatsApp OTP, and complete your profile. It takes less than 2 minutes!'],
                    ['q' => 'Is SHAREIDE available in my city?', 'a' => 'SHAREIDE is currently available in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and expanding to more cities soon.'],
                ]
            ],
            [
                'category' => 'Payments',
                'questions' => [
                    ['q' => 'What payment methods are accepted?', 'a' => 'We accept Cash, JazzCash, Easypaisa, Bank Alfalah cards, and SHAREIDE Wallet balance.'],
                    ['q' => 'How do I add money to my wallet?', 'a' => 'Go to Wallet > Top Up, select your preferred payment method, enter the amount, and complete the payment.'],
                    ['q' => 'Are there any hidden charges?', 'a' => 'No! We believe in transparent pricing. The fare you see is the fare you pay - no surge, no hidden fees.'],
                ]
            ],
            [
                'category' => 'Safety',
                'questions' => [
                    ['q' => 'How are drivers verified?', 'a' => 'All drivers undergo CNIC verification, background checks, vehicle inspection, and must maintain a minimum rating to continue driving.'],
                    ['q' => 'What safety features are available?', 'a' => 'Live GPS tracking, share ride status with family, SOS emergency button, in-app calling (number hidden), and 24/7 support.'],
                    ['q' => 'What if I feel unsafe during a ride?', 'a' => 'Use the SOS button in the app to immediately alert our safety team and your emergency contacts. We take safety very seriously.'],
                ]
            ],
        ];

        return view('website.pages.faq', compact('faqs'));
    }

    public function drive()
    {
        return view('website.pages.drive');
    }

    public function download()
    {
        $userAgent = request()->header('User-Agent');

        // Detect platform
        if (stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false || stripos($userAgent, 'Mac') !== false) {
            // iOS/Mac - redirect to App Store
            return redirect('https://apps.apple.com/app/shareide');
        } else {
            // Android/Windows/Others - redirect to Play Store
            return redirect('https://play.google.com/store/apps/details?id=com.shareide_official.shareide');
        }
    }

    public function downloadApk()
    {
        // Direct APK download
        $apkPath = public_path('downloads/shareide.apk');

        if (file_exists($apkPath)) {
            return response()->download($apkPath, 'SHAREIDE.apk');
        }

        // Fallback to Play Store
        return redirect('https://play.google.com/store/apps/details?id=com.shareide_official.shareide');
    }

    public function downloadDriver()
    {
        $userAgent = request()->header('User-Agent');

        if (stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false || stripos($userAgent, 'Mac') !== false) {
            return redirect('https://apps.apple.com/app/shareide-fleet');
        } else {
            return redirect('https://play.google.com/store/apps/details?id=com.shareide.fleet');
        }
    }
}
