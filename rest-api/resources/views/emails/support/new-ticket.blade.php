<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isReply ? 'New Reply' : 'New Support Ticket' }}</title>
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
                            <h2 style="margin: 0 0 20px; color: #333; font-size: 20px;">
                                @if($isReply)
                                    New Reply Received
                                @else
                                    New Support Ticket
                                @endif
                            </h2>

                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr>
                                        <td style="color: #666; width: 120px;">Ticket #:</td>
                                        <td style="color: #333; font-weight: 600;">{{ $ticket->ticket_number }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666;">From:</td>
                                        <td style="color: #333; font-weight: 600;">{{ $ticket->guest_name }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666;">Email:</td>
                                        <td style="color: #333;">{{ $ticket->guest_email }}</td>
                                    </tr>
                                    @if($ticket->guest_phone)
                                    <tr>
                                        <td style="color: #666;">Phone:</td>
                                        <td style="color: #333;">{{ $ticket->guest_phone }}</td>
                                    </tr>
                                    @endif
                                    <tr>
                                        <td style="color: #666;">Subject:</td>
                                        <td style="color: #333;">{{ $ticket->subject }}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666;">Status:</td>
                                        <td>
                                            <span style="background-color: #28a745; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px;">
                                                {{ ucfirst($ticket->status) }}
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h3 style="margin: 0 0 10px; color: #333; font-size: 16px;">Message:</h3>
                                <div style="background-color: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; color: #555; line-height: 1.6;">
                                    {!! nl2br(e($ticket->description)) !!}
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="{{ url('/admin/support/' . $ticket->id) }}"
                                   style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    View in Admin Panel
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a2e; padding: 25px 30px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #888; font-size: 14px;">
                                This is an automated notification from SHAREIDE Support System
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
