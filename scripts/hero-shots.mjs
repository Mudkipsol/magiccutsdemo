import puppeteer from 'puppeteer-core'
const CHROME = '.chrome/chrome-linux64/chrome'
const BASE = 'http://localhost:4178'
const OUT = 'shots'
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
})
async function shot(name, w, h, scrollY = 0) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2500))
  if (scrollY) { await page.evaluate(y => window.scrollTo(0, y), scrollY); await new Promise(r => setTimeout(r, 800)) }
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('captured', name)
  await page.close()
}
await shot('hero-bg',        1440, 900)
await shot('hero-scrolled',  1440, 900, 120)
await shot('hero-mobile',    390, 844)
await browser.close()
