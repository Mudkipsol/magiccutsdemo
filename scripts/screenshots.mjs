import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = '.chrome/chrome-linux64/chrome'
const BASE = process.env.SHOT_URL || 'http://localhost:4173'
const OUT = 'shots'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-color-profile=srgb'],
})

async function shot(name, url, width, height, fullPage = false) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 2, isMobile: width < 800 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2200))
  if (fullPage) {
    await page.addStyleTag({ content: '[style*="opacity"]{opacity:1 !important;transform:none !important}' })
    await new Promise(r => setTimeout(r, 400))
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage })
  console.log('captured', name)
  await page.close()
}

// Home page
await shot('home-hero',    BASE + '/',     1440, 900)
await shot('home-full',    BASE + '/',     1440, 900, true)
await shot('home-mobile',  BASE + '/',     390,  844, true)

// Booking flow
await shot('book-step1',   BASE + '/book', 1440, 900)
await shot('book-mobile',  BASE + '/book', 390,  844)

// Portals
await shot('barber-login', BASE + '/barber',    1440, 900)
await shot('owner-login',  BASE + '/dashboard', 1440, 900)

await browser.close()
console.log('all done')
