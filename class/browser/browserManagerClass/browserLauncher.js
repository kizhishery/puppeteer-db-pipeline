const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let Browser = null;

class BrowserLauncher {
  // Detect environment
  static isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

  // Return correct Puppeteer module
  static getModule() {
    return BrowserLauncher.isLambda ? require('puppeteer-core') : require('puppeteer');
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
    const chromium = require('@sparticuz/chromium');
    const launchOptions = {
      args: [
              '--no-sandbox',
              '--disable-gpu',              // disable GPU
              '--single-process',
      ],
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: 'new',
      dumpio: false,

    };
    console.log('🚀 Launching Lambda browser...');
    return puppeteer.launch(launchOptions);
  }

  // Launch browser locally
  static async launchLocalBrowser() {
    const puppeteer = BrowserLauncher.getPuppeteer();
    const launchOptions = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    };
    console.log('🚀 Launching local browser...');
    return puppeteer.launch(launchOptions);
  }

  // Get browser instance
  static async getBrowser() {
    if (Browser && Browser.isConnected()) return Browser;

    Browser = BrowserLauncher.isLambda
      ? await BrowserLauncher.launchLambdaBrowser()
      : await BrowserLauncher.launchLocalBrowser();

    console.log('✅ Browser launched.');
    return Browser;
  }

  // Close browser
  static async closeBrowser({ force = false } = {}) {
    if (!Browser) return;

    try {
      if (Browser.isConnected()) {
        await Browser.close();
        console.log('✅ Browser closed cleanly.');
      } else if (force) {
        BrowserLauncher.forceKillBrowser();
      }
    } catch (err) {
      console.error('❌ Error closing browser:', err.message);
      if (force) BrowserLauncher.forceKillBrowser();
    } finally {
      Browser = null;
    }
  }

  // Force kill browser process
  static forceKillBrowser() {
    if (Browser && Browser.process) {
      const pid = Browser.process().pid;
      if (pid) {
        process.kill(pid, 'SIGKILL');
        console.log(`⚡ Browser process ${pid} killed forcefully.`);
      }
    }
  }
}

module.exports = { BrowserLauncher };
