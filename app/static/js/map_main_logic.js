// map_main_logic.js
// Gestion de la carte, du positionnement et des déplacements du joueur
// Refactorisé pour clarté, organisation et maintenabilité

import { 
  TILE_SIZE, 
  IMAGE_BASE_URL, 
  API_BASE_URL,
  MAX_TILE_COUNT,
  set_player_position
} from './map_constants_logic.js';

import { get_position_joueur } from './player_main_logic.js';
import { genererRencontre } from './combat_manager_logic.js';

// --- Variables d'état ---
const tileSize = TILE_SIZE;
const blockedTiles = new Set();

// --- Etat global ---
let currentMap = "A1";
let exitZones = [];
let isTransitioning = false;

// --- Fonctions utilitaires ---
function getVisibleTileCount() {
  const minSize = Math.min(window.innerWidth, window.innerHeight);
  const rawCount = Math.floor(minSize / tileSize);
  return Math.min(MAX_TILE_COUNT, Math.max(5, rawCount));
}

function extraireCoordonneesCarte(nom) {
  const colonne = nom[0];
  const ligne = parseInt(nom.slice(1));
  return { colonne, ligne };
}

function getBlockedKey(x, y) {
  return `${x},${y}`;
}

function isBlocked(x, y) {
  return blockedTiles.has(getBlockedKey(x, y));
}

// --- Déplacement et positionnement du joueur ---
function deplacementVersCarte(direction) {
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
  let spawnX = dir[direction].spawnX !== undefined ? dir[direction].spawnX : get_position_joueur().x;
  let spawnY = dir[direction].spawnY !== undefined ? dir[direction].spawnY : get_position_joueur().y;
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
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        42, 43, 44, 45, 46, 47, 48, 49,
        75, 76, 77, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99
      ]);
      if (!GIDsLibres.has(relativeGid)) {
        console.warn(`❌ Case bloquée en entrée sur ${nouvelleCarte} (${spawnX},${spawnY})`);
        return;
      }
      // ✅ Tout est bon → on charge la nouvelle carte
      charger_nouvelle_carte(nouvelleCarte, spawnX, spawnY);
    })
    .catch(err => console.error("Erreur de chargement de carte :", err));
}

export function charger_nouvelle_carte(nomCarte, spawnX = null, spawnY = null) {
  // Arrête le combat et nettoie les monstres avant de charger la nouvelle carte
  // stopAllMonsters();
  // window.monstresActifs = [];
  // window.combatActif = false;
  window.PLAYER_MAP = nomCarte; // Synchronisation pour la sauvegarde
  isTransitioning = true;
  currentMap = nomCarte;

  fetch(`${IMAGE_BASE_URL}/maps/${nomCarte}.tmj`)
    .then(res => res.json())
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

          if (!set_player_position(targetX, targetY, true)) {
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
          playerDiv.style.backgroundImage = `url(/static/img/classes/${get_position_joueur().classe.toLowerCase()}_idle.png)`;
          playerDiv.style.backgroundSize = "64px 64px";
          playerDiv.style.imageRendering = "pixelated";
          playerDiv.style.backgroundRepeat = "no-repeat";
          playerDiv.style.position = "absolute";
          playerDiv.style.zIndex = "10";
          playerDiv.style.zIndex = "10";
          container.appendChild(playerDiv);

          // movePlayer();

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

// --- Chargement initial ---
export function charger_carte_initiale() {
  return charger_nouvelle_carte("A1"); // Laisser chargerNouvelleCarte gérer le player_start
}

// Renommage pour cohérence :
export const generer_rencontre = genererRencontre; // Alias snake_case

export function est_bloquee(x, y) { // Renommage français + snake_case
  return blockedTiles.has(getBlockedKey(x, y));
}

// --- Exports publics à la fin ---
export {
  IMAGE_BASE_URL,
  API_BASE_URL,
  tileSize,
  MAX_TILE_COUNT,
  blockedTiles,
  currentMap,
  exitZones,
  isTransitioning,
  getVisibleTileCount,
  extraireCoordonneesCarte,
  getBlockedKey,
  isBlocked,
  deplacementVersCarte,
  charger_nouvelle_carte
};
