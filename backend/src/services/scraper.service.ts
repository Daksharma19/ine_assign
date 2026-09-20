import { chromium } from "playwright";

const STORE_URL = "https://demo.inelabteamdev.com";

export async function scrapeProduct(productId: number) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    console.log("Opening product page...");

    await page.goto(`${STORE_URL}/product/${productId}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    console.log("Page loaded");

    // -----------------------------
    // 1. Handle consent dialog
    // -----------------------------

    const acceptButton = page.getByRole("button", {
      name: /^accept$/i,
    });

    if (await acceptButton.isVisible().catch(() => false)) {
      console.log("Consent dialog found. Accepting...");
      await acceptButton.click();
      await page.waitForTimeout(500);
    }

    // -----------------------------
    // 2. Hover price section
    // -----------------------------

    console.log("Looking for Price hidden...");

    const priceHidden = page.getByText("Price hidden", {
      exact: true,
    });

    await priceHidden.waitFor({
      state: "visible",
      timeout: 10_000,
    });

    console.log("Hovering price area...");

    await priceHidden.hover();

    // -----------------------------
    // 3. Wait for Reveal Price
    // -----------------------------

    const revealButton = page.getByRole("button", {
      name: /reveal price/i,
    });

    console.log("Waiting for Reveal Price to become enabled...");


    console.log("Reveal Price is enabled");

    // -----------------------------
    // 4. Click
    // -----------------------------

    await revealButton.click();

    console.log("Reveal Price clicked");

    // -----------------------------
    // 5. Wait for dynamic price
    // -----------------------------

    await page.waitForFunction(() => {
      const body = document.body.innerText;

      return (
        !body.includes("Loading current price...") &&
        /₹[\d,]+/.test(body)
      );
    }, { timeout: 15_000 });

    console.log("Price loaded");

    const bodyText = await page.locator("body").innerText();

    console.log(bodyText);

    return {
      productId,
      bodyText,
    };

  } finally {
    await browser.close();
  }
}