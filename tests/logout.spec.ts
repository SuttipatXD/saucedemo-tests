// tests/logout.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { USERS } from '../test-data/users';

test.describe('Logout Feature', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });

  test('TC-OUT-001: logout สำเร็จและ redirect กลับหน้า Login', async ({ page }) => {
    await inventoryPage.logout();
    await expect(page).toHaveURL('/');
    await loginPage.expectLoginPageVisible();
  });

  test('TC-OUT-002: หลัง logout ไม่สามารถกลับไป inventory ด้วย back button', async ({ page }) => {
    await inventoryPage.logout();
    await page.goBack();
    // Should stay on login or redirect back to login
    await expect(page).toHaveURL('/');
  });

  test('TC-OUT-003: เมนู Hamburger เปิดได้และแสดง Logout link', async ({ page }) => {
    await inventoryPage.openMenu();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
  });

  test('TC-OUT-004: หลัง logout แล้ว login ใหม่ได้ปกติ', async ({ page }) => {
    await inventoryPage.logout();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });
});
