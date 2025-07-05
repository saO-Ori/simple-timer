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
// 時間表示更新 mm:ss形式
// ------------------------------
function updateDisplay(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  timeDisplay.textContent = `${m}:${s}`;
}

// ------------------------------
// 入力文字列から秒数を計算（例: 120 → 1分20秒）
// ------------------------------
function parseSmartTime(inputStr) {
  const num = parseInt(inputStr, 10);
  if (isNaN(num) || num < 0) return 0;

  if (num < 100) {
    return num;
  } else {
    const min = Math.floor(num / 100);
    const sec = num % 100;
    return min * 60 + sec;
  }
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
