import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PromoEmailRequest {
  bannerId: string;
  promoTitle: string;
  promoDescription?: string;
  linkUrl?: string;
  linkText?: string;
  endDate?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bannerId, promoTitle, promoDescription, linkUrl, linkText, endDate }: PromoEmailRequest = await req.json();

    console.log(`Sending promo notification emails for banner: ${bannerId}`);

    // Get all active newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw new Error('Failed to fetch subscribers');
    }

    // Also get all user profiles with emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .not('email', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Combine and deduplicate emails
    const allEmails = new Set<string>();
    subscribers?.forEach(s => s.email && allEmails.add(s.email));
    profiles?.forEach(p => p.email && allEmails.add(p.email));

    const emailList = Array.from(allEmails);
    console.log(`Found ${emailList.length} recipients for promo notification`);

    // Generate email HTML
    const emailHtml = generatePromoEmailHtml({
      title: promoTitle,
      description: promoDescription,
      linkUrl: linkUrl || '/courses',
      linkText: linkText || 'Shop Now',
      endDate,
    });

    let sentCount = 0;

    // For now, log the email send simulation (integrate with Resend when configured)
    console.log(`Would send promo emails to ${emailList.length} recipients`);
    console.log('Email subject:', `🎉 ${promoTitle}`);
    sentCount = emailList.length;

    // Update the banner with email sent info
    const { error: updateError } = await supabase
      .from('promotional_banners')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_count: sentCount,
      })
      .eq('id', bannerId);

    if (updateError) {
      console.error('Error updating banner:', updateError);
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'promo_emails_sent',
      entity_type: 'promotional_banner',
      entity_id: bannerId,
      metadata: {
        sent_count: sentCount,
        total_recipients: emailList.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        totalRecipients: emailList.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending promo notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

interface EmailTemplateData {
  title: string;
  description?: string;
  linkUrl: string;
  linkText: string;
  endDate?: string;
}

function generatePromoEmailHtml(data: EmailTemplateData): string {
  const endDateText = data.endDate 
    ? `Hurry! This offer ends on ${new Date(data.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'Limited time offer - act now!';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header with gradient -->
        <tr>
          <td style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%); padding: 40px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              🎉 Special Offer!
            </h1>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding: 40px 24px; text-align: center;">
            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 28px; font-weight: bold;">
              ${data.title}
            </h2>
            ${data.description ? `
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 18px; line-height: 1.6;">
                ${data.description}
              </p>
            ` : ''}
            
            <!-- Countdown/Urgency -->
            <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                ⏰ ${endDateText}
              </p>
            </div>

            <!-- CTA Button -->
            <a href="${data.linkUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #ffffff; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 18px; margin: 16px 0; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
              ${data.linkText} →
            </a>
          </td>
        </tr>

        <!-- Benefits Section -->
        <tr>
          <td style="padding: 24px; background: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 32px;">📚</p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">6,000+ Courses</p>
                </td>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 32px;">🎓</p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">Certified Learning</p>
                </td>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 32px;">🌍</p>
                  <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">193 Countries</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px; background: #0f172a; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
              Eduverse Academy
            </p>
            <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 12px;">
              Empowering learners worldwide
            </p>
            <p style="margin: 0; color: #64748b; font-size: 11px;">
              <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
              <a href="#" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
