import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking for expiring documents...");

    // Find documents expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: expiringDocs, error: fetchError } = await supabase
      .from("university_document_verifications")
      .select(`
        *,
        university_applications!inner(
          id,
          institution_name,
          contact_email,
          contact_name,
          user_id
        )
      `)
      .eq("status", "verified")
      .not("expiry_date", "is", null)
      .lte("expiry_date", thirtyDaysFromNow.toISOString().split('T')[0])
      .or(`expiry_notified_at.is.null,expiry_notified_at.lt.${sevenDaysAgo.toISOString()}`);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiringDocs?.length || 0} expiring documents`);

    let notifiedCount = 0;

    // Group by application
    const byApplication = new Map<string, any[]>();
    for (const doc of expiringDocs || []) {
      const appId = doc.university_applications.id;
      if (!byApplication.has(appId)) {
        byApplication.set(appId, []);
      }
      byApplication.get(appId)!.push(doc);
    }

    for (const [appId, docs] of byApplication) {
      const app = docs[0].university_applications;
      const daysUntilExpiry = (docExpiry: string) => {
        const expiry = new Date(docExpiry);
        const today = new Date();
        return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      };

      try {
        await resend.emails.send({
          from: "Eduverse <onboarding@resend.dev>",
          to: [app.contact_email],
          subject: "Document Expiration Notice - Action Required",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #c53030;">Document Expiration Alert</h1>
              <p>Dear ${app.contact_name},</p>
              <p>The following documents for <strong>${app.institution_name}</strong> are expiring soon:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f7fafc;">
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Document</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Expiry Date</th>
                    <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left;">Days Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  ${docs.map(doc => `
                    <tr>
                      <td style="padding: 12px; border: 1px solid #e2e8f0;">${doc.document_label}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0;">${new Date(doc.expiry_date).toLocaleDateString()}</td>
                      <td style="padding: 12px; border: 1px solid #e2e8f0; ${daysUntilExpiry(doc.expiry_date) <= 7 ? 'color: #c53030; font-weight: bold;' : ''}">${daysUntilExpiry(doc.expiry_date)} days</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <p>Please upload renewed documents before the expiry dates to maintain your institution's active status.</p>
              
              <p style="margin-top: 20px;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "#"}/university/application-status" 
                   style="background-color: #c53030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Update Documents
                </a>
              </p>
              
              <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                If you have already renewed these documents, please upload the new versions.
              </p>
              
              <p>Best regards,<br>The Eduverse Team</p>
            </div>
          `,
        });

        // Update notification timestamp
        const docIds = docs.map(d => d.id);
        await supabase
          .from("university_document_verifications")
          .update({ expiry_notified_at: new Date().toISOString() })
          .in("id", docIds);

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: app.user_id,
          title: "Documents Expiring Soon",
          message: `${docs.length} document(s) for ${app.institution_name} will expire within 30 days. Please renew them.`,
          type: "warning",
          link: "/university/application-status",
        });

        notifiedCount++;
      } catch (emailError) {
        console.error(`Failed to send expiry notification to ${app.contact_email}:`, emailError);
      }
    }

    console.log(`Sent ${notifiedCount} expiry notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifiedCount,
        message: `Sent ${notifiedCount} expiry notifications` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in expiry notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
