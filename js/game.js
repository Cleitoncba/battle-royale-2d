// ===============================
// BATTLE ROYALE 2D - VERSÃO BASE
// ===============================

// Pega elementos do HTML
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let miniMapCanvas = document.getElementById("miniMapCanvas");
let miniMapCtx = null;

function setupMiniMap() {
  // Se o canvas do mini mapa não existir no HTML, cria automaticamente.
  if (!miniMapCanvas) {
    miniMapCanvas = document.createElement("canvas");
    miniMapCanvas.id = "miniMapCanvas";
    document.body.appendChild(miniMapCanvas);
  }

  miniMapCtx = miniMapCanvas.getContext("2d");

  // Força o estilo visual do mini mapa pelo JavaScript.
  miniMapCanvas.style.position = "fixed";
  miniMapCanvas.style.top = "86px";
  miniMapCanvas.style.right = "18px";
  miniMapCanvas.style.zIndex = "99999";
  hideMiniMap();
  miniMapCanvas.style.visibility = "visible";
  miniMapCanvas.style.opacity = "1";
  miniMapCanvas.style.width = "190px";
  miniMapCanvas.style.height = "130px";
  miniMapCanvas.style.background = "rgba(15, 23, 42, 0.96)";
  miniMapCanvas.style.border = "3px solid rgba(56, 189, 248, 0.95)";
  miniMapCanvas.style.borderRadius = "16px";
  miniMapCanvas.style.boxShadow = "0 14px 35px rgba(0,0,0,0.55)";
  miniMapCanvas.style.pointerEvents = "none";
}

function showMiniMap() {
  if (!miniMapCanvas) return;

  miniMapCanvas.style.setProperty("display", "block", "important");
  miniMapCanvas.style.setProperty("visibility", "visible", "important");
  miniMapCanvas.style.setProperty("opacity", "1", "important");
}

function hideMiniMap() {
  if (!miniMapCanvas) return;

  miniMapCanvas.style.setProperty("display", "none", "important");
  miniMapCanvas.style.setProperty("visibility", "hidden", "important");
  miniMapCanvas.style.setProperty("opacity", "0", "important");
}

const rankingList = document.getElementById("rankingList");
const clearRankingButton = document.getElementById("clearRankingButton");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");

const pauseScreen = document.getElementById("pauseScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const pauseButton = document.getElementById("pauseButton");
const soundButton = document.getElementById("soundButton");
const menuSoundButton = document.getElementById("menuSoundButton");
const resumeButton = document.getElementById("resumeButton");
const restartPauseButton = document.getElementById("restartPauseButton");
const backToMenuButton = document.getElementById("backToMenuButton");

const healthText = document.getElementById("healthText");
const ammoText = document.getElementById("ammoText");
const weaponText = document.getElementById("weaponText");
const killsText = document.getElementById("killsText");
const botsText = document.getElementById("botsText");
const zoneText = document.getElementById("zoneText");
const mapText = document.getElementById("mapText");
const difficultyText = document.getElementById("difficultyText");
const medkitsText = document.getElementById("medkitsText");
const shieldText = document.getElementById("shieldText");

const shopCoinsText = document.getElementById("shopCoinsText");
const shopGemsText = document.getElementById("shopGemsText");
const shopCategoryButtons = document.querySelectorAll(".shop-category-button");
const shopItemsGrid = document.getElementById("shopItemsGrid");

const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");
const resultKillsText = document.getElementById("resultKillsText");
const matchCoinsText = document.getElementById("matchCoinsText");
const totalCoinsText = document.getElementById("totalCoinsText");
const menuCoinsText = document.getElementById("menuCoinsText");
const shopMessage = document.getElementById("shopMessage");

const skinCards = document.querySelectorAll(".skin-card");

const skinStatusBlue = document.getElementById("skinStatusBlue");
const skinStatusGreen = document.getElementById("skinStatusGreen");
const skinStatusPurple = document.getElementById("skinStatusPurple");
const skinStatusGold = document.getElementById("skinStatusGold");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const difficultyDescription = document.getElementById("difficultyDescription");

const mapButtons = document.querySelectorAll(".map-button");
const mapDescription = document.getElementById("mapDescription");

const modeButtons = document.querySelectorAll(".mode-button");
const modeDescription = document.getElementById("modeDescription");

const mobileShootButton = document.getElementById("mobileShootButton");
const mobileReloadButton = document.getElementById("mobileReloadButton");
const mobileHealButton = document.getElementById("mobileHealButton");
const mobilePistolButton = document.getElementById("mobilePistolButton");
const mobileRifleButton = document.getElementById("mobileRifleButton");
const mobileShotgunButton = document.getElementById("mobileShotgunButton");
const joystickArea = document.getElementById("joystickArea");
const joystickBase = document.getElementById("joystickBase");
const joystickStick = document.getElementById("joystickStick");

const gameModeText = document.getElementById("gameModeText");

// Tamanho do mundo do jogo
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const MOBILE_BREAKPOINT = 900;
const MAX_CANVAS_DPR = 2;

// Estado geral do jogo
let gameRunning = false;
let gamePaused = false;
let animationId = null;
let mobileShootHeld = false;

// Chave usada para salvar o mapa escolhido.
const MAP_STORAGE_KEY = "battleRoyale2dSelectedMap";

// Opção especial para sortear mapa automaticamente.
const RANDOM_MAP_ID = "random";

// Teclas pressionadas
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};
// =============================
// SISTEMA DE MAPAS / CENÁRIOS
// =============================

// Mapa padrão usado se algo der errado.
const DEFAULT_MAP_ID = "forest";

// Guarda o mapa atual da partida.
let currentMap = null;

// Lista de mapas disponíveis.
const MAPS = {
  forest: {
    id: "forest",
    name: "Floresta",
    icon: "🌲",
    tag: "Equilibrado",
    description: "Mapa equilibrado com árvores, pedras, casas e vegetação.",
    visualDescription: "Muitas árvores, vegetação e obstáculos médios.",

    groundColor: "#14532d",
    groundVariationColor: "rgba(22, 101, 52, 0.35)",
    gridColor: "rgba(255, 255, 255, 0.025)",

    treeCount: 35,
    rockCount: 25,
    houseCount: 10,
    grassCount: 180,
    bushCount: 45,

    safeZoneColor: "#38bdf8",
    darknessColor: "rgba(15, 23, 42, 0.36)",

    previewGradient: "linear-gradient(135deg, #14532d, #22c55e)",
  },

  desert: {
    id: "desert",
    name: "Deserto",
    icon: "🏜️",
    tag: "Aberto",
    description: "Mapa mais aberto, com menos árvores e mais pedras.",
    visualDescription: "Pouca cobertura, mais espaço aberto e combate direto.",

    groundColor: "#b7791f",
    groundVariationColor: "rgba(180, 83, 9, 0.28)",
    gridColor: "rgba(255, 255, 255, 0.035)",

    treeCount: 10,
    rockCount: 42,
    houseCount: 7,
    grassCount: 70,
    bushCount: 18,

    safeZoneColor: "#38bdf8",
    darknessColor: "rgba(69, 26, 3, 0.32)",

    previewGradient: "linear-gradient(135deg, #92400e, #f59e0b)",
  },

  snow: {
    id: "snow",
    name: "Neve",
    icon: "❄️",
    tag: "Visual claro",
    description: "Mapa claro, com pedras frias e menos vegetação.",
    visualDescription: "Ambiente claro, boa visibilidade e obstáculos espalhados.",

    groundColor: "#dbeafe",
    groundVariationColor: "rgba(147, 197, 253, 0.22)",
    gridColor: "rgba(15, 23, 42, 0.035)",

    treeCount: 22,
    rockCount: 32,
    houseCount: 8,
    grassCount: 90,
    bushCount: 24,

    safeZoneColor: "#0ea5e9",
    darknessColor: "rgba(15, 23, 42, 0.26)",

    previewGradient: "linear-gradient(135deg, #bfdbfe, #f8fafc)",
  },

  city: {
    id: "city",
    name: "Cidade",
    icon: "🏙️",
    tag: "Mais casas",
    description: "Mapa urbano com mais construções e combates próximos.",
    visualDescription: "Mais casas, corredores apertados e menos natureza.",

    groundColor: "#334155",
    groundVariationColor: "rgba(100, 116, 139, 0.28)",
    gridColor: "rgba(255, 255, 255, 0.04)",

    treeCount: 8,
    rockCount: 18,
    houseCount: 22,
    grassCount: 45,
    bushCount: 12,

    safeZoneColor: "#facc15",
    darknessColor: "rgba(2, 6, 23, 0.42)",

    previewGradient: "linear-gradient(135deg, #1e293b, #64748b)",
  },

  swamp: {
    id: "swamp",
    name: "Pântano",
    icon: "🐊",
    tag: "Fechado",
    description: "Mapa com vegetação densa, muitos arbustos e visão mais confusa.",
    visualDescription: "Mais vegetação, mais esconderijos e combate imprevisível.",

    groundColor: "#365314",
    groundVariationColor: "rgba(63, 98, 18, 0.38)",
    gridColor: "rgba(255, 255, 255, 0.02)",

    treeCount: 48,
    rockCount: 16,
    houseCount: 4,
    grassCount: 260,
    bushCount: 90,  

    safeZoneColor: "#84cc16",
    darknessColor: "rgba(20, 83, 45, 0.38)",

    previewGradient: "linear-gradient(135deg, #365314, #84cc16)",
  },

  arena: {
    id: "arena",
    name: "Arena",
    icon: "⚔️",
    tag: "Intenso",
    description: "Mapa menor visualmente aberto, feito para partidas rápidas.",
    visualDescription: "Menos obstáculos, combate mais rápido e direto.",

    groundColor: "#581c87",
    groundVariationColor: "rgba(126, 34, 206, 0.28)",
    gridColor: "rgba(255, 255, 255, 0.05)",

    treeCount: 2,
    rockCount: 14,
    houseCount: 4,
    grassCount: 35,
    bushCount: 6,

    safeZoneColor: "#fb7185",
    darknessColor: "rgba(30, 27, 75, 0.42)",

    previewGradient: "linear-gradient(135deg, #581c87, #fb7185)",
  },
};
// Retorna o ID do mapa escolhido no menu.
// Pode ser: "random", "forest", "desert" ou "snow".
function getSelectedMapId() {
  return localStorage.getItem(MAP_STORAGE_KEY) || RANDOM_MAP_ID;
}

// Salva o mapa escolhido pelo jogador.
function saveSelectedMapId(mapId) {
  if (mapId !== RANDOM_MAP_ID && !MAPS[mapId]) return;

  localStorage.setItem(MAP_STORAGE_KEY, mapId);
}

// Retorna o texto do mapa escolhido no menu.
function getSelectedMapLabel() {
  const selectedMapId = getSelectedMapId();

  if (selectedMapId === RANDOM_MAP_ID) {
    return "Aleatório";
  }

  return MAPS[selectedMapId]?.name || "Aleatório";
}
// =============================
// ESTATÍSTICAS DA PARTIDA ATUAL
// =============================

// Tempo em que a partida começou.
let matchStartTime = 0;

// Tempo sobrevivido em segundos.
let matchSurvivalTime = 0;

// Quantidade de bots eliminados pelo jogador.
let matchKills = 0;

// Dano total causado pelo jogador.
let matchDamage = 0;

// Quantidade de loots coletados.
let matchLoots = 0;

// Coins ganhas somente na partida atual.
let matchCoinsEarned = 0;

// Controle da notificação visual de conquista.
let achievementToastTimeout = null;

// Fila de conquistas para evitar uma notificação atropelar a outra.
let achievementToastQueue = [];

// Indica se uma notificação está sendo exibida agora.
let achievementToastShowing = false;

// Evita abrir a tela de Game Over mais de uma vez.
let gameOverAlreadyShown = false;

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
let eliminationEffects = [];
let muzzleFlashes = [];
let damageTexts = [];

// ===============================
// SISTEMA DE ÁUDIO SIMPLES
// ===============================

let audioContext = null;
let soundEnabled = true;

// Cria ou reutiliza o contexto de áudio.
// Navegadores exigem que o áudio comece após uma interação do usuário.
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  return audioContext;
}

