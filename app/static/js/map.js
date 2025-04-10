// map.js
const IMAGE_BASE_URL = '/static';
const API_BASE_URL = '/api';
let deplacementSansRencontre = 0;
import { playerClass, getPlayerX, getPlayerY, setPlayerPosition as setGlobalPlayerPosition, /*updateManaBar, initialiserTalents,*/ utiliserTalent, combatActif, talents } from './player.js';
import { demarrerCombat, getMonstreActif } from './monstre.js';
export let currentMap = "A1";
export let exitZones = [];
export const tileSize = 64;
export const blockedTiles = new Set();
export const maxTileCount = 16;
export let isTransitioning = false;


export function getVisibleTileCount() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const rawCount = Math.floor(minSize / tileSize);
  return Math.min(maxTileCount, Math.max(5, rawCount));
}

export function extraireCoordonneesCarte(nom) {
  const colonne = nom[0];
  const ligne = parseInt(nom.slice(1));
  return { colonne, ligne };
}

export function verifierRencontre() {
  if (combatActif) return;
  if (deplacementSansRencontre > 0) {
    deplacementSansRencontre--;
    return;
  }

  fetch(`${API_BASE_URL}/rencontre?x=${getPlayerX()}&y=${getPlayerY()}&carte=${currentMap}`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur de réseau');
      return res.json();
    })
    .then(data => {
      if (data.monstre) {
        const monstre = data.monstre;
        // Utilise la valeur de points de vie définie dans ton monstre.json
        const pv = monstre.pv;
        demarrerCombat(monstre, pv, getPlayerX(), getPlayerY());
        // Appliquer un cooldown local pour éviter de générer trop rapidement plusieurs rencontres
        deplacementSansRencontre = 5;
      }
    })
    .catch(error => {
      console.error('Erreur lors de la vérification des rencontres:', error);
    });
}

export let lastMoveDirection = null;


export function detecterSortie() {
  const sortie = exitZones.find(zone =>
    getPlayerX() >= zone.x &&
    getPlayerX() < zone.x + zone.width &&
    getPlayerY() >= zone.y &&
    getPlayerY() < zone.y + zone.height
  );
  if (sortie) {
    chargerNouvelleCarte(sortie.destination, sortie.spawnX, sortie.spawnY);
  }
}

export function deplacementVersCarte(direction) {
  const colonnes = "ABCDEFGHIJKLMNOP";
  const { colonne, ligne } = extraireCoordonneesCarte(currentMap);
  const dir = {
    gauche: { dx: -1, dy: 0, spawnX: 15 },
    droite: { dx: 1, dy: 0, spawnX: 0 },
    haut: { dx: 0, dy: -1, spawnY: 15 },
    bas: { dx: 0, dy: 1, spawnY: 0 }
  };

  if (!(direction in dir)) return;

  let newCol = colonnes.indexOf(colonne) + dir[direction].dx;
  let newLigne = ligne + dir[direction].dy;

  if (newCol < 0 || newCol >= colonnes.length || newLigne < 1 || newLigne > 8) {
    console.log("🛑 Impossible de sortir de la carte : bord du monde.");
    return;
  }

  const nouvelleCarte = colonnes[newCol] + newLigne;

  let spawnX = dir[direction].spawnX !== undefined ? dir[direction].spawnX : getPlayerX();
  let spawnY = dir[direction].spawnY !== undefined ? dir[direction].spawnY : getPlayerY();

  fetch(`${IMAGE_BASE_URL}/maps/${nouvelleCarte}.tmj`)
    .then(res => res.json())
    .then(mapData => {
      const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
      const tileset = mapData.tilesets[0];
      const firstGID = tileset.firstgid;
      const GID_MASK = ~(0x80000000 | 0x40000000 | 0x20000000);
      const rawGid = layerSol.data[spawnY * mapData.width + spawnX];
      const gid = rawGid & GID_MASK;
      const relativeGid = gid - firstGID;

      const GIDsLibres = new Set([0, 1, 2, 10, 11, 20, 21, 22, 23, 24, 25, 26, 27,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        75, 76, 77, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99]);

      if (!GIDsLibres.has(relativeGid)) {
        console.warn(`❌ Case bloquée en entrée sur ${nouvelleCarte} (${spawnX},${spawnY})`);
        return;
      }

      // ✅ Tout est bon → on charge la nouvelle carte
      chargerNouvelleCarte(nouvelleCarte, spawnX, spawnY);
    })
    .catch(err => console.error("Erreur de chargement de carte :", err));
}


