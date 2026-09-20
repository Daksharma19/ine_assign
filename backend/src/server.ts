import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { scrapeProduct } from "./services/scraper.service.js";

const PORT = env.port;
app.get("/scrape/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }
  try {
    const result = await scrapeProduct(productId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to scrape product" });
  }
});
app.get("/", (_req, res) => {
  res.json({
    message: "Hello World",
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