// Toca um som simples usando frequência.
// type pode ser: "sine", "square", "triangle" ou "sawtooth".
function playTone(frequency, duration, type = "sine", volume = 0.08) {
  if (!soundEnabled) return;

  const audio = getAudioContext();

  const oscillator = audio.createOscillator();
  const gainNode = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(volume, audio.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

// Sons do jogo
function playShootSound() {
  playTone(520, 0.06, "square", 0.05);
}

function playHitSound() {
  playTone(180, 0.12, "sawtooth", 0.06);
}

function playLootSound() {
  playTone(760, 0.08, "sine", 0.07);

  setTimeout(() => {
    playTone(980, 0.08, "sine", 0.06);
  }, 70);
}

function playHealSound() {
  playTone(420, 0.1, "sine", 0.06);

  setTimeout(() => {
    playTone(620, 0.12, "sine", 0.06);
  }, 90);
}

function playVictorySound() {
  playTone(520, 0.12, "sine", 0.07);

  setTimeout(() => {
    playTone(660, 0.12, "sine", 0.07);
  }, 120);

  setTimeout(() => {
    playTone(880, 0.18, "sine", 0.07);
  }, 240);
}

function playDefeatSound() {
  playTone(260, 0.16, "sawtooth", 0.06);

  setTimeout(() => {
    playTone(180, 0.22, "sawtooth", 0.06);
  }, 150);
}

// Dados da partida
let kills = 0;

// Zona segura
let safeZone;

// Configurações principais
const DEFAULT_DIFFICULTY = "normal";
const DIFFICULTY_STORAGE_KEY = "battleRoyale2dDifficulty";

const DIFFICULTIES = {
  easy: {
    id: "easy",
    name: "Fácil",
    description: "Fácil: menos bots, menor dano e partida mais tranquila.",
    botCount: 6,
    botSpeedMin: 0.45,
    botSpeedMax: 0.75,
    botDamage: 3,
    botFireRateMin: 1900,
    botFireRateMax: 2800,
    victoryBonusMultiplier: 0.8,
    killCoinsMultiplier: 0.8,
  },

  normal: {
    id: "normal",
    name: "Normal",
    description: "Normal: experiência equilibrada.",
    botCount: 10,
    botSpeedMin: 0.55,
    botSpeedMax: 0.95,
    botDamage: 4,
    botFireRateMin: 1500,
    botFireRateMax: 2300,
    victoryBonusMultiplier: 1,
    killCoinsMultiplier: 1,
  },

  hard: {
    id: "hard",
    name: "Difícil",
    description: "Difícil: mais bots, mais dano e recompensas maiores.",
    botCount: 16,
    botSpeedMin: 0.8,
    botSpeedMax: 1.35,
    botDamage: 6,
    botFireRateMin: 1000,
    botFireRateMax: 1700,
    victoryBonusMultiplier: 1.6,
    killCoinsMultiplier: 1.5,
  },
};
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
// O dano dos bots agora vem da dificuldade selecionada.
let BOT_BULLET_DAMAGE = DIFFICULTIES.normal.botDamage;
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
const COINS_PER_KILL = 10;
const VICTORY_BONUS = 50;
const DEFEAT_PENALTY = 5;

const RANKING_STORAGE_KEY = "battleRoyale2dRanking";
const MAX_RANKING_ITEMS = 10;
const COINS_STORAGE_KEY = "battleRoyale2dCoins";

const SKINS_STORAGE_KEY = "battleRoyale2dOwnedSkins";
const EQUIPPED_SKIN_STORAGE_KEY = "battleRoyale2dEquippedSkin";

// =============================
// SISTEMA DE MODOS DE PARTIDA
// =============================

const DEFAULT_GAME_MODE_ID = "classic";
const GAME_MODE_STORAGE_KEY = "battleRoyale2dSelectedGameMode";

let currentGameMode = null;

const GAME_MODES = {
  classic: {
    id: "classic",
    name: "Clássico",
    description: "Experiência padrão e equilibrada.",
    playerHealthMultiplier: 1,
    startMedkitsBonus: 0,
    lootMultiplier: 1,
    zoneShrinkMultiplier: 1,
    zoneDamageMultiplier: 1,
    botDamageMultiplier: 1,
  },

  fast: {
    id: "fast",
    name: "Rápido",
    description: "Zona fecha mais rápido e a partida fica mais intensa.",
    playerHealthMultiplier: 1,
    startMedkitsBonus: 0,
    lootMultiplier: 0.85,
    zoneShrinkMultiplier: 2.1,
    zoneDamageMultiplier: 1.1,
    botDamageMultiplier: 1,
  },

  hardcore: {
    id: "hardcore",
    name: "Hardcore",
    description: "Menos vida, menos cura e mais punição fora da zona.",
    playerHealthMultiplier: 0.7,
    startMedkitsBonus: -1,
    lootMultiplier: 0.75,
    zoneShrinkMultiplier: 1.25,
    zoneDamageMultiplier: 1.8,
    botDamageMultiplier: 1.35,
  },

  highLoot: {
    id: "highLoot",
    name: "Loot Alto",
    description: "Mais itens no mapa e mais chance de armas e escudo.",
    playerHealthMultiplier: 1,
    startMedkitsBonus: 1,
    lootMultiplier: 1.7,
    zoneShrinkMultiplier: 1,
    zoneDamageMultiplier: 0.95,
    botDamageMultiplier: 1,
  },
};

const SKINS = {
  blue: {
    id: "blue",
    name: "Azul",
    price: 0,
    color: "#38bdf8",
  },

  green: {
    id: "green",
    name: "Verde",
    price: 100,
    color: "#22c55e",
  },

  purple: {
    id: "purple",
    name: "Roxa",
    price: 250,
    color: "#a855f7",
  },

  gold: {
    id: "gold",
    name: "Dourada",
    price: 500,
    color: "#facc15",
  },
};
// Retorna o ID do modo escolhido no menu.
function getSelectedGameModeId() {
  return localStorage.getItem(GAME_MODE_STORAGE_KEY) || DEFAULT_GAME_MODE_ID;
}

// Salva o modo escolhido.
function saveSelectedGameModeId(modeId) {
  if (!GAME_MODES[modeId]) return;

  localStorage.setItem(GAME_MODE_STORAGE_KEY, modeId);
}

// Define o modo atual da partida.
function applySelectedGameMode() {
  const selectedModeId = getSelectedGameModeId();

  currentGameMode = GAME_MODES[selectedModeId] || GAME_MODES[DEFAULT_GAME_MODE_ID];

  return currentGameMode;
}

// Retorna o modo atual com segurança.
function getCurrentGameMode() {
  return currentGameMode || GAME_MODES[DEFAULT_GAME_MODE_ID];
}
// Sorteia um mapa para a partida.
// Escolhe o mapa da partida com base na escolha do menu.
// Se o jogador escolheu "Aleatório", sorteia um dos mapas.
function chooseMatchMap() {
  const selectedMapId = getSelectedMapId();

  if (selectedMapId !== RANDOM_MAP_ID && MAPS[selectedMapId]) {
    currentMap = MAPS[selectedMapId];
    return currentMap;
  }

  const mapIds = Object.keys(MAPS);
  const randomIndex = Math.floor(Math.random() * mapIds.length);
  const randomMapId = mapIds[randomIndex];

  currentMap = MAPS[randomMapId] || MAPS[DEFAULT_MAP_ID];

  return currentMap;
}
function getViewportWidth() {
  return Math.round(window.visualViewport?.width || window.innerWidth);
}

function getViewportHeight() {
  return Math.round(window.visualViewport?.height || window.innerHeight);
}

function isMobileLayout() {
  return getViewportWidth() <= MOBILE_BREAKPOINT;
}

function resetMobileInputState() {
  resetJoystick();
  mobileAim.active = false;
  mobileAim.pointerId = null;
  mobileShootHeld = false;
}

// Ajusta o canvas ao tamanho visível da tela e mantém nitidez em telas de alta densidade.
function resizeCanvas() {
  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);

  canvas.style.width = `${viewportWidth}px`;
  canvas.style.height = `${viewportHeight}px`;
  canvas.width = Math.round(viewportWidth * pixelRatio);
  canvas.height = Math.round(viewportHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  if (!miniMapCanvas) return;

  const miniMapCssWidth = isMobileLayout() ? 92 : 190;
  const miniMapCssHeight = isMobileLayout() ? 60 : 130;

  miniMapCanvas.width = Math.round(miniMapCssWidth * pixelRatio);
  miniMapCanvas.height = Math.round(miniMapCssHeight * pixelRatio);
  miniMapCtx?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  miniMapCanvas.style.width = `${miniMapCssWidth}px`;
  miniMapCanvas.style.height = `${miniMapCssHeight}px`;
  miniMapCanvas.style.top = isMobileLayout() ? "64px" : "86px";
  miniMapCanvas.style.right = isMobileLayout() ? "6px" : "18px";

  if (player) {
    updateCamera();
  }
}
setupMiniMap();

window.addEventListener("resize", resizeCanvas);
window.visualViewport?.addEventListener("resize", resizeCanvas);
window.visualViewport?.addEventListener("scroll", resizeCanvas);
window.addEventListener("orientationchange", () => {
  resetMobileInputState();
  setTimeout(resizeCanvas, 120);
});
resizeCanvas();

// Retorna o ID da dificuldade salva.
function getSelectedDifficultyId() {
  return localStorage.getItem(DIFFICULTY_STORAGE_KEY) || DEFAULT_DIFFICULTY;
}

// Retorna o objeto da dificuldade atual.
function getSelectedDifficulty() {
  const difficultyId = getSelectedDifficultyId();
  return DIFFICULTIES[difficultyId] || DIFFICULTIES[DEFAULT_DIFFICULTY];
}

// Salva a dificuldade escolhida.
function saveSelectedDifficulty(difficultyId) {
  if (!DIFFICULTIES[difficultyId]) return;

  localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficultyId);
}

// Atualiza o visual dos botões de dificuldade.
function updateDifficultyUI() {
  const selectedDifficulty = getSelectedDifficulty();

  difficultyButtons.forEach((button) => {
    const isActive = button.dataset.difficulty === selectedDifficulty.id;
    button.classList.toggle("active", isActive);
  });

  if (difficultyDescription) {
    difficultyDescription.textContent = selectedDifficulty.description;
  }

  if (difficultyText) {
    difficultyText.textContent = selectedDifficulty.name;
  }
}
// Atualiza o visual dos botões de mapa no menu.
function updateMapUI() {
  const selectedMapId = getSelectedMapId();

  mapButtons.forEach((button) => {
    const buttonMapId = button.dataset.map;
    const isActive = buttonMapId === selectedMapId;

    button.classList.toggle("active", isActive);

    // Cria visual automático dentro do botão.
    if (buttonMapId === RANDOM_MAP_ID) {
      button.innerHTML = `
        <span class="map-card-preview random-preview">🎲</span>

        <span class="map-card-content">
          <strong>Aleatório</strong>
          <small>Mapa sorteado a cada partida</small>
          <em>Surpresa</em>
        </span>
      `;
      return;
    }

    const map = MAPS[buttonMapId];

    if (!map) return;

    button.innerHTML = `
      <span 
        class="map-card-preview"
        style="background: ${map.previewGradient};"
      >
        ${map.icon}
      </span>

      <span class="map-card-content">
        <strong>${map.name}</strong>
        <small>${map.visualDescription}</small>
        <em>${map.tag}</em>
      </span>
    `;
  });

  if (!mapDescription) return;

  if (selectedMapId === RANDOM_MAP_ID) {
    mapDescription.textContent =
      "Aleatório: o mapa será sorteado a cada partida.";
    return;
  }

  const selectedMap = MAPS[selectedMapId] || MAPS[DEFAULT_MAP_ID];

  mapDescription.textContent =
    `${selectedMap.icon} ${selectedMap.name}: ${selectedMap.description}`;
}
// Atualiza o visual dos botões de modo de partida.
function updateGameModeUI() {
  const selectedModeId = getSelectedGameModeId();

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === selectedModeId;
    button.classList.toggle("active", isActive);
  });

  if (!modeDescription) return;

  const selectedMode = GAME_MODES[selectedModeId] || GAME_MODES[DEFAULT_GAME_MODE_ID];

  modeDescription.textContent = `${selectedMode.name}: ${selectedMode.description}`;
}
// Aplica configurações da dificuldade na partida atual.
function applyDifficultySettings() {
  const selectedDifficulty = getSelectedDifficulty();
  const mode = getCurrentGameMode();

BOT_BULLET_DAMAGE = selectedDifficulty.botDamage * mode.botDamageMultiplier;
}
// =============================
// SISTEMA DE CONQUISTAS
// =============================

const ACHIEVEMENTS_STATS_KEY = "battleRoyale2dAchievementStats";
const ACHIEVEMENTS_UNLOCKED_KEY = "battleRoyale2dAchievementsUnlocked";

const ACHIEVEMENTS = [
  {
    id: "first_kill",
    title: "Primeiro abate",
    description: "Elimine seu primeiro bot.",
    stat: "totalKills",
    target: 1,
    reward: 20,
  },
  {
    id: "hunter_10",
    title: "Caçador iniciante",
    description: "Elimine 10 bots no total.",
    stat: "totalKills",
    target: 10,
    reward: 40,
  },
  {
    id: "hunter_50",
    title: "Caçador veterano",
    description: "Elimine 50 bots no total.",
    stat: "totalKills",
    target: 50,
    reward: 100,
  },
  {
    id: "survivor_5",
    title: "Sobrevivente",
    description: "Jogue 5 partidas.",
    stat: "totalMatches",
    target: 5,
    reward: 30,
  },
  {
    id: "champion_1",
    title: "Primeiro campeão",
    description: "Vença sua primeira partida.",
    stat: "totalWins",
    target: 1,
    reward: 50,
  },
  {
    id: "collector_25",
    title: "Coletor",
    description: "Colete 25 loots no total.",
    stat: "totalLoots",
    target: 25,
    reward: 35,
  },
  {
    id: "damage_5000",
    title: "Mão pesada",
    description: "Cause 5.000 de dano no total.",
    stat: "totalDamage",
    target: 5000,
    reward: 80,
  },
  {
    id: "rich_500",
    title: "Guerreiro rico",
    description: "Acumule 500 coins no total.",
    stat: "totalCoins",
    target: 500,
    reward: 50,
  },
];
// Carrega o ranking local.
function getLocalRanking() {
  const savedRanking = localStorage.getItem(RANKING_STORAGE_KEY);

  if (!savedRanking) {
    return [];
  }

  try {
    return JSON.parse(savedRanking);
  } catch {
    return [];
  }
}

// Salva o ranking local.
function saveLocalRanking(ranking) {
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(ranking));
}

// Cria um registro da partida no ranking.
function addMatchToRanking(victory, matchCoins) {
  const selectedDifficulty = getSelectedDifficulty();

  const ranking = getLocalRanking();

  const map = currentMap || MAPS[DEFAULT_MAP_ID];
const mode = getCurrentGameMode();

ranking.push({
  kills,
  coins: matchCoins,
  victory,
  difficulty: selectedDifficulty.name,
  map: map.name,
  mode: mode.name,
  date: new Date().toLocaleDateString("pt-BR"),
});

  ranking.sort((a, b) => {
    if (b.victory !== a.victory) {
      return Number(b.victory) - Number(a.victory);
    }

    if (b.kills !== a.kills) {
      return b.kills - a.kills;
    }

    return b.coins - a.coins;
  });

  saveLocalRanking(ranking.slice(0, MAX_RANKING_ITEMS));
}

