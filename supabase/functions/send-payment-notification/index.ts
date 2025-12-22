import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentNotificationRequest {
  type: "deposit" | "withdrawal" | "course_purchase" | "teacher_registration" | "appointment";
  recipientEmail: string;
  recipientName: string;
  transactionId: string;
  amount: number;
  fee?: number;
  currency?: string;
  paymentMethod: string;
  accountNumber?: string;
  status: "success" | "pending" | "failed";
  courseTitle?: string;
  loginUrl?: string;
}

const getEmailTemplate = (data: PaymentNotificationRequest) => {
  const baseUrl = "https://eduverse.lovable.app";
  const statusColor = data.status === "success" ? "#22c55e" : data.status === "pending" ? "#eab308" : "#ef4444";
  const statusText = data.status === "success" ? "SUCCESS" : data.status === "pending" ? "PENDING" : "FAILED";
  
  const subjectMap: Record<string, string> = {
    deposit: `You've deposited ${data.amount.toFixed(2)} ${data.currency || 'USD'} successfully!`,
    withdrawal: `Withdrawal of ${data.amount.toFixed(2)} ${data.currency || 'USD'} processed!`,
    course_purchase: `Course Purchase Confirmed - ${data.courseTitle || 'Course'}`,
    teacher_registration: `Teacher Registration Payment Confirmed - $99 USD`,
    appointment: `Appointment Payment Confirmed - $${data.amount.toFixed(2)} USD`,
  };

  const subject = subjectMap[data.type] || "Payment Notification";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">EDUVERSE</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Learning Platform</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: ${statusColor}20; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">${data.status === 'success' ? '✓' : data.status === 'pending' ? '⏳' : '✗'}</span>
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px; text-align: center;">
              <h2 style="margin: 0; color: #1f2937; font-size: 24px;">Hello ${data.recipientName},</h2>
              <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                ${data.type === 'deposit' 
                  ? 'Your recent deposit has been successfully credited to your Eduverse account.'
                  : data.type === 'withdrawal'
                  ? 'Your withdrawal request has been processed successfully.'
                  : data.type === 'course_purchase'
                  ? `Thank you for purchasing "${data.courseTitle}". You can now access the course.`
                  : data.type === 'teacher_registration'
                  ? 'Your teacher registration fee has been received. Welcome to Eduverse!'
                  : 'Your appointment payment has been confirmed.'}
              </p>
            </td>
          </tr>

          <!-- Transaction Details -->
          <tr>
            <td style="padding: 0 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Transaction ID</span>
                    <span style="float: right; color: #1f2937; font-weight: 600; font-family: monospace;">${data.transactionId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Amount</span>
                    <span style="float: right; color: #1f2937; font-weight: 700; font-size: 18px;">${data.amount.toFixed(2)} ${data.currency || 'USD'}</span>
                  </td>
                </tr>
                ${data.fee ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Fee</span>
                    <span style="float: right; color: #ef4444; font-weight: 600;">${data.fee.toFixed(2)} ${data.currency || 'USD'}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Status</span>
                    <span style="float: right; color: ${statusColor}; font-weight: 700;">${statusText}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Payment Method</span>
                    <span style="float: right; color: #1f2937; font-weight: 600;">${data.paymentMethod}</span>
                  </td>
                </tr>
                ${data.accountNumber ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Account</span>
                    <span style="float: right; color: #1f2937; font-weight: 600;">${data.accountNumber}</span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 15px 20px;">
                    <span style="color: #6b7280; font-size: 14px;">Date</span>
                    <span style="float: right; color: #1f2937; font-weight: 600;">${new Date().toLocaleString('en-US', { 
                      dateStyle: 'medium', 
                      timeStyle: 'short',
                      timeZone: 'UTC'
                    })} UTC</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Your Account
              </a>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                For any questions or support, feel free to reach out.<br>
                You can simply reply to this email or write to us at <a href="mailto:support@eduverse.com" style="color: #6366f1;">support@eduverse.com</a>
              </p>
            </td>
          </tr>

          <!-- Thank You -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #1f2937; font-size: 14px;">
                Thank you,<br>
                <strong>The Eduverse Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 12px;">
                You received this email because you registered with ${data.recipientEmail}
              </p>
              <p style="margin: 0 0 15px; color: #9ca3af; font-size: 12px;">
                If you have any questions, please contact us via email at support@eduverse.com
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="display: inline-block; margin: 0 5px; color: #6b7280;">
                  <img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" width="24" height="24">
                </a>
                <a href="#" style="display: inline-block; margin: 0 5px; color: #6b7280;">
                  <img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" alt="Twitter" width="24" height="24">
                </a>
                <a href="#" style="display: inline-block; margin: 0 5px; color: #6b7280;">
                  <img src="https://cdn-icons-png.flaticon.com/32/733/733558.png" alt="Instagram" width="24" height="24">
                </a>
              </div>
              <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">
                Eduverse Learning Platform | Global
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PaymentNotificationRequest = await req.json();
    const { subject, html } = getEmailTemplate(data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Eduverse <noreply@resend.dev>",
        to: [data.recipientEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(error);
    }

    const emailResponse = await res.json();

    console.log("Payment notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-payment-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
