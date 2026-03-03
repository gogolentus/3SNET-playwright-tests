import { Page, expect } from '@playwright/test';

export async function expectGeneratedIframeCode(page: Page) {
  const textarea = page.locator('textarea#code');

  await expect(textarea).toBeVisible();
  await expect(textarea).toHaveValue(/<iframe id="3snet-frame"/);
  await expect(textarea).toHaveValue(/src="[^"]+"/);
}