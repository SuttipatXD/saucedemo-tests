# SauceDemo Playwright Tests

## 📁 Project Structure

```
saucedemo-tests/
├── pages/                    # Page Object Model (POM)
│   ├── BasePage.ts           # Base class สำหรับ page objects ทั้งหมด
│   ├── LoginPage.ts          # หน้า Login
│   ├── InventoryPage.ts      # หน้ารายการสินค้า
│   ├── CartPage.ts           # หน้าตะกร้าสินค้า
│   └── CheckoutPage.ts       # หน้า Checkout (Step 1, 2, Complete)
├── tests/                    # Test specs
│   ├── login.spec.ts         # 11 test cases
│   ├── cart.spec.ts          # 12 test cases
│   ├── checkout.spec.ts      # 12 test cases
│   ├── sorting.spec.ts       # 10 test cases
│   └── logout.spec.ts        # 4 test cases
├── test-data/
│   └── users.ts              # Test data & constants
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## ⚙️ Installation

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. ติดตั้ง Playwright browsers
npx playwright install
```

## 🚀 Running Tests

```bash
# รัน test ทั้งหมด
npm test

# รัน test แบบมีหน้าต่าง browser
npm run test:headed

# รัน test เฉพาะ feature
npm run test:login
npm run test:cart
npm run test:checkout

# ดู HTML report
npm run test:report
```

## 📊 Test Coverage Summary

| Feature | Test Cases | Positive | Negative | Edge |
|---------|-----------|----------|----------|------|
| Login | 11 | 2 | 6 | 3 |
| Cart | 12 | 9 | 2 | 1 |
| Checkout | 12 | 4 | 4 | 4 |
| Product Sorting | 10 | 7 | 0 | 3 |
| Logout | 4 | 3 | 1 | 0 |
| **Total** | **49** | **25** | **13** | **11** |

## 🐛 Known Bugs Found

### BUG-001: Cart ไม่ถูก reset หลัง logout (Medium)
- **Steps**: Login → Add item → Logout → Login ใหม่
- **Expected**: Cart ว่าง
- **Actual**: Cart ยังคงมีสินค้าจาก session ก่อน (พบใน some browsers)
- **Severity**: Medium

### BUG-002: Checkout ยอมรับ whitespace-only input ใน Shipping Information (Low)
- **Steps**: Login → ไปหน้า Cart → คลิก Checkout → กรอก "   " (1 spaces) ทุกช่องกรอก Input → คลิก Continue
- **Expected**: แสดง error "Error: Field is required" (validation ต้อง trim whitespace ก่อนตรวจสอบ)
- **Actual**: ระบบผ่านไป Checkout Step 2 ได้ และสามารถ Finish order ได้สำเร็จโดยที่ข้อมูลที่อยู่เป็น spaces ล้วน
- **Severity**: Low