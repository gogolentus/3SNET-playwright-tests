# Events Widget QA Test for 3SNET (Playwright + TypeScript)

Тестовое задание для страницы:
`https://dev.3snet.info/eventswidget/`

## Требования

- Node.js LTS

## Быстрый запуск

### Установка зависимостей и браузера Chromium
```bash
npm run setup
```

### Запуск всех тестов Playwright
```bash
npm test
```

### Запуск тестов по отдельности (опционально)
```bash
npm test -- tests/page-open.spec.ts
```
```bash
npm test -- tests/form-size.spec.ts
```

## Просмотр HTML-отчета

    npm run test:report:ui

## Что покрыто

1. `Smoke-сценарий`
- страница открывается
- приходит успешный HTTP-ответ
- отображается основной заголовок
- кнопка "Скопировать код" присутствует
- автоматически генерируется iframe-код

2. `Генерация iframe-кода`
   
    2.1 `Минимально допустимые значения`
- значения width и height сгенерировались в iframe
- iframe присутствует в `textarea#code`
- `src` не пуст и присутствует в `textarea#code`
- обновление кода подтверждается проверкой итоговых `width/height` в `textarea#code`

    2.2 `Максимально допустимые значения`
- значения width и height сгенерировались в iframe
- iframe присутствует в `textarea#code`
- `src` не пуст и присутствует в `textarea#code`
- обновление кода подтверждается проверкой итоговых `width/height` в `textarea#code`

## Структура проекта

- `playwright.config.ts` - конфигурация Playwright
- `fixtures` - базовые фикстуры страницы
- `helpers` - helper-функции для страницы
- `tests` - smoke и functional тесты

## Особенности страницы

- в поле выбора страны отсутствует список стран
- в тестовом поле изначально присутствует код, но не сгенерировано превью по данному коду
