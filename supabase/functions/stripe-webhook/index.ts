import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    console.log("[STRIPE-WEBHOOK] Received webhook request");

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (!webhookSecret) {
      console.error("[STRIPE-WEBHOOK] CRITICAL: STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!signature) {
      console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("[STRIPE-WEBHOOK] Signature verified");
    } catch (err) {
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[STRIPE-WEBHOOK] Event type: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[STRIPE-WEBHOOK] Processing completed session", {
        sessionId: session.id,
        metadata: session.metadata,
      });

      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;
      const paymentType = session.metadata?.payment_type;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      // Handle teacher registration payments
      if (paymentType === "teacher_registration") {
        const teacherUserId = session.metadata?.user_id;
        if (teacherUserId) {
          console.log("[STRIPE-WEBHOOK] Processing teacher registration payment for:", teacherUserId);
          
          // Update teacher application
          const { error: updateError } = await supabaseAdmin
            .from("teacher_applications")
            .update({
              registration_fee_paid: true,
              registration_payment_date: new Date().toISOString(),
              registration_payment_id: session.id,
            })
            .eq("user_id", teacherUserId);

          if (updateError) {
            console.error("[STRIPE-WEBHOOK] Error updating teacher application:", updateError);
          } else {
            console.log("[STRIPE-WEBHOOK] Teacher registration payment recorded");
          }

          // Record in course_creation_fees
          await supabaseAdmin.from("course_creation_fees").insert({
            teacher_id: teacherUserId,
            amount: amount,
            payment_id: session.id,
            payment_method: "stripe",
          });

          // Record admin revenue
          await supabaseAdmin.from("admin_revenue").insert({
            source_type: "teacher_registration",
            source_id: session.id,
            teacher_id: teacherUserId,
            total_amount: amount,
            commission_percentage: 100,
            commission_amount: amount,
          });
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle course purchase payments
      if (!courseId) {
        console.error("[STRIPE-WEBHOOK] Missing courseId in metadata");
        return new Response(JSON.stringify({ error: "Missing courseId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!userId || userId === "guest") {
        console.log("[STRIPE-WEBHOOK] Guest checkout - skipping enrollment");
        return new Response(JSON.stringify({ received: true }), {
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
          stripe_payment_intent_id: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null,
        });

      if (paymentError) {
        console.error("[STRIPE-WEBHOOK] Error recording payment:", paymentError);
      } else {
        console.log("[STRIPE-WEBHOOK] Payment recorded successfully");
      }

      // Create enrollment
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existingEnrollment) {
        console.log("[STRIPE-WEBHOOK] Enrollment already exists");
      } else {
        console.log("[STRIPE-WEBHOOK] Creating enrollment...");
        const { error: enrollmentError } = await supabaseAdmin
          .from("enrollments")
          .insert({ user_id: userId, course_id: courseId });

        if (enrollmentError) {
          console.error("[STRIPE-WEBHOOK] Error creating enrollment:", enrollmentError);
        } else {
          console.log("[STRIPE-WEBHOOK] Enrollment created successfully");
        }
      }

      // Record admin revenue for course purchases
      const { data: courseData } = await supabaseAdmin
        .from("courses")
        .select("instructor_id, level, title")
        .eq("id", courseId)
        .maybeSingle();

      const commissionRate = 0.30; // 30% platform commission
      const commissionAmount = amount * commissionRate;
      const teacherAmount = amount - commissionAmount;

      await supabaseAdmin.from("admin_revenue").insert({
        source_type: "course_purchase",
        source_id: session.id,
        course_id: courseId,
        student_id: userId,
        teacher_id: courseData?.instructor_id || null,
        total_amount: amount,
        commission_percentage: commissionRate * 100,
        commission_amount: commissionAmount,
        teacher_amount: teacherAmount,
        course_level: courseData?.level || null,
      });

      console.log("[STRIPE-WEBHOOK] Revenue recorded:", { amount, commissionAmount, teacherAmount });

      // Create notification for the student
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "🎉 Enrollment Successful!",
        message: `You have successfully enrolled in "${courseData?.title || session.metadata?.courseTitle}". Start learning now!`,
        type: "success",
        category: "enrollment",
        priority: "high",
        link: `/course/${courseId}/learn`,
        action_url: `/course/${courseId}/learn`,
        metadata: { courseId, amount, paymentMethod: "Stripe" },
      });
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
