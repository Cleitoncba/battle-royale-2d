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
const weaponText = document.getElementById("weaponText");
const killsText = document.getElementById("killsText");
const botsText = document.getElementById("botsText");
const zoneText = document.getElementById("zoneText");
const medkitsText = document.getElementById("medkitsText");
const shieldText = document.getElementById("shieldText");

const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");

const mobileShootButton = document.getElementById("mobileShootButton");
const mobileReloadButton = document.getElementById("mobileReloadButton");
const mobileHealButton = document.getElementById("mobileHealButton");
const mobilePistolButton = document.getElementById("mobilePistolButton");
const mobileRifleButton = document.getElementById("mobileRifleButton");
const mobileShotgunButton = document.getElementById("mobileShotgunButton");
const joystickArea = document.getElementById("joystickArea");
const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

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

// Estado do joystick mobile.
// x e y variam de -1 até 1.
const joystick = {
  active: false,
  pointerId: null,
  centerX: 0,
  centerY: 0,
  x: 0,
  y: 0,
  maxDistance: 42,
};

// Mouse/mira
const mouse = {
  x: 0,
  y: 0,
  worldX: 0,
  worldY: 0,
  down: false,
};

// Mira usada no celular.
// Ela começa apontando para a direita.
const mobileAim = {
  active: false,
  pointerId: null,
  angle: 0,
  worldX: 0,
  worldY: 0,
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
let loots = [];

// Dados da partida
let kills = 0;

// Zona segura
let safeZone;

// Configurações principais
const BOT_COUNT = 10;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_MAX_AMMO = 12;
const WEAPONS = {
  pistol: {
    id: "pistol",
    name: "Pistola",
    maxAmmo: 12,
    damage: 24,
    fireRate: 320,
    bulletSpeed: 6.5,
    bulletLife: 90,
    bulletsPerShot: 1,
    spread: 0,
    barrelLength: 34,
  },

  rifle: {
    id: "rifle",
    name: "Rifle",
    maxAmmo: 25,
    damage: 16,
    fireRate: 150,
    bulletSpeed: 7.8,
    bulletLife: 100,
    bulletsPerShot: 1,
    spread: 0.035,
    barrelLength: 38,
  },

  shotgun: {
    id: "shotgun",
    name: "Shotgun",
    maxAmmo: 6,
    damage: 13,
    fireRate: 650,
    bulletSpeed: 6.2,
    bulletLife: 40,
    bulletsPerShot: 5,
    spread: 0.32,
    barrelLength: 32,
  },
};
// Configurações para deixar o jogo mais jogável no celular
const BOT_BULLET_DAMAGE = 4;
const ZONE_DAMAGE_PLAYER = 0.025;
const ZONE_DAMAGE_BOT = 0.02;
const HEAL_AMOUNT = 35;
const HEAL_TIME = 900;
const START_MEDKITS = 2;
const START_SHIELD = 0;
const MAX_SHIELD = 100;

const LOOT_COUNT = 26;
const MEDKIT_LOOT_AMOUNT = 1;
const AMMO_LOOT_AMOUNT = 8;
const SHIELD_LOOT_AMOUNT = 25;

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
    speed: 2.6,
    health: PLAYER_MAX_HEALTH,
    currentWeapon: "pistol",

weaponsOwned: {
  pistol: true,
  rifle: false,
  shotgun: false,
},

ammoByWeapon: {
  pistol: WEAPONS.pistol.maxAmmo,
  rifle: 0,
  shotgun: 0,
},

maxAmmo: WEAPONS.pistol.maxAmmo,
    medkits: START_MEDKITS,
    healing: false,
    shield: START_SHIELD,
    reloadTime: 900,
    reloading: false,
    lastShot: 0,
    fireRate: 320,
    color: "#38bdf8",

    // Ângulo oficial da mira/arma.
    // 0 significa apontando para a direita.
    aimAngle: 0,
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
      speed: randomBetween(0.55, 0.95),
      health: 55,
      lastShot: 0,
      fireRate: randomBetween(1500, 2300),
      color: "#ef4444",
    });
  }
}
// Cria itens de loot espalhados pelo mapa.
// O jogador pega ao encostar neles.
function createLoots() {
  loots = [];

  const lootTypes = ["medkit", "ammo", "shield", "rifle", "shotgun"];

  for (let i = 0; i < LOOT_COUNT; i++) {
    const type = lootTypes[Math.floor(Math.random() * lootTypes.length)];

    loots.push({
      x: randomBetween(80, WORLD_WIDTH - 80),
      y: randomBetween(80, WORLD_HEIGHT - 80),
      radius: 14,
      type,
      pulse: randomBetween(0, Math.PI * 2),
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
    shrinkSpeed: 0.018,
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
  createLoots();
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
// Atualiza o ângulo oficial da arma do jogador.
// Esse ângulo será usado tanto para desenhar o canhão quanto para atirar.
function updatePlayerAimAngle() {
  if (!player) return;

  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    player.aimAngle = mobileAim.angle;
  } else {
    player.aimAngle = Math.atan2(
      mouse.worldY - player.y,
      mouse.worldX - player.x
    );
  }
}
// Atualiza o ponto da mira mobile com base no ângulo atual.
function updateMobileAimPosition() {
  mobileAim.worldX = player.x + Math.cos(mobileAim.angle) * 250;
  mobileAim.worldY = player.y + Math.sin(mobileAim.angle) * 250;
}
// Encontra o bot mais próximo do jogador.
// Isso será usado no botão de tiro do celular.
function findNearestBot() {
  if (!bots || bots.length === 0) {
    return null;
  }

  let nearestBot = null;
  let nearestDistance = Infinity;

  bots.forEach((bot) => {
    const currentDistance = Math.hypot(player.x - bot.x, player.y - bot.y);

    if (currentDistance < nearestDistance) {
      nearestDistance = currentDistance;
      nearestBot = bot;
    }
  });

  return nearestBot;
}
// Usa um kit médico para recuperar vida.
// Tem um pequeno tempo de uso para não ficar instantâneo demais.
function useMedkit() {
  if (!gameRunning || !player) return;

  // Não deixa curar se já estiver curando.
  if (player.healing) return;

  // Não cura se não tiver kit.
  if (player.medkits <= 0) return;

  // Não gasta kit se a vida já estiver cheia.
  if (player.health >= PLAYER_MAX_HEALTH) return;

  player.healing = true;

  setTimeout(() => {
    if (!gameRunning || !player) return;

    player.health = Math.min(PLAYER_MAX_HEALTH, player.health + HEAL_AMOUNT);
    player.medkits -= 1;
    player.healing = false;
  }, HEAL_TIME);
}
// Aplica dano no jogador.
// O escudo absorve primeiro. Quando o escudo acaba, o restante vai para a vida.
function applyDamageToPlayer(amount) {
  if (!player) return;

  if (player.shield > 0) {
    const shieldDamage = Math.min(player.shield, amount);
    player.shield -= shieldDamage;
    amount -= shieldDamage;
  }

  if (amount > 0) {
    player.health -= amount;
  }
}
// Retorna a arma atual do jogador.
function getCurrentWeapon() {
  return WEAPONS[player.currentWeapon];
}

// Troca a arma do jogador, se ele já tiver coletado essa arma.
function switchWeapon(weaponId) {
  if (!gameRunning || !player) return;
  if (!WEAPONS[weaponId]) return;
  if (!player.weaponsOwned[weaponId]) return;

  player.currentWeapon = weaponId;
  player.maxAmmo = WEAPONS[weaponId].maxAmmo;
}
// Recarrega arma
function reloadWeapon() {
  if (player.reloading) return;

  const weapon = getCurrentWeapon();

  if (player.ammoByWeapon[player.currentWeapon] === weapon.maxAmmo) return;

  player.reloading = true;

  setTimeout(() => {
    if (!gameRunning) return;

    player.ammoByWeapon[player.currentWeapon] = weapon.maxAmmo;
    player.reloading = false;
  }, player.reloadTime);
}

// Cria um tiro
function shootBullet(owner, targetX, targetY) {
  const now = Date.now();

  let weapon = null;

  if (owner === player) {
    weapon = getCurrentWeapon();

    if (player.reloading) return;

    if (player.ammoByWeapon[player.currentWeapon] <= 0) {
      reloadWeapon();
      return;
    }

    if (now - player.lastShot < weapon.fireRate) return;

    player.lastShot = now;
    player.ammoByWeapon[player.currentWeapon]--;
  } else {
    if (now - owner.lastShot < owner.fireRate) return;
    owner.lastShot = now;
  }

  const baseAngle = owner === player
    ? player.aimAngle
    : Math.atan2(targetY - owner.y, targetX - owner.x);

  const bulletsPerShot = owner === player ? weapon.bulletsPerShot : 1;
  const spread = owner === player ? weapon.spread : 0;
  const barrelLength = owner === player ? weapon.barrelLength : 22;

  for (let i = 0; i < bulletsPerShot; i++) {
    const middle = (bulletsPerShot - 1) / 2;
    const angleOffset = (i - middle) * spread;
    const angle = baseAngle + angleOffset;

    bullets.push({
      x: owner.x + Math.cos(angle) * barrelLength,
      y: owner.y + Math.sin(angle) * barrelLength,
      radius: owner === player && player.currentWeapon === "shotgun" ? 4 : 5,
      speed: owner === player ? weapon.bulletSpeed : 4.5,
      damage: owner === player ? weapon.damage : BOT_BULLET_DAMAGE,
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      owner,
      life: owner === player ? weapon.bulletLife : 90,
      color: owner === player ? "#facc15" : "#fb7185",
    });
  }
}

// Movimento do jogador
function updatePlayer() {
  let dx = 0;
let dy = 0;

// No PC, usa teclado.
// No celular, usa joystick.
const isMobile = window.innerWidth <= 900;

if (isMobile) {
  dx = joystick.x;
  dy = joystick.y;
} else {
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;
}

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
  applyDamageToPlayer(ZONE_DAMAGE_PLAYER);
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
      bot.health -= ZONE_DAMAGE_BOT;
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
// Aplica o efeito do loot coletado.
function collectLoot(loot) {
  if (loot.type === "medkit") {
    player.medkits += MEDKIT_LOOT_AMOUNT;
  }

  if (loot.type === "ammo") {
  const weapon = getCurrentWeapon();

  player.ammoByWeapon[player.currentWeapon] = Math.min(
    weapon.maxAmmo,
    player.ammoByWeapon[player.currentWeapon] + AMMO_LOOT_AMOUNT
  );
}

  if (loot.type === "shield") {
    player.shield = Math.min(MAX_SHIELD, player.shield + SHIELD_LOOT_AMOUNT);
  }
  if (loot.type === "rifle") {
  player.weaponsOwned.rifle = true;
  player.ammoByWeapon.rifle = WEAPONS.rifle.maxAmmo;
  switchWeapon("rifle");
}

if (loot.type === "shotgun") {
  player.weaponsOwned.shotgun = true;
  player.ammoByWeapon.shotgun = WEAPONS.shotgun.maxAmmo;
  switchWeapon("shotgun");
}
}

// Verifica se o jogador encostou em algum loot.
function updateLoots() {
  loots = loots.filter((loot) => {
    const picked = distance(player, loot) < player.radius + loot.radius;

    if (picked) {
      collectLoot(loot);
      return false;
    }

    return true;
  });
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
  applyDamageToPlayer(bullet.damage);
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
  updateMobileAimPosition();
  updatePlayerAimAngle();
}
// Atualiza HUD
function updateHUD() {
  healthText.textContent = player.healing
  ? "curando..."
  : Math.max(0, Math.floor(player.health));

  const weapon = getCurrentWeapon();

weaponText.textContent = weapon.name;
ammoText.textContent = player.reloading
  ? "..."
  : player.ammoByWeapon[player.currentWeapon];
  killsText.textContent = kills;
  botsText.textContent = bots.length;
  medkitsText.textContent = player.medkits;
  shieldText.textContent = Math.floor(player.shield);

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
// Desenha os itens de loot no mapa.
function drawLoots() {
  loots.forEach((loot) => {
    const screenX = loot.x - camera.x;
    const screenY = loot.y - camera.y;

    // Pulso visual simples
    const pulseSize = Math.sin(Date.now() / 250 + loot.pulse) * 2;

    let color = "#ffffff";
    let icon = "?";

    if (loot.type === "medkit") {
      color = "#22c55e";
      icon = "+";
    }

    if (loot.type === "ammo") {
      color = "#facc15";
      icon = "•";
    }

    if (loot.type === "shield") {
      color = "#38bdf8";
      icon = "S";
    }
    if (loot.type === "rifle") {
      color = "#a855f7";
      icon = "R";
}

    if (loot.type === "shotgun") {
    color = "#f97316";
    icon = "SG";
}

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, loot.radius + pulseSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = loot.type === "shotgun" ? "bold 11px Arial" : "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, screenX, screenY + 1);
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

  if (isPlayer) {
  // Usa o mesmo ângulo oficial para desenhar o canhão e para atirar.
  const angle = player.aimAngle;
  const isMobile = window.innerWidth <= 900;

  const weapon = getCurrentWeapon();
  const barrelLength = weapon.barrelLength;
  const barrelStart = 8;

  // Canhão/arma
  ctx.strokeStyle = "#e0f2fe";
  ctx.lineWidth = player.currentWeapon === "shotgun" ? 7 : 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(
    screenX + Math.cos(angle) * barrelStart,
    screenY + Math.sin(angle) * barrelStart
  );
  ctx.lineTo(
    screenX + Math.cos(angle) * barrelLength,
    screenY + Math.sin(angle) * barrelLength
  );
  ctx.stroke();

  // Ponta do canhão
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(
    screenX + Math.cos(angle) * barrelLength,
    screenY + Math.sin(angle) * barrelLength,
    4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Pequeno ponto indicando direção da mira no celular
  if (isMobile) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(
      screenX + Math.cos(angle) * 62,
      screenY + Math.sin(angle) * 62,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
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
  drawLoots();

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
  updateLoots();
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
  if (key === "h" && gameRunning) {
  useMedkit();
}
  if (key === "1" && gameRunning) {
  switchWeapon("pistol");
}

if (key === "2" && gameRunning) {
  switchWeapon("rifle");
}

if (key === "3" && gameRunning) {
  switchWeapon("shotgun");
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
    updatePlayerAimAngle();
    shootBullet(player, mouse.worldX, mouse.worldY);
  }
});

canvas.addEventListener("mouseup", () => {
  mouse.down = false;
});

// Botões do menu
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// ===============================
// JOYSTICK MOBILE
// ===============================

// Retorna a posição central da base do joystick na tela.
function getJoystickCenter() {
  const rect = joystickBase.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// Atualiza visualmente a bolinha do joystick.
function updateJoystickStick(deltaX, deltaY) {
  joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
}

// Reseta o joystick para o centro.
function resetJoystick() {
  joystick.active = false;
  joystick.pointerId = null;
  joystick.x = 0;
  joystick.y = 0;

  updateJoystickStick(0, 0);
}

// Atualiza o joystick com base no toque.
function updateJoystickFromPointer(event) {
  const deltaX = event.clientX - joystick.centerX;
  const deltaY = event.clientY - joystick.centerY;

  const distanceFromCenter = Math.hypot(deltaX, deltaY);
  const limitedDistance = Math.min(distanceFromCenter, joystick.maxDistance);

  const angle = Math.atan2(deltaY, deltaX);

  const limitedX = Math.cos(angle) * limitedDistance;
  const limitedY = Math.sin(angle) * limitedDistance;

  joystick.x = limitedX / joystick.maxDistance;
  joystick.y = limitedY / joystick.maxDistance;

  updateJoystickStick(limitedX, limitedY);
}

// Começa o controle do joystick.
joystickArea.addEventListener("pointerdown", (event) => {
  const isMobile = window.innerWidth <= 900;

  if (!isMobile || !gameRunning) return;

  event.preventDefault();
  event.stopPropagation();

  const center = getJoystickCenter();

  joystick.active = true;
  joystick.pointerId = event.pointerId;
  joystick.centerX = center.x;
  joystick.centerY = center.y;

  joystickArea.setPointerCapture(event.pointerId);

  updateJoystickFromPointer(event);
});

// Move o joystick.
joystickArea.addEventListener("pointermove", (event) => {
  if (!joystick.active) return;
  if (event.pointerId !== joystick.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  updateJoystickFromPointer(event);
});

// Solta o joystick.
joystickArea.addEventListener("pointerup", (event) => {
  if (event.pointerId !== joystick.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  resetJoystick();
});

// Cancela o joystick.
joystickArea.addEventListener("pointercancel", (event) => {
  if (event.pointerId !== joystick.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  resetJoystick();
});

// Função usada pelo botão de tiro no celular.
// Ela mira automaticamente no bot mais próximo.
function mobileShoot() {
  if (!gameRunning) return;

  // O alvo aqui é só uma referência.
  // A função shootBullet vai usar player.aimAngle quando o dono for o jogador.
  shootBullet(
    player,
    player.x + Math.cos(player.aimAngle) * 250,
    player.y + Math.sin(player.aimAngle) * 250
  );
}

// Botão mobile de tiro
mobileShootButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  mobileShoot();
});

// Botão mobile de recarregar
function mobileReload() {
  if (!gameRunning) return;
  reloadWeapon();
}

mobileReloadButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  mobileReload();
});
// Botão mobile de cura
function mobileHeal() {
  if (!gameRunning) return;
  useMedkit();
}

mobileHealButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  mobileHeal();
});
// Botões mobile para trocar de arma
mobilePistolButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  switchWeapon("pistol");
});

mobileRifleButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  switchWeapon("rifle");
});

mobileShotgunButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  switchWeapon("shotgun");
});
/// ===============================
// MIRA MOBILE COM MULTI-TOQUE
// ===============================

// Atualiza a direção da mira mobile usando a posição do toque.
function updateMobileAimFromPointer(event) {
  if (!gameRunning || !player) return;

  const touchWorldX = event.clientX + camera.x;
  const touchWorldY = event.clientY + camera.y;

  mobileAim.angle = Math.atan2(
    touchWorldY - player.y,
    touchWorldX - player.x
  );

  updateMobileAimPosition();
}

// Começa a controlar a mira no lado direito da tela.
canvas.addEventListener("pointerdown", (event) => {
  const isMobile = window.innerWidth <= 900;

  if (!isMobile || !gameRunning) return;

  // O lado esquerdo fica reservado para movimento.
  // O lado direito controla a mira.
  if (event.clientX < window.innerWidth * 0.42) return;

  mobileAim.active = true;
  mobileAim.pointerId = event.pointerId;

  canvas.setPointerCapture(event.pointerId);

  updateMobileAimFromPointer(event);
});

// Move a mira enquanto o dedo arrasta no lado direito.
canvas.addEventListener("pointermove", (event) => {
  const isMobile = window.innerWidth <= 900;

  if (!isMobile || !gameRunning) return;
  if (!mobileAim.active) return;
  if (event.pointerId !== mobileAim.pointerId) return;

  updateMobileAimFromPointer(event);
});

// Solta a mira quando o dedo sai da tela.
canvas.addEventListener("pointerup", (event) => {
  if (event.pointerId !== mobileAim.pointerId) return;

  mobileAim.active = false;
  mobileAim.pointerId = null;
});

// Cancela a mira se o toque for interrompido.
canvas.addEventListener("pointercancel", (event) => {
  if (event.pointerId !== mobileAim.pointerId) return;

  mobileAim.active = false;
  mobileAim.pointerId = null;
});
// Registra service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service Worker não registrado:", error);
    });
  });
}