export function getBlockedKey(x, y) {
  return `${x},${y}`;
}

export function movePlayer() {
  // Récupérer l'élément DOM du joueur
  const player = document.getElementById('player');
  if (!player) return;

  // ---------------------------
  // 1. Positionnement du joueur
  // ---------------------------
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  player.style.left = `${playerX * tileSize}px`;
  player.style.top = `${playerY * tileSize}px`;

  // ---------------------------
  // 2. Ajustement de la caméra
  // ---------------------------
  const mapInner = document.getElementById("map-inner");
  const mapContainer = document.getElementById("map-container");

  // Dimensions du conteneur visible après dézoom appliqué
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;

  // Dimensions complètes de la carte (ici 16 tuiles de tileSize chacune)
  const mapWidth = tileSize * 16;
  const mapHeight = tileSize * 16;

  // Calcul du décalage souhaité pour centrer la caméra sur le joueur
  let cameraX = playerX * tileSize - (containerWidth / 2 - tileSize / 2);
  let cameraY = playerY * tileSize - (containerHeight / 2 - tileSize / 2);

  // Ajustement pour ne pas dépasser les bords de la carte
  cameraX = Math.max(0, Math.min(cameraX, mapWidth - containerWidth));
  cameraY = Math.max(0, Math.min(cameraY, mapHeight - containerHeight));

  // Appliquer le déplacement à la carte
  mapInner.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;

  // --------------------------------------------------------------
  // 3. Vérification de la présence d'un monstre et relance du combat
  // --------------------------------------------------------------
  // Récupération de l'élément du monstre en combat via son ID (débutant par "combat-monstre-")
  const monsterDiv = document.querySelector("[id^='combat-monstre-']");
  if (monsterDiv && !combatActif) {
    // Calcul des coordonnées du monstre (basées sur la taille d'une tuile)
    const monstreX = parseInt(monsterDiv.style.left, 10) / tileSize;
    const monstreY = parseInt(monsterDiv.style.top, 10) / tileSize;

    // Si le joueur est sur la même case que le monstre
    if (playerX === monstreX && playerY === monstreY) {
      // Récupération du monstre actif à partir de monstre.js
      const monstre = getMonstreActif();
      if (monstre) {
        // Relancer le combat en redémarrant l'attaque automatique avec les données du monstre
        demarrerCombat(monstre.data, monstre.pv, playerX, playerY);
        console.log("Combat relancé car le joueur est sur la case du monstre.");
      } else {
        // Si aucune donnée de monstre n'est trouvée (cas rare), basculer simplement le flag de combat
        setCombat(true);
        console.log("Combat activé (fallback).");
      }
    }
  }
}

export function resizeMapContainer() {
  //const count = getVisibleTileCount();
  //const container = document.getElementById("map-container");
  //container.style.width = `${tileSize * count}px`;
  //container.style.height = `${tileSize * count}px`;
}

export function isBlocked(x, y) {
  return blockedTiles.has(getBlockedKey(x, y));
}

export function setPlayerPosition(x, y) {
  if (!isBlocked(x, y)) {
    setGlobalPlayerPosition(x, y);
    return true;
  }

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const tryX = x + dx;
      const tryY = y + dy;
      if (!isBlocked(tryX, tryY)) {
        setGlobalPlayerPosition(tryX, tryY);
        return true;
      }
    }
  }

  console.error("Aucun spawn libre autour de la position initiale");
  return false;
}

