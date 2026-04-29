// pages/InventoryPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartIcon: Locator;
  readonly hamburgerMenu: Locator;
  readonly menuLogout: Locator;
  readonly menuResetAppState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryContainer = page.locator('.inventory_container');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartIcon = page.locator('.shopping_cart_link');
    this.hamburgerMenu = page.locator('#react-burger-menu-btn');
    this.menuLogout = page.locator('#logout_sidebar_link');
    this.menuResetAppState = page.locator('#reset_sidebar_link');
  }

  async expectOnInventoryPage() {
    await expect(this.page).toHaveURL(/inventory/);
    await expect(this.pageTitle).toHaveText('Products');
    await expect(this.inventoryContainer).toBeVisible();
  }

  async getInventoryItemCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return await this.inventoryItems.locator('.inventory_item_name').allInnerTexts();
  }

  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.inventoryItems.locator('.inventory_item_price').allInnerTexts();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async sortBy(sortValue: string) {
    await this.sortDropdown.selectOption(sortValue);
  }

  async addItemToCartByIndex(index: number) {
    const addBtn = this.inventoryItems.nth(index).locator('button');
    await addBtn.click();
  }

  async addItemToCartByName(itemName: string) {
    const item = this.inventoryItems.filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async removeItemFromInventoryByName(itemName: string) {
    const item = this.inventoryItems.filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.cartBadge.innerText();
    return parseInt(text, 10);
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async openMenu() {
    await this.hamburgerMenu.click();
  }

  async logout() {
    await this.openMenu();
    await this.menuLogout.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.menuResetAppState.click();
    // close menu after reset
    await this.page.locator('#react-burger-cross-btn').click();
  }

  async getAddButtonTextForItem(itemName: string): Promise<string> {
    const item = this.inventoryItems.filter({ hasText: itemName });
    return await item.locator('button').innerText();
  }
}
