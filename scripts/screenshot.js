// puppeteer no es dependencia del proyecto (engorda los installs con Chrome).
// Se resuelve desde la instalación local si existe y, si no, desde la global
// (`pnpm add -g puppeteer` o `npm i -g puppeteer`).
function loadPuppeteer() {
  try {
    return require("puppeteer")
  } catch {
    const { execSync } = require("node:child_process")
    const { createRequire } = require("node:module")
    const path = require("node:path")
    for (const cmd of ["pnpm root -g", "npm root -g"]) {
      try {
        const root = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
          .toString()
          .trim()
        if (root) return createRequire(path.join(root, "noop.js"))("puppeteer")
      } catch {
        /* siguiente gestor */
      }
    }
    throw new Error(
      "puppeteer no encontrado. Instálalo globalmente: pnpm add -g puppeteer"
    )
  }
}

const puppeteer = loadPuppeteer()

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
