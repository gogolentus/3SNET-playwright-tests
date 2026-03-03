import { test as base, expect, Page } from '@playwright/test';
import { openEventsWidget } from '../helpers/page.actions';

type EventsWidgetFixtures = {
  widgetPage: Page;
};

export const test = base.extend<EventsWidgetFixtures>({
  widgetPage: async ({ page }, use) => {
    const response = await openEventsWidget(page);

    expect(response, 'Main page response should exist').not.toBeNull();
    expect(response!.ok(), 'Main page should return 2xx').toBeTruthy();

    await use(page);
  },
});

export { expect };