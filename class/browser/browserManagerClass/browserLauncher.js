const { addExtra } = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

class BrowserLauncher {
  // Shared browser instance
  static Browser = null;

  // Detect environment
  static isLambda = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );

  // Return correct Puppeteer module
  static getModule() {
    return BrowserLauncher.isLambda
      ? require("puppeteer-core")
      : require("puppeteer");
  }

  // Get Puppeteer instance with stealth plugin
  static getPuppeteer() {
    const puppeteerCore = BrowserLauncher.getModule();
    const puppeteer = addExtra(puppeteerCore);
    puppeteer.use(StealthPlugin());
    return puppeteer;
  }

  // Launch browser in Lambda
  static async launchLambdaBrowser() {
    const puppeteer = BrowserLauncher.getPuppeteer();
    const chromium = require("@sparticuz/chromium");
    const launchOptions = {
      args: [
        "--no-sandbox",
        "--no-zygote",
        "--disable-gpu",
        "--single-process",
        "--disable-web-security",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--disable-software-rasterizer",
      ],
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: "new",
      dumpio: false,
    };
    console.log("🚀 Launching Lambda browser...");
    return puppeteer.launch(launchOptions);
  }

  // Launch browser locally
  static async launchLocalBrowser() {
    const puppeteer = BrowserLauncher.getPuppeteer();
    const launchOptions = {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--start-maximized",
        "--auto-open-devtools-for-tabs",
      ],
      // headless: "new",
      headless: false,
      devtools: true,
    };
    console.log("🚀 Launching local browser...");
    return puppeteer.launch(launchOptions);
  }

  // Get browser instance
  static async getBrowser() {
    if (BrowserLauncher.Browser && BrowserLauncher.Browser.isConnected()) {
      return BrowserLauncher.Browser;
    }

    BrowserLauncher.Browser = BrowserLauncher.isLambda
      ? await BrowserLauncher.launchLambdaBrowser()
      : await BrowserLauncher.launchLocalBrowser();

    console.log("✅ Browser launched.");
    return BrowserLauncher.Browser;
  }

  // Close browser
  static async closeBrowser({ force = false } = {}) {
    if (!BrowserLauncher.Browser) return;

    try {
      if (BrowserLauncher.Browser.isConnected()) {
        await BrowserLauncher.Browser.close();
        console.log("✅ Browser closed cleanly.");
      } else if (force) {
        BrowserLauncher.forceKillBrowser();
      }
    } catch (err) {
      console.error("❌ Error closing browser:", err.message);
      if (force) BrowserLauncher.forceKillBrowser();
    } finally {
      BrowserLauncher.Browser = null;
    }
  }

  // Force kill browser process
  static forceKillBrowser() {
    const browser = BrowserLauncher.Browser;
    if (browser && browser.process) {
      const pid = browser.process().pid;
      if (pid) {
        process.kill(pid, "SIGKILL");
        console.log(`⚡ Browser process ${pid} killed forcefully.`);
      }
    }
  }
}

module.exports = { BrowserLauncher };
