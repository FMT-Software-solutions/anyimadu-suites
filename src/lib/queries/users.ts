import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { type Role } from '@/lib/permissions'

export interface User {
  id: string
  email: string
  phone?: string
  role: Role | 'user'
  firstName?: string
  lastName?: string
  lastSignIn?: string
  createdAt: string
  bannedUntil?: string
  user_metadata: any
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('list-users', {
          body: { page: 1, perPage: 1000 } 
      })
      if (error) throw error
      return data.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          phone: u.phone || u.user_metadata?.phone,
          role: u.role,
          firstName: u.user_metadata?.firstName || u.user_metadata?.name?.split(' ')[0] || '',
          lastName: u.user_metadata?.lastName || u.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
          lastSignIn: u.last_sign_in_at,
          createdAt: u.created_at,
          bannedUntil: u.banned_until,
          user_metadata: u.user_metadata
      })) as User[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: any) => {
        // data should include email, firstName, lastName, role, etc.
        // We use create-admin-user for admins, but what about create-super-admin?
        // Or generic create?
        // The user said "super_admins can create admins... admins can create only users with lower roles"
        // We have `create-admin-user` edge function. Let's use that for now.
        // It handles creating 'admin', 'editor' etc.
        // But for super_admin creation? Maybe 'create-super-admin-user'?
        
        let func = 'create-admin-user'
        if (data.role === 'super_admin') {
            func = 'create-super-admin-user'
        }
        
        const { data: res, error } = await supabase.functions.invoke(func, {
            body: {
                ...data,
                name: `${data.firstName} ${data.lastName}`.trim(),
                loginUrl: window.location.origin + '/admin/login'
            }
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)
        return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
        const { data: res, error } = await supabase.functions.invoke('update-user', {
            body: {
                user_id: id,
                ...data
            }
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)
        return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
        const { data: res, error } = await supabase.functions.invoke('delete-user', {
            body: { user_id: id }
        })
        if (error) throw error
        if (res.error) throw new Error(res.error)
        return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
