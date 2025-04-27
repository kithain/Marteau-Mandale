import os
import re
import csv

# Dossier de base à scanner
base_path = r"D:\mon_projet_dungeon_crawler\Marteau-Mandale"

# Extensions valides
valid_extensions = [".js"]

# Base pour stocker tous les imports
imports_info = []

# Base pour stocker toutes les définitions de fonctions
function_definitions = {}

# Fonction utilitaire pour retrouver le vrai chemin d'import
def resolve_import_path(importing_file_path, import_statement_path):
    import_statement_path = import_statement_path.strip("'\"")
    module_path = os.path.normpath(os.path.join(os.path.dirname(importing_file_path), import_statement_path))
    if not module_path.endswith(".js"):
        module_path += ".js"
    return module_path

# Fonction pour vérifier si une fonction est définie dans un fichier
def function_exists_in_file(file_path, function_name):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            pattern = rf'(function|const|get|set)\s+{re.escape(function_name)}\s*\('
            if re.search(pattern, content):
                return True
    except Exception:
        pass
    return False

# 1. Construire un index de TOUTES les fonctions déclarées dans le projet
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".js"):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    # Ajouter les différentes façons de définir une fonction
                    for match in re.findall(r'function\s+(\w+)\s*\(', content):
                        function_definitions[match] = file_path
                    for match in re.findall(r'const\s+(\w+)\s*=\s*\(.*?\)\s*=>', content):
                        function_definitions[match] = file_path
                    for match in re.findall(r'get\s+(\w+)\s*\(', content):
                        function_definitions[match] = file_path
                    for match in re.findall(r'set\s+(\w+)\s*\(', content):
                        function_definitions[match] = file_path
            except Exception as e:
                print(f"Erreur lecture fichier {file_path}: {e}")

# 2. Lire les imports dans les fichiers
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".js"):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                    # Chercher tous les import { fonction } from '...'
                    matches = re.findall(r'import\s*\{([^}]+)\}\s*from\s*[\'"]([^\'"]+)[\'"]', content)
                    for imported_block, source_path in matches:
                        imported_functions = [func.strip() for func in imported_block.split(',')]
                        resolved_source_path = resolve_import_path(file_path, source_path)
                        for func in imported_functions:
                            # 1er test : fonction existe dans fichier cible
                            if os.path.exists(resolved_source_path) and function_exists_in_file(resolved_source_path, func):
                                exporting_real_path = resolved_source_path
                            # 2eme test : fonction existe ailleurs dans le projet
                            elif func in function_definitions:
                                exporting_real_path = function_definitions[func]
                            else:
                                exporting_real_path = "NON TROUVE"

                            imports_info.append({
                                "FunctionImported": func,
                                "ImportingFile": os.path.relpath(file_path, base_path),
                                "ExportingFile": os.path.relpath(resolved_source_path, base_path),
                                "ExportingPathReal": exporting_real_path if exporting_real_path != "NON TROUVE" else "NON TROUVE"
                            })
            except Exception as e:
                print(f"Erreur lecture fichier {file_path}: {e}")

# 3. Export CSV
output_csv = r"D:\mon_projet_dungeon_crawler\import_mapping_full.csv"
with open(output_csv, "w", newline='', encoding="utf-8") as csvfile:
    fieldnames = ["FunctionImported", "ImportingFile", "ExportingFile", "ExportingPathReal"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=";")
    writer.writeheader()
    for item in imports_info:
        writer.writerow(item)

print(f"✅ Analyse complète terminée : CSV créé dans {output_csv}")
