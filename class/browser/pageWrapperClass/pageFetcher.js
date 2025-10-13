// pageFetcherClass.js
class PageFetcher {
  constructor(page) {
    this.page = page; // reference to the Page instance
  }

  /**
   * Retry-safe single API fetch
   */
  async fetchSingleAPI(apiURL, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Make sure page is prepared
        await this.page.preparePage(this.page.page.expiryPage);
        return await this.page.apiFetcher.fetch(apiURL);
      } catch (err) {
        console.warn(`fetchSingleAPI attempt ${attempt + 1} failed: ${err.message}`);
        await this.page.pageManager.close();
        if (attempt === retries - 1) throw err;
      }
    }
  }

  /**
   * Fetch multiple APIs concurrently for a single page
   */
  async fetchMultipleAPIs(pageURL, apiList = []) {
    await this.page.preparePage(pageURL);
    return Promise.all(
      apiList.map(api => this.page.apiFetcher.fetch(api))
    );
  }

  /**
   * Fetch expiry data (from expiryPage + expiryApi)
   */
  async fetchExpiryData() {
    return this.fetchSingleAPI(this.page.api.expiryApi);
  }

  /**
   * Fetch other data concurrently (expiryURL, activeApi, futureApi)
   */
  async fetchOtherData() {
    const pageMap = {
      [this.page.page.expiryPage]: Array.isArray(this.page.arr.expiryURL) ? this.page.arr.expiryURL : [],
      [this.page.page.activePage]: [this.page.api.activeApi, this.page.api.futureApi].filter(Boolean),
    };

    const tasks = Object.entries(pageMap).map(
      ([pageURL, apiList]) => this.fetchMultipleAPIs(pageURL, apiList)
    );

    const results = await Promise.all(tasks);
    return results.flat();
  }
}

module.exports = { PageFetcher };
