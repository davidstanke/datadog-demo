import { chromium } from 'playwright';
import readline from 'readline';

// Set up default configuration
const DEFAULT_URL = 'http://localhost:5173';
const MIN_ITEMS = 1;
const MAX_ITEMS = 5;

// Cozy names, addresses, and details for randomized mock checkout data
const MOCK_CUSTOMERS = [
  { name: 'Daisy Willow', email: 'daisy.willow@cozywoodlands.com', address: '123 Pinecone Path', city: 'Mossy Creek', zip: '97401' },
  { name: 'Clover Meadows', email: 'clover.m@wildflowers.net', address: '789 Bluebell Way', city: 'Sproutville', zip: '98223' },
  { name: 'Jasper Pebble', email: 'jasper.pebble@studioclay.net', address: '456 Acorn Avenue', city: 'Pebblebrook', zip: '90210' },
  { name: 'Hazel Fern', email: 'hazel@fernhollow.co', address: '321 Fern Hollow Road', city: 'Fernvale', zip: '94043' },
  { name: 'Rowan Moss', email: 'rowan.moss@forestfloor.io', address: '555 Oakwood Lane', city: 'Oakwood', zip: '95112' },
  { name: 'Bramble Thicket', email: 'bramble@underbrush.org', address: '88 Hedgegrow Row', city: 'Briarcliff', zip: '01234' },
  { name: 'Pip Seedling', email: 'pip@sproutmail.com', address: '14 Lilypad Landing', city: 'Riverbend', zip: '30303' }
];

// Mock card details to maintain variety
const MOCK_CARDS = [
  { number: '4111 2222 3333 4444', expiry: '12/28', cvc: '123' },
  { number: '4000 1234 5678 9010', expiry: '08/29', cvc: '456' },
  { number: '4222 5555 8888 9999', expiry: '04/27', cvc: '789' }
];

// Helper to wait a random time (simulates realistic human actions)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (min, max) => delay(Math.floor(Math.random() * (max - min + 1)) + min);

// Helper to parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    iterations: null,
    url: process.env.TARGET_URL || DEFAULT_URL,
    headed: process.env.HEADED === 'true' || false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' || args[i] === '-i') {
      config.iterations = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--url' || args[i] === '-u') {
      config.url = args[i + 1];
      i++;
    } else if (args[i] === '--headed' || args[i] === '-h') {
      config.headed = true;
    }
  }

  return config;
}

// Interactive prompt for number of iterations if not passed via CLI
function promptIterations() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the number of navigation/purchase iterations to run: ', (answer) => {
      rl.close();
      const count = parseInt(answer, 10);
      if (isNaN(count) || count <= 0) {
        console.log('⚠️  Invalid number. Defaulting to 1 iteration.');
        resolve(1);
      } else {
        resolve(count);
      }
    });
  });
}

