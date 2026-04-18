import { test, expect } from "@playwright/test";

test("landing shows hero and pricing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /coach sportif IA/i })).toBeVisible();
  await expect(page.getByText(/Premium/)).toBeVisible();
  await expect(page.getByText(/Pro/)).toBeVisible();
  await expect(page.getByText(/Elite/)).toBeVisible();
});
