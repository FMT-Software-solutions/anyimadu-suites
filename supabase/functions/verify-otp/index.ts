import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
})

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*"
  const headers = corsHeaders(origin)
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...headers, "Content-Type": "application/json" } })
  }
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: "Supabase env not set" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const { email, otp } = await req.json()
    if (typeof email !== "string" || typeof otp !== "string") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const client = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await client.auth.verifyOtp({ email, token: otp, type: "recovery" })
    if (error || !data?.session) {
      return new Response(JSON.stringify({ error: error?.message ?? "Invalid or expired code" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }
    const { access_token, refresh_token } = data.session
    return new Response(JSON.stringify({ access_token, refresh_token }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})

