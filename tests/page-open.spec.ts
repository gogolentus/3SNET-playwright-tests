import { test, expect } from '../fixtures/eventswidget.fixture';
import { expectGeneratedIframeCode } from '../helpers/code.assertions';

test('smoke: eventswidget page opens', async ({ widgetPage }) => {
  await expect(widgetPage.locator('h1.text-md.fw-bold.accent-color')).toBeVisible();
  await expect(widgetPage.locator('#code-copy-button')).toBeVisible();

  await expectGeneratedIframeCode(widgetPage);
});
