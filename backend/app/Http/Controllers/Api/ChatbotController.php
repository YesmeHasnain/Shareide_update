<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private $apiKey;
    private $models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

    private $systemPrompt = <<<'PROMPT'
You are SHAREIDE's customer support AI assistant. SHAREIDE is a ride-hailing app in Pakistan (like Uber/Careem/inDrive).

CRITICAL RULES:
1. ALWAYS reply in the SAME language the user writes in. If they write Urdu, reply in Urdu. If Roman Urdu, reply in Roman Urdu. If English, reply in English. Match their style exactly.
2. Keep responses SHORT and helpful (2-4 sentences max). Don't write essays.
3. Be friendly, warm and professional like a real support agent.
4. You know about: ride booking, payments, wallet, driver issues, app problems, account settings, safety/SOS, promo codes, ride scheduling, fare estimation, referrals.

SHAREIDE APP INFO:
- Ride-hailing app available in Pakistan
- Supports car, bike, rickshaw rides
- Has wallet system (top-up, pay from wallet)
- inDrive-style ride bidding (riders can set their price, drivers can accept/counter)
- Scheduled rides (book up to 7 days ahead)
- SOS/Emergency button in app
- Driver rating system (1-5 stars)
- Promo codes & referral system
- Cash and wallet payment methods
- Loyalty rewards program

ESCALATION DETECTION:
If the user asks to talk to a real person, live agent, human support, or wants to file a complaint/report that needs human intervention, you MUST include the EXACT tag [ESCALATE] at the END of your response. Only use this tag when the user clearly wants human help.

For serious issues (safety, harassment, overcharge disputes, accident), include [ESCALATE] automatically even if they didn't ask, because these need human attention.

For normal questions (how to book, app features, general help), just answer helpfully WITHOUT the [ESCALATE] tag.

DO NOT mention the [ESCALATE] tag to the user. Just add it silently at the end.
PROMPT;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY'));
    }

    /**
     * Handle chatbot message - sends to Gemini and returns AI response
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array|max:20',
            'history.*.role' => 'required_with:history|string|in:user,bot',
            'history.*.text' => 'required_with:history|string|max:1000',
        ]);

        $userMessage = $request->input('message');
        $history = $request->input('history', []);

        try {
            $response = $this->callGemini($userMessage, $history);

            // Check if response contains escalation tag
            $shouldEscalate = str_contains($response, '[ESCALATE]');
            $cleanResponse = str_replace('[ESCALATE]', '', $response);
            $cleanResponse = trim($cleanResponse);

            // Detect category from conversation for ticket creation
            $category = $this->detectCategory($userMessage, $history);

            return response()->json([
                'success' => true,
                'reply' => $cleanResponse,
                'escalate' => $shouldEscalate,
                'category' => $category,
            ]);

        } catch (\Exception $e) {
            Log::error('Gemini API error: ' . $e->getMessage());

            return response()->json([
                'success' => true,
                'reply' => $this->getFallbackResponse($userMessage),
                'escalate' => false,
                'category' => 'other',
            ]);
        }
    }

    /**
     * Call Google Gemini API with model fallback
     */
    private function callGemini(string $userMessage, array $history): string
    {
        // Build contents array with conversation history
        $contents = [];

        foreach ($history as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $msg['text']]],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $this->systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 300,
                'topP' => 0.9,
            ],
            'safetySettings' => [
                ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_NONE'],
                ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_NONE'],
            ],
        ];

        $lastError = null;

        // Try each model, fallback on 429/5xx
        foreach ($this->models as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(15)->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($text) {
                    return $text;
                }

                $lastError = 'No text in response from ' . $model;
                continue;
            }

            // If rate limited (429), try next model
            if ($response->status() === 429) {
                Log::warning("Gemini rate limited on {$model}, trying next model");
                $lastError = "Rate limited on {$model}";
                continue;
            }

            // Other errors
            Log::error("Gemini API error on {$model}", [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500),
            ]);
            $lastError = "Gemini {$model} returned " . $response->status();
        }

        throw new \Exception($lastError ?? 'All Gemini models failed');
    }

    /**
     * Detect ticket category from conversation
     */
    private function detectCategory(string $message, array $history): string
    {
        $allText = strtolower($message);
        foreach ($history as $msg) {
            if ($msg['role'] === 'user') {
                $allText .= ' ' . strtolower($msg['text']);
            }
        }

        $categories = [
            'payment' => ['payment', 'pay', 'paisa', 'paise', 'charge', 'wallet', 'refund', 'overcharge', 'bill', 'fare', 'mehnga', 'zyada paisa'],
            'ride_issue' => ['ride', 'booking', 'book', 'cancel', 'driver nahi', 'no driver', 'location', 'pickup', 'drop', 'sawari', 'trip'],
            'driver_behavior' => ['driver', 'rude', 'badtameez', 'complaint', 'behavior', 'captain', 'harass', 'wrong route', 'galat rasta'],
            'app_bug' => ['app', 'bug', 'crash', 'error', 'not working', 'kaam nahi', 'login', 'otp', 'loading', 'slow', 'update'],
            'account' => ['account', 'profile', 'password', 'phone number', 'delete', 'deactivate', 'settings'],
        ];

        $bestCategory = 'other';
        $bestScore = 0;

        foreach ($categories as $cat => $keywords) {
            $score = 0;
            foreach ($keywords as $kw) {
                if (str_contains($allText, $kw)) {
                    $score += strlen($kw);
                }
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestCategory = $cat;
            }
        }

        return $bestCategory;
    }

    /**
     * Fallback response if Gemini fails
     */
    private function getFallbackResponse(string $message): string
    {
        $lower = strtolower($message);

        // Check if it seems like Urdu/Roman Urdu
        $urduWords = ['kya', 'hai', 'mujhe', 'mera', 'karo', 'kaise', 'nahi', 'chahiye', 'bhai', 'yar', 'ride', 'paisa'];
        $isUrdu = false;
        foreach ($urduWords as $w) {
            if (str_contains($lower, $w)) {
                $isUrdu = true;
                break;
            }
        }

        if ($isUrdu) {
            return 'Maaf kijiye, abhi mujhe samajhne mein thori mushkil ho rahi hai. Aap "live agent" likh kar hamare support team se baat kar sakte hain.';
        }

        return 'I apologize, I\'m having trouble understanding. You can type "live agent" to connect with our support team for personalized help.';
    }
}
