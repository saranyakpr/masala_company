export function QtyStepper({
  value,
  onChange,
  label,
  small = false,
  min = 1,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  small?: boolean
  min?: number
}) {
  const btn = `flex items-center justify-center text-cream transition-colors hover:text-gold-soft disabled:opacity-30 ${small ? 'h-8 w-8' : 'h-12 w-12'}`
  return (
    <div className={`inline-flex items-center rounded-full border border-cream/15 ${small ? '' : 'h-12'}`} role="group" aria-label={`Quantity for ${label}`}>
      <button className={btn} onClick={() => onChange(value - 1)} disabled={value <= min && min > 0} aria-label="Decrease quantity">
        −
      </button>
      <span className={`text-center text-sm tabular-nums text-cream ${small ? 'w-6' : 'w-8'}`} aria-live="polite">
        {value}
      </span>
      <button className={btn} onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
