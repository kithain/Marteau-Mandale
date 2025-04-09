const playerClass = window.PLAYER_CLASS;
const talents = window.PLAYER_TALENTS;
let playerMana = 100;
const maxMana = 100;
let cooldowns = {};
let playerX = 0;
let playerY = 0;
let currentMap = "A1";
let exitZones = [];
const tileSize = 64;
const blockedTiles = new Set();
const maxTileCount = 16;
let isTransitioning = false;

function getVisibleTileCount() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const rawCount = Math.floor(minSize / tileSize);
  return Math.min(maxTileCount, Math.max(5, rawCount));
}

function extraireCoordonneesCarte(nom) {
  const colonne = nom[0];
  const ligne = parseInt(nom.slice(1));
  return { colonne, ligne };
}

function verifierRencontre() {
  fetch(`/api/rencontre?x=${playerX}&y=${playerY}&carte=${currentMap}`)
    .then(res => res.json())
    .then(data => {
      if (data.monstre) {
        const monstre = data.monstre;
        const monstreDiv = document.createElement('div');
        monstreDiv.className = 'monstre';
        monstreDiv.style.width = monstreDiv.style.height = `${tileSize}px`;
        monstreDiv.style.left = `${playerX * tileSize}px`;
        monstreDiv.style.top = `${playerY * tileSize}px`;
        monstreDiv.style.backgroundImage = `url(/static/img/monstres/${monstre.image})`;
        monstreDiv.style.backgroundSize = 'contain';
        monstreDiv.style.position = 'absolute';
        monstreDiv.style.zIndex = '5';
        document.getElementById("map-inner").appendChild(monstreDiv);
      }
    });
}

function detecterSortie() {
  const sortie = exitZones.find(zone =>
    playerX >= zone.x &&
    playerX < zone.x + zone.width &&
    playerY >= zone.y &&
    playerY < zone.y + zone.height
  );
  if (sortie) {
    chargerNouvelleCarte(sortie.destination, sortie.spawnX, sortie.spawnY);
  }
}

function deplacementVersCarte(direction) {
  const colonnes = "ABCDEFGHIJKLMNOP";
  const { colonne, ligne } = extraireCoordonneesCarte(currentMap);
  let newCol = colonnes.indexOf(colonne);
  let newLigne = ligne;

  if (direction === 'gauche') newCol--;
  if (direction === 'droite') newCol++;
  if (direction === 'haut') newLigne--;
  if (direction === 'bas') newLigne++;

  if (newCol < 0 || newCol >= colonnes.length || newLigne < 1 || newLigne > 8) {
    console.log("🛑 Impossible de sortir de la carte : bord du monde.");
    return;
  }

  const nouvelleCarte = colonnes[newCol] + newLigne;

  let spawnX = playerX;
  let spawnY = playerY;
  if (direction === 'gauche') spawnX = 14;
  if (direction === 'droite') spawnX = 0;
  if (direction === 'haut') spawnY = 14;
  if (direction === 'bas') spawnY = 0;

  fetch(`/static/maps/${nouvelleCarte}.tmj`)
    .then(res => res.json())
    .then(mapData => {
      const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
      const tileset = mapData.tilesets[0];
      const GID_MASK = ~(0x80000000 | 0x40000000 | 0x20000000);
      const firstGID = tileset.firstgid;
      const GIDsLibres = new Set([
        0, 1, 2, 10, 11, 20, 21, 22, 23, 24, 25, 26, 27,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        75, 76, 77, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99
      ]);
      const index = spawnY * mapData.width + spawnX;
      const rawGid = layerSol.data[index];
      const gid = rawGid & GID_MASK;
      const relativeGid = gid - firstGID;
      if (!GIDsLibres.has(relativeGid)) {
        console.warn(`❌ Case bloquée en entrée sur ${nouvelleCarte} (${spawnX},${spawnY})`);
        return;
      }
      chargerNouvelleCarte(nouvelleCarte, spawnX, spawnY);
    });
}

