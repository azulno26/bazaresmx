import { getBazaresFromSheets } from '@/src/lib/sheets'

export default async function sitemap() {
  const bazares = await getBazaresFromSheets()
  const bazarUrls = bazares.map((b: any) => ({
    url: `https://www.bazaresmx.com.mx/bazares/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://www.bazaresmx.com.mx',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://www.bazaresmx.com.mx/bazares',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...bazarUrls,
  ]
}
