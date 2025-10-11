// puppeteer/fetchData.js
let page = null;
let pageReady = false;
let cookieHeader = "";

// --- Helper: create or reset page ---
const createNewPage = async (browser) => {
  if (page && !page.isClosed()) {
    try { await page.close(); } catch {}
  }
  page = await browser.newPage();
  pageReady = false;
  cookieHeader = "";
};

// --- Helper: navigate page and load cookies if needed ---
const preparePage = async (pageURL, useCookies) => {
  if (!pageReady) {
    await page.goto(pageURL, { waitUntil: "domcontentloaded" });

    if (useCookies) {
      const cookies = await page.cookies();
      cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
    }

    pageReady = true;
  }
};

// --- Helper: fetch API in page context ---
const fetchApi = async (apiURL) => {
  return await page.evaluate(async ({ apiURL, cookieHeader }) => {
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
  }, { apiURL, cookieHeader });
};

// --- Main function ---
const fetchData = async (browser, pageURL, apiURL, useCookies = true) => {
  if (!browser || !browser.isConnected()) throw new Error("Browser instance required");
  if (!pageURL || !apiURL) throw new Error("Missing pageURL or apiURL");

  // 1️⃣ Ensure page exists
  if (!page || page.isClosed()) await createNewPage(browser);

  try {
    // 2️⃣ Prepare page (load cookies/session once)
    await preparePage(pageURL, useCookies);
    // 3️⃣ Fetch API
    return await fetchApi(apiURL);
  } catch (err) {
    console.warn("fetchData failed, recreating page and retrying...", err.message);

    // 4️⃣ Retry once by recreating the page
    await createNewPage(browser);
    await preparePage(pageURL, useCookies);
    return await fetchApi(apiURL);
  }
};

module.exports = { fetchData };
