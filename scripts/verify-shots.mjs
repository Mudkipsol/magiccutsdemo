import puppeteer from 'puppeteer-core'

const CHROME = '.chrome/chrome-linux64/chrome'
const BASE = 'http://localhost:4174'
const OUT = 'shots'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})

async function shot(name, url, w, h, full = false) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2200))
  if (full) {
    await page.addStyleTag({ content: '[style*="opacity"]{opacity:1 !important;transform:none !important}' })
    await new Promise(r => setTimeout(r, 400))
  }
  await page.screenshot({ path: `${OUT}/fix-${name}.png`, fullPage: full })
  console.log('captured', name)
  await page.close()
}

await shot('hero',     BASE + '/', 1440, 900)
await shot('full',     BASE + '/', 1440, 900, true)
await shot('mobile',   BASE + '/', 390,  844, true)
await shot('booking',  BASE + '/book', 1440, 900)

await browser.close()
