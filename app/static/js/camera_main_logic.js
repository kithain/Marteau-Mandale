// camera_main_logic.js
// Gestion du positionnement du joueur et de la caméra sur la carte
// Refactorisé pour plus de clarté et de maintenabilité

import * as modules from './modules_main_logic.js';

// --- Constantes globales ---
const TILE_SIZE = 64; // Défini directement ici pour éviter la dépendance circulaire
const MAP_SIZE = 16; // nombre de tuiles par côté

// --- Fonctions utilitaires privées ---
function getPlayerElement() {
  return document.getElementById('player');
}

function getMapInnerElement() {
  return document.getElementById('map-inner');
}

function getMapContainerElement() {
  return document.getElementById('map-container');
}

// --- Déplacement du joueur et ajustement caméra ---
export function movePlayer() {
  const player = getPlayerElement();
  if (!player) return;

  // 1. Positionnement du joueur
  const playerX = modules.getPlayerX();
  const playerY = modules.getPlayerY();
  player.style.left = `${playerX * TILE_SIZE}px`;
  player.style.top = `${playerY * TILE_SIZE}px`;

  // 2. Ajustement de la caméra
  const mapInner = getMapInnerElement();
  const mapContainer = getMapContainerElement();
  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const mapWidth = TILE_SIZE * MAP_SIZE;
  const mapHeight = TILE_SIZE * MAP_SIZE;

  let cameraX = playerX * TILE_SIZE - (containerWidth / 2 - TILE_SIZE / 2);
  let cameraY = playerY * TILE_SIZE - (containerHeight / 2 - TILE_SIZE / 2);

  cameraX = Math.max(0, Math.min(cameraX, mapWidth - containerWidth));
  cameraY = Math.max(0, Math.min(cameraY, mapHeight - containerHeight));

  mapInner.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
}

// --- Redimensionnement du conteneur de carte (placeholder) ---
export function resizeMapContainer() {
  // À compléter selon les besoins du projet
}