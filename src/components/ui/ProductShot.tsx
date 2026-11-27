import { productById } from '../../data/products'
import { useProductShot, type ShotAngle } from '../three/studio'
import { JarIllustration } from './JarIllustration'

/**
 * A studio photograph of a product, rendered from the real 3D jar.
 * Shows a shimmer while rendering and an SVG jar if WebGL is unavailable.
 */
export function ProductShot({
  id,
  angle = 0,
  className = '',
  alt,
}: {
  id: string
  angle?: ShotAngle
  className?: string
  alt?: string
}) {
  const url = useProductShot(id, angle)
  const product = productById(id)!
  if (url === 'error') return <JarIllustration product={product} className={`${className} p-[12%]`} />
  if (!url)
    return (
      <div className={`${className} relative overflow-hidden`} aria-hidden>
        <div className="absolute inset-[22%_30%] rounded-[30%] bg-cream/[0.04]" />
        <div className="shimmer-line absolute inset-x-0 top-1/2 h-px opacity-40" />
      </div>
    )
  return (
    <img
      src={url}
      alt={alt ?? `${product.name} — 12 SPICES jar${angle === 2 ? ', back label' : angle === 1 ? ', three-quarter view' : ''}`}
      className={`${className} object-contain`}
      draggable={false}
      width={720}
      height={900}
    />
  )
}
