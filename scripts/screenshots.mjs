import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = '.chrome/chrome-linux64/chrome'
const URL = process.env.SHOT_URL || 'http://localhost:4173'
const OUT = 'shots'
mkdirSync(OUT, { recursive: true })

const shots = [
  { name: 'desktop-full', width: 1440, height: 900, fullPage: true },
  { name: 'desktop-hero', width: 1440, height: 900, fullPage: false },
  { name: 'mobile-full', width: 390, height: 844, fullPage: true, mobile: true },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
  ],
})

for (const s of shots) {
  const page = await browser.newPage()
  await page.setViewport({
    width: s.width,
    height: s.height,
    deviceScaleFactor: 2,
    isMobile: !!s.mobile,
  })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
  // let fonts + entrance animations settle
  await new Promise((r) => setTimeout(r, 2200))
  if (s.fullPage) {
    // Full-page capture resizes the viewport, which re-fires scroll reveals
    // from opacity:0. Force any reveal element visible so the proof shows real content.
    await page.addStyleTag({
      content:
        '[style*="opacity"]{opacity:1 !important;transform:none !important}',
    })
    await new Promise((r) => setTimeout(r, 500))
  }
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.fullPage })
  console.log('captured', s.name)
  await page.close()
}

await browser.close()
console.log('done')
