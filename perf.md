| Phase / Metric                     | 🕓 Before           | ⚡ After           | 🔁 Multiplier (Before ÷ After) |
|------------------------------------|---------------------|-------------------|-------------------------------|
| 🌐 **Browser Initiated**            | 2.122 s             | 0.016 ms          | ~132,625× faster              |
| 🌐 **Cache Status**                 | ❌ Cache Miss        | ✅ Cache Hit       | —                             |
| 🌐 **Cached Expiry**                | 3.206 s             | 0.053 ms          | ~60,490× faster               |
| 🌐 **Data Processing**              | 965.028 ms          | 162.526 ms        | ~5.9× faster                  |
| ⚡ **DynamoDB Clients Created**     | 30                  | —                 | —                             |
| ✅ **Future Parallel Insert #1**    | 110 ms              | 18 ms             | ~6.1× faster                  |
| ✅ **Active Parallel Insert #2**    | 113 ms              | 18 ms             | ~6.3× faster                  |
| ✅ **Option Parallel Insert #3**    | 507 ms              | 101 ms            | ~5.0× faster                  |
| ✅ **Option Parallel Insert #4**    | 504 ms              | 105 ms            | ~4.8× faster                  |
| 🌐 **Total Insertion**              | 517.518 ms          | 104.365 ms        | ~5.0× faster                  |
| 🧮 **Total Duration**               | 6815.15 ms          | 324.39 ms         | ~21× faster                   |
| 💰 **Billed Duration**              | 7155 ms             | 325 ms            | ~22× faster                   |
| 🧠 **Memory Size**                  | 2560 MB             | 2560 MB           | —                             |
| 📈 **Max Memory Used**              | 631 MB              | 638 MB            | ≈1.01× (same)                 |
