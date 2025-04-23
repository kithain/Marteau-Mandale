// camera.js
import { getPlayerX, getPlayerY } from './player.js';
import { tileSize } from './map.js';

export function movePlayer() {
  const player = document.getElementById('player');
  if (!player) return;

  // Positionnement du joueur
  const playerX = getPlayerX();
  const playerY = getPlayerY();
  player.style.left = `${playerX * tileSize}px`;
  player.style.top = `${playerY * tileSize}px`;

  // Ajustement de la caméra
  const mapInner = document.getElementById("map-inner");
  const mapContainer = document.getElementById("map-container");

  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const mapWidth = tileSize * 16;
  const mapHeight = tileSize * 16;

  let cameraX = playerX * tileSize - (containerWidth / 2 - tileSize / 2);
  let cameraY = playerY * tileSize - (containerHeight / 2 - tileSize / 2);

  cameraX = Math.max(0, Math.min(cameraX, mapWidth - containerWidth));
  cameraY = Math.max(0, Math.min(cameraY, mapHeight - containerHeight));

  mapInner.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
}

export function resizeMapContainer() {
  // Fonction à implémenter si nécessaire
} 