import { test } from '../fixtures/eventswidget.fixture';
import { setWidth, setHeight } from '../helpers/size.actions';
import { expectIframeSize } from '../helpers/size.assertions';
import { expectGeneratedIframeCode } from '../helpers/code.assertions';

test('func: min allowed values', async ({ widgetPage }) => {
  await setWidth(widgetPage, 230);
  await setHeight(widgetPage, 240);

  await expectIframeSize(widgetPage, 230, 240);
  await expectGeneratedIframeCode(widgetPage);
});

test('func: max allowed values', async ({ widgetPage }) => {
  await setWidth(widgetPage, 1020);
  await setHeight(widgetPage, 720);

  await expectIframeSize(widgetPage, 1020, 720);
  await expectGeneratedIframeCode(widgetPage);
});