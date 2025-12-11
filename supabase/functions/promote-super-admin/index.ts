import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const SPECIAL_EMAIL = "anyimadudev@gmail.com"

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
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Supabase env not set" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }

  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } }, auth: { autoRefreshToken: false, persistSession: false } })
    const { data: userRes, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: userErr?.message ?? "User not found" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
    }
    const user = userRes.user
    if ((user.email || "").toLowerCase() !== SPECIAL_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const currentRoles = (user.app_metadata as any)?.roles
    const nextRoles = Array.isArray(currentRoles) ? Array.from(new Set(["super_admin", ...currentRoles])) : ["super_admin"]
    const nextAppMeta = { ...(user.app_metadata || {}), user_type: "admin", role: "super_admin", roles: nextRoles }
    const { error: updErr } = await adminClient.auth.admin.updateUserById(user.id, { app_metadata: nextAppMeta as any })
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
