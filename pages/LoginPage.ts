// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async clearAndLogin(username: string, password: string) {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.login(username, password);
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.innerText();
  }

  async dismissError() {
    await this.errorCloseButton.click();
  }

  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isUsernameFieldHighlighted(): Promise<boolean> {
    const classes = await this.usernameInput.getAttribute('class') ?? '';
    return classes.includes('error');
  }

  async isPasswordFieldHighlighted(): Promise<boolean> {
    const classes = await this.passwordInput.getAttribute('class') ?? '';
    return classes.includes('error');
  }

  async expectLoginPageVisible() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