const keyMap = {
  "&": 0, "é": 1, '"': 2, "'": 3,
  "(": 4, "-": 5, "è": 6, "_": 7,
  "ç": 8, "à": 9
};

function updateManaBar() {
  const manaFill = document.getElementById("mana-fill");
  const percent = (playerMana / maxMana) * 100;
  manaFill.style.width = percent + "%";
}

function getBlockedKey(x, y) {
  return `${x},${y}`;
}

function movePlayer() {
  const player = document.getElementById('player');
  if (!player) return;
  player.style.left = `${playerX * tileSize}px`;
  player.style.top = `${playerY * tileSize}px`;
  player.style.width = player.style.height = `${tileSize}px`;

  const mapInner = document.getElementById("map-inner");
  const visibleTiles = getVisibleTileCount();
  const mapWidth = 16;
  const mapHeight = 16;
  const halfVisible = Math.floor(visibleTiles / 2);
  let cameraX = playerX - halfVisible;
  let cameraY = playerY - halfVisible;
  cameraX = Math.max(0, Math.min(cameraX, mapWidth - visibleTiles));
  cameraY = Math.max(0, Math.min(cameraY, mapHeight - visibleTiles));
  mapInner.style.transform = `translate(${-cameraX * tileSize}px, ${-cameraY * tileSize}px)`;
}

function resizeMapContainer() {
  const count = getVisibleTileCount();
  const container = document.getElementById("map-container");
  container.style.width = `${tileSize * count}px`;
  container.style.height = `${tileSize * count}px`;
}

function isBlocked(x, y) {
  return blockedTiles.has(getBlockedKey(x, y));
}

function setPlayerPosition(x, y) {
  if (!isBlocked(x, y)) {
    playerX = x;
    playerY = y;
  } else {
    console.warn(`Spawn bloqué en (${x}, ${y}), tentative de placement...`);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const tryX = x + dx;
        const tryY = y + dy;
        if (!isBlocked(tryX, tryY)) {
          playerX = tryX;
          playerY = tryY;
          console.warn(`Nouveau spawn libre trouvé en (${tryX}, ${tryY})`);
          return;
        }
      }
    }
    console.error("❌ Aucun spawn libre autour de la position initiale !");
  }
}


function handleKeydown(e) {
  if (isTransitioning) return;
  const index = keyMap[e.key];
  if (index !== undefined && talents.talents[index]) {
    utiliserTalent(talents.talents[index], index);
    return;
  }
  let newX = playerX;
  let newY = playerY;
  if (e.key === 'ArrowUp') newY--;
  if (e.key === 'ArrowDown') newY++;
  if (e.key === 'ArrowLeft') newX--;
  if (e.key === 'ArrowRight') newX++;
  if (newX < 0) return deplacementVersCarte('gauche');
  if (newX >= 16) return deplacementVersCarte('droite');
  if (newY < 0) return deplacementVersCarte('haut');
  if (newY >= 16) return deplacementVersCarte('bas');
  const isBlocked = blockedTiles.has(getBlockedKey(newX, newY));
  const hasMoved = newX !== playerX || newY !== playerY;
  if (!isBlocked && hasMoved) {
    playerX = newX;
    playerY = newY;
    movePlayer();
    verifierRencontre();
    detecterSortie();
  }
}

function initialiserTalents() {
  const talentButtons = document.getElementById('talents-buttons');
  talents.talents.forEach((talent, index) => {
    const btn = document.createElement('button');
    btn.id = `talent-btn-${index}`;
    btn.textContent = `${index + 1}. ${talent.name}`;
    btn.onclick = () => utiliserTalent(talent, index);
    talentButtons.appendChild(btn);
  });
}

