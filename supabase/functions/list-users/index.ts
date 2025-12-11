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
    const requesterRole = Array.isArray(r) ? r.find((x: any) => allowedRoles.includes(String(x))) : r
    const isAdmin = allowedRoles.includes(String(requesterRole))

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
    }

    let page = 1
    let perPage = 50
    try {
        const body = await req.json()
        page = body.page || 1
        perPage = body.perPage || 50
    } catch {
        // ignore
    }

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    
    const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers({
        page: page,
        perPage: perPage
    })

    if (listErr) {
        return new Response(JSON.stringify({ error: listErr.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const mappedUsers = users.map(u => {
        const am: any = u.app_metadata
        const um: any = u.user_metadata
        const role = am?.role ?? am?.roles?.[0] ?? um?.role ?? "user"
        return {
            id: u.id,
            email: u.email,
            phone: u.phone,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            role: role,
            user_metadata: um,
            app_metadata: am,
            banned_until: u.banned_until
        }
    })

    const adminRoles = ['super_admin', 'admin', 'editor', 'sales_rep', 'read_only']
    const filteredUsers = mappedUsers.filter(u => {
        const type = u.app_metadata?.user_type ?? u.user_metadata?.user_type
        // Include if explicitly marked as admin type or has an admin role
        return type === 'admin' || adminRoles.includes(u.role)
    })

    return new Response(JSON.stringify({ users: filteredUsers, total: filteredUsers.length }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
