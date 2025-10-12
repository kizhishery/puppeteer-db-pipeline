const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let Browser = null;

class BrowserLauncher {
  static async getBrowser() {
    if (Browser && Browser.isConnected()) return Browser;

    const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
    const puppeteerCore = isLambda ? require('puppeteer-core') : require('puppeteer');
    const puppeteer = addExtra(puppeteerCore);
    puppeteer.use(StealthPlugin());

    const launchOptions = isLambda
      ? {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-http2'],
          defaultViewport: { width: 1280, height: 800 },
          executablePath: isLambda ? await require('@sparticuz/chromium').executablePath() : undefined,
          headless: 'new',
          dumpio: false,
        }
      : {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: 'new',
        };

    Browser = await puppeteer.launch(launchOptions);
    return Browser;
  }

  static async closeBrowser() {
    if (Browser && Browser.isConnected()) {
      await Browser.close();
      Browser = null;
    }
  }
}

module.exports = { BrowserLauncher };
