# 🎭 Automation Practice Arena

An interactive, high-fidelity, production-grade playground specifically engineered for QA professionals, SDETs, and automated testing engineers. Practice, debug, and design robust locator strategies using modern automation tools such as **Playwright**, **Cypress**, or **Selenium**.

The application operates in **Indian Standard Time (IST)** and logs all user interactions with millisecond precision directly to a live, queryable dynamic event log.

---

## 🚀 Key Practice Zones & Challenges

### 1. 🖱️ Double-Click Gate Security
* **Locator Target:** `#btn-double-click-lock`
* **Status Label:** `#lock-status-label`
* **Warning Text:** `#dblclick-warning-text`
* **Behavior:** A single click on this lock button fails, logging a rejection and outputting an error warning element to practice negative assertion paths. Only a rapid, native double-click event successfully transitions the lock between `SECURED_LOCKED` and `SYSTEM_UNLOCKED`.

### 2. ⌨️ Keyboard Shortcut Simulator
* **Locator Target:** `#keyboard-simulation-input`
* **Key Val Display:** `#kbd-key-val`
* **DOM Code Display:** `#kbd-code-val`
* **Behavior:** Captures and translates key codes, scan codes, and active modifier states (such as Control, Shift, Alt, or Meta). Typing the specific hotkey combination `Ctrl + Shift + K` unlocks a success banner (`#kbd-shortcut-success-banner`) and broadcasts a simulation event token.

### 3. 🔍 Background Validation Hub
* **Button Target:** `#btn-run-background-validation`
* **Report Panel:** `#bg-validation-results-log`
* **Behavior:** Simulates a realistic background worker thread. When triggered, it analyzes active document attributes, identifies duplicate DOM IDs, evaluates missing accessibility/ARIA markers on input fields, and renders a structured report inside a terminal UI. Useful for practicing wait-state handling (`waitForSelector`) and race condition assertions.

### 4. 🔒 Stateful Element Verifications
* **Override Switch:** `#override-switch-verify`
* **Terms Checkbox:** `#terms-checkbox-verify`
* **License Input:** `#license-input-verify` (Length restriction: 8 chars)
* **Provision Button:** `#provision-btn-verify`
* **Behavior:** Designed to test sequential element state dependencies (`toBeEnabled` vs `toBeDisabled`). 
  1. Checking the compliance box enables the license text input field.
  2. Inputting exactly 8 characters into the license field enables the "Provision Server Instance" button.
  3. Turning on the "Global Safety Override" switch instantly bypasses all workflow requirements and enables everything at once.

### 5. 📜 High-Capacity Scrolling Tables
* **Vite Catalog Grid:** `#catalog-grid` (wrapper: scrollable outer viewport)
* **ApexBank Ledger:** `#bank-ledger-grid` (wrapper: `#bank-ledger-grid-wrapper`)
* **Behavior:** These data grids contain multiple rows mapped inside maximum-height overflow viewports. Test engineers must scroll rows into view before selecting or asserting text attributes, validating realistic page-lazy loading and pointer action target coordinates.

---

## 🧪 Automation Recipes

Here are production-ready testing templates to copy, run, and modify.

