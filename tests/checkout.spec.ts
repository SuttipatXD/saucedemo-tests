// tests/checkout.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, CHECKOUT_INFO, EXPECTED_MESSAGES } from '../test-data/users';

test.describe('Checkout Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    // Login and add 1 item to cart
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.goToCart();
    await cartPage.expectOnCartPage();
  });

  test.afterEach(async () => {
    await inventoryPage.resetAppState();
  });

  // ─── Complete Flow ─────────────────────────────────────────────────────────
  test('TC-CHK-001: Checkout flow สมบูรณ์ตั้งแต่ต้นจนจบ', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.expectOnCheckoutStepOne();

    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.expectOnCheckoutStepTwo();

    await checkoutPage.clickFinish();
    await checkoutPage.expectOnCheckoutComplete();
  });

  test('TC-CHK-002: หน้า Complete แสดง header และรูป pony express', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.completeImage).toBeVisible();
    await expect(checkoutPage.completeText).toBeVisible();
  });

  test('TC-CHK-003: Overview แสดงสินค้าและราคาถูกต้อง', async () => {
    const cartPrices = await cartPage.getCartItemPrices();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.expectOnCheckoutStepTwo();

    const subtotal = await checkoutPage.getSubtotal();
    expect(subtotal).toBeCloseTo(cartPrices[0], 2);
  });

  test('TC-CHK-004: Total = Subtotal + Tax', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();

    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  // ─── Validation: Empty Fields ──────────────────────────────────────────────
  test('TC-CHK-005: กด Continue โดยไม่กรอก First Name', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.emptyFirstName.firstName,
      CHECKOUT_INFO.emptyFirstName.lastName,
      CHECKOUT_INFO.emptyFirstName.postalCode
    );
    await checkoutPage.clickContinue();

    expect(await checkoutPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.checkout.emptyFirstName);
    await checkoutPage.expectOnCheckoutStepOne();
  });

  test('TC-CHK-006: กด Continue โดยไม่กรอก Last Name', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.emptyLastName.firstName,
      CHECKOUT_INFO.emptyLastName.lastName,
      CHECKOUT_INFO.emptyLastName.postalCode
    );
    await checkoutPage.clickContinue();

    expect(await checkoutPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.checkout.emptyLastName);
  });

  test('TC-CHK-007: กด Continue โดยไม่กรอก Postal Code', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.emptyPostalCode.firstName,
      CHECKOUT_INFO.emptyPostalCode.lastName,
      CHECKOUT_INFO.emptyPostalCode.postalCode
    );
    await checkoutPage.clickContinue();

    expect(await checkoutPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.checkout.emptyPostalCode);
  });

  test('TC-CHK-008: กด Continue โดยไม่กรอกข้อมูลเลย', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.clickContinue();

    expect(await checkoutPage.isErrorVisible()).toBeTruthy();
    expect(await checkoutPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.checkout.emptyFirstName);
  });

  // ─── Cancel ───────────────────────────────────────────────────────────────
  test('TC-CHK-009: กด Cancel ใน Step 1 กลับไป Cart', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.expectOnCheckoutStepOne();
    await checkoutPage.clickCancel();
    await cartPage.expectOnCartPage();
  });

  test('TC-CHK-010: กด Cancel ใน Step 2 กลับไป inventory', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.expectOnCheckoutStepTwo();
    await checkoutPage.clickCancel();
    await inventoryPage.expectOnInventoryPage();
  });

  test('TC-CHK-011: Back Home หลัง complete กลับไปหน้า Products', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await checkoutPage.clickBackHome();
    await inventoryPage.expectOnInventoryPage();
  });

  test('TC-CHK-012: Checkout หลายสินค้า Summary แสดงครบ', async ({ page }) => {
    // Add more items
    await page.goto('/inventory.html');
    await inventoryPage.addItemToCartByIndex(1);
    await inventoryPage.addItemToCartByIndex(2);
    await inventoryPage.goToCart();

    const cartCount = await cartPage.getCartItemCount();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillShippingInfo(
      CHECKOUT_INFO.valid.firstName,
      CHECKOUT_INFO.valid.lastName,
      CHECKOUT_INFO.valid.postalCode
    );
    await checkoutPage.clickContinue();

    const summaryCount = await checkoutPage.getSummaryItemCount();
    expect(summaryCount).toBe(cartCount);
  });
});
