import React from 'react'
import { getAmenityIcon } from '@/lib/amenityIcons'
import { cn } from '@/lib/utils'

interface Props {
  iconKey: string | null | undefined
  className?: string
  title?: string
}

export const AmenityIcon: React.FC<Props> = ({ iconKey, className, title }) => {
  const Icon = getAmenityIcon(iconKey ?? null)
  return (
    <span title={title}>
      <Icon className={cn('h-4 w-4', className)} />
    </span>
  )
}