### 🎭 Playwright (TypeScript)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Automation Practice Arena Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Replace with your local or deployed environment URL
    await page.goto('http://localhost:3000'); 
  });

  test('should unlock the double click gate on dblclick', async ({ page }) => {
    const lockButton = page.locator('#btn-double-click-lock');
    const statusLabel = page.locator('#lock-status-label');

    // 1. Single click should fail and show warning
    await lockButton.click();
    await expect(statusLabel).toHaveText('SECURED_LOCKED');
    await expect(page.locator('#dblclick-warning-text')).toBeVisible();

    // 2. Double click should unlock successfully
    await lockButton.dblclick();
    await expect(statusLabel).toHaveText('SYSTEM_UNLOCKED');
    await expect(page.locator('#dblclick-warning-text')).not.toBeVisible();
  });

  test('should activate secret banner using keyboard shortcuts', async ({ page }) => {
    const kbdInput = page.locator('#keyboard-simulation-input');

    await kbdInput.focus();
    // Simulate press combination
    await kbdInput.press('Control+Shift+K');

    // Assert shortcut success alert is displayed
    const successBanner = page.locator('#kbd-shortcut-success-banner');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText('Combo Unlocked!');
  });

  test('should verify sequential form element states', async ({ page }) => {
    const termsCheckbox = page.locator('#terms-checkbox-verify');
    const licenseInput = page.locator('#license-input-verify');
    const provisionBtn = page.locator('#provision-btn-verify');

    // Initial disabled assertions
    await expect(licenseInput).toBeDisabled();
    await expect(provisionBtn).toBeDisabled();

    // Step 1: Accept terms checkbox
    await termsCheckbox.check();
    await expect(licenseInput).toBeEnabled();

    // Step 2: Fill partial license (should remain disabled)
    await licenseInput.fill('ABCD');
    await expect(provisionBtn).toBeDisabled();

    // Step 3: Complete license to exactly 8 characters
    await licenseInput.fill('ABCDEFGH');
    await expect(provisionBtn).toBeEnabled();

    // Step 4: Click and verify transition success state
    await provisionBtn.click();
    await expect(provisionBtn).toHaveText(/Instance Fully Provisioned/);
  });

  test('should handle background validation asynchronous audits', async ({ page }) => {
    const startAuditBtn = page.locator('#btn-run-background-validation');
    const totalElementsLog = page.locator('#audit-total-elements');

    await startAuditBtn.click();
    
    // Assert asynchronous wait state is processed correctly
    await expect(totalElementsLog).toBeVisible({ timeout: 5000 });
    const countText = await totalElementsLog.textContent();
    expect(Number(countText)).toBeGreaterThan(0);
  });
});
```

### 🌲 Cypress (JavaScript)

```javascript
describe('Automation Practice Arena Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('tests interactive state transitions', () => {
    // Verify initial states
    cy.get('#license-input-verify').should('be.disabled');
    cy.get('#provision-btn-verify').should('be.disabled');

    // Enable safety bypass override
    cy.get('#override-switch-verify').click({ force: true });

    // Assert fields are unlocked globally
    cy.get('#license-input-verify').should('be.enabled');
  });

  it('performs scrolling validations on active grids', () => {
    // Scroll the ledger grid container to bottom and verify elements are accessible
    cy.get('#bank-ledger-grid-wrapper')
      .scrollTo('bottom')
      .find('#bank-ledger-grid tbody tr')
      .last()
      .should('be.visible');
  });
});
```

---

## 📦 How to Publish via GitHub Pages with a Custom Domain

### Step 1: Export Project from Google AI Studio
1. Open the **Settings/Project Menu** in the top-right corner of Google AI Studio.
2. Select **Export Code as ZIP** or use the **Connect/Export to GitHub** wizard if available.
3. If downloaded as a ZIP file, extract it locally on your development system.

### Step 2: Initialize a Local Git Repository
If you downloaded the code as a ZIP file, open your terminal at the folder root and run:
```bash
git init
git add .
git commit -m "feat: initial commit of automation practice arena"
```

### Step 3: Publish to GitHub
1. Create a new public repository on [GitHub](https://github.com).
2. Link your local project to GitHub and push your codebase:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 4: Configure Deploys with GitHub Pages
Since this is a client-side React + Vite single page application, you can host it 100% free using GitHub Actions or GitHub Pages static deployment:

#### Method A: Static deployment with Vite + `gh-pages` package
1. Install the deployment helper in your local terminal:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Open your `package.json` file and declare a `homepage` key and deploy script:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run the deployment script to compile assets and push them directly to a `gh-pages` branch:
   ```bash
   npm run deploy
   ```
4. Head to your repository on GitHub -> **Settings** -> **Pages**, and ensure the source is set to deploy from the `gh-pages` branch.

#### Method B: Zero-Config GitHub Actions
Alternatively, create a GitHub action workflow under `.github/workflows/deploy.yml` with any static web build template on commit to automatically compile and distribute builds using GitHub Pages containers.

### Step 5: Configure Your Custom URL (Domain)
To host the applet under your own professional custom URL (e.g., `test-sandbox.yourdomain.com`):

1. **In GitHub Pages Settings:**
   * Navigate to your GitHub repository -> **Settings** -> **Pages**.
   * Under **Custom domain**, input your custom web domain (e.g., `sandbox.yourname.dev`) and click **Save**. This creates a `CNAME` file at the root of your deployment branch automatically.

2. **In Your DNS Provider (GoDaddy, Namecheap, Route 53, Cloudflare):**
   * **For an apex/naked domain (e.g., `yourdomain.com`):** Add four `A` records pointing to GitHub's server IPs:
     * `185.199.108.153`
     * `185.199.109.153`
     * `185.199.110.153`
     * `185.199.111.153`
   * **For a subdomain (e.g., `sandbox.yourdomain.com`):** Add a `CNAME` record mapping your subdomain host (`sandbox`) directly to your default GitHub page URL:
     * **Host/Name:** `sandbox`
     * **Target/Points to:** `YOUR_USERNAME.github.io`
3. Enforce **HTTPS** in your GitHub Pages settings page for secure handshakes!

---

## 🛠️ Local Development

If you want to run or test changes on your local environment:

```bash
# 1. Install workspace dependencies
npm install

# 2. Fire up the local Vite development server
npm run dev

# 3. Compile static production bundles
npm run build
```

Developed with 💜 inside the **Google AI Studio Build Environment**. Have fun practicing your automation locators!
