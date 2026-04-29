// tests/cart.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { USERS } from '../test-data/users';

test.describe('Cart Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });

  test.afterEach(async () => {
    // Reset state after each test
    await inventoryPage.resetAppState();
  });

  // ─── Add to Cart ──────────────────────────────────────────────────────────
  test('TC-CART-001: เพิ่มสินค้าชิ้นแรกลงตะกร้า และ badge แสดงเลข 1', async () => {
    await inventoryPage.addItemToCartByIndex(0);
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(1);
  });

  test('TC-CART-002: เพิ่มสินค้าหลายชิ้น badge count อัปเดตถูกต้อง', async () => {
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.addItemToCartByIndex(1);
    await inventoryPage.addItemToCartByIndex(2);
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(3);
  });

  test('TC-CART-003: ปุ่ม Add to cart เปลี่ยนเป็น Remove หลังเพิ่มสินค้า', async () => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCartByName(itemName);
    const buttonText = await inventoryPage.getAddButtonTextForItem(itemName);
    expect(buttonText.toLowerCase()).toBe('remove');
  });

  test('TC-CART-004: ตะกร้าแสดงสินค้าที่เพิ่มไว้ถูกต้อง', async () => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCartByName(itemName);
    await inventoryPage.goToCart();
    await cartPage.expectOnCartPage();

    const cartItemNames = await cartPage.getCartItemNames();
    expect(cartItemNames).toContain(itemName);
  });

  test('TC-CART-005: ราคาสินค้าในตะกร้าตรงกับหน้า inventory', async () => {
    await inventoryPage.addItemToCartByIndex(0);
    const inventoryPrices = await inventoryPage.getItemPrices();
    
    await inventoryPage.goToCart();
    await cartPage.expectOnCartPage();
    const cartPrices = await cartPage.getCartItemPrices();
    
    expect(cartPrices[0]).toBe(inventoryPrices[0]);
  });

  test('TC-CART-006: quantity ของแต่ละ item ในตะกร้าเป็น 1', async () => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCartByName(itemName);
    await inventoryPage.goToCart();

    const qty = await cartPage.getItemQuantity(itemName);
    expect(qty).toBe(1);
  });

  // ─── Remove from Cart ─────────────────────────────────────────────────────
  test('TC-CART-007: ลบสินค้าออกจากตะกร้าในหน้า Cart', async () => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCartByName(itemName);
    await inventoryPage.goToCart();
    await cartPage.expectOnCartPage();

    await cartPage.removeItemByName(itemName);
    expect(await cartPage.isCartEmpty()).toBeTruthy();
  });

  test('TC-CART-008: badge หายไปเมื่อลบสินค้าทั้งหมด', async () => {
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.goToCart();
    await cartPage.removeAllItems();

    const badgeVisible = await inventoryPage.cartBadge.isVisible();
    expect(badgeVisible).toBeFalsy();
  });

  test('TC-CART-009: ลบสินค้าจาก inventory page ด้วยปุ่ม Remove', async () => {
    const itemName = 'Sauce Labs Backpack';
    await inventoryPage.addItemToCartByName(itemName);
    await inventoryPage.removeItemFromInventoryByName(itemName);

    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(0);

    const buttonText = await inventoryPage.getAddButtonTextForItem(itemName);
    expect(buttonText.toLowerCase()).toBe('add to cart');
  });

  // ─── Navigation from Cart ─────────────────────────────────────────────────
  test('TC-CART-010: ปุ่ม Continue Shopping กลับไปหน้า inventory', async () => {
    await inventoryPage.addItemToCartByIndex(0);
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    await inventoryPage.expectOnInventoryPage();
  });

  test('TC-CART-011: ตะกร้าว่างไม่มี badge แสดง', async () => {
    await inventoryPage.goToCart();
    const badgeVisible = await inventoryPage.cartBadge.isVisible();
    expect(badgeVisible).toBeFalsy();
  });

  test('TC-CART-012: เพิ่มสินค้าทั้ง 6 ชิ้น badge count = 6', async () => {
    const totalItems = await inventoryPage.getInventoryItemCount();
    for (let i = 0; i < totalItems; i++) {
      await inventoryPage.addItemToCartByIndex(i);
    }
    const count = await inventoryPage.getCartBadgeCount();
    expect(count).toBe(totalItems);
  });
});
