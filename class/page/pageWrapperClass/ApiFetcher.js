class ApiFetcher {
  constructor(cookieManager = null) {
    this.cookieManager = cookieManager;
  }

  async fetch(page, apiURL) {
    if (!page) throw new Error("Page not initialized");
    const cookieHeader = this.cookieManager?.getHeader() || "";

    try {
      const data = await page.evaluate(async ({ apiURL, cookieHeader }) => {
        const res = await fetch(apiURL, {
          headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent": navigator.userAgent,
            Cookie: cookieHeader,
            Referer: location.href,
          },
          credentials: "same-origin",
        });

        // ❌ Filter out invalid responses
        if (!res.ok) return null;

        // ✅ Return only JSON data
        return await res.json().catch(() => null);
      }, { apiURL, cookieHeader });

      return data || null; // only valid data
    } catch(err) {
      console.log(JSON.stringify(err));
      return null; // any error returns null
    }
  }
}

module.exports = { ApiFetcher };
