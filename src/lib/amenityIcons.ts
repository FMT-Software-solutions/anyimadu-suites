import type { LucideIcon } from 'lucide-react'
import {
  Wifi,
  Coffee,
  Bed,
  Car,
  Tv,
  Bath,
  AirVent,
  Utensils,
  Shield,
  Waves,
  Dumbbell,
  Users,
  Leaf,
  Wind,
  TreePine,
  Mountain,
  Sun,
  Flame,
  Briefcase,
  Check,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  wifi: Wifi,
  coffee: Coffee,
  bed: Bed,
  car: Car,
  tv: Tv,
  bath: Bath,
  air_vent: AirVent,
  utensils: Utensils,
  shield: Shield,
  waves: Waves,
  dumbbell: Dumbbell,
  users: Users,
  check: Check,
  generic: Check,
  parking: Car,
  breakfast: Utensils,
  restaurant: Utensils,
  security: Shield,
  pool: Waves,
  gym: Dumbbell,
  air_conditioning: AirVent,
  garden_view: TreePine,
  mountain_view: Mountain,
  sun_terrace: Sun,
  heater: Flame,
  fan: Wind,
  workspace: Briefcase,
  eco: Leaf,
  sea_view: Waves,
}

export const iconForKey = (key: string | null): LucideIcon | null => {
  if (!key) return null
  const k = key.toLowerCase()
  return map[k] ?? null
}

export const amenityIconKeys = Object.keys(map)

export const getAmenityIcon = (key: string | null): LucideIcon => {
  if (!key) return Check
  const k = key.toLowerCase()
  return map[k] ?? Check
}
