import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingData {
  customer_name: string;
  customer_email: string;
  suite_name: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  payment_reference: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const booking: BookingData = await req.json();
    const { 
      customer_name, 
      customer_email, 
      suite_name, 
      check_in, 
      check_out, 
      total_amount,
      payment_reference 
    } = booking;

    const { data, error } = await resend.emails.send({
      from: "Anyimadu Suites <bookings@anyimadusuites.com>",
      to: [customer_email],
      bcc: ["anyimadudev@gmail.com", "tonyanyimadu@gmail.com"], // Admin notification
      subject: `Booking Confirmation - ${suite_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Booking Confirmation</h2>
          <p>Dear ${customer_name},</p>
          <p>Thank you for choosing Anyimadu Suites. Your booking has been confirmed.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Suite:</strong> ${suite_name}</p>
            <p><strong>Check-in:</strong> ${new Date(check_in).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(check_out).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> GHS ${total_amount.toLocaleString()}</p>
          </div>
          
          <p>We look forward to hosting you!</p>
          <p>Best regards,<br>Anyimadu Suites Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
