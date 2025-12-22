import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export interface Country {
  name: {
    common: string
    official: string
    nativeName?: {
      [key: string]: {
        official: string
        common: string
      }
    }
  }
  flags: {
    png: string
    svg: string
    alt: string
  }
}

const fetchCountries = async (): Promise<Country[]> => {
  const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags')
  
  if (!response.ok) {
    throw new Error('Failed to fetch countries')
  }
  
  const data = await response.json()
  
  return data.sort((a: Country, b: Country) => 
    a.name.common.localeCompare(b.name.common)
  )
}

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  })
}

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

const fetchUsdRate = async (): Promise<number> => {
  const res = await fetch('https://open.er-api.com/v6/latest/GHS')
  if (!res.ok) throw new Error('Failed to fetch USD rate')
  const json = await res.json()
  const rate = json?.rates?.USD
  if (typeof rate !== 'number') throw new Error('USD rate unavailable')
  return rate as number
}

export const useUsdRate = () => {
  return useQuery({
    queryKey: ['usd-rate'],
    queryFn: fetchUsdRate,
    staleTime: 1000 * 60 * 60 * 6,
    refetchInterval: 1000 * 60 * 60 * 6,
  })
}
