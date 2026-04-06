const puppeteer = require("puppeteer")

async function captureScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 })

  // Navigate to the local dev server
  await page.goto("http://localhost:3000", {
    waitUntil: "networkidle0",
    timeout: 60000,
  })

  // Wait for content to load
  await page.waitForTimeout(2000)

  // Take screenshot
  await page.screenshot({ path: "screenshot.png", fullPage: true })

  console.log("Screenshot saved to screenshot.png")

  await browser.close()
}

captureScreenshot().catch(console.error)
