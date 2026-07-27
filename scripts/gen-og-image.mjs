// Generates public/og-image.png (1200×630) from the site's SVG logo.
// Runs before every build so any logo update flows into the share preview
// automatically. Uses sharp to rasterize a composited SVG.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const W = 1200
const H = 630
const BG = '#0c0c0c'
const TAGLINE = 'Live poker tracker for the table'

// The site's white-fill wordmark. Its viewBox is 95×34, so we scale up while
// keeping aspect ratio. Target width ~640 → height ~229 keeps the logo
// prominent while leaving room for the tagline and enough safe-area margin
// for platforms that crop the edges (~1080×550 safe area).
const LOGO_TARGET_W = 640
const LOGO_SRC = readFileSync(join(root, 'public', 'logo_v2.svg'), 'utf8')

// Extract the inner viewBox so we can compute the scaled height.
const vb = /viewBox="([\d.\s-]+)"/i.exec(LOGO_SRC)
if (!vb) throw new Error('logo_v2.svg has no viewBox')
const [, , vbW, vbH] = vb[1].split(/\s+/).map(Number)
const logoH = Math.round((LOGO_TARGET_W / vbW) * vbH)
const logoX = Math.round((W - LOGO_TARGET_W) / 2)
// Slight upward bias — the logo is the focal point; tagline sits below it.
const logoY = Math.round((H - logoH) / 2) - 40

// Strip the outer <svg …>…</svg> wrapper and re-emit the inner nodes inside
// our own <svg> at the target size, so the browser doesn't see two <svg>
// elements. Simpler: nest the whole thing inside a <g transform="…">.
const innerSvg = LOGO_SRC
  .replace(/^\s*<\?xml[^>]*>\s*/i, '')
  .replace(/^\s*<svg[^>]*>/i, '')
  .replace(/<\/svg>\s*$/i, '')

const scale = LOGO_TARGET_W / vbW

const composite = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <g transform="translate(${logoX} ${logoY}) scale(${scale})">
    ${innerSvg}
  </g>
  <text
    x="${W / 2}"
    y="${logoY + logoH + 72}"
    text-anchor="middle"
    fill="rgba(255,255,255,0.62)"
    font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="36"
    font-weight="400"
    letter-spacing="-0.5">${TAGLINE}</text>
</svg>`

await sharp(Buffer.from(composite))
  .png()
  .toFile(join(root, 'public', 'og-image.png'))

console.log(`og-image.png written: ${W}×${H}`)
