const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

let browserPromise = null;

async function getBrowser() {
  // Reuse if already launched
  if (browserPromise) {
    try {
      const existingBrowser = await browserPromise;
      if (existingBrowser.isConnected()) return existingBrowser;
    } catch {
      browserPromise = null; // Reset if previous instance crashed
    }
  }

  const isLambda = Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
  );

  if (isLambda) {
    const puppeteerCore = require('puppeteer-core');
    const chromium = require('@sparticuz/chromium');
    const puppeteer = addExtra(puppeteerCore);
    puppeteer.use(StealthPlugin());

    browserPromise = puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-http2'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: 'new',
      dumpio: false,
    }).catch(err => {
      browserPromise = null;
      throw err;
    });
  } else {
    const puppeteer = addExtra(require('puppeteer'));
    puppeteer.use(StealthPlugin());

    browserPromise = puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    }).catch(err => {
      browserPromise = null;
      throw err;
    });
  }

  return browserPromise;
}

module.exports = { getBrowser };
