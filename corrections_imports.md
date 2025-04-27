# Corrections des imports

## Fichiers à modifier

1. `map_main_logic.js`:
   - Exporter `TILE_SIZE`, `MAP_WIDTH`, `MAP_HEIGHT`

2. `combat_manager_logic.js`:
   - Remplacer `getPlayerX/Y` par `get_player_x/y`
   - Remplacer `getPlayerPV/Def` par `get_player_pv/def`
   - Remplacer `infligerDegatsAuJoueur` par `infliger_degats_au_joueur`

3. `monstre_main_logic.js`:
   - Remplacer `estempoisonne` par `est_empoisonne`
   - Remplacer `supprimerMonstre` par `supprimer_monstre`

## Convention de nommage

Toutes les nouvelles fonctions doivent utiliser le snake_case.

## Vérifications

- Vérifier que tous les chemins d'import sont corrects
- Tester les fonctionnalités après modifications
