@extends('website.layouts.app')

@section('title', 'Refund Policy - SHAREIDE')
@section('meta_description', 'SHAREIDE Refund Policy - Learn about our refund and cancellation policies.')

@section('content')
<div class="page-header">
    <div class="container">
        <h1 data-aos="fade-up">Refund Policy</h1>
        <p data-aos="fade-up" data-aos-delay="100">Last updated: {{ date('F Y') }}</p>
    </div>
</div>

<section style="padding: 80px 0;">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="background: var(--white); padding: 48px; border-radius: 24px; box-shadow: var(--shadow);">

                <h2>Cancellation Policy</h2>
                <div style="background: var(--gray-50); padding: 24px; border-radius: 16px; margin: 24px 0;">
                    <h4 style="color: var(--success);"><i class="fas fa-check-circle"></i> Free Cancellation</h4>
                    <p style="margin: 0;">Cancel within <strong>2 minutes</strong> of booking at no charge.</p>
                </div>
                <div style="background: #FEF3C7; padding: 24px; border-radius: 16px; margin: 24px 0;">
                    <h4 style="color: #D97706;"><i class="fas fa-exclamation-circle"></i> Cancellation Fee</h4>
                    <p style="margin: 0;">After 2 minutes or if driver is en route, a fee of <strong>Rs. 50-100</strong> may apply.</p>
                </div>

                <h2 style="margin-top: 32px;">Refund Eligibility</h2>
                <p>You may be eligible for a refund if:</p>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Driver did not arrive at pickup location</li>
                    <li>You were charged for a ride you didn't take</li>
                    <li>You were overcharged due to incorrect route</li>
                    <li>Driver behavior was inappropriate</li>
                    <li>Technical issues caused double charges</li>
                </ul>

                <h2 style="margin-top: 32px;">How to Request a Refund</h2>
                <ol style="margin-left: 24px; color: var(--text-light);">
                    <li>Open the SHAREIDE app</li>
                    <li>Go to "My Rides" and select the ride</li>
                    <li>Tap "Report an Issue"</li>
                    <li>Select the appropriate reason</li>
                    <li>Submit your request</li>
                </ol>
                <p>Or contact us at <strong>support@shareide.com</strong></p>

                <h2 style="margin-top: 32px;">Refund Processing</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr style="background: var(--gray-50);">
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--gray-200);">Payment Method</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid var(--gray-200);">Processing Time</th>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">SHAREIDE Wallet</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">Instant</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">JazzCash / Easypaisa</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">1-3 business days</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">Bank Card</td>
                        <td style="padding: 12px; border-bottom: 1px solid var(--gray-200);">5-7 business days</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px;">Cash</td>
                        <td style="padding: 12px;">Non-refundable (cash rides)</td>
                    </tr>
                </table>

                <h2 style="margin-top: 32px;">Non-Refundable Items</h2>
                <ul style="margin-left: 24px; color: var(--text-light);">
                    <li>Toll charges (passed through to rider)</li>
                    <li>Waiting time charges (after 3 free minutes)</li>
                    <li>Cancellation fees (after grace period)</li>
                    <li>Promotional rides (special terms may apply)</li>
                </ul>

                <h2 style="margin-top: 32px;">Contact Us</h2>
                <p>If you have any questions about refunds, please contact our support team:</p>
                <p><strong>Email:</strong> support@shareide.com</p>
                <p><strong>Phone:</strong> +92 300 1234567</p>

            </div>
        </div>
    </div>
</section>
@endsection
