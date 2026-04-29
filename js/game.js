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
let decorations = [];

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
// Verifica colisão entre um círculo e um retângulo.
// Usado para casas e pedras.
function circleRectCollision(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight) {
  const closestX = clamp(circleX, rectX, rectX + rectWidth);
  const closestY = clamp(circleY, rectY, rectY + rectHeight);

  const distanceX = circleX - closestX;
  const distanceY = circleY - closestY;

  return distanceX * distanceX + distanceY * distanceY < circleRadius * circleRadius;
}

// Verifica se uma entidade circular bateu em um obstáculo.
function isCollidingWithObstacle(entityX, entityY, entityRadius, obstacle) {
  // Árvore: colisão circular
  if (obstacle.type === "tree") {
    const distanceToTree = Math.hypot(entityX - obstacle.x, entityY - obstacle.y);

    return distanceToTree < entityRadius + obstacle.radius * 0.75;
  }

  // Pedra: colisão retangular aproximada
  if (obstacle.type === "rock") {
    return circleRectCollision(
      entityX,
      entityY,
      entityRadius,
      obstacle.x - obstacle.width / 2,
      obstacle.y - obstacle.height / 2,
      obstacle.width,
      obstacle.height
    );
  }

  // Casa: colisão retangular
  if (obstacle.type === "house") {
    return circleRectCollision(
      entityX,
      entityY,
      entityRadius,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  }

  return false;
}

// Verifica se uma posição bate em qualquer obstáculo do mapa.
function collidesWithAnyObstacle(entityX, entityY, entityRadius) {
  return obstacles.some((obstacle) => {
    return isCollidingWithObstacle(entityX, entityY, entityRadius, obstacle);
  });
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
    let botX;
    let botY;
    let attempts = 0;

    do {
      botX = randomBetween(120, WORLD_WIDTH - 120);
      botY = randomBetween(120, WORLD_HEIGHT - 120);
      attempts++;
    } while (
      collidesWithAnyObstacle(botX, botY, 17) &&
      attempts < 80
    );

    bots.push({
      x: botX,
      y: botY,
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
// Cria elementos decorativos do mapa.
// Esses elementos não bloqueiam o jogador, são apenas visuais.
function createDecorations() {
  decorations = [];

  // Gramas pequenas espalhadas pelo mapa
  for (let i = 0; i < 180; i++) {
    decorations.push({
      type: "grass",
      x: randomBetween(20, WORLD_WIDTH - 20),
      y: randomBetween(20, WORLD_HEIGHT - 20),
      size: randomBetween(8, 18),
      rotation: randomBetween(0, Math.PI * 2),
    });
  }

  // Arbustos pequenos
  for (let i = 0; i < 45; i++) {
    decorations.push({
      type: "bush",
      x: randomBetween(40, WORLD_WIDTH - 40),
      y: randomBetween(40, WORLD_HEIGHT - 40),
      radius: randomBetween(12, 22),
    });
  }
}
// Cria obstáculos reais do mapa.
// Esses elementos bloqueiam tiros e serão usados como árvores, pedras e casas.
function createObstacles() {
  obstacles = [];

  // Árvores
  for (let i = 0; i < 35; i++) {
    obstacles.push({
      type: "tree",
      x: randomBetween(80, WORLD_WIDTH - 80),
      y: randomBetween(80, WORLD_HEIGHT - 80),
      radius: randomBetween(22, 34),
      width: 0,
      height: 0,
    });
  }

  // Pedras
  for (let i = 0; i < 25; i++) {
    const size = randomBetween(34, 70);

    obstacles.push({
      type: "rock",
      x: randomBetween(80, WORLD_WIDTH - 80),
      y: randomBetween(80, WORLD_HEIGHT - 80),
      radius: size / 2,
      width: size,
      height: size * randomBetween(0.65, 0.9),
    });
  }

  // Casas simples
  for (let i = 0; i < 10; i++) {
    let houseX = randomBetween(120, WORLD_WIDTH - 220);
let houseY = randomBetween(120, WORLD_HEIGHT - 220);

// Evita casa muito próxima do spawn inicial do jogador.
if (
  Math.abs(houseX - WORLD_WIDTH / 2) < 250 &&
  Math.abs(houseY - WORLD_HEIGHT / 2) < 250
) {
  houseX += 350;
  houseY += 250;
}

houseX = clamp(houseX, 120, WORLD_WIDTH - 220);
houseY = clamp(houseY, 120, WORLD_HEIGHT - 220);

obstacles.push({
  type: "house",
  x: houseX,
  y: houseY,
      width: randomBetween(90, 150),
      height: randomBetween(80, 130),
      roofColor: "#7f1d1d",
      wallColor: "#78350f",
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
  createDecorations();
  createObstacles();
  createBots();
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

// Movimento separado por eixo.
// Isso evita travar totalmente quando encosta em uma parede.
const limitedNextX = clamp(nextX, player.radius, WORLD_WIDTH - player.radius);
const limitedNextY = clamp(nextY, player.radius, WORLD_HEIGHT - player.radius);

// Testa primeiro movimento no eixo X.
if (!collidesWithAnyObstacle(limitedNextX, player.y, player.radius)) {
  player.x = limitedNextX;
}

// Depois testa movimento no eixo Y.
if (!collidesWithAnyObstacle(player.x, limitedNextY, player.radius)) {
  player.y = limitedNextY;
}

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

      const nextBotX = bot.x + Math.cos(angle) * bot.speed;
const nextBotY = bot.y + Math.sin(angle) * bot.speed;

if (!collidesWithAnyObstacle(nextBotX, bot.y, bot.radius)) {
  bot.x = nextBotX;
}

if (!collidesWithAnyObstacle(bot.x, nextBotY, bot.radius)) {
  bot.y = nextBotY;
}

      // Atira no jogador
      if (distToPlayer < 430) {
        shootBullet(bot, player.x, player.y);
      }
    } else {
      // Movimento simples aleatório
      const randomNextX = bot.x + Math.sin(Date.now() / 700 + bot.x) * 0.45;
const randomNextY = bot.y + Math.cos(Date.now() / 700 + bot.y) * 0.45;

if (!collidesWithAnyObstacle(randomNextX, bot.y, bot.radius)) {
  bot.x = randomNextX;
}

if (!collidesWithAnyObstacle(bot.x, randomNextY, bot.radius)) {
  bot.y = randomNextY;
}
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
      // Colisão com árvore circular
      if (obstacle.type === "tree") {
        const hitTree =
          Math.hypot(bullet.x - obstacle.x, bullet.y - obstacle.y) <
          obstacle.radius;

        if (hitTree) {
          bullet.life = 0;
        }
      }

      // Colisão com pedra retangular/oval aproximada
      if (obstacle.type === "rock") {
        const hitRock =
          bullet.x > obstacle.x - obstacle.width / 2 &&
          bullet.x < obstacle.x + obstacle.width / 2 &&
          bullet.y > obstacle.y - obstacle.height / 2 &&
          bullet.y < obstacle.y + obstacle.height / 2;

        if (hitRock) {
          bullet.life = 0;
        }
      }

      // Colisão com casa retangular
      if (obstacle.type === "house") {
        const hitHouse =
          bullet.x > obstacle.x &&
          bullet.x < obstacle.x + obstacle.width &&
          bullet.y > obstacle.y &&
          bullet.y < obstacle.y + obstacle.height;

        if (hitHouse) {
          bullet.life = 0;
        }
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

/// Desenha o fundo principal do mapa.
function drawMap() {
  // Fundo base de grama
  ctx.fillStyle = "#14532d";
  ctx.fillRect(-camera.x, -camera.y, WORLD_WIDTH, WORLD_HEIGHT);

  // Variação de cor em grandes áreas para não parecer tudo chapado
  ctx.fillStyle = "rgba(22, 101, 52, 0.35)";
  for (let i = 0; i < 12; i++) {
    const x = ((i * 379) % WORLD_WIDTH) - camera.x;
    const y = ((i * 211) % WORLD_HEIGHT) - camera.y;

    ctx.beginPath();
    ctx.ellipse(x, y, 260, 140, i, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grade bem suave apenas para dar sensação de terreno
  ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
  ctx.lineWidth = 1;

  for (let x = 0; x < WORLD_WIDTH; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x - camera.x, -camera.y);
    ctx.lineTo(x - camera.x, WORLD_HEIGHT - camera.y);
    ctx.stroke();
  }

  for (let y = 0; y < WORLD_HEIGHT; y += 120) {
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
// Desenha detalhes do chão, como gramas e arbustos.
function drawDecorations() {
  decorations.forEach((decoration) => {
    const screenX = decoration.x - camera.x;
    const screenY = decoration.y - camera.y;

    if (decoration.type === "grass") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(decoration.rotation);

      ctx.strokeStyle = "rgba(134, 239, 172, 0.32)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -decoration.size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(decoration.size * 0.45, -decoration.size * 0.75);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-decoration.size * 0.45, -decoration.size * 0.75);
      ctx.stroke();

      ctx.restore();
    }

    if (decoration.type === "bush") {
      ctx.fillStyle = "rgba(21, 128, 61, 0.85)";
      ctx.beginPath();
      ctx.arc(screenX, screenY, decoration.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(34, 197, 94, 0.55)";
      ctx.beginPath();
      ctx.arc(
        screenX - decoration.radius * 0.35,
        screenY - decoration.radius * 0.25,
        decoration.radius * 0.45,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}
/// Desenha obstáculos: árvores, pedras e casas.
function drawObstacles() {
  obstacles.forEach((obstacle) => {
    const screenX = obstacle.x - camera.x;
    const screenY = obstacle.y - camera.y;

    // Árvores
    if (obstacle.type === "tree") {
      // Sombra
      ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
      ctx.beginPath();
      ctx.ellipse(screenX + 4, screenY + 8, obstacle.radius * 0.9, obstacle.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tronco
      ctx.fillStyle = "#78350f";
      ctx.fillRect(screenX - 6, screenY + 4, 12, 22);

      // Copa
      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.arc(screenX, screenY, obstacle.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(screenX - obstacle.radius * 0.35, screenY - obstacle.radius * 0.25, obstacle.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, obstacle.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pedras
    if (obstacle.type === "rock") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.ellipse(screenX + 3, screenY + 5, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#57534e";
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, obstacle.width / 2, obstacle.height / 2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#78716c";
      ctx.beginPath();
      ctx.ellipse(screenX - obstacle.width * 0.15, screenY - obstacle.height * 0.18, obstacle.width * 0.22, obstacle.height * 0.16, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, obstacle.width / 2, obstacle.height / 2, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Casas
    if (obstacle.type === "house") {
      // Sombra
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(screenX + 6, screenY + 8, obstacle.width, obstacle.height);

      // Parede
      ctx.fillStyle = obstacle.wallColor;
      ctx.fillRect(screenX, screenY, obstacle.width, obstacle.height);

      // Telhado
      ctx.fillStyle = obstacle.roofColor;
      ctx.beginPath();
      ctx.moveTo(screenX - 10, screenY + 10);
      ctx.lineTo(screenX + obstacle.width / 2, screenY - 35);
      ctx.lineTo(screenX + obstacle.width + 10, screenY + 10);
      ctx.closePath();
      ctx.fill();

      // Porta
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(
        screenX + obstacle.width * 0.42,
        screenY + obstacle.height * 0.58,
        obstacle.width * 0.18,
        obstacle.height * 0.42
      );

      // Janelas
      ctx.fillStyle = "#bae6fd";
      ctx.fillRect(
        screenX + obstacle.width * 0.14,
        screenY + obstacle.height * 0.28,
        obstacle.width * 0.18,
        obstacle.height * 0.18
      );

      ctx.fillRect(
        screenX + obstacle.width * 0.68,
        screenY + obstacle.height * 0.28,
        obstacle.width * 0.18,
        obstacle.height * 0.18
      );

      // Contorno
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX, screenY, obstacle.width, obstacle.height);
    }
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
  drawDecorations();
  drawLoots();

  bots.forEach((bot) => drawCharacter(bot, false));

  drawCharacter(player, true);
  drawBullets();
  drawObstacles();
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