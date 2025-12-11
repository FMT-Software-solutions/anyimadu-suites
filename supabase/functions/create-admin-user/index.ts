import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "https://esm.sh/resend@2.0.0"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const resendKey = Deno.env.get("RESEND_API_KEY")
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "Anyimadu Suites <auth@anyimadusuites.com>"
const resend = new Resend(resendKey)

const SPECIAL_EMAIL = "anyimadudev@gmail.com"
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const genPwd = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+-={}[]"
  let out = ""
  for (let i = 0; i < 16; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*"
  const headers = corsHeaders(origin)
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } })
  }
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Supabase env not set" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }

  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const body = await req.json()
    const email: string = body?.email ?? ""
    const name: string = body?.name ?? ""
    const loginUrl: string = body?.loginUrl ?? ""
    const roleParam: string = String(body?.role ?? "").toLowerCase()
    const allowedNewRoles = ["admin", "editor", "sales_rep", "read"]
    if (!emailRegex.test(email) || name.trim().length < 2 || !allowedNewRoles.includes(roleParam)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } }, auth: { autoRefreshToken: false, persistSession: false } })
    const { data: me, error: meErr } = await userClient.auth.getUser()
    if (meErr || !me?.user) {
      return new Response(JSON.stringify({ error: meErr?.message ?? "User not found" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
    }
    const callerEmail = (me.user.email || "").toLowerCase()
    const allowedRoles = ["admin", "super_admin"]
    const am: any = me.user.app_metadata
    const um: any = me.user.user_metadata
    const r = am?.role ?? am?.roles ?? um?.role ?? um?.roles
    const isAdmin = Array.isArray(r) ? r.some((x: any) => allowedRoles.includes(String(x))) : allowedRoles.includes(String(r))
    if (!(callerEmail === SPECIAL_EMAIL || isAdmin)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const pwd = genPwd()
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: pwd,
      email_confirm: true,
      user_metadata: { name, first_time_login: true }
    })
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Create failed" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }
    const { error: updErr } = await adminClient.auth.admin.updateUserById(created.user.id, { app_metadata: { user_type: "admin", role: roleParam, roles: [roleParam] } as any })
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    if (resendKey) {
      const { error: sendErr } = await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: "Your Anyimadu Suites admin account",
        html: `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222">
            <p>Hello ${name},</p>
            <p>Your admin account has been created.</p>
            <p><strong>Email:</strong> ${email}<br/><strong>Temporary Password:</strong> ${pwd}</p>
            <p>Please sign in and change your password.</p>
            ${loginUrl ? `<div style="margin-top: 20px;">
              <a href="${loginUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Login</a>
            </div>` : ''}
          </div>
        `,
      })
      if (sendErr) {
        return new Response(JSON.stringify({ error: "Email send failed", password: pwd, user_id: created.user.id }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })
      }
    }

    return new Response(JSON.stringify({ ok: true, password: pwd, user_id: created.user.id }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
