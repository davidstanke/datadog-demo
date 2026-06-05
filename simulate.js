import { chromium } from 'playwright-chromium';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

let BASE_URL = 'http://localhost:8080';
const ALL_PRODUCTS = ['cooper', 'hachi', 'bella', 'pierre', 'dash', 'barnaby'];
let activeBrowser = null;

// ANSI escape codes for beautiful styling
const C_RESET = '\x1b[0m';
const C_BRIGHT = '\x1b[1m';
const C_RED = '\x1b[31m';
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_MAGENTA = '\x1b[35m';

async function checkServerRunning(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.status < 500; // Returns true if server returns a successful status code or non-server-error
  } catch (err) {
    return false;
  }
}

async function runSimulation(iteration, total, headless) {
  console.log(`\n${C_MAGENTA}====================================================${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}🔄 RUNNING SIMULATION ITERATION: ${iteration} / ${total}${C_RESET}`);
  console.log(`${C_MAGENTA}====================================================${C_RESET}`);

  // Launch browser using playwright-chromium
  const browser = await chromium.launch({
    headless: headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  activeBrowser = browser;
  
  // Create a new context and page
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to Home
    console.log(`${C_CYAN}🌐 Navigating to catalog page...${C_RESET}`);
    await page.goto(BASE_URL, { waitUntil: 'load' });

    // Step 2: Randomly select between 1 and 3 distinct products
    const numProducts = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const shuffled = [...ALL_PRODUCTS].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, numProducts);
    
    console.log(`${C_CYAN}📋 Randomly chose ${numProducts} breed(s) to adopt: ${C_BRIGHT}${selectedProducts.join(', ')}${C_RESET}`);

    // Step 3: Add each chosen product to cart
    for (const productId of selectedProducts) {
      const targetQty = Math.floor(Math.random() * 3) + 1; // Quantity between 1 and 3
      console.log(`\n🐾 Attempting to adopt ${C_BRIGHT}${productId}${C_RESET} (target qty: ${C_BRIGHT}${targetQty}${C_RESET})...`);

      // Ensure we are back on the homepage to click the adopt button
      const currentUrl = page.url();
      if (currentUrl !== BASE_URL && currentUrl !== `${BASE_URL}/`) {
        await page.goto(BASE_URL, { waitUntil: 'load' });
      }

      // Find the specific form button and click it
      const formButton = page.locator(`form[action="/cart/add"]:has(input[value="${productId}"]) button[type="submit"]`);
      
      try {
        await formButton.click();
      } catch (err) {
        console.log(`${C_RED}❌ Error: Could not find "Adopt Me" button for ${productId}!${C_RESET}`);
        continue;
      }

      // Check if we hit the "Oops" error page
      const isErrorPage = await page.evaluate(() => {
        return document.body.innerText.includes('Oops!') && !!document.querySelector('a.btn-primary-custom');
      });

      if (isErrorPage) {
        console.log(`${C_RED}⚠️ HIT SERVER ERROR: ${productId} could not be adopted.${C_RESET}`);
        console.log(`${C_YELLOW}🔄 Clicking "Back to Puppy Catalog" button to proceed...${C_RESET}`);
        
        await page.locator('a.btn-primary-custom').click();
        continue;
      }

      console.log(`${C_GREEN}✅ Successfully added ${productId} to cart.${C_RESET}`);

      // If target quantity is > 1, go to /cart and increase quantity
      if (targetQty > 1) {
        // Go to cart page if we aren't there already
        if (!page.url().endsWith('/cart')) {
          await page.goto(`${BASE_URL}/cart`, { waitUntil: 'load' });
        }

        for (let q = 1; q < targetQty; q++) {
          console.log(`   ➕ Increasing quantity of ${productId} (${q + 1}/${targetQty})...`);
          
          // Click increase button inside the specific product's increase quantity form
          const increaseBtn = page.locator(`form[action="/cart/update"]:has(input[name="productId"][value="${productId}"]):has(input[name="action"][value="increase"]) button.qty-btn`);
          await increaseBtn.click();
        }
      }
    }

    // Step 4: Ensure cart is not empty before proceeding
    if (!page.url().endsWith('/cart')) {
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'load' });
    }

    const cartText = await page.innerText('body');
    const isCartEmpty = cartText.includes('Your cart is empty') || !(await page.locator('a[href="/checkout"]').isVisible().catch(() => false));

    if (isCartEmpty) {
      console.log(`\n${C_YELLOW}⚠️ Cart is empty (likely because only Barnaby was chosen). Adding "cooper" as fallback...${C_RESET}`);
      await page.goto(BASE_URL, { waitUntil: 'load' });
      await page.locator('form[action="/cart/add"]:has(input[value="cooper"]) button[type="submit"]').click();
      console.log(`${C_GREEN}✅ Fallback "cooper" successfully added to cart.${C_RESET}`);
    }

    // Step 5: Proceed to Checkout
    console.log(`\n${C_CYAN}💳 Proceeding to checkout...${C_RESET}`);
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'load' });

    // Step 6: Click complete secure adoption button
    console.log(`${C_CYAN}✍️ Submitting prefilled secure adoption form...${C_RESET}`);
    await page.locator('button.checkout-btn[type="submit"]').click();

    // Step 7: Verify success and output confirmation details
    const currentUrl = page.url();
    if (currentUrl.endsWith('/success')) {
      const orderDetails = await page.evaluate(() => {
        const badge = document.querySelector('.order-id-badge');
        const orderId = badge ? badge.innerText.replace('Order ID:', '').trim() : 'Unknown';
        
        const rows = Array.from(document.querySelectorAll('.success-row'));
        const amountRow = rows.find(r => r.innerText.includes('Amount Paid'));
        const amount = amountRow ? amountRow.querySelector('span').innerText.trim() : 'Unknown';

        const companionsRow = rows.find(r => r.innerText.includes('Companions Adopted'));
        const companions = companionsRow ? companionsRow.querySelector('span').innerText.trim() : 'Unknown';

        return { orderId, amount, companions };
      });

      console.log(`\n${C_GREEN}🎉 SUCCESS! ADOPTION COMPLETED SUCCESSFULLY!${C_RESET}`);
      console.log(`${C_GREEN}🆔 Order ID:       ${C_BRIGHT}${orderDetails.orderId}${C_RESET}`);
      console.log(`${C_GREEN}🐶 Companions:     ${C_BRIGHT}${orderDetails.companions}${C_RESET}`);
      console.log(`${C_GREEN}💰 Total Paid:     ${C_BRIGHT}${orderDetails.amount}${C_RESET}`);
      return true;
    } else {
      console.log(`${C_RED}❌ Error: Did not land on the success page. Current URL is ${currentUrl}${C_RESET}`);
      return false;
    }

  } catch (error) {
    console.error(`${C_RED}💥 Exception occurred during iteration ${iteration}:`, error, C_RESET);
    return false;
  } finally {
    activeBrowser = null;
    await browser.close();
  }
}

