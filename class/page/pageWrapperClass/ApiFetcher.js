class ApiFetcher {
  constructor(cookieManager = null) {
    // this.page = page;
    this.cookieManager = cookieManager;
  }

  async fetch(page,apiURL) {
    if (!page) throw new Error("Page not initialized");
    const cookieHeader = this.cookieManager ? this.cookieManager.getHeader() : "";

    // debugger;
    try {
      return await page.evaluate(
        async ({ apiURL, cookieHeader }) => {
          const res = await fetch(apiURL, {
            headers: {
              Accept: "application/json, text/plain, */*",
              "User-Agent": navigator.userAgent,
              Cookie: cookieHeader,
              Referer: location.href,
            },
            credentials: "same-origin",
          });

          // Throw only if status is 4xx or 5xx
          if (!res.ok) {
            // Include status and text
            const text = await res.text().catch(() => "");
            throw { status: res.status, text };
          }

          return res.json();
        },
        { apiURL, cookieHeader }
      );
    } catch (err) {
      // Check if it's a 4xx error from fetch
      if (err && err.status >= 400 && err.status < 500) {
        console.warn(`⚠️ 4xx Error fetching ${apiURL}: HTTP ${err.status} - ${err.text}`);
        return null; // or return a default value
      }
      // Re-throw other errors
      console.dir(err);
      throw err;
    }
  }
}

module.exports = { ApiFetcher };
