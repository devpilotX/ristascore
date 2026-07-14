import { test, expect } from "@playwright/test";

/**
 * Core loop end to end:
 * register -> consent -> verify -> badge -> public verify.
 *
 * Needs the app running with a real database (docker compose up, or
 * npm run build then npm run start with Postgres available).
 */
test("a user can register, verify, get a badge, and have it verified publicly", async ({
  page,
}) => {
  const email = `e2e_${Date.now()}@example.com`;

  // Register. This signs the user in and lands on the dashboard.
  await page.goto("/register");
  await page.fill("#full_name", "E2E Tester");
  await page.fill("#email", email);
  await page.fill("#password", "Test@12345");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard");
  await expect(page.getByText("Give your consent")).toBeVisible();

  // Fill the minimum details and agree to consent.
  await page.fill("#full_name", "E2E Tester");
  await page.fill("#id_number", "ABCD1234XYZ");
  await page.check('input[name="i_agree"]');

  // Run verification.
  await page.click('button:has-text("Run verification")');
  await expect(page.getByText("Your new badge is ready")).toBeVisible({ timeout: 30_000 });

  // Open the badge.
  await page.click('a:has-text("View")');
  await page.waitForURL("**/badge/**");
  await expect(page.getByText("Verified Trust Badge")).toBeVisible();

  // Grab the token from the badge page and verify it publicly.
  const token = (await page.locator(".token-box").innerText()).trim();
  expect(token.startsWith("rs_")).toBeTruthy();

  await page.goto(`/verify?token=${token}`);
  await expect(page.getByText("Active badge")).toBeVisible();
});
