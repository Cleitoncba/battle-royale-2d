// ===============================
// BATTLE ROYALE 2D - VERSÃO BASE
// ===============================

// Pega elementos do HTML
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const healthText = document.getElementById("healthText");
const ammoText = document.getElementById("ammoText");
const killsText = document.getElementById("killsText");
const botsText = document.getElementById("botsText");
const zoneText = document.getElementById("zoneText");

const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");

const mobileShootButton = document.getElementById("mobileShootButton");
const mobileReloadButton = document.getElementById("mobileReloadButton");

// Tamanho do mundo do jogo
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;

// Estado geral do jogo
let gameRunning = false;
let animationId = null;

// Teclas pressionadas
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

// Mouse/mira
const mouse = {
  x: 0,
  y: 0,
  worldX: 0,
  worldY: 0,
  down: false,
};

// Câmera segue o jogador
const camera = {
  x: 0,
  y: 0,
};

// Jogador principal
let player;

// Listas de entidades
let bots = [];
let bullets = [];
let obstacles = [];

// Dados da partida
let kills = 0;

// Zona segura
let safeZone;

// Configurações principais
const BOT_COUNT = 14;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_MAX_AMMO = 12;

// Ajusta o canvas ao tamanho da tela
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Cria número aleatório entre mínimo e máximo
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Calcula distância entre dois pontos
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Limita um valor entre mínimo e máximo
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Cria o jogador
function createPlayer() {
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    radius: 18,
    speed: 4,
    health: PLAYER_MAX_HEALTH,
    ammo: PLAYER_MAX_AMMO,
    maxAmmo: PLAYER_MAX_AMMO,
    reloadTime: 900,
    reloading: false,
    lastShot: 0,
    fireRate: 220,
    color: "#38bdf8",
  };
}

// Cria bots inimigos
function createBots() {
  bots = [];

  for (let i = 0; i < BOT_COUNT; i++) {
    bots.push({
      x: randomBetween(120, WORLD_WIDTH - 120),
      y: randomBetween(120, WORLD_HEIGHT - 120),
      radius: 17,
      speed: randomBetween(1.3, 2.1),
      health: 55,
      lastShot: 0,
      fireRate: randomBetween(800, 1300),
      color: "#ef4444",
    });
  }
}

// Cria obstáculos no mapa
function createObstacles() {
  obstacles = [];

  for (let i = 0; i < 40; i++) {
    obstacles.push({
      x: randomBetween(80, WORLD_WIDTH - 180),
      y: randomBetween(80, WORLD_HEIGHT - 180),
      width: randomBetween(45, 120),
      height: randomBetween(45, 120),
      color: Math.random() > 0.5 ? "#166534" : "#57534e",
    });
  }
}

// Cria a zona segura
function createSafeZone() {
  safeZone = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    radius: 760,
    minRadius: 150,
    shrinkSpeed: 0.035,
  };
}

// Inicia uma nova partida
function startGame() {
  startScreen.classList.remove("active");
  endScreen.classList.remove("active");

  gameRunning = true;
  kills = 0;

  player = createPlayer();
  createBots();
  createObstacles();
  createSafeZone();

  bullets = [];

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  gameLoop();
}

// Finaliza a partida
function endGame(victory) {
  gameRunning = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  endScreen.classList.add("active");

  if (victory) {
    endTitle.textContent = "Vitória!";
    endMessage.textContent = `Você venceu a partida com ${kills} eliminações.`;
  } else {
    endTitle.textContent = "Derrota!";
    endMessage.textContent = `Você foi eliminado. Kills: ${kills}.`;
  }
}

// Atualiza posição do mouse no mundo
function updateMouseWorldPosition() {
  mouse.worldX = mouse.x + camera.x;
  mouse.worldY = mouse.y + camera.y;
}

// Recarrega arma
function reloadWeapon() {
  if (player.reloading) return;
  if (player.ammo === player.maxAmmo) return;

  player.reloading = true;

  setTimeout(() => {
    if (!gameRunning) return;

    player.ammo = player.maxAmmo;
    player.reloading = false;
  }, player.reloadTime);
}

// Cria um tiro
function shootBullet(owner, targetX, targetY) {
  const now = Date.now();

  // Controle de cadência do jogador
  if (owner === player) {
    if (player.reloading) return;
    if (player.ammo <= 0) {
      reloadWeapon();
      return;
    }

    if (now - player.lastShot < player.fireRate) return;

    player.lastShot = now;
    player.ammo--;
  }

  // Controle de cadência dos bots
  if (owner !== player) {
    if (now - owner.lastShot < owner.fireRate) return;
    owner.lastShot = now;
  }

  const angle = Math.atan2(targetY - owner.y, targetX - owner.x);

  bullets.push({
    x: owner.x,
    y: owner.y,
    radius: 5,
    speed: owner === player ? 9 : 6,
    damage: owner === player ? 24 : 10,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    owner,
    life: 90,
    color: owner === player ? "#facc15" : "#fb7185",
  });
}

