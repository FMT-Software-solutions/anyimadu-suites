import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
const supabaseUrl = Deno.env.get("SUPABASE_URL")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "Anyimadu Suites <security@anyimadusuites.com>"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*"
  const headers = corsHeaders(origin)
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } })
  }
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Supabase env not set" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const { email } = await req.json()
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const cookie = req.headers.get("cookie") ?? ""
    const lastTs = (() => {
      const m = /otp_ts=(\d+)/.exec(cookie)
      return m ? Number(m[1]) : 0
    })()
    const now = Date.now()
    if (lastTs && now - lastTs < 60_000) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { ...headers, "Content-Type": "application/json", "Set-Cookie": `otp_ts=${lastTs}; Path=/; HttpOnly; Secure; SameSite=Strict` },
      })
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email })
    if (error) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json", "Set-Cookie": `otp_ts=${now}; Path=/; HttpOnly; Secure; SameSite=Strict` } })
    }
    const otp: string | undefined = (data as any)?.properties?.email_otp ?? (data as any)?.otp

    if (!otp) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json", "Set-Cookie": `otp_ts=${now}; Path=/; HttpOnly; Secure; SameSite=Strict` } })
    }

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Your password reset code",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222">
          <p>Use this code to reset your Anyimadu Suites admin password:</p>
          <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold">${otp}</p>
          <p>This code will expire. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    })
    if (sendError) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const resHeaders = { ...headers, "Content-Type": "application/json", "Set-Cookie": `otp_ts=${now}; Path=/; HttpOnly; Secure; SameSite=Strict` }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: resHeaders })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
