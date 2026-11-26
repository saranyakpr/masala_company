import type { Product } from '@/types';
import { productImage } from '@/data/images';
import { cn } from '@/utils/cn';

interface ProductPhotoProps {
  product: Pick<Product, 'slug' | 'name'>;
  /** `sizes` attribute so the browser picks the right srcset width. */
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/** The client's studio photograph of a product jar. */
export function ProductPhoto({ product, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw', priority, className }: ProductPhotoProps) {
  const img = productImage(product.slug);
  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={`${product.name} in a glass jar`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchpriority: 'high' } : {})}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
