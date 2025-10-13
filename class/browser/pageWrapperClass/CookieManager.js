class CookieManager {
  constructor(page) {
    this.page = page;
    this.cookieHeader = "";
  }

  async fetchCookies() {
    if (!this.page) throw new Error("Page not initialized");
    const cookies = await this.page.cookies();
    this.cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
    return this.cookieHeader;
  }
  
  getHeader() {
    return this.cookieHeader;
  }
}

module.exports = { CookieManager };
