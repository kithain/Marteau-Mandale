// map_main_logic.js
// Gestion de la carte, du positionnement et des déplacements du joueur
// Refactorisé pour clarté, organisation et maintenabilité

import { 
  TILE_SIZE, 
  IMAGE_BASE_URL, 
  API_BASE_URL,
  MAX_TILE_COUNT
} from './map_constants_logic.js';

import { get_position_joueur, set_position_joueur, get_classe_joueur } from './player_state_logic.js';
import { movePlayer } from './camera_main_logic.js';
import { generer_rencontre } from './combat_manager_logic.js';

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

function getPlayerStartPosition(mapData) {
  const playerStartLayer = mapData.layers.find(l => l.name === "player_start");
  if (!playerStartLayer) {
    console.error("Calque player_start introuvable");
    return null;
  }
  
  const startObject = playerStartLayer.objects.find(obj => obj.name === "position_initiale");
  if (!startObject) {
    console.error("Objet position_initiale introuvable dans le calque player_start");
    return null;
  }
  
  return {
    x: startObject.x,
    y: startObject.y
  };
}

class TileManager {
  static GIDsLibres = new Set([
    0, 1, 2, 10, 11, 20, 21, 22, 23, 24, 25, 26, 27,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49,
    75, 76, 77, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99
  ]);

  static isTileBlocked(x, y, gid, firstgid) {
    const relativeGid = gid - firstgid;
    return !this.GIDsLibres.has(relativeGid);
  }

  static getBlockedKey(x, y) {
    return `${x},${y}`;
  }
}

const isBlocked = (x, y) => blockedTiles.has(TileManager.getBlockedKey(x, y));

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
      console.log(`[DEBUG] Carte:${nouvelleCarte} spawnX:${spawnX} spawnY:${spawnY} rawGid:${rawGid} gid:${gid} firstGID:${firstGID} relativeGid:${relativeGid} isLibre:${TileManager.GIDsLibres.has(relativeGid)}`);
      if (TileManager.isTileBlocked(spawnX, spawnY, gid, firstGID)) {
        console.warn("[Carte] La case d'arrivée est bloquée !");
        // Affichage d'un message utilisateur (console ou UI selon besoin)
        return;
      }
      // ✅ Tout est bon → on charge la nouvelle carte
      charger_nouvelle_carte_full(nouvelleCarte, spawnX, spawnY);
    })
    .catch(err => console.error("Erreur de chargement de carte :", err));
}

async function charger_nouvelle_carte(direction) {
  const currentName = currentMap;
  const { colonne, ligne } = extraireCoordonneesCarte(currentName);
  
  // Calcul nouvelle position
  let newCol = colonne;
  let newRow = ligne;
  let spawnPos = { x: 0, y: 0 };
  
  switch(direction) {
    case 'nord': newRow--; spawnPos = { x: get_position_joueur().x, y: 15 }; break;
    case 'sud': newRow++; spawnPos = { x: get_position_joueur().x, y: 0 }; break;
    case 'ouest': newCol--; spawnPos = { x: 15, y: get_position_joueur().y }; break;
    case 'est': newCol++; spawnPos = { x: 0, y: get_position_joueur().y }; break;
  }

  const newMapName = `${newCol}${newRow}`;
  
  try {
    const mapData = await fetch(`${IMAGE_BASE_URL}/maps/${newMapName}.tmj`)
      .then(res => res.json());
    
    // Vérifier que la position d'arrivée n'est pas bloquée
    // SUPPRESSION DE LA VERIFICATION DE BLOCAGE ICI (déjà faite dans deplacementVersCarte)
    // const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
    // const tileset = mapData.tilesets[0];
    // const firstGID = tileset.firstgid;
    // const GID_MASK = ~(0x80000000 | 0x40000000 | 0x20000000);
    // const rawGid = layerSol.data[spawnPos.y * mapData.width + spawnPos.x];
    // const gid = rawGid & GID_MASK;
    // const relativeGid = gid - firstGID;
    // if (TileManager.isTileBlocked(spawnPos.x, spawnPos.y, gid, firstGID)) {
    //   console.warn(`Position d'arrivée bloquée sur ${newMapName}`);
    //   return null;
    // }
    
    charger_nouvelle_carte_full(newMapName, spawnPos.x, spawnPos.y);
  } catch (err) {
    console.error('Erreur chargement carte:', err);
    return null;
  }
}

