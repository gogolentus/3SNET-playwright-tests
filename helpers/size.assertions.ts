import { Page, expect } from '@playwright/test';

export async function expectIframeSize(
  page: Page,
  width: number,
  height: number
) {
  const textarea = page.locator('textarea#code');

  await expect(textarea).toHaveValue(
    new RegExp(`width="${width}"`)
  );
  await expect(textarea).toHaveValue(
    new RegExp(`height="${height}"`)
  );
}