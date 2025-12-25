import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  applicationId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { applicationId }: ExportRequest = await req.json();
    console.log("Exporting documents for application:", applicationId);

    // Fetch application
    const { data: application, error: appError } = await supabase
      .from("university_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    const zip = new JSZip();
    const documentFields = [
      { key: "certificate_of_incorporation_url", label: "Certificate_of_Incorporation" },
      { key: "business_registration_url", label: "Business_Registration" },
      { key: "accreditation_certificate_url", label: "Accreditation_Certificate" },
      { key: "tax_clearance_url", label: "Tax_Clearance" },
      { key: "ministry_certificate_url", label: "Ministry_Certificate" },
      { key: "operating_license_url", label: "Operating_License" },
      { key: "government_approval_url", label: "Government_Approval" },
      { key: "academic_charter_url", label: "Academic_Charter" },
      { key: "quality_assurance_url", label: "Quality_Assurance" },
      { key: "authorization_letter_url", label: "Authorization_Letter" },
      { key: "institutional_profile_url", label: "Institutional_Profile" },
      { key: "leadership_cv_url", label: "Leadership_CV" },
    ];

    let addedCount = 0;

    for (const field of documentFields) {
      const url = application[field.key];
      if (url) {
        try {
          // Extract path from URL
          const urlObj = new URL(url);
          const pathMatch = urlObj.pathname.match(/\/object\/public\/(.+)/);
          
          if (pathMatch) {
            const storagePath = pathMatch[1];
            const [bucket, ...fileParts] = storagePath.split("/");
            const filePath = fileParts.join("/");
            
            const { data: fileData, error: downloadError } = await supabase.storage
              .from(bucket)
              .download(filePath);

            if (!downloadError && fileData) {
              const extension = filePath.split(".").pop() || "pdf";
              const arrayBuffer = await fileData.arrayBuffer();
              zip.file(`${field.label}.${extension}`, arrayBuffer);
              addedCount++;
              console.log(`Added ${field.label} to ZIP`);
            }
          } else {
            // Try direct fetch for external URLs
            const response = await fetch(url);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const extension = url.split(".").pop()?.split("?")[0] || "pdf";
              zip.file(`${field.label}.${extension}`, arrayBuffer);
              addedCount++;
            }
          }
        } catch (err) {
          console.error(`Error downloading ${field.label}:`, err);
        }
      }
    }

    if (addedCount === 0) {
      throw new Error("No documents found to export");
    }

    console.log(`Creating ZIP with ${addedCount} documents`);
    const zipContent = await zip.generateAsync({ type: "base64" });

    return new Response(
      JSON.stringify({ 
        success: true, 
        zipContent,
        fileName: `${application.institution_name.replace(/[^a-zA-Z0-9]/g, "_")}_Documents.zip`,
        documentCount: addedCount
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error exporting documents:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
