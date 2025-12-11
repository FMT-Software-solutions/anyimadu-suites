import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@6.5.2";
import { simpleParser } from "https://esm.sh/mailparser"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Verify it's an email event
    if (payload.type !== "email.received") {
      return new Response(JSON.stringify({ message: "Not an email event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id, from: sender, subject: initialSubject, to: recipients } = payload.data;
    
    // Retrieve full email content including body
    let htmlContent = "";
    let textContent = "";
    
  
      // Use the specific 'receiving' namespace for inbound emails
      const { data: emailDetails, error: retrieveError } = await resend.emails.receiving.get(email_id);
      
      if (retrieveError) {
        console.error("Error retrieving email content:", retrieveError);
        // Fallback to payload data if available
        htmlContent = payload.data.html || "";
        textContent = payload.data.text || "";
      } else if (emailDetails) {
        console.log("Successfully retrieved email content");
        htmlContent = emailDetails.html || "";
        textContent = emailDetails.text || "";
      }
   

    let attachmentsToForward: any[] = [];

    try {
      // 1. Fetch the raw email (EML)
      const { data: rawEmail } = await resend.emails.getRaw(email_id);

      // 2. Parse the MIME email
      const parsed = await parse(rawEmail);

      // parsed.attachments contains full attachments with content
      const processed = parsed.attachments.map((att: any) => ({
        filename: att.filename,
        content: att.content.toString("base64")
      }));

      attachmentsToForward = processed;

      console.log("Extracted", processed.length, "attachments from EML");
    } catch (e) {
      console.error("Error extracting attachments from raw MIME:", e);
    }



    let fromAddress = "contact@anyimadusuites.com";
    if (recipients && recipients.length > 0) {
      fromAddress = recipients[0];
    }

    console.log(`Forwarding email from: ${fromAddress} (Reply-To: ${sender})`);
    console.log(`Attachments to forward: ${attachmentsToForward.length}`);

    // Forward the email
    const { data, error } = await resend.emails.send({
      from: `Anyimadu Suites <${fromAddress}>`,
      to: ["anyimadudev@gmail.com"], 
      subject: initialSubject, 
      html: htmlContent,
      text: textContent,
      replyTo: sender,
      attachments: attachmentsToForward,
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
  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
