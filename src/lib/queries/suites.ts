import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AmenityRecord, SuiteRecord } from '@/lib/types'

export type SuiteWithRelations = SuiteRecord & {
  amenities: (AmenityRecord & { pivot_id: number })[]
}

const fromSuites = () => supabase.from('suites')
const fromAmenities = () => supabase.from('amenities')
const fromSuiteAmenities = () => supabase.from('suite_amenities')

const mapSuite = (row: any): SuiteWithRelations => {
  const amenities = (row.suite_amenities || []).map((sa: any) => ({
    id: sa.amenities.id,
    name: sa.amenities.name,
    icon_key: sa.amenities.icon_key,
    created_at: sa.amenities.created_at,
    pivot_id: sa.id,
  }))
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    capacity: row.capacity,
    main_image_url: row.main_image_url,
    gallery_urls: row.gallery_urls || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    amenities,
  }
}

export const useSuites = () => {
  return useQuery({
    queryKey: ['suites'],
    queryFn: async () => {
      const { data, error } = await fromSuites()
        .select('*, suite_amenities(*, amenities(*))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(mapSuite) as SuiteWithRelations[]
    },
  })
}

export const useSuite = (id: string | null) => {
  return useQuery({
    queryKey: ['suites', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await fromSuites()
        .select('*, suite_amenities(*, amenities(*))')
        .eq('id', id)
        .single()
      if (error) throw error
      return mapSuite(data)
    },
    enabled: !!id,
  })
}

export const useCreateSuite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      suite: Omit<SuiteRecord, 'id' | 'created_at' | 'updated_at'>
      amenityIds?: number[]
      galleryUrls?: string[]
    }) => {
      const { data, error } = await fromSuites()
        .insert({
          name: payload.suite.name,
          description: payload.suite.description,
          price: payload.suite.price,
          capacity: payload.suite.capacity,
          main_image_url: payload.suite.main_image_url,
          gallery_urls: payload.galleryUrls ?? [],
        })
        .select('*')
        .single()
      if (error) throw error
      const suiteId = data.id as string
      if (payload.amenityIds && payload.amenityIds.length > 0) {
        const rows = payload.amenityIds.map((amenity_id) => ({ suite_id: suiteId, amenity_id }))
        const { error: saErr } = await fromSuiteAmenities().insert(rows)
        if (saErr) throw saErr
      }
      return suiteId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suites'] })
    },
  })
}

export const useUpdateSuite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      id: string
      suite: Partial<Omit<SuiteRecord, 'id' | 'created_at' | 'updated_at'>>
      amenityIds?: number[]
    }) => {
      const { error } = await fromSuites()
        .update({
          name: payload.suite.name,
          description: payload.suite.description,
          price: payload.suite.price,
          capacity: payload.suite.capacity,
          main_image_url: payload.suite.main_image_url,
          gallery_urls: payload.suite.gallery_urls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id)
      if (error) throw error
      if (payload.amenityIds) {
        const { error: delErr } = await fromSuiteAmenities().delete().eq('suite_id', payload.id)
        if (delErr) throw delErr
        const rows = payload.amenityIds.map((amenity_id) => ({ suite_id: payload.id, amenity_id }))
        const { error: insErr } = await fromSuiteAmenities().insert(rows)
        if (insErr) throw insErr
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['suites'] })
      qc.invalidateQueries({ queryKey: ['suites', vars.id] })
    },
  })
}

export const useDeleteSuite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error: saErr } = await fromSuiteAmenities().delete().eq('suite_id', id)
      if (saErr) throw saErr
      const { error } = await fromSuites().delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suites'] })
    },
  })
}

export const useAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const { data, error } = await fromAmenities().select('*').order('name', { ascending: true })
      if (error) throw error
      return (data || []) as AmenityRecord[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export const useCreateAmenity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<AmenityRecord, 'id' | 'created_at'>) => {
      const { data, error } = await fromAmenities()
        .insert({ name: payload.name, icon_key: payload.icon_key ?? null })
        .select('*')
        .single()
      if (error) throw error
      return data.id as number
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['amenities'] })
    },
  })
}

export const useUpdateAmenity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { id: number; amenity: Partial<Omit<AmenityRecord, 'id' | 'created_at'>> }) => {
      const { error } = await fromAmenities()
        .update({ name: payload.amenity.name, icon_key: payload.amenity.icon_key ?? null })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['amenities'] })
    },
  })
}

export const useDeleteAmenity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error: delPivotErr } = await fromSuiteAmenities().delete().eq('amenity_id', id)
      if (delPivotErr) throw delPivotErr
      const { error } = await fromAmenities().delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['amenities'] })
      qc.invalidateQueries({ queryKey: ['suites'] })
    },
  })
}

export const useSeedAmenities = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rows: { name: string; icon_key: string | null }[]) => {
      const { data, error } = await fromAmenities().select('name')
      if (error) throw error
      const existing = new Set((data || []).map((d: any) => (d.name as string).toLowerCase()))
      const toInsert = rows.filter((r) => !existing.has(r.name.toLowerCase()))
      if (toInsert.length === 0) return
      const { error: insErr } = await fromAmenities().insert(toInsert)
      if (insErr) throw insErr
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['amenities'] })
    },
  })
}

// image add/remove replaced by updating gallery_urls on suites
