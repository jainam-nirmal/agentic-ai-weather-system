// utils/browserHelper.js
// Shared browser lifecycle helpers for UI tests

import { chromium } from '@playwright/test';

export async function launchBrowser(headless = false) {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
}

export async function closeBrowser(browser, context) {
  if (context) await context.close();
  if (browser) await browser.close();
}
