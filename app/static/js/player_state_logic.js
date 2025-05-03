// player_state_logic.js
// Gestion de l'état interne du joueur (PV, Mana, Position, Classe, Inventaire)

// --- Imports ---
import { movePlayer } from './camera_main_logic.js';

// --- Données initiales ---
const ETAT_INITIAL_JOUEUR = {
  niveau: 1,
  experience: 0,
  pv: 120,
  mana: 15,
  attaque: 3,
  defense: 2,
  classe: 'Paladin',
  position: { x: 1, y: 2 }, // Position en tiles correspondant à (95.84, 128.23) pixels
  carte: 'P7',
  inventaire: [],
  talents: [],
  pv_max: 120,
  mana_max: 15
};

let etat_joueur = { ...ETAT_INITIAL_JOUEUR };

// --- Getters ---
function get_pv_joueur() { return etat_joueur.pv; }
function get_mana_joueur() { return etat_joueur.mana; }
function get_position_joueur() { return { ...etat_joueur.position }; }
function get_classe_joueur() { return etat_joueur.classe; }
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

function set_position_joueur(x, y, validate = false) {
  if (validate && (x < 0 || y < 0)) {
    return false;
  }
  etat_joueur.position = { x, y };
  // On ne bouge le DOM que si le joueur existe déjà dans le DOM
  if (document.getElementById('player')) {
    movePlayer();
  }
  notifier_changement_stats();
  return true;
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

// --- Régénération automatique ---
function start_regen() {
  // Régénère 1 PV toutes les 2 secondes
  setInterval(() => {
    if (etat_joueur.pv < etat_joueur.pv_max) {
      set_pv_joueur(etat_joueur.pv + 1);
    }
    
    if (etat_joueur.mana < etat_joueur.mana_max) {
      set_mana_joueur(etat_joueur.mana + 1);
    }
  }, 2000);
}

// --- Initialisation complète ---
function initialiser_joueur(niveau) {
  etat_joueur = {
    ...ETAT_INITIAL_JOUEUR,
    niveau,
    pv: 100 + (niveau * 20),
    mana: 30 + (niveau * 5),
    pv_max: 100 + (niveau * 20),
    mana_max: 30 + (niveau * 5)
  };
  notifier_changement_stats();
}

// --- Gestion des événements ---
function notifier_changement_stats() {
  window.dispatchEvent(new Event('playerStatsChanged'));
}

// --- Sauvegarde et Chargement ---
function get_donnees_sauvegarde() {
  const { position, ...autresDonnees } = etat_joueur;
  return {
    ...autresDonnees,
    position: (position.x === 0 && position.y === 0) ? undefined : position
  };
}

function charger_donnees_sauvegarde(data) {
  const position = (data.position?.x === 0 && data.position?.y === 0) 
    ? null 
    : data.position;
    
  etat_joueur = {
    ...ETAT_INITIAL_JOUEUR,
    ...data,
    position: position || get_position_joueur()
  };
  notifier_changement_stats();
}

// --- Exports publics ---
export {
  get_pv_joueur,
  get_mana_joueur,
  get_position_joueur,
  get_classe_joueur,
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
  initialiser_joueur,
  get_donnees_sauvegarde,
  charger_donnees_sauvegarde,
  start_regen
};
