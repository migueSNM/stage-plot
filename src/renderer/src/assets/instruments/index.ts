/**
 * Instrument SVG image registry.
 * SVG files are imported as URLs (via Vite ?url) and pre-loaded as HTMLImageElement.
 * getInstrumentImage(type) returns the cached image or undefined (falls back to ICON_BODIES path).
 */

// Vite glob: eagerly imports all .svg files in this directory as URLs
const _svgModules = import.meta.glob('./*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// Map: 'guitar_electric' → '/assets/instruments/guitar_electric.svg?...'
export const INSTRUMENT_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(_svgModules).map(([path, url]) => [
    path.replace('./', '').replace('.svg', ''),
    url as string,
  ])
)

// Module-level image cache (loaded once on preload)
const _cache = new Map<string, HTMLImageElement>()
let _promise: Promise<void> | null = null

export function preloadInstrumentImages(): Promise<void> {
  if (_promise) return _promise
  _promise = Promise.all(
    Object.entries(INSTRUMENT_URLS).map(
      ([key, url]) =>
        new Promise<void>((resolve) => {
          const img = new window.Image()
          img.onload = () => {
            _cache.set(key, img)
            resolve()
          }
          img.onerror = () => resolve() // silent fail — falls back to path rendering
          img.src = url
        })
    )
  ).then(() => undefined)
  return _promise
}

/** Returns the cached HTMLImageElement for the given instrument type, or undefined if not loaded yet. */
export function getInstrumentImage(type: string): HTMLImageElement | undefined {
  return _cache.get(type)
}
