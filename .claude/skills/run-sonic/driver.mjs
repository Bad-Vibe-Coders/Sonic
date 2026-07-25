// Playwright driver for the Sonic frontend (drives the real running app,
// not a mock). Requires the backend (uvicorn :8000) and frontend (vite
// :5180) to already be up — see SKILL.md "Run (agent path)".
//
// Usage: node .claude/skills/run-sonic/driver.mjs <script.json>
// where script.json is a list of steps, e.g.:
//   [{"nav":"/app/billing"}, {"waitFor":"text=Billing & plan"}, {"shot":"billing"}]
//
// Run from frontend/ so `import { chromium } from 'playwright'` resolves
// (playwright is a frontend devDependency, not hoisted to repo root).
//
// Steps:
//   {"nav": "/path"}                 goto FRONTEND_BASE + path
//   {"waitFor": "text=Foo"}          wait for a Playwright text/css selector
//   {"click": "button:has-text(X)"}  click a selector
//   {"fill": ["selector", "value"]}  fill an input
//   {"shot": "name"}                 screenshot -> SHOT_DIR/name.png
//   {"wait": 1000}                   fixed wait in ms (avoid unless polling isn't possible)

import fs from 'fs'

// Playwright is a frontend devDependency, not hoisted to repo root, and
// Node ESM resolves node_modules relative to the *importing file's* path
// (not cwd) — so a bare `import 'playwright'` fails when this driver lives
// under .claude/skills/. Resolve it explicitly against the frontend dir.
const FRONTEND_DIR = process.env.FRONTEND_DIR || new URL('../../../frontend', import.meta.url).pathname
const { chromium } = await import(`${FRONTEND_DIR}/node_modules/playwright/index.mjs`)

const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:5180'
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/sonic-screenshots'
fs.mkdirSync(SHOT_DIR, { recursive: true })

const scriptPath = process.argv[2]
if (!scriptPath) {
  console.error('usage: node driver.mjs <script.json>')
  process.exit(1)
}
const steps = JSON.parse(fs.readFileSync(scriptPath, 'utf8'))

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', err => errors.push('pageerror: ' + err.message))

for (const step of steps) {
  if (step.nav) {
    console.log('nav', step.nav)
    await page.goto(`${FRONTEND_BASE}${step.nav}`, { waitUntil: 'domcontentloaded' })
  } else if (step.waitFor) {
    console.log('waitFor', step.waitFor)
    await page.waitForSelector(step.waitFor, { timeout: 15000 })
  } else if (step.click) {
    console.log('click', step.click)
    await page.click(step.click)
  } else if (step.fill) {
    const [sel, val] = step.fill
    console.log('fill', sel, val)
    await page.fill(sel, val)
  } else if (step.shot) {
    await page.screenshot({ path: `${SHOT_DIR}/${step.shot}.png` })
    console.log('shot ->', `${SHOT_DIR}/${step.shot}.png`)
  } else if (step.wait) {
    await page.waitForTimeout(step.wait)
  }
}

console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
await browser.close()
