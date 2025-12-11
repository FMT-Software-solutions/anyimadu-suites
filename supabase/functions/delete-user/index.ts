import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
})

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*"
  const headers = corsHeaders(origin)
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers })

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Supabase env not set" }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }

  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } }, auth: { autoRefreshToken: false, persistSession: false } })
    const { data: me, error: meErr } = await userClient.auth.getUser()
    if (meErr || !me?.user) {
      return new Response(JSON.stringify({ error: meErr?.message ?? "User not found" }), { status: 401, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const allowedRoles = ["admin", "super_admin"]
    const am: any = me.user.app_metadata
    const um: any = me.user.user_metadata
    const r = am?.role ?? am?.roles ?? um?.role ?? um?.roles
    // normalize role
    const requesterRoleRaw = Array.isArray(r) ? r.find((x: any) => allowedRoles.includes(String(x))) : r
    const requesterRole = String(requesterRoleRaw || "").toLowerCase()
    
    if (!allowedRoles.includes(requesterRole)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const { user_id } = await req.json()
    if (!user_id) {
        return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    
    const { data: { user: targetUser }, error: fetchErr } = await adminClient.auth.admin.getUserById(user_id)
    if (fetchErr || !targetUser) {
        return new Response(JSON.stringify({ error: "Target user not found" }), { status: 404, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const tam: any = targetUser.app_metadata
    const tum: any = targetUser.user_metadata
    const targetRoleRaw = tam?.role ?? tam?.roles ?? tum?.role ?? tum?.roles
    const targetRole = String(Array.isArray(targetRoleRaw) ? targetRoleRaw[0] : targetRoleRaw || "user").toLowerCase()

    if (requesterRole === 'admin') {
        if (targetRole === 'admin' || targetRole === 'super_admin') {
             return new Response(JSON.stringify({ error: "Admins cannot delete other admins or super admins" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
        }
    }
    if (requesterRole === 'super_admin') {
        if (targetRole === 'super_admin') {
             return new Response(JSON.stringify({ error: "Super admins cannot be deleted" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
        }
    }

    const { error: delErr } = await adminClient.auth.admin.deleteUser(user_id)
    if (delErr) {
        return new Response(JSON.stringify({ error: delErr.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
