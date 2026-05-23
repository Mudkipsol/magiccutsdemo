import puppeteer from 'puppeteer-core'
const CHROME = '.chrome/chrome-linux64/chrome'
const BASE = 'http://localhost:4181'
const OUT = 'shots'
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'shell',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--force-color-profile=srgb'],
})

async function getPage(w, h) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  // suppress popup via sessionStorage
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('mc_popup_dismissed', '1'))
  return page
}

async function shot(name, url, w, h, scrollY = 0) {
  const page = await getPage(w, h)
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2600))
  if (scrollY) { await page.evaluate(y => window.scrollTo(0,y), scrollY); await new Promise(r => setTimeout(r, 700)) }
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('captured', name)
  await page.close()
}

async function full(name, url, w) {
  const page = await getPage(w, 900)
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise(r => setTimeout(r, 2600))
  await page.addStyleTag({ content: '[style*="opacity"]{opacity:1 !important;transform:none !important}' })
  await new Promise(r => setTimeout(r, 500))
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  console.log('captured', name)
  await page.close()
}

await shot('anim-hero',     BASE + '/', 1440, 900)
await shot('anim-services', BASE + '/', 1440, 900, 1050)
await shot('anim-team',     BASE + '/', 1440, 900, 2500)
await shot('anim-process',  BASE + '/', 1440, 900, 3700)
await shot('anim-mobile',   BASE + '/', 390, 844)
await full('anim-full',     BASE + '/', 1440)
await browser.close()
