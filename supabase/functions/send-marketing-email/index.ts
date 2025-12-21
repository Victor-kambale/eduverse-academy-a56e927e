import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  templateType: 'course_exploration' | 'cart_reminder' | 'progress_update' | 'course_recommendation';
  customData?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, templateType, customData }: EmailRequest = await req.json();

    console.log(`Generating ${templateType} email for user ${userId}`);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Fetch featured courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, short_description, thumbnail_url, price, level, duration_hours, instructor_name')
      .eq('is_published', true)
      .limit(6);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
    }

    // Generate email content based on template type
    let emailContent = '';
    let subject = '';

    switch (templateType) {
      case 'course_exploration':
        subject = `${profile.full_name}, discover new learning opportunities!`;
        emailContent = generateExplorationEmail(profile.full_name || 'Learner', courses || []);
        break;
      case 'cart_reminder':
        subject = `Your courses are waiting! Complete your purchase`;
        emailContent = generateCartReminderEmail(profile.full_name || 'Learner', customData?.courses as any[] || []);
        break;
      case 'progress_update':
        subject = `Keep up the great work on your learning journey!`;
        emailContent = generateProgressEmail(profile.full_name || 'Learner', customData?.progress as any || {});
        break;
      case 'course_recommendation':
        subject = `Courses picked just for you, ${profile.full_name}!`;
        emailContent = generateRecommendationEmail(profile.full_name || 'Learner', courses || []);
        break;
    }

    // For now, return the email content (in production, integrate with Resend)
    console.log('Email generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        email: profile.email,
        subject,
        htmlContent: emailContent
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Error generating email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateExplorationEmail(name: string, courses: any[]): string {
  const courseCards = courses.slice(0, 6).map(course => `
    <tr>
      <td style="padding: 10px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 16px;">
              <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${course.title}</h3>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">${course.short_description || ''}</p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                ${course.duration_hours ? `${course.duration_hours} hours` : ''} • ${course.level || 'All Levels'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">📚 EduVerse</h1>
            <p style="margin: 8px 0 0 0; color: #94a3b8;">Your Learning Dashboard</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding: 32px 24px;">
            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 24px;">Hi ${name},</h2>
            <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
              Ready to discover something new? We've handpicked these courses just for you based on popular topics and high ratings from our learning community.
            </p>
            <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
              Whether you're looking to advance your career, pick up a new hobby, or expand your knowledge, there's something here for everyone.
            </p>
          </td>
        </tr>

        <!-- Courses Section -->
        <tr>
          <td style="padding: 0 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 18px;">🎯 Recommended for You</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${courseCards}
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding: 32px 24px; text-align: center;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/courses" 
               style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Explore All Courses →
            </a>
          </td>
        </tr>

        <!-- Stats Section -->
        <tr>
          <td style="padding: 24px; background: #f8fafc;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 28px; font-weight: bold; color: #0f172a;">6,000+</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Courses</p>
                </td>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 28px; font-weight: bold; color: #0f172a;">50M+</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Learners</p>
                </td>
                <td width="33%" style="text-align: center; padding: 16px;">
                  <p style="margin: 0; font-size: 28px; font-weight: bold; color: #0f172a;">4.9★</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Rating</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px; background: #0f172a; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
              © 2025 EduVerse. All rights reserved.
            </p>
            <p style="margin: 0; color: #64748b; font-size: 11px;">
              <a href="#" style="color: #64748b;">Update Preferences</a> | 
              <a href="#" style="color: #64748b;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateCartReminderEmail(name: string, courses: any[]): string {
  const courseList = courses.map(course => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 4px 0; color: #1e293b;">${course.title}</h4>
        <p style="margin: 0; color: #64748b; font-size: 14px;">$${course.price}</p>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff;">
        <tr>
          <td style="background: #0f172a; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #fff;">🛒 Your Cart Awaits!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <p style="color: #475569; font-size: 16px;">Hi ${name},</p>
            <p style="color: #475569; font-size: 16px;">You left some amazing courses in your cart. Don't miss out on your learning journey!</p>
          </td>
        </tr>
        ${courseList ? `<tr><td style="padding: 0 24px;"><table width="100%">${courseList}</table></td></tr>` : ''}
        <tr>
          <td style="padding: 32px 24px; text-align: center;">
            <a href="#" style="display: inline-block; background: #f97316; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Complete Your Purchase →
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateProgressEmail(name: string, progress: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff;">
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a, #1e3a5f); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #fff;">📈 Your Learning Progress</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px;">
            <h2 style="color: #1e293b;">Great work, ${name}! 🎉</h2>
            <p style="color: #475569; font-size: 16px;">
              You're making excellent progress! Here's what you can look forward to this week:
            </p>
            <ul style="color: #475569; font-size: 16px; line-height: 1.8;">
              <li>Continue where you left off</li>
              <li>Complete your current module</li>
              <li>Take the quiz to test your knowledge</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 24px; text-align: center;">
            <a href="#" style="display: inline-block; background: #f97316; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Resume Your Course →
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateRecommendationEmail(name: string, courses: any[]): string {
  return generateExplorationEmail(name, courses);
}
