// tests/sorting.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS, SORT_OPTIONS } from '../test-data/users';

test.describe('Product Listing & Sorting Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });

  // ─── Product Listing ───────────────────────────────────────────────────────
  test('TC-SORT-001: หน้า inventory แสดงสินค้า 6 รายการ', async () => {
    const count = await inventoryPage.getInventoryItemCount();
    expect(count).toBe(6);
  });

  test('TC-SORT-002: สินค้าแต่ละชิ้นมีชื่อ รูปภาพ ราคา และปุ่ม Add to cart', async ({ page }) => {
    const items = await inventoryPage.inventoryItems.all();
    for (const item of items) {
      await expect(item.locator('.inventory_item_name')).toBeVisible();
      await expect(item.locator('.inventory_item_price')).toBeVisible();
      await expect(item.locator('img.inventory_item_img')).toBeVisible();
      await expect(item.locator('button')).toBeVisible();
    }
  });

  test('TC-SORT-003: ราคาสินค้าทุกชิ้นมีค่าเป็นบวก', async () => {
    const prices = await inventoryPage.getItemPrices();
    prices.forEach(price => {
      expect(price).toBeGreaterThan(0);
    });
  });

  // ─── Sorting ───────────────────────────────────────────────────────────────
  test('TC-SORT-004: เรียงชื่อ A-Z (default)', async () => {
    const names = await inventoryPage.getItemNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('TC-SORT-005: เรียงชื่อ Z-A', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.nameZA);
    const names = await inventoryPage.getItemNames();
    const sortedDesc = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sortedDesc);
  });

  test('TC-SORT-006: เรียงราคา Low to High', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.priceLowHigh);
    const prices = await inventoryPage.getItemPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('TC-SORT-007: เรียงราคา High to Low', async () => {
    await inventoryPage.sortBy(SORT_OPTIONS.priceHighLow);
    const prices = await inventoryPage.getItemPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('TC-SORT-008: Sort dropdown แสดง 4 options', async ({ page }) => {
    const options = await page.locator('[data-test="product-sort-container"] option').all();
    expect(options.length).toBe(4);
  });

  // ─── Product Detail ────────────────────────────────────────────────────────
  test('TC-SORT-009: คลิกชื่อสินค้าไปหน้า detail ได้', async ({ page }) => {
    await inventoryPage.inventoryItems.first().locator('.inventory_item_name').click();
    await expect(page).toHaveURL(/inventory-item/);
    await expect(page.locator('.inventory_details_name')).toBeVisible();
  });

  test('TC-SORT-010: คลิกรูปสินค้าไปหน้า detail ได้', async ({ page }) => {
    await inventoryPage.inventoryItems.first().locator('img.inventory_item_img').click();
    await expect(page).toHaveURL(/inventory-item/);
  });
});
