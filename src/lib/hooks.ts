import { useQuery } from '@tanstack/react-query'

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
  
  // Sort countries alphabetically by common name
  return data.sort((a: Country, b: Country) => 
    a.name.common.localeCompare(b.name.common)
  )
}

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - countries don't change often
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}