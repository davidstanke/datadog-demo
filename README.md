# 🐶 Cozy Clay Canines (Server-Side Web Store)

Welcome to **Cozy Clay Canines**, a fully server-side rendered Node.js web store for adopting adorable, handcrafted clay dog figurines. 

This application is built using **Express.js**, **EJS templates**, and **express-session** for completely server-side managed shopping carts and checkout workflows. It is fully responsive and features an elegant, premium **Warm & Cozy Pastel** design system styled using pure vanilla CSS.

---

## ✨ Features
1. **Multi-Page Server-Rendered Flow (No SPA)**: Contains true server-side routes and dynamic page generation:
   - `GET /` (Product Catalog storefront with category filtering).
   - `GET /product/:id` (Dedicated product detail display with Specifications).
   - `GET /cart` (Server-side managed adoption cart with real-time quantity adjustments).
   - `GET /checkout` (Pre-populated checkout form with real-time credit card cardholder syncing).
   - `GET /success` (Order confirmation showing generated Order ID and receipt).
2. **Cozy Handcrafted Illustrations**: Adorable clay figures (Corgi, Shiba, Golden, Frenchie, Dachshund, and Pug) are styled and rendered natively using **pure, lightweight, crisp CSS shapes** inside the EJS cards.
3. **1-Click Adoption Checkout**: In alignment with the `/grill-me` requirements, the checkout form is pre-filled with cozy mock delivery details and credit card info. Users can finalize their adoption transaction with a single click of the "Complete Secure Adoption" button.
4. **Server-Side State**: All cart and checkout states are securely handled using cookie-backed Express sessions on the Node server.

---

## 🛠️ Tech Stack
- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Templating Engine**: [EJS (Embedded JavaScript)](https://ejs.co/)
- **State/Session Management**: [express-session](https://www.npmjs.com/package/express-session)
- **Styling**: Vanilla CSS (including pure CSS custom art)
- **Runtime**: Node.js (ES Modules, `"type": "module"`)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Run the Server
Launch the local Express development server:
```bash
npm start
```
The server will start running on port `5173`:
👉 **http://localhost:5173**

---

## 🔄 Purchase Simulator

This project contains a high-fidelity automated user simulation script written in Node.js using **Playwright** (`playwright-chromium`). It simulates realistic storefront visits, random breed selections, adding items to the cart, modifying quantities, recovering from catalog errors, and completing successful adoption checkout sequences.

This is ideal for generating real-time log, metric, and tracing data in **Datadog**!

### 1. Install Simulator OS Dependencies
Since the simulator runs a headless browser, ensure your Linux system has the necessary browser dependencies installed. You can install all required libraries automatically with a single command:
```bash
npx playwright install-deps
```

### 2. Run the Simulation
Make sure your Cozy Clay Canines server is running (either locally or inside your Docker container), then execute the simulator:
```bash
npm run simulate
```

### 3. Optional Parameters
- **Set Loop Count & Infinite Looping:** Control how many full purchase flows to run (defaults to `3`) or loop infinitely:
  - **Fixed Iterations:**
    ```bash
    npm run simulate -- 5
    # Or explicitly:
    npm run simulate -- --iterations=5
    ```
  - **Infinite Looping:** Loop forever until manually stopped. Interrupting with `Ctrl+C` will close browser sessions and print a beautiful performance summary:
    ```bash
    npm run simulate -- --infinite
    # Or explicitly:
    npm run simulate -- --iterations=infinite
    # Or simply:
    npm run simulate -- infinite
    # Or setting iterations to -1:
    npm run simulate -- -1
    ```
- **Set Loop Delays:** Introduce a delay between simulation loops in milliseconds (defaults to `0`):
  - **Fixed Delay:** Specify the same value for both min and max delay (or just provide one of them):
    ```bash
    npm run simulate -- --min-delay=2000
    ```
  - **Random Range Delay:** Pick a random delay within a range:
    ```bash
    npm run simulate -- --min-delay=1000 --max-delay=5000
    ```
- **Headed (Visible) Mode:** If you are running locally and want to watch the browser execute the actions in a visible window:
  ```bash
  npm run simulate -- --headed
  ```
- **Target Server URL:** Upon execution, the CLI will prompt you for the target server URL (defaulting to `http://localhost:8080`). Just press **Enter** to use the default.
  > [!TIP]
  > When running the simulator inside a cloud IDE environment (like Google Cloud Workstations), always use `http://localhost:8080` instead of the external proxy URL to bypass Identity-Aware Proxy (IAP) auth gates.

---

## 📂 Project Structure
```text
.
├── app.js               # Express server entry point, product catalog, routes, session setup
├── package.json         # Node scripts & dependencies (EJS, Express, express-session)
├── public/
│   └── styles.css       # Cozy pastel design system tokens, layout, forms, and pure-CSS dog arts
└── views/               # EJS page templates
    ├── index.ejs        # Product catalog with category filter
    ├── product.ejs      # Product detail and specification view
    ├── cart.ejs         # Shopping cart list & summary panel
    ├── checkout.ejs     # Pre-populated delivery and payment checkout form
    ├── success.ejs      # Secure order confirmation page
    └── partials/        # Global layout components
        ├── header.ejs   # Global head, typography, navigation, live cart count
        └── footer.ejs   # Global semantic footer details
```
