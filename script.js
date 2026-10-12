const cards = [...document.querySelectorAll('[data-card]')];
const steps = [...document.querySelectorAll('.progress-step')];
const audio = document.querySelector('#loverAudio');
const soundButton = document.querySelector('#soundButton');
const soundLabel = document.querySelector('#soundLabel');
const video = document.querySelector('#birthdayVideo');
const sparkleLayer = document.querySelector('.cursor-sparkles');
const flowerLayer = document.querySelector('.asset-flowers');
let musicWasPlaying = false;
let lastSparkle = 0;
const sceneHashes = ['#intro', '#wish', '#memories'];

function showCard(index, updateHash = false) {
  const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
  cards.forEach((card) => {
    const active = Number(card.dataset.card) === safeIndex;
    card.classList.toggle('active', active);
    card.setAttribute('aria-hidden', String(!active));
  });
  steps.forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === safeIndex));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (updateHash && location.hash !== sceneHashes[safeIndex]) location.hash = sceneHashes[safeIndex];
  if (safeIndex !== 1 && video) video.pause();
  startMusic();
}

function syncSceneFromHash() {
  const index = Math.max(0, sceneHashes.indexOf(location.hash));
  showCard(index);
}

function setMusicState(isPlaying) {
  soundButton.classList.toggle('playing', isPlaying);
  soundButton.setAttribute('aria-pressed', String(isPlaying));
  soundLabel.textContent = isPlaying ? 'pause music' : 'play music';
}

function startMusic() {
  audio.volume = 0.52;
  audio.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}

function stopMusic() {
  audio.pause();
  setMusicState(false);
}

document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => showCard(Number(button.dataset.next), true)));
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showCard(Number(button.dataset.back), true)));
steps.forEach((step) => step.addEventListener('click', (event) => {
  event.preventDefault();
  showCard(Number(step.dataset.step), true);
}));
soundButton.addEventListener('click', () => audio.paused ? startMusic() : stopMusic());
window.addEventListener('hashchange', syncSceneFromHash);

audio.addEventListener('ended', () => setMusicState(false));
video.addEventListener('play', () => {
  musicWasPlaying = !audio.paused;
  stopMusic();
});
video.addEventListener('pause', () => {
  if (musicWasPlaying) startMusic();
  musicWasPlaying = false;
});
video.addEventListener('ended', () => {
  if (musicWasPlaying) startMusic();
  musicWasPlaying = false;
});

function randomizeFlowers() {
  if (!flowerLayer) return;
  const flowers = [...flowerLayer.querySelectorAll('.asset-flower')];
  const positions = [
    ['2%', '15%'], ['92%', '17%'], ['4%', '32%'], ['94%', '36%'], ['1%', '49%'],
    ['93%', '53%'], ['4%', '67%'], ['91%', '70%'], ['15%', '8%'], ['80%', '9%'],
    ['16%', '84%'], ['78%', '84%'], ['35%', '7%'], ['58%', '8%'], ['48%', '88%']
  ];
  flowers.sort(() => Math.random() - 0.5).forEach((flower, index) => {
    const [left, top] = positions[index];
    flowerLayer.appendChild(flower);
    flower.style.left = left;
    flower.style.top = top;
    flower.style.right = 'auto';
    flower.style.bottom = 'auto';
    flower.style.animationDelay = `${-(Math.random() * 16).toFixed(2)}s`;
  });
}

function addSparkle(x, y) {
  const sparkle = document.createElement('span');
  sparkle.className = 'cursor-sparkle';
  sparkle.textContent = Math.random() > 0.45 ? '✦' : '·';
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;
  sparkle.style.setProperty('--sparkle-rotate', `${Math.round(Math.random() * 80 - 40)}deg`);
  sparkleLayer.appendChild(sparkle);
  window.setTimeout(() => sparkle.remove(), 650);
}

document.addEventListener('pointermove', (event) => {
  const now = performance.now();
  if (now - lastSparkle > 45) {
    addSparkle(event.clientX, event.clientY);
    lastSparkle = now;
  }
});

randomizeFlowers();
syncSceneFromHash();
window.addEventListener('load', startMusic);
document.addEventListener('pointerdown', () => {
  if (audio.paused) startMusic();
}, { once: true });
