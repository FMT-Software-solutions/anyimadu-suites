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
    const requesterRoleRaw = Array.isArray(r) ? r.find((x: any) => allowedRoles.includes(String(x))) : r
    const requesterRole = String(requesterRoleRaw || "").toLowerCase()
    
    if (!allowedRoles.includes(requesterRole)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
    }

    const { user_id, email, firstName, lastName, phone, role, password } = await req.json()
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

    // RBAC: Edit permissions
    if (requesterRole === 'admin') {
        if (targetUser.id !== me.user.id && (targetRole === 'admin' || targetRole === 'super_admin')) {
             return new Response(JSON.stringify({ error: "Admins cannot edit other admins or super admins" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
        }
    }
    if (requesterRole === 'super_admin') {
        if (targetRole === 'super_admin') {
             return new Response(JSON.stringify({ error: "Super admins cannot be edited" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
        }
    }

    // RBAC: Role update permissions
    if (role) {
        const newRole = String(role).toLowerCase()
        if (requesterRole === 'admin' && (newRole === 'admin' || newRole === 'super_admin')) {
             const isSelf = targetUser.id === me.user.id;
             if (!(isSelf && newRole === 'admin')) {
                 return new Response(JSON.stringify({ error: "Admins cannot promote users to admin or super_admin" }), { status: 403, headers: { ...headers, "Content-Type": "application/json" } })
             }
        }
        if (requesterRole === 'super_admin' && newRole === 'super_admin') {
             // Maybe allow? But usually dangerous.
        }
    }

    const attributes: any = {}
    if (email) attributes.email = email
    if (password) attributes.password = password
    
    if (firstName || lastName || phone) {
        attributes.user_metadata = {
            ...targetUser.user_metadata,
        }
        if (firstName) attributes.user_metadata.firstName = firstName
        if (lastName) attributes.user_metadata.lastName = lastName
        if (phone) attributes.user_metadata.phone = phone
        
        const f = firstName || targetUser.user_metadata.firstName || ""
        const l = lastName || targetUser.user_metadata.lastName || ""
        if (f || l) attributes.user_metadata.name = `${f} ${l}`.trim()
    }

    if (role) {
        const newRole = String(role).toLowerCase()
        const currentAppMeta = targetUser.app_metadata || {}
        attributes.app_metadata = {
            ...currentAppMeta,
            role: newRole,
            roles: [newRole],
            user_type: ['super_admin', 'admin', 'editor', 'sales_rep', 'read_only'].includes(newRole) ? 'admin' : 'user'
        }
    }

    const { error: updErr } = await adminClient.auth.admin.updateUserById(user_id, attributes)
    if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...headers, "Content-Type": "application/json" } })

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...headers, "Content-Type": "application/json" } })
  }
})
