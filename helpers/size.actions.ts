import { Page } from '@playwright/test';

export async function setWidth(page: Page, value: number) {
  const input = page.locator('input[name="width"]');
  await input.fill(String(value));
  await input.blur();
}

export async function setHeight(page: Page, value: number) {
  const input = page.locator('input[name="height"]');
  await input.fill(String(value));
  await input.blur();
}