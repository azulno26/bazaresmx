/**
 * Transforms a Cloudinary URL to include automatic format and quality optimizations.
 * This replaces Vercel's Next.js Image Optimization (which has a 402 limit on Hobby plan)
 * with Cloudinary's own free transformations.
 * 
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Transformed URL with Cloudinary optimizations
 */
export function cloudinaryUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: number; blur?: boolean } = {}
): string {
  if (!url) return '';
  
  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  const { width, quality = 75, blur } = options;

  const transforms: string[] = ['f_auto']; // Auto format (webp/avif)
  
  if (width) transforms.push(`w_${width}`);
  transforms.push(`q_${quality}`);
  if (blur) transforms.push('e_blur:800');

  // Insert transforms after /upload/
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
