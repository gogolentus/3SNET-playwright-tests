import { Page } from '@playwright/test';

export async function openEventsWidget(page: Page) {
  return await page.goto('/eventswidget/');
}