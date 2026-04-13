import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'

function svgToPng(svgPath, outputPath, size) {
  const svg = readFileSync(svgPath, 'utf-8')
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  const png = resvg.render().asPng()
  writeFileSync(outputPath, png)
  console.log(`✓ ${outputPath} (${size}px)`)
}

svgToPng('./public/icon-192.svg', './public/icon-192.png', 192)
svgToPng('./public/icon-512.svg', './public/icon-512.png', 512)
svgToPng('./public/icon-192.svg', './public/apple-touch-icon.png', 180)
console.log('All icons generated.')
