<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply to Your Support Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 700;">
                                SHAREIDE Support
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 10px; color: #333; font-size: 20px;">
                                Hello {{ $ticket->guest_name }},
                            </h2>
                            <p style="color: #666; margin: 0 0 25px; font-size: 15px;">
                                We have replied to your support ticket. Please see the details below.
                            </p>

                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr>
                                        <td style="color: #666; width: 100px;">Ticket #:</td>
                                        <td style="color: #333; font-weight: 600;">{{ $ticket->ticket_number }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666;">Subject:</td>
                                        <td style="color: #333;">{{ $ticket->subject }}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h3 style="margin: 0 0 10px; color: #333; font-size: 16px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; background-color: #FFD700; border-radius: 50%; margin-right: 8px;"></span>
                                    Our Reply:
                                </h3>
                                <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; color: #333; line-height: 1.6;">
                                    {!! nl2br(e($replyMessage->message)) !!}
                                </div>
                            </div>

                            <div style="background-color: #e8f4fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <p style="margin: 0 0 15px; color: #333; font-size: 15px;">
                                    <strong>Want to reply?</strong> Click the button below to view the full conversation and send a reply.
                                </p>
                                <a href="{{ $ticket->reply_url }}"
                                   style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    View & Reply to Ticket
                                </a>
                            </div>

                            <p style="color: #888; font-size: 13px; margin: 0;">
                                If you did not create this support ticket, please ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a2e; padding: 25px 30px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #FFD700; font-size: 16px; font-weight: 600;">
                                Thank you for choosing SHAREIDE
                            </p>
                            <p style="margin: 0 0 15px; color: #888; font-size: 14px;">
                                Your trusted ride-sharing partner
                            </p>
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                &copy; {{ date('Y') }} SHAREIDE. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
