const runBtn = document.getElementById('runBtn');
const logBox = document.getElementById('logBox');
const historyBody = document.getElementById('historyBody');

function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function renderHistory(items) {
  if (!historyBody) return;

  if (!items || items.length === 0) {
    historyBody.innerHTML = '<tr><td colspan="3" class="text-secondary">Запусков пока нет</td></tr>';
    return;
  }

  historyBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${formatDate(item.finishedAt || item.startedAt)}</td>
        <td>${item.status || '-'}</td>
        <td>${item.durationMs ?? '-'}</td>
      </tr>
    `
    )
    .join('');
}

async function refreshHistory() {
  try {
    const response = await fetch('/api/history');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    renderHistory(data.items || []);
  } catch (_error) {
    renderHistory([]);
  }
}

function setResult(text) {
  if (logBox) logBox.textContent = text;
}

async function runTests() {
  if (runBtn) runBtn.disabled = true;
  setResult('Выполняется...');

  try {
    const response = await fetch('/api/run', { method: 'POST' });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      setResult(`Ошибка запуска: ${data.message || 'Не удалось запустить тесты'}`);
      return;
    }

    setResult(`Статус: ${data.status}\nДлительность: ${data.durationMs} мс`);

  } catch (error) {
    setResult(`Ошибка запуска: ${error.message}`);
  } finally {
    if (runBtn) runBtn.disabled = false;
    await refreshHistory();
  }
}

if (runBtn) runBtn.addEventListener('click', runTests);

async function init() {
  await refreshHistory();
}

async function startApp() {
  try {
    await init();
  } catch (error) {
    setResult(`Ошибка запуска: ${error.message}`);
  }
}

startApp();
