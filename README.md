# Datadog demo app

## Headless Traffic Simulation Script

To generate realistic visitor logs and metrics for Datadog Real User Monitoring (RUM), you can run our hands-off user navigation simulator. This script opens a headless browser, navigates the site, visits multiple pages (Store, Our Clay, Our Story), adds a random number of items (1-5) to the cart, and completes a mock checkout using realistic user details.

### How to Run

1. **Interactive Prompt:**
   Ask the console how many times to repeat the full sequence:
   ```bash
   npm run simulate
   ```

2. **Direct CLI Parameters (Headless):**
   Run a specific number of complete loops directly:
   ```bash
   npm run simulate -- --iterations 3
   ```

3. **Headed/Visible Mode:**
   To watch the automation run in a visible browser window (with actions slowed down for clarity):
   ```bash
   npm run simulate -- --iterations 2 --headed
   ```

4. **Target a Custom URL:**
   If your Vite dev server runs on a different port or environment:
   ```bash
   npm run simulate -- --iterations 1 --url http://localhost:5173
   ```

