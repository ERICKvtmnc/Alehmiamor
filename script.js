const heartsContainers = document.querySelectorAll(".floating-hearts");

heartsContainers.forEach((container) => {
  const count = Number(container.dataset.hearts || 20);

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty("--size", `${Math.random() * 1.2 + 0.7}rem`);
    heart.style.setProperty("--duration", `${Math.random() * 10 + 10}s`);
    heart.style.setProperty("--delay", `${Math.random() * 10}s`);
    container.appendChild(heart);
  }
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealElements.forEach((element) => revealObserver.observe(element));

const startDate = new Date("2026-01-19T00:00:00-03:00").getTime();

function updateCounter() {
  const elapsed = Math.max(0, Date.now() - startDate);
  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  document.querySelector("#days").textContent = Math.floor(elapsed / day);
  document.querySelector("#hours").textContent = String(
    Math.floor((elapsed % day) / hour),
  ).padStart(2, "0");
  document.querySelector("#minutes").textContent = String(
    Math.floor((elapsed % hour) / minute),
  ).padStart(2, "0");
  document.querySelector("#seconds").textContent = String(
    Math.floor((elapsed % minute) / 1000),
  ).padStart(2, "0");
}

updateCounter();
setInterval(updateCounter, 1000);

const gameArea = document.querySelector("#game-area");
const gameStart = document.querySelector("#game-start");
const gameHud = document.querySelector("#game-hud");
const gameOver = document.querySelector("#game-over");
const startButton = document.querySelector("#start-game");
const restartButton = document.querySelector("#restart-game");
const scoreElement = document.querySelector("#score");
const finalScoreElement = document.querySelector("#final-score");
const livesElement = document.querySelector("#lives");

let playing = false;
let score = 0;
let escaped = 0;
let heartId = 0;
let spawnTimer;
let gameStartTime = 0;

function updateLives() {
  livesElement.textContent = `${"♥ ".repeat(3 - escaped)}${"♡ ".repeat(
    escaped,
  )}`.trim();
}

function clearFallingHearts() {
  gameArea.querySelectorAll(".falling-heart").forEach((heart) => {
    heart.remove();
  });
}

function finishGame() {
  playing = false;
  clearTimeout(spawnTimer);
  clearFallingHearts();
  gameHud.classList.add("hidden");
  gameOver.classList.remove("hidden");
  finalScoreElement.textContent = score;
}

function heartEscaped(heart) {
  if (!playing || !heart.isConnected) return;

  heart.remove();
  escaped += 1;
  updateLives();

  if (escaped >= 3) {
    finishGame();
  }
}

function createFallingHeart() {
  if (!playing) return;

  const heart = document.createElement("button");
  const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
  const speedIncrease = Math.min(elapsedSeconds * 0.12, 2.1);
  const duration = Math.max(
    1.15,
    Math.random() * 1.35 + 2.75 - speedIncrease,
  );

  heart.type = "button";
  heart.className = "falling-heart";
  heart.textContent = "♥";
  heart.dataset.id = String(heartId++);
  heart.style.left = `${Math.random() * 80 + 10}%`;
  heart.style.setProperty("--fall-duration", `${duration}s`);

  heart.addEventListener("click", () => {
    if (!playing) return;
    score += 1;
    scoreElement.textContent = score;
    heart.remove();
  });

  heart.addEventListener("animationend", () => heartEscaped(heart));
  gameArea.appendChild(heart);
}

function startGame() {
  clearTimeout(spawnTimer);
  clearFallingHearts();

  playing = true;
  score = 0;
  escaped = 0;
  heartId = 0;
  gameStartTime = Date.now();

  scoreElement.textContent = "0";
  updateLives();
  gameStart.classList.add("hidden");
  gameOver.classList.add("hidden");
  gameHud.classList.remove("hidden");

  const scheduleNextHeart = () => {
    if (!playing) {
      return;
    }

    const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
    const spawnDelay = Math.max(260, 760 - elapsedSeconds * 18);
    const activeHearts = gameArea.querySelectorAll(".falling-heart").length;

    if (activeHearts < 8) {
      createFallingHeart();
    }

    spawnTimer = setTimeout(scheduleNextHeart, spawnDelay);
  };

  scheduleNextHeart();
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);