export function handleKeydown(e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    window.lastMoveDirection = e.key;
  }
  const talentKeys = ["&", "é", '"', "'", "(", "-", "è", "_", "ç", "à"];
  if (combatActif && !talentKeys.includes(e.key)) {
    console.log("Déplacement bloqué en mode combat.");
    return;
  }
  if (isTransitioning) return;
  const keyMap = {
    "&": 0, "é": 1, '"': 2, "'": 3,
    "(": 4, "-": 5, "è": 6, "_": 7,
    "ç": 8, "à": 9
  };
  const talentIndex = keyMap[e.key];
  const skills = Array.isArray(talents) ? talents : talents.talents;
  
  if (talentIndex !== undefined && skills[talentIndex]) {
    utiliserTalent(skills[talentIndex], talentIndex);
    return;
  }

  let newX = getPlayerX();
  let newY = getPlayerY();
  if (e.key === 'ArrowUp') newY--;
  if (e.key === 'ArrowDown') newY++;
  if (e.key === 'ArrowLeft') newX--;
  if (e.key === 'ArrowRight') newX++;

  if (newX < 0) return deplacementVersCarte('gauche');
  if (newX >= 16) return deplacementVersCarte('droite');
  if (newY < 0) return deplacementVersCarte('haut');
  if (newY >= 16) return deplacementVersCarte('bas');

  const blocked = blockedTiles.has(getBlockedKey(newX, newY));
  const hasMoved = newX !== getPlayerX() || newY !== getPlayerY();

  if (!blocked && hasMoved) {
    setGlobalPlayerPosition(newX, newY);
    movePlayer();
    // Vérifier si un ou plusieurs monstres occupent la tuile cible
    const monsterElements = document.querySelectorAll("[id^='combat-monstre-']");
    monsterElements.forEach(monsterDiv => {
      const monstreX = Math.round(parseFloat(monsterDiv.style.left) / tileSize);
      const monstreY = Math.round(parseFloat(monsterDiv.style.top) / tileSize);
      console.log(`Comparaison: Joueur (${newX}, ${newY}) - Monstre (${monstreX}, ${monstreY})`);
      if (newX === monstreX && newY === monstreY) {
        if (!combatActif) {
          setCombat(true);
          console.log("Combat re-déclenché car le joueur a déplacé sur la case d'un monstre.");
        }
      }
    });
    verifierRencontre();
    detecterSortie();
  }
}
export function chargerNouvelleCarte(nomMap, spawnX = null, spawnY = null) {
  isTransitioning = true;
  currentMap = nomMap;

  fetch(`${IMAGE_BASE_URL}/maps/${nomMap}.tmj`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(async mapData => {
      const container = document.getElementById("map-inner");
      if (!container) throw new Error("Container map-inner introuvable");
      container.innerHTML = '';

      let tileset = mapData.tilesets[0];
      let tilesetImagePath = tileset.image;

      // charger le .tsx
      if (!tilesetImagePath && tileset.source) {
        const sourcePath = tileset.source.replace(/^\.\.\//, '');
        const tsxResponse = await fetch(`${IMAGE_BASE_URL}/maps/${sourcePath}`);
        if (!tsxResponse.ok) throw new Error("Impossible de charger le fichier .tsx");
        const tsxText = await tsxResponse.text();

        // Extraire l'image du .tsx
        const parser = new DOMParser();
        const tsxXml = parser.parseFromString(tsxText, "text/xml");
        const imageNode = tsxXml.querySelector('image');
        if (!imageNode) throw new Error("Pas d'image trouvée dans le .tsx");
        tilesetImagePath = imageNode.getAttribute('source').replace(/^\.\.\//, '');
        tileset.imagewidth = parseInt(imageNode.getAttribute('width'));
        tileset.imageheight = parseInt(imageNode.getAttribute('height'));
      }

      const originalTileSize = mapData.tilewidth;
      const scale = 4;
      const displayTileSize = originalTileSize * scale;
      const width = mapData.width;
      const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
      const tilesetImage = new Image();

      // Liste blanche des GIDs marchables
      const GIDsLibres = new Set([
        0, 1, 2, 10, 11, 20, 21, 22, 23, 24, 25, 26, 27,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        42, 43, 44, 45, 46, 47, 48, 49,
        75, 76, 77, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99
      ]);

      blockedTiles.clear();
      const GID_MASK = ~(0x80000000 | 0x40000000 | 0x20000000);

      tilesetImage.onload = () => {
        try {
          for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
              const index = y * mapData.width + x;
              const rawGid = layerSol.data[index];
              const gid = rawGid & GID_MASK;
              if (gid === 0) continue;
              const tileIndex = gid - tileset.firstgid;
              const tilesPerRow = Math.floor(tileset.imagewidth / mapData.tilewidth);
              const sx = (tileIndex % tilesPerRow) * mapData.tilewidth;
              const sy = Math.floor(tileIndex / tilesPerRow) * mapData.tileheight;

              const tile = document.createElement("div");
              tile.className = "tile";
              tile.style.left = `${x * tileSize}px`;
              tile.style.top = `${y * tileSize}px`;
              tile.style.backgroundImage = `url(${IMAGE_BASE_URL}/maps/${tilesetImagePath})`;
              tile.style.backgroundPosition = `-${sx * scale}px -${sy * scale}px`;
              tile.style.backgroundSize = `${tileset.imagewidth * scale}px ${tileset.imageheight * scale}px`;
              container.appendChild(tile);

              // Marquer comme bloqué si pas dans la whitelist
              const relativeGid = gid - tileset.firstgid;
              if (!GIDsLibres.has(relativeGid)) {
                blockedTiles.add(getBlockedKey(x, y));
              }
            }
          }

          const spawn = mapData.layers.find(l => l.name === "player_start")?.objects?.[0];
          if (!spawn && spawnX === null && spawnY === null) {
            throw new Error("Pas de point de départ trouvé");
          }

          const targetX = (spawnX !== null && spawnX !== undefined) ?
            Math.max(0, Math.min(spawnX, mapData.width - 1)) :
            Math.floor(spawn.x / mapData.tilewidth);

          const targetY = (spawnY !== null && spawnY !== undefined) ?
            Math.max(0, Math.min(spawnY, mapData.height - 1)) :
            Math.floor(spawn.y / mapData.tileheight);

          if (!setPlayerPosition(targetX, targetY)) {
            throw new Error("Impossible de placer le joueur");
          }

          // Supprime le joueur précédent
          const oldPlayer = document.getElementById("player");
          if (oldPlayer) {
            oldPlayer.remove();
          }
          const playerDiv = document.createElement("div");
          playerDiv.id = "player";
          playerDiv.style.position = "absolute";
          playerDiv.style.width = "64px";
          playerDiv.style.height = "64px";
          playerDiv.style.backgroundImage = `url(/static/img/classes/${playerClass.toLowerCase()}_idle.png)`;
          playerDiv.style.backgroundSize = "64px 64px";
          playerDiv.style.imageRendering = "pixelated";
          playerDiv.style.backgroundRepeat = "no-repeat";
          playerDiv.style.position = "absolute";
          playerDiv.style.zIndex = "10";
          playerDiv.style.zIndex = "10";
          container.appendChild(playerDiv);

          movePlayer();
          window.addEventListener("keydown", handleKeydown);

          isTransitioning = false;
        } catch (error) {
          console.error("Erreur lors du chargement de la carte:", error);
          isTransitioning = false;
        }
      };

      tilesetImage.onerror = () => {
        console.error("Erreur de chargement du tileset image");
        isTransitioning = false;
      };

      tilesetImage.src = `${IMAGE_BASE_URL}/maps/${tilesetImagePath}`;
    })
    .catch(error => {
      console.error("Erreur de chargement de la carte:", error);
      isTransitioning = false;
    });
}
