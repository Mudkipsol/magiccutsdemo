import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
mkdirSync('shots', { recursive: true })
const b = await puppeteer.launch({ executablePath: '.chrome/chrome-linux64/chrome', headless: 'shell', args: ['--no-sandbox','--disable-dev-shm-usage'] })

async function shot(name, url, width, scrollTo) {
  const p = await b.newPage()
  await p.setViewport({ width, height: 900, deviceScaleFactor: 2 })
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 1800))
  if (scrollTo) {
    await p.evaluate(async (y) => { window.scrollTo(0,y); await new Promise(r=>setTimeout(r,800)) }, scrollTo)
  }
  await p.addStyleTag({ content: '[style*="opacity"]{opacity:1!important;transform:none!important}' })
  await new Promise(r => setTimeout(r, 500))
  await p.screenshot({ path: `shots/${name}.png`, fullPage: false })
  console.log(name)
  await p.close()
}

const base = 'http://localhost:4173'
// Home page sections at different scroll depths
await shot('critique-hero',       base + '/', 1440, 0)
await shot('critique-services',   base + '/', 1440, 950)
await shot('critique-team',       base + '/', 1440, 2100)
await shot('critique-experience', base + '/', 1440, 3400)
await shot('critique-process',    base + '/', 1440, 4600)
await shot('critique-testimonials',base + '/', 1440, 5700)
await shot('critique-booking',    base + '/', 1440, 6800)
await shot('critique-visit',      base + '/', 1440, 8200)
await shot('critique-footer',     base + '/', 1440, 9200)
// Booking flow steps
await shot('critique-book1', base + '/book', 1440, 0)

await b.close()
console.log('done')
