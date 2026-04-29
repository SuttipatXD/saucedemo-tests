// pages/CartPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async expectOnCartPage() {
    await expect(this.page).toHaveURL(/cart/);
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return await this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }

  async getCartItemPrices(): Promise<number[]> {
    const priceTexts = await this.cartItems.locator('.inventory_item_price').allInnerTexts();
    return priceTexts.map(p => parseFloat(p.replace('$', '')));
  }

  async removeItemByName(itemName: string) {
    const item = this.cartItems.filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async removeAllItems() {
    const count = await this.cartItems.count();
    for (let i = count - 1; i >= 0; i--) {
      await this.cartItems.nth(i).locator('button').click();
    }
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async isCartEmpty(): Promise<boolean> {
    return (await this.cartItems.count()) === 0;
  }

  async getItemQuantity(itemName: string): Promise<number> {
    const item = this.cartItems.filter({ hasText: itemName });
    const qty = await item.locator('.cart_quantity').innerText();
    return parseInt(qty, 10);
  }
}
