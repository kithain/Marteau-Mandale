// player_state_logic.js
// Gestion de l'état interne du joueur (PV, Mana, Position, Classe, Inventaire)

// --- Données initiales ---
const ETAT_INITIAL_JOUEUR = {
  niveau: 1,
  experience: 0,
  pv: 120,
  mana: 15,
  attaque: 3,
  defense: 2,
  classe: 'Paladin',
  position: { x: 0, y: 0 },
  carte: 'A1',
  inventaire: [],
  talents: [],
  pv_max: 120,
  mana_max: 15
};

let etat_joueur = { ...ETAT_INITIAL_JOUEUR };

// --- Getters ---
function get_player_pv() { return etat_joueur.pv; }
function get_mana_joueur() { return etat_joueur.mana; }
function get_position_joueur() { return { ...etat_joueur.position }; }
function get_player_class() { return etat_joueur.classe; }
function get_inventaire_joueur() { return [...etat_joueur.inventaire]; }
function get_talents_joueur() { return [...etat_joueur.talents]; }
function get_niveau_joueur() { return etat_joueur.niveau; }
function get_experience_joueur() { return etat_joueur.experience; }
function get_carte_joueur() { return etat_joueur.carte; }

function get_pv_max_joueur() { return etat_joueur.pv_max; }
function get_mana_max_joueur() { return etat_joueur.mana_max; }

// --- Setters ---
function set_pv_joueur(valeur) {
  etat_joueur.pv = Math.max(0, Math.min(valeur, get_pv_max_joueur()));
  notifier_changement_stats();
}

function set_mana_joueur(valeur) {
  etat_joueur.mana = Math.max(0, Math.min(valeur, get_mana_max_joueur()));
  notifier_changement_stats();
}

function set_position_joueur(x, y) {
  etat_joueur.position = { x, y };
  notifier_changement_stats();
}

function set_niveau_joueur(niveau) {
  etat_joueur.niveau = niveau;
  notifier_changement_stats();
}

function set_experience_joueur(xp) {
  etat_joueur.experience = xp;
  notifier_changement_stats();
}

function set_inventaire_joueur(inventaire) {
  etat_joueur.inventaire = [...inventaire];
  notifier_changement_stats();
}

function set_talents_joueur(talents) {
  etat_joueur.talents = [...talents];
  notifier_changement_stats();
}

function set_carte_joueur(carte) {
  etat_joueur.carte = carte;
}

function set_classe_joueur(classe) {
  etat_joueur.classe = classe;
  notifier_changement_stats();
}

// --- Gestion des événements ---
function notifier_changement_stats() {
  window.dispatchEvent(new Event('playerStatsChanged'));
}

// --- Sauvegarde et Chargement ---
function obtenir_donnees_sauvegarde() {
  return { ...etat_joueur };
}

function charger_donnees_sauvegarde(data) {
  etat_joueur = { ...etat_joueur, ...data };
  notifier_changement_stats();
}

// --- Exports publics ---
export {
  get_player_pv,
  get_mana_joueur,
  get_position_joueur,
  get_player_class,
  get_inventaire_joueur,
  get_talents_joueur,
  get_niveau_joueur,
  get_experience_joueur,
  get_carte_joueur,
  get_pv_max_joueur,
  get_mana_max_joueur,
  set_pv_joueur,
  set_mana_joueur,
  set_position_joueur,
  set_niveau_joueur,
  set_experience_joueur,
  set_inventaire_joueur,
  set_talents_joueur,
  set_carte_joueur,
  set_classe_joueur,
  obtenir_donnees_sauvegarde,
  charger_donnees_sauvegarde
};
