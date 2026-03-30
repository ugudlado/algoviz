const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto("http://localhost:3000/algorithms/bubble-sort/", {
    waitUntil: "networkidle0",
  });

  // Click visualize
  await page.click("#btnVisualize");

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 500));

  await page.screenshot({ path: "screenshot-after.png" });
  await browser.close();
})();
