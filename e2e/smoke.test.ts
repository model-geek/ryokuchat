import { expect, test } from "@playwright/test";

test("トップページが /login にリダイレクトされ正常にレスポンスを返す", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login/);
});
