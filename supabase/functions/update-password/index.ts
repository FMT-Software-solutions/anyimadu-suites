import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
})

const validPassword = (p: string) => {
  if (typeof p !== "string" || p.length < 8) return false
  const hasLower = /[a-z]/.test(p)
  const hasUpper = /[A-Z]/.test(p)
  const hasNum = /[0-9]/.test(p)
  const hasSpecial = /[^a-zA-Z0-9]/.test(p)
  return hasLower && hasUpper && hasNum && hasSpecial
}

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

  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const { password } = await req.json()
    if (!validPassword(password)) {
      return new Response(JSON.stringify({ error: "Weak password" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }
    const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } }, auth: { autoRefreshToken: false, persistSession: false } })
    const { error } = await client.auth.updateUser({ password, data: { first_time_login: false } as any })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }
    await client.auth.signOut()
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
