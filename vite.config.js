import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { FontaineTransform } from 'fontaine'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

// Generates metric-adjusted fallback @font-face rules ("Inter fallback",
// "FuturaNowHeadline fallback") so the system fallback occupies the same space
// as the real font. Eliminates the font-swap reflow that was the main CLS source.
// The generated family names are wired into the font stacks in tailwind.config.js.
const fontaine = FontaineTransform.vite({
  fallbacks: ['Arial'],
  // FuturaNow lives in public/ and is referenced by an absolute web path
  // (/fonts/...), which fontaine can't resolve on disk by default. Map it to the
  // real file so its metrics can be read. Relative @fontsource (Inter) urls are
  // resolved by fontaine itself and never reach this function.
  resolvePath: (path) =>
    path.startsWith('/fonts/')
      ? pathToFileURL(resolve(rootDir, 'public', path.slice(1)))
      : path,
})

// Inlines the entry CSS into index.html as a <style> tag and drops the emitted
// .css file + its <link>. Removes the render-blocking stylesheet request so first
// paint no longer waits on a separate round trip.
function inlineEntryCss() {
  return {
    name: 'inline-entry-css',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html
      let result = html
      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (!fileName.endsWith('.css') || chunk.type !== 'asset') continue
        const esc = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const linkRe = new RegExp(`<link[^>]*?href="/${esc}"[^>]*?>`)
        if (!linkRe.test(result)) continue // only inline CSS actually linked in the HTML
        result = result.replace(linkRe, '')
        result = result.replace('</head>', `<style>${chunk.source}</style></head>`)
        delete ctx.bundle[fileName]
      }
      return result
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [fontaine, react(), inlineEntryCss()],
  server: {
    host: "0.0.0.0",
    port: "3000"
  }
})
