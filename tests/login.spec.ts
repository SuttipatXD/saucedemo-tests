// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS, EXPECTED_MESSAGES } from '../test-data/users';

test.describe('Login Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  // ─── Positive Cases ───────────────────────────────────────────────────────
  test('TC-LOG-001: เข้าสู่ระบบด้วย credentials ที่ถูกต้อง', async () => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });

  test('TC-LOG-002: หน้า Login แสดงองค์ประกอบครบถ้วน', async () => {
    await loginPage.expectLoginPageVisible();
    await expect(loginPage.page.locator('.login_logo')).toBeVisible();
  });

  // ─── Negative Cases ───────────────────────────────────────────────────────
  test('TC-LOG-003: เข้าสู่ระบบด้วย password ผิด', async () => {
    await loginPage.login(USERS.standard.username, 'wrong_password');
    expect(await loginPage.getErrorMessage()).toContain(
      EXPECTED_MESSAGES.login.invalidCredentials
    );
    await expect(loginPage.page).toHaveURL('/');
  });

  test('TC-LOG-004: เข้าสู่ระบบด้วย username ผิด', async () => {
    await loginPage.login('no_such_user', USERS.standard.password);
    expect(await loginPage.getErrorMessage()).toContain(
      EXPECTED_MESSAGES.login.invalidCredentials
    );
  });

  test('TC-LOG-005: เข้าสู่ระบบด้วย username ว่าง', async () => {
    await loginPage.login(USERS.emptyUsername.username, USERS.emptyUsername.password);
    expect(await loginPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.login.emptyUsername);
    expect(await loginPage.isUsernameFieldHighlighted()).toBeTruthy();
  });

  test('TC-LOG-006: เข้าสู่ระบบด้วย password ว่าง', async () => {
    await loginPage.login(USERS.emptyPassword.username, USERS.emptyPassword.password);
    expect(await loginPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.login.emptyPassword);
    expect(await loginPage.isPasswordFieldHighlighted()).toBeTruthy();
  });

  test('TC-LOG-007: เข้าสู่ระบบด้วย username และ password ว่างทั้งคู่', async () => {
    await loginPage.login(USERS.emptyBoth.username, USERS.emptyBoth.password);
    expect(await loginPage.getErrorMessage()).toBe(EXPECTED_MESSAGES.login.emptyUsername);
  });

  test('TC-LOG-008: ปุ่ม X ปิด error message ได้', async () => {
    await loginPage.login(USERS.emptyBoth.username, USERS.emptyBoth.password);
    expect(await loginPage.isErrorVisible()).toBeTruthy();
    await loginPage.dismissError();
    expect(await loginPage.isErrorVisible()).toBeFalsy();
  });

  test('TC-LOG-009: Error message แสดง icon ด้วย', async () => {
    await loginPage.login(USERS.emptyBoth.username, USERS.emptyBoth.password);
    await expect(loginPage.page.locator('.error-message-container svg')).toBeVisible();
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────
  test('TC-LOG-010: ไม่สามารถเข้า /inventory.html โดยตรงโดยไม่ login', async ({ page }) => {
    await page.goto('/inventory.html');
    // ควรถูก redirect กลับ login
    await expect(page).toHaveURL('/');
  });

  test('TC-LOG-011: Username/password เป็น case-sensitive', async () => {
    await loginPage.login('Standard_User', USERS.standard.password);
    expect(await loginPage.getErrorMessage()).toContain(
      EXPECTED_MESSAGES.login.invalidCredentials
    );
  });
});
