// camera.js
import * as modules from './modules.js';

export function movePlayer() {
  const player = document.getElementById('player');
  if (!player) return;

  // Positionnement du joueur
  const playerX = modules.getPlayerX();
  const playerY = modules.getPlayerY();
  player.style.left = `${playerX * modules.tileSize}px`;
  player.style.top = `${playerY * modules.tileSize}px`;

  // Ajustement de la caméra
  const mapInner = document.getElementById("map-inner");
  const mapContainer = document.getElementById("map-container");

  const containerWidth = mapContainer.clientWidth;
  const containerHeight = mapContainer.clientHeight;
  const mapWidth = modules.tileSize * 16;
  const mapHeight = modules.tileSize * 16;

  let cameraX = playerX * modules.tileSize - (containerWidth / 2 - modules.tileSize / 2);
  let cameraY = playerY * modules.tileSize - (containerHeight / 2 - modules.tileSize / 2);

  cameraX = Math.max(0, Math.min(cameraX, mapWidth - containerWidth));
  cameraY = Math.max(0, Math.min(cameraY, mapHeight - containerHeight));

  mapInner.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
}

export function resizeMapContainer() {
  // Fonction à implémenter si nécessaire
} 