// Atualiza o ranking no menu.
function updateRankingUI() {
  if (!rankingList) return;

  const ranking = getLocalRanking();

  if (ranking.length === 0) {
    rankingList.innerHTML = `
      <p class="empty-ranking">Nenhuma partida registrada ainda.</p>
    `;
    return;
  }

  rankingList.innerHTML = ranking
    .map((item, index) => {
      const result = item.victory ? "Vitória" : "Derrota";

      return `
        <div class="ranking-item">
          <div class="ranking-position">${index + 1}</div>

          <div class="ranking-info">
            <strong>${result} — ${item.kills} kills</strong>
            <small>
              ${item.coins} coins • ${item.difficulty} • ${item.mode || "Clássico"} • ${item.map || "Mapa"} • ${item.date}
            </small>
          </div>
        </div>
      `;
    })
    .join("");
}

// Limpa ranking local.
function clearLocalRanking() {
  localStorage.removeItem(RANKING_STORAGE_KEY);
  updateRankingUI();
}
// Carrega o total de coins salvo no navegador.
function getTotalCoins() {
  const savedCoins = localStorage.getItem(COINS_STORAGE_KEY);
  return savedCoins ? Number(savedCoins) : 0;
}
// Carrega as skins compradas.
// A skin azul sempre vem liberada.
function getOwnedSkins() {
  const savedSkins = localStorage.getItem(SKINS_STORAGE_KEY);

  if (!savedSkins) {
    return {
      blue: true,
      green: false,
      purple: false,
      gold: false,
    };
  }

  return JSON.parse(savedSkins);
}

// Salva as skins compradas.
function saveOwnedSkins(ownedSkins) {
  localStorage.setItem(SKINS_STORAGE_KEY, JSON.stringify(ownedSkins));
}

// Retorna a skin equipada.
function getEquippedSkinId() {
  return localStorage.getItem(EQUIPPED_SKIN_STORAGE_KEY) || "blue";
}

// Salva a skin equipada.
function saveEquippedSkin(skinId) {
  localStorage.setItem(EQUIPPED_SKIN_STORAGE_KEY, skinId);
}

// Retorna a cor da skin equipada.
function getEquippedSkinColor() {
  const skinId = getEquippedSkinId();
  return SKINS[skinId]?.color || SKINS.blue.color;
}
// =============================
// ETAPA 23 - LOJA AVANÇADA
// =============================

const SHOP_OWNED_ITEMS_KEY = "battleRoyale2dOwnedShopItems";
const SHOP_EQUIPPED_ITEMS_KEY = "battleRoyale2dEquippedShopItems";
const GEMS_STORAGE_KEY = "battleRoyale2dGems";

// Categoria aberta na loja.
let currentShopCategory = "character";

const SHOP_ITEMS = {
  character_blue: {
    id: "character_blue",
    category: "character",
    name: "Azul",
    description: "Visual inicial do personagem.",
    currency: "coins",
    price: 0,
    previewType: "color",
    preview: "#38bdf8",
    value: "#38bdf8",
  },

  character_green: {
    id: "character_green",
    category: "character",
    name: "Verde",
    description: "Visual verde para o personagem.",
    currency: "coins",
    price: 100,
    previewType: "color",
    preview: "#22c55e",
    value: "#22c55e",
  },

  character_purple: {
    id: "character_purple",
    category: "character",
    name: "Roxa",
    description: "Visual roxo para o personagem.",
    currency: "coins",
    price: 250,
    previewType: "color",
    preview: "#a855f7",
    value: "#a855f7",
  },

  character_gold: {
    id: "character_gold",
    category: "character",
    name: "Dourada",
    description: "Visual dourado para destacar seu personagem.",
    currency: "coins",
    price: 500,
    previewType: "color",
    preview: "#facc15",
    value: "#facc15",
  },

  weapon_yellow: {
    id: "weapon_yellow",
    category: "weapon",
    name: "Tiro Amarelo",
    description: "Cor padrão dos tiros.",
    currency: "coins",
    price: 0,
    previewType: "bullet",
    preview: "#facc15",
    value: "#facc15",
  },

  weapon_blue: {
    id: "weapon_blue",
    category: "weapon",
    name: "Tiro Azul",
    description: "Balas com visual azul.",
    currency: "coins",
    price: 120,
    previewType: "bullet",
    preview: "#38bdf8",
    value: "#38bdf8",
  },

  weapon_green: {
    id: "weapon_green",
    category: "weapon",
    name: "Tiro Verde",
    description: "Balas com visual verde.",
    currency: "coins",
    price: 180,
    previewType: "bullet",
    preview: "#22c55e",
    value: "#22c55e",
  },

  weapon_pink: {
    id: "weapon_pink",
    category: "weapon",
    name: "Tiro Rosa",
    description: "Balas com visual rosa vibrante.",
    currency: "coins",
    price: 220,
    previewType: "bullet",
    preview: "#fb7185",
    value: "#fb7185",
  },

  effect_simple: {
    id: "effect_simple",
    category: "effect",
    name: "Simples",
    description: "Efeito básico de eliminação.",
    currency: "coins",
    price: 0,
    previewType: "emoji",
    preview: "✨",
    value: "simple",
  },

  effect_green_burst: {
    id: "effect_green_burst",
    category: "effect",
    name: "Brilho Verde",
    description: "Efeito verde ao eliminar bots.",
    currency: "coins",
    price: 200,
    previewType: "emoji",
    preview: "💚",
    value: "green_burst",
  },

  effect_gold_spark: {
    id: "effect_gold_spark",
    category: "effect",
    name: "Faísca Dourada",
    description: "Efeito dourado para eliminações.",
    currency: "coins",
    price: 350,
    previewType: "emoji",
    preview: "🌟",
    value: "gold_spark",
  },

  effect_explosion: {
    id: "effect_explosion",
    category: "effect",
    name: "Explosão",
    description: "Efeito explosivo visual ao eliminar.",
    currency: "coins",
    price: 500,
    previewType: "emoji",
    preview: "💥",
    value: "explosion",
  },
};
function getTotalGems() {
  const savedGems = localStorage.getItem(GEMS_STORAGE_KEY);
  return savedGems ? Number(savedGems) : 0;
}

function saveTotalGems(amount) {
  localStorage.setItem(GEMS_STORAGE_KEY, String(Math.max(0, amount)));
}

function getOwnedShopItems() {
  const savedItems = localStorage.getItem(SHOP_OWNED_ITEMS_KEY);

  const defaultOwned = {
    character_blue: true,
    weapon_yellow: true,
    effect_simple: true,
  };

  if (!savedItems) {
    return defaultOwned;
  }

  try {
    return {
      ...defaultOwned,
      ...JSON.parse(savedItems),
    };
  } catch {
    return defaultOwned;
  }
}

function saveOwnedShopItems(ownedItems) {
  localStorage.setItem(SHOP_OWNED_ITEMS_KEY, JSON.stringify(ownedItems));
}

function getEquippedShopItems() {
  const savedItems = localStorage.getItem(SHOP_EQUIPPED_ITEMS_KEY);

  const defaultEquipped = {
    character: "character_blue",
    weapon: "weapon_yellow",
    effect: "effect_simple",
  };

  if (!savedItems) {
    return defaultEquipped;
  }

  try {
    return {
      ...defaultEquipped,
      ...JSON.parse(savedItems),
    };
  } catch {
    return defaultEquipped;
  }
}

function saveEquippedShopItems(equippedItems) {
  localStorage.setItem(SHOP_EQUIPPED_ITEMS_KEY, JSON.stringify(equippedItems));
}
function getEquippedCharacterColor() {
  const equipped = getEquippedShopItems();
  const item = SHOP_ITEMS[equipped.character];

  return item?.value || "#38bdf8";
}

function getEquippedBulletColor() {
  const equipped = getEquippedShopItems();
  const item = SHOP_ITEMS[equipped.weapon];

  return item?.value || "#facc15";
}

function getEquippedEliminationEffect() {
  const equipped = getEquippedShopItems();
  const item = SHOP_ITEMS[equipped.effect];

  return item?.value || "simple";
}
// Atualiza textos dos cards da loja.
function updateShopUI() {
  const ownedSkins = getOwnedSkins();
  const equippedSkinId = getEquippedSkinId();

  if (skinStatusBlue) {
    skinStatusBlue.textContent = equippedSkinId === "blue" ? "Equipada" : "Equipar";
  }

  if (skinStatusGreen) {
    skinStatusGreen.textContent = ownedSkins.green
      ? equippedSkinId === "green"
        ? "Equipada"
        : "Equipar"
      : "Comprar";
  }

  if (skinStatusPurple) {
    skinStatusPurple.textContent = ownedSkins.purple
      ? equippedSkinId === "purple"
        ? "Equipada"
        : "Equipar"
      : "Comprar";
  }

  if (skinStatusGold) {
    skinStatusGold.textContent = ownedSkins.gold
      ? equippedSkinId === "gold"
        ? "Equipada"
        : "Equipar"
      : "Comprar";
  }

  renderAdvancedShop();
}

// Mostra mensagem temporária na loja.
function showShopMessage(message) {
  if (!shopMessage) return;

  shopMessage.textContent = message;

  setTimeout(() => {
    shopMessage.textContent = "";
  }, 1800);
}

// Compra ou equipa uma skin.
function handleSkinClick(skinId) {
  const skin = SKINS[skinId];

  if (!skin) return;

  const ownedSkins = getOwnedSkins();
  const totalCoins = getTotalCoins();

  // Se já tem a skin, apenas equipa.
  if (ownedSkins[skinId]) {
    saveEquippedSkin(skinId);
    updateShopUI();
    showShopMessage(`Skin ${skin.name} equipada.`);
    return;
  }

  // Se não tem coins suficientes.
  if (totalCoins < skin.price) {
    showShopMessage(`Coins insuficientes para comprar ${skin.name}.`);
    return;
  }

  // Compra a skin.
  ownedSkins[skinId] = true;

  saveOwnedSkins(ownedSkins);
  saveTotalCoins(totalCoins - skin.price);
  saveEquippedSkin(skinId);

  updateMenuCoins();
  updateShopUI();

  showShopMessage(`Você comprou e equipou a skin ${skin.name}.`);
}
// Salva o total de coins no navegador.
function saveTotalCoins(amount) {
  localStorage.setItem(COINS_STORAGE_KEY, String(amount));
}

// Atualiza o total de coins exibido no menu inicial.
function updateMenuCoins() {
  if (!menuCoinsText) return;
  menuCoinsText.textContent = getTotalCoins();
}

// Calcula as coins ganhas na partida.
function calculateMatchCoins(victory) {
  const selectedDifficulty = getSelectedDifficulty();

  let coins = Math.floor(
    kills * COINS_PER_KILL * selectedDifficulty.killCoinsMultiplier
  );

  if (victory) {
    coins += Math.floor(
      VICTORY_BONUS * selectedDifficulty.victoryBonusMultiplier
    );
  } else {
    coins -= DEFEAT_PENALTY;
  }

  return Math.max(0, coins);
}
// Coloca uma conquista na fila de notificações.
function queueAchievementToast(achievement) {
  achievementToastQueue.push(achievement);

  if (!achievementToastShowing) {
    showNextAchievementToast();
  }
}

