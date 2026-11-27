import { useEffect } from 'react'
import { company } from '../data/company'

/** Sets a per-page <title> and meta description. */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${company.name}` : `${company.name} — ${company.tagline}`
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta)
      meta.content =
        description ?? `${company.name} — ${company.category}. ${company.tagline} Pure single spices and signature masala blends.`
  }, [title, description])
}
