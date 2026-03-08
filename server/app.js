const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS || 180000);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const REPORT_DIR = path.join(ROOT_DIR, 'playwright-report');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');
const PLAYWRIGHT_CLI = path.join(
  ROOT_DIR,
  'node_modules',
  '@playwright',
  'test',
  'cli.js'
);

const state = {
  status: 'ready',
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  lastRunDurationMs: null,
};

// Инициализация папки и файла истории
function initHistoryFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(RUNS_FILE)) {
    fs.writeFileSync(RUNS_FILE, '[]', 'utf8');
  }
}

// Чтение истории запусков тестов
function readHistory() {
  initHistoryFile();
  try {
    const raw = fs.readFileSync(RUNS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      return [];
    }
  } catch (_error) {
    return [];
  }
}

// Запись истории запусков
function writeHistory(runs) {
  initHistoryFile();
  fs.writeFileSync(RUNS_FILE, JSON.stringify(runs, null, 2), 'utf8');
}

// Добавление нового запуска тестов в историю
function addRunToHistory(record) {
  const runs = readHistory();
  runs.unshift(record);
  writeHistory(runs.slice(0, 100));
}

// Сброс состояний state при начале запуска
function setRunStartedState() {
  state.status = null;
  state.startedAt = new Date().toISOString();
  state.finishedAt = null;
  state.exitCode = null;
  state.lastRunDurationMs = null;
}

// Запуск Playwright
function startPlaywrightProcess() {
  if (fs.existsSync(PLAYWRIGHT_CLI)) {
    return spawn(process.execPath, [PLAYWRIGHT_CLI, 'test'], {
      cwd: ROOT_DIR,
      env: process.env,
    });
  }

  return spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['playwright', 'test'],
    {
      cwd: ROOT_DIR,
      env: process.env,
    }
  );
}

// Завершение запуска тестов
function finalizeRun(exitCode) {
  state.exitCode = typeof exitCode === 'number' ? exitCode : -1;
  state.finishedAt = new Date().toISOString();
  if (state.startedAt) {
    state.lastRunDurationMs =
      new Date(state.finishedAt).getTime() - new Date(state.startedAt).getTime();
  }
  state.status = state.exitCode === 0 ? 'passed' : 'failed';
}

// Сборка итогового JSON объекта для логов
function buildRunResult(timeout) {
  return {
    ok: state.status === 'passed',
    status: state.status,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    durationMs: state.lastRunDurationMs,
    exitCode: state.exitCode,
    message: timeout
      ? `Run timeout (${RUN_TIMEOUT_MS} ms)`
      : state.status === 'passed'
      ? 'Tests finished successfully'
      : `Tests failed with exit code ${state.exitCode}`,
  };
}

// Сборка и сохранение итогового объекта запуска 
function saveRunHistory() {
  addRunToHistory({
    id: Date.now(),
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    status: state.status,
    durationMs: state.lastRunDurationMs,
  });
}

// Ожидание завершения процесса запуска команды тестов
function waitForRunResult(child) {
  return new Promise((resolve) => {
    let finalized = false;
    let runTimeoutId = null;

    const complete = (exitCode, timeout = false) => {
      if (finalized) return;
      finalized = true;
      if (runTimeoutId) clearTimeout(runTimeoutId);

      finalizeRun(exitCode);
      saveRunHistory();
      resolve(buildRunResult(timeout));
    };

    child.on('error', () => complete(-1));
    child.on('exit', (code) => complete(code));
    child.on('close', (code) => complete(code));

    runTimeoutId = setTimeout(() => {
      try {
        child.kill();
      } catch (_error) {
        // ignore error
      }
      complete(-1, true);
    }, RUN_TIMEOUT_MS);
  });
}


app.use(express.json());
app.use(express.static(PUBLIC_DIR));
app.use('/playwright-report', express.static(REPORT_DIR));

// Метод списка истории
app.get('/api/history', (_req, res) => {
  return res.json({
    items: readHistory(),
  });
});

// Метод запуска тестов
app.post('/api/run', async (_req, res) => {
  setRunStartedState();

  let child;
  try {
    child = startPlaywrightProcess();
  } catch (error) {
    state.status = 'failed';
    state.finishedAt = new Date().toISOString();
    state.exitCode = -1;

    return res.status(500).json({
      ok: false,
      message: `Не удалось запустить: ${error.message}`,
    });
  }

  const result = await waitForRunResult(child);

  return res.status(200).json(result);
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API для запуска тестов запущено и принимает запросы по адресу http://localhost:${PORT}`);
});