// Mostra a próxima notificação da fila.
function showNextAchievementToast() {
  if (achievementToastQueue.length === 0) {
    achievementToastShowing = false;
    return;
  }

  achievementToastShowing = true;

  const achievement = achievementToastQueue.shift();

  const toast = document.getElementById("achievementToast");
  const toastTitle = document.getElementById("achievementToastTitle");
  const toastName = document.getElementById("achievementToastName");
  const toastReward = document.getElementById("achievementToastReward");

  if (!toast) {
    achievementToastShowing = false;
    return;
  }

  if (toastTitle) {
    toastTitle.textContent = "Conquista desbloqueada!";
  }

  if (toastName) {
    toastName.textContent = achievement.title;
  }

  if (toastReward) {
    toastReward.textContent = `+${achievement.reward} coins`;
  }

  toast.classList.remove("hidden");

  // Pequeno atraso para o navegador aplicar o estado inicial antes da animação.
  setTimeout(() => {
    toast.classList.add("show");
  }, 30);

  if (achievementToastTimeout) {
    clearTimeout(achievementToastTimeout);
  }

  achievementToastTimeout = setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.classList.add("hidden");
      achievementToastShowing = false;
      showNextAchievementToast();
    }, 380);
  }, 3200);
}
// Converte segundos em formato MM:SS.
// Exemplo: 75 segundos vira 01:15.
function formatMatchTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
function showGameOverScreen(isVictory = false) {
  // Evita mostrar a tela várias vezes.
  if (gameOverAlreadyShown) return;

  gameOverAlreadyShown = true;

  // Calcula quanto tempo o jogador sobreviveu.
  matchSurvivalTime = Math.floor((Date.now() - matchStartTime) / 1000);

  const screen = document.getElementById("gameOverScreen");
  const title = document.getElementById("gameOverTitle");
  const subtitle = document.getElementById("gameOverSubtitle");

  const summaryTime = document.getElementById("summaryTime");
  const summaryKills = document.getElementById("summaryKills");
  const summaryDamage = document.getElementById("summaryDamage");
  const summaryLoots = document.getElementById("summaryLoots");
  const summaryCoins = document.getElementById("summaryCoins");

  if (!screen) return;

  if (title) {
    title.textContent = isVictory ? "Vitória!" : "Fim de Jogo";
  }

  if (subtitle) {
    subtitle.textContent = isVictory
      ? "Você foi o último sobrevivente do campo de batalha."
      : "Você foi eliminado, mas sua evolução continua.";
  }

  if (summaryTime) {
    summaryTime.textContent = formatMatchTime(matchSurvivalTime);
  }

  if (summaryKills) {
    summaryKills.textContent = matchKills;
  }

  if (summaryDamage) {
    summaryDamage.textContent = Math.floor(matchDamage);
  }

  if (summaryLoots) {
    summaryLoots.textContent = matchLoots;
  }

  if (summaryCoins) {
    summaryCoins.textContent = `+${matchCoinsEarned}`;
  }

  screen.classList.remove("hidden");
}
function hideGameOverScreen() {
  const screen = document.getElementById("gameOverScreen");

  if (!screen) return;

  screen.classList.add("hidden");
}
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
// Verifica se uma posição está livre para nascer.
// Usa uma margem maior que o raio real para evitar spawn grudado em obstáculos.
function isSpawnPositionFree(x, y, radius, minDistanceFromPlayer = 180) {
  const safetyMargin = 70;

  // Evita nascer perto demais das bordas do mapa.
  if (
    x < 120 ||
    x > WORLD_WIDTH - 120 ||
    y < 120 ||
    y > WORLD_HEIGHT - 120
  ) {
    return false;
  }

  // Evita nascer dentro ou muito grudado em obstáculos.
  const tooCloseToObstacle = obstacles.some((obstacle) => {
    if (obstacle.type === "tree") {
      const distanceToTree = Math.hypot(x - obstacle.x, y - obstacle.y);

      return distanceToTree < radius + obstacle.radius + safetyMargin;
    }

    if (obstacle.type === "rock") {
      return circleRectCollision(
        x,
        y,
        radius + safetyMargin,
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
    }

    if (obstacle.type === "house") {
      return circleRectCollision(
        x,
        y,
        radius + safetyMargin,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    }

    return false;
  });

  if (tooCloseToObstacle) {
    return false;
  }

  // Evita nascer muito perto do jogador.
  if (player) {
    const distanceFromPlayer = Math.hypot(x - player.x, y - player.y);

    if (distanceFromPlayer < minDistanceFromPlayer) {
      return false;
    }
  }

  // Evita nascer em cima de outro bot.
  const tooCloseToAnotherBot = bots.some((bot) => {
    const distanceFromBot = Math.hypot(x - bot.x, y - bot.y);
    return distanceFromBot < radius + bot.radius + 70;
  });

  if (tooCloseToAnotherBot) {
    return false;
  }

  return true;
}
// Move uma entidade respeitando colisão com obstáculos.
// Retorna true se conseguiu mover, false se ficou bloqueada.
function moveEntityWithCollision(entity, moveX, moveY) {
  const nextX = entity.x + moveX;
  const nextY = entity.y + moveY;

  const limitedNextX = clamp(nextX, entity.radius, WORLD_WIDTH - entity.radius);
  const limitedNextY = clamp(nextY, entity.radius, WORLD_HEIGHT - entity.radius);

  let moved = false;

  if (!collidesWithAnyObstacle(limitedNextX, entity.y, entity.radius)) {
    entity.x = limitedNextX;
    moved = true;
  }

  if (!collidesWithAnyObstacle(entity.x, limitedNextY, entity.radius)) {
    entity.y = limitedNextY;
    moved = true;
  }

  return moved;
}
// Empurra suavemente uma entidade para fora de obstáculos.
// Não teletransporta, só corrige aos poucos.
function pushEntityOutOfObstacles(entity) {
  obstacles.forEach((obstacle) => {
    if (!isCollidingWithObstacle(entity.x, entity.y, entity.radius, obstacle)) {
      return;
    }

    let pushAngle = 0;

    if (obstacle.type === "tree") {
      pushAngle = Math.atan2(entity.y - obstacle.y, entity.x - obstacle.x);
    }

    if (obstacle.type === "rock") {
      pushAngle = Math.atan2(
        entity.y - obstacle.y,
        entity.x - obstacle.x
      );
    }

    if (obstacle.type === "house") {
      const houseCenterX = obstacle.x + obstacle.width / 2;
      const houseCenterY = obstacle.y + obstacle.height / 2;

      pushAngle = Math.atan2(
        entity.y - houseCenterY,
        entity.x - houseCenterX
      );
    }

    const pushForce = 2.2;

    entity.x += Math.cos(pushAngle) * pushForce;
    entity.y += Math.sin(pushAngle) * pushForce;

    entity.x = clamp(entity.x, entity.radius, WORLD_WIDTH - entity.radius);
    entity.y = clamp(entity.y, entity.radius, WORLD_HEIGHT - entity.radius);
  });
}
// Cria o jogador
function createPlayer() {
  const mode = getCurrentGameMode();

  const modeHealth = Math.floor(PLAYER_MAX_HEALTH * mode.playerHealthMultiplier);
  const modeMedkits = Math.max(0, START_MEDKITS + mode.startMedkitsBonus);

  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    radius: 18,
    speed: 2.6,
    health: modeHealth,
    maxHealth: modeHealth,
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
    medkits: modeMedkits,
    healing: false,
    shield: START_SHIELD,
    reloadTime: 900,
    reloading: false,
    lastShot: 0,
    fireRate: 320,
    color: getEquippedCharacterColor(),

    // Ângulo oficial da mira/arma.
    // 0 significa apontando para a direita.
    aimAngle: 0,
  };
}

// Cria bots inimigos
function createBots() {
  bots = [];

  const selectedDifficulty = getSelectedDifficulty();

  for (let i = 0; i < selectedDifficulty.botCount; i++) {
    let botX = WORLD_WIDTH / 2;
    let botY = WORLD_HEIGHT / 2;
    let foundFreePosition = false;

    // Tenta muitas vezes achar uma posição realmente livre.
    for (let attempt = 0; attempt < 600; attempt++) {
      const testX = randomBetween(140, WORLD_WIDTH - 140);
      const testY = randomBetween(140, WORLD_HEIGHT - 140);

      if (isSpawnPositionFree(testX, testY, 17, 260)) {
        botX = testX;
        botY = testY;
        foundFreePosition = true;
        break;
      }
    }

    // Se não achou posição segura, pula esse bot.
    // Melhor ter menos bots do que bot preso dentro de obstáculo.
    if (!foundFreePosition) {
      continue;
    }

    bots.push({
      x: botX,
      y: botY,
      radius: 17,
      speed: randomBetween(
        selectedDifficulty.botSpeedMin,
        selectedDifficulty.botSpeedMax
      ),
      health: 55,
      lastShot: 0,
      fireRate: randomBetween(
        selectedDifficulty.botFireRateMin,
        selectedDifficulty.botFireRateMax
      ),
      color: "#ef4444",

      state: "wander",
      wanderAngle: randomBetween(0, Math.PI * 2),
      nextDecisionTime: Date.now() + randomBetween(500, 1600),
      stuckTimer: 0,
      lastX: botX,
      lastY: botY,
    });
  }
}
// Cria itens de loot espalhados pelo mapa.
// O jogador pega ao encostar neles.
function createLoots() {
  loots = [];

  let lootTypes = ["medkit", "ammo", "shield", "rifle", "shotgun"];

if (getCurrentGameMode().id === "highLoot") {
  lootTypes = [
    "medkit",
    "ammo",
    "ammo",
    "shield",
    "shield",
    "rifle",
    "shotgun",
  ];
}
  const mode = getCurrentGameMode();

  const totalLoots = Math.floor(LOOT_COUNT * mode.lootMultiplier);

for (let i = 0; i < totalLoots; i++) {
    const type = lootTypes[Math.floor(Math.random() * lootTypes.length)];

    let lootX = WORLD_WIDTH / 2;
    let lootY = WORLD_HEIGHT / 2;
    let attempts = 0;
    let foundFreePosition = false;

    while (!foundFreePosition && attempts < 150) {
      lootX = randomBetween(80, WORLD_WIDTH - 80);
      lootY = randomBetween(80, WORLD_HEIGHT - 80);

      foundFreePosition = !collidesWithAnyObstacle(lootX, lootY, 22);
      attempts++;
    }

    if (!foundFreePosition) {
      continue;
    }

    loots.push({
      x: lootX,
      y: lootY,
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

  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  // Gramas, riscos de areia ou marcas na neve.
  for (let i = 0; i < map.grassCount; i++) {
    decorations.push({
      type: "grass",
      x: randomBetween(20, WORLD_WIDTH - 20),
      y: randomBetween(20, WORLD_HEIGHT - 20),
      size: randomBetween(8, 18),
      rotation: randomBetween(0, Math.PI * 2),
    });
  }

  // Arbustos ou pequenas manchas.
  for (let i = 0; i < map.bushCount; i++) {
    decorations.push({
      type: "bush",
      x: randomBetween(40, WORLD_WIDTH - 40),
      y: randomBetween(40, WORLD_HEIGHT - 40),
      radius: randomBetween(12, 22),
    });
  }
}

// Verifica se uma nova posição de obstáculo está livre.
// Isso evita obstáculos muito grudados ou sobrepostos.
function isObstaclePlacementFree(newObstacle, minDistance = 70) {
  // Evita bloquear a região inicial do jogador.
  const playerSpawnX = WORLD_WIDTH / 2;
  const playerSpawnY = WORLD_HEIGHT / 2;

  const obstacleCenterX =
    newObstacle.type === "house"
      ? newObstacle.x + newObstacle.width / 2
      : newObstacle.x;

  const obstacleCenterY =
    newObstacle.type === "house"
      ? newObstacle.y + newObstacle.height / 2
      : newObstacle.y;

  const distanceFromPlayerSpawn = Math.hypot(
    obstacleCenterX - playerSpawnX,
    obstacleCenterY - playerSpawnY
  );

  if (distanceFromPlayerSpawn < 260) {
    return false;
  }

  // Evita obstáculos muito próximos uns dos outros.
  return !obstacles.some((existingObstacle) => {
    const existingCenterX =
      existingObstacle.type === "house"
        ? existingObstacle.x + existingObstacle.width / 2
        : existingObstacle.x;

    const existingCenterY =
      existingObstacle.type === "house"
        ? existingObstacle.y + existingObstacle.height / 2
        : existingObstacle.y;

    const newRadius =
      newObstacle.type === "house"
        ? Math.max(newObstacle.width, newObstacle.height) / 2
        : newObstacle.radius || 30;

    const existingRadius =
      existingObstacle.type === "house"
        ? Math.max(existingObstacle.width, existingObstacle.height) / 2
        : existingObstacle.radius || 30;

    const distanceBetween = Math.hypot(
      obstacleCenterX - existingCenterX,
      obstacleCenterY - existingCenterY
    );

    return distanceBetween < newRadius + existingRadius + minDistance;
  });
}

// Tenta adicionar um obstáculo várias vezes até achar uma posição boa.
// Retorna true se conseguiu adicionar, false se não conseguiu.
function addObstacleWithSpacing(createObstacleFn, attempts = 80, minDistance = 70) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const obstacle = createObstacleFn();

    if (isObstaclePlacementFree(obstacle, minDistance)) {
      obstacles.push(obstacle);
      return true;
    }
  }

  return false;
}

// Cria obstáculos reais do mapa.
// Esses elementos bloqueiam tiros e serão usados como árvores, pedras e casas.
// Cria obstáculos reais do mapa.
// Esses elementos bloqueiam tiros, jogador e bots.
function createObstacles() {
  obstacles = [];

  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  // Distância mínima entre obstáculos.
  // Cada mapa tem uma sensação diferente.
  let spacing = 72;

  if (map.id === "desert") spacing = 92;
  if (map.id === "snow") spacing = 82;
  if (map.id === "city") spacing = 54;
  if (map.id === "swamp") spacing = 46;
  if (map.id === "arena") spacing = 120;

  // =========================
  // CIDADE
  // Casas mais alinhadas, simulando quadras.
  // =========================
  if (map.id === "city") {
    createCityObstacles(map);
    return;
  }

  // =========================
  // ARENA
  // Mapa mais aberto, com obstáculos nas bordas e alguns no centro.
  // =========================
  if (map.id === "arena") {
    createArenaObstacles(map);
    return;
  }

  // =========================
  // MAPAS NATURAIS
  // Floresta, Deserto, Neve e Pântano.
  // =========================

  // Árvores
  for (let i = 0; i < map.treeCount; i++) {
    addObstacleWithSpacing(
      () => ({
        type: "tree",
        x: randomBetween(80, WORLD_WIDTH - 80),
        y: randomBetween(80, WORLD_HEIGHT - 80),
        radius: randomBetween(22, 34),
        width: 0,
        height: 0,
      }),
      90,
      spacing
    );
  }

  // Pedras
  for (let i = 0; i < map.rockCount; i++) {
    addObstacleWithSpacing(
      () => {
        const size = randomBetween(34, 70);

        return {
          type: "rock",
          x: randomBetween(80, WORLD_WIDTH - 80),
          y: randomBetween(80, WORLD_HEIGHT - 80),
          radius: size / 2,
          width: size,
          height: size * randomBetween(0.65, 0.9),
        };
      },
      90,
      spacing
    );
  }

  // Casas
  for (let i = 0; i < map.houseCount; i++) {
    addObstacleWithSpacing(
      () => {
        const houseWidth = randomBetween(90, 150);
        const houseHeight = randomBetween(80, 130);

        return {
          type: "house",
          x: randomBetween(120, WORLD_WIDTH - 220),
          y: randomBetween(120, WORLD_HEIGHT - 220),
          width: houseWidth,
          height: houseHeight,

          roofColor:
            map.id === "snow" ? "#334155" :
            map.id === "desert" ? "#92400e" :
            map.id === "city" ? "#0f172a" :
            map.id === "swamp" ? "#3f6212" :
            map.id === "arena" ? "#7e22ce" :
            "#7f1d1d",

          wallColor:
            map.id === "snow" ? "#94a3b8" :
            map.id === "desert" ? "#78350f" :
            map.id === "city" ? "#475569" :
            map.id === "swamp" ? "#365314" :
            map.id === "arena" ? "#581c87" :
            "#78350f",
        };
      },
      100,
      spacing + 35
    );
  }
}

// Cria obstáculos específicos do mapa Cidade.
// A ideia é deixar as casas mais parecidas com quadras urbanas.
// Cria obstáculos específicos do mapa Cidade.
// A ideia é deixar as casas dentro das quadras, sem ficar em cima das ruas.
function createCityObstacles(map) {
  // Posições das casas pensadas para ficar ENTRE as ruas.
  // As ruas são desenhadas em faixas verticais e horizontais,
  // então esses pontos evitam sobreposição com elas.
  const cityBlocks = [
    // Linha superior de quadras
    { x: 110, y: 90 },
    { x: 410, y: 90 },
    { x: 830, y: 90 },
    { x: 1250, y: 90 },
    { x: 1670, y: 90 },
    { x: 2100, y: 90 },

    // Segunda linha de quadras
    { x: 110, y: 370 },
    { x: 410, y: 370 },
    { x: 830, y: 370 },
    { x: 1250, y: 370 },
    { x: 1670, y: 370 },
    { x: 2100, y: 370 },

    // Terceira linha de quadras
    { x: 110, y: 730 },
    { x: 410, y: 730 },
    { x: 830, y: 730 },
    { x: 1250, y: 730 },
    { x: 1670, y: 730 },
    { x: 2100, y: 730 },

    // Quarta linha de quadras
    { x: 110, y: 1090 },
    { x: 410, y: 1090 },
    { x: 830, y: 1090 },
    { x: 1250, y: 1090 },
    { x: 1670, y: 1090 },
    { x: 2100, y: 1090 },

    // Linha inferior
    { x: 110, y: 1410 },
    { x: 410, y: 1410 },
    { x: 830, y: 1410 },
    { x: 1250, y: 1410 },
    { x: 1670, y: 1410 },
    { x: 2100, y: 1410 },
  ];

  cityBlocks.forEach((block) => {
    // Evita bloquear o centro inicial do jogador.
    const distFromCenter = Math.hypot(
      block.x - WORLD_WIDTH / 2,
      block.y - WORLD_HEIGHT / 2
    );

    if (distFromCenter < 330) return;

    const houseWidth = randomBetween(95, 135);
    const houseHeight = randomBetween(80, 110);

    obstacles.push({
      type: "house",
      x: block.x,
      y: block.y,
      width: houseWidth,
      height: houseHeight,
      roofColor: "#0f172a",
      wallColor: "#475569",
    });
  });

  // Concretos/pedras urbanas espalhados, mas com espaçamento.
  for (let i = 0; i < map.rockCount; i++) {
    addObstacleWithSpacing(
      () => {
        const size = randomBetween(30, 54);

        return {
          type: "rock",
          x: randomBetween(100, WORLD_WIDTH - 100),
          y: randomBetween(100, WORLD_HEIGHT - 100),
          radius: size / 2,
          width: size,
          height: size * randomBetween(0.65, 0.9),
        };
      },
      80,
      90
    );
  }

  // Poucas árvores urbanas, mais nas bordas e espaços abertos.
  for (let i = 0; i < map.treeCount; i++) {
    addObstacleWithSpacing(
      () => ({
        type: "tree",
        x: randomBetween(100, WORLD_WIDTH - 100),
        y: randomBetween(100, WORLD_HEIGHT - 100),
        radius: randomBetween(18, 25),
        width: 0,
        height: 0,
      }),
      80,
      105
    );
  }
}

// Cria obstáculos específicos do mapa Arena.
// A ideia é manter o centro jogável, com obstáculos mais estratégicos.
function createArenaObstacles(map) {
  const centerX = WORLD_WIDTH / 2;
  const centerY = WORLD_HEIGHT / 2;

  // Obstáculos em volta da arena.
  const arenaRocks = [
    { x: centerX - 520, y: centerY - 300 },
    { x: centerX + 520, y: centerY - 300 },
    { x: centerX - 520, y: centerY + 300 },
    { x: centerX + 520, y: centerY + 300 },

    { x: centerX, y: centerY - 420 },
    { x: centerX, y: centerY + 420 },
    { x: centerX - 720, y: centerY },
    { x: centerX + 720, y: centerY },
  ];

  arenaRocks.forEach((position) => {
    const size = randomBetween(48, 82);

    obstacles.push({
      type: "rock",
      x: position.x,
      y: position.y,
      radius: size / 2,
      width: size,
      height: size * randomBetween(0.65, 0.9),
    });
  });

  // Poucas casas pequenas nas laterais.
  const sideHouses = [
    { x: 220, y: 190 },
    { x: WORLD_WIDTH - 360, y: 190 },
    { x: 220, y: WORLD_HEIGHT - 330 },
    { x: WORLD_WIDTH - 360, y: WORLD_HEIGHT - 330 },
  ];

  sideHouses.forEach((house) => {
    obstacles.push({
      type: "house",
      x: house.x,
      y: house.y,
      width: 120,
      height: 95,
      roofColor: "#7e22ce",
      wallColor: "#581c87",
    });
  });

  // Alguns obstáculos extras, mas longe do centro.
  for (let i = 0; i < 6; i++) {
    addObstacleWithSpacing(
      () => {
        const angle = randomBetween(0, Math.PI * 2);
        const distanceFromCenter = randomBetween(520, 880);
        const size = randomBetween(34, 60);

        return {
          type: "rock",
          x: centerX + Math.cos(angle) * distanceFromCenter,
          y: centerY + Math.sin(angle) * distanceFromCenter,
          radius: size / 2,
          width: size,
          height: size * randomBetween(0.65, 0.9),
        };
      },
      80,
      110
    );
  }
}

// Cria a zona segura
function createSafeZone() {
  const mode = getCurrentGameMode();

  safeZone = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    radius: 760,
    minRadius: 150,
    shrinkSpeed: 0.018 * mode.zoneShrinkMultiplier,
  };
}
// Pausa a partida atual.
function pauseGame() {
  if (!gameRunning || gamePaused) return;

  gamePaused = true;
  pauseScreen.classList.add("active");
  hideMiniMap();
  resetMobileInputState();

  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}

// Continua a partida pausada.
function resumeGame() {
  if (!gameRunning || !gamePaused) return;

  gamePaused = false;
  pauseScreen.classList.remove("active");
  showMiniMap();

  gameLoop();
}

// Volta para a tela inicial sem dar coins.
function backToMenu() {
  gameRunning = false;
  gamePaused = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  hideMiniMap();
  resetMobileInputState();

  pauseScreen.classList.remove("active");
  endScreen.classList.remove("active");
  hideGameOverScreen();

  startScreen.classList.add("active");
  openMenuTab("play");

  updateMenuCoins();
  updateShopUI();
  updateDifficultyUI();
  updateMapUI();
  updateGameModeUI();
  hideMiniMap();
}
// Inicia uma nova partida
function startGame() {
  getAudioContext();
  resetMatchStats();

  startScreen.classList.remove("active");
  endScreen.classList.remove("active");
  pauseScreen.classList.remove("active");

  showMiniMap();
  resetMobileInputState();
  resizeCanvas();

  gameRunning = true;
  gamePaused = false;
  kills = 0;

  chooseMatchMap();
  applySelectedGameMode();
  applyDifficultySettings();

  player = createPlayer();

  createSafeZone();
  createDecorations();
  createObstacles();
  createBots();
  createLoots();

  bullets = [];
  eliminationEffects = [];
  muzzleFlashes = [];
  damageTexts = [];

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  gameLoop();
}

// Finaliza a partida
function endGame(victory) {
  gameRunning = false;
  gamePaused = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  const matchCoins = calculateMatchCoins(victory);
  addAchievementStat("totalMatches", 1);

if (victory) {
  addAchievementStat("totalWins", 1);
}
  registerMatchCoins(matchCoins);
  
  const newTotalCoins = getTotalCoins() + matchCoins;

  saveTotalCoins(newTotalCoins);
  checkAchievements();
  renderAchievements();
  addMatchToRanking(victory, matchCoins);

  updateMenuCoins();
  updateShopUI();
  updateRankingUI();
  
  pauseScreen.classList.remove("active");
  endScreen.classList.remove("active");

  hideMiniMap();

  resultKillsText.textContent = kills;
  matchCoinsText.textContent = matchCoins;
  totalCoinsText.textContent = newTotalCoins;

  if (victory) {
    playVictorySound();

    endTitle.textContent = "Vitória!";
    endMessage.textContent = `Você venceu a partida com ${kills} eliminações. Bônus de vitória aplicado.`;
  } else {
    playDefeatSound();

    endTitle.textContent = "Derrota!";
    endMessage.textContent = `Você foi eliminado. Kills: ${kills}.`;
  }
  showGameOverScreen(victory);
}
// Reseta todos os dados estatísticos da partida.
function resetMatchStats() {
  matchStartTime = Date.now();

  matchSurvivalTime = 0;
  matchKills = 0;
  matchDamage = 0;
  matchLoots = 0;
  matchCoinsEarned = 0;

  gameOverAlreadyShown = false;

  hideGameOverScreen();
}
// Registra uma eliminação feita pelo jogador.
function registerPlayerKill() {
  matchKills++;
  addAchievementStat("totalKills", 1);
}

// Registra dano causado pelo jogador.
function registerPlayerDamage(amount) {
  matchDamage += amount;

  if (matchDamage < 0) {
    matchDamage = 0;
  }

  addAchievementStat("totalDamage", amount);
}

// Registra loot coletado pelo jogador.
function registerLootCollected() {
  matchLoots++;
  addAchievementStat("totalLoots", 1);
}

// Registra coins ganhas na partida.
function registerMatchCoins(amount) {
  matchCoinsEarned += amount;

  if (matchCoinsEarned < 0) {
    matchCoinsEarned = 0;
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

  const isMobile = isMobileLayout();

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
  if (player.health >= player.maxHealth) return;

  player.healing = true;

  setTimeout(() => {
    if (!gameRunning || !player) return;

    player.health = Math.min(player.maxHealth, player.health + HEAL_AMOUNT);
    player.medkits -= 1;
    player.healing = false;

    playHealSound();
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

  playHitSound();

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

// Cria um pequeno flash visual na ponta da arma.
function createMuzzleFlash(x, y, angle, color = "#facc15") {
  muzzleFlashes.push({
    x,
    y,
    angle,
    color,
    life: 8,
    maxLife: 8,
    radius: 8,
  });
}

// Atualiza os flashes de disparo.
function updateMuzzleFlashes() {
  muzzleFlashes.forEach((flash) => {
    flash.life--;
    flash.radius += 0.8;
  });

  muzzleFlashes = muzzleFlashes.filter((flash) => flash.life > 0);
}

// Desenha os flashes de disparo.
function drawMuzzleFlashes() {
  muzzleFlashes.forEach((flash) => {
    const screenX = flash.x - camera.x;
    const screenY = flash.y - camera.y;
    const alpha = clamp(flash.life / flash.maxLife, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = flash.color;
    ctx.shadowColor = flash.color;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(screenX, screenY, flash.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}
// Mostra o número de dano subindo quando acerta um bot.
function createDamageText(x, y, amount) {
  damageTexts.push({
    x,
    y,
    text: `-${Math.floor(amount)}`,
    life: 42,
    maxLife: 42,
    vy: -0.55,
  });
}

// Atualiza os textos de dano.
function updateDamageTexts() {
  damageTexts.forEach((damageText) => {
    damageText.y += damageText.vy;
    damageText.life--;
  });

  damageTexts = damageTexts.filter((damageText) => damageText.life > 0);
}

// Desenha os textos de dano.
function drawDamageTexts() {
  damageTexts.forEach((damageText) => {
    const screenX = damageText.x - camera.x;
    const screenY = damageText.y - camera.y;
    const alpha = clamp(damageText.life / damageText.maxLife, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#fef3c7";
    ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
    ctx.lineWidth = 3;
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeText(damageText.text, screenX, screenY);
    ctx.fillText(damageText.text, screenX, screenY);

    ctx.restore();
  });
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

  playShootSound();

  // Efeito visual na ponta da arma.
  createMuzzleFlash(
    player.x + Math.cos(player.aimAngle) * weapon.barrelLength,
    player.y + Math.sin(player.aimAngle) * weapon.barrelLength,
    player.aimAngle,
    getEquippedBulletColor()
  );

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
      color: owner === player ? getEquippedBulletColor() : "#fb7185",
    });
  }
}
//Criar renderização da loja nova
function getShopCategoryLabel(category) {
  if (category === "character") return "Personagem";
  if (category === "weapon") return "Armas";
  if (category === "effect") return "Efeitos";
  return "Loja";
}

function renderShopPreview(item) {
  if (item.previewType === "emoji") {
    return `
      <div class="shop-item-preview">
        ${item.preview}
      </div>
    `;
  }

  if (item.previewType === "bullet") {
    return `
      <div class="shop-item-preview" style="background: rgba(15, 23, 42, 0.9);">
        <span style="
          display: block;
          width: 28px;
          height: 10px;
          border-radius: 999px;
          background: ${item.preview};
          box-shadow: 0 0 14px ${item.preview};
        "></span>
      </div>
    `;
  }

  return `
    <div class="shop-item-preview" style="background: ${item.preview};"></div>
  `;
}

//Criar compra/equipar item
function renderAdvancedShop() {
  if (!shopItemsGrid) return;

  const ownedItems = getOwnedShopItems();
  const equippedItems = getEquippedShopItems();

  if (shopCoinsText) {
    shopCoinsText.textContent = getTotalCoins();
  }

  if (shopGemsText) {
    shopGemsText.textContent = getTotalGems();
  }

  shopCategoryButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.shopCategory === currentShopCategory
    );
  });

  const items = Object.values(SHOP_ITEMS).filter((item) => {
    return item.category === currentShopCategory;
  });

  shopItemsGrid.innerHTML = items
    .map((item) => {
      const owned = Boolean(ownedItems[item.id]);
      const equipped = equippedItems[item.category] === item.id;

      let buttonText = "Comprar";
      let buttonClass = "buy";

      if (equipped) {
        buttonText = "Equipado";
        buttonClass = "equipped";
      } else if (owned) {
        buttonText = "Equipar";
        buttonClass = "";
      }

      const priceLabel =
        item.price === 0
          ? "Grátis"
          : item.currency === "gems"
            ? `💎 ${item.price} gemas`
            : `🪙 ${item.price} coins`;

      return `
        <div class="shop-item-card ${owned ? "owned" : ""} ${equipped ? "equipped" : ""}">
          ${renderShopPreview(item)}

          <strong class="shop-item-title">${item.name}</strong>

          <p class="shop-item-description">
            ${item.description}
          </p>

          <div class="shop-item-price">
            ${priceLabel}
          </div>

          <button
            type="button"
            class="shop-item-button ${buttonClass}"
            data-shop-item="${item.id}"
            ${equipped ? "disabled" : ""}
          >
            ${buttonText}
          </button>
        </div>
      `;
    })
    .join("");

  const itemButtons = shopItemsGrid.querySelectorAll("[data-shop-item]");

  itemButtons.forEach((button) => {
    button.addEventListener("click", () => {
      handleShopItemClick(button.dataset.shopItem);
    });
  });
}
function handleShopItemClick(itemId) {
  const item = SHOP_ITEMS[itemId];

  if (!item) return;

  const ownedItems = getOwnedShopItems();
  const equippedItems = getEquippedShopItems();

  const alreadyOwned = Boolean(ownedItems[item.id]);

  if (alreadyOwned) {
    equippedItems[item.category] = item.id;

    saveEquippedShopItems(equippedItems);
    renderAdvancedShop();

    if (item.category === "character" && player) {
      player.color = getEquippedCharacterColor();
    }

    showShopMessage(`${item.name} equipado.`);
    return;
  }

  if (item.currency === "gems") {
    const gems = getTotalGems();

    if (gems < item.price) {
      showShopMessage(`Gemas insuficientes para comprar ${item.name}.`);
      return;
    }

    saveTotalGems(gems - item.price);
  } else {
    const coins = getTotalCoins();

    if (coins < item.price) {
      showShopMessage(`Coins insuficientes para comprar ${item.name}.`);
      return;
    }

    saveTotalCoins(coins - item.price);
  }

  ownedItems[item.id] = true;
  equippedItems[item.category] = item.id;

  saveOwnedShopItems(ownedItems);
  saveEquippedShopItems(equippedItems);

  if (item.category === "character" && player) {
    player.color = getEquippedCharacterColor();
  }

  updateMenuCoins();
  renderAdvancedShop();

  showShopMessage(`Você comprou e equipou ${item.name}.`);
}
// Movimento do jogador
function updatePlayer() {
  let dx = 0;
let dy = 0;

// No PC, usa teclado.
// No celular, usa joystick.
const isMobile = isMobileLayout();

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

moveEntityWithCollision(player, dx * player.speed, dy * player.speed);
pushEntityOutOfObstacles(player);

  // Dano fora da zona segura
  const distFromZoneCenter = Math.hypot(player.x - safeZone.x, player.y - safeZone.y);

  if (distFromZoneCenter > safeZone.radius) {
  const mode = getCurrentGameMode();
  applyDamageToPlayer(ZONE_DAMAGE_PLAYER * mode.zoneDamageMultiplier);
}

  if (player.health <= 0) {
    endGame(false);
  }
}
// Atualiza a decisão de comportamento do bot.
function updateBotDecision(bot) {
  const now = Date.now();

  if (now < bot.nextDecisionTime) return;

  const distToPlayer = distance(bot, player);
  const distToZoneCenter = Math.hypot(bot.x - safeZone.x, bot.y - safeZone.y);
  // Considera perigo antes mesmo de sair totalmente da zona.
  // Assim o bot começa a voltar antes de tomar dano.
  const outsideZone = distToZoneCenter > safeZone.radius - 120;

  const selectedDifficulty = getSelectedDifficulty();

  const attackDistance =
    selectedDifficulty.id === "hard" ? 430 :
    selectedDifficulty.id === "easy" ? 310 :
    360;

  const chaseDistance =
    selectedDifficulty.id === "hard" ? 850 :
    selectedDifficulty.id === "easy" ? 560 :
    700;

  if (outsideZone) {
    bot.state = "escapeZone";
  } else if (distToPlayer < attackDistance) {
    bot.state = "attack";
  } else if (distToPlayer < chaseDistance) {
    bot.state = "chase";
  } else {
    bot.state = "wander";
  }

  // Muda ângulo aleatório de tempos em tempos.
  if (bot.state === "wander") {
    bot.wanderAngle += randomBetween(-1.2, 1.2);
  }

  bot.nextDecisionTime = now + randomBetween(500, 1300);
}

// Move o bot tentando evitar ficar preso.
// Move o bot tentando evitar obstáculos.
// Se o caminho principal estiver bloqueado, ele tenta caminhos laterais.
function moveBotSmart(bot, angle, speedMultiplier = 1) {
  const speed = bot.speed * speedMultiplier;

  // Lista de ângulos alternativos.
  // Primeiro tenta ir reto, depois diagonais/laterais.
  const angleOptions = [
    angle,
    angle + 0.45,
    angle - 0.45,
    angle + 0.9,
    angle - 0.9,
    angle + Math.PI / 2,
    angle - Math.PI / 2,
    angle + Math.PI,
  ];

  let moved = false;

  for (const testAngle of angleOptions) {
    const moveX = Math.cos(testAngle) * speed;
    const moveY = Math.sin(testAngle) * speed;

    const oldX = bot.x;
    const oldY = bot.y;

    const didMove = moveEntityWithCollision(bot, moveX, moveY);

    const movedDistance = Math.hypot(bot.x - oldX, bot.y - oldY);

    if (didMove && movedDistance > 0.05) {
      moved = true;

      // Se conseguiu mover por um ângulo alternativo, salva esse ângulo.
      bot.wanderAngle = testAngle;
      break;
    }
  }

  // Detecta se o bot ficou preso.
  const totalMovedDistance = Math.hypot(bot.x - bot.lastX, bot.y - bot.lastY);

  if (!moved || totalMovedDistance < 0.05) {
    bot.stuckTimer++;

    // Muda bastante a direção quando prende.
    bot.wanderAngle += randomBetween(1.4, 3.2);
  } else {
    bot.stuckTimer = 0;
  }

  // Se ficou preso por muito tempo, tenta empurrar para longe do obstáculo.
  if (bot.stuckTimer > 18) {
  // Em vez de teletransportar, muda bastante a direção e tenta sair andando.
  bot.wanderAngle += randomBetween(1.6, 3.4);

  const emergencyAngle = bot.wanderAngle;

  moveEntityWithCollision(
    bot,
    Math.cos(emergencyAngle) * bot.speed * 1.8,
    Math.sin(emergencyAngle) * bot.speed * 1.8
  );

  bot.stuckTimer = 0;
}

  bot.lastX = bot.x;
  bot.lastY = bot.y;
}

// Verifica de forma simples se existe obstáculo entre dois pontos.
// Ajuda o bot a não atirar através de casas/árvores/pedras.
function hasLineOfSight(fromX, fromY, toX, toY) {
  const steps = 20;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const checkX = fromX + (toX - fromX) * t;
    const checkY = fromY + (toY - fromY) * t;

    if (collidesWithAnyObstacle(checkX, checkY, 4)) {
      return false;
    }
  }

  return true;
}
// Cria efeito visual quando o jogador elimina um bot.
function createEliminationEffect(x, y) {
  const selectedEffect = getEquippedEliminationEffect();

  let particleCount = 10;
  let baseColor = "#e5e7eb";
  let secondaryColor = "#ffffff";
  let maxSpeed = 2.4;
  let maxLife = 32;
  let sizeMin = 3;
  let sizeMax = 7;
  let ring = false;

  if (selectedEffect === "green_burst") {
    particleCount = 16;
    baseColor = "#22c55e";
    secondaryColor = "#bbf7d0";
    maxSpeed = 3.2;
    maxLife = 38;
    sizeMin = 3;
    sizeMax = 8;
    ring = true;
  }

  if (selectedEffect === "gold_spark") {
    particleCount = 20;
    baseColor = "#facc15";
    secondaryColor = "#fef3c7";
    maxSpeed = 3.6;
    maxLife = 42;
    sizeMin = 2;
    sizeMax = 7;
    ring = true;
  }

  if (selectedEffect === "explosion") {
    particleCount = 26;
    baseColor = "#fb923c";
    secondaryColor = "#ef4444";
    maxSpeed = 4.4;
    maxLife = 46;
    sizeMin = 4;
    sizeMax = 10;
    ring = true;
  }

  // Anel inicial do impacto.
  if (ring) {
    eliminationEffects.push({
      type: "ring",
      x,
      y,
      radius: 8,
      maxRadius: selectedEffect === "explosion" ? 56 : 42,
      life: 22,
      maxLife: 22,
      color: baseColor,
    });
  }

  // Partículas que saem para todos os lados.
  for (let i = 0; i < particleCount; i++) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(0.8, maxSpeed);
    const color = Math.random() > 0.5 ? baseColor : secondaryColor;

    eliminationEffects.push({
      type: "particle",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(sizeMin, sizeMax),
      life: randomBetween(maxLife * 0.65, maxLife),
      maxLife,
      color,
    });
  }

  // Pequeno flash central para todos os efeitos.
  eliminationEffects.push({
    type: "flash",
    x,
    y,
    radius: selectedEffect === "explosion" ? 28 : 20,
    life: 10,
    maxLife: 10,
    color: secondaryColor,
  });
}
// Atualiza partículas dos efeitos de eliminação.
function updateEliminationEffects() {
  eliminationEffects.forEach((effect) => {
    effect.life--;

    if (effect.type === "particle") {
      effect.x += effect.vx;
      effect.y += effect.vy;

      // Desacelera suavemente.
      effect.vx *= 0.96;
      effect.vy *= 0.96;

      // Leve queda visual, como gravidade.
      effect.vy += 0.025;
    }

    if (effect.type === "ring") {
      const progress = 1 - effect.life / effect.maxLife;
      effect.radius = 8 + (effect.maxRadius - 8) * progress;
    }
  });
  
  eliminationEffects = eliminationEffects.filter((effect) => {
    return effect.life > 0;
  });
}
// Desenha efeitos visuais de eliminação.
function drawEliminationEffects() {
  eliminationEffects.forEach((effect) => {
    const screenX = effect.x - camera.x;
    const screenY = effect.y - camera.y;

    const alpha = clamp(effect.life / effect.maxLife, 0, 1);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (effect.type === "particle") {
      ctx.fillStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(screenX, screenY, effect.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (effect.type === "ring") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(screenX, screenY, effect.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (effect.type === "flash") {
      const flashRadius = effect.radius * alpha;

      ctx.fillStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(screenX, screenY, flashRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}
// Atualiza bots
function updateBots() {
  bots.forEach((bot) => {

  if (bot.hitFlash && bot.hitFlash > 0) {
    bot.hitFlash--;
}

    pushEntityOutOfObstacles(bot);
    
    updateBotDecision(bot);

    const distToPlayer = distance(bot, player);
    const angleToPlayer = Math.atan2(player.y - bot.y, player.x - bot.x);
    const angleToZoneCenter = Math.atan2(safeZone.y - bot.y, safeZone.x - bot.x);

    // Fora da zona: corre para o centro da zona.
    if (bot.state === "escapeZone") {
  // Prioridade máxima: voltar para dentro da zona.
  moveBotSmart(bot, angleToZoneCenter, 1.75);

  // Se estiver muito fora, força ainda mais a entrada.
  const distFromZoneCenter = Math.hypot(bot.x - safeZone.x, bot.y - safeZone.y);

  if (distFromZoneCenter > safeZone.radius) {
    moveBotSmart(bot, angleToZoneCenter, 2.1);
  }
}

    // Persegue o jogador.
    if (bot.state === "chase") {
      moveBotSmart(bot, angleToPlayer, 1);
    }

    // Ataca: para ou anda devagar, mantendo distância.
    if (bot.state === "attack") {
      if (distToPlayer > 240) {
        moveBotSmart(bot, angleToPlayer, 0.55);
      }

      if (distToPlayer < 150) {
        // Se estiver perto demais, recua.
        moveBotSmart(bot, angleToPlayer + Math.PI, 0.75);
      }

      // Atira no jogador.
      if (
  bot.state !== "escapeZone" &&
  distToPlayer < 430 &&
  hasLineOfSight(bot.x, bot.y, player.x, player.y)
) {
  shootBullet(bot, player.x, player.y);
}
    }

    // Vagueia pelo mapa.
    if (bot.state === "wander") {
      moveBotSmart(bot, bot.wanderAngle, 0.55);
    }

    // Garante que não saia do mundo.
    bot.x = clamp(bot.x, bot.radius, WORLD_WIDTH - bot.radius);
    bot.y = clamp(bot.y, bot.radius, WORLD_HEIGHT - bot.radius);

    // Bots também tomam dano fora da zona
    const distFromZoneCenter = Math.hypot(bot.x - safeZone.x, bot.y - safeZone.y);

    if (distFromZoneCenter > safeZone.radius) {
  const mode = getCurrentGameMode();
  bot.health -= ZONE_DAMAGE_BOT * mode.zoneDamageMultiplier;
}
  });

  // Remove bots mortos
  bots = bots.filter((bot) => {
  if (bot.health <= 0) {
    // Só conta kill e cria efeito se o jogador realmente causou dano nesse bot.
    if (bot.lastHitByPlayer) {
      createEliminationEffect(bot.x, bot.y);

      registerPlayerKill();
      kills++;
    }

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
  // Conta qualquer tipo de loot coletado.
  registerLootCollected();

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

  playLootSound();
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
  if (bullet.life <= 0) return;

if (distance(bullet, bot) < bullet.radius + bot.radius) {
  bot.health -= bullet.damage;

  // Marca que esse bot foi atingido pelo jogador recentemente.
  bot.lastHitByPlayer = true;

  // Faz o bot piscar rapidamente ao tomar dano.
  bot.hitFlash = 8;

  // Mostra número de dano.
  createDamageText(bot.x, bot.y - bot.radius - 10, bullet.damage);

  registerPlayerDamage(bullet.damage);
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
  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();

  if (isMobileLayout()) {
  // No mobile, deixa o jogador um pouco mais abaixo da tela.
  // Assim o usuário enxerga melhor a frente do personagem.
  camera.x = player.x - viewportWidth / 2;
  camera.y = player.y - viewportHeight * 0.58;
} else {
  camera.x = player.x - viewportWidth / 2;
  camera.y = player.y - viewportHeight / 2;
}

  camera.x = clamp(camera.x, 0, Math.max(0, WORLD_WIDTH - viewportWidth));
  camera.y = clamp(camera.y, 0, Math.max(0, WORLD_HEIGHT - viewportHeight));

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
  difficultyText.textContent = getSelectedDifficulty().name;
  
  if (gameModeText) {
  const mode = getCurrentGameMode();
  gameModeText.textContent = mode.name;
}

  if (mapText) {
   const map = currentMap || MAPS[DEFAULT_MAP_ID];
   mapText.textContent = `${map.icon || ""} ${map.name}`;
}
}

/// Desenha o fundo principal do mapa.
function drawMap() {
  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  // Fundo base do cenário.
  ctx.fillStyle = map.groundColor;
  ctx.fillRect(-camera.x, -camera.y, WORLD_WIDTH, WORLD_HEIGHT);

  // Variação de cor em grandes áreas para não parecer tudo chapado.
  ctx.fillStyle = map.groundVariationColor;

  for (let i = 0; i < 12; i++) {
    const x = ((i * 379) % WORLD_WIDTH) - camera.x;
    const y = ((i * 211) % WORLD_HEIGHT) - camera.y;

    ctx.beginPath();
    ctx.ellipse(x, y, 260, 140, i, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grade bem suave apenas para dar sensação de terreno.
  ctx.strokeStyle = map.gridColor;
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

// Desenha detalhes especiais de cada mapa.
// Esses detalhes são apenas visuais e não têm colisão.
function drawMapSpecialDetails() {
  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  // Usado para reduzir detalhes visuais no celular.
  const mobile = isMobileLayout();

  // =========================
  // CIDADE - ruas e quadras
  // =========================
  if (map.id === "city") {
    ctx.fillStyle = "rgba(15, 23, 42, 0.38)";

    // Ruas verticais
    for (let x = 260; x < WORLD_WIDTH; x += 420) {
      ctx.fillRect(x - camera.x, -camera.y, 70, WORLD_HEIGHT);
    }

    // Ruas horizontais
    for (let y = 220; y < WORLD_HEIGHT; y += 360) {
      ctx.fillRect(-camera.x, y - camera.y, WORLD_WIDTH, 70);
    }

    // Linhas amarelas no meio de algumas ruas
    ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 22]);

    for (let x = 295; x < WORLD_WIDTH; x += 420) {
      ctx.beginPath();
      ctx.moveTo(x - camera.x, -camera.y);
      ctx.lineTo(x - camera.x, WORLD_HEIGHT - camera.y);
      ctx.stroke();
    }

    for (let y = 255; y < WORLD_HEIGHT; y += 360) {
      ctx.beginPath();
      ctx.moveTo(-camera.x, y - camera.y);
      ctx.lineTo(WORLD_WIDTH - camera.x, y - camera.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  // =========================
  // DESERTO - dunas e marcas
  // =========================
  if (map.id === "desert") {
    ctx.strokeStyle = "rgba(120, 53, 15, 0.28)";
    ctx.lineWidth = 4;

    for (let i = 0; i < (mobile ? 8 : 16); i++) {
      const x = ((i * 337) % WORLD_WIDTH) - camera.x;
      const y = ((i * 193) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.ellipse(x, y, 130, 32, i * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Pequenos pontos de areia
    ctx.fillStyle = "rgba(254, 243, 199, 0.28)";

    for (let i = 0; i < (mobile ? 35 : 90); i++) {
      const x = ((i * 157) % WORLD_WIDTH) - camera.x;
      const y = ((i * 89) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================
  // NEVE - manchas de gelo
  // =========================
  if (map.id === "snow") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.42)";

    for (let i = 0; i < (mobile ? 9 : 18); i++) {
      const x = ((i * 281) % WORLD_WIDTH) - camera.x;
      const y = ((i * 173) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.ellipse(x, y, 95, 42, i * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pequenos flocos no chão
    ctx.fillStyle = "rgba(15, 23, 42, 0.12)";

    for (let i = 0; i < (mobile ? 30 : 70); i++) {
      const x = ((i * 199) % WORLD_WIDTH) - camera.x;
      const y = ((i * 131) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================
  // PÂNTANO - poças e lama
  // =========================
  if (map.id === "swamp") {
    ctx.fillStyle = "rgba(20, 184, 166, 0.22)";

    for (let i = 0; i < (mobile ? 7 : 14); i++) {
      const x = ((i * 311) % WORLD_WIDTH) - camera.x;
      const y = ((i * 227) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.ellipse(x, y, 110, 55, i * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(134, 239, 172, 0.22)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Lama escura
    ctx.fillStyle = "rgba(63, 98, 18, 0.28)";

    for (let i = 0; i < (mobile ? 10 : 20); i++) {
      const x = ((i * 241) % WORLD_WIDTH) - camera.x;
      const y = ((i * 151) % WORLD_HEIGHT) - camera.y;

      ctx.beginPath();
      ctx.ellipse(x, y, 70, 28, i * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================
  // ARENA - marcações de combate
  // =========================
  if (map.id === "arena") {
    const centerX = WORLD_WIDTH / 2 - camera.x;
    const centerY = WORLD_HEIGHT / 2 - camera.y;

    ctx.strokeStyle = "rgba(251, 113, 133, 0.38)";
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 360, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(250, 204, 21, 0.35)";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Linhas cruzadas no centro
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(centerX - 480, centerY);
    ctx.lineTo(centerX + 480, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 320);
    ctx.lineTo(centerX, centerY + 320);
    ctx.stroke();
  }
}

// Desenha zona segura
// Desenha zona segura
// Desenha zona segura
function drawSafeZone() {
  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  const viewportWidth = getViewportWidth();
  const viewportHeight = getViewportHeight();

  // Garante que o canvas está no modo normal antes de começar.
  ctx.globalCompositeOperation = "source-over";

  ctx.save();

  // Área escura total
  ctx.fillStyle = map.darknessColor;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // Recorta visualmente a área segura.
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

  // IMPORTANTE:
  // Garante que tudo desenhado depois da zona volte ao modo normal.
  ctx.globalCompositeOperation = "source-over";

  // Borda da zona
  ctx.save();

  ctx.strokeStyle = map.safeZoneColor;
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

  ctx.restore();

  // Segurança final.
  ctx.globalCompositeOperation = "source-over";
}
// Desenha detalhes do chão, como gramas e arbustos.
function drawDecorations() {
  const map = currentMap || MAPS[DEFAULT_MAP_ID];

  // No mobile, reduzimos um pouco os detalhes decorativos para melhorar desempenho.
  const decorationStep = isMobileLayout() ? 2 : 1;

  decorations.forEach((decoration, index) => {
  if (index % decorationStep !== 0) return;
    const screenX = decoration.x - camera.x;
    const screenY = decoration.y - camera.y;

    if (decoration.type === "grass") {
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(decoration.rotation);

      if (map.id === "desert") {
  ctx.strokeStyle = "rgba(120, 53, 15, 0.32)";
} else if (map.id === "snow") {
  ctx.strokeStyle = "rgba(15, 23, 42, 0.16)";
} else if (map.id === "city") {
  ctx.strokeStyle = "rgba(203, 213, 225, 0.14)";
} else if (map.id === "swamp") {
  ctx.strokeStyle = "rgba(132, 204, 22, 0.36)";
} else if (map.id === "arena") {
  ctx.strokeStyle = "rgba(251, 113, 133, 0.22)";
} else {
  ctx.strokeStyle = "rgba(134, 239, 172, 0.32)";
}

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
      if (map.id === "desert") {
  ctx.fillStyle = "rgba(146, 64, 14, 0.65)";
} else if (map.id === "snow") {
  ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
} else if (map.id === "city") {
  ctx.fillStyle = "rgba(71, 85, 105, 0.55)";
} else if (map.id === "swamp") {
  ctx.fillStyle = "rgba(22, 101, 52, 0.88)";
} else if (map.id === "arena") {
  ctx.fillStyle = "rgba(88, 28, 135, 0.55)";
} else {
  ctx.fillStyle = "rgba(21, 128, 61, 0.85)";
}

      ctx.beginPath();
      ctx.arc(screenX, screenY, decoration.radius, 0, Math.PI * 2);
      ctx.fill();

      if (map.id === "desert") {
  ctx.fillStyle = "rgba(217, 119, 6, 0.42)";
} else if (map.id === "snow") {
  ctx.fillStyle = "rgba(226, 232, 240, 0.48)";
} else if (map.id === "city") {
  ctx.fillStyle = "rgba(148, 163, 184, 0.32)";
} else if (map.id === "swamp") {
  ctx.fillStyle = "rgba(132, 204, 22, 0.46)";
} else if (map.id === "arena") {
  ctx.fillStyle = "rgba(236, 72, 153, 0.34)";
} else {
  ctx.fillStyle = "rgba(34, 197, 94, 0.55)";
}

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
    const map = currentMap || MAPS[DEFAULT_MAP_ID];

    const mobile = isMobileLayout();
    
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
      ctx.fillStyle = map.id === "snow" ? "#475569" : "#78350f";
      ctx.fillRect(screenX - 6, screenY + 4, 12, 22);

      // Copa
      ctx.fillStyle = map.id === "snow" ? "#e2e8f0" : map.id === "desert" ? "#92400e" : "#166534";
      ctx.beginPath();
      ctx.arc(screenX, screenY, obstacle.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = map.id === "snow" ? "#f8fafc" : map.id === "desert" ? "#b45309" : "#15803d";
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

      ctx.fillStyle = map.id === "snow" ? "#94a3b8" : map.id === "desert" ? "#78716c" : "#57534e";
      ctx.beginPath();
      ctx.ellipse(screenX, screenY, obstacle.width / 2, obstacle.height / 2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = map.id === "snow" ? "#cbd5e1" : map.id === "desert" ? "#a16207" : "#78716c";
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
  ctx.fillStyle = !isPlayer && entity.hitFlash > 0 ? "#ffffff" : entity.color;
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
  const maxHealth = isPlayer ? player.maxHealth : 55;
  const healthPercent = clamp(entity.health / maxHealth, 0, 1);

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
  const isMobile = isMobileLayout();

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
// Desenha tiros com pequeno rastro visual.
function drawBullets() {
  bullets.forEach((bullet) => {
    const screenX = bullet.x - camera.x;
    const screenY = bullet.y - camera.y;

    // Rastro atrás da bala.
    ctx.save();
    ctx.strokeStyle = bullet.color;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = bullet.radius * 1.4;
    ctx.lineCap = "round";
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(
      screenX - bullet.vx * 14,
      screenY - bullet.vy * 14
    );
    ctx.lineTo(screenX, screenY);
    ctx.stroke();

    ctx.restore();

    // Bala principal.
    ctx.save();
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(screenX, screenY, bullet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}
// Desenha o mini mapa no canto da tela.
function drawMiniMap() {
  if (!miniMapCanvas || !miniMapCtx || !player || !safeZone) return;

  const mapWidth = miniMapCanvas.clientWidth || miniMapCanvas.width;
  const mapHeight = miniMapCanvas.clientHeight || miniMapCanvas.height;

  const scaleX = mapWidth / WORLD_WIDTH;
  const scaleY = mapHeight / WORLD_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  miniMapCtx.clearRect(0, 0, mapWidth, mapHeight);

  // Fundo
  miniMapCtx.fillStyle = "rgba(15, 23, 42, 0.96)";
  miniMapCtx.fillRect(0, 0, mapWidth, mapHeight);

  // Texto para confirmar que está desenhando
  miniMapCtx.fillStyle = "#e5e7eb";
  miniMapCtx.font = "bold 10px Arial";
  miniMapCtx.textAlign = "left";
  miniMapCtx.fillText("MAPA", 8, 14);

  // Borda
  miniMapCtx.strokeStyle = "rgba(255,255,255,0.35)";
  miniMapCtx.lineWidth = 2;
  miniMapCtx.strokeRect(1, 1, mapWidth - 2, mapHeight - 2);

  // Zona segura
  miniMapCtx.strokeStyle = "#38bdf8";
  miniMapCtx.lineWidth = 2;
  miniMapCtx.beginPath();
  miniMapCtx.arc(
    safeZone.x * scaleX,
    safeZone.y * scaleY,
    safeZone.radius * scale,
    0,
    Math.PI * 2
  );
  miniMapCtx.stroke();

  // Bots
  bots.forEach((bot) => {
    miniMapCtx.fillStyle = "#ef4444";
    miniMapCtx.beginPath();
    miniMapCtx.arc(bot.x * scaleX, bot.y * scaleY, 2.5, 0, Math.PI * 2);
    miniMapCtx.fill();
  });

  // Jogador
  miniMapCtx.fillStyle = player.color || "#38bdf8";
  miniMapCtx.beginPath();
  miniMapCtx.arc(player.x * scaleX, player.y * scaleY, 4, 0, Math.PI * 2);
  miniMapCtx.fill();

  // Direção da mira
  miniMapCtx.strokeStyle = "#ffffff";
  miniMapCtx.lineWidth = 1.5;
  miniMapCtx.beginPath();
  miniMapCtx.moveTo(player.x * scaleX, player.y * scaleY);
  miniMapCtx.lineTo(
    player.x * scaleX + Math.cos(player.aimAngle) * 10,
    player.y * scaleY + Math.sin(player.aimAngle) * 10
  );
  miniMapCtx.stroke();
}
// Desenha todos os elementos
// Desenha todos os elementos
function draw() {
  // Garante que o canvas começa cada frame no modo normal.
  ctx.globalCompositeOperation = "source-over";

  ctx.clearRect(0, 0, getViewportWidth(), getViewportHeight());

  drawMap();

  ctx.globalCompositeOperation = "source-over";
  drawMapSpecialDetails();

  ctx.globalCompositeOperation = "source-over";
  drawDecorations();

  // Zona antes dos personagens, para não cobrir player e bots.
  ctx.globalCompositeOperation = "source-over";
  drawSafeZone();

  // Segurança: volta para desenho normal antes de desenhar entidades.
  ctx.globalCompositeOperation = "source-over";

  drawObstacles();
  drawLoots();

  bots.forEach((bot) => drawCharacter(bot, false));

  if (player) {
    drawCharacter(player, true);
  }

  drawMuzzleFlashes();
  drawBullets();
  drawEliminationEffects();
  drawDamageTexts();

  drawMiniMap();

  // Segurança final para o próximo frame.
  ctx.globalCompositeOperation = "source-over";
}

// Loop principal do jogo
function gameLoop() {
  if (!gameRunning || gamePaused) return;

  updatePlayer();
  updateBots();
  updateBullets();
  updateLoots();
  updateSafeZone();
  updateEliminationEffects();
  updateMuzzleFlashes();
  updateDamageTexts();
  updateCamera();
  updateHUD();

  if (!isMobileLayout() && mouse.down && player) {
  shootBullet(player, mouse.worldX, mouse.worldY);
}

if (isMobileLayout() && mobileShootHeld && player) {
  mobileShoot();
}

  draw();

  animationId = requestAnimationFrame(gameLoop);
}

// Eventos de teclado
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "escape") {
  if (gamePaused) {
    resumeGame();
  } else {
    pauseGame();
  }

  return;
}

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

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

// Botões do menu
if (startButton) {
  startButton.addEventListener("click", startGame);
}

if (restartButton) {
  restartButton.addEventListener("click", startGame);
}

if (pauseButton) {
  pauseButton.addEventListener("click", pauseGame);
}

if (resumeButton) {
  resumeButton.addEventListener("click", resumeGame);
}

if (restartPauseButton) {
  restartPauseButton.addEventListener("click", startGame);
}

if (backToMenuButton) {
  backToMenuButton.addEventListener("click", backToMenu);
}
function updateSoundButtons() {
  if (soundButton) {
    soundButton.textContent = soundEnabled ? "🔊 Som" : "🔇 Som";
  }

  if (menuSoundButton) {
    menuSoundButton.textContent = soundEnabled ? "🔊 Som ligado" : "🔇 Som desligado";
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  updateSoundButtons();
}

if (soundButton) {
  soundButton.addEventListener("click", toggleSound);
}

if (menuSoundButton) {
  menuSoundButton.addEventListener("click", toggleSound);
}

updateSoundButtons();
function setupAdvancedShop() {
  shopCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentShopCategory = button.dataset.shopCategory || "character";
      renderAdvancedShop();
    });
  });

  renderAdvancedShop();
}
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
if (joystickArea && joystickBase && joystickStick) {
  joystickArea.addEventListener("pointerdown", (event) => {
    const isMobile = isMobileLayout();

  if (!isMobile || !gameRunning || gamePaused) return;

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
}

// Função usada pelo botão de tiro no celular.
// Ela mira automaticamente no bot mais próximo.
function mobileShoot() {
  if (!gameRunning || gamePaused || !player) return;

  updatePlayerAimAngle();

  shootBullet(
    player,
    player.x + Math.cos(player.aimAngle) * 250,
    player.y + Math.sin(player.aimAngle) * 250
  );
}

// Botão mobile de tiro
if (mobileShootButton) {
  mobileShootButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    mobileShootHeld = true;
    mobileShoot();
  });

  mobileShootButton.addEventListener("pointerup", (event) => {
    event.preventDefault();
    event.stopPropagation();

    mobileShootHeld = false;
  });

  mobileShootButton.addEventListener("pointercancel", (event) => {
    event.preventDefault();
    event.stopPropagation();

    mobileShootHeld = false;
  });

  mobileShootButton.addEventListener("pointerleave", () => {
    mobileShootHeld = false;
  });
}

// Botão mobile de recarregar
function mobileReload() {
  if (!gameRunning || gamePaused) return;
  reloadWeapon();
}
if (mobileReloadButton) {
  mobileReloadButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    mobileReload();
  });
}

// Botão mobile de cura
function mobileHeal() {
  if (!gameRunning || gamePaused) return;
  useMedkit();
}
if (mobileHealButton) {
  mobileHealButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    mobileHeal();
  });
}

// Botões mobile para trocar de arma
if (mobilePistolButton) {
  mobilePistolButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    switchWeapon("pistol");
  });
}

if (mobileRifleButton) {
  mobileRifleButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    switchWeapon("rifle");
  });
}

if (mobileShotgunButton) {
  mobileShotgunButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    switchWeapon("shotgun");
  });
}
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
// Verifica se o toque aconteceu em cima da área do joystick.
// Se for no joystick, não deve controlar a mira.
function isPointerOverJoystick(event) {
  if (!joystickArea) return false;

  const rect = joystickArea.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

// Verifica se o toque aconteceu em cima da área do joystick.
// Se for no joystick, não deve controlar a mira.
function isPointerOverJoystick(event) {
  if (!joystickArea) return false;

  const rect = joystickArea.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

// Começa a controlar a mira em praticamente toda a tela.
// Apenas a área do joystick fica reservada para movimentação.
canvas.addEventListener("pointerdown", (event) => {
  const isMobile = isMobileLayout();

  if (!isMobile || !gameRunning || gamePaused) return;

  // Se o toque foi no joystick, não mexe na mira.
  if (isPointerOverJoystick(event)) return;

  event.preventDefault();
  event.stopPropagation();

  mobileAim.active = true;
  mobileAim.pointerId = event.pointerId;

  canvas.setPointerCapture(event.pointerId);

  updateMobileAimFromPointer(event);
});

// Move a mira enquanto o dedo arrasta fora da área do joystick.
canvas.addEventListener("pointermove", (event) => {
  const isMobile = isMobileLayout();

  if (!isMobile || !gameRunning || gamePaused) return;
  if (!mobileAim.active) return;
  if (event.pointerId !== mobileAim.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  updateMobileAimFromPointer(event);
});

// Solta a mira quando o dedo sai da tela.
canvas.addEventListener("pointerup", (event) => {
  if (event.pointerId !== mobileAim.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  mobileAim.active = false;
  mobileAim.pointerId = null;
});

// Cancela a mira se o toque for interrompido.
canvas.addEventListener("pointercancel", (event) => {
  if (event.pointerId !== mobileAim.pointerId) return;

  event.preventDefault();
  event.stopPropagation();

  mobileAim.active = false;
  mobileAim.pointerId = null;
});
// Eventos da loja de skins
skinCards.forEach((card) => {
  card.addEventListener("click", () => {
    handleSkinClick(card.dataset.skin);
  });
});
// Eventos dos botões de dificuldade
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const difficultyId = button.dataset.difficulty;

    saveSelectedDifficulty(difficultyId);
    updateDifficultyUI();
  });
});
// clique nos botões de mapa
mapButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedMapId = button.dataset.map;

    saveSelectedMapId(selectedMapId);
    updateMapUI();
  });
});
// Botão para limpar o ranking local
if (clearRankingButton) {
  clearRankingButton.addEventListener("click", () => {
    const confirmed = confirm("Tem certeza que deseja limpar o ranking local?");

    if (!confirmed) return;

    clearLocalRanking();
  });
}
modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedModeId = button.dataset.mode;

    saveSelectedGameModeId(selectedModeId);
    updateGameModeUI();
  });
});
// Retorna estatísticas permanentes das conquistas.
function getAchievementStats() {
  const savedStats = localStorage.getItem(ACHIEVEMENTS_STATS_KEY);

  if (!savedStats) {
    return {
      totalKills: 0,
      totalMatches: 0,
      totalWins: 0,
      totalLoots: 0,
      totalDamage: 0,
      totalCoins: getTotalCoins(),
    };
  }

  try {
    const stats = JSON.parse(savedStats);

    return {
      totalKills: stats.totalKills || 0,
      totalMatches: stats.totalMatches || 0,
      totalWins: stats.totalWins || 0,
      totalLoots: stats.totalLoots || 0,
      totalDamage: stats.totalDamage || 0,
      totalCoins: getTotalCoins(),
    };
  } catch {
    return {
      totalKills: 0,
      totalMatches: 0,
      totalWins: 0,
      totalLoots: 0,
      totalDamage: 0,
      totalCoins: getTotalCoins(),
    };
  }
}

// Salva estatísticas permanentes.
function saveAchievementStats(stats) {
  localStorage.setItem(ACHIEVEMENTS_STATS_KEY, JSON.stringify(stats));
}

// Retorna conquistas já desbloqueadas.
function getUnlockedAchievements() {
  const savedUnlocked = localStorage.getItem(ACHIEVEMENTS_UNLOCKED_KEY);

  if (!savedUnlocked) {
    return {};
  }

  try {
    return JSON.parse(savedUnlocked);
  } catch {
    return {};
  }
}

// Salva conquistas desbloqueadas.
function saveUnlockedAchievements(unlocked) {
  localStorage.setItem(ACHIEVEMENTS_UNLOCKED_KEY, JSON.stringify(unlocked));
}

// Soma valor em uma estatística permanente.
function addAchievementStat(statName, amount) {
  const stats = getAchievementStats();

  stats[statName] = (stats[statName] || 0) + amount;

  if (stats[statName] < 0) {
    stats[statName] = 0;
  }

  stats.totalCoins = getTotalCoins();

  saveAchievementStats(stats);
  checkAchievements();
  renderAchievements();
}

// Verifica se alguma conquista foi desbloqueada.
function checkAchievements(showToast = true) {
  const stats = getAchievementStats();
  const unlocked = getUnlockedAchievements();

  ACHIEVEMENTS.forEach((achievement) => {
    if (unlocked[achievement.id]) return;

    const currentValue = stats[achievement.stat] || 0;

    if (currentValue >= achievement.target) {
  unlocked[achievement.id] = true;

  const currentCoins = getTotalCoins();
  saveTotalCoins(currentCoins + achievement.reward);
  updateMenuCoins();

  if (showToast) {
  queueAchievementToast(achievement);
}

  console.log(`Conquista desbloqueada: ${achievement.title}`);
}
  });

  saveUnlockedAchievements(unlocked);
}

// Renderiza conquistas na aba do menu.
function renderAchievements() {
  const list = document.getElementById("achievementsList");

  if (!list) return;

  const stats = getAchievementStats();
  const unlocked = getUnlockedAchievements();

  list.innerHTML = "";

  ACHIEVEMENTS.forEach((achievement) => {
    const currentValue = Math.min(stats[achievement.stat] || 0, achievement.target);
    const percent = Math.min((currentValue / achievement.target) * 100, 100);
    const isUnlocked = Boolean(unlocked[achievement.id]);

    const item = document.createElement("div");
    item.className = `achievement-item ${isUnlocked ? "unlocked" : ""}`;

    item.innerHTML = `
      <div class="achievement-title">
        <span>${achievement.title}</span>
        <span class="achievement-badge">${isUnlocked ? "✅" : "🔒"}</span>
      </div>

      <div class="achievement-description">
        ${achievement.description}
      </div>

      <div class="achievement-progress-text">
        Progresso: ${currentValue}/${achievement.target}
      </div>

      <div class="achievement-progress-bar">
        <div class="achievement-progress-fill" style="width: ${percent}%"></div>
      </div>

      <div class="achievement-reward">
        Recompensa: +${achievement.reward} coins
      </div>
    `;

    list.appendChild(item);
  });
}
// =============================
// BOTÕES DA NOVA TELA DE GAME OVER
// =============================

function setupGameOverButtons() {
  const newRestartButton = document.getElementById("restartGameBtn");
  const newBackToMenuButton = document.getElementById("backToMenuBtn");

  if (newRestartButton) {
    newRestartButton.addEventListener("click", () => {
      hideGameOverScreen();
      startGame();
    });
  }

  if (newBackToMenuButton) {
    newBackToMenuButton.addEventListener("click", () => {
      hideGameOverScreen();
      backToMenu();
    });
  }
}
// =============================
// ETAPA 16 - ABAS DO MENU INICIAL
// =============================

// Abre uma aba específica do menu inicial.
// Exemplo: openMenuTab("shop") abre a aba Loja.
function openMenuTab(tabName) {
  const menuTabs = document.querySelectorAll(".menu-tab");
  const tabContents = document.querySelectorAll(".menu-tab-content");

  menuTabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  tabContents.forEach((content) => {
    content.classList.remove("active");
  });

  const activeButton = document.querySelector(`.menu-tab[data-tab="${tabName}"]`);
  const activeContent = document.getElementById(`tab-${tabName}`);

  if (activeButton) {
    activeButton.classList.add("active");
  }

  if (activeContent) {
    activeContent.classList.add("active");
  }
  if (tabName === "achievements") {
  checkAchievements(false);
  renderAchievements();
}
}

// Configura os cliques nas abas do menu.
function setupMenuTabs() {
  const menuTabsContainer = document.querySelector(".menu-tabs");

  if (!menuTabsContainer) {
    console.warn("Menu de abas não encontrado. Verifique se existe .menu-tabs no HTML.");
    return;
  }

  menuTabsContainer.addEventListener("click", (event) => {
    const clickedTab = event.target.closest(".menu-tab");

    if (!clickedTab) return;

    const selectedTab = clickedTab.dataset.tab;

    if (!selectedTab) return;

    openMenuTab(selectedTab);
  });

  // Garante que a aba Jogar comece aberta.
  openMenuTab("play");
}
// Como seu código não tem DOMContentLoaded,
// usamos window.load para ativar os botões depois que o HTML carregar.
window.addEventListener("load", () => {
  setupGameOverButtons();
  setupMenuTabs();
  setupAdvancedShop();
  renderAchievements();
  checkAchievements(false); // Verifica conquistas já completas, mas sem mostrar toast ao carregar a página.
  updateMapUI();
  updateGameModeUI();

});
// Atualiza menu e loja quando o jogo abre.
updateMenuCoins();
updateShopUI();
updateDifficultyUI();
updateRankingUI();
hideMiniMap();

// Registra service worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service Worker não registrado:", error);
    });
  });
}