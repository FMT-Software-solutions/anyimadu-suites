import { useEffect } from 'react'

type SEOProps = {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: string
  canonical?: string
  twitterCard?: 'summary' | 'summary_large_image'
  robots?: string
  jsonLd?: Record<string, any> | Record<string, any>[]
}

const ensureMeta = (attr: 'name' | 'property', key: string) => {
  let el = document.head.querySelector(`meta[${attr}='${key}']`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  return el
}

const ensureLink = (rel: string) => {
  let el = document.head.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  return el
}

export const useSEO = (props: SEOProps) => {
  useEffect(() => {
    const title = props.title || 'Anyimadu Suites'
    const description = props.description || 'Experience organic comfort, fresh air, and spacious suites at Anyimadu Suites.'
    const image = props.image || 'https://res.cloudinary.com/dkolqpqf2/image/upload/v1764083597/Screenshot_2025-11-25_151158_mrhzxy.png'
    const url = props.canonical || window.location.href
    const type = props.type || 'website'
    const card = props.twitterCard || 'summary_large_image'
    const robots = props.robots || 'index, follow'

    document.title = title
    const descEl = ensureMeta('name', 'description')
    descEl.setAttribute('content', description)
    if (props.keywords && props.keywords.length > 0) {
      const kwEl = ensureMeta('name', 'keywords')
      kwEl.setAttribute('content', props.keywords.join(', '))
    }
    const canEl = ensureLink('canonical')
    canEl.setAttribute('href', url)
    const robEl = ensureMeta('name', 'robots')
    robEl.setAttribute('content', robots)

    const ogTitle = ensureMeta('property', 'og:title')
    ogTitle.setAttribute('content', title)
    const ogDesc = ensureMeta('property', 'og:description')
    ogDesc.setAttribute('content', description)
    const ogType = ensureMeta('property', 'og:type')
    ogType.setAttribute('content', type)
    const ogUrl = ensureMeta('property', 'og:url')
    ogUrl.setAttribute('content', url)
    const ogImg = ensureMeta('property', 'og:image')
    ogImg.setAttribute('content', image)
    const ogSite = ensureMeta('property', 'og:site_name')
    ogSite.setAttribute('content', 'Anyimadu Suites')

    const twCard = ensureMeta('name', 'twitter:card')
    twCard.setAttribute('content', card)
    const twTitle = ensureMeta('name', 'twitter:title')
    twTitle.setAttribute('content', title)
    const twDesc = ensureMeta('name', 'twitter:description')
    twDesc.setAttribute('content', description)
    const twImg = ensureMeta('name', 'twitter:image')
    twImg.setAttribute('content', image)

    // Structured data
    // Remove previous JSON-LD added by this hook
    document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.parentElement?.removeChild(n))
    if (props.jsonLd) {
      const payload = Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd]
      payload.forEach((obj) => {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.setAttribute('data-seo-jsonld', '1')
        s.textContent = JSON.stringify(obj)
        document.head.appendChild(s)
      })
    }
  }, [props.title, props.description, props.keywords, props.image, props.type, props.canonical, props.twitterCard, props.robots])
}
