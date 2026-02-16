<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CnicVerificationService
{
    /**
     * Extract CNIC number from an image using Google Cloud Vision API
     */
    public function extractCnicFromImage(string $imagePath): ?string
    {
        $apiKey = config('services.google_vision.key');

        if (!$apiKey) {
            Log::warning('Google Cloud Vision API key not configured');
            return null;
        }

        try {
            $imageContent = base64_encode(file_get_contents($imagePath));

            $response = Http::post("https://vision.googleapis.com/v1/images:annotate?key={$apiKey}", [
                'requests' => [
                    [
                        'image' => [
                            'content' => $imageContent,
                        ],
                        'features' => [
                            ['type' => 'TEXT_DETECTION'],
                        ],
                    ],
                ],
            ]);

            if (!$response->successful()) {
                Log::error('Vision API error: ' . $response->body());
                return null;
            }

            $data = $response->json();
            $text = $data['responses'][0]['textAnnotations'][0]['description'] ?? '';

            return $this->extractCnicPattern($text);
        } catch (\Exception $e) {
            Log::error('CNIC extraction error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract Pakistani CNIC pattern from text
     * Pattern: XXXXX-XXXXXXX-X (13 digits with dashes)
     */
    public function extractCnicPattern(string $text): ?string
    {
        // Standard CNIC format: XXXXX-XXXXXXX-X
        if (preg_match('/(\d{5})-(\d{7})-(\d{1})/', $text, $matches)) {
            return $matches[0];
        }

        // Without dashes: 13 consecutive digits
        if (preg_match('/(\d{13})/', $text, $matches)) {
            $digits = $matches[1];
            return substr($digits, 0, 5) . '-' . substr($digits, 5, 7) . '-' . substr($digits, 12, 1);
        }

        // Partial match with spaces or other separators
        if (preg_match('/(\d{5})\s*[-\s.]\s*(\d{7})\s*[-\s.]\s*(\d{1})/', $text, $matches)) {
            return $matches[1] . '-' . $matches[2] . '-' . $matches[3];
        }

        return null;
    }

    /**
     * Verify that extracted CNIC matches the expected one
     */
    public function verifyCnic(string $imagePath, string $expectedCnic): array
    {
        $extractedCnic = $this->extractCnicFromImage($imagePath);

        if (!$extractedCnic) {
            return [
                'match' => false,
                'extracted_cnic' => null,
                'message' => 'Could not extract CNIC number from the image. Please ensure your CNIC card is clearly visible.',
            ];
        }

        // Normalize both for comparison (remove dashes)
        $normalizedExtracted = str_replace('-', '', $extractedCnic);
        $normalizedExpected = str_replace('-', '', $expectedCnic);

        $isMatch = $normalizedExtracted === $normalizedExpected;

        return [
            'match' => $isMatch,
            'extracted_cnic' => $extractedCnic,
            'message' => $isMatch
                ? 'CNIC verified successfully!'
                : 'CNIC number does not match. Extracted: ' . $extractedCnic,
        ];
    }

    /**
     * Detect if image contains an ID card (basic check)
     */
    public function detectIdCard(string $imagePath): bool
    {
        $apiKey = config('services.google_vision.key');

        if (!$apiKey) {
            return true; // Skip check if no API key
        }

        try {
            $imageContent = base64_encode(file_get_contents($imagePath));

            $response = Http::post("https://vision.googleapis.com/v1/images:annotate?key={$apiKey}", [
                'requests' => [
                    [
                        'image' => [
                            'content' => $imageContent,
                        ],
                        'features' => [
                            ['type' => 'OBJECT_LOCALIZATION'],
                        ],
                    ],
                ],
            ]);

            if (!$response->successful()) {
                return true; // Default to allowing if API fails
            }

            $data = $response->json();
            $text = $data['responses'][0]['textAnnotations'][0]['description'] ?? '';

            // Check for common CNIC keywords
            $cnicKeywords = ['IDENTITY', 'NADRA', 'PAKISTAN', 'CNIC', 'NATIONAL', 'CARD'];
            foreach ($cnicKeywords as $keyword) {
                if (stripos($text, $keyword) !== false) {
                    return true;
                }
            }

            // If digits matching CNIC pattern found, consider it valid
            if (preg_match('/\d{5}[-\s]?\d{7}[-\s]?\d{1}/', $text)) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return true; // Default to allowing if check fails
        }
    }
}
