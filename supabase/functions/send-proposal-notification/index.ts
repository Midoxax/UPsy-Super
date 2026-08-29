import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { sender } from "../_shared/sender.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProposalNotificationRequest {
  organizationName: string;
  contactName: string;
  email: string;
  phone?: string;
  organizationSize?: string;
  serviceInterest: string;
  message?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// HTML escape function for safe email content
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validate and sanitize inputs
function validateRequest(body: unknown): ProposalNotificationRequest {
  if (!body || typeof body !== 'object') {
    throw new Error("Invalid request body");
  }

  const { organizationName, contactName, email, phone, organizationSize, serviceInterest, message } = body as Record<string, unknown>;

  // Validate required fields
  if (!organizationName || typeof organizationName !== 'string' || organizationName.trim().length === 0) {
    throw new Error("Organization name is required");
  }
  if (organizationName.length > 200) {
    throw new Error("Organization name is too long");
  }

  if (!contactName || typeof contactName !== 'string' || contactName.trim().length === 0) {
    throw new Error("Contact name is required");
  }
  if (contactName.length > 100) {
    throw new Error("Contact name is too long");
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new Error("Valid email is required");
  }
  if (email.length > 255) {
    throw new Error("Email is too long");
  }

  if (!serviceInterest || typeof serviceInterest !== 'string' || serviceInterest.trim().length === 0) {
    throw new Error("Service interest is required");
  }
  if (serviceInterest.length > 200) {
    throw new Error("Service interest is too long");
  }

  // Validate optional fields
  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || phone.length > 30) {
      throw new Error("Invalid phone format");
    }
  }

  if (organizationSize !== undefined && organizationSize !== null && organizationSize !== '') {
    if (typeof organizationSize !== 'string' || organizationSize.length > 50) {
      throw new Error("Invalid organization size format");
    }
  }

  if (message !== undefined && message !== null && message !== '') {
    if (typeof message !== 'string' || message.length > 2000) {
      throw new Error("Message is too long (max 2000 characters)");
    }
  }

  return {
    organizationName: escapeHtml(organizationName.trim().slice(0, 200)),
    contactName: escapeHtml(contactName.trim().slice(0, 100)),
    email: email.trim().slice(0, 255),
    phone: phone ? escapeHtml(String(phone).trim().slice(0, 30)) : undefined,
    organizationSize: organizationSize ? escapeHtml(String(organizationSize).trim().slice(0, 50)) : undefined,
    serviceInterest: escapeHtml(serviceInterest.trim().slice(0, 200)),
    message: message ? escapeHtml(String(message).trim().slice(0, 2000)) : undefined,
  };
}

// Sanitize error messages for client responses
function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // Map known validation errors to safe messages
  if (message.includes("required") || message.includes("Invalid") || message.includes("too long")) {
    return message; // These are safe validation messages
  }
  
  // Generic fallback for unknown/internal errors
  return "Failed to send proposal notification";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate and sanitize input
    const rawBody = await req.json();
    const {
      organizationName,
      contactName,
      email,
      phone,
      organizationSize,
      serviceInterest,
      message,
    } = validateRequest(rawBody);

    console.log("Sending proposal notification for:", organizationName);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: sender(),
      to: ["mypersonalpsychologist212@gmail.com"],
      subject: `New Proposal Request from ${organizationName}`,
      html: `
        <h1>New Proposal Request</h1>
        <h2>Organization Information</h2>
        <p><strong>Organization Name:</strong> ${organizationName}</p>
        <p><strong>Organization Size:</strong> ${organizationSize || "Not specified"}</p>
        
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        
        <h2>Request Details</h2>
        <p><strong>Service Interest:</strong> ${serviceInterest}</p>
        <p><strong>Message:</strong></p>
        <p>${message || "No additional message provided"}</p>
        
        <hr>
        <p><small>Submitted on ${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation to client
    const clientEmailResponse = await resend.emails.send({
      from: sender(),
      to: [email],
      subject: "We received your proposal request!",
      html: `
        <h1>Thank you for your interest, ${contactName}!</h1>
        <p>We have received your proposal request for <strong>${organizationName}</strong> and will review it carefully.</p>
        <p>Our team will get back to you within 2-3 business days to discuss how we can support your organization.</p>
        
        <h2>What you requested:</h2>
        <p><strong>Service:</strong> ${serviceInterest}</p>
        ${message ? `<p><strong>Your message:</strong> ${message}</p>` : ""}
        
        <p>If you have any urgent questions, feel free to reach out:</p>
        <ul>
          <li>Email: mypersonalpsychologist212@gmail.com</li>
          <li>WhatsApp: +212 668-594699</li>
        </ul>
        
        <p>Best regards,<br>The U.Psy Team</p>
      `,
    });

    console.log("Client confirmation email sent:", clientEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        adminEmailId: adminEmailResponse.data?.id,
        clientEmailId: clientEmailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-proposal-notification:", error);
    return new Response(
      JSON.stringify({ error: sanitizeError(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