// Main execution block
(async () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Parse command line arguments
  let iterations = 3;
  let headless = true;
  let minDelay = 0;
  let maxDelay = 0;
  let isInfinite = false;

  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--iterations=')) {
      const val = arg.split('=')[1];
      if (val === 'infinite' || val === '-1') {
        isInfinite = true;
        iterations = Infinity;
      } else {
        iterations = parseInt(val, 10);
      }
    } else if (arg.startsWith('--min-delay=')) {
      minDelay = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--max-delay=')) {
      maxDelay = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--infinite') {
      isInfinite = true;
      iterations = Infinity;
    } else if (!arg.startsWith('-')) {
      if (arg === 'infinite' || arg === '-1') {
        isInfinite = true;
        iterations = Infinity;
      } else if (!isNaN(arg)) {
        iterations = parseInt(arg, 10);
      }
    } else if (arg === '--headed') {
      headless = false;
    }
  }

  // Normalize delays: default to 0, handle single-flag inputs as fixed delay
  if (isNaN(minDelay) || minDelay < 0) minDelay = 0;
  if (isNaN(maxDelay) || maxDelay < 0) maxDelay = 0;

  if (minDelay > 0 && maxDelay === 0) {
    maxDelay = minDelay;
  } else if (maxDelay > 0 && minDelay === 0) {
    minDelay = maxDelay;
  }

  if (minDelay > maxDelay) {
    const temp = minDelay;
    minDelay = maxDelay;
    maxDelay = temp;
  }

  console.log(`${C_MAGENTA}${C_BRIGHT}====================================================${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}🌟 Cozy Clay Canines Purchase Simulator Initializing 🌟${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}====================================================${C_RESET}`);
  console.log(`Target loops to run: ${C_BRIGHT}${isInfinite ? 'Infinite (∞)' : iterations}${C_RESET}`);
  console.log(`Browser execution:   ${C_BRIGHT}${headless ? 'headless' : 'headed (visible)'}${C_RESET}`);
  if (minDelay > 0 || maxDelay > 0) {
    if (minDelay === maxDelay) {
      console.log(`Delay between loops: ${C_BRIGHT}${minDelay}ms (fixed)${C_RESET}\n`);
    } else {
      console.log(`Delay between loops: ${C_BRIGHT}${minDelay}ms - ${maxDelay}ms (random)${C_RESET}\n`);
    }
  } else {
    console.log(`Delay between loops: ${C_BRIGHT}None (0ms)${C_RESET}\n`);
  }

  const rl = readline.createInterface({ input, output });
  let userUrl = await rl.question(`Enter the server URL to use [http://localhost:8080]: `);
  rl.close();

  userUrl = userUrl.trim();
  if (userUrl) {
    BASE_URL = userUrl;
  }
  // Trim trailing slash if present
  if (BASE_URL.endsWith('/')) {
    BASE_URL = BASE_URL.slice(0, -1);
  }

  console.log(`\n🔍 Verifying server is running at ${C_BRIGHT}${BASE_URL}${C_RESET}...`);
  const isRunning = await checkServerRunning(BASE_URL);
  if (!isRunning) {
    console.error(`\n${C_RED}💥 Error: The server at ${BASE_URL} is not running or accessible.${C_RESET}`);
    console.error(`${C_RED}Please make sure the server is active before running the simulation.${C_RESET}\n`);
    process.exit(1);
  }
  console.log(`${C_GREEN}✅ Server is active!${C_RESET}\n`);

  let totalAttempted = 0;
  let successfulRuns = 0;
  let isExiting = false;

  process.on('SIGINT', async () => {
    if (isExiting) return;
    isExiting = true;
    console.log(`\n\n${C_YELLOW}🛑 Simulation interrupted by user (Ctrl+C). Exiting gracefully...${C_RESET}`);
    
    if (activeBrowser) {
      console.log(`${C_CYAN}🧹 Closing active browser session...${C_RESET}`);
      try {
        await activeBrowser.close();
      } catch (err) {
        // Ignore
      }
    }

    console.log(`\n${C_MAGENTA}====================================================${C_RESET}`);
    console.log(`${C_MAGENTA}${C_BRIGHT}📊 SIMULATION INTERRUPTED SUMMARY${C_RESET}`);
    console.log(`${C_MAGENTA}====================================================${C_RESET}`);
    console.log(`Total attempted runs: ${C_BRIGHT}${totalAttempted}${C_RESET}`);
    console.log(`Successful runs:     ${C_BRIGHT}${successfulRuns} / ${totalAttempted}${C_RESET}`);
    if (totalAttempted > 0) {
      const rate = ((successfulRuns / totalAttempted) * 100).toFixed(1);
      console.log(`Success rate:        ${C_BRIGHT}${rate}%${C_RESET}`);
    }
    console.log(`${C_MAGENTA}====================================================${C_RESET}\n`);
    
    process.exit(0);
  });

  try {
    let i = 1;
    while (isInfinite || i <= iterations) {
      totalAttempted = i;
      const totalDisplay = isInfinite ? '∞' : iterations;
      const ok = await runSimulation(i, totalDisplay, headless);
      if (ok) successfulRuns++;

      if ((isInfinite || i < iterations) && maxDelay > 0) {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        if (delay > 0) {
          console.log(`\n${C_YELLOW}⏳ Delaying for ${C_BRIGHT}${delay}ms${C_RESET}${C_YELLOW} before starting next iteration...${C_RESET}`);
          await sleep(delay);
        }
      }
      i++;
    }

    // Only reached if iterations is finite and loops complete naturally
    console.log(`\n${C_MAGENTA}====================================================${C_RESET}`);
    console.log(`${C_MAGENTA}${C_BRIGHT}📊 SIMULATION COMPLETE SUMMARY${C_RESET}`);
    console.log(`${C_MAGENTA}====================================================${C_RESET}`);
    console.log(`Completed runs:  ${C_BRIGHT}${successfulRuns} / ${iterations}${C_RESET}`);
    if (successfulRuns === iterations) {
      console.log(`${C_GREEN}✨ All purchase simulations completed successfully! ✨${C_RESET}\n`);
    } else {
      console.log(`${C_YELLOW}⚠️  Some simulation runs failed or encountered issues. Refer to logs above. ⚠️${C_RESET}\n`);
    }

  } catch (error) {
    console.error(`${C_RED}💥 Fatal simulation setup error:`, error, C_RESET);
    process.exit(1);
  }
})();
