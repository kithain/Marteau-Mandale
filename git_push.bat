@echo off
echo ==========================================
echo      Export vers GitHub - Marteau-Mandale
echo ==========================================
echo.

:: Vérifier si git est installé
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Git n'est pas installé ou n'est pas dans le PATH.
    pause
    exit /b
)

:: Vérifier si on est dans un repo git
if not exist .git (
    echo [ERREUR] Ce dossier n'est pas un dépôt Git initialisé.
    echo Veuillez lancer 'git init' et configurer votre remote.
    pause
    exit /b
)

:: Afficher l'état actuel
echo [INFO] Etat actuel des fichiers :
git status
echo.

:: Demander le message de commit
set /p commit_msg="Entrez votre message de commit (ex: Mise a jour talents): "

if "%commit_msg%"=="" (
    echo [ERREUR] Le message de commit ne peut pas être vide.
    pause
    exit /b
)

echo.
echo [1/3] Ajout des fichiers...
git add .

echo [2/3] Commit des changements...
git commit -m "%commit_msg%"

echo [3/3] Envoi vers GitHub...
git push

echo.
if %errorlevel% equ 0 (
    echo [SUCCES] Export termine avec succes !
) else (
    echo [ERREUR] Une erreur est survenue lors du push. Verifiez votre connexion ou vos identifiants.
)

pause