function charger_nouvelle_carte_full(nomCarte, spawnX = null, spawnY = null, forceNewPosition = false) {
  // Arrête le combat et nettoie les monstres avant de charger la nouvelle carte
  window.PLAYER_MAP = nomCarte;
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
      const scale = 4; // Déplacé ici
      const displayTileSize = originalTileSize * scale;
      const width = mapData.width;
      const layerSol = mapData.layers.find(l => l.name === "Calque 1" && l.type === "tilelayer");
      const tilesetImage = new Image();

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
              if (TileManager.isTileBlocked(x, y, gid, tileset.firstgid)) {
                blockedTiles.add(TileManager.getBlockedKey(x, y));
              }
            }
          }

          let playerPos;
          if (spawnX !== null && spawnY !== null) {
            playerPos = { x: spawnX, y: spawnY };
          } else {
            const startPos = getPlayerStartPosition(mapData);
            if (!startPos) {
              console.error("Position initiale du joueur introuvable");
              playerPos = { x: 0, y: 0 };
            } else {
              playerPos = {
                x: Math.floor(startPos.x / mapData.tilewidth),
                y: Math.floor(startPos.y / mapData.tileheight)
              };
            }
          }

          set_position_joueur(playerPos.x, playerPos.y);
          // movePlayer(); // SUPPRIMÉ : on veut que le DOM du joueur existe avant d'appeler movePlayer

          const playerDiv = document.createElement("div");
          playerDiv.id = "player";
          
          const playerClass = get_classe_joueur() || 'Paladin';
          const imagePath = `/static/img/classes/${playerClass.toLowerCase()}_idle.png`;
          
          playerDiv.style.backgroundImage = `url(${imagePath})`;
          playerDiv.style.position = "absolute";
          playerDiv.style.width = "64px";
          playerDiv.style.height = "64px";
          playerDiv.style.backgroundSize = "64px 64px";
          playerDiv.style.imageRendering = "pixelated";
          playerDiv.style.backgroundRepeat = "no-repeat";
          playerDiv.style.zIndex = "10";
          container.appendChild(playerDiv);

          playerDiv.style.left = `${playerPos.x * mapData.tilewidth * scale}px`;
          playerDiv.style.top = `${playerPos.y * mapData.tileheight * scale}px`;

          // Centrage caméra APRÈS que le joueur soit dans le DOM
          movePlayer(mapData);

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
function charger_carte_initiale() {
  charger_nouvelle_carte_full('P7', null, null, true);
}

function est_bloquee(x, y) {
  return blockedTiles.has(TileManager.getBlockedKey(x, y));
}

/**
 * Calcule la difficulté d'une carte donnée (ex: "A1", "P8")
 */
function get_difficulty_carte(nom_carte) {
  if (typeof nom_carte !== 'string' || nom_carte.length < 2) return 1;

  const ligne = nom_carte[0].toUpperCase(); // Ex: 'A'
  const colonne = parseInt(nom_carte.slice(1), 10); // Ex: 1
  
  const ligne_index = ligne.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // 'A'->1
  const colonne_index = colonne; // 1 à 8
  
  const max_distance = (16 - 1) + (8 - 1); // 22
  const distance = (ligne_index - 1) + (colonne_index - 1);

  let difficulty = 10 - (distance / max_distance) * 9;
  difficulty = Math.round(difficulty);
  return Math.min(Math.max(difficulty, 1), 10);
}

// --- Expose explicitement sur window pour accès global et compatibilité ---
window.get_difficulty_carte = get_difficulty_carte;

// --- Exports publics à la fin ---
export {
  IMAGE_BASE_URL,
  API_BASE_URL,
  TILE_SIZE,
  MAX_TILE_COUNT,
  deplacementVersCarte,
  charger_nouvelle_carte,
  charger_carte_initiale,
  est_bloquee,
  get_difficulty_carte,
  isBlocked
};
