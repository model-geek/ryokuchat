import { expect, test } from "@playwright/test";

test("未認証で / にアクセスすると /login にリダイレクトされる", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("未認証で /profile にアクセスすると /login にリダイレクトされる", async ({
  page,
}) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});

test("未認証で /channels/xxx にアクセスすると /login にリダイレクトされる", async ({
  page,
}) => {
  await page.goto("/channels/xxx");
  await expect(page).toHaveURL(/\/login/);
});
