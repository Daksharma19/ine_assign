import { scrapeProduct } from "./services/scraper.service.js";

scrapeProduct(390)
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);