import puppeteer from 'puppeteer';
import net from 'net';
import { spawn } from 'child_process';

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;
const ALL_PRODUCTS = ['cooper', 'hachi', 'bella', 'pierre', 'dash', 'barnaby'];

// ANSI escape codes for beautiful styling
const C_RESET = '\x1b[0m';
const C_BRIGHT = '\x1b[1m';
const C_RED = '\x1b[31m';
const C_GREEN = '\x1b[32m';
const C_YELLOW = '\x1b[33m';
const C_CYAN = '\x1b[36m';
const C_MAGENTA = '\x1b[35m';

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

let serverProcess = null;

async function ensureServer() {
  const inUse = await isPortInUse(PORT);
  if (inUse) {
    console.log(`${C_GREEN}✅ Server is already running on port ${PORT}.${C_RESET}`);
    return false; // did not spin up programmatically
  }

  console.log(`${C_YELLOW}🚀 Starting Cozy Clay Canines server programmatically...${C_RESET}`);
  serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  // Poll port 5173 to check if it's active
  let attempts = 0;
  while (attempts < 20) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (await isPortInUse(PORT)) {
      console.log(`${C_GREEN}✅ Server successfully started and is listening on port ${PORT}!${C_RESET}`);
      return true; // programmatically spun up
    }
    attempts++;
  }
  throw new Error('Failed to start Cozy Clay Canines server in a reasonable time.');
}

function cleanupServer(spunUp) {
  if (spunUp && serverProcess) {
    console.log(`\n${C_YELLOW}🛑 Shutting down programmatically started server...${C_RESET}`);
    serverProcess.kill('SIGTERM');
  }
}

async function runSimulation(iteration, total) {
  console.log(`\n${C_MAGENTA}====================================================${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}🔄 RUNNING SIMULATION ITERATION: ${iteration} / ${total}${C_RESET}`);
  console.log(`${C_MAGENTA}====================================================${C_RESET}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set screen size
    await page.setViewport({ width: 1280, height: 800 });

    // Step 1: Navigate to Home
    console.log(`${C_CYAN}🌐 Navigating to catalog page...${C_RESET}`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Step 2: Randomly select between 1 and 3 distinct products
    const numProducts = Math.floor(Math.random() * 3) + 1; // 1 to 3
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
        await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      }

      // Find the specific form and click the submit button
      const clicked = await page.evaluate((prodId) => {
        const input = document.querySelector(`form[action="/cart/add"] input[value="${prodId}"]`);
        if (input) {
          const form = input.closest('form');
          const btn = form.querySelector('button[type="submit"]');
          if (btn) {
            btn.click();
            return true;
          }
        }
        return false;
      }, productId);

      if (!clicked) {
        console.log(`${C_RED}❌ Error: Could not find "Adopt Me" button for ${productId}!${C_RESET}`);
        continue;
      }

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

      // Check if we hit the "Oops" error page
      const isErrorPage = await page.evaluate(() => {
        return document.body.innerText.includes('Oops!') && !!document.querySelector('a.btn-primary-custom');
      });

      if (isErrorPage) {
        console.log(`${C_RED}⚠️ HIT SERVER ERROR: ${productId} could not be adopted.${C_RESET}`);
        console.log(`${C_YELLOW}🔄 Clicking "Back to Puppy Catalog" button to proceed...${C_RESET}`);
        
        await page.evaluate(() => {
          const btn = document.querySelector('a.btn-primary-custom');
          if (btn) btn.click();
        });
        
        await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
        continue;
      }

      console.log(`${C_GREEN}✅ Successfully added ${productId} to cart.${C_RESET}`);

      // If target quantity is > 1, go to /cart and increase quantity
      if (targetQty > 1) {
        // Go to cart page if we aren't there already
        if (!page.url().endsWith('/cart')) {
          await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle0' });
        }

        for (let q = 1; q < targetQty; q++) {
          console.log(`   ➕ Increasing quantity of ${productId} (${q + 1}/${targetQty})...`);
          
          await page.evaluate((prodId) => {
            const inputs = Array.from(document.querySelectorAll('form[action="/cart/update"] input[name="productId"]'));
            const input = inputs.find(i => {
              if (i.value !== prodId) return false;
              const actionInput = i.closest('form').querySelector('input[name="action"]');
              return actionInput && actionInput.value === 'increase';
            });
            if (input) {
              const form = input.closest('form');
              const btn = form.querySelector('button.qty-btn');
              if (btn) btn.click();
            }
          }, productId);

          await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
        }
      }
    }

    // Step 4: Ensure cart is not empty before proceeding
    // Navigate to /cart to verify
    if (!page.url().endsWith('/cart')) {
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle0' });
    }

    const isCartEmpty = await page.evaluate(() => {
      return document.body.innerText.includes('Your cart is empty') || !document.querySelector('a[href="/checkout"]');
    });

    if (isCartEmpty) {
      console.log(`\n${C_YELLOW}⚠️ Cart is empty (likely because only Barnaby was chosen). Adding "cooper" as fallback...${C_RESET}`);
      await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      await page.evaluate(() => {
        const input = document.querySelector('form[action="/cart/add"] input[value="cooper"]');
        if (input) {
          const form = input.closest('form');
          const btn = form.querySelector('button[type="submit"]');
          if (btn) btn.click();
        }
      });
      await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
      console.log(`${C_GREEN}✅ Fallback "cooper" successfully added to cart.${C_RESET}`);
    }

    // Step 5: Proceed to Checkout
    console.log(`\n${C_CYAN}💳 Proceeding to checkout...${C_RESET}`);
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle0' });

    // Step 6: Click complete secure adoption button
    console.log(`${C_CYAN}✍️ Submitting prefilled secure adoption form...${C_RESET}`);
    await page.evaluate(() => {
      const btn = document.querySelector('button.checkout-btn[type="submit"]');
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});

    // Step 7: Verify success and output confirmation details
    const currentUrl = page.url();
    if (currentUrl.endsWith('/success')) {
      const orderDetails = await page.evaluate(() => {
        const badge = document.querySelector('.order-id-badge');
        const orderId = badge ? badge.innerText.replace('Order ID:', '').trim() : 'Unknown';
        
        // Find Amount Paid
        const rows = Array.from(document.querySelectorAll('.success-row'));
        const amountRow = rows.find(r => r.innerText.includes('Amount Paid'));
        const amount = amountRow ? amountRow.querySelector('span').innerText.trim() : 'Unknown';

        // Find Companions Adopted
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
    await browser.close();
  }
}

// Main execution block
(async () => {
  // Parse iteration count
  let iterations = 3;
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--iterations=')) {
      iterations = parseInt(arg.split('=')[1], 10);
    } else if (!arg.startsWith('-') && !isNaN(arg)) {
      iterations = parseInt(arg, 10);
    }
  }

  console.log(`${C_MAGENTA}${C_BRIGHT}====================================================${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}🌟 Cozy Clay Canines Purchase Simulator Initializing 🌟${C_RESET}`);
  console.log(`${C_MAGENTA}${C_BRIGHT}====================================================${C_RESET}`);
  console.log(`Target loops to run: ${C_BRIGHT}${iterations}${C_RESET}\n`);

  let spunUp = false;
  try {
    spunUp = await ensureServer();
    
    let successfulRuns = 0;
    for (let i = 1; i <= iterations; i++) {
      const ok = await runSimulation(i, iterations);
      if (ok) successfulRuns++;
    }

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
  } finally {
    cleanupServer(spunUp);
  }
})();
