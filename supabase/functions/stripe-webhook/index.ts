import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    console.log("[STRIPE-WEBHOOK] Received webhook request");
    
    // If we have a webhook secret, verify the signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("[STRIPE-WEBHOOK] Signature verified successfully");
      } catch (err) {
        console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body);
      console.log("[STRIPE-WEBHOOK] Processing event without signature verification");
    }

    console.log(`[STRIPE-WEBHOOK] Event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[STRIPE-WEBHOOK] Processing checkout.session.completed", {
        sessionId: session.id,
        metadata: session.metadata,
      });

      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      if (!courseId) {
        console.error("[STRIPE-WEBHOOK] Missing courseId in metadata");
        return new Response(JSON.stringify({ error: "Missing courseId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Skip if user is guest
      if (!userId || userId === "guest") {
        console.log("[STRIPE-WEBHOOK] Guest checkout - skipping enrollment creation");
        return new Response(JSON.stringify({ received: true, message: "Guest checkout" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Record the payment
      console.log("[STRIPE-WEBHOOK] Recording payment...");
      const { error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          course_id: courseId,
          amount: amount,
          status: "completed",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent?.id || null,
        });

      if (paymentError) {
        console.error("[STRIPE-WEBHOOK] Error recording payment:", paymentError);
      } else {
        console.log("[STRIPE-WEBHOOK] Payment recorded successfully");
      }

      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single();

      if (existingEnrollment) {
        console.log("[STRIPE-WEBHOOK] Enrollment already exists, skipping");
      } else {
        // Create enrollment
        console.log("[STRIPE-WEBHOOK] Creating enrollment...");
        const { error: enrollmentError } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: userId,
            course_id: courseId,
          });

        if (enrollmentError) {
          console.error("[STRIPE-WEBHOOK] Error creating enrollment:", enrollmentError);
        } else {
          console.log("[STRIPE-WEBHOOK] Enrollment created successfully");
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[STRIPE-WEBHOOK] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
