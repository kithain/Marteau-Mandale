// camera_main_logic.js
// Gestion du positionnement du joueur et de la caméra sur la carte
// Refactorisé pour plus de clarté et de maintenabilité

import { get_position_joueur } from './player_state_logic.js';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from './map_constants_logic.js';

// --- Constantes globales ---
const MAP_SIZE = 16; // nombre de tuiles par côté

// --- Fonctions utilitaires privées ---
function getPlayerElement() {
  return document.getElementById('player');
}

export function getMapInnerElement() {
  return document.getElementById('map-inner');
}

export function getMapContainerElement() {
  return document.getElementById('map-container');
}

// --- Déplacement du joueur et ajustement caméra ---
export function movePlayer(mapData = null) {
  const player = getPlayerElement();
  if (!player) return;

  // 1. Positionnement du joueur
  const { x: playerX, y: playerY } = get_position_joueur();
  player.style.left = `${playerX * TILE_SIZE}px`;
  player.style.top = `${playerY * TILE_SIZE}px`;

  // 2. Ajustement de la caméra
  const mapInner = getMapInnerElement();
  const mapContainer = getMapContainerElement();
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;

  // --- Centrage dynamique selon la taille réelle de la carte ---
  let mapWidthPx, mapHeightPx;
  if (mapData && mapData.width && mapData.height) {
    mapWidthPx = mapData.width * TILE_SIZE;
    mapHeightPx = mapData.height * TILE_SIZE;
  } else {
    mapWidthPx = MAP_WIDTH * TILE_SIZE;
    mapHeightPx = MAP_HEIGHT * TILE_SIZE;
  }

  let cameraX = playerX * TILE_SIZE - (containerWidth / 2 - TILE_SIZE / 2);
  let cameraY = playerY * TILE_SIZE - (containerHeight / 2 - TILE_SIZE / 2);

  cameraX = Math.max(0, Math.min(cameraX, mapWidthPx - containerWidth));
  cameraY = Math.max(0, Math.min(cameraY, mapHeightPx - containerHeight));

  mapInner.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
}

// --- Redimensionnement du conteneur de carte (placeholder) ---
export function resizeMapContainer() {
  // À compléter selon les besoins du projet
}