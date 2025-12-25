import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OCRRequest {
  documentUrl: string;
  documentType: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { documentUrl, documentType }: OCRRequest = await req.json();
    console.log("Processing OCR for document:", documentType);

    const systemPrompt = `You are a document analysis AI. Extract key information from this ${documentType} document.
    
Return a JSON object with the following structure (fill in what you can find):
{
  "documentTitle": "extracted title or type",
  "issuingAuthority": "organization that issued the document",
  "issueDate": "YYYY-MM-DD format if found",
  "expiryDate": "YYYY-MM-DD format if found",
  "registrationNumber": "any registration/license number",
  "holderName": "name of person/organization the document is for",
  "address": "any address found",
  "validityPeriod": "validity period if mentioned",
  "additionalInfo": ["array of other key details found"],
  "confidence": "high/medium/low based on image quality"
}

Only include fields where you can extract information. Return valid JSON only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: systemPrompt },
              { type: "image_url", image_url: { url: documentUrl } }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI processing failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    // Try to parse JSON from the response
    let extractedData = {};
    try {
      // Find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      extractedData = {
        rawText: content,
        confidence: "low",
        error: "Could not parse structured data"
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in OCR extraction:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
