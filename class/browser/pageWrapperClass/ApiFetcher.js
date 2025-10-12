class ApiFetcher {
  constructor(page, cookieManager = null) {
    this.page = page;
    this.cookieManager = cookieManager;
  }

  async fetch(apiURL) {
    if (!this.page) throw new Error("Page not initialized");
    const cookieHeader = this.cookieManager ? this.cookieManager.getHeader() : "";
    
    return await this.page.evaluate(
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
      { apiURL, cookieHeader }
    );
  }
}

module.exports = { ApiFetcher };
