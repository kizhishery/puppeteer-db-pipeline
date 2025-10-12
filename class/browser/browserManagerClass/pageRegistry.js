class PageRegistry {
  constructor() {
    this.pages = new Map(); // key: pageId, value: PageWrapper
  }

  addPage(pageId, pageWrapper) {
    this.pages.set(pageId, pageWrapper);
  }

  getPage(pageId) {
    return this.pages.get(pageId);
  }

  async closePage(pageId) {
    const pageWrapper = this.pages.get(pageId);
    if (pageWrapper) {
      await pageWrapper.close();
      this.pages.delete(pageId);
    }
  }

  async closeAllPages() {
    for (const [id, pageWrapper] of this.pages.entries()) {
      await pageWrapper.close();
    }
    this.pages.clear();
  }
}

module.exports = { PageRegistry };
