import puppeteer from 'puppeteer-core'
const CHROME = '.chrome/chrome-linux64/chrome'
const BASE = 'http://localhost:4176'
const OUT = 'shots'
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})
async function shot(name, url, w, h, full = false) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 3000))
  if (full) {
    await page.addStyleTag({ content: '[style*="opacity"]{opacity:1 !important;transform:none !important}' })
    await new Promise(r => setTimeout(r, 500))
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log('captured', name)
  await page.close()
}
await shot('photos-full',    BASE + '/', 1440, 900, true)
await shot('photos-team',    BASE + '/', 1440, 900)
await shot('photos-mobile',  BASE + '/', 390, 844, true)
await browser.close()
