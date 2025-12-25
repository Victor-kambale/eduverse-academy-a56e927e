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

    console.log("Starting document reminder check...");

    // Find applications with pending/missing documents older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: applications, error: fetchError } = await supabase
      .from("university_applications")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", sevenDaysAgo.toISOString())
      .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${sevenDaysAgo.toISOString()}`);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${applications?.length || 0} applications needing reminders`);

    const documentFields = [
      { key: "certificate_of_incorporation_url", label: "Certificate of Incorporation" },
      { key: "business_registration_url", label: "Business Registration" },
      { key: "accreditation_certificate_url", label: "Accreditation Certificate" },
      { key: "tax_clearance_url", label: "Tax Clearance" },
      { key: "ministry_certificate_url", label: "Ministry Certificate" },
      { key: "operating_license_url", label: "Operating License" },
    ];

    let sentCount = 0;

    for (const app of applications || []) {
      // Find missing documents
      const missingDocs = documentFields
        .filter(field => !app[field.key])
        .map(field => field.label);

      // Check for rejected documents
      const { data: verifications } = await supabase
        .from("university_document_verifications")
        .select("*")
        .eq("application_id", app.id)
        .eq("status", "rejected");

      const rejectedDocs = verifications?.map(v => v.document_label) || [];
      const allPendingDocs = [...missingDocs, ...rejectedDocs];

      if (allPendingDocs.length > 0) {
        try {
          const emailResponse = await resend.emails.send({
            from: "Eduverse <onboarding@resend.dev>",
            to: [app.contact_email],
            subject: "Reminder: Pending Documents for Your University Application",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a365d;">Document Reminder</h1>
                <p>Dear ${app.contact_name},</p>
                <p>We noticed that your application for <strong>${app.institution_name}</strong> still has pending document requirements:</p>
                
                ${missingDocs.length > 0 ? `
                  <h3 style="color: #c53030;">Missing Documents:</h3>
                  <ul>
                    ${missingDocs.map(doc => `<li>${doc}</li>`).join("")}
                  </ul>
                ` : ""}
                
                ${rejectedDocs.length > 0 ? `
                  <h3 style="color: #dd6b20;">Documents Requiring Re-upload:</h3>
                  <ul>
                    ${rejectedDocs.map(doc => `<li>${doc}</li>`).join("")}
                  </ul>
                ` : ""}
                
                <p>Please log in to your account and upload the required documents to continue with your application process.</p>
                
                <p style="margin-top: 20px;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "#"}/university/application-status" 
                     style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                    View Application Status
                  </a>
                </p>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                  If you have any questions, please don't hesitate to contact our support team.
                </p>
                
                <p>Best regards,<br>The Eduverse Team</p>
              </div>
            `,
          });

          console.log(`Email sent to ${app.contact_email}:`, emailResponse);

          // Update reminder tracking
          await supabase
            .from("university_applications")
            .update({
              last_reminder_sent_at: new Date().toISOString(),
              reminder_count: (app.reminder_count || 0) + 1,
            })
            .eq("id", app.id);

          sentCount++;
        } catch (emailError) {
          console.error(`Failed to send email to ${app.contact_email}:`, emailError);
        }
      }
    }

    console.log(`Sent ${sentCount} reminder emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        message: `Sent ${sentCount} reminder emails` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in document reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
