const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let Browser = null;
let launchPromise = null; // prevent race conditions

class BrowserLauncher {
  static async getBrowser() {
    // return existing connected browser
    if (Browser && Browser.isConnected()) return Browser;

    // if launching already, wait
    if (launchPromise) return launchPromise;

    // start launching
    launchPromise = (async () => {
      const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
      const puppeteerCore = isLambda ? require('puppeteer-core') : require('puppeteer');
      const puppeteer = addExtra(puppeteerCore);
      puppeteer.use(StealthPlugin());

      const launchOptions = isLambda
        ? {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-http2',
            ],
            defaultViewport: { width: 1280, height: 800 },
            executablePath: await require('@sparticuz/chromium').executablePath(),
            headless: 'new',
            dumpio: false,
          }
        : {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new',
          };

      console.log('🚀 Launching browser...');
      Browser = await puppeteer.launch(launchOptions);
      console.log('✅ Browser launched.');
      return Browser;
    })();

    try {
      Browser = await launchPromise;
      return Browser;
    } finally {
      launchPromise = null;
    }
  }

  static async closeBrowser({ force = false } = {}) {
    if (!Browser) return;

    try {
      console.log('🧹 Closing browser...');
      if (Browser.isConnected()) await Browser.close();
      console.log('✅ Browser closed cleanly.');
    } catch (err) {
      console.error('❌ Error closing browser:', err.message);
      if (force && Browser.process) {
        const pid = Browser.process().pid;
        if (pid) process.kill(pid, 'SIGKILL');
      }
    } finally {
      Browser = null;
      launchPromise = null;
    }
  }
}

module.exports = { BrowserLauncher };
