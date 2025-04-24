// player_talents.js
// Fonctions de gestion des talents extraites de player.js

// Récupère tous les talents disponibles (toutes classes)
export function getAllTalentsList() {
  if (window.talentsDisponibles) {
    // Fusionne tous les talents de toutes les classes
    return Object.values(window.talentsDisponibles).flat();
  }
  return [];
}

// Retourne les objets talents débloqués à partir d'une liste d'IDs
export function getTalentsFromIds(ids) {
  const allTalents = getAllTalentsList();
  return ids.map(id => allTalents.find(t => t.id === id)).filter(Boolean);
}

// Lecture dynamique des talents selon le niveau et la classe
export function getTalents() {
  const classe = window.PLAYER_CLASS;
  const niveau = (typeof window.PLAYER_LEVEL === 'number') ? window.PLAYER_LEVEL : 1;
  if (!classe || !window.talentsDisponibles || !window.talentsDisponibles[classe]) return [];
  // Retourne TOUS les talents débloqués selon le niveau du joueur
  return window.talentsDisponibles[classe].filter(t => (t.niveauRequis || 1) <= niveau);
}

// Dash furtif : dash de +3 cases dans une direction sans obstacle
export function dashStealth(direction) {
  // direction = {dx, dy} (ex: {dx: 1, dy: 0} pour droite)
  // On suppose que getPlayerX/getPlayerY sont importés ou accessibles ici
  import('./player.js').then(playerModule => {
    const getPlayerX = playerModule.getPlayerX;
    const getPlayerY = playerModule.getPlayerY;
    let currentX = getPlayerX();
    let currentY = getPlayerY();
    import('./map.js').then(module => {
      const { isBlocked, setPlayerPosition } = module;
      let newX = currentX;
      let newY = currentY;
      let steps = 0;
      for (let i = 1; i <= 3; i++) {
        const tryX = currentX + direction.dx * i;
        const tryY = currentY + direction.dy * i;
        if (!isBlocked(tryX, tryY)) {
          newX = tryX;
          newY = tryY;
          steps = i;
        } else {
          break;
        }
      }
      if (steps > 0) {
        setPlayerPosition(newX, newY);
        console.log(`Dash furtif de (${currentX}, ${currentY}) à (${newX}, ${newY}) en ${steps} case(s)`);
      } else {
        console.log("Dash furtif impossible : aucune case libre dans cette direction !");
      }
    });
  });
}
