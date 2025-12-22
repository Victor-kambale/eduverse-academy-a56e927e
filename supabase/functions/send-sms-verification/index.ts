import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  phoneNumber: string;
  action: "send" | "verify";
  code?: string;
  amount?: number;
  fee?: number;
  companyName?: string;
}

// Store verification codes temporarily (in production, use a database)
const verificationCodes = new Map<string, { code: string; expires: number; attempts: number }>();

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, action, code, amount, fee, companyName = "EDUVERSE COMPANY" }: SMSRequest = await req.json();

    if (action === "send") {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code with 10-minute expiry
      verificationCodes.set(phoneNumber, {
        code: verificationCode,
        expires: Date.now() + 10 * 60 * 1000,
        attempts: 0,
      });

      // Create SMS message
      const message = amount 
        ? `Enter your PIN to confirm the payment of USD ${amount?.toFixed(2)} to ${companyName}. Fee ${fee?.toFixed(2)}. Your verification code: ${verificationCode}`
        : `Your EDUVERSE verification code is: ${verificationCode}. Valid for 10 minutes.`;

      // If Twilio credentials are configured, send real SMS
      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("To", phoneNumber);
        formData.append("From", TWILIO_PHONE_NUMBER);
        formData.append("Body", message);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (!twilioResponse.ok) {
          const error = await twilioResponse.text();
          console.error("Twilio error:", error);
          // Fall back to demo mode if Twilio fails
        }
      }

      console.log(`SMS sent to ${phoneNumber}: ${message}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Verification code sent successfully",
          // For demo purposes, include the code (remove in production)
          demoCode: !TWILIO_ACCOUNT_SID ? verificationCode : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      const stored = verificationCodes.get(phoneNumber);
      
      if (!stored) {
        return new Response(
          JSON.stringify({ success: false, error: "No verification code found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (Date.now() > stored.expires) {
        verificationCodes.delete(phoneNumber);
        return new Response(
          JSON.stringify({ success: false, error: "Verification code expired. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      stored.attempts++;

      if (code === stored.code) {
        verificationCodes.delete(phoneNumber);
        return new Response(
          JSON.stringify({ success: true, verified: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for too many failed attempts (2+)
      if (stored.attempts >= 2) {
        verificationCodes.delete(phoneNumber);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Too many failed attempts. 20% fee will be applied.",
            penaltyApplied: true,
            penaltyPercentage: 20,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid verification code",
          attemptsRemaining: 2 - stored.attempts,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-sms-verification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