// Movimento do jogador
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;

  // Normaliza movimento diagonal
  if (dx !== 0 || dy !== 0) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
  }

  const nextX = player.x + dx * player.speed;
  const nextY = player.y + dy * player.speed;

  player.x = clamp(nextX, player.radius, WORLD_WIDTH - player.radius);
  player.y = clamp(nextY, player.radius, WORLD_HEIGHT - player.radius);

  // Dano fora da zona segura
  const distFromZoneCenter = Math.hypot(player.x - safeZone.x, player.y - safeZone.y);

  if (distFromZoneCenter > safeZone.radius) {
    player.health -= 0.08;
  }

  if (player.health <= 0) {
    endGame(false);
  }
}

// Atualiza bots
function updateBots() {
  bots.forEach((bot) => {
    const distToPlayer = distance(bot, player);

    // Se estiver perto, persegue o jogador
    if (distToPlayer < 520) {
      const angle = Math.atan2(player.y - bot.y, player.x - bot.x);

      bot.x += Math.cos(angle) * bot.speed;
      bot.y += Math.sin(angle) * bot.speed;

      // Atira no jogador
      if (distToPlayer < 430) {
        shootBullet(bot, player.x, player.y);
      }
    } else {
      // Movimento simples aleatório
      bot.x += Math.sin(Date.now() / 700 + bot.x) * 0.45;
      bot.y += Math.cos(Date.now() / 700 + bot.y) * 0.45;
    }

    bot.x = clamp(bot.x, bot.radius, WORLD_WIDTH - bot.radius);
    bot.y = clamp(bot.y, bot.radius, WORLD_HEIGHT - bot.radius);

    // Bots também tomam dano fora da zona
    const distFromZoneCenter = Math.hypot(bot.x - safeZone.x, bot.y - safeZone.y);

    if (distFromZoneCenter > safeZone.radius) {
      bot.health -= 0.04;
    }
  });

  // Remove bots mortos
  bots = bots.filter((bot) => {
    if (bot.health <= 0) {
      kills++;
      return false;
    }

    return true;
  });

  // Se todos os bots morreram, jogador vence
  if (bots.length === 0 && gameRunning) {
    endGame(true);
  }
}

// Atualiza tiros
function updateBullets() {
  bullets.forEach((bullet) => {
    bullet.x += bullet.vx * bullet.speed;
    bullet.y += bullet.vy * bullet.speed;
    bullet.life--;

    // Tiro do jogador acerta bot
    if (bullet.owner === player) {
      bots.forEach((bot) => {
        if (distance(bullet, bot) < bullet.radius + bot.radius) {
          bot.health -= bullet.damage;
          bullet.life = 0;
        }
      });
    }

    // Tiro dos bots acerta jogador
    if (bullet.owner !== player) {
      if (distance(bullet, player) < bullet.radius + player.radius) {
        player.health -= bullet.damage;
        bullet.life = 0;
      }
    }

    // Tiro bate em obstáculo
    obstacles.forEach((obstacle) => {
      if (
        bullet.x > obstacle.x &&
        bullet.x < obstacle.x + obstacle.width &&
        bullet.y > obstacle.y &&
        bullet.y < obstacle.y + obstacle.height
      ) {
        bullet.life = 0;
      }
    });
  });

  // Remove tiros expirados ou fora do mapa
  bullets = bullets.filter((bullet) => {
    const insideWorld =
      bullet.x >= 0 &&
      bullet.x <= WORLD_WIDTH &&
      bullet.y >= 0 &&
      bullet.y <= WORLD_HEIGHT;

    return bullet.life > 0 && insideWorld;
  });
}

// Atualiza zona segura
function updateSafeZone() {
  if (safeZone.radius > safeZone.minRadius) {
    safeZone.radius -= safeZone.shrinkSpeed;
  }
}

// Atualiza câmera
function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = clamp(camera.x, 0, WORLD_WIDTH - canvas.width);
  camera.y = clamp(camera.y, 0, WORLD_HEIGHT - canvas.height);

  updateMouseWorldPosition();
}

// Atualiza HUD
function updateHUD() {
  healthText.textContent = Math.max(0, Math.floor(player.health));
  ammoText.textContent = player.reloading ? "..." : player.ammo;
  killsText.textContent = kills;
  botsText.textContent = bots.length;

  const zonePercent = Math.floor((safeZone.radius / 760) * 100);
  zoneText.textContent = `${Math.max(0, zonePercent)}%`;
}

