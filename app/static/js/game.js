const playerClass = window.PLAYER_CLASS;
const talents = window.PLAYER_TALENTS;
let playerMana = 100;
const maxMana = 100;
let cooldowns = {};
let playerX = 0;
let playerY = 0;
let currentMap = "A1"; // par défaut
let exitZones = [];
const tileSize = 64;
const blockedTiles = new Set();


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
  document.getElementById("map-inner").style.transform = `translate(${-((playerX - 2) * tileSize)}px, ${-((playerY - 2) * tileSize)}px)`;
}

function createFloatingText(talent) {
  const text = document.createElement("div");
  text.textContent = talent.effectText || "Effet!";
  Object.assign(text.style, {
    position: "absolute",
    left: "50%",
    top: "-10px",
    transform: "translateX(-50%)",
    color: talent.color || "white",
    fontWeight: "bold",
    fontSize: "18px",
    textShadow: "0 0 5px black",
    animation: "floatUp 1s ease-out forwards"
  });
  return text;
}

function verifierRencontre() {
  fetch(`/api/rencontre?x=${playerX}&y=${playerY}&carte=map1`)
    .then(res => res.json())
    .then(data => {
      if (data.monstre) {
        const monstre = data.monstre;
        console.log("💥 Rencontre !", monstre.nom);

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

        // À toi d'ajouter la logique de combat ici...
      }
    });
}

function utiliserTalent(talent, index = null) {
  if (cooldowns[talent.name] || playerMana < talent.cost) return;

  playerMana -= talent.cost;
  updateManaBar();

  const player = document.getElementById("player");

  if (talent.opacity !== undefined) {
    const originalOpacity = player.style.opacity;
    player.style.opacity = talent.opacity;
    setTimeout(() => {
      player.style.opacity = originalOpacity || "1";
    }, talent.cooldown || 3000);
  }

  const originalFilter = player.style.filter;
  player.style.filter = `drop-shadow(0 0 6px ${talent.color || 'white'})`;
  player.style.transition = "filter 0.2s ease";
  setTimeout(() => {
    player.style.filter = originalFilter;
  }, 500);

  const floatingText = createFloatingText(talent);
  player.appendChild(floatingText);
  setTimeout(() => floatingText.remove(), 1000);

  if (index !== null) {
    const btn = document.getElementById(`talent-btn-${index}`);
    btn.disabled = true;
    btn.textContent = `⌛ ${talent.name}`;
    cooldowns[talent.name] = true;
    setTimeout(() => {
      cooldowns[talent.name] = false;
      btn.disabled = false;
      btn.textContent = `${index + 1}. ${talent.name}`;
    }, talent.cooldown || 3000);
  }
}

function handleKeydown(e) {
  const index = keyMap[e.key];
  if (index !== undefined && talents.talents[index]) {
    utiliserTalent(talents.talents[index], index);
  }

  let newX = playerX;
  let newY = playerY;
  if (e.key === 'ArrowUp') newY--;
  if (e.key === 'ArrowDown') newY++;
  if (e.key === 'ArrowLeft') newX--;
  if (e.key === 'ArrowRight') newX++;

  const isOut = newX < 0 || newY < 0 || newX >= 15 || newY >= 15;
  const isBlocked = blockedTiles.has(getBlockedKey(newX, newY));
  if (!isOut && !isBlocked) {
    playerX = newX;
    playerY = newY;
    movePlayer();
    verifierRencontre();
	detecterSortie();
  }
}

function chargerNouvelleCarte(nomMap, spawnX = null, spawnY = null) {
  currentMap = nomMap;
  fetch(`/static/maps/${nomMap}.tmj`)
    .then(res => res.json())
    .then(mapData => {
      const container = document.getElementById("map-inner");
      container.innerHTML = ''; // reset l'ancienne map

      const tileset = mapData.tilesets[0];
      const originalTileSize = mapData.tilewidth;
      const scale = 4;
      const displayTileSize = originalTileSize * scale;
      const width = mapData.width;
      const tiles = mapData.layers[0].data;

      const tilesetImage = new Image();
      tilesetImage.src = "/static/maps/Sprite-foret.png";

      tilesetImage.onload = () => {
        const cols = tileset.columns || (tilesetImage.width / originalTileSize);

        tiles.forEach((rawGid, index) => {
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

        // 🔁 Blocages
        blockedTiles.clear();
        const obstacleLayer = mapData.layers.find(l => l.name === "obstacles" && l.type === "tilelayer");
        if (obstacleLayer) {
          obstacleLayer.data.forEach((val, idx) => {
            if (val !== 0) {
              const x = idx % mapData.width;
              const y = Math.floor(idx / mapData.width);
              blockedTiles.add(getBlockedKey(x, y));
            }
          });
        }

        // 🔄 Sorties
        const sortieLayer = mapData.layers.find(l => l.name === "sorties" && l.type === "objectgroup");
        exitZones = sortieLayer ? sortieLayer.objects.map(o => ({
          x: Math.floor(o.x / mapData.tilewidth),
          y: Math.floor(o.y / mapData.tileheight),
          width: Math.floor(o.width / mapData.tilewidth),
          height: Math.floor(o.height / mapData.tileheight),
          destination: o.properties.find(p => p.name === "destination")?.value,
          spawnX: o.properties.find(p => p.name === "spawnX")?.value ?? 0,
          spawnY: o.properties.find(p => p.name === "spawnY")?.value ?? 0,
        })) : [];

        // 🔰 Point de départ
        if (spawnX === null || spawnY === null) {
          const spawn = mapData.layers.find(l => l.name === "player_start")?.objects?.[0];
          if (!spawn) {
            alert("Pas de point de départ !");
            return;
          }
          spawnX = Math.floor(spawn.x / mapData.tilewidth);
          spawnY = Math.floor(spawn.y / mapData.tileheight);
        }

        playerX = spawnX;
        playerY = spawnY;

        // 🧍 Affichage du joueur
        const player = document.createElement('div');
        player.id = 'player';
        player.style.width = player.style.height = `${displayTileSize}px`;
        player.style.position = 'absolute';
        player.style.backgroundImage = `url(/static/img/classes/${playerClass.toLowerCase()}.png)`;
        player.style.backgroundSize = 'contain';
        player.style.backgroundRepeat = 'no-repeat';
        player.style.zIndex = '10';
        container.appendChild(player);

        movePlayer();
      };
    });
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

// Appel initial
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', handleKeydown);
  updateManaBar();
  chargerNouvelleCarte(window.PLAYER_MAP || "P1");
  chargerNouvelleCarte("P7"); // <-- la map de départ
  initialiserTalents();
});


// === Sélection de classe (menu) ===
document.addEventListener('DOMContentLoaded', () => {
  const classSelector = document.getElementById('class-selector');
  if (classSelector) {
    const classes = ["Paladin", "Mage", "Voleur", "Barbare"];
    let currentIndex = 0;

    window.changeClass = function (direction) {
      currentIndex = (currentIndex + direction + classes.length) % classes.length;
      const currentClass = classes[currentIndex];
      document.getElementById('class-image').src = `/static/img/classes/${currentClass.toLowerCase()}.png`;
      document.getElementById('classe').value = currentClass;
    };
  }
});

function detecterSortie() {
  const sortie = exitZones.find(zone =>
    playerX >= zone.x &&
    playerX < zone.x + zone.width &&
    playerY >= zone.y &&
    playerY < zone.y + zone.height
  );

  if (sortie) {
    console.log(`🚪 Passage vers ${sortie.destination}`);
    chargerNouvelleCarte(sortie.destination, sortie.spawnX, sortie.spawnY);
  }
}