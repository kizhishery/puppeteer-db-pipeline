
const runCLI = async (mainFn, globalBrowser) => {
  try {
    await mainFn();

    // ✅ Gracefully close browser if open
    if (globalBrowser && globalBrowser.isConnected()) {
      await globalBrowser.close();
      globalBrowser = null;
    }

    process.exit(0); // Explicitly exit successfully
  } catch (err) {
    console.error("CLI error:", err);

    // ✅ Close browser on failure
    if (globalBrowser && globalBrowser.isConnected()) {
      await globalBrowser.close();
      globalBrowser = null;
    }

    process.exit(1); // Exit with failure
  }
};

module.exports = { runCLI };