// Desenha fundo do mapa
function drawMap() {
  ctx.fillStyle = "#166534";
  ctx.fillRect(-camera.x, -camera.y, WORLD_WIDTH, WORLD_HEIGHT);

  // Linhas leves no chão
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;

  for (let x = 0; x < WORLD_WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x - camera.x, -camera.y);
    ctx.lineTo(x - camera.x, WORLD_HEIGHT - camera.y);
    ctx.stroke();
  }

  for (let y = 0; y < WORLD_HEIGHT; y += 80) {
    ctx.beginPath();
    ctx.moveTo(-camera.x, y - camera.y);
    ctx.lineTo(WORLD_WIDTH - camera.x, y - camera.y);
    ctx.stroke();
  }
}

// Desenha zona segura
function drawSafeZone() {
  // Área escura total
  ctx.fillStyle = "rgba(15, 23, 42, 0.36)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Recorta visualmente a área segura
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(
    safeZone.x - camera.x,
    safeZone.y - camera.y,
    safeZone.radius,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Borda da zona
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(
    safeZone.x - camera.x,
    safeZone.y - camera.y,
    safeZone.radius,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}

// Desenha obstáculos
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(
      obstacle.x - camera.x,
      obstacle.y - camera.y,
      obstacle.width,
      obstacle.height
    );

    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      obstacle.x - camera.x,
      obstacle.y - camera.y,
      obstacle.width,
      obstacle.height
    );
  });
}

// Desenha personagem ou bot
function drawCharacter(entity, isPlayer = false) {
  const screenX = entity.x - camera.x;
  const screenY = entity.y - camera.y;

  // Corpo
  ctx.fillStyle = entity.color;
  ctx.beginPath();
  ctx.arc(screenX, screenY, entity.radius, 0, Math.PI * 2);
  ctx.fill();

  // Borda
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Barra de vida
  const barWidth = 42;
  const barHeight = 6;
  const healthPercent = clamp(entity.health / (isPlayer ? PLAYER_MAX_HEALTH : 55), 0, 1);

  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(screenX - barWidth / 2, screenY - entity.radius - 15, barWidth, barHeight);

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(
    screenX - barWidth / 2,
    screenY - entity.radius - 15,
    barWidth * healthPercent,
    barHeight
  );

  // Mira/direção do jogador
  if (isPlayer) {
    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);

    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(
      screenX + Math.cos(angle) * 32,
      screenY + Math.sin(angle) * 32
    );
    ctx.stroke();
  }
}

// Desenha tiros
function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(
      bullet.x - camera.x,
      bullet.y - camera.y,
      bullet.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

// Desenha todos os elementos
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawObstacles();

  bots.forEach((bot) => drawCharacter(bot, false));

  drawCharacter(player, true);
  drawBullets();
  drawSafeZone();
}

// Loop principal do jogo
function gameLoop() {
  if (!gameRunning) return;

  updatePlayer();
  updateBots();
  updateBullets();
  updateSafeZone();
  updateCamera();
  updateHUD();

  draw();

  animationId = requestAnimationFrame(gameLoop);
}

// Eventos de teclado
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key in keys) {
    keys[key] = true;
  }

  if (key === "r" && gameRunning) {
    reloadWeapon();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (key in keys) {
    keys[key] = false;
  }
});

// Movimento do mouse
canvas.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  updateMouseWorldPosition();
});

// Clique para atirar
canvas.addEventListener("mousedown", () => {
  mouse.down = true;

  if (gameRunning) {
    shootBullet(player, mouse.worldX, mouse.worldY);
  }
});

canvas.addEventListener("mouseup", () => {
  mouse.down = false;
});

// Botões do menu
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// Controles mobile de movimento
document.querySelectorAll(".movement-buttons button").forEach((button) => {
  const key = button.dataset.key;

  button.addEventListener("touchstart", (event) => {
    event.preventDefault();
    keys[key] = true;
  });

  button.addEventListener("touchend", (event) => {
    event.preventDefault();
    keys[key] = false;
  });

  button.addEventListener("mousedown", () => {
    keys[key] = true;
  });

  button.addEventListener("mouseup", () => {
    keys[key] = false;
  });
});

// Botão mobile de tiro
mobileShootButton.addEventListener("touchstart", (event) => {
  event.preventDefault();

  if (!gameRunning) return;

  // No celular, atira para a direita por padrão
  shootBullet(player, player.x + 200, player.y);
});

mobileShootButton.addEventListener("click", () => {
  if (!gameRunning) return;

  shootBullet(player, player.x + 200, player.y);
});

// Botão mobile de recarregar
mobileReloadButton.addEventListener("touchstart", (event) => {
  event.preventDefault();
  reloadWeapon();
});

mobileReloadButton.addEventListener("click", reloadWeapon);

// Registra service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service Worker não registrado:", error);
    });
  });
}