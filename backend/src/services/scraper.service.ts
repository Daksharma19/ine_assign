import { chromium } from "playwright";
import { expect } from "playwright/test";

const STORE_URL = "https://demo.inelabteamdev.com";

export async function scrapeProduct(productId: number) {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`https://demo.inelabteamdev.com/product/${productId}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    const acceptButton = page.getByRole("button", {
      name: /accept|allow all/i,
    });

    try {
      await acceptButton.waitFor({
        state: "visible",
        timeout: 10_000,
      });

      await acceptButton.click();

      console.log("Cookie banner handled successfully.");
    } catch {
      console.log("Cookie banner did not appear within 10 seconds.");
    }

    const priceHidden = page.getByText("Price hidden", {
      exact: true,
    });

    await priceHidden.waitFor({
      state: "visible",
      timeout: 10_000,
    });

    await priceHidden.hover();

    const revealButton = page.getByRole("button", {
      name: /reveal price/i,
    });

    await expect(revealButton).toBeEnabled({
      timeout: 10_000,
    });

    await revealButton.click();

    console.log("Reveal Price clicked");

    await page.waitForFunction(
      () => {
        const body = document.body.innerText;

        return (
          !body.includes("Loading current price...") && /₹[\d,]+/.test(body)
        );
      },
      { timeout: 15_000 },
    );

    console.log("Price loaded");

    const bodyText = await page.locator("body").innerText();

    return {
      productId,
      bodyText,
    };
  } finally {
    await browser.close();
  }
}
