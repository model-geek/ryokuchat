import { expect, test } from "@playwright/test";

test("トップページが正常にレスポンスを返す", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});
