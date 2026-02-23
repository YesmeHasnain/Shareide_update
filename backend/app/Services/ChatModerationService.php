<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatModerationService
{
    /**
     * Check if a message contains blocked content (phone numbers, social handles, etc.)
     * Dual-layer: regex first (fast, free), then OpenAI for obfuscation detection.
     *
     * @return array ['blocked' => bool, 'reason' => string|null]
     */
    public function moderate(string $message): array
    {
        // Layer 1: Regex detection (fast, free)
        $regexResult = $this->regexCheck($message);
        if ($regexResult['blocked']) {
            return $regexResult;
        }

        // Layer 2: OpenAI detection (catches obfuscation like "nine eight seven...")
        // Only run if message is long enough to potentially contain obfuscated contact info
        if (strlen($message) > 15) {
            $aiResult = $this->aiCheck($message);
            if ($aiResult['blocked']) {
                return $aiResult;
            }
        }

        return ['blocked' => false, 'reason' => null];
    }

    /**
     * Layer 1: Regex-based detection of phone numbers, emails, social handles
     */
    protected function regexCheck(string $message): array
    {
        $normalized = preg_replace('/[\s\-\.\/\(\)]+/', '', $message);

        $patterns = [
            // Pakistani phone numbers: 03XX-XXXXXXX, +923XX...
            '/(?:\+?92|0)3\d{9}/' => 'phone number',
            // International phone formats: +1..., +44..., etc (7+ digits)
            '/\+\d{10,15}/' => 'phone number',
            // Generic digit sequences (7+ consecutive digits after removing separators)
            '/\d{7,}/' => 'phone number',
            // WhatsApp links
            '/wa\.me/i' => 'WhatsApp link',
            '/whatsapp\.com/i' => 'WhatsApp link',
            '/chat\.whatsapp/i' => 'WhatsApp link',
            // Social media handles/links
            '/(?:instagram|insta|ig)[\s:@\.]+\w+/i' => 'social media handle',
            '/(?:facebook|fb)[\s:@\.]+\w+/i' => 'social media handle',
            '/(?:snapchat|snap)[\s:@\.]+\w+/i' => 'social media handle',
            '/(?:telegram|tg)[\s:@\.]+\w+/i' => 'social media handle',
            '/(?:twitter|x\.com)[\s:@\.]+\w+/i' => 'social media handle',
            // Email addresses
            '/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i' => 'email address',
        ];

        // Check normalized text for phone patterns
        foreach (array_slice($patterns, 0, 3) as $pattern => $type) {
            if (preg_match($pattern, $normalized)) {
                return [
                    'blocked' => true,
                    'reason' => "Message contains a {$type}. For your safety, please keep all communication within the app.",
                ];
            }
        }

        // Check original text for links and handles
        foreach (array_slice($patterns, 3) as $pattern => $type) {
            if (preg_match($pattern, $message)) {
                return [
                    'blocked' => true,
                    'reason' => "Message contains a {$type}. For your safety, please keep all communication within the app.",
                ];
            }
        }

        return ['blocked' => false, 'reason' => null];
    }

    /**
     * Layer 2: OpenAI-based detection of obfuscated contact info
     */
    protected function aiCheck(string $message): array
    {
        $apiKey = config('services.openai.key');
        if (!$apiKey) {
            // If no API key configured, skip AI moderation
            return ['blocked' => false, 'reason' => null];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(5)->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a content moderator for a ride-sharing chat. Your ONLY job is to detect if a message contains or attempts to share personal contact information (phone numbers, WhatsApp, social media, email) even if obfuscated. Respond with ONLY a JSON object: {"blocked": true/false, "type": "phone/social/email/none"}. Obfuscation examples to catch: spelled-out numbers ("zero three zero zero"), letter substitution ("0thr33"), split numbers ("zero three... double zero... one two"), coded hints ("call me on the app that starts with W"). Do NOT block normal ride-related conversation.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $message,
                    ],
                ],
                'max_tokens' => 50,
                'temperature' => 0,
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content', '');
                $result = json_decode($content, true);

                if ($result && isset($result['blocked']) && $result['blocked'] === true) {
                    $type = $result['type'] ?? 'contact information';
                    return [
                        'blocked' => true,
                        'reason' => "Message appears to contain {$type}. For your safety, please keep all communication within the app.",
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Chat AI moderation failed, allowing message', [
                'error' => $e->getMessage(),
            ]);
        }

        return ['blocked' => false, 'reason' => null];
    }
}
