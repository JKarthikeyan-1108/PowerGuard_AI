import { test, expect } from '@playwright/test';

test('login page has title and login form', async ({ page }) => {
  await page.goto('/login');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/PowerGuard/);

  // Expect the email and password fields to be visible
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});

test('shows error on invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill('invalid@test.com');
  await page.getByLabel(/password/i).fill('wrongpass');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Depends on UI implementation, but generally expecting an error message or toast
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});
