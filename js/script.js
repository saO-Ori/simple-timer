// 要素の取得
const inputTime = document.getElementById('inputTime');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const timeDisplay = document.getElementById('time');
const alarm = document.getElementById('alarmSound');
const stopHint = document.getElementById('stopHint');

let countdownInterval;
let remainingTime = 0;
let isRunning = false;

// ------------------------------
// スタート / 一時停止 / 再開切替
// ------------------------------
startButton.addEventListener('click', () => {
  if (!isRunning) {
    // タイマー未セットなら入力値からセット
    if (remainingTime === 0) {
      const raw = inputTime.value;
      remainingTime = parseSmartTime(raw);

      if (remainingTime <= 0) {
        alert('1秒以上の時間を入力してください');
        return;
      }
    }
    startCountdown();
    startButton.textContent = '一時停止';
  } else {
    pauseCountdown();
    startButton.textContent = '再開';
  }
});

// ------------------------------
// リセット
// ------------------------------
resetButton.addEventListener('click', resetTimer);

// ------------------------------
// 入力変更でリアルタイム表示更新（実行中は更新しない）
// ------------------------------
inputTime.addEventListener('input', () => {
  if (!isRunning) {
    const raw = inputTime.value;
    const temp = parseSmartTime(raw);
    updateDisplay(temp);
  }
});

// ------------------------------
// カウントダウン開始
// ------------------------------
function startCountdown() {
  isRunning = true;

  countdownInterval = setInterval(() => {
    remainingTime--;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      updateDisplay(0);
      alarm.play();
      isRunning = false;
      remainingTime = 0;
      startButton.textContent = 'スタート';

      // アラーム中だけ停止用イベントを設定
      stopHint.classList.add('show');
      document.body.addEventListener('click', stopAlarm);
      document.body.addEventListener('touchstart', stopAlarm);
    } else {
      updateDisplay(remainingTime);
    }
  }, 1000);
}

// ------------------------------
// 一時停止
// ------------------------------
function pauseCountdown() {
  isRunning = false;
  clearInterval(countdownInterval);
}

// ------------------------------
// リセット処理
// ------------------------------
function resetTimer() {
  clearInterval(countdownInterval);
  isRunning = false;
  remainingTime = 0;
  inputTime.value = '';
  updateDisplay(0);
  startButton.textContent = 'スタート';

  // アラーム停止時のヒント非表示 & イベント解除
  stopHint.classList.remove('show');
  alarm.currentTime = 0;
  document.body.removeEventListener('click', stopAlarm);
  document.body.removeEventListener('touchstart', stopAlarm);
}

// ------------------------------
// 表示更新（hh:mm:ss or mm:ss）
// ------------------------------
function updateDisplay(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  timeDisplay.textContent = h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ------------------------------
// 入力文字列から秒数に変換（6000特例あり）
// ------------------------------
function parseSmartTime(inputStr) {
  const raw = inputStr.replace(/\D/g, '').padStart(2, '0');
  if (raw === '6000') return 3600;
  const len = raw.length;
  const s = parseInt(raw.slice(-2), 10);
  const m = len > 2 ? parseInt(raw.slice(-4, -2), 10) : 0;
  const h = len > 4 ? parseInt(raw.slice(0, -4), 10) : 0;
  return h * 3600 + m * 60 + s;
}


// ------------------------------
// プリセット設定（実行中は無効）
// ------------------------------
function setPreset(seconds) {
  if (isRunning) return;
  remainingTime = seconds;
  updateDisplay(remainingTime);
  inputTime.value = `${Math.floor(seconds / 60)}${String(seconds % 60).padStart(2, '0')}`;
  startButton.textContent = 'スタート';
}

// ------------------------------
// アラーム停止 + リセット
// ------------------------------
function stopAlarm() {
  alarm.pause();
  alarm.currentTime = 0;
  stopHint.style.display = 'show';

  document.body.removeEventListener('click', stopAlarm);
  document.body.removeEventListener('touchstart', stopAlarm);

  resetTimer();
}