// Single end-to-end iteration workflow
async function runIteration(iterationIndex, targetUrl, headed) {
  console.log(`\n🚀 Starting Iteration [${iterationIndex}]...`);
  
  // Launch the browser
  const browser = await chromium.launch({
    headless: !headed,
    slowMo: headed ? 500 : 0 // Slow down actions in headed mode for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Visit the home page
    console.log(`🔗 Navigating to: ${targetUrl}`);
    await page.goto(targetUrl);
    await page.waitForLoadState('networkidle');
    console.log(`✨ Home page loaded: "${await page.title()}"`);
    await randomDelay(1000, 2000);

    // 2. Nondeterminism: Randomly click "Our Clay" or "Our Story" links before shopping
    const rollClay = Math.random() < 0.6; // 60% chance
    if (rollClay) {
      console.log('📖 Decided to read about "Our Clay" first...');
      await page.click('text=Our Clay');
      await page.waitForLoadState('networkidle');
      console.log(`📍 Currently on: ${page.url()}`);
      await randomDelay(1500, 3000);
      
      // Navigate back to Store to continue shopping
      await page.click('text=Store');
      await page.waitForLoadState('networkidle');
    }

    const rollStory = Math.random() < 0.4; // 40% chance
    if (rollStory) {
      console.log('📖 Decided to read "Our Story" first...');
      await page.click('text=Our Story');
      await page.waitForLoadState('networkidle');
      console.log(`📍 Currently on: ${page.url()}`);
      await randomDelay(1500, 3000);
      
      // Navigate back to Store to continue shopping
      await page.click('text=Store');
      await page.waitForLoadState('networkidle');
    }

    // 3. Add between 1 and 5 random items to the cart
    const numItems = Math.floor(Math.random() * (MAX_ITEMS - MIN_ITEMS + 1)) + MIN_ITEMS;
    console.log(`🛒 Decided to adopt ${numItems} clay companions...`);

    // Find all "Adopt" buttons on the store grid
    await page.waitForSelector('.add-to-cart-btn');
    const adoptButtons = await page.$$('.add-to-cart-btn');
    
    if (adoptButtons.length === 0) {
      throw new Error('No product "Adopt" buttons found on the page.');
    }

    // Select random unique indices to click
    const indicesToClick = [];
    while (indicesToClick.length < numItems) {
      const randIndex = Math.floor(Math.random() * adoptButtons.length);
      if (!indicesToClick.includes(randIndex)) {
        indicesToClick.push(randIndex);
      }
    }

    for (let i = 0; i < indicesToClick.length; i++) {
      const idx = indicesToClick[i];
      const button = adoptButtons[idx];
      
      // Get the product name for logging
      const card = await button.evaluateHandle(el => el.closest('.product-card'));
      const titleEl = await card.$('.product-title');
      const name = await titleEl.evaluate(el => el.textContent);

      console.log(`➕ Adding [${name}] to adoption cart...`);
      await button.click();
      await randomDelay(800, 1800);

      // If we have more items to add, we must close the cart drawer so it doesn't block the screen
      if (i < indicesToClick.length - 1) {
        console.log('🚪 Closing cart drawer to continue shopping...');
        const closeBtn = page.locator('.cart-drawer .close-drawer-btn');
        await closeBtn.click();
        await randomDelay(1000, 1500); // Allow drawer CSS slide transition
      }
    }

    // 4. Proceed to Checkout
    console.log('🛒 Opening checkout portal...');
    const checkoutBtn = page.locator('.checkout-btn');
    await checkoutBtn.waitFor({ state: 'visible' });
    await checkoutBtn.click();
    await randomDelay(1000, 1500);

    // 5. Fill out the checkout form with a cozy random customer profile
    const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];
    const card = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
    
    console.log(`✍️  Entering customer details for: ${customer.name}`);
    
    // Fill delivery details
    await page.fill('input[placeholder="Aria Bennett"]', customer.name);
    await page.fill('input[placeholder="aria@example.com"]', customer.email);
    await page.fill('input[placeholder="456 Whimsical Woods Rd"]', customer.address);
    await page.fill('input[placeholder="Forestville"]', customer.city);
    await page.fill('input[placeholder="90210"]', customer.zip);
    await randomDelay(500, 1000);

    // Fill mock credit card details
    await page.fill('input[placeholder="ARIA BENNETT"]', customer.name.toUpperCase());
    await page.fill('input[placeholder="4111 2222 3333 4444"]', card.number);
    await page.fill('input[placeholder="12/28"]', card.expiry);
    await page.fill('input[placeholder="***"]', card.cvc);
    await randomDelay(1000, 1500);

    // 6. Complete the checkout
    console.log('💳 Completing secure mock transaction...');
    const submitBtn = page.locator('button[type="submit"].checkout-btn');
    await submitBtn.click();

    // 7. Wait for processing spinner and successful confirmation screen
    console.log('⏳ Waiting for polymer payment validator...');
    const successHeader = page.locator('.success-h2');
    // The payment processing has a 2.5s simulated timeout in React, wait up to 10s
    await successHeader.waitFor({ state: 'visible', timeout: 10000 });
    
    // Grab the Order ID
    const orderIdBadge = page.locator('.order-id-badge');
    const orderIdText = await orderIdBadge.innerText();
    
    console.log(`✨ Success! ${orderIdText}`);
    console.log(`🎉 ${customer.name} has successfully adopted their clay companion(s)!`);
    await randomDelay(2000, 3000);

    // 8. Close the modal or hit continue shopping to complete loop cleanly
    await page.click('text=Continue Browsing Shop');
    await randomDelay(1000, 1500);

  } catch (err) {
    console.error(`❌ Error in iteration [${iterationIndex}]:`, err.message);
  } finally {
    // Clean up browser context
    await browser.close();
    console.log(`🏁 Iteration [${iterationIndex}] complete.`);
  }
}

// Main execution function
async function main() {
  console.log('==================================================');
  console.log('🎨  CLAY COMPANION TRAFFIC GENERATION SCRIPT   🎨');
  console.log('==================================================');

  const config = parseArgs();

  // If iterations not passed via CLI, prompt the user
  if (config.iterations === null) {
    config.iterations = await promptIterations();
  }

  console.log(`\n📋 Simulation Configuration:`);
  console.log(`   - Target URL: ${config.url}`);
  console.log(`   - Iterations: ${config.iterations}`);
  console.log(`   - Mode:       ${config.headed ? 'Headed (Visible)' : 'Headless (Background)'}`);
  console.log('==================================================\n');

  const startTime = Date.now();

  for (let i = 1; i <= config.iterations; i++) {
    await runIteration(i, config.url, config.headed);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n==================================================');
  console.log(`🏁 All ${config.iterations} iterations completed!`);
  console.log(`⏱️  Total Duration: ${durationSec}s`);
  console.log('==================================================\n');
}

main().catch((err) => {
  console.error('💥 Fatal error in simulation runner:', err);
  process.exit(1);
});