function chargerNouvelleCarte(nomMap, spawnX = null, spawnY = null) {
  isTransitioning = true;
  currentMap = nomMap;
  fetch(`/static/maps/${nomMap}.tmj`)
    .then(res => res.json())
    .then(mapData => {
      const container = document.getElementById("map-inner");
      container.innerHTML = '';
      const tileset = mapData.tilesets[0];
      const originalTileSize = mapData.tilewidth;
      const scale = 4;
      const displayTileSize = originalTileSize * scale;
      const width = mapData.width;
      const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
      const tilesetImage = new Image();
      tilesetImage.onload = () => {
        const cols = tileset.columns || (tilesetImage.width / originalTileSize);
        layerSol.data.forEach((rawGid, index) => {
          if (rawGid === 0) return;
          const GID_MASK = ~(0x80000000 | 0x40000000 | 0x20000000);
          const gid = rawGid & GID_MASK;
          const id = gid - tileset.firstgid;
          const sx = (id % cols) * originalTileSize;
          const sy = Math.floor(id / cols) * originalTileSize;
          const tile = document.createElement('div');
          tile.className = 'tile';
          tile.style.width = tile.style.height = `${displayTileSize}px`;
          tile.style.position = 'absolute';
          const x = index % width;
          const y = Math.floor(index / width);
          tile.style.left = `${x * tileSize}px`;
          tile.style.top = `${y * tileSize}px`;
          tile.style.backgroundImage = `url(${tilesetImage.src})`;
          tile.style.backgroundPosition = `-${sx * scale}px -${sy * scale}px`;
          tile.style.backgroundSize = `${tilesetImage.width * scale}px ${tilesetImage.height * scale}px`;
          container.appendChild(tile);
        });
        const GIDsLibres = new Set([0,1,2,10,11,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,75,76,77,85,86,87,88,89,95,96,97,98,99]);
        const firstGID = tileset.firstgid;
        blockedTiles.clear();
        layerSol.data.forEach((rawGid, idx) => {
          const gid = rawGid & ~(0x80000000 | 0x40000000 | 0x20000000);
          const relativeGid = gid - firstGID;
          if (!GIDsLibres.has(relativeGid)) {
            const x = idx % mapData.width;
            const y = Math.floor(idx / mapData.width);
            blockedTiles.add(getBlockedKey(x, y));
          }
        });
        const sortieLayer = mapData.layers.find(l => l.name === "sorties" && l.type === "objectgroup");
        exitZones = sortieLayer ? sortieLayer.objects.map(o => ({
          x: Math.floor(o.x / mapData.tilewidth),
          y: Math.floor(o.y / mapData.tileheight),
          width: Math.floor(o.width / mapData.tilewidth),
          height: Math.floor(o.height / mapData.tileheight),
          destination: o.properties.find(p => p.name === "destination")?.value,
          spawnX: o.properties.find(p => p.name === "spawnX")?.value ?? 0,
          spawnY: o.properties.find(p => p.name === "spawnY")?.value ?? 0
        })) : [];
        const spawn = mapData.layers.find(l => l.name === "player_start")?.objects?.[0];
        if (!spawn && spawnX === null && spawnY === null) {
          alert("Pas de point de départ !");
          return;
        }
        playerX = spawnX ?? Math.floor(spawn.x / mapData.tilewidth);
        playerY = spawnY ?? Math.floor(spawn.y / mapData.tileheight);
        blockedTiles.delete(getBlockedKey(playerX, playerY));
        let player = document.getElementById('player');
        if (!player) {
          player = document.createElement('div');
          player.id = 'player';
          player.style.position = 'absolute';
          player.style.backgroundImage = `url(/static/img/classes/${playerClass.toLowerCase()}_idle.png)`;
          player.style.backgroundRepeat = 'no-repeat';
          player.style.backgroundSize = 'contain';
          player.style.zIndex = '10';
          document.getElementById("map-inner").appendChild(player);
        } else {
          document.getElementById("map-inner").appendChild(player);
        }
        player.style.width = player.style.height = `${displayTileSize}px`;
        movePlayer();
      };
      tilesetImage.src = "/static/maps/Sprite-foret.png";
    });
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', handleKeydown);
  updateManaBar();
  chargerNouvelleCarte(window.PLAYER_MAP || "P1");
  initialiserTalents();
  resizeMapContainer();
  window.addEventListener('resize', () => {
    resizeMapContainer();
    movePlayer();
  });
  isTransitioning = false;